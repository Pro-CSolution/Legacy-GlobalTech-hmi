import { useSyncExternalStore } from 'react'

export type TemperatureUnit = 'celsius' | 'fahrenheit'

const DEFAULT_TEMPERATURE_UNIT: TemperatureUnit = 'celsius'
const TEMPERATURE_UNIT_STORAGE_KEY = 'temperature_unit_preference'
const TEMP_UNIT_C = 'deg C'
const TEMP_UNIT_F = 'deg F'

const listeners = new Set<() => void>()
let storageSyncBound = false
let temperatureUnitState: TemperatureUnit = DEFAULT_TEMPERATURE_UNIT

const isBrowser = (): boolean => typeof window !== 'undefined'

const emitChange = () => {
  listeners.forEach((listener) => listener())
}

export const normalizeTemperatureUnit = (value: unknown): TemperatureUnit => {
  return value === 'fahrenheit' ? 'fahrenheit' : DEFAULT_TEMPERATURE_UNIT
}

const readStoredTemperatureUnit = (): TemperatureUnit => {
  if (!isBrowser()) return DEFAULT_TEMPERATURE_UNIT

  try {
    return normalizeTemperatureUnit(window.localStorage.getItem(TEMPERATURE_UNIT_STORAGE_KEY))
  } catch {
    return DEFAULT_TEMPERATURE_UNIT
  }
}

const persistTemperatureUnit = (unit: TemperatureUnit): void => {
  if (!isBrowser()) return

  try {
    window.localStorage.setItem(TEMPERATURE_UNIT_STORAGE_KEY, unit)
  } catch {
    // Ignore storage failures and keep in-memory state.
  }
}

const getTemperatureUnitSnapshot = (): TemperatureUnit => {
  const stored = readStoredTemperatureUnit()
  if (stored !== temperatureUnitState) {
    temperatureUnitState = stored
  }

  return temperatureUnitState
}

const bindStorageSync = (): void => {
  if (!isBrowser() || storageSyncBound) return

  storageSyncBound = true
  temperatureUnitState = readStoredTemperatureUnit()

  window.addEventListener('storage', (event) => {
    if (event.key !== TEMPERATURE_UNIT_STORAGE_KEY) return

    const next = normalizeTemperatureUnit(event.newValue)
    if (next === temperatureUnitState) return

    temperatureUnitState = next
    emitChange()
  })
}

export const setTemperatureUnitPreference = (unit: TemperatureUnit): void => {
  bindStorageSync()

  const normalized = normalizeTemperatureUnit(unit)
  if (normalized === temperatureUnitState) {
    persistTemperatureUnit(normalized)
    return
  }

  temperatureUnitState = normalized
  persistTemperatureUnit(normalized)
  emitChange()
}

export const getTemperatureUnitPreference = (): TemperatureUnit => {
  bindStorageSync()
  return getTemperatureUnitSnapshot()
}

export const getTemperatureUnitLabel = (unit: TemperatureUnit): string => {
  return unit === 'celsius' ? TEMP_UNIT_C : TEMP_UNIT_F
}

export const toDisplayTemperature = (
  value: number | null,
  unit: TemperatureUnit
): number | null => {
  if (value === null || Number.isNaN(value)) return null
  if (unit === 'celsius') return value
  return value * (9 / 5) + 32
}

export const toBaseCelsiusTemperature = (
  value: number | null,
  unit: TemperatureUnit
): number | null => {
  if (value === null || Number.isNaN(value)) return null
  if (unit === 'celsius') return value
  return ((value - 32) * 5) / 9
}

export const useTemperatureUnitPreference = () => {
  bindStorageSync()

  const temperatureUnit = useSyncExternalStore(
    (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    getTemperatureUnitSnapshot,
    () => DEFAULT_TEMPERATURE_UNIT
  )

  return [temperatureUnit, setTemperatureUnitPreference] as const
}
