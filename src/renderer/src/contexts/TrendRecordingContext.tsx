import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FC,
  type ReactNode
} from 'react'
import { fetchWagoLiveSnapshot } from 'services'
import { onTrendUpdate, subscribeTrend, unsubscribeTrend, type TrendUpdatePayload } from 'services/trendLiveGateway'
import type { Dataset } from 'components/TrendChart/TrendChart.types'
import type { ParameterId } from 'types'
import {
  TREND_AVAILABLE_VARIABLES_BY_ID,
  getWagoIoTrendVariableMeta,
  isWagoIoTrendVariableId,
  type TrendVariableId,
  type WagoIoTrendVariableId
} from 'pages/TrendScreen/constants'
import {
  MAIN_SCREEN_TEMPERATURE_PARAMETER_IDS,
  getResolvedMainScreenTemperatureRegister,
  toHoldingRegisterOffset
} from 'utils/mainTemperatureMapping'
import {
  getMotorDriveDeviceId,
  getMotorWagoDeviceId,
  getMotorWagoLiveDeviceId,
  type MotorScope
} from 'utils/motorDeviceMapping'
import { useMotorControlModePreference } from 'hooks/useMotorControlModePreference'
import { usePreferredSingleMotorScope } from 'hooks/usePreferredSingleMotorScope'
import type { WagoLiveRegisterType } from 'services/wagoLiveService'

type RecordingStatus = 'idle' | 'recording' | 'stopped'

type RecordedSensorDataset = Dataset & {
  parameterId: TrendVariableId
  scope: MotorScope
}

type RecordedSeries = {
  key: string
  parameterId: TrendVariableId
  scope: MotorScope
  data: Array<{ x: number; y: number }>
  firstRecordedAt: number | null
  lastRecordedAt: number | null
}

type TrendRecordingContextType = {
  status: RecordingStatus
  startedAt: number | null
  stoppedAt: number | null
  sessionXDomain: { min: number; max: number } | null
  hasRecordedSession: boolean
  hasRecordedPoints: boolean
  trackedSensorIds: TrendVariableId[]
  setTrackedSensorIds: (ids: TrendVariableId[]) => void
  startRecording: (ids?: TrendVariableId[]) => void
  stopRecording: () => void
  motorOneDatasets: RecordedSensorDataset[]
  motorTwoDatasets: RecordedSensorDataset[]
  motorOneDatasetsAll: RecordedSensorDataset[]
  motorTwoDatasetsAll: RecordedSensorDataset[]
}

const TrendRecordingContext = createContext<TrendRecordingContextType | null>(null)

export { TrendRecordingContext }

const MAIN_SCREEN_TEMPERATURE_PARAMETER_ID_SET = new Set<ParameterId>(
  MAIN_SCREEN_TEMPERATURE_PARAMETER_IDS
)
const CORRECTED_WAGO_LIVE_TREND_PARAMETER_ID_SET = new Set<ParameterId>(['Coolant_Pressure_PSI'])
const WAGO_IO_TREND_POLL_MS = 1000
const MAIN_TEMPERATURE_TREND_POLL_MS = 1000
const MAX_RECORDED_POINTS_PER_SERIES = 172_800

const normalizeSelectedIds = (ids: TrendVariableId[]): TrendVariableId[] =>
  Array.from(
    new Set(
      ids.filter((id) => {
        return TREND_AVAILABLE_VARIABLES_BY_ID.has(id)
      })
    )
  )

const makeSeriesKey = (scope: MotorScope, parameterId: TrendVariableId): string =>
  `${scope}:${parameterId}`

const toSeconds = (value: string | number): number =>
  typeof value === 'number' ? value : new Date(value).getTime() / 1000

const appendPoint = (
  points: Array<{ x: number; y: number }>,
  nextPoint: { x: number; y: number }
): Array<{ x: number; y: number }> => {
  if (!Number.isFinite(nextPoint.x) || !Number.isFinite(nextPoint.y)) {
    return points
  }

  const lastPoint = points[points.length - 1]
  const nextPoints =
    lastPoint && Number.isFinite(lastPoint.x) && lastPoint.x === nextPoint.x
      ? [...points.slice(0, -1), nextPoint]
      : [...points, nextPoint]

  return nextPoints.length > MAX_RECORDED_POINTS_PER_SERIES
    ? nextPoints.slice(-MAX_RECORDED_POINTS_PER_SERIES)
    : nextPoints
}

const sortRecordedSeries = (series: RecordedSeries[]): RecordedSeries[] =>
  [...series].sort((left, right) => {
    const leftTs = left.firstRecordedAt ?? Number.POSITIVE_INFINITY
    const rightTs = right.firstRecordedAt ?? Number.POSITIVE_INFINITY
    if (leftTs !== rightTs) {
      return leftTs - rightTs
    }

    return left.parameterId.localeCompare(right.parameterId)
  })

