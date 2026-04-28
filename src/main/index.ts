import { app, shell, BrowserWindow, ipcMain, desktopCapturer, screen } from 'electron'
import { join } from 'path'
import { existsSync } from 'fs'
import { writeFile, mkdir, appendFile } from 'fs/promises'
import { spawn, type ChildProcess } from 'child_process'
import * as net from 'node:net'
import path from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

let mainWindowRef: BrowserWindow | null = null
let isAppQuitting = false
let managedBackendProcess: ChildProcess | null = null

const LOG_DIR_NAME = 'logs'
const LOG_FILE_NAME = 'electron-main.log'
const BACKEND_HOST = '127.0.0.1'
const BACKEND_PORT = 8000

type BackendLaunchSpec = {
  command: string
  args: string[]
  cwd: string
  description: string
}

const safeStringify = (value: unknown): string => {
  try {
    if (value instanceof Error) {
      return `${value.name}: ${value.message}\n${value.stack ?? ''}`.trim()
    }
    return typeof value === 'string' ? value : JSON.stringify(value)
  } catch {
    return String(value)
  }
}

const logMain = async (level: 'INFO' | 'WARN' | 'ERROR', message: string, extra?: unknown) => {
  const ts = new Date().toISOString()
  const line = `[${ts}] [${level}] ${message}${extra !== undefined ? ` | ${safeStringify(extra)}` : ''}\n`
  // Always log to console (available in dev / terminal)
  if (level === 'ERROR') console.error(line.trim())
  else if (level === 'WARN') console.warn(line.trim())
  else console.log(line.trim())

  // Persist to disk for production diagnostics
  try {
    const dir = join(app.getPath('userData'), LOG_DIR_NAME)
    if (!existsSync(dir)) await mkdir(dir, { recursive: true })
    const file = join(dir, LOG_FILE_NAME)
    await appendFile(file, line, { encoding: 'utf-8' })
  } catch {
    // ignore logging failures
  }
}

process.on('uncaughtException', (err) => {
  void logMain('ERROR', 'uncaughtException', err)
})

process.on('unhandledRejection', (reason) => {
  void logMain('ERROR', 'unhandledRejection', reason)
})

