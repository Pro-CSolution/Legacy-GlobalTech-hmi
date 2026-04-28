import { apiService, socketService, SOCKET_EVENTS } from './index'
import { isViewOnlyAccessMode } from 'access/accessMode'
import { ParameterId } from '../types'

export type TrendPoint = { time: string; value: number }
export type TrendHistoryMeta = {
  query_ms?: number
  fetch_ms?: number
  group_ms?: number
  reverse_ms?: number
  total_ms?: number
  rows?: number
  params?: number
  max_rows?: number
  limit_per_param?: number
  window_minutes?: number
}
export type TrendSeriesResponse = {
  device_id: string
  series: Record<string, TrendPoint[]>
  meta?: TrendHistoryMeta
}

export type FetchTrendHistoryParams = {
  deviceId: string
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

// Mantiene las subscripciones activas para re-hacerlas automáticamente en reconnect.
const trendSubscriptions = new Map<string, ParameterId[]>()
let trendReplayBound = false

const bindTrendReplay = (): void => {
  if (trendReplayBound) return
  trendReplayBound = true

  const replay = () => {
    for (const [deviceId, parameterIds] of trendSubscriptions.entries()) {
      if (!deviceId || !parameterIds.length) continue
      socketService.emit(SOCKET_EVENTS.SUBSCRIBE_TREND, {
        device_id: deviceId,
        parameter_ids: parameterIds
      })
    }
  }

  socketService.connect()
  socketService.on('connect', replay)

  // En HMR/StrictMode puede estar conectado antes de registrar el listener.
  if (socketService.isConnected()) {
    replay()
  }
}

export async function fetchTrendHistory({
  deviceId,
  parameterIds,
  windowMinutes = 5,
  startTime,
  endTime,
  limitPerParam = 2000
}: FetchTrendHistoryParams): Promise<TrendSeriesResponse> {
  // `/trend/history` puede ser pesado con ventanas grandes (p.ej. 3h) y múltiples parámetros.
  // Devolvemos un timeout específico para no chocar con el TIMEOUT global (5s).
  const requestTimeoutMs = 30_000
  const base = isViewOnlyAccessMode() ? '/monitor/trend/history' : '/trend/history'
  return apiService.get<TrendSeriesResponse>(
    base,
    {
      device_id: deviceId,
      parameter_ids: parameterIds,
      window_minutes: windowMinutes,
      start_time: startTime,
      end_time: endTime,
      limit_per_param: limitPerParam
    },
    { timeout: requestTimeoutMs }
  )
}

export function ensureTrendSocket() {
  if (!socketService.isConnected()) {
    socketService.connect()
  }
}

export function subscribeTrend(deviceId: string, parameterIds: ParameterId[]): void {
  if (!deviceId || !parameterIds.length) return

  const uniqueParameterIds = Array.from(new Set(parameterIds.filter(Boolean))) as ParameterId[]
  trendSubscriptions.set(deviceId, uniqueParameterIds)
  bindTrendReplay()

  ensureTrendSocket()
  if (socketService.isConnected()) {
    socketService.emit(SOCKET_EVENTS.SUBSCRIBE_TREND, {
      device_id: deviceId,
      parameter_ids: uniqueParameterIds
    })
  }
}

export function unsubscribeTrend(deviceId: string): void {
  if (!deviceId) return

  trendSubscriptions.delete(deviceId)

  // Si no estamos conectados, no hace falta (en el próximo connect ya no se re-suscribe).
  if (socketService.isConnected()) {
    socketService.emit(SOCKET_EVENTS.UNSUBSCRIBE_TREND, { device_id: deviceId })
  }
}

export function onTrendUpdate(callback: (payload: TrendUpdatePayload) => void): () => void {
  ensureTrendSocket()
  const handler = (payload: TrendUpdatePayload) => {
    callback(payload)
  }
  socketService.on(SOCKET_EVENTS.TREND_UPDATE, handler)
  return () => socketService.off(SOCKET_EVENTS.TREND_UPDATE, handler)
}
