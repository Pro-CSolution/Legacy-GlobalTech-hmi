import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTrendData, useManualTrendData, useWagoDisplayNameOverrides } from 'hooks'
import { useAccessMode } from 'hooks/useAccessMode'
import { useMotorControlModePreference } from 'hooks/useMotorControlModePreference'
import { usePreferredSingleMotorScope } from 'hooks/usePreferredSingleMotorScope'
import { useTemperatureUnitPreference } from 'hooks/useTemperatureUnitPreference'
import {
  createManualPoint,
  createManualSeries,
  deleteManualPoint,
  deleteManualSeries,
  fetchManualHistory,
  fetchManualSeries,
  ManualTrendPoint,
  ManualTrendSeries,
  updateManualPoint,
  updateManualSeries
} from 'services/manualTrendService'
import {
  saveSharedTrendConfig,
  SharedTrendConfig
} from 'services/sharedTrendConfigService'
import { Dataset } from 'components/TrendChart/TrendChart.types'
import { ParameterId } from 'types/generated/devices'
import {
  AVAILABLE_VARIABLES,
  DEFAULT_EXCEL_SAMPLE_INTERVAL_UNIT,
  DEFAULT_EXCEL_SAMPLE_INTERVAL_VALUE,
  EXCEL_SAMPLE_INTERVAL_UNITS,
  EXCEL_SAMPLE_INTERVAL_VALUE_OPTIONS,
  TREND_AVAILABLE_VARIABLES,
  TREND_AVAILABLE_VARIABLES_BY_ID,
  applyVariableDisplayValue,
  buildRelativeRangeInput,
  formatTrendRangeSummary,
  getTrendVariableLabel,
  getVariableDisplayUnit,
  getWagoIoTrendVariableDisplayUnit,
  getWagoIoTrendVariableMeta,
  isWagoIoTrendVariableId,
  MANUAL_COLORS,
  nowLocalInput,
  nowLocalMinuteInput,
  TIME_RANGES,
  type TrendVariableId,
  type WagoIoTrendVariableId,
  type ExcelSampleIntervalUnit,
  formatLocalInputFromDate,
  TREND_COLOR_PALETTE,
  validateTrendCustomRange
} from '../constants'
import { useWagoIoTrendData } from './useWagoIoTrendData'
import {
  getMotorDriveDeviceId,
  getMotorScopeLabel,
  getMotorWagoDeviceId,
  getMotorWagoLiveDeviceId,
  type MotorScope
} from 'utils/motorDeviceMapping'
import {
  MAIN_SCREEN_TEMPERATURE_PARAMETER_IDS,
  redirectLegacyMainTemperatureParameter
} from 'utils/mainTemperatureMapping'
import {
  CurrentValueItem,
  ManualFormState,
  ManualMode,
  TrendCustomRange,
  TrendRangeMode,
  TrendYAxisScaleState
} from '../types'
import { useMainTemperatureTrendData } from './useMainTemperatureTrendData'

type ExtendedDataset = Dataset & {
  parameterId?: string
  unit?: string | null
  isManual?: boolean
}

type SensorDataset = Dataset & {
  parameterId: ParameterId
}

type WagoIoDataset = Dataset & {
  parameterId: WagoIoTrendVariableId
}

type TrendSensorDataset = SensorDataset | WagoIoDataset

type TrendScreenPersistedState = {
  selectedVarIds: TrendVariableId[]
  selectedManualIds: number[]
  timeRange: number
  rangeMode: TrendRangeMode
  customRange: TrendCustomRange | null
  yAxisScale: TrendYAxisScaleState
  seriesColorOverrides: Record<string, string>
}

type TrendSeriesColorType = 'sensor' | 'manual'
type TrendSeriesColorOverrides = Record<string, string>

const DEFAULT_SELECTED_VAR_IDS: TrendVariableId[] = []
const LEGACY_AUTO_SELECTED_VAR_IDS: TrendVariableId[] = [
  AVAILABLE_VARIABLES[0]?.id,
  AVAILABLE_VARIABLES[1]?.id,
  AVAILABLE_VARIABLES[3]?.id
].filter((id): id is ParameterId => Boolean(id))

