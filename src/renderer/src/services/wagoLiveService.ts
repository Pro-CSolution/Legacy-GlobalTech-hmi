import { assertAccessAllowsMutation, isViewOnlyAccessMode } from 'access/accessMode'
import { apiService } from './index'

export type WagoLiveSnapshotValue = {
  address: number
  modbus_register: number
  value: number | null
}

export type WagoLiveSnapshotResponse = {
  device_id: string
  register_type: string
  connected: boolean
  fetched_at: string
  values: WagoLiveSnapshotValue[]
}

export type WagoLiveWriteCoilResponse = {
  device_id: string
  address: number
  modbus_register: number
  connected: boolean
  requested_value: number
  active_readback_value: number | null
  readback_value: number | null
  pulse_ms: number | null
  method: string | null
  fetched_at: string
}

export type WagoLiveWriteRegisterResponse = {
  device_id: string
  address: number
  modbus_register: number
  connected: boolean
  requested_value: number
  readback_value: number | null
  fetched_at: string
}

export type WagoLiveRegisterType = 'holding' | 'input' | 'discrete' | 'coil'

type FetchWagoLiveSnapshotParams = {
  deviceId?: string
  registerType?: WagoLiveRegisterType
  addresses: number[]
}

type WriteWagoLiveCoilParams = {
  deviceId?: string
  address: number
  value: number | boolean
  pulseMs?: number
}

type WriteWagoLiveRegisterParams = {
  deviceId?: string
  address: number
  value: number
}

export const fetchWagoLiveSnapshot = ({
  deviceId = 'wago',
  registerType = 'input',
  addresses
}: FetchWagoLiveSnapshotParams): Promise<WagoLiveSnapshotResponse> =>
  apiService.get<
    WagoLiveSnapshotResponse,
    { device_id: string; register_type: WagoLiveRegisterType; address: number[] }
  >(
    isViewOnlyAccessMode() ? '/monitor/wago-live/snapshot' : '/wago-live/snapshot',
    {
      device_id: deviceId,
      register_type: registerType,
      address: addresses
    }
  )

export const writeWagoLiveCoil = ({
  deviceId = 'wago',
  address,
  value,
  pulseMs
}: WriteWagoLiveCoilParams): Promise<WagoLiveWriteCoilResponse> => {
  assertAccessAllowsMutation('WAGO coil writes')

  return apiService.post<
    WagoLiveWriteCoilResponse,
    { device_id: string; address: number; value: number | boolean; pulse_ms?: number }
  >('/wago-live/write-coil', {
    device_id: deviceId,
    address,
    value,
    ...(pulseMs !== undefined ? { pulse_ms: pulseMs } : {})
  })
}

export const writeWagoLiveRegister = ({
  deviceId = 'wago',
  address,
  value
}: WriteWagoLiveRegisterParams): Promise<WagoLiveWriteRegisterResponse> => {
  assertAccessAllowsMutation('WAGO register writes')

  return apiService.post<
    WagoLiveWriteRegisterResponse,
    { device_id: string; address: number; value: number }
  >('/wago-live/write-register', {
    device_id: deviceId,
    address,
    value
  })
}
