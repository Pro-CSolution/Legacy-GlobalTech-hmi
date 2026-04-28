import { useMemo, useSyncExternalStore } from 'react'
import {
  getMotorDriveDeviceId,
  getMotorWagoDeviceId,
  resolvePreferredSingleMotorScope,
  type MotorScope
} from 'utils/motorDeviceMapping'
import { useDeviceData } from './useDeviceData'

const SINGLE_MOTOR_SCOPE_STORAGE_KEY = 'single_motor_scope_preference'

const listeners = new Set<() => void>()
let storageSyncBound = false
let preferredSingleMotorScopeState: MotorScope | null = null

const isBrowser = (): boolean => typeof window !== 'undefined'

const emitChange = () => {
  listeners.forEach((listener) => listener())
}

export const normalizePreferredSingleMotorScope = (value: unknown): MotorScope | null => {
  if (value === 1 || value === '1') return 1
  if (value === 2 || value === '2') return 2
  return null
}

const readStoredPreferredSingleMotorScope = (): MotorScope | null => {
  if (!isBrowser()) return null

  try {
    return normalizePreferredSingleMotorScope(
      window.localStorage.getItem(SINGLE_MOTOR_SCOPE_STORAGE_KEY)
    )
  } catch {
    return null
  }
}

const persistPreferredSingleMotorScope = (scope: MotorScope | null): void => {
  if (!isBrowser()) return

  try {
    if (scope === null) {
      window.localStorage.removeItem(SINGLE_MOTOR_SCOPE_STORAGE_KEY)
      return
    }

    window.localStorage.setItem(SINGLE_MOTOR_SCOPE_STORAGE_KEY, String(scope))
  } catch {
    // Ignore storage failures and keep the in-memory selection.
  }
}

const getPreferredSingleMotorScopeSnapshot = (): MotorScope | null => {
  const stored = readStoredPreferredSingleMotorScope()
  if (stored !== preferredSingleMotorScopeState) {
    preferredSingleMotorScopeState = stored
  }

  return preferredSingleMotorScopeState
}

const bindStorageSync = (): void => {
  if (!isBrowser() || storageSyncBound) return

  storageSyncBound = true
  preferredSingleMotorScopeState = readStoredPreferredSingleMotorScope()

  window.addEventListener('storage', (event) => {
    if (event.key !== SINGLE_MOTOR_SCOPE_STORAGE_KEY) return

    const next = normalizePreferredSingleMotorScope(event.newValue)
    if (next === preferredSingleMotorScopeState) return

    preferredSingleMotorScopeState = next
    emitChange()
  })
}

export const setPreferredSingleMotorScopePreference = (scope: MotorScope): void => {
  bindStorageSync()

  const normalized = normalizePreferredSingleMotorScope(scope)
  if (normalized === null) {
    return
  }

  if (normalized === preferredSingleMotorScopeState) {
    persistPreferredSingleMotorScope(normalized)
    return
  }

  preferredSingleMotorScopeState = normalized
  persistPreferredSingleMotorScope(normalized)
  emitChange()
}

export const getPreferredSingleMotorScopePreference = (): MotorScope | null => {
  bindStorageSync()
  return getPreferredSingleMotorScopeSnapshot()
}

export const usePreferredSingleMotorScopePreference = () => {
  bindStorageSync()

  const preferredSingleMotorScope = useSyncExternalStore(
    (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    getPreferredSingleMotorScopeSnapshot,
    () => null
  )

  return [preferredSingleMotorScope, setPreferredSingleMotorScopePreference] as const
}

export const usePreferredSingleMotorScope = (): MotorScope => {
  const motorOneDriveId = getMotorDriveDeviceId(1)
  const motorOneWagoId = getMotorWagoDeviceId(1)
  const motorTwoDriveId = getMotorDriveDeviceId(2)
  const motorTwoWagoId = getMotorWagoDeviceId(2)

  const { raw: motorOneDriveRaw } = useDeviceData(motorOneDriveId)
  const { raw: motorOneWagoRaw } = useDeviceData(motorOneWagoId)
  const { raw: motorTwoDriveRaw } = useDeviceData(motorTwoDriveId)
  const { raw: motorTwoWagoRaw } = useDeviceData(motorTwoWagoId)
  const [storedScope] = usePreferredSingleMotorScopePreference()

  return useMemo(
    () =>
      storedScope ??
      resolvePreferredSingleMotorScope({
        1: {
          driveConnected: Boolean(motorOneDriveRaw['__connected']),
          wagoConnected: Boolean(motorOneWagoRaw['__connected'])
        },
        2: {
          driveConnected: Boolean(motorTwoDriveRaw['__connected']),
          wagoConnected: Boolean(motorTwoWagoRaw['__connected'])
        }
      }),
    [motorOneDriveRaw, motorOneWagoRaw, motorTwoDriveRaw, motorTwoWagoRaw, storedScope]
  )
}
