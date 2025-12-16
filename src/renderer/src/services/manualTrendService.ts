import { apiService } from './index'

export type ManualTrendSeries = {
  id: number
  name: string
  unit?: string | null
  color: string
  created_at: string
  updated_at: string
}

export type ManualTrendPoint = {
  id: number
  series_id: number
  time: string
  value: number
  note?: string | null
  created_by?: string | null
  created_at: string
}

export type ManualTrendHistoryResponse = {
  series_id: number
  points: ManualTrendPoint[]
}

export async function fetchManualSeries(): Promise<ManualTrendSeries[]> {
  return apiService.get('/manual-trend/series')
}

export async function createManualSeries(payload: {
  name: string
  unit?: string
  color?: string
}): Promise<ManualTrendSeries> {
  return apiService.post('/manual-trend/series', payload)
}

export async function updateManualSeries(payload: {
  seriesId: number
  name?: string
  unit?: string
  color?: string
}): Promise<ManualTrendSeries> {
  const { seriesId, ...body } = payload
  return apiService.patch(`/manual-trend/series/${seriesId}`, body)
}

export async function deleteManualSeries(
  seriesId: number
): Promise<{ status: string; series_id: number }> {
  return apiService.delete(`/manual-trend/series/${seriesId}`)
}

export async function fetchManualHistory(params: {
  seriesId: number
  startTime?: string
  endTime?: string
  windowMinutes?: number
  limit?: number
}): Promise<ManualTrendHistoryResponse> {
  const { seriesId, ...rest } = params
  return apiService.get(`/manual-trend/series/${seriesId}/history`, {
    start_time: rest.startTime,
    end_time: rest.endTime,
    window_minutes: rest.windowMinutes,
    limit: rest.limit
  })
}

export async function createManualPoint(payload: {
  seriesId: number
  value: number
  time?: string
  note?: string
  created_by?: string
}): Promise<ManualTrendPoint> {
  const { seriesId, ...body } = payload
  return apiService.post(`/manual-trend/series/${seriesId}/points`, body)
}

export async function updateManualPoint(payload: {
  pointId: number
  value?: number
  time?: string
  note?: string
  created_by?: string
}): Promise<ManualTrendPoint> {
  const { pointId, ...body } = payload
  return apiService.patch(`/manual-trend/points/${pointId}`, body)
}

export async function deleteManualPoint(
  pointId: number
): Promise<{ status: string; point_id: number }> {
  return apiService.delete(`/manual-trend/points/${pointId}`)
}
