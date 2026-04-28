import { useSyncExternalStore } from 'react'

const WAGO_DISPLAY_NAME_OVERRIDES_STORAGE_KEY = 'wago_display_name_overrides'

type WagoDisplayNameOverrides = Record<string, string>

const listeners = new Set<() => void>()
let storageSyncBound = false
let wagoDisplayNameOverridesState: WagoDisplayNameOverrides = {}

const isBrowser = (): boolean => typeof window !== 'undefined'

const emitChange = () => {
  listeners.forEach((listener) => listener())
}

const normalizeWagoDisplayNameOverrides = (value: unknown): WagoDisplayNameOverrides => {
  if (!value || typeof value !== 'object') {
    return {}
  }

  return Object.entries(value as Record<string, unknown>).reduce<WagoDisplayNameOverrides>(
    (map, [key, entryValue]) => {
      if (typeof key !== 'string' || typeof entryValue !== 'string') {
        return map
      }

      const trimmed = entryValue.trim()
      if (!trimmed) {
        return map
      }

      map[key] = trimmed
      return map
    },
    {}
  )
}

const readStoredWagoDisplayNameOverrides = (): WagoDisplayNameOverrides => {
  if (!isBrowser()) return {}

  try {
    const raw = window.localStorage.getItem(WAGO_DISPLAY_NAME_OVERRIDES_STORAGE_KEY)
    if (!raw) {
      return {}
    }

    return normalizeWagoDisplayNameOverrides(JSON.parse(raw))
  } catch {
    return {}
  }
}

const persistWagoDisplayNameOverrides = (overrides: WagoDisplayNameOverrides): void => {
  if (!isBrowser()) return

  try {
    if (Object.keys(overrides).length === 0) {
      window.localStorage.removeItem(WAGO_DISPLAY_NAME_OVERRIDES_STORAGE_KEY)
      return
    }

    window.localStorage.setItem(
      WAGO_DISPLAY_NAME_OVERRIDES_STORAGE_KEY,
      JSON.stringify(overrides)
    )
  } catch {
    // Ignore storage failures and keep the in-memory overrides.
  }
}

const getWagoDisplayNameOverridesSnapshot = (): WagoDisplayNameOverrides => {
  const stored = readStoredWagoDisplayNameOverrides()
  const currentSerialized = JSON.stringify(wagoDisplayNameOverridesState)
  const storedSerialized = JSON.stringify(stored)

  if (currentSerialized !== storedSerialized) {
    wagoDisplayNameOverridesState = stored
  }

  return wagoDisplayNameOverridesState
}

const bindStorageSync = (): void => {
  if (!isBrowser() || storageSyncBound) return

  storageSyncBound = true
  wagoDisplayNameOverridesState = readStoredWagoDisplayNameOverrides()

  window.addEventListener('storage', (event) => {
    if (event.key !== WAGO_DISPLAY_NAME_OVERRIDES_STORAGE_KEY) return

    let next: WagoDisplayNameOverrides = {}

    try {
      next = normalizeWagoDisplayNameOverrides(event.newValue ? JSON.parse(event.newValue) : {})
    } catch {
      next = {}
    }

    const nextSerialized = JSON.stringify(next)
    const currentSerialized = JSON.stringify(wagoDisplayNameOverridesState)

    if (nextSerialized === currentSerialized) return

    wagoDisplayNameOverridesState = next
    emitChange()
  })
}

const setWagoDisplayNameOverridesState = (overrides: WagoDisplayNameOverrides): void => {
  bindStorageSync()

  const normalized = normalizeWagoDisplayNameOverrides(overrides)
  const nextSerialized = JSON.stringify(normalized)
  const currentSerialized = JSON.stringify(wagoDisplayNameOverridesState)

  if (nextSerialized === currentSerialized) {
    persistWagoDisplayNameOverrides(normalized)
    return
  }

  wagoDisplayNameOverridesState = normalized
  persistWagoDisplayNameOverrides(normalized)
  emitChange()
}

export const setWagoDisplayNameOverride = (id: string, value: string): void => {
  const trimmed = value.trim()
  const next = {
    ...getWagoDisplayNameOverridesSnapshot()
  }

  if (!trimmed) {
    delete next[id]
  } else {
    next[id] = trimmed
  }

  setWagoDisplayNameOverridesState(next)
}

export const clearWagoDisplayNameOverride = (id: string): void => {
  const next = {
    ...getWagoDisplayNameOverridesSnapshot()
  }

  if (!(id in next)) {
    return
  }

  delete next[id]
  setWagoDisplayNameOverridesState(next)
}

export const useWagoDisplayNameOverrides = (): WagoDisplayNameOverrides => {
  bindStorageSync()

  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    getWagoDisplayNameOverridesSnapshot,
    () => ({})
  )
}
