import { assertAccessAllowsMutation } from 'access/accessMode'
import { SYSTEM_ACTIONS_CONFIG } from 'config/app.config'
import { apiService } from './index'

const BASE = '/system/devices'

export type DeviceNetworkConfig = {
  id: string
  host: string
  port: number
  name: string
}

export type UpdateDeviceNetworkConfigPayload = Pick<DeviceNetworkConfig, 'host' | 'port' | 'name'>

const getSystemActionHeaders = () => {
  const token = SYSTEM_ACTIONS_CONFIG.TOKEN
  return token ? { 'X-System-Token': token } : undefined
}

export const getDeviceNetworkConfigs = async (): Promise<DeviceNetworkConfig[]> => {
  return apiService.get<DeviceNetworkConfig[]>(BASE)
}

export const updateDeviceNetworkConfig = async (
  deviceId: string,
  payload: UpdateDeviceNetworkConfigPayload
): Promise<DeviceNetworkConfig> => {
  assertAccessAllowsMutation('Device network changes')

  return apiService.put<DeviceNetworkConfig, UpdateDeviceNetworkConfigPayload>(
    `${BASE}/${deviceId}`,
    payload,
    {
      headers: getSystemActionHeaders()
    }
  )
}
