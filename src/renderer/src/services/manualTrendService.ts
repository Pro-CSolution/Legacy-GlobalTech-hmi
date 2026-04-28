import { assertAccessAllowsMutation, isViewOnlyAccessMode } from 'access/accessMode'
import { apiService } from './index'

const BASE = '/manual-trend'
const MONITOR_BASE = '/monitor/manual-trend'

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

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const normalizeManualTrendSeries = (value: unknown): ManualTrendSeries | null => {
  if (!isRecord(value)) return null

  const id = Number(value.id)
  const name = typeof value.name === 'string' ? value.name : ''
  const color = typeof value.color === 'string' ? value.color : '#3b82f6'
  const createdAt = typeof value.created_at === 'string' ? value.created_at : ''
  const updatedAt = typeof value.updated_at === 'string' ? value.updated_at : ''
  const unit =
    typeof value.unit === 'string' || value.unit === null ? (value.unit ?? null) : undefined

  if (!Number.isFinite(id) || !name || !createdAt || !updatedAt) {
    return null
  }

  return {
    id,
    name,
    unit,
    color,
    created_at: createdAt,
    updated_at: updatedAt
  }
}

const normalizeManualTrendPoint = (value: unknown): ManualTrendPoint | null => {
  if (!isRecord(value)) return null

  const id = Number(value.id)
  const seriesId = Number(value.series_id)
  const time = typeof value.time === 'string' ? value.time : ''
  const createdAt = typeof value.created_at === 'string' ? value.created_at : ''
  const pointValue = Number(value.value)
  const note =
    typeof value.note === 'string' || value.note === null ? (value.note ?? null) : undefined
  const createdBy =
    typeof value.created_by === 'string' || value.created_by === null
      ? (value.created_by ?? null)
      : undefined

  if (!Number.isFinite(id) || !Number.isFinite(seriesId) || !time || !createdAt) {
    return null
  }

  return {
    id,
    series_id: seriesId,
    time,
    value: Number.isFinite(pointValue) ? pointValue : 0,
    note,
    created_by: createdBy,
    created_at: createdAt
  }
}

export async function fetchManualSeries(): Promise<ManualTrendSeries[]> {
  const base = isViewOnlyAccessMode() ? MONITOR_BASE : BASE
  const response = await apiService.get<unknown>(`${base}/series`)
  if (!Array.isArray(response)) {
    return []
  }

  return response
    .map(normalizeManualTrendSeries)
    .filter((series): series is ManualTrendSeries => series !== null)
}

export async function createManualSeries(payload: {
  name: string
  unit?: string
  color?: string
}): Promise<ManualTrendSeries> {
  assertAccessAllowsMutation('Manual trend series creation')
  return apiService.post('/manual-trend/series', payload)
}

export async function updateManualSeries(payload: {
  seriesId: number
  name?: string
  unit?: string
  color?: string
}): Promise<ManualTrendSeries> {
  assertAccessAllowsMutation('Manual trend series updates')
  const { seriesId, ...body } = payload
  return apiService.patch(`/manual-trend/series/${seriesId}`, body)
}

export async function deleteManualSeries(
  seriesId: number
): Promise<{ status: string; series_id: number }> {
  assertAccessAllowsMutation('Manual trend series deletion')
  return apiService.delete(`/manual-trend/series/${seriesId}`)
}

export async function fetchManualHistory(params: {
  seriesId: number
  startTime?: string
  endTime?: string
  windowMinutes?: number
  limit?: number
}): Promise<ManualTrendHistoryResponse> {
  const base = isViewOnlyAccessMode() ? MONITOR_BASE : BASE
  const { seriesId, ...rest } = params
  const response = await apiService.get<unknown>(
    `${base}/series/${seriesId}/history`,
    {
      start_time: rest.startTime,
      end_time: rest.endTime,
      window_minutes: rest.windowMinutes,
      limit: rest.limit
    },
    { timeout: 30_000 }
  )

  const rawPoints = isRecord(response) && Array.isArray(response.points) ? response.points : []

  return {
    series_id:
      isRecord(response) && Number.isFinite(Number(response.series_id))
        ? Number(response.series_id)
        : seriesId,
    points: rawPoints
      .map(normalizeManualTrendPoint)
      .filter((point): point is ManualTrendPoint => point !== null)
  }
}

export async function createManualPoint(payload: {
  seriesId: number
  value: number
  time?: string
  note?: string
  created_by?: string
}): Promise<ManualTrendPoint> {
  assertAccessAllowsMutation('Manual trend point creation')
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
  assertAccessAllowsMutation('Manual trend point updates')
  const { pointId, ...body } = payload
  return apiService.patch(`/manual-trend/points/${pointId}`, body)
}

export async function deleteManualPoint(
  pointId: number
): Promise<{ status: string; point_id: number }> {
  assertAccessAllowsMutation('Manual trend point deletion')
  return apiService.delete(`/manual-trend/points/${pointId}`)
}
