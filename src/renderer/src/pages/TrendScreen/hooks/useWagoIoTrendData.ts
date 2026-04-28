import { useEffect, useMemo, useRef, useState } from 'react'
import type { Dataset } from 'components/TrendChart/TrendChart.types'
import { fetchWagoLiveSnapshot } from 'services'
import type { WagoLiveRegisterType } from 'services/wagoLiveService'
import type { TemperatureUnit } from 'hooks/useTemperatureUnitPreference'
import {
  getTrendVariableLabel,
  getWagoIoTrendVariableDisplayUnit,
  getWagoIoTrendVariableDisplayValue,
  getWagoIoTrendVariableMeta,
  type WagoIoTrendVariableId
} from '../constants'

type UseWagoIoTrendDataOptions = {
  windowMinutes?: number
  startTime?: string
  endTime?: string
  realtime?: boolean
  temperatureUnit?: TemperatureUnit
}

type WagoIoTrendDataset = Dataset & {
  parameterId: WagoIoTrendVariableId
}

type Point = { x: number; y: number }
type ValueMap = Record<number, number | null>

const WAGO_IO_TREND_POLL_MS = 1000
const WAGO_IO_TREND_MAX_POINTS = 21_600

const toSeconds = (iso: string | number): number =>
  typeof iso === 'number' ? iso : new Date(iso).getTime() / 1000

const resolveAbsoluteRange = (
  startTime?: string,
  endTime?: string
): { startSec: number; endSec: number } | null => {
  if (!startTime || !endTime) return null

  const startSec = toSeconds(startTime)
  const endSec = toSeconds(endTime)

  if (!Number.isFinite(startSec) || !Number.isFinite(endSec) || !(endSec > startSec)) {
    return null
  }

  return { startSec, endSec }
}

const trimPoints = (
  points: Point[],
  absoluteRange: { startSec: number; endSec: number } | null
): Point[] => {
  if (!points.length) return points

  if (absoluteRange) {
    return points
      .filter((point) => point.x >= absoluteRange.startSec && point.x <= absoluteRange.endSec)
      .slice(-WAGO_IO_TREND_MAX_POINTS)
  }

  return points.slice(-WAGO_IO_TREND_MAX_POINTS)
}

const buildRequestedDomain = (
  absoluteRange: { startSec: number; endSec: number } | null,
  windowMinutes: number
): { min: number; max: number } => {
  if (absoluteRange) {
    return {
      min: absoluteRange.startSec,
      max: absoluteRange.endSec
    }
  }

  const nowSec = Date.now() / 1000
  return {
    min: nowSec - windowMinutes * 60,
    max: nowSec
  }
}

