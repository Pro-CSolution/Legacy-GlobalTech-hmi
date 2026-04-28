import { useEffect, useMemo, useRef, useState } from 'react'
import type { Dataset } from 'components/TrendChart/TrendChart.types'
import { fetchWagoLiveSnapshot } from 'services'
import type { ParameterId } from 'types'
import {
  getTrendVariableLabel,
  type TrendVariableId
} from '../constants'
import {
  getResolvedMainScreenTemperatureRegister,
  toHoldingRegisterOffset
} from 'utils/mainTemperatureMapping'
import type { MotorScope } from 'utils/motorDeviceMapping'

type UseMainTemperatureTrendDataOptions = {
  windowMinutes?: number
  startTime?: string
  endTime?: string
  realtime?: boolean
}

type MainTemperatureTrendDataset = Dataset & {
  parameterId: ParameterId
}

type Point = { x: number; y: number }

const MAIN_TEMPERATURE_TREND_POLL_MS = 1000
const MAIN_TEMPERATURE_TREND_MAX_POINTS = 21_600

const toSeconds = (iso: string | number): number =>
  typeof iso === 'number' ? iso : new Date(iso).getTime() / 1000

const resolveAbsoluteRange = (
  startTime?: string,
  endTime?: string
): { startSec: number; endSec: number } | null => {
  if (!startTime || !endTime) {
    return null
  }

  const startSec = toSeconds(startTime)
  const endSec = toSeconds(endTime)

  if (!Number.isFinite(startSec) || !Number.isFinite(endSec) || !(endSec > startSec)) {
    return null
  }

  return { startSec, endSec }
}

const trimPoints = (
  points: Point[],
  absoluteRange: { startSec: number; endSec: number } | null,
  windowMinutes: number,
  nowSec: number
): Point[] => {
  if (!points.length) {
    return points
  }

  const filtered = absoluteRange
    ? points.filter((point) => point.x >= absoluteRange.startSec && point.x <= absoluteRange.endSec)
    : points.filter((point) => point.x >= nowSec - windowMinutes * 60)

  return filtered.slice(-MAIN_TEMPERATURE_TREND_MAX_POINTS)
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

export const useMainTemperatureTrendData = (
  deviceId: string,
  scope: MotorScope,
  parameterIds: ParameterId[],
  {
    windowMinutes = 5,
    startTime,
    endTime,
    realtime = true
  }: UseMainTemperatureTrendDataOptions = {}
) => {
  const [datasets, setDatasets] = useState<MainTemperatureTrendDataset[]>([])
  const [xDomain, setXDomain] = useState<{ min: number; max: number } | null>(null)
  const absoluteRange = useMemo(
    () => resolveAbsoluteRange(startTime, endTime),
    [startTime, endTime]
  )
  const historyRef = useRef(new Map<ParameterId, Point[]>())

  const parameterEntries = useMemo(
    () =>
      parameterIds
        .map((parameterId) => {
          const modbusRegister = getResolvedMainScreenTemperatureRegister(parameterId, scope)
          return typeof modbusRegister === 'number'
            ? {
                parameterId,
                modbusRegister
              }
            : null
        })
        .filter(
          (
            entry
          ): entry is {
            parameterId: ParameterId
            modbusRegister: number
          } => Boolean(entry)
        ),
    [parameterIds, scope]
  )

  useEffect(() => {
    const nextHistory = new Map<ParameterId, Point[]>()
    parameterIds.forEach((parameterId) => {
      nextHistory.set(parameterId, historyRef.current.get(parameterId) ?? [])
    })
    historyRef.current = nextHistory
  }, [parameterIds])

  useEffect(() => {
    const requestedDomain = buildRequestedDomain(absoluteRange, windowMinutes)

    if (!parameterIds.length) {
      setDatasets([])
      setXDomain(null)
      return
    }

    const nextDatasets = parameterIds.map((parameterId) => ({
      parameterId,
      label: getTrendVariableLabel(parameterId as TrendVariableId),
      data: trimPoints(
        historyRef.current.get(parameterId) ?? [],
        absoluteRange,
        windowMinutes,
        requestedDomain.max
      ),
      borderColor: '#67d6ff',
      backgroundColor: 'transparent',
      tension: 0.25,
      pointRadius: 0,
      borderWidth: 2
    }))

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
  }, [absoluteRange, parameterIds, windowMinutes])

  useEffect(() => {
    if (!deviceId || !parameterEntries.length) {
      setDatasets([])
      setXDomain(null)
      return
    }

    let mounted = true

    const loadSnapshot = async () => {
      const snapshot = await fetchWagoLiveSnapshot({
        deviceId,
        registerType: 'holding',
        addresses: parameterEntries.map(({ modbusRegister }) => toHoldingRegisterOffset(modbusRegister))
      })

      if (!mounted) {
        return
      }

      const nowSec = Date.now() / 1000
      parameterEntries.forEach(({ parameterId, modbusRegister }) => {
        const nextValue =
          snapshot.values.find((entry) => entry.modbus_register === modbusRegister)?.value ?? null
        if (typeof nextValue !== 'number' || !Number.isFinite(nextValue)) {
          return
        }

        const nextHistory = [
          ...(historyRef.current.get(parameterId) ?? []),
          { x: nowSec, y: nextValue }
        ]
        historyRef.current.set(
          parameterId,
          trimPoints(nextHistory, absoluteRange, windowMinutes, nowSec)
        )
      })

      const requestedDomain = buildRequestedDomain(absoluteRange, windowMinutes)
      const nextDatasets = parameterIds.map((parameterId) => ({
        parameterId,
        label: getTrendVariableLabel(parameterId as TrendVariableId),
        data: trimPoints(
          historyRef.current.get(parameterId) ?? [],
          absoluteRange,
          windowMinutes,
          nowSec
        ),
        borderColor: '#67d6ff',
        backgroundColor: 'transparent',
        tension: 0.25,
        pointRadius: 0,
        borderWidth: 2
      }))

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
    }, MAIN_TEMPERATURE_TREND_POLL_MS)

    return () => {
      mounted = false
      window.clearInterval(intervalId)
    }
  }, [absoluteRange, deviceId, parameterEntries, parameterIds, realtime, windowMinutes])

  return { datasets, xDomain }
}
