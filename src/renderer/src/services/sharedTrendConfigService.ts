import { assertAccessAllowsMutation, isViewOnlyAccessMode } from 'access/accessMode'
import { apiService } from './index'

export type SharedTrendConfigCustomRange = {
  start: string
  end: string
}

export type SharedTrendConfigYAxisScale = {
  mode: 'auto' | 'manual'
  min: string
  max: string
}

export type SharedTrendConfig = {
  selectedVarIds: string[]
  selectedManualIds: number[]
  timeRange: number
  rangeMode: 'relative' | 'absolute'
  customRange: SharedTrendConfigCustomRange | null
  yAxisScale: SharedTrendConfigYAxisScale
  seriesColorOverrides: Record<string, string>
  updatedAt: string | null
}

const OPERATOR_BASE = '/trend/shared-config'
const MONITOR_BASE = '/monitor/trend-config'

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const normalizeStringList = (value: unknown): string[] => {
  if (!Array.isArray(value)) return []
  const seen = new Set<string>()
  const normalized: string[] = []

  value.forEach((item) => {
    if (typeof item !== 'string') return
    const trimmed = item.trim()
    if (!trimmed || seen.has(trimmed)) return
    seen.add(trimmed)
    normalized.push(trimmed)
  })

  return normalized
}

const normalizeNumberList = (value: unknown): number[] => {
  if (!Array.isArray(value)) return []
  const seen = new Set<number>()
  const normalized: number[] = []

  value.forEach((item) => {
    const numeric = typeof item === 'number' ? item : Number(item)
    if (!Number.isFinite(numeric) || seen.has(numeric)) return
    seen.add(numeric)
    normalized.push(numeric)
  })

  return normalized
}

const normalizeCustomRange = (value: unknown): SharedTrendConfigCustomRange | null => {
  if (!isRecord(value)) return null

  const start = typeof value.start === 'string' ? value.start.trim() : ''
  const end = typeof value.end === 'string' ? value.end.trim() : ''
  if (!start || !end) return null

  return { start, end }
}

const normalizeYAxisScale = (value: unknown): SharedTrendConfigYAxisScale => {
  if (!isRecord(value)) {
    return { mode: 'auto', min: '', max: '' }
  }

  return {
    mode: value.mode === 'manual' ? 'manual' : 'auto',
    min: typeof value.min === 'string' ? value.min : typeof value.min === 'number' ? String(value.min) : '',
    max: typeof value.max === 'string' ? value.max : typeof value.max === 'number' ? String(value.max) : ''
  }
}

const normalizeSeriesColorOverrides = (value: unknown): Record<string, string> => {
  if (!isRecord(value)) return {}

  const normalized: Record<string, string> = {}
  Object.entries(value).forEach(([key, rawValue]) => {
    if (typeof rawValue !== 'string') return
    if (!key.trim() || !rawValue.trim()) return
    normalized[key] = rawValue
  })

  return normalized
}

const normalizeSharedTrendConfig = (value: unknown): SharedTrendConfig => {
  const raw = isRecord(value) ? value : {}
  return {
    selectedVarIds: normalizeStringList(raw.selectedVarIds),
    selectedManualIds: normalizeNumberList(raw.selectedManualIds),
    timeRange:
      typeof raw.timeRange === 'number' && Number.isFinite(raw.timeRange) && raw.timeRange > 0
        ? raw.timeRange
        : 60,
    rangeMode: raw.rangeMode === 'absolute' ? 'absolute' : 'relative',
    customRange: normalizeCustomRange(raw.customRange),
    yAxisScale: normalizeYAxisScale(raw.yAxisScale),
    seriesColorOverrides: normalizeSeriesColorOverrides(raw.seriesColorOverrides),
    updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : null
  }
}

export const fetchSharedTrendConfig = async (): Promise<SharedTrendConfig> => {
  const primaryBase = isViewOnlyAccessMode() ? MONITOR_BASE : OPERATOR_BASE
  const fallbackBase = primaryBase === MONITOR_BASE ? OPERATOR_BASE : MONITOR_BASE

  try {
    const response = await apiService.get<unknown>(primaryBase, undefined, { timeout: 30_000 })
    return normalizeSharedTrendConfig(response)
  } catch (error) {
    const status = (error as { response?: { status?: number } })?.response?.status
    if (status && status !== 404 && status !== 405) {
      throw error
    }

    const response = await apiService.get<unknown>(fallbackBase, undefined, { timeout: 30_000 })
    return normalizeSharedTrendConfig(response)
  }
}

export const saveSharedTrendConfig = async (
  config: Omit<SharedTrendConfig, 'updatedAt'>
): Promise<SharedTrendConfig> => {
  assertAccessAllowsMutation('Shared trend configuration')

  const response = await apiService.put<unknown>(OPERATOR_BASE, config, { timeout: 30_000 })
  return normalizeSharedTrendConfig(response)
}
