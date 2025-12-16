import { socketService, SOCKET_EVENTS } from './index'

const ensureSocket = (): void => {
  if (!socketService.isConnected()) {
    socketService.connect()
  }
}

export const subscribeParameters = (deviceId: string, parameterIds: string[]): void => {
  if (!deviceId || !parameterIds.length) return
  ensureSocket()
  socketService.emit(SOCKET_EVENTS.SUBSCRIBE_PARAMETER, {
    device_id: deviceId,
    parameter_ids: parameterIds
  })
}

export const unsubscribeParameters = (deviceId: string, parameterIds: string[]): void => {
  if (!deviceId || !parameterIds.length) return
  ensureSocket()
  socketService.emit(SOCKET_EVENTS.UNSUBSCRIBE_PARAMETER, {
    device_id: deviceId,
    parameter_ids: parameterIds
  })
}