export const useWagoIoTrendData = (
  deviceId: string,
  variableIds: WagoIoTrendVariableId[],
  {
    windowMinutes = 5,
    startTime,
    endTime,
    realtime = true,
    temperatureUnit = 'fahrenheit'
  }: UseWagoIoTrendDataOptions = {}
) => {
  const [datasets, setDatasets] = useState<WagoIoTrendDataset[]>([])
  const [xDomain, setXDomain] = useState<{ min: number; max: number } | null>(null)
  const absoluteRange = useMemo(
    () => resolveAbsoluteRange(startTime, endTime),
    [startTime, endTime]
  )
  const historyRef = useRef(new Map<WagoIoTrendVariableId, Point[]>())

  const variableMetas = useMemo(
    () =>
      variableIds
        .map((id) => {
          const meta = getWagoIoTrendVariableMeta(id)
          return meta ? { id, meta } : null
        })
        .filter(
          (
            value
          ): value is {
            id: WagoIoTrendVariableId
            meta: NonNullable<ReturnType<typeof getWagoIoTrendVariableMeta>>
          } => Boolean(value)
        ),
    [variableIds]
  )

  const sourceRequests = useMemo(() => {
    const grouped: Record<WagoLiveRegisterType, number[]> = {
      input: [],
      holding: [],
      discrete: [],
      coil: []
    }

    variableMetas.forEach(({ meta }) => {
      if (!grouped[meta.sourceRegisterType].includes(meta.modbusRegister)) {
        grouped[meta.sourceRegisterType].push(meta.modbusRegister)
      }
    })

    return (Object.entries(grouped) as Array<[WagoLiveRegisterType, number[]]>)
      .map(
        ([registerType, addresses]) =>
          [registerType, addresses.sort((left, right) => left - right)] as const
      )
      .filter(([, addresses]) => addresses.length > 0)
  }, [variableMetas])

  useEffect(() => {
    const nextHistory = new Map<WagoIoTrendVariableId, Point[]>()
    variableIds.forEach((id) => {
      nextHistory.set(id, historyRef.current.get(id) ?? [])
    })
    historyRef.current = nextHistory
  }, [variableIds])

  const toDisplayHistory = (id: WagoIoTrendVariableId, points: Point[]): Point[] =>
    points.map((point) => ({
      ...point,
      y: getWagoIoTrendVariableDisplayValue(id, point.y, temperatureUnit)
    }))

  useEffect(() => {
    const requestedDomain = buildRequestedDomain(absoluteRange, windowMinutes)

    const nextDatasets = variableIds.map((id) => {
      const history = trimPoints(historyRef.current.get(id) ?? [], absoluteRange)

      return {
        parameterId: id,
        label: getTrendVariableLabel(id),
        data: toDisplayHistory(id, history),
        unit: getWagoIoTrendVariableDisplayUnit(id, temperatureUnit),
        borderColor: '#67d6ff',
        backgroundColor: 'transparent',
        tension: 0.25,
        pointRadius: 0,
        borderWidth: 2
      }
    })

    setDatasets(nextDatasets)

    const allPoints = nextDatasets.flatMap((dataset) => dataset.data)
    if (!allPoints.length) {
      setXDomain(variableIds.length ? requestedDomain : null)
      return
    }

    setXDomain({
      min: Math.min(...allPoints.map((point) => point.x)),
      max: Math.max(...allPoints.map((point) => point.x))
    })
  }, [absoluteRange, temperatureUnit, variableIds, windowMinutes])

  useEffect(() => {
    if (!deviceId || !sourceRequests.length || !variableMetas.length) {
      setDatasets([])
      setXDomain(null)
      return
    }

    let mounted = true

    const loadSnapshot = async () => {
      const results = await Promise.allSettled(
        sourceRequests.map(([registerType, addresses]) =>
          fetchWagoLiveSnapshot({
            deviceId,
            registerType,
            addresses
          })
        )
      )

      if (!mounted) {
        return
      }

      const valuesByType: Record<WagoLiveRegisterType, ValueMap> = {
        input: {},
        holding: {},
        discrete: {},
        coil: {}
      }

      results.forEach((result, index) => {
        if (result.status !== 'fulfilled') {
          return
        }

        const [registerType] = sourceRequests[index]
        result.value.values.forEach((entry) => {
          valuesByType[registerType][entry.address] = entry.value
        })
      })

      const nowSec = Date.now() / 1000
      variableMetas.forEach(({ id, meta }) => {
        const nextValue = valuesByType[meta.sourceRegisterType][meta.sourceAddress]
        if (typeof nextValue !== 'number' || !Number.isFinite(nextValue)) {
          return
        }

        const nextHistory = [...(historyRef.current.get(id) ?? []), { x: nowSec, y: nextValue }]
        historyRef.current.set(id, trimPoints(nextHistory, absoluteRange))
      })

      const requestedDomain = buildRequestedDomain(absoluteRange, windowMinutes)
      const nextDatasets = variableIds.map((id) => {
        const history = trimPoints(historyRef.current.get(id) ?? [], absoluteRange)

        return {
          parameterId: id,
          label: getTrendVariableLabel(id),
          data: toDisplayHistory(id, history),
          unit: getWagoIoTrendVariableDisplayUnit(id, temperatureUnit),
          borderColor: '#67d6ff',
          backgroundColor: 'transparent',
          tension: 0.25,
          pointRadius: 0,
          borderWidth: 2
        }
      })

      setDatasets(nextDatasets)

      const allPoints = nextDatasets.flatMap((dataset) => dataset.data)
      setXDomain(
        allPoints.length
          ? {
              min: Math.min(...allPoints.map((point) => point.x)),
              max: Math.max(...allPoints.map((point) => point.x))
            }
          : requestedDomain
      )
    }

    void loadSnapshot()

    if (!realtime) {
      return () => {
        mounted = false
      }
    }

    const intervalId = window.setInterval(() => {
      void loadSnapshot()
    }, WAGO_IO_TREND_POLL_MS)

    return () => {
      mounted = false
      window.clearInterval(intervalId)
    }
  }, [
    absoluteRange,
    deviceId,
    realtime,
    sourceRequests,
    temperatureUnit,
    variableIds,
    variableMetas,
    windowMinutes
  ])

  return { datasets, xDomain }
}
