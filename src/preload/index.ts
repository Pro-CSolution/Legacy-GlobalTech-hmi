import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  openRustDesk: () => ipcRenderer.invoke('system:open-rustdesk') as Promise<boolean>,
  getScreenSourceId: () => ipcRenderer.invoke('system:get-screen-source-id') as Promise<string>,
  saveVideo: (buffer: ArrayBuffer) =>
    ipcRenderer.invoke('system:save-video', buffer) as Promise<string>,
  log: (level: 'INFO' | 'WARN' | 'ERROR', message: string, meta?: unknown) => {
    ipcRenderer.send('system:renderer-log', { level, message, meta })
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
