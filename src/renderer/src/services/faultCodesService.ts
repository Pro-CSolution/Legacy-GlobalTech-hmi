import { isViewOnlyAccessMode } from 'access/accessMode'
import { apiService } from './index'

const BASE = '/drive'
const MONITOR_BASE = '/monitor/drive'

export type FaultCodeType = 'Trip' | 'Warning' | string

export type FaultCodeEntry = {
  id: number
  type: FaultCodeType
  title: string
  description: string | null
  causes: string | null
  action: string | null
  properties?: {
    class?: string[]
    auto_reset_param?: string | null
  } | null
}

let cacheList: FaultCodeEntry[] | null = null
let cacheById: Record<number, FaultCodeEntry> | null = null
let inFlight: Promise<FaultCodeEntry[]> | null = null

export const getFaultCodes = async (opts?: { force?: boolean }): Promise<FaultCodeEntry[]> => {
  const force = opts?.force === true
  if (!force && cacheList) return cacheList
  if (!force && inFlight) return inFlight
  const base = isViewOnlyAccessMode() ? MONITOR_BASE : BASE

  inFlight = apiService
    .get<FaultCodeEntry[]>(`${base}/fault-codes`)
    .then((data) => {
      cacheList = Array.isArray(data) ? data : []
      cacheById = cacheList.reduce<Record<number, FaultCodeEntry>>((acc, item) => {
        if (typeof item?.id === 'number') acc[item.id] = item
        return acc
      }, {})
      return cacheList
    })
    .finally(() => {
      inFlight = null
    })

  return inFlight
}

export const getFaultCodesById = async (opts?: { force?: boolean }) => {
  await getFaultCodes(opts)
  return cacheById || {}
}
