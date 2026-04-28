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
export * from './trendLiveGateway'
export * from './socketEvents'
export * from './driveService'
export * from './deviceConfigService'
export * from './faultCodesService'
export * from './manualTrendService'
export * from './reportHelper'
export * from './reportService'
export * from './sharedTrendConfigService'
export * from './systemService'
export * from './tripEventService'
export * from './wagoLiveService'
