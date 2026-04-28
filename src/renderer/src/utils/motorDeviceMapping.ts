import type { DeviceId } from 'types'

export type MotorScope = 1 | 2
export type MotorDeviceRole = 'drive' | 'wago'
export type MotorWagoLiveDeviceId = 'wago_live_motor1' | 'wago_live_motor2'
export type MotorConnectionState = {
  driveConnected: boolean
  wagoConnected: boolean
}

type MotorDeviceIds = {
  driveId: DeviceId
  wagoId: DeviceId
  liveWagoId: MotorWagoLiveDeviceId
}

export const MOTOR_SCOPE_LABELS: Record<MotorScope, string> = {
  1: 'Motor #1',
  2: 'Motor #2'
}

export const MOTOR_DEVICE_IDS: Record<MotorScope, MotorDeviceIds> = {
  1: {
    driveId: 'drive_avid',
    wagoId: 'wago',
    liveWagoId: 'wago_live_motor1'
  },
  2: {
    driveId: 'drive_avid_motor2',
    wagoId: 'wago_motor2',
    liveWagoId: 'wago_live_motor2'
  }
}

export const getMotorDeviceIds = (scope: MotorScope): MotorDeviceIds => MOTOR_DEVICE_IDS[scope]

export const getMotorDriveDeviceId = (scope: MotorScope): DeviceId =>
  MOTOR_DEVICE_IDS[scope].driveId

export const getMotorWagoDeviceId = (scope: MotorScope): DeviceId =>
  MOTOR_DEVICE_IDS[scope].wagoId

export const getMotorWagoLiveDeviceId = (scope: MotorScope): MotorWagoLiveDeviceId =>
  MOTOR_DEVICE_IDS[scope].liveWagoId

export const getMotorCoolingPlcDeviceId = (scope: MotorScope): MotorWagoLiveDeviceId =>
  MOTOR_DEVICE_IDS[scope].liveWagoId

export const getMotorScopeLabel = (scope: MotorScope): string => MOTOR_SCOPE_LABELS[scope]

export const getMotorScopeForDeviceId = (deviceId: string): MotorScope | null => {
  if (!deviceId) return null
  if (
    deviceId === MOTOR_DEVICE_IDS[1].driveId ||
    deviceId === MOTOR_DEVICE_IDS[1].wagoId ||
    deviceId === MOTOR_DEVICE_IDS[1].liveWagoId
  ) {
    return 1
  }
  if (
    deviceId === MOTOR_DEVICE_IDS[2].driveId ||
    deviceId === MOTOR_DEVICE_IDS[2].wagoId ||
    deviceId === MOTOR_DEVICE_IDS[2].liveWagoId
  ) {
    return 2
  }
  return null
}

export const getMotorDeviceRole = (deviceId: string): MotorDeviceRole | null => {
  if (!deviceId) return null
  if (
    deviceId === MOTOR_DEVICE_IDS[1].driveId ||
    deviceId === MOTOR_DEVICE_IDS[2].driveId
  ) {
    return 'drive'
  }
  if (
    deviceId === MOTOR_DEVICE_IDS[1].wagoId ||
    deviceId === MOTOR_DEVICE_IDS[2].wagoId ||
    deviceId === MOTOR_DEVICE_IDS[1].liveWagoId ||
    deviceId === MOTOR_DEVICE_IDS[2].liveWagoId
  ) {
    return 'wago'
  }
  return null
}

const getMotorConnectionScore = ({ driveConnected, wagoConnected }: MotorConnectionState): number =>
  (driveConnected ? 2 : 0) + (wagoConnected ? 1 : 0)

export const resolvePreferredSingleMotorScope = (
  states: Record<MotorScope, MotorConnectionState>
): MotorScope => {
  const motorOneScore = getMotorConnectionScore(states[1])
  const motorTwoScore = getMotorConnectionScore(states[2])

  return motorTwoScore > motorOneScore ? 2 : 1
}
