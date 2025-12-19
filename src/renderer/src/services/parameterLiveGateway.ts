import { socketService, SOCKET_EVENTS } from './index'

type DeviceId = string
type ParameterId = string

// Mantiene un ref-count por parámetro para evitar unsubscribes que rompan otras pantallas/componentes.
const parameterSubscriptionsByDevice = new Map<DeviceId, Map<ParameterId, number>>()
let paramsReplayBound = false

const ensureSocket = (): void => {
  // connect() es idempotente; asegura que exista socket y que intente reconectar.
  socketService.connect()
}

const getActiveParametersForDevice = (deviceId: DeviceId): ParameterId[] => {
  const params = parameterSubscriptionsByDevice.get(deviceId)
  if (!params) return []
  return Array.from(params.entries())
    .filter(([, count]) => count > 0)
    .map(([pid]) => pid)
}

const bindParametersReplay = (): void => {
  if (paramsReplayBound) return
  paramsReplayBound = true

  const replay = () => {
    for (const deviceId of parameterSubscriptionsByDevice.keys()) {
      const active = getActiveParametersForDevice(deviceId)
      if (!active.length) continue
      socketService.emit(SOCKET_EVENTS.SUBSCRIBE_PARAMETER, {
        device_id: deviceId,
        parameter_ids: active
      })
    }
  }

  ensureSocket()
  socketService.on('connect', replay)

  // Si ya está conectado, aseguramos re-sync (útil si el backend reinicia y el socket reconecta rápido).
  if (socketService.isConnected()) {
    replay()
  }
}

export const subscribeParameters = (deviceId: string, parameterIds: string[]): void => {
  if (!deviceId || !parameterIds.length) return

  const uniqueIds = Array.from(new Set(parameterIds.filter((id) => typeof id === 'string' && id)))
  if (!uniqueIds.length) return

  let deviceMap = parameterSubscriptionsByDevice.get(deviceId)
  if (!deviceMap) {
    deviceMap = new Map<ParameterId, number>()
    parameterSubscriptionsByDevice.set(deviceId, deviceMap)
  }

  const newlyActivated: ParameterId[] = []
  for (const pid of uniqueIds) {
    const prev = deviceMap.get(pid) ?? 0
    const next = prev + 1
    deviceMap.set(pid, next)
    if (prev === 0) newlyActivated.push(pid)
  }

  bindParametersReplay()
  ensureSocket()

  // Si no está conectado, NO emitimos: el replay en `connect` enviará el estado final.
  if (socketService.isConnected() && newlyActivated.length) {
    socketService.emit(SOCKET_EVENTS.SUBSCRIBE_PARAMETER, {
      device_id: deviceId,
      parameter_ids: newlyActivated
    })
  }
}

export const unsubscribeParameters = (deviceId: string, parameterIds: string[]): void => {
  if (!deviceId || !parameterIds.length) return

  const uniqueIds = Array.from(new Set(parameterIds.filter((id) => typeof id === 'string' && id)))
  if (!uniqueIds.length) return

  const deviceMap = parameterSubscriptionsByDevice.get(deviceId)
  if (!deviceMap) return

  const newlyDeactivated: ParameterId[] = []
  for (const pid of uniqueIds) {
    const prev = deviceMap.get(pid) ?? 0
    if (prev <= 0) continue
    const next = prev - 1
    if (next <= 0) {
      deviceMap.delete(pid)
      newlyDeactivated.push(pid)
    } else {
      deviceMap.set(pid, next)
    }
  }

  if (deviceMap.size === 0) {
    parameterSubscriptionsByDevice.delete(deviceId)
  }

  bindParametersReplay()
  ensureSocket()

  // Si no está conectado, NO emitimos: al reconectar ya no se re-suscribe (y el backend actual se limpia por "disconnect" solo en rooms, no en on-demand).
  if (socketService.isConnected() && newlyDeactivated.length) {
    socketService.emit(SOCKET_EVENTS.UNSUBSCRIBE_PARAMETER, {
      device_id: deviceId,
      parameter_ids: newlyDeactivated
    })
  }
}
