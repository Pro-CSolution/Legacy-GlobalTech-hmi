import { apiService, socketService, SOCKET_EVENTS } from './index'
import { DeviceId, ParameterId } from '../types'

export type TrendPoint = { time: string; value: number }
export type TrendSeriesResponse = {
  device_id: string
  series: Record<string, TrendPoint[]>
}

export type FetchTrendHistoryParams = {
  deviceId: DeviceId
  parameterIds: ParameterId[]
  windowMinutes?: number
  startTime?: string
  endTime?: string
  limitPerParam?: number
}

export type TrendUpdatePayload = {
  device_id: string
  data: Record<string, number>
  ts?: string
}

export async function fetchTrendHistory({
  deviceId,
  parameterIds,
  windowMinutes = 5,
  startTime,
  endTime,
  limitPerParam = 2000
}: FetchTrendHistoryParams): Promise<TrendSeriesResponse> {
  return apiService.get<TrendSeriesResponse>('/trend/history', {
    device_id: deviceId,
    parameter_ids: parameterIds,
    window_minutes: windowMinutes,
    start_time: startTime,
    end_time: endTime,
    limit_per_param: limitPerParam
  })
}

export function ensureTrendSocket() {
  if (!socketService.isConnected()) {
    socketService.connect()
  }
}

export function subscribeTrend(deviceId: DeviceId, parameterIds: ParameterId[]): void {
  ensureTrendSocket()

  if (socketService.isConnected()) {
    socketService.emit(SOCKET_EVENTS.SUBSCRIBE_TREND, {
      device_id: deviceId,
      parameter_ids: parameterIds
    })
    return
  }

  const handleConnect = () => {
    socketService.off('connect', handleConnect)
    socketService.emit(SOCKET_EVENTS.SUBSCRIBE_TREND, {
      device_id: deviceId,
      parameter_ids: parameterIds
    })
  }
  socketService.on('connect', handleConnect)
}

export function unsubscribeTrend(deviceId: DeviceId): void {
  ensureTrendSocket()

  const emitUnsub = () =>
    socketService.emit(SOCKET_EVENTS.UNSUBSCRIBE_TREND, { device_id: deviceId })

  if (socketService.isConnected()) {
    emitUnsub()
    return
  }

  const handleConnect = () => {
    socketService.off('connect', handleConnect)
    emitUnsub()
  }
  socketService.on('connect', handleConnect)
}

export function onTrendUpdate(callback: (payload: TrendUpdatePayload) => void): () => void {
  ensureTrendSocket()
  const handler = (payload: TrendUpdatePayload) => {
    callback(payload)
  }
  socketService.on(SOCKET_EVENTS.TREND_UPDATE, handler)
  return () => socketService.off(SOCKET_EVENTS.TREND_UPDATE, handler)
}
