import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { existsSync } from 'fs'
import { spawn } from 'child_process'
import path from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

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

const openRustDesk = async (): Promise<void> => {
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
}

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1920,
    height: 1200,
    show: false,
    autoHideMenuBar: true,
    frame: false,
    fullscreen: true,
    resizable: false,
    maximizable: false,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    applyKioskWindowBehavior(mainWindow)
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))
  ipcMain.handle('system:open-rustdesk', async () => {
    await openRustDesk()
    return true
  })

  createWindow()

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
