import { useState, useEffect, useCallback } from 'react'
import { apiService } from '../services'
import { useRealtime } from './useRealtime'
import { DeviceId, ParameterId } from '../types'

export interface TrendPoint {
  time: string
  value: number
  device_id: string
  parameter_id: string
}

export const useTrendHistory = (deviceId: DeviceId, parameterId: ParameterId) => {
  const [history, setHistory] = useState<TrendPoint[]>([])
  const [loading, setLoading] = useState(false)
  const { subscribeDevice, unsubscribeDevice } = useRealtime()

  // 1. Initial Load from API
  const loadHistory = useCallback(async () => {
    setLoading(true)
    try {
      // Default: last 1 hour
      const endTime = new Date().toISOString()
      const startTime = new Date(Date.now() - 60 * 60 * 1000).toISOString()

      const data = await apiService.get<TrendPoint[]>('/history', {
        device_id: deviceId,
        parameter_id: parameterId,
        start_time: startTime,
        end_time: endTime,
        limit: 1000
      })

      // API returns newest first usually, but charts often need oldest first
      setHistory(data.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()))
    } catch (error) {
      console.error('Failed to load history', error)
    } finally {
      setLoading(false)
    }
  }, [deviceId, parameterId])

  // 2. Setup Realtime updates
  useEffect(() => {
    loadHistory()
    subscribeDevice(deviceId)

    // We need to listen to the specific socket event for updates
    // Since the RealtimeContext abstracts this into a big object,
    // we might want to listen directly here OR watch the context data.
    // Watching context data is safer for React state consistency.

    return () => {
      unsubscribeDevice(deviceId)
    }
  }, [deviceId, parameterId, loadHistory, subscribeDevice, unsubscribeDevice])

  // 3. Watch for new data from Context (Hybrid approach)
  // Note: In a real high-frequency scenario, we might want a direct socket listener here
  // instead of passing through context state to avoid re-renders of the whole tree.
  // But for >200ms, context is fine.

  const { devicesData } = useRealtime()

  useEffect(() => {
    const currentValue = devicesData[deviceId]?.[parameterId]

    if (currentValue !== undefined && currentValue !== null) {
      setHistory((prev) => {
        // const lastPoint = prev[prev.length - 1]
        const now = new Date().toISOString()

        // Dedup logic: if timestamp is same or value didn't change significantly?
        // For now, just push.
        return [
          ...prev,
          {
            time: now,
            value: Number(currentValue),
            device_id: deviceId,
            parameter_id: parameterId
          }
        ].slice(-1000) // Keep window size fixed
      })
    }
  }, [devicesData, deviceId, parameterId])

  return { history, loading, refetch: loadHistory }
}
