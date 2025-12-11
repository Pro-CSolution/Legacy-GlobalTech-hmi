export const SOCKET_EVENTS = {
  DEVICE_UPDATE: 'device_update',
  TREND_UPDATE: 'trend_update',
  SUBSCRIBE_DEVICE: 'subscribe_device',
  SUBSCRIBE_TREND: 'subscribe_trend',
  UNSUBSCRIBE_TREND: 'unsubscribe_trend',
  SUBSCRIBE_PARAMETER: 'subscribe_parameter',
  UNSUBSCRIBE_PARAMETER: 'unsubscribe_parameter'
} as const

export type SocketEventKey = keyof typeof SOCKET_EVENTS
