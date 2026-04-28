import { useState, useCallback } from 'react'
import { apiService } from '../services'
import { getViewOnlyActionMessage } from '../access/accessMode'
import { useAccessMode } from './useAccessMode'
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
  const { isViewOnly } = useAccessMode()

  const writeParameter = useCallback(
    async ({ deviceId, parameterId, value }: WriteCommandParams) => {
      if (isViewOnly) {
        const message = getViewOnlyActionMessage('Parameter changes')
        setError(message)
        return false
      }

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
    [isViewOnly]
  )

  const executeAction = useCallback(
    async ({ deviceId, actionName, parameters = {} }: CustomActionParams) => {
      if (isViewOnly) {
        const message = getViewOnlyActionMessage('Control actions')
        setError(message)
        return false
      }

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
    [isViewOnly]
  )

  return {
    writeParameter,
    executeAction,
    loading,
    error
  }
}