const DEFAULT_TIME_RANGE = TIME_RANGES.find((range) => range.value === 60)?.value ?? 60
const TREND_STORAGE_KEY = 'trend_screen_config'
const EMAIL_STORAGE_KEY = 'trend_report_emails'
const REPORT_META_STORAGE_KEY = 'trend_report_meta'
const DEFAULT_Y_AXIS_SCALE: TrendYAxisScaleState = {
  mode: 'auto',
  min: '',
  max: ''
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const TREND_COLOR_SET = new Set<string>(TREND_COLOR_PALETTE)
const MAIN_SCREEN_TEMPERATURE_PARAMETER_ID_SET = new Set<ParameterId>(
  MAIN_SCREEN_TEMPERATURE_PARAMETER_IDS
)
const CORRECTED_WAGO_LIVE_TREND_PARAMETER_ID_SET = new Set<ParameterId>(['Coolant_Pressure_PSI'])

const isBrowser = (): boolean => typeof window !== 'undefined'

const normalizeEmail = (value: string): string => value.trim().toLowerCase()

const getSeriesColorKey = (type: TrendSeriesColorType, id: string | number): string =>
  `${type}:${String(id)}`

const sanitizeSeriesColorOverrides = (value: unknown): TrendSeriesColorOverrides => {
  if (!value || typeof value !== 'object') return {}

  const validSensorIds = new Set<string>(TREND_AVAILABLE_VARIABLES.map((variable) => variable.id))
  const sanitized: TrendSeriesColorOverrides = {}

  Object.entries(value as Record<string, unknown>).forEach(([key, rawColor]) => {
    if (typeof rawColor !== 'string' || !TREND_COLOR_SET.has(rawColor)) return

    if (key.startsWith('sensor:')) {
      const sensorId = key.slice('sensor:'.length)
      if (!validSensorIds.has(sensorId)) return
      sanitized[key] = rawColor
      return
    }

    if (/^manual:\d+$/.test(key)) {
      sanitized[key] = rawColor
    }
  })

  return sanitized
}

const sanitizeEmailList = (value: unknown): string[] => {
  if (!Array.isArray(value)) return []
  const deduped = new Set<string>()
  value.forEach((raw) => {
    if (typeof raw !== 'string') return
    const normalized = normalizeEmail(raw)
    if (!normalized) return
    if (!EMAIL_REGEX.test(normalized)) return
    deduped.add(normalized)
  })
  return Array.from(deduped)
}

const getValidVariableIds = (value: unknown): TrendVariableId[] => {
  if (!Array.isArray(value)) return []
  const allowed = new Set<string>(TREND_AVAILABLE_VARIABLES.map((v) => v.id))
  const normalizedIds = value
    .map((id): TrendVariableId | null => {
      if (typeof id !== 'string') return null
      return redirectLegacyMainTemperatureParameter(id as ParameterId) as TrendVariableId
    })
    .filter((id): id is TrendVariableId => id !== null && allowed.has(id))

  return Array.from(new Set(normalizedIds))
}

const getValidManualIds = (value: unknown): number[] => {
  if (!Array.isArray(value)) return []
  const deduped = new Set<number>()
  value.forEach((id) => {
    const numeric = typeof id === 'number' ? id : Number(id)
    if (Number.isFinite(numeric)) {
      deduped.add(numeric)
    }
  })
  return Array.from(deduped)
}

const getValidTimeRange = (value: unknown): number => {
  if (typeof value === 'number' && TIME_RANGES.some((range) => range.value === value)) {
    return value
  }
  return DEFAULT_TIME_RANGE
}

const getValidRangeMode = (value: unknown): TrendRangeMode => {
  return value === 'absolute' ? 'absolute' : 'relative'
}

const sanitizeCustomRange = (value: unknown): TrendCustomRange | null => {
  if (!value || typeof value !== 'object') return null

  const raw = value as Record<string, unknown>
  const start = typeof raw.start === 'string' ? raw.start : ''
  const end = typeof raw.end === 'string' ? raw.end : ''
  if (!start || !end) return null

  const validation = validateTrendCustomRange({ start, end })
  return validation.ok ? validation.normalized : null
}

const sanitizeYAxisScale = (value: unknown): TrendYAxisScaleState => {
  if (!value || typeof value !== 'object') return DEFAULT_Y_AXIS_SCALE

  const raw = value as Record<string, unknown>
  const mode = raw.mode === 'manual' ? 'manual' : 'auto'
  const min =
    typeof raw.min === 'number' ? String(raw.min) : typeof raw.min === 'string' ? raw.min : ''
  const max =
    typeof raw.max === 'number' ? String(raw.max) : typeof raw.max === 'string' ? raw.max : ''

  return { mode, min, max }
}

const parseScaleNumber = (value: string): number | null => {
  const normalized = value.trim().replace(',', '.')
  if (!normalized) return null

  const numeric = Number(normalized)
  return Number.isFinite(numeric) ? numeric : null
}

const hasSameParameterSelection = (
  left: readonly TrendVariableId[],
  right: readonly TrendVariableId[]
): boolean => left.length === right.length && left.every((id, index) => id === right[index])

const isDefaultYAxisScale = (value: TrendYAxisScaleState): boolean =>
  value.mode === DEFAULT_Y_AXIS_SCALE.mode &&
  value.min === DEFAULT_Y_AXIS_SCALE.min &&
  value.max === DEFAULT_Y_AXIS_SCALE.max

const shouldResetLegacyAutoSelection = (config: TrendScreenPersistedState): boolean =>
  hasSameParameterSelection(config.selectedVarIds, LEGACY_AUTO_SELECTED_VAR_IDS) &&
  config.selectedManualIds.length === 0 &&
  config.timeRange === DEFAULT_TIME_RANGE &&
  config.rangeMode === 'relative' &&
  config.customRange === null &&
  isDefaultYAxisScale(config.yAxisScale) &&
  Object.keys(config.seriesColorOverrides).length === 0

const loadPersistedTrendConfig = (): TrendScreenPersistedState | null => {
  if (!isBrowser()) return null
  try {
    const raw = localStorage.getItem(TREND_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return null

    const sanitizedVarIds = getValidVariableIds((parsed as Record<string, unknown>).selectedVarIds)
    const sanitizedManualIds = getValidManualIds(
      (parsed as Record<string, unknown>).selectedManualIds
    )
    const sanitizedRange = getValidTimeRange((parsed as Record<string, unknown>).timeRange)
    const sanitizedCustomRange = sanitizeCustomRange(
      (parsed as Record<string, unknown>).customRange
    )
    const sanitizedRangeMode =
      sanitizedCustomRange &&
      getValidRangeMode((parsed as Record<string, unknown>).rangeMode) === 'absolute'
        ? 'absolute'
        : 'relative'
    const sanitizedYAxisScale = sanitizeYAxisScale((parsed as Record<string, unknown>).yAxisScale)
    const sanitizedSeriesColorOverrides = sanitizeSeriesColorOverrides(
      (parsed as Record<string, unknown>).seriesColorOverrides
    )
    const config: TrendScreenPersistedState = {
      selectedVarIds: sanitizedVarIds.length ? sanitizedVarIds : DEFAULT_SELECTED_VAR_IDS,
      selectedManualIds: sanitizedManualIds,
      timeRange: sanitizedRange,
      rangeMode: sanitizedRangeMode,
      customRange: sanitizedCustomRange,
      yAxisScale: sanitizedYAxisScale,
      seriesColorOverrides: sanitizedSeriesColorOverrides
    }

    if (shouldResetLegacyAutoSelection(config)) {
      return {
        ...config,
        selectedVarIds: DEFAULT_SELECTED_VAR_IDS
      }
    }

    return config
  } catch {
    return null
  }
}

const loadPersistedEmailList = (): string[] | null => {
  if (!isBrowser()) return null
  try {
    const raw = localStorage.getItem(EMAIL_STORAGE_KEY)
    if (raw === null) return null
    const parsed = JSON.parse(raw)
    return sanitizeEmailList(parsed)
  } catch {
    return null
  }
}

type TrendReportPersistedMeta = {
  subject: string
  note: string
  privateMode: boolean
  excelSampleIntervalValue: number
  excelSampleIntervalUnit: ExcelSampleIntervalUnit
}

const isValidExcelSampleIntervalValue = (value: number): boolean =>
  EXCEL_SAMPLE_INTERVAL_VALUE_OPTIONS.some((option) => option === value)

const isValidExcelSampleIntervalUnit = (value: string): value is ExcelSampleIntervalUnit =>
  EXCEL_SAMPLE_INTERVAL_UNITS.some((option) => option === value)

const sanitizeReportMeta = (value: unknown): TrendReportPersistedMeta | null => {
  if (!value || typeof value !== 'object') return null
  const v = value as Record<string, unknown>
  const subject = typeof v.subject === 'string' ? v.subject : ''
  const note = typeof v.note === 'string' ? v.note : ''
  const privateMode = typeof v.privateMode === 'boolean' ? v.privateMode : false
  const rawValue =
    typeof v.excelSampleIntervalValue === 'number' ? v.excelSampleIntervalValue : NaN
  const rawUnit =
    typeof v.excelSampleIntervalUnit === 'string' ? v.excelSampleIntervalUnit : ''

  if (isValidExcelSampleIntervalValue(rawValue) && isValidExcelSampleIntervalUnit(rawUnit)) {
    return {
      subject,
      note,
      privateMode,
      excelSampleIntervalValue: rawValue,
      excelSampleIntervalUnit: rawUnit
    }
  }

  const legacyExcelSampleSeconds =
    typeof v.excelSampleSeconds === 'number' ? v.excelSampleSeconds : NaN
  if (Number.isFinite(legacyExcelSampleSeconds)) {
    if (isValidExcelSampleIntervalValue(legacyExcelSampleSeconds)) {
      return {
        subject,
        note,
        privateMode,
        excelSampleIntervalValue: legacyExcelSampleSeconds,
        excelSampleIntervalUnit: 'seconds'
      }
    }

    const minutesValue = legacyExcelSampleSeconds / 60
    if (isValidExcelSampleIntervalValue(minutesValue)) {
      return {
        subject,
        note,
        privateMode,
        excelSampleIntervalValue: minutesValue,
        excelSampleIntervalUnit: 'minutes'
      }
    }
  }

  return {
    subject,
    note,
    privateMode,
    excelSampleIntervalValue: DEFAULT_EXCEL_SAMPLE_INTERVAL_VALUE,
    excelSampleIntervalUnit: DEFAULT_EXCEL_SAMPLE_INTERVAL_UNIT
  }
}

const loadPersistedReportMeta = (): TrendReportPersistedMeta | null => {
  if (!isBrowser()) return null
  try {
    const raw = localStorage.getItem(REPORT_META_STORAGE_KEY)
    if (raw === null) return null
    const parsed = JSON.parse(raw)
    return sanitizeReportMeta(parsed)
  } catch {
    return null
  }
}

const toSharedTrendConfigPayload = (
  config: TrendScreenPersistedState
): Omit<SharedTrendConfig, 'updatedAt'> => ({
  selectedVarIds: config.selectedVarIds,
  selectedManualIds: config.selectedManualIds,
  timeRange: config.timeRange,
  rangeMode: config.rangeMode,
  customRange: config.customRange,
  yAxisScale: config.yAxisScale,
  seriesColorOverrides: config.seriesColorOverrides
})

const persistTrendConfig = (config: TrendScreenPersistedState): void => {
  if (!isBrowser()) return
  try {
    localStorage.setItem(TREND_STORAGE_KEY, JSON.stringify(config))
  } catch (err) {
    console.warn('Failed to persist trend configuration', err)
  }
}

const persistEmailList = (emails: string[]): void => {
  if (!isBrowser()) return
  try {
    localStorage.setItem(EMAIL_STORAGE_KEY, JSON.stringify(emails))
  } catch (err) {
    console.warn('Failed to persist email list for report', err)
  }
}

const persistReportMeta = (meta: TrendReportPersistedMeta): void => {
  if (!isBrowser()) return
  try {
    localStorage.setItem(REPORT_META_STORAGE_KEY, JSON.stringify(meta))
  } catch (err) {
    console.warn('Failed to persist report metadata', err)
  }
}

const MOTOR_SCOPES: MotorScope[] = [1, 2]

export const useTrendScreenState = () => {
  const { isViewOnly } = useAccessMode()
  const [motorControlMode] = useMotorControlModePreference()
  const singleMotorScope = usePreferredSingleMotorScope()
  const [temperatureUnit] = useTemperatureUnitPreference()
  const displayNameOverrides = useWagoDisplayNameOverrides()
  const isDualMotorMode = motorControlMode === 'dual'
  const activeSingleMotorScope: MotorScope = singleMotorScope
  const shouldLoadMotorOneTrendData = isDualMotorMode || activeSingleMotorScope === 1
  const shouldLoadMotorTwoTrendData = isDualMotorMode || activeSingleMotorScope === 2
  const storedConfig = useMemo(() => loadPersistedTrendConfig(), [])
  const storedEmails = useMemo(() => loadPersistedEmailList(), [])
  const storedReportMeta = useMemo(() => loadPersistedReportMeta(), [])
  const initialTimeRange = storedConfig?.timeRange ?? DEFAULT_TIME_RANGE
  const initialCustomRange = storedConfig?.customRange
  const initialRangeDraft = initialCustomRange ?? buildRelativeRangeInput(initialTimeRange)

  // Base state
  const [selectedVarIds, setSelectedVarIds] = useState<TrendVariableId[]>(
    storedConfig?.selectedVarIds ?? DEFAULT_SELECTED_VAR_IDS
  )
  const [timeRange, setTimeRange] = useState<number>(initialTimeRange)
  const [rangeMode, setRangeMode] = useState<TrendRangeMode>(storedConfig?.rangeMode ?? 'relative')
  const [customRange, setCustomRange] = useState<TrendCustomRange | null>(
    initialCustomRange ?? null
  )
  const [customRangeDraft, setCustomRangeDraft] = useState<TrendCustomRange>(initialRangeDraft)
  const [yAxisScale, setYAxisScale] = useState<TrendYAxisScaleState>(
    storedConfig?.yAxisScale ?? DEFAULT_Y_AXIS_SCALE
  )
  const [seriesColorOverrides, setSeriesColorOverrides] = useState<TrendSeriesColorOverrides>(
    storedConfig?.seriesColorOverrides ?? {}
  )
  const [activePanel, setActivePanel] = useState<
    'none' | 'variables' | 'manual' | 'report' | 'scale'
  >('none')

  // Derived states for backward compatibility
  const isConfigOpen = activePanel === 'variables'
  const isReportOpen = activePanel === 'report'
  const isManualPanelOpen = activePanel === 'manual'
  const isScalePanelOpen = activePanel === 'scale'

  const setIsConfigOpen = (val: boolean | ((prev: boolean) => boolean)): void => {
    const next = typeof val === 'function' ? val(activePanel === 'variables') : val
    setActivePanel(next ? 'variables' : 'none')
  }

  const setIsReportOpen = (val: boolean | ((prev: boolean) => boolean)): void => {
    const next = typeof val === 'function' ? val(activePanel === 'report') : val
    setActivePanel(next ? 'report' : 'none')
  }

  const setIsManualPanelOpen = (val: boolean | ((prev: boolean) => boolean)): void => {
    const next = typeof val === 'function' ? val(activePanel === 'manual') : val
    setActivePanel(next ? 'manual' : 'none')
  }

  const setIsScalePanelOpen = (val: boolean | ((prev: boolean) => boolean)): void => {
    const next = typeof val === 'function' ? val(activePanel === 'scale') : val
    setActivePanel(next ? 'scale' : 'none')
  }

  // Report state
  const [emailList, setEmailList] = useState<string[]>(storedEmails ?? ['admin@plant.com'])
  const [newEmail, setNewEmailValue] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [reportSubject, setReportSubject] = useState<string>(storedReportMeta?.subject ?? '')
  const [reportNote, setReportNote] = useState<string>(storedReportMeta?.note ?? '')
  const [privateMode, setPrivateMode] = useState<boolean>(storedReportMeta?.privateMode ?? false)
  const [excelSampleIntervalValue, setExcelSampleIntervalValue] = useState<number>(
    storedReportMeta?.excelSampleIntervalValue ?? DEFAULT_EXCEL_SAMPLE_INTERVAL_VALUE
  )
  const [excelSampleIntervalUnit, setExcelSampleIntervalUnit] = useState<ExcelSampleIntervalUnit>(
    storedReportMeta?.excelSampleIntervalUnit ?? DEFAULT_EXCEL_SAMPLE_INTERVAL_UNIT
  )

  // Manual trend state
  const [manualSeries, setManualSeries] = useState<ManualTrendSeries[]>([])
  const [selectedManualIds, setSelectedManualIds] = useState<number[]>(
    storedConfig?.selectedManualIds ?? []
  )
  const [hasLoadedManualSeries, setHasLoadedManualSeries] = useState(false)
  const [manualPoints, setManualPoints] = useState<ManualTrendPoint[]>([])
  const [manualPointsSeriesId, setManualPointsSeriesId] = useState<number | null>(null)
  const [isManualSubmitting, setIsManualSubmitting] = useState(false)
  const [manualMode, setManualMode] = useState<ManualMode>('existing')
  const [manualForm, setManualForm] = useState<ManualFormState>({
    seriesId: undefined,
    name: '',
    unit: '',
    color: MANUAL_COLORS[0],
    value: '',
    time: nowLocalInput(),
    note: '',
    createdBy: '',
    pointId: undefined
  })

  const validatedCustomRange = useMemo(
    () => validateTrendCustomRange(customRangeDraft),
    [customRangeDraft]
  )
  const activeCustomRange = useMemo(() => {
    if (rangeMode !== 'absolute' || !customRange) return null

    const validation = validateTrendCustomRange(customRange)
    if (!validation.ok) return null

    return {
      ...validation,
      startTime: validation.startDate.toISOString(),
      endTime: validation.endDate.toISOString()
    }
  }, [customRange, rangeMode])
  const effectiveTimeRange = activeCustomRange?.durationMinutes ?? timeRange
  const activeRangeSummary = useMemo(
    () => formatTrendRangeSummary(rangeMode === 'absolute' ? customRange : null),
    [customRange, rangeMode]
  )
  const customRangeError = validatedCustomRange.ok ? null : validatedCustomRange.error
  const canApplyCustomRange =
    validatedCustomRange.ok &&
    (rangeMode !== 'absolute' ||
      customRange?.start !== validatedCustomRange.normalized.start ||
      customRange?.end !== validatedCustomRange.normalized.end)
  const maxRangeDateTime = nowLocalMinuteInput()

  useEffect(() => {
    if (customRange) return
    setCustomRangeDraft(buildRelativeRangeInput(timeRange))
  }, [customRange, timeRange])

  // Data hooks
  const selectedDriveVarIds = useMemo(
    () =>
      selectedVarIds.filter((id): id is ParameterId => {
        const variable = TREND_AVAILABLE_VARIABLES_BY_ID.get(id)
        return variable?.deviceRole === 'drive' && variable.dataSource === 'backend'
      }),
    [selectedVarIds]
  )

  const selectedWagoVarIds = useMemo(
    () =>
      selectedVarIds.filter((id): id is ParameterId => {
        const variable = TREND_AVAILABLE_VARIABLES_BY_ID.get(id)
        return variable?.deviceRole === 'wago' && variable.dataSource === 'backend'
      }),
    [selectedVarIds]
  )
  const selectedWagoIoVarIds = useMemo(
    () => selectedVarIds.filter((id): id is WagoIoTrendVariableId => isWagoIoTrendVariableId(id)),
    [selectedVarIds]
  )
  const selectedMainTemperatureVarIds = useMemo(
    () =>
      selectedWagoVarIds.filter((id) => MAIN_SCREEN_TEMPERATURE_PARAMETER_ID_SET.has(id)),
    [selectedWagoVarIds]
  )
  const selectedLiveWagoVarIds = useMemo(
    () => selectedWagoVarIds.filter((id) => CORRECTED_WAGO_LIVE_TREND_PARAMETER_ID_SET.has(id)),
    [selectedWagoVarIds]
  )
  const selectedLegacyWagoVarIds = useMemo(
    () =>
      selectedWagoVarIds.filter(
        (id) =>
          !CORRECTED_WAGO_LIVE_TREND_PARAMETER_ID_SET.has(id) &&
          !MAIN_SCREEN_TEMPERATURE_PARAMETER_ID_SET.has(id)
      ),
    [selectedWagoVarIds]
  )

  const motorOneDriveId = getMotorDriveDeviceId(1)
  const motorOneWagoId = getMotorWagoDeviceId(1)
  const motorOneWagoLiveTrendId = getMotorWagoLiveDeviceId(1)
  const motorTwoDriveId = getMotorDriveDeviceId(2)
  const motorTwoWagoId = getMotorWagoDeviceId(2)
  const motorTwoWagoLiveTrendId = getMotorWagoLiveDeviceId(2)

  const { datasets: motorOneDriveSensorDatasets, xDomain: motorOneDriveXDomain } = useTrendData(
    motorOneDriveId,
    shouldLoadMotorOneTrendData ? selectedDriveVarIds : [],
    {
      windowMinutes: effectiveTimeRange,
      startTime: activeCustomRange?.startTime,
      endTime: activeCustomRange?.endTime,
      realtime: rangeMode === 'relative'
    }
  )

  const { datasets: motorOneWagoSensorDatasets, xDomain: motorOneWagoXDomain } = useTrendData(
    motorOneWagoId,
    shouldLoadMotorOneTrendData ? selectedLegacyWagoVarIds : [],
    {
      windowMinutes: effectiveTimeRange,
      startTime: activeCustomRange?.startTime,
      endTime: activeCustomRange?.endTime,
      realtime: rangeMode === 'relative'
    }
  )

  const { datasets: motorOneWagoLiveSensorDatasets, xDomain: motorOneWagoLiveXDomain } =
    useTrendData(
      motorOneWagoLiveTrendId,
      shouldLoadMotorOneTrendData ? selectedLiveWagoVarIds : [],
      {
        windowMinutes: effectiveTimeRange,
        startTime: activeCustomRange?.startTime,
        endTime: activeCustomRange?.endTime,
        realtime: rangeMode === 'relative'
      }
    )
  const { datasets: motorOneMainTemperatureDatasets, xDomain: motorOneMainTemperatureXDomain } =
    useMainTemperatureTrendData(
      motorOneWagoLiveTrendId,
      1,
      shouldLoadMotorOneTrendData ? selectedMainTemperatureVarIds : [],
      {
        windowMinutes: effectiveTimeRange,
        startTime: activeCustomRange?.startTime,
        endTime: activeCustomRange?.endTime,
        realtime: rangeMode === 'relative'
      }
    )

  const { datasets: motorTwoDriveSensorDatasets, xDomain: motorTwoDriveXDomain } = useTrendData(
    motorTwoDriveId,
    shouldLoadMotorTwoTrendData ? selectedDriveVarIds : [],
    {
      windowMinutes: effectiveTimeRange,
      startTime: activeCustomRange?.startTime,
      endTime: activeCustomRange?.endTime,
      realtime: rangeMode === 'relative'
    }
  )

  const { datasets: motorTwoWagoSensorDatasets, xDomain: motorTwoWagoXDomain } = useTrendData(
    motorTwoWagoId,
    shouldLoadMotorTwoTrendData ? selectedLegacyWagoVarIds : [],
    {
      windowMinutes: effectiveTimeRange,
      startTime: activeCustomRange?.startTime,
      endTime: activeCustomRange?.endTime,
      realtime: rangeMode === 'relative'
    }
  )

  const { datasets: motorTwoWagoLiveSensorDatasets, xDomain: motorTwoWagoLiveXDomain } =
    useTrendData(
      motorTwoWagoLiveTrendId,
      shouldLoadMotorTwoTrendData ? selectedLiveWagoVarIds : [],
      {
        windowMinutes: effectiveTimeRange,
        startTime: activeCustomRange?.startTime,
        endTime: activeCustomRange?.endTime,
        realtime: rangeMode === 'relative'
      }
    )
  const { datasets: motorTwoMainTemperatureDatasets, xDomain: motorTwoMainTemperatureXDomain } =
    useMainTemperatureTrendData(
      motorTwoWagoLiveTrendId,
      2,
      shouldLoadMotorTwoTrendData ? selectedMainTemperatureVarIds : [],
      {
        windowMinutes: effectiveTimeRange,
        startTime: activeCustomRange?.startTime,
        endTime: activeCustomRange?.endTime,
        realtime: rangeMode === 'relative'
      }
    )

  const { datasets: motorOneWagoIoDatasets, xDomain: motorOneWagoIoXDomain } = useWagoIoTrendData(
    motorOneWagoId,
    shouldLoadMotorOneTrendData ? selectedWagoIoVarIds : [],
    {
      windowMinutes: effectiveTimeRange,
      startTime: activeCustomRange?.startTime,
      endTime: activeCustomRange?.endTime,
      realtime: true,
      temperatureUnit
    }
  )

  const { datasets: motorTwoWagoIoDatasets, xDomain: motorTwoWagoIoXDomain } = useWagoIoTrendData(
    motorTwoWagoId,
    shouldLoadMotorTwoTrendData ? selectedWagoIoVarIds : [],
    {
      windowMinutes: effectiveTimeRange,
      startTime: activeCustomRange?.startTime,
      endTime: activeCustomRange?.endTime,
      realtime: true,
      temperatureUnit
    }
  )

  const motorOneSensorDatasets = useMemo(() => {
    const sensorDatasetsById = new Map(
      [
        ...motorOneDriveSensorDatasets,
        ...motorOneWagoSensorDatasets,
        ...motorOneWagoLiveSensorDatasets,
        ...motorOneMainTemperatureDatasets,
        ...motorOneWagoIoDatasets
      ].map((dataset) => [dataset.parameterId, dataset] as const)
    )

    return selectedVarIds
      .map((id) => sensorDatasetsById.get(id))
      .filter((dataset): dataset is TrendSensorDataset => Boolean(dataset))
  }, [
    motorOneDriveSensorDatasets,
    motorOneWagoSensorDatasets,
    motorOneWagoLiveSensorDatasets,
    motorOneMainTemperatureDatasets,
    motorOneWagoIoDatasets,
    selectedVarIds
  ])

  const motorTwoSensorDatasets = useMemo(() => {
    const sensorDatasetsById = new Map(
      [
        ...motorTwoDriveSensorDatasets,
        ...motorTwoWagoSensorDatasets,
        ...motorTwoWagoLiveSensorDatasets,
        ...motorTwoMainTemperatureDatasets,
        ...motorTwoWagoIoDatasets
      ].map((dataset) => [dataset.parameterId, dataset] as const)
    )

    return selectedVarIds
      .map((id) => sensorDatasetsById.get(id))
      .filter((dataset): dataset is TrendSensorDataset => Boolean(dataset))
  }, [
    motorTwoDriveSensorDatasets,
    motorTwoWagoSensorDatasets,
    motorTwoWagoLiveSensorDatasets,
    motorTwoMainTemperatureDatasets,
    motorTwoWagoIoDatasets,
    selectedVarIds
  ])

  const sensorDatasets = isDualMotorMode
    ? motorOneSensorDatasets
    : activeSingleMotorScope === 2
      ? motorTwoSensorDatasets
      : motorOneSensorDatasets

  const xDomain = useMemo(() => {
    const sensorDomains = (
      isDualMotorMode
        ? [
            motorOneDriveXDomain,
            motorOneWagoXDomain,
            motorOneWagoLiveXDomain,
            motorOneMainTemperatureXDomain,
            motorOneWagoIoXDomain,
            motorTwoDriveXDomain,
            motorTwoWagoXDomain,
            motorTwoWagoLiveXDomain,
            motorTwoMainTemperatureXDomain,
            motorTwoWagoIoXDomain
          ]
        : activeSingleMotorScope === 2
          ? [
              motorTwoDriveXDomain,
              motorTwoWagoXDomain,
              motorTwoWagoLiveXDomain,
              motorTwoMainTemperatureXDomain,
              motorTwoWagoIoXDomain
            ]
          : [
              motorOneDriveXDomain,
              motorOneWagoXDomain,
              motorOneWagoLiveXDomain,
              motorOneMainTemperatureXDomain,
              motorOneWagoIoXDomain
            ]
    ).filter((domain): domain is { min: number; max: number } => Boolean(domain))

    if (!sensorDomains.length) {
      return activeCustomRange
        ? {
            min: activeCustomRange.startDate.getTime() / 1000,
            max: activeCustomRange.endDate.getTime() / 1000
          }
        : null
    }

    return {
      min: Math.min(...sensorDomains.map((domain) => domain.min)),
      max: Math.max(...sensorDomains.map((domain) => domain.max))
    }
  }, [
    motorOneDriveXDomain,
    motorOneWagoXDomain,
    motorOneWagoLiveXDomain,
    motorOneMainTemperatureXDomain,
    motorOneWagoIoXDomain,
    motorTwoDriveXDomain,
    motorTwoWagoXDomain,
    motorTwoWagoLiveXDomain,
    motorTwoMainTemperatureXDomain,
    motorTwoWagoIoXDomain,
    isDualMotorMode,
    activeSingleMotorScope,
    activeCustomRange
  ])

  const manualSelectedSeries = useMemo(
    () => manualSeries.filter((s) => selectedManualIds.includes(s.id)),
    [manualSeries, selectedManualIds]
  )

  const {
    datasets: manualDatasets,
    xDomain: manualXDomain,
    reload: reloadManualData
  } = useManualTrendData(manualSelectedSeries, {
    windowMinutes: effectiveTimeRange,
    startTime: activeCustomRange?.startTime,
    endTime: activeCustomRange?.endTime
  })

  useEffect(() => {
    const loadSeries = async (): Promise<void> => {
      try {
        const list = await fetchManualSeries()
        setManualSeries(list)
        setHasLoadedManualSeries(true)
        if (list.length && manualPointsSeriesId === null) {
          setManualPointsSeriesId(list[0].id)
        }
      } catch (err) {
        console.error('Failed to load manual series', err)
      }
    }
    void loadSeries()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!hasLoadedManualSeries) return
    setSelectedManualIds((prev) => {
      if (!prev.length && !manualSeries.length) return prev
      const validSet = new Set(manualSeries.map((series) => series.id))
      const filtered = prev.filter((id) => validSet.has(id))
      return filtered.length === prev.length ? prev : filtered
    })
  }, [manualSeries, hasLoadedManualSeries])

  useEffect(() => {
    if (!hasLoadedManualSeries) return

    setSeriesColorOverrides((prev) => {
      let changed = false
      const validManualIds = new Set(manualSeries.map((series) => series.id))
      const next: TrendSeriesColorOverrides = {}

      Object.entries(prev).forEach(([key, color]) => {
        if (key.startsWith('manual:')) {
          const manualId = Number(key.slice('manual:'.length))
          if (!validManualIds.has(manualId)) {
            changed = true
            return
          }
        }

        next[key] = color
      })

      return changed ? next : prev
    })
  }, [manualSeries, hasLoadedManualSeries])

  const getSeriesColorKeyForState = useCallback(
    (type: TrendSeriesColorType, id: string | number): string => getSeriesColorKey(type, id),
    []
  )

  const sensorBaseColorMap = useMemo(
    () =>
      new Map(TREND_AVAILABLE_VARIABLES.map((variable) => [variable.id, variable.color] as const)),
    []
  )

  const manualSeriesById = useMemo(
    () => new Map(manualSeries.map((series) => [series.id, series] as const)),
    [manualSeries]
  )

  const getEffectiveSensorColor = useCallback(
    (id: TrendVariableId): string =>
      seriesColorOverrides[getSeriesColorKeyForState('sensor', id)] ??
      sensorBaseColorMap.get(id) ??
      TREND_COLOR_PALETTE[0],
    [seriesColorOverrides, getSeriesColorKeyForState, sensorBaseColorMap]
  )

  const getEffectiveManualColor = useCallback(
    (id: number): string =>
      seriesColorOverrides[getSeriesColorKeyForState('manual', id)] ??
      manualSeriesById.get(id)?.color ??
      TREND_COLOR_PALETTE[0],
    [seriesColorOverrides, getSeriesColorKeyForState, manualSeriesById]
  )

  const setSeriesColorOverride = useCallback(
    (type: TrendSeriesColorType, id: string | number, color: string): void => {
      if (isViewOnly) return
      if (!TREND_COLOR_SET.has(color)) return

      const key = getSeriesColorKeyForState(type, id)
      setSeriesColorOverrides((prev) => (prev[key] === color ? prev : { ...prev, [key]: color }))
    },
    [getSeriesColorKeyForState, isViewOnly]
  )

  const clearSeriesColorOverride = useCallback(
    (type: TrendSeriesColorType, id: string | number): void => {
      if (isViewOnly) return
      const key = getSeriesColorKeyForState(type, id)
      setSeriesColorOverrides((prev) => {
        if (!(key in prev)) return prev
        const next = { ...prev }
        delete next[key]
        return next
      })
    },
    [getSeriesColorKeyForState, isViewOnly]
  )

  const updateCustomRangeDraft = useCallback(
    (field: keyof TrendCustomRange, value: string): void => {
      setCustomRangeDraft((prev) => (prev[field] === value ? prev : { ...prev, [field]: value }))
    },
    []
  )

  const applyCustomRange = useCallback((): boolean => {
    if (!validatedCustomRange.ok) return false

    setCustomRange(validatedCustomRange.normalized)
    setRangeMode('absolute')
    return true
  }, [validatedCustomRange])

  const clearCustomRange = useCallback((): void => {
    setRangeMode('relative')
  }, [])

  const selectRelativeTimeRange = useCallback((minutes: number): void => {
    setTimeRange(minutes)
    setRangeMode('relative')
  }, [])

  useEffect(() => {
    persistTrendConfig({
      selectedVarIds,
      selectedManualIds,
      timeRange,
      rangeMode,
      customRange,
      yAxisScale,
      seriesColorOverrides
    })
  }, [
    selectedVarIds,
    selectedManualIds,
    timeRange,
    rangeMode,
    customRange,
    yAxisScale,
    seriesColorOverrides
  ])

  useEffect(() => {
    if (isViewOnly) return

    const payload = toSharedTrendConfigPayload({
      selectedVarIds,
      selectedManualIds,
      timeRange,
      rangeMode,
      customRange,
      yAxisScale,
      seriesColorOverrides
    })

    void saveSharedTrendConfig(payload).catch((err) => {
      console.error('Failed to sync shared trend configuration', err)
    })
  }, [
    selectedVarIds,
    selectedManualIds,
    timeRange,
    rangeMode,
    customRange,
    yAxisScale,
    seriesColorOverrides,
    isViewOnly
  ])

  useEffect(() => {
    persistEmailList(emailList)
  }, [emailList])

  useEffect(() => {
    persistReportMeta({
      subject: reportSubject,
      note: reportNote,
      privateMode,
      excelSampleIntervalValue,
      excelSampleIntervalUnit
    })
  }, [reportSubject, reportNote, privateMode, excelSampleIntervalValue, excelSampleIntervalUnit])

  // Handlers
  const handleToggleVar = (id: TrendVariableId): void => {
    setSelectedVarIds((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]))
  }

  const handleToggleManualSeries = (id: number): void => {
    if (isViewOnly) return
    setSelectedManualIds((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    )
  }

  const loadManualPoints = useCallback(
    async (seriesId: number): Promise<void> => {
      try {
        const res = await fetchManualHistory({
          seriesId,
          limit: 200,
          windowMinutes: effectiveTimeRange,
          startTime: activeCustomRange?.startTime,
          endTime: activeCustomRange?.endTime
        })
        setManualPoints(res.points)
        setManualPointsSeriesId(seriesId)
      } catch (err) {
        console.error('Failed to load manual points', err)
      }
    },
    [effectiveTimeRange, activeCustomRange]
  )

  const resetManualForm = (): void => {
    setManualMode('new')
    setManualForm({
      seriesId: undefined,
      name: '',
      unit: '',
      color: MANUAL_COLORS[0],
      value: '',
      time: nowLocalInput(),
      note: '',
      createdBy: '',
      pointId: undefined
    })
  }

  const handleManualSubmit = async (): Promise<void> => {
    try {
      setIsManualSubmitting(true)

      let targetSeriesId = manualMode === 'existing' ? manualForm.seriesId : undefined

      if (!manualForm.value) {
        setIsManualSubmitting(false)
        return
      }

      if (manualMode === 'new') {
        if (!manualForm.name.trim()) {
          setIsManualSubmitting(false)
          return
        }

        const targetId = manualForm.seriesId
        if (targetId) {
          // Update existing series
          await updateManualSeries({
            seriesId: targetId,
            name: manualForm.name.trim(),
            unit: manualForm.unit || undefined,
            color: manualForm.color
          })
          const updatedList = await fetchManualSeries()
          setManualSeries(updatedList)
          targetSeriesId = targetId
        } else {
          // Create new series
          const created = await createManualSeries({
            name: manualForm.name.trim(),
            unit: manualForm.unit || undefined,
            color: manualForm.color
          })
          targetSeriesId = created.id
          setManualSeries((prev) => [...prev, created])
        }
      }

      if (!targetSeriesId) {
        setIsManualSubmitting(false)
        return
      }

      setManualPointsSeriesId(targetSeriesId)

      const payload = {
        seriesId: targetSeriesId,
        value: Number(manualForm.value),
        time: manualForm.time ? new Date(manualForm.time).toISOString() : undefined,
        note: manualForm.note || undefined,
        created_by: manualForm.createdBy || undefined
      }

      if (manualForm.pointId) {
        await updateManualPoint({ pointId: manualForm.pointId, ...payload })
        console.debug('[TrendScreen] manual point updated', {
          pointId: manualForm.pointId,
          payload
        })
      } else {
        const created = await createManualPoint(payload)
        console.debug('[TrendScreen] manual point created', created)
      }

      if (!selectedManualIds.includes(targetSeriesId)) {
        setSelectedManualIds((prev) => [...prev, targetSeriesId!])
      }

      await Promise.all([
        reloadManualData(),
        loadManualPoints(targetSeriesId),
        fetchManualSeries().then((list) => setManualSeries(list))
      ])

      resetManualForm()
    } catch (err) {
      console.error('Failed to save manual point', err)
    } finally {
      setIsManualSubmitting(false)
    }
  }

  const handleEditPoint = (point: ManualTrendPoint): void => {
    setManualMode('existing')
    setManualForm({
      seriesId: point.series_id,
      name: '',
      unit: '',
      color: manualSeries.find((s) => s.id === point.series_id)?.color || MANUAL_COLORS[0],
      value: String(point.value),
      time: formatLocalInputFromDate(new Date(point.time)),
      note: point.note || '',
      createdBy: point.created_by || '',
      pointId: point.id
    })
    if (!selectedManualIds.includes(point.series_id)) {
      setSelectedManualIds((prev) => [...prev, point.series_id])
    }
    setManualPointsSeriesId(point.series_id)
  }

  const handleDeletePoint = async (pointId: number): Promise<void> => {
    try {
      await deleteManualPoint(pointId)
      if (manualPointsSeriesId) {
        await Promise.all([loadManualPoints(manualPointsSeriesId), reloadManualData()])
      }
    } catch (err) {
      console.error('Failed to delete manual point', err)
    }
  }

  const handleEditSeries = (series: ManualTrendSeries): void => {
    setManualMode('new')
    setManualForm({
      seriesId: series.id,
      name: series.name,
      unit: series.unit || '',
      color: series.color,
      value: '',
      time: nowLocalInput(),
      note: '',
      createdBy: '',
      pointId: undefined
    })
  }

  const handleDeleteSeries = async (seriesId: number): Promise<void> => {
    try {
      await deleteManualSeries(seriesId)
      setSelectedManualIds((prev) => prev.filter((id) => id !== seriesId))
      setManualSeries((prev) => prev.filter((s) => s.id !== seriesId))
      if (manualPointsSeriesId === seriesId) {
        setManualPointsSeriesId(null)
        setManualPoints([])
      }
      await reloadManualData()
    } catch (err) {
      console.error('Failed to delete manual series', err)
    }
  }

  useEffect(() => {
    if (isManualPanelOpen && manualPointsSeriesId) {
      void loadManualPoints(manualPointsSeriesId)
    }
  }, [isManualPanelOpen, manualPointsSeriesId, loadManualPoints])

  const handleChangeNewEmail = (value: string): void => {
    setNewEmailValue(value)
    if (emailError) setEmailError(null)
  }

  const isNewEmailValid = useMemo(() => {
    const trimmed = newEmail.trim()
    if (!trimmed) return true
    return EMAIL_REGEX.test(normalizeEmail(trimmed))
  }, [newEmail])

  const handleAddEmail = (): void => {
    const normalized = normalizeEmail(newEmail)
    if (!normalized) {
      setEmailError('Email requerido')
      return
    }
    if (!EMAIL_REGEX.test(normalized)) {
      setEmailError('Invalid email')
      return
    }

    setEmailList((prev) => {
      const exists = prev.some((e) => normalizeEmail(e) === normalized)
      return exists ? prev : [...prev, normalized]
    })
    setNewEmailValue('')
    setEmailError(null)
  }

  const handleRemoveEmail = (email: string): void => {
    const normalized = normalizeEmail(email)
    setEmailList((prev) => prev.filter((e) => normalizeEmail(e) !== normalized))
  }

  const decorateSensorDatasetList = useCallback(
    (datasets: TrendSensorDataset[], labelPrefix?: string): ExtendedDataset[] =>
      datasets.map((ds) => {
        const meta = TREND_AVAILABLE_VARIABLES_BY_ID.get(ds.parameterId)
        const wagoIoMeta = getWagoIoTrendVariableMeta(ds.parameterId)
        const adjustedData = wagoIoMeta
          ? ds.data
          : ds.data.map((point) => ({
              ...point,
              y: applyVariableDisplayValue(ds.parameterId as ParameterId, point.y, temperatureUnit)
            }))
        const baseLabel = getTrendVariableLabel(ds.parameterId, displayNameOverrides)

        return {
          ...ds,
          data: adjustedData,
          label: labelPrefix ? `${labelPrefix} - ${baseLabel}` : baseLabel,
          unit: wagoIoMeta
            ? getWagoIoTrendVariableDisplayUnit(
                ds.parameterId as WagoIoTrendVariableId,
                temperatureUnit
              ) ||
              ds.unit ||
              null
            : getVariableDisplayUnit(
                ds.parameterId as ParameterId,
                meta?.unit || ds.unit || null,
                temperatureUnit
              ),
          borderColor: getEffectiveSensorColor(ds.parameterId)
        }
      }),
    [displayNameOverrides, getEffectiveSensorColor, temperatureUnit]
  )

  const decoratedMotorOneSensorDatasets = useMemo<ExtendedDataset[]>(
    () => decorateSensorDatasetList(motorOneSensorDatasets),
    [decorateSensorDatasetList, motorOneSensorDatasets]
  )

  const decoratedMotorTwoSensorDatasets = useMemo<ExtendedDataset[]>(
    () => decorateSensorDatasetList(motorTwoSensorDatasets),
    [decorateSensorDatasetList, motorTwoSensorDatasets]
  )

  const decoratedManualDatasets = useMemo<ExtendedDataset[]>(
    () =>
      manualDatasets.map((ds) => ({
        ...ds,
        label: ds.label || 'Manual series',
        unit: ds.unit || null,
        borderColor: getEffectiveManualColor(ds.seriesId)
      })),
    [manualDatasets, getEffectiveManualColor]
  )

  const motorOneCombinedDatasets = useMemo<ExtendedDataset[]>(
    () => [...decoratedMotorOneSensorDatasets, ...decoratedManualDatasets],
    [decoratedMotorOneSensorDatasets, decoratedManualDatasets]
  )

  const motorTwoCombinedDatasets = useMemo<ExtendedDataset[]>(
    () => [...decoratedMotorTwoSensorDatasets, ...decoratedManualDatasets],
    [decoratedMotorTwoSensorDatasets, decoratedManualDatasets]
  )

  const combinedDatasets = useMemo<ExtendedDataset[]>(
    () =>
      isDualMotorMode
        ? [
            ...decorateSensorDatasetList(
              motorOneSensorDatasets,
              getMotorScopeLabel(MOTOR_SCOPES[0])
            ),
            ...decorateSensorDatasetList(
              motorTwoSensorDatasets,
              getMotorScopeLabel(MOTOR_SCOPES[1])
            ),
            ...decoratedManualDatasets
          ]
        : activeSingleMotorScope === 2
          ? motorTwoCombinedDatasets
          : motorOneCombinedDatasets,
    [
      decorateSensorDatasetList,
      motorOneSensorDatasets,
      motorTwoSensorDatasets,
      decoratedManualDatasets,
      motorOneCombinedDatasets,
      motorTwoCombinedDatasets,
      isDualMotorMode,
      activeSingleMotorScope
    ]
  )

  const combinedXDomain = useMemo(() => {
    const domains = [xDomain, manualXDomain].filter(
      (domain): domain is { min: number; max: number } => Boolean(domain)
    )

    if (!domains.length) {
      return activeCustomRange
        ? {
            min: activeCustomRange.startDate.getTime() / 1000,
            max: activeCustomRange.endDate.getTime() / 1000
          }
        : null
    }

    return {
      min: Math.min(...domains.map((domain) => domain.min)),
      max: Math.max(...domains.map((domain) => domain.max))
    }
  }, [xDomain, manualXDomain, activeCustomRange])

  const buildCurrentValueItems = useCallback((datasets: ExtendedDataset[]): CurrentValueItem[] => {
    return datasets.map((ds) => {
      const latest = ds.data.length > 0 ? ds.data[ds.data.length - 1].y : 0
      const parameterId =
        'parameterId' in ds && typeof ds.parameterId === 'string'
          ? (ds.parameterId as TrendVariableId)
          : null
      const isManual = ds.isManual === true || !parameterId

      return {
        id: ds.label || parameterId || 'manual',
        label: ds.label || parameterId || 'manual',
        color: ds.borderColor,
        value: latest,
        unit: ds.unit,
        isManual
      }
    })
  }, [])

  const currentValues: CurrentValueItem[] = useMemo(
    () =>
      buildCurrentValueItems(
        isDualMotorMode
          ? combinedDatasets
          : activeSingleMotorScope === 2
            ? motorTwoCombinedDatasets
            : motorOneCombinedDatasets
      ),
    [
      buildCurrentValueItems,
      combinedDatasets,
      motorOneCombinedDatasets,
      motorTwoCombinedDatasets,
      isDualMotorMode,
      activeSingleMotorScope
    ]
  )

  const currentValuesByMotor = useMemo<Record<MotorScope, CurrentValueItem[]>>(
    () => ({
      1: buildCurrentValueItems(motorOneCombinedDatasets),
      2: buildCurrentValueItems(motorTwoCombinedDatasets)
    }),
    [buildCurrentValueItems, motorOneCombinedDatasets, motorTwoCombinedDatasets]
  )

  const yAxisScaleError = useMemo(() => {
    if (yAxisScale.mode !== 'manual') return null

    const hasMin = yAxisScale.min.trim().length > 0
    const hasMax = yAxisScale.max.trim().length > 0
    if (!hasMin && !hasMax) return null
    if (!hasMin || !hasMax) return 'Complete both Y-axis limits'

    const min = parseScaleNumber(yAxisScale.min)
    const max = parseScaleNumber(yAxisScale.max)
    if (min === null || max === null) return 'Use valid numeric values'
    if (min >= max) return 'Minimum must be smaller than maximum'

    return null
  }, [yAxisScale])

  const resolvedYAxisScale = useMemo(() => {
    if (yAxisScale.mode !== 'manual' || yAxisScaleError) return null

    const min = parseScaleNumber(yAxisScale.min)
    const max = parseScaleNumber(yAxisScale.max)
    if (min === null || max === null) return null

    return { min, max }
  }, [yAxisScale, yAxisScaleError])

  return {
    // base toggles
    timeRange,
    effectiveTimeRange,
    rangeMode,
    customRangeDraft,
    customRangeError,
    activeRangeSummary,
    canApplyCustomRange,
    maxRangeDateTime,
    setTimeRange: selectRelativeTimeRange,
    setCustomRangeDraft: updateCustomRangeDraft,
    applyCustomRange,
    clearCustomRange,
    isConfigOpen,
    setIsConfigOpen,
    isReportOpen,
    setIsReportOpen,
    isManualPanelOpen,
    setIsManualPanelOpen,
    isScalePanelOpen,
    setIsScalePanelOpen,

    // data
    selectedVarIds,
    handleToggleVar,
    sensorDatasets,
    xDomain,
    manualDatasets,
    manualXDomain,
    combinedDatasets,
    motorOneCombinedDatasets,
    motorTwoCombinedDatasets,
    combinedXDomain,
    currentValues,
    currentValuesByMotor,
    trendColorPalette: TREND_COLOR_PALETTE,
    getSeriesColorKey: getSeriesColorKeyForState,
    getEffectiveSensorColor,
    getEffectiveManualColor,
    setSeriesColorOverride,
    clearSeriesColorOverride,
    yAxisScale,
    setYAxisScale,
    yAxisScaleError,
    resolvedYAxisScale,

    // manual series
    manualSeries,
    selectedManualIds,
    handleToggleManualSeries,
    manualSelectedSeries,

    // manual points
    manualPoints,
    manualPointsSeriesId,
    setManualPointsSeriesId,
    loadManualPoints,
    isManualSubmitting,
    manualMode,
    setManualMode,
    manualForm,
    setManualForm,
    resetManualForm,
    handleManualSubmit,
    handleEditPoint,
    handleDeletePoint,
    handleEditSeries,
    handleDeleteSeries,

    // report/email
    emailList,
    newEmail,
    setNewEmail: handleChangeNewEmail,
    isNewEmailValid,
    emailError,
    handleAddEmail,
    handleRemoveEmail,
    isSending,
    setIsSending,
    reportSubject,
    setReportSubject,
    reportNote,
    setReportNote,
    privateMode,
    setPrivateMode,
    excelSampleIntervalValue,
    setExcelSampleIntervalValue,
    excelSampleIntervalUnit,
    setExcelSampleIntervalUnit,

    // meta
    reloadManualData
  }
}
