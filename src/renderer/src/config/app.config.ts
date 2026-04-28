const LOCAL_BACKEND_ORIGIN = 'http://127.0.0.1:8000'

const isElectronRenderer = (): boolean => {
  if (typeof window === 'undefined') {
    return false
  }

  return Boolean(window.api || window.electron)
}

const getDefaultBackendOrigin = (): string => {
  if (typeof window === 'undefined') {
    return LOCAL_BACKEND_ORIGIN
  }

  // In Electron development, the renderer runs from the Vite dev server
  // (`http://localhost:<port>`), but the backend still lives on 127.0.0.1:8000.
  if (isElectronRenderer()) {
    return LOCAL_BACKEND_ORIGIN
  }

  const { protocol, origin } = window.location
  if (protocol === 'http:' || protocol === 'https:') {
    return origin
  }

  // The Electron-managed backend binds to 127.0.0.1 explicitly.
  // Using the same IPv4 loopback here avoids localhost/IPv6 resolution mismatches.
  return LOCAL_BACKEND_ORIGIN
}

const DEFAULT_BACKEND_ORIGIN = getDefaultBackendOrigin()

export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || `${DEFAULT_BACKEND_ORIGIN}/api/v1`,
  TIMEOUT: 5000,
  HEADERS: {
    'Content-Type': 'application/json'
  }
} as const

export const SOCKET_CONFIG = {
  URL: import.meta.env.VITE_SOCKET_URL || DEFAULT_BACKEND_ORIGIN,
  OPTIONS: {
    path: import.meta.env.VITE_SOCKET_PATH || '/ws/socket.io',
    transports: ['websocket'] as string[],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000
  }
} as const

export const SYSTEM_ACTIONS_CONFIG = {
  TOKEN: import.meta.env.VITE_SYSTEM_ACTIONS_TOKEN
} as const
