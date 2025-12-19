import { createContext, useEffect, useState, useCallback, useRef, ReactNode, FC } from 'react'
import { socketService, SOCKET_EVENTS } from '../services'

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

    const replayDeviceSubscriptions = () => {
      const activeDeviceIds = Object.entries(subscribersRef.current)
        .filter(([, count]) => count > 0)
        .map(([deviceId]) => deviceId)

      for (const deviceId of activeDeviceIds) {
        socketService.emit(SOCKET_EVENTS.SUBSCRIBE_DEVICE, deviceId)
      }
    }

    // 2. Setup Global Listeners
    const handleConnect = () => {
      setIsConnected(true)
      replayDeviceSubscriptions()
    }
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
    socketService.on(SOCKET_EVENTS.DEVICE_UPDATE, handleDeviceUpdate)

    // Si el socket ya estaba conectado (HMR/StrictMode), sincronizamos estado y re-suscribimos igual.
    if (socketService.isConnected()) {
      setIsConnected(true)
      replayDeviceSubscriptions()
    }

    return () => {
      socketService.off('connect', handleConnect)
      socketService.off('disconnect', handleDisconnect)
      socketService.off(SOCKET_EVENTS.DEVICE_UPDATE, handleDeviceUpdate)
      socketService.disconnect()
    }
  }, [])

  const subscribeDevice = useCallback((deviceId: string) => {
    if (!deviceId) return

    const currentCount = subscribersRef.current[deviceId] || 0
    subscribersRef.current[deviceId] = currentCount + 1

    if (currentCount === 0) {
      // Primer subscriber: si ya está conectado, emitimos ahora.
      // Si no, el replay en `connect` lo emitirá cuando reconecte.
      socketService.connect()
      if (socketService.isConnected()) {
        socketService.emit(SOCKET_EVENTS.SUBSCRIBE_DEVICE, deviceId)
      }
    }
  }, [])

  const unsubscribeDevice = useCallback((deviceId: string) => {
    if (!deviceId) return

    const currentCount = subscribersRef.current[deviceId] || 0
    if (currentCount > 0) {
      const nextCount = currentCount - 1
      if (nextCount <= 0) {
        delete subscribersRef.current[deviceId]
      } else {
        subscribersRef.current[deviceId] = nextCount
      }

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
