import { useSyncExternalStore } from 'react'

export type MotorControlMode = 'single' | 'dual'

const DEFAULT_MOTOR_CONTROL_MODE: MotorControlMode = 'single'
const MOTOR_CONTROL_MODE_STORAGE_KEY = 'motor_control_mode_preference'

const listeners = new Set<() => void>()
let storageSyncBound = false
let motorControlModeState: MotorControlMode = DEFAULT_MOTOR_CONTROL_MODE

const isBrowser = (): boolean => typeof window !== 'undefined'

const emitChange = () => {
  listeners.forEach((listener) => listener())
}

export const normalizeMotorControlMode = (value: unknown): MotorControlMode => {
  return value === 'dual' ? 'dual' : DEFAULT_MOTOR_CONTROL_MODE
}

const readStoredMotorControlMode = (): MotorControlMode => {
  if (!isBrowser()) return DEFAULT_MOTOR_CONTROL_MODE

  try {
    return normalizeMotorControlMode(window.localStorage.getItem(MOTOR_CONTROL_MODE_STORAGE_KEY))
  } catch {
    return DEFAULT_MOTOR_CONTROL_MODE
  }
}

const persistMotorControlMode = (mode: MotorControlMode): void => {
  if (!isBrowser()) return

  try {
    window.localStorage.setItem(MOTOR_CONTROL_MODE_STORAGE_KEY, mode)
  } catch {
    // Ignore storage failures and keep the in-memory selection.
  }
}

const getMotorControlModeSnapshot = (): MotorControlMode => {
  const stored = readStoredMotorControlMode()
  if (stored !== motorControlModeState) {
    motorControlModeState = stored
  }

  return motorControlModeState
}

const bindStorageSync = (): void => {
  if (!isBrowser() || storageSyncBound) return

  storageSyncBound = true
  motorControlModeState = readStoredMotorControlMode()

  window.addEventListener('storage', (event) => {
    if (event.key !== MOTOR_CONTROL_MODE_STORAGE_KEY) return

    const next = normalizeMotorControlMode(event.newValue)
    if (next === motorControlModeState) return

    motorControlModeState = next
    emitChange()
  })
}

export const setMotorControlModePreference = (mode: MotorControlMode): void => {
  bindStorageSync()

  const normalized = normalizeMotorControlMode(mode)
  if (normalized === motorControlModeState) {
    persistMotorControlMode(normalized)
    return
  }

  motorControlModeState = normalized
  persistMotorControlMode(normalized)
  emitChange()
}

export const getMotorControlModePreference = (): MotorControlMode => {
  bindStorageSync()
  return getMotorControlModeSnapshot()
}

export const getMotorControlModeLabel = (mode: MotorControlMode): string => {
  return mode === 'dual' ? '2 Motors' : '1 Motor'
}

export const useMotorControlModePreference = () => {
  bindStorageSync()

  const motorControlMode = useSyncExternalStore(
    (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    getMotorControlModeSnapshot,
    () => DEFAULT_MOTOR_CONTROL_MODE
  )

  return [motorControlMode, setMotorControlModePreference] as const
}
