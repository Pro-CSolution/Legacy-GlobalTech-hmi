import { useEffect, useRef } from 'react'
import { subscribeParameters, unsubscribeParameters } from '../services/parameterLiveGateway'

type UseOnDemandParams = {
  deviceId: string
  parameterIds: string[]
  limit?: number
}

export const useOnDemandParameters = ({
  deviceId,
  parameterIds,
  limit = 18
}: UseOnDemandParams) => {
  const currentRef = useRef<string[]>([])

  useEffect(() => {
    if (!deviceId) return

    const uniqueIds = Array.from(new Set(parameterIds.filter((id) => !!id)))
    const nextIds = uniqueIds.slice(0, limit)
    const prevIds = currentRef.current

    const toUnsubscribe = prevIds.filter((id) => !nextIds.includes(id))
    if (toUnsubscribe.length) {
      unsubscribeParameters(deviceId, toUnsubscribe)
    }

    const toSubscribe = nextIds.filter((id) => !prevIds.includes(id))
    if (toSubscribe.length) {
      subscribeParameters(deviceId, toSubscribe)
    }

    currentRef.current = nextIds

    return () => {
      if (currentRef.current.length) {
        unsubscribeParameters(deviceId, currentRef.current)
      }
    }
  }, [deviceId, parameterIds, limit])
}
