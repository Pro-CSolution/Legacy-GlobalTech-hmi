import { createContext, useEffect, useState, useCallback, useRef, ReactNode, FC } from 'react'
import { socketService } from '../services'

export interface DeviceData {
  [paramId: string]: string | number | boolean | null | undefined
}

export interface RealtimeContextType {
  // Map of deviceId -> current data snapshot
  devicesData: Record<string, DeviceData>
  // Connection status
  isConnected: boolean
  // Method to register interest in a device (increments ref count)
  subscribeDevice: (deviceId: string) => void
  // Method to unregister interest (decrements ref count)
  unsubscribeDevice: (deviceId: string) => void
}

const RealtimeContext = createContext<RealtimeContextType | null>(null)

// Export context for useRealtime hook
export { RealtimeContext }

export const RealtimeProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false)
  const [devicesData, setDevicesData] = useState<Record<string, DeviceData>>({})

  // Ref counting for subscriptions to avoid spamming join/leave rooms
  const subscribersRef = useRef<Record<string, number>>({})

  useEffect(() => {
    // 1. Connect Socket
    socketService.connect()

    // 2. Setup Global Listeners
    const handleConnect = () => setIsConnected(true)
    const handleDisconnect = () => setIsConnected(false)

    const handleDeviceUpdate = (payload: { device_id: string; data: DeviceData }) => {
      setDevicesData((prev) => ({
        ...prev,
        [payload.device_id]: {
          ...(prev[payload.device_id] || {}),
          ...payload.data
        }
      }))
    }

    socketService.on('connect', handleConnect)
    socketService.on('disconnect', handleDisconnect)
    socketService.on('device_update', handleDeviceUpdate)

    return () => {
      socketService.off('connect', handleConnect)
      socketService.off('disconnect', handleDisconnect)
      socketService.off('device_update', handleDeviceUpdate)
      socketService.disconnect()
    }
  }, [])

  const subscribeDevice = useCallback((deviceId: string) => {
    const currentCount = subscribersRef.current[deviceId] || 0
    subscribersRef.current[deviceId] = currentCount + 1

    if (currentCount === 0) {
      // First subscriber, ensure socket is ready before emitting
      if (!socketService.isConnected()) {
        socketService.connect()
        const handleConnect = () => {
          socketService.off('connect', handleConnect)
          socketService.emit('subscribe_device', deviceId)
        }
        socketService.on('connect', handleConnect)
        return
      }

      socketService.emit('subscribe_device', deviceId)
    }
  }, [])

  const unsubscribeDevice = useCallback((deviceId: string) => {
    const currentCount = subscribersRef.current[deviceId] || 0
    if (currentCount > 0) {
      subscribersRef.current[deviceId] = currentCount - 1

      // Optional: If count reaches 0, we could leave the room to save bandwidth
      // socketService.emit('unsubscribe_device', deviceId)
    }
  }, [])

  return (
    <RealtimeContext.Provider
      value={{ devicesData, isConnected, subscribeDevice, unsubscribeDevice }}
    >
      {children}
    </RealtimeContext.Provider>
  )
}
