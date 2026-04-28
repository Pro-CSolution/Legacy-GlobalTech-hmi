import { isViewOnlyAccessMode } from 'access/accessMode'
import { type DeviceId } from 'types'
import { apiService } from './index'

const BASE = '/trip-events'
const MONITOR_BASE = '/monitor/trip-events'

export type TripEvent = {
  time: string
  code: number
}

export type FetchTripEventsParams = {
  deviceId: DeviceId
  limit?: number
  startTime?: string
  endTime?: string
}

export const fetchTripEvents = async ({
  deviceId,
  limit = 10,
  startTime,
  endTime
}: FetchTripEventsParams): Promise<TripEvent[]> => {
  const base = isViewOnlyAccessMode() ? MONITOR_BASE : BASE
  return apiService.get<TripEvent[]>(
    base,
    {
      device_id: deviceId,
      limit,
      start_time: startTime,
      end_time: endTime
    },
    { timeout: 30_000 }
  )
}
