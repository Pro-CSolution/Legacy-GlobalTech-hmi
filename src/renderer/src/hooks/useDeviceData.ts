import { useEffect, useMemo } from 'react'
import { useRealtime } from './useRealtime'
import {
  DeviceId,
  PARAMETER_ALIASES,
  PARAMETER_META,
  ParameterAlias,
  ParameterId,
  ParameterMeta
} from 'types'

type AliasData = Record<
  ParameterAlias,
  {
    id: ParameterId
    alias: ParameterAlias
    value: unknown
    meta: ParameterMeta
  }
>

export const useDeviceData = (deviceId: DeviceId) => {
  const { devicesData, subscribeDevice, unsubscribeDevice, isConnected } = useRealtime()

  useEffect(() => {
    if (deviceId) {
      subscribeDevice(deviceId)
    }
    return () => {
      if (deviceId) {
        unsubscribeDevice(deviceId)
      }
    }
  }, [deviceId, subscribeDevice, unsubscribeDevice])

  const deviceData = useMemo(() => devicesData[deviceId] || {}, [devicesData, deviceId])

  const aliasData: Partial<AliasData> = useMemo(() => {
    const result: Partial<AliasData> = {}
    Object.entries(PARAMETER_ALIASES).forEach(([aliasKey, pid]) => {
      const alias = aliasKey as ParameterAlias
      result[alias] = {
        id: pid as ParameterId,
        alias,
        value: deviceData[pid as ParameterId],
        meta: PARAMETER_META[pid as ParameterId]
      }
    })
    return result
  }, [deviceData])

  return {
    data: aliasData as AliasData,
    raw: deviceData,
    isConnected
  }
}