const getMainWindow = (): BrowserWindow | null => {
  if (mainWindowRef && !mainWindowRef.isDestroyed()) return mainWindowRef
  const win = BrowserWindow.getAllWindows().find((w) => !w.isDestroyed()) ?? null
  mainWindowRef = win
  return win
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const isTcpPortOpen = async (
  host: string,
  port: number,
  timeoutMs = 800
): Promise<boolean> => {
  return await new Promise((resolve) => {
    const socket = net.createConnection({ host, port })
    let settled = false

    const finish = (value: boolean) => {
      if (settled) return
      settled = true
      socket.destroy()
      resolve(value)
    }

    socket.setTimeout(timeoutMs)
    socket.once('connect', () => finish(true))
    socket.once('timeout', () => finish(false))
    socket.once('error', () => finish(false))
  })
}

const waitForTcpPort = async (
  host: string,
  port: number,
  timeoutMs: number
): Promise<boolean> => {
  const startedAt = Date.now()

  while (Date.now() - startedAt < timeoutMs) {
    if (await isTcpPortOpen(host, port)) {
      return true
    }

    await wait(400)
  }

  return false
}

const collectExistingPaths = (paths: Array<string | null | undefined>): string[] => {
  return Array.from(
    new Set(
      paths
        .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
        .map((value) => path.resolve(value))
        .filter((value) => existsSync(value))
    )
  )
}

const resolveBackendRoots = (): string[] => {
  const envRoot = (process.env['GLOBALTECH_BACKEND_ROOT'] || '').trim()
  const appPath = app.getAppPath()
  const exeDir = path.dirname(app.getPath('exe'))
  const cwd = process.cwd()

  return collectExistingPaths([
    envRoot || null,
    path.join(cwd, '..', 'Legacy-GlobalTech-Backend'),
    path.join(cwd, 'Legacy-GlobalTech-Backend'),
    path.join(appPath, '..', 'Legacy-GlobalTech-Backend'),
    path.join(appPath, '..', '..', 'Legacy-GlobalTech-Backend'),
    path.join(exeDir, 'Legacy-GlobalTech-Backend'),
    path.join(exeDir, '..', 'Legacy-GlobalTech-Backend')
  ])
}

const resolveBackendLaunchSpec = (): BackendLaunchSpec | null => {
  const envExe = (process.env['GLOBALTECH_BACKEND_EXE'] || '').trim()
  if (envExe && existsSync(envExe)) {
    return {
      command: envExe,
      args: [],
      cwd: path.dirname(envExe),
      description: 'GLOBALTECH_BACKEND_EXE'
    }
  }

  for (const root of resolveBackendRoots()) {
    const exePath = path.join(root, 'dist', 'GlobalTechBackend.exe')
    if (existsSync(exePath)) {
      return {
        command: exePath,
        args: [],
        cwd: root,
        description: 'packaged backend executable'
      }
    }

    const pythonExe = path.join(root, '.venv', 'Scripts', 'python.exe')
    const runPy = path.join(root, 'run.py')
    if (existsSync(pythonExe) && existsSync(runPy)) {
      return {
        command: pythonExe,
        args: [runPy],
        cwd: root,
        description: 'backend Python entrypoint'
      }
    }
  }

  return null
}

const wireBackendStreamLogging = (
  stream: NodeJS.ReadableStream | null,
  level: 'INFO' | 'WARN' | 'ERROR',
  source: string
): void => {
  if (!stream) return

  stream.on('data', (chunk) => {
    const text = String(chunk).trim()
    if (!text) return
    void logMain(level, source, text)
  })
}

const ensureManagedBackend = async (): Promise<void> => {
  if (await isTcpPortOpen(BACKEND_HOST, BACKEND_PORT)) {
    await logMain('INFO', 'Detected existing backend listener', {
      host: BACKEND_HOST,
      port: BACKEND_PORT
    })
    return
  }

  const spec = resolveBackendLaunchSpec()
  if (!spec) {
    await logMain('WARN', 'No backend launcher candidate found')
    return
  }

  await logMain('INFO', 'Starting managed backend', {
    description: spec.description,
    command: spec.command,
    args: spec.args,
    cwd: spec.cwd
  })

  const child = spawn(spec.command, spec.args, {
    cwd: spec.cwd,
    env: {
      ...process.env,
      HOST: BACKEND_HOST,
      PORT: String(BACKEND_PORT),
      RELOAD: '0',
      LOG_TO_CONSOLE: '1'
    },
    windowsHide: true,
    stdio: ['ignore', 'pipe', 'pipe']
  })

  managedBackendProcess = child

  wireBackendStreamLogging(child.stdout, 'INFO', 'backend.stdout')
  wireBackendStreamLogging(child.stderr, 'ERROR', 'backend.stderr')

  child.once('error', (error) => {
    void logMain('ERROR', 'Managed backend failed to start', error)
  })

  child.once('exit', (code, signal) => {
    void logMain('WARN', 'Managed backend exited', { code, signal })
    if (managedBackendProcess === child) {
      managedBackendProcess = null
    }
  })

  const ready = await waitForTcpPort(BACKEND_HOST, BACKEND_PORT, 15_000)
  if (!ready) {
    await logMain('ERROR', 'Managed backend did not become ready in time', {
      host: BACKEND_HOST,
      port: BACKEND_PORT
    })
    return
  }

  await logMain('INFO', 'Managed backend is ready', { host: BACKEND_HOST, port: BACKEND_PORT })
}

const stopManagedBackend = (): void => {
  const child = managedBackendProcess
  managedBackendProcess = null

  if (!child?.pid) return

  void logMain('INFO', 'Stopping managed backend', { pid: child.pid })

  try {
    if (process.platform === 'win32') {
      spawn('taskkill', ['/PID', String(child.pid), '/T', '/F'], {
        windowsHide: true,
        stdio: 'ignore'
      })
      return
    }

    child.kill('SIGTERM')
  } catch (error) {
    void logMain('ERROR', 'Failed to stop managed backend', error)
  }
}

/**
 * Modo kiosko:
 * - Pantalla completa + sin marco (sin ventana de Windows)
 * - Menú removido (no aparece con ALT)
 *
 * Por defecto está habilitado tanto en DEV como en PRODUCCIÓN.
 * Podés deshabilitarlo para debug con:
 * - env ELECTRON_KIOSK=0
 * - arg --no-kiosk
 */
const isKioskEnabled = (): boolean => {
  if (process.argv.includes('--no-kiosk')) return false
  const env = (process.env['ELECTRON_KIOSK'] || '').trim()
  if (!env) return true
  return env !== '0' && env.toLowerCase() !== 'false'
}

const applyKioskWindowBehavior = (win: BrowserWindow): void => {
  // Quitar menú de verdad (no solo auto-hide)
  win.setMenuBarVisibility(false)
  if (process.platform === 'win32' || process.platform === 'linux') {
    win.removeMenu()
  }

  // Asegurar fullscreen siempre
  win.setFullScreen(true)

  // Kiosko "duro" (bloquea salida por ESC, etc.)
  if (isKioskEnabled()) {
    win.setKiosk(true)
    // En Windows, algunos setups pueden dejar la ventana "siempre arriba".
    // Esto rompe flujos como abrir RustDesk; lo neutralizamos.
    win.setAlwaysOnTop(false)
  } else {
    win.setKiosk(false)
  }
}

const findRustDeskExe = (): string | null => {
  if (process.platform !== 'win32') return null

  const envPath = (process.env['RUSTDESK_PATH'] || '').trim()
  if (envPath && existsSync(envPath)) return envPath

  const candidates: string[] = []

  const programFiles = process.env['ProgramFiles']
  const programFilesX86 = process.env['ProgramFiles(x86)']
  const localAppData = process.env['LOCALAPPDATA']

  if (programFiles) candidates.push(path.join(programFiles, 'RustDesk', 'rustdesk.exe'))
  if (programFilesX86) candidates.push(path.join(programFilesX86, 'RustDesk', 'rustdesk.exe'))
  if (localAppData) {
    candidates.push(path.join(localAppData, 'Programs', 'RustDesk', 'rustdesk.exe'))
    candidates.push(path.join(localAppData, 'RustDesk', 'rustdesk.exe'))
  }

  // Si lo incluís junto a tu app (portable/bundle), intentamos relativo al exe
  try {
    const exeDir = path.dirname(app.getPath('exe'))
    candidates.push(path.join(exeDir, 'RustDesk', 'rustdesk.exe'))
    candidates.push(path.join(exeDir, 'rustdesk.exe'))
  } catch {
    // ignore
  }

  for (const p of candidates) {
    if (existsSync(p)) return p
  }
  return null
}

const openRustDesk = async (): Promise<ChildProcess> => {
  if (process.platform !== 'win32') {
    throw new Error('RustDesk launcher: solo soportado en Windows.')
  }

  const exe = findRustDeskExe()
  if (!exe) {
    throw new Error(
      'No se encontró RustDesk. Verificá que esté instalado o configura RUSTDESK_PATH con la ruta al rustdesk.exe.'
    )
  }

  // Abrir RustDesk como proceso separado (no bloquea Electron)
  const child = spawn(exe, [], {
    detached: true,
    stdio: 'ignore',
    windowsHide: false
  })
  child.unref()

  return child
}

function createWindow(): void {
  // En desarrollo: ventana normal (movible, redimensionable, con frame)
  // En producción: comportamiento según modo kiosko
  const isDevelopment = is.dev
  const shouldUseKiosk = !isDevelopment && isKioskEnabled()
  const targetDisplay = screen.getPrimaryDisplay()
  const displayBounds = shouldUseKiosk ? targetDisplay.bounds : targetDisplay.workArea
  const targetWidth = shouldUseKiosk ? displayBounds.width : Math.min(1920, displayBounds.width)
  const targetHeight = shouldUseKiosk ? displayBounds.height : Math.min(1080, displayBounds.height)

  // Create the browser window.
  const win = new BrowserWindow({
    x: displayBounds.x,
    y: displayBounds.y,
    width: targetWidth,
    height: targetHeight,
    show: false,
    autoHideMenuBar: true,
    center: !shouldUseKiosk,
    useContentSize: true,
    // En desarrollo: ventana con frame para poder moverla
    // En producción: sin frame si está en modo kiosko
    frame: isDevelopment || !shouldUseKiosk,
    // En desarrollo: no fullscreen por defecto
    // En producción: fullscreen si está en modo kiosko
    fullscreen: !isDevelopment && shouldUseKiosk,
    // En desarrollo: permitir redimensionar y maximizar
    resizable: isDevelopment || !shouldUseKiosk,
    maximizable: isDevelopment || !shouldUseKiosk,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })
  mainWindowRef = win

  // Renderer crash / hang diagnostics
  win.webContents.on('render-process-gone', (_event, details) => {
    void logMain('ERROR', 'render-process-gone', details)
  })

  win.webContents.on('unresponsive', () => {
    void logMain('WARN', 'renderer-unresponsive')
  })

  win.webContents.on('responsive', () => {
    void logMain('INFO', 'renderer-responsive')
  })

  win.webContents.on(
    'did-fail-load',
    (_event, errorCode, errorDescription, validatedURL, isMainFrame) => {
      void logMain('ERROR', 'did-fail-load', {
        errorCode,
        errorDescription,
        validatedURL,
        isMainFrame
      })
    }
  )

  // Covers GPU crashes (and others) in a typed-safe way
  app.on('child-process-gone', (_event, details) => {
    if (details.type === 'GPU') {
      void logMain('ERROR', 'gpu-process-gone', details)
    }
  })

  // En kiosko no permitimos cerrar la ventana (Alt+F4, etc.) excepto cuando la app está saliendo.
  win.on('close', (event) => {
    if (shouldUseKiosk && !isAppQuitting) {
      event.preventDefault()
    }
  })

  win.on('closed', () => {
    if (mainWindowRef === win) mainWindowRef = null
  })

  // Soporte para F11 para toggle fullscreen (solo en desarrollo o cuando no está en kiosko)
  if (isDevelopment || !shouldUseKiosk) {
    win.webContents.on('before-input-event', (event, input) => {
      if (input.key === 'F11') {
        event.preventDefault()
        win.setFullScreen(!win.isFullScreen())
      }
    })
  }

  win.on('ready-to-show', () => {
    // Solo aplicar comportamiento de kiosko si no estamos en desarrollo y está habilitado
    if (!isDevelopment && shouldUseKiosk) {
      win.setBounds(displayBounds)
      applyKioskWindowBehavior(win)
    } else {
      // En desarrollo: solo ocultar menú pero mantener ventana normal
      win.setMenuBarVisibility(false)
      if (displayBounds.width < 1920 || displayBounds.height < 1080) {
        win.maximize()
      }
    }
    win.show()
  })

  win.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  app.on('before-quit', () => {
    isAppQuitting = true
    stopManagedBackend()
  })

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))
  ipcMain.on('system:renderer-log', (_event, payload: unknown) => {
    const p = payload as { level?: unknown; message?: unknown; meta?: unknown }
    const levelRaw = typeof p?.level === 'string' ? p.level : 'INFO'
    const level =
      levelRaw === 'ERROR' || levelRaw === 'WARN' || levelRaw === 'INFO' ? levelRaw : 'INFO'
    const message = typeof p?.message === 'string' ? p.message : 'renderer-log'
    void logMain(level, `renderer: ${message}`, p?.meta)
  })
  ipcMain.handle('system:open-rustdesk', async () => {
    const win = getMainWindow()
    const restoreAfterClose = Boolean(win && isKioskEnabled())

    if (win && isKioskEnabled()) {
      // Kiosko real en Windows puede comportarse como "always on top" y tapar RustDesk.
      // Para soporte remoto lo desactivamos temporalmente; se restaura al cerrar RustDesk.
      win.setAlwaysOnTop(false)
      try {
        win.setKiosk(false)
      } catch {
        // ignore
      }
    }

    try {
      const child = await openRustDesk()

      const restore = () => {
        if (!restoreAfterClose) return
        if (!win || win.isDestroyed()) return
        applyKioskWindowBehavior(win)
      }

      child.once('exit', restore)
      child.once('error', restore)
      return true
    } catch (err) {
      if (restoreAfterClose && win && !win.isDestroyed()) {
        applyKioskWindowBehavior(win)
      }
      throw err
    }
  })

  ipcMain.handle('system:get-screen-source-id', async () => {
    const win = getMainWindow()
    if (win) {
      return win.getMediaSourceId()
    }
    const sources = await desktopCapturer.getSources({ types: ['screen'] })
    return sources[0]?.id
  })

  ipcMain.handle('system:save-video', async (_, buffer: ArrayBuffer) => {
    try {
      const videosPath = app.getPath('videos')
      const targetDir = join(videosPath, 'GlobalTech_Recordings')
      if (!existsSync(targetDir)) {
        await mkdir(targetDir, { recursive: true })
      }
      // Format: YYYY-MM-DD_HH-mm-ss
      const now = new Date()
      const timestamp = now.toISOString().replace(/T/, '_').replace(/\..+/, '').replace(/:/g, '-')
      const filename = `GlobalTech_${timestamp}.webm`
      const filePath = join(targetDir, filename)

      await writeFile(filePath, Buffer.from(buffer))
      return filePath
    } catch (error) {
      console.error('Failed to save video:', error)
      throw error
    }
  })

  void ensureManagedBackend().finally(() => {
    createWindow()
  })

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
