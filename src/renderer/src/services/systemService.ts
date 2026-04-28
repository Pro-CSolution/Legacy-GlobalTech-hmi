import { apiService } from './index'
import { assertAccessAllowsMutation } from 'access/accessMode'
import { SYSTEM_ACTIONS_CONFIG } from 'config/app.config'

const BASE = '/system'

const DEFAULT_SUPPORTED_TIME_ZONES = [
  {
    id: 'Eastern Standard Time',
    label: 'Eastern Time (ET)',
    ianaName: 'America/New_York'
  },
  {
    id: 'Central Standard Time',
    label: 'Central Time (CT)',
    ianaName: 'America/Chicago'
  },
  {
    id: 'Mountain Standard Time',
    label: 'Mountain Time (MT)',
    ianaName: 'America/Denver'
  },
  {
    id: 'Pacific Standard Time',
    label: 'Pacific Time (PT)',
    ianaName: 'America/Los_Angeles'
  }
] as const

export interface SupportedTimeZone {
  id: string
  label: string
  ianaName: string
}

export interface SystemTimeZoneConfig {
  currentTimeZoneId: string
  currentTimeZoneLabel: string
  currentTimeZoneIanaName: string | null
  currentTimeZoneSupported: boolean
  supportedTimeZones: SupportedTimeZone[]
}

export interface CommsRefreshResult {
  status: string
  running: boolean
  device_count: number
  devices: string[]
}

export const rebootSystem = async (): Promise<void> => {
  assertAccessAllowsMutation('System reboot')

  const token = SYSTEM_ACTIONS_CONFIG.TOKEN

  await apiService.post(`${BASE}/reboot`, undefined, {
    headers: token ? { 'X-System-Token': token } : undefined
  })
}

export const refreshComms = async (): Promise<CommsRefreshResult> => {
  assertAccessAllowsMutation('Refresh communications')

  const token = SYSTEM_ACTIONS_CONFIG.TOKEN

  return apiService.post<CommsRefreshResult>(`${BASE}/refresh-comms`, undefined, {
    headers: token ? { 'X-System-Token': token } : undefined
  })
}

const normalizeSupportedTimeZone = (value: unknown): SupportedTimeZone | null => {
  if (!value || typeof value !== 'object') return null

  const zone = value as Record<string, unknown>
  const id = typeof zone.id === 'string' ? zone.id.trim() : ''
  const label = typeof zone.label === 'string' ? zone.label.trim() : ''
  const ianaName = typeof zone.ianaName === 'string' ? zone.ianaName.trim() : ''

  if (!id || !label || !ianaName) {
    return null
  }

  return { id, label, ianaName }
}

export const normalizeSystemTimeZoneConfig = (value: unknown): SystemTimeZoneConfig => {
  const fallbackZones = DEFAULT_SUPPORTED_TIME_ZONES.map((zone) => ({ ...zone }))
  const config = value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
  const supportedTimeZones = Array.isArray(config.supportedTimeZones)
    ? config.supportedTimeZones
        .map(normalizeSupportedTimeZone)
        .filter((zone): zone is SupportedTimeZone => zone !== null)
    : []

  const resolvedSupportedTimeZones = supportedTimeZones.length > 0 ? supportedTimeZones : fallbackZones
  const currentTimeZoneId =
    typeof config.currentTimeZoneId === 'string'
      ? config.currentTimeZoneId
      : resolvedSupportedTimeZones[0]?.id ?? ''
  const matchedZone = resolvedSupportedTimeZones.find((zone) => zone.id === currentTimeZoneId) ?? null

  return {
    currentTimeZoneId,
    currentTimeZoneLabel:
      typeof config.currentTimeZoneLabel === 'string'
        ? config.currentTimeZoneLabel
        : matchedZone?.label ?? currentTimeZoneId,
    currentTimeZoneIanaName:
      typeof config.currentTimeZoneIanaName === 'string'
        ? config.currentTimeZoneIanaName
        : matchedZone?.ianaName ?? null,
    currentTimeZoneSupported:
      typeof config.currentTimeZoneSupported === 'boolean'
        ? config.currentTimeZoneSupported
        : matchedZone !== null,
    supportedTimeZones: resolvedSupportedTimeZones
  }
}

export const getSystemTimeZoneConfig = async (): Promise<SystemTimeZoneConfig> => {
  const response = await apiService.get<unknown>(`${BASE}/time-zone`)
  return normalizeSystemTimeZoneConfig(response)
}

export const updateSystemTimeZone = async (timeZoneId: string): Promise<SystemTimeZoneConfig> => {
  assertAccessAllowsMutation('Time zone updates')

  const token = SYSTEM_ACTIONS_CONFIG.TOKEN

  const response = await apiService.put(
    `${BASE}/time-zone`,
    { timeZoneId },
    {
      headers: token ? { 'X-System-Token': token } : undefined
    }
  )

  return normalizeSystemTimeZoneConfig(response)
}
