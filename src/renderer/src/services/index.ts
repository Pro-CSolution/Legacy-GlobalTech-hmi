import { ApiService } from './apiService'
import { SocketService } from './socketService'
import { API_CONFIG, SOCKET_CONFIG } from '../config/app.config'

// Create instances with configuration
export const apiService = new ApiService({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.HEADERS
})

export const socketService = new SocketService(SOCKET_CONFIG.URL, SOCKET_CONFIG.OPTIONS)

export * from './apiService'
export * from './socketService'