export const TrendRecordingProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [motorControlMode] = useMotorControlModePreference()
  const singleMotorScope = usePreferredSingleMotorScope()
  const [status, setStatus] = useState<RecordingStatus>('idle')
  const [startedAt, setStartedAt] = useState<number | null>(null)
  const [stoppedAt, setStoppedAt] = useState<number | null>(null)
  const [trackedSensorIds, setTrackedSensorIdsState] = useState<TrendVariableId[]>([])
  const [version, setVersion] = useState(0)

  const seriesByKeyRef = useRef<Map<string, RecordedSeries>>(new Map())
  const statusRef = useRef<RecordingStatus>('idle')

  useEffect(() => {
    statusRef.current = status
  }, [status])

  const notifySeriesChange = useCallback(() => {
    setVersion((prev) => prev + 1)
  }, [])

  const recordPoint = useCallback(
    (scope: MotorScope, parameterId: TrendVariableId, x: number, y: number) => {
      if (statusRef.current !== 'recording') {
        return
      }

      const key = makeSeriesKey(scope, parameterId)
      const current = seriesByKeyRef.current.get(key)
      const nextData = appendPoint(current?.data ?? [], { x, y })
      const nextSeries: RecordedSeries = {
        key,
        parameterId,
        scope,
        data: nextData,
        firstRecordedAt: current?.firstRecordedAt ?? x,
        lastRecordedAt: x
      }

      seriesByKeyRef.current.set(key, nextSeries)
      notifySeriesChange()
    },
    [notifySeriesChange]
  )

  const setTrackedSensorIds = useCallback((ids: TrendVariableId[]) => {
    setTrackedSensorIdsState((prev) => {
      const next = normalizeSelectedIds(ids)
      return prev.length === next.length && prev.every((id, index) => id === next[index]) ? prev : next
    })
  }, [])

  const startRecording = useCallback((ids?: TrendVariableId[]) => {
    const nextIds = normalizeSelectedIds(ids ?? trackedSensorIds)
    seriesByKeyRef.current = new Map()
    statusRef.current = 'recording'
    setTrackedSensorIdsState(nextIds)
    setStartedAt(Date.now() / 1000)
    setStoppedAt(null)
    setStatus('recording')
    setVersion((prev) => prev + 1)
  }, [trackedSensorIds])

  const stopRecording = useCallback(() => {
    statusRef.current = 'stopped'
    setStoppedAt(Date.now() / 1000)
    setStatus('stopped')
  }, [])

  const activeScopes = useMemo<MotorScope[]>(
    () => (motorControlMode === 'dual' ? [1, 2] : [singleMotorScope]),
    [motorControlMode, singleMotorScope]
  )

  const activeSelection = useMemo(() => {
    if (status !== 'recording') {
      return {
        selectedDriveVarIds: [] as ParameterId[],
        selectedLegacyWagoVarIds: [] as ParameterId[],
        selectedLiveWagoVarIds: [] as ParameterId[],
        selectedMainTemperatureVarIds: [] as ParameterId[],
        selectedWagoIoVarIds: [] as WagoIoTrendVariableId[]
      }
    }

    const selectedDriveVarIds: ParameterId[] = []
    const selectedLegacyWagoVarIds: ParameterId[] = []
    const selectedLiveWagoVarIds: ParameterId[] = []
    const selectedMainTemperatureVarIds: ParameterId[] = []
    const selectedWagoIoVarIds: WagoIoTrendVariableId[] = []

    trackedSensorIds.forEach((id) => {
      if (isWagoIoTrendVariableId(id)) {
        selectedWagoIoVarIds.push(id)
        return
      }

      const variable = TREND_AVAILABLE_VARIABLES_BY_ID.get(id)
      if (!variable || variable.dataSource !== 'backend') {
        return
      }

      if (variable.deviceRole === 'drive') {
        selectedDriveVarIds.push(id as ParameterId)
        return
      }

      const parameterId = id as ParameterId
      if (MAIN_SCREEN_TEMPERATURE_PARAMETER_ID_SET.has(parameterId)) {
        selectedMainTemperatureVarIds.push(parameterId)
        return
      }

      if (CORRECTED_WAGO_LIVE_TREND_PARAMETER_ID_SET.has(parameterId)) {
        selectedLiveWagoVarIds.push(parameterId)
        return
      }

      selectedLegacyWagoVarIds.push(parameterId)
    })

    return {
      selectedDriveVarIds,
      selectedLegacyWagoVarIds,
      selectedLiveWagoVarIds,
      selectedMainTemperatureVarIds,
      selectedWagoIoVarIds
    }
  }, [status, trackedSensorIds])

  useEffect(() => {
    if (status !== 'recording') {
      return
    }

    const subscriptions = activeScopes.flatMap((scope) => {
      const next = [
        {
          deviceId: getMotorDriveDeviceId(scope),
          parameterIds: activeSelection.selectedDriveVarIds,
          scope
        },
        {
          deviceId: getMotorWagoDeviceId(scope),
          parameterIds: activeSelection.selectedLegacyWagoVarIds,
          scope
        },
        {
          deviceId: getMotorWagoLiveDeviceId(scope),
          parameterIds: activeSelection.selectedLiveWagoVarIds,
          scope
        }
      ]

      return next.filter((entry) => entry.parameterIds.length > 0)
    })

    if (!subscriptions.length) {
      return
    }

    subscriptions.forEach(({ deviceId, parameterIds }) => {
      subscribeTrend(deviceId, parameterIds)
    })

    const subscriptionByDevice = new Map<string, (typeof subscriptions)[number]>(
      subscriptions.map((entry) => [entry.deviceId, entry] as const)
    )

    const off = onTrendUpdate((payload: TrendUpdatePayload) => {
      const subscription = subscriptionByDevice.get(payload.device_id)
      if (!subscription) {
        return
      }

      const fallbackNow = Date.now() / 1000
      const tsSeconds = payload.ts ? toSeconds(payload.ts) : fallbackNow
      subscription.parameterIds.forEach((parameterId) => {
        const value = payload.data[parameterId]
        if (value === undefined || value === null) {
          return
        }

        const numeric = Number(value)
        if (!Number.isFinite(numeric)) {
          return
        }

        recordPoint(subscription.scope, parameterId, tsSeconds, numeric)
      })
    })

    return () => {
      off()
      subscriptions.forEach(({ deviceId }) => {
        unsubscribeTrend(deviceId)
      })
    }
  }, [activeScopes, activeSelection, recordPoint, status])

  useEffect(() => {
    if (status !== 'recording' || !activeSelection.selectedMainTemperatureVarIds.length) {
      return
    }

    let mounted = true

    const loadSnapshot = async () => {
      const results = await Promise.allSettled(
        activeScopes.map(async (scope) => {
          const addresses = activeSelection.selectedMainTemperatureVarIds
            .map((parameterId) => {
              const modbusRegister = getResolvedMainScreenTemperatureRegister(parameterId, scope)
              return typeof modbusRegister === 'number' ? toHoldingRegisterOffset(modbusRegister) : null
            })
            .filter((address): address is number => typeof address === 'number')

          if (!addresses.length) {
            return null
          }

          const snapshot = await fetchWagoLiveSnapshot({
            deviceId: getMotorWagoLiveDeviceId(scope),
            registerType: 'holding',
            addresses
          })

          return { scope, snapshot }
        })
      )

      if (!mounted || statusRef.current !== 'recording') {
        return
      }

      const nowSec = Date.now() / 1000
      results.forEach((result) => {
        if (result.status !== 'fulfilled' || !result.value) {
          return
        }

        const { scope, snapshot } = result.value
        activeSelection.selectedMainTemperatureVarIds.forEach((parameterId) => {
          const modbusRegister = getResolvedMainScreenTemperatureRegister(parameterId, scope)
          if (typeof modbusRegister !== 'number') {
            return
          }

          const value =
            snapshot.values.find((entry) => entry.modbus_register === modbusRegister)?.value ?? null
          const numeric = Number(value)
          if (!Number.isFinite(numeric)) {
            return
          }

          recordPoint(scope, parameterId, nowSec, numeric)
        })
      })
    }

    void loadSnapshot()
    const intervalId = window.setInterval(() => {
      void loadSnapshot()
    }, MAIN_TEMPERATURE_TREND_POLL_MS)

    return () => {
      mounted = false
      window.clearInterval(intervalId)
    }
  }, [activeScopes, activeSelection, recordPoint, status])

  useEffect(() => {
    if (status !== 'recording' || !activeSelection.selectedWagoIoVarIds.length) {
      return
    }

    let mounted = true

    const sourceRequestsByScope = activeScopes.map((scope) => {
      const grouped: Record<WagoLiveRegisterType, number[]> = {
        input: [],
        holding: [],
        discrete: [],
        coil: []
      }

      activeSelection.selectedWagoIoVarIds.forEach((id) => {
        const meta = getWagoIoTrendVariableMeta(id)
        if (!meta) {
          return
        }

        if (!grouped[meta.sourceRegisterType].includes(meta.modbusRegister)) {
          grouped[meta.sourceRegisterType].push(meta.modbusRegister)
        }
      })

      return {
        scope,
        requests: (Object.entries(grouped) as Array<[WagoLiveRegisterType, number[]]>)
          .map(
            ([registerType, addresses]) =>
              [registerType, addresses.sort((left, right) => left - right)] as const
          )
          .filter(([, addresses]) => addresses.length > 0)
      }
    })

    const loadSnapshot = async () => {
      const results = await Promise.allSettled(
        sourceRequestsByScope.flatMap(({ scope, requests }) =>
          requests.map(async ([registerType, addresses]) => ({
            scope,
            registerType,
            snapshot: await fetchWagoLiveSnapshot({
              deviceId: getMotorWagoDeviceId(scope),
              registerType,
              addresses
            })
          }))
        )
      )

      if (!mounted || statusRef.current !== 'recording') {
        return
      }

      const valuesByScope: Record<
        MotorScope,
        Record<WagoLiveRegisterType, Record<number, number | null>>
      > = {
        1: { input: {}, holding: {}, discrete: {}, coil: {} },
        2: { input: {}, holding: {}, discrete: {}, coil: {} }
      }

      results.forEach((result) => {
        if (result.status !== 'fulfilled') {
          return
        }

        const { scope, registerType, snapshot } = result.value
        snapshot.values.forEach((entry) => {
          valuesByScope[scope][registerType][entry.address] = entry.value
        })
      })

      const nowSec = Date.now() / 1000
      activeScopes.forEach((scope) => {
        activeSelection.selectedWagoIoVarIds.forEach((parameterId) => {
          const meta = getWagoIoTrendVariableMeta(parameterId)
          if (!meta) {
            return
          }

          const value = valuesByScope[scope][meta.sourceRegisterType][meta.sourceAddress]
          const numeric = Number(value)
          if (!Number.isFinite(numeric)) {
            return
          }

          recordPoint(scope, parameterId, nowSec, numeric)
        })
      })
    }

    void loadSnapshot()
    const intervalId = window.setInterval(() => {
      void loadSnapshot()
    }, WAGO_IO_TREND_POLL_MS)

    return () => {
      mounted = false
      window.clearInterval(intervalId)
    }
  }, [activeScopes, activeSelection, recordPoint, status])

  const allDatasetsByScope = useMemo(() => {
    void version
    const motorOneDatasets: RecordedSensorDataset[] = []
    const motorTwoDatasets: RecordedSensorDataset[] = []

    sortRecordedSeries(Array.from(seriesByKeyRef.current.values())).forEach((series) => {
      const next: RecordedSensorDataset = {
        parameterId: series.parameterId,
        scope: series.scope,
        label: series.parameterId,
        data: series.data,
        borderColor: '#67d6ff',
        backgroundColor: 'transparent',
        tension: 0.25,
        pointRadius: 0,
        borderWidth: 2
      }

      if (series.scope === 2) {
        motorTwoDatasets.push(next)
      } else {
        motorOneDatasets.push(next)
      }
    })

    return { motorOneDatasets, motorTwoDatasets }
  }, [version])

  const visibleDatasetsByScope = useMemo(() => {
    const trackedSet = new Set(trackedSensorIds)
    return {
      motorOneDatasets: allDatasetsByScope.motorOneDatasets.filter((dataset) =>
        trackedSet.has(dataset.parameterId)
      ),
      motorTwoDatasets: allDatasetsByScope.motorTwoDatasets.filter((dataset) =>
        trackedSet.has(dataset.parameterId)
      )
    }
  }, [allDatasetsByScope, trackedSensorIds])

  const sessionXDomain = useMemo(() => {
    if (!startedAt) {
      return null
    }

    return {
      min: startedAt,
      max: stoppedAt ?? Date.now() / 1000
    }
  }, [startedAt, stoppedAt, version, status])

  const hasRecordedPoints = useMemo(
    () => Array.from(seriesByKeyRef.current.values()).some((series) => series.data.length > 0),
    [version]
  )

  const value = useMemo<TrendRecordingContextType>(
    () => ({
      status,
      startedAt,
      stoppedAt,
      sessionXDomain,
      hasRecordedSession: startedAt !== null,
      hasRecordedPoints,
      trackedSensorIds,
      setTrackedSensorIds,
      startRecording,
      stopRecording,
      motorOneDatasets: visibleDatasetsByScope.motorOneDatasets,
      motorTwoDatasets: visibleDatasetsByScope.motorTwoDatasets,
      motorOneDatasetsAll: allDatasetsByScope.motorOneDatasets,
      motorTwoDatasetsAll: allDatasetsByScope.motorTwoDatasets
    }),
    [
      allDatasetsByScope,
      hasRecordedPoints,
      sessionXDomain,
      setTrackedSensorIds,
      startRecording,
      startedAt,
      status,
      stopRecording,
      stoppedAt,
      trackedSensorIds,
      visibleDatasetsByScope
    ]
  )

  return (
    <TrendRecordingContext.Provider value={value}>
      {children}
    </TrendRecordingContext.Provider>
  )
}
