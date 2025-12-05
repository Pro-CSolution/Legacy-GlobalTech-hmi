import { useState, useCallback } from 'react'
import { apiService } from '../services'
import { getErrorMessage } from '../types/errors'
import { DeviceId, ParameterId } from '../types'

interface WriteCommandParams {
  deviceId: DeviceId
  parameterId: ParameterId
  value: unknown
}

interface CustomActionParams {
  deviceId: DeviceId
  actionName: string
  parameters?: Record<string, unknown>
}

export const useSendCommand = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const writeParameter = useCallback(
    async ({ deviceId, parameterId, value }: WriteCommandParams) => {
      setLoading(true)
      setError(null)
      try {
        await apiService.post('/commands/write', {
          device_id: deviceId,
          parameter_id: parameterId,
          value
        })
        return true
      } catch (err: unknown) {
        console.error('Write parameter failed', err)
        setError(getErrorMessage(err, 'Failed to write parameter'))
        return false
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const executeAction = useCallback(
    async ({ deviceId, actionName, parameters = {} }: CustomActionParams) => {
      setLoading(true)
      setError(null)
      try {
        await apiService.post(`/commands/action/${actionName}`, {
          device_id: deviceId,
          action: actionName,
          parameters
        })
        return true
      } catch (err: unknown) {
        console.error('Execute action failed', err)
        setError(getErrorMessage(err, 'Failed to execute action'))
        return false
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return {
    writeParameter,
    executeAction,
    loading,
    error
  }
}
