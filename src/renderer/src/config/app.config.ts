export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  TIMEOUT: 5000,
  HEADERS: {
    'Content-Type': 'application/json'
  }
} as const

export const SOCKET_CONFIG = {
  URL: import.meta.env.VITE_SOCKET_URL || 'http://localhost:8000',
  OPTIONS: {
    path: import.meta.env.VITE_SOCKET_PATH || '/ws/socket.io',
    transports: ['websocket'] as string[],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000
  }
} as const

export const SYSTEM_ACTIONS_CONFIG = {
  TOKEN: import.meta.env.VITE_SYSTEM_ACTIONS_TOKEN
} as const
