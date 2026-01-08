import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      openRustDesk: () => Promise<boolean>
      getScreenSourceId: () => Promise<string>
      saveVideo: (buffer: ArrayBuffer) => Promise<string>
      log: (level: 'INFO' | 'WARN' | 'ERROR', message: string, meta?: unknown) => void
    }
  }
}
