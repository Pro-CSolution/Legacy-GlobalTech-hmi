import {
  DEVICE_PARAMETERS,
  PARAMETER_IDS,
  PARAMETER_META,
  type DeviceId,
  ParameterId
} from 'types/generated/devices'
import {
  getTemperatureUnitLabel,
  toBaseCelsiusTemperature,
  toDisplayTemperature,
  type TemperatureUnit
} from 'hooks/useTemperatureUnitPreference'
import { getMotorDeviceRole, type MotorDeviceRole } from 'utils/motorDeviceMapping'
import {
  WAGO_LIVE_ROWS,
  type WagoMonitorGroupLabel,
  type WagoSpreadsheetRow
} from '../WagoLiveScreen/wagoSpreadsheetRows'
import {
  formatWagoTemperatureSpareSignalLabel,
  toWagoTemperatureSpareFahrenheit,
  WAGO_TEMPERATURE_SPARE_ROWS
} from '../WagoLiveScreen/wagoTemperatureSpares'
import {
  getWagoTransducerSpec,
  isWagoTransducerTag,
  scaleWagoTransducerRawValue,
  type WagoTransducerTag
} from '../WagoLiveScreen/wagoTransducerScaling'
import type { TrendCustomRange } from './types'

type VariableCategory =
  | 'Main'
  | 'Electrical'
  | 'Drive'
  | 'Temperature'
  | 'IGBT'
  | 'Mechanical'
  | 'Cooling'
  | 'Control'
  | 'Diagnostics'
  | 'Status'
  | 'Process'
  | 'WAGO I/O'
  | 'Temperatures Spares'

export type WagoIoRawTrendVariableId = `WAGO_IO:${string}`
export type WagoTemperatureSpareTrendVariableId = `WAGO_TEMP_SPARE:${string}`
export type WagoIoTrendVariableId = WagoIoRawTrendVariableId | WagoTemperatureSpareTrendVariableId
export type TrendVariableId = ParameterId | WagoIoTrendVariableId
type AvailableVariableDataSource = 'backend' | 'wago-io-live'

type WagoIoDisplayTransform = 'temperature-spare' | 'transducer'

type WagoIoVariableMeta = {
  rowId: string
  signalCode: string
  signalType: WagoMonitorGroupLabel
  plcTagNumber: number
  signalIndex: number
  modbusRegister: number
  sourceRegisterType: WagoSpreadsheetRow['sourceRegisterType']
  sourceAddress: number
  defaultName: string
  unit: string
  category: VariableCategory
  displayLabel?: string
  displayTransform?: WagoIoDisplayTransform
  transducerTag?: WagoTransducerTag
}

const CATEGORY_ORDER: VariableCategory[] = [
  'Main',
  'Electrical',
  'Drive',
  'Temperature',
  'IGBT',
  'Mechanical',
  'Cooling',
  'Control',
  'Diagnostics',
  'Status',
  'Process',
  'WAGO I/O',
  'Temperatures Spares'
]

const CATEGORY_HUES: Record<VariableCategory, number> = {
  Main: 195,
  Electrical: 205,
  Drive: 265,
  Temperature: 8,
  IGBT: 348,
  Mechanical: 140,
  Cooling: 188,
  Control: 32,
  Diagnostics: 332,
  Status: 92,
  Process: 54,
  'WAGO I/O': 24,
  'Temperatures Spares': 8
}

const WAGO_IO_TREND_VARIABLE_PREFIX = 'WAGO_IO:'
const WAGO_TEMPERATURE_SPARE_TREND_VARIABLE_PREFIX = 'WAGO_TEMP_SPARE:'
const WAGO_COIL_MODBUS_BASE = 30511

const getWagoSignalPrefix = (group: WagoMonitorGroupLabel): 'AI' | 'DI' | 'DO' | 'AO' => {
  switch (group) {
    case 'Analog Input':
      return 'AI'
    case 'Digital Input':
      return 'DI'
    case 'Digital Output':
      return 'DO'
    case 'Analog Output':
      return 'AO'
  }
}

const getWagoSignalCode = (group: WagoMonitorGroupLabel, signalIndex: number): string =>
  `${getWagoSignalPrefix(group)}${String(signalIndex).padStart(2, '0')}`

const getWagoSourceAddress = (row: WagoSpreadsheetRow): number =>
  row.sourceRegisterType === 'coil' ? row.modbusRegister - WAGO_COIL_MODBUS_BASE : row.sourceOffset

const toWagoIoTrendVariableId = (row: WagoSpreadsheetRow): WagoIoRawTrendVariableId =>
  `${WAGO_IO_TREND_VARIABLE_PREFIX}${row.id}` as WagoIoRawTrendVariableId

const toWagoTemperatureSpareTrendVariableId = (
  row: WagoSpreadsheetRow
): WagoTemperatureSpareTrendVariableId =>
  `${WAGO_TEMPERATURE_SPARE_TREND_VARIABLE_PREFIX}${row.id}` as WagoTemperatureSpareTrendVariableId

export const isWagoIoTrendVariableId = (value: string): value is WagoIoTrendVariableId =>
  value.startsWith(WAGO_IO_TREND_VARIABLE_PREFIX) ||
  value.startsWith(WAGO_TEMPERATURE_SPARE_TREND_VARIABLE_PREFIX)

const WAGO_IO_VARIABLE_META_BY_ID = new Map<WagoIoTrendVariableId, WagoIoVariableMeta>(
  (() => {
    const signalCountByGroup = new Map<WagoMonitorGroupLabel, number>()

    const rawEntries = WAGO_LIVE_ROWS.map((row) => {
      const signalIndex = signalCountByGroup.get(row.group) ?? 0
      signalCountByGroup.set(row.group, signalIndex + 1)

      const id = toWagoIoTrendVariableId(row)
      const transducerTag = isWagoTransducerTag(row.tag) ? row.tag : null
      const transducerSpec = transducerTag ? getWagoTransducerSpec(transducerTag) : null

      return [
        id,
        {
          rowId: row.id,
          signalCode: getWagoSignalCode(row.group, signalIndex),
          signalType: row.group,
          plcTagNumber: signalIndex + 1,
          signalIndex,
          modbusRegister: row.modbusRegister,
          sourceRegisterType: row.sourceRegisterType,
          sourceAddress: getWagoSourceAddress(row),
          defaultName: row.name,
          unit: transducerSpec?.unit ?? row.unit,
          category: transducerSpec ? 'Main' : 'WAGO I/O',
          displayLabel: transducerSpec?.label,
          displayTransform: transducerSpec ? 'transducer' : undefined,
          transducerTag: transducerTag ?? undefined
        }
      ] as const
    })

    const temperatureSpareEntries = WAGO_TEMPERATURE_SPARE_ROWS.map((row) => {
      const id = toWagoTemperatureSpareTrendVariableId(row)

      return [
        id,
        {
          rowId: row.id,
          signalCode: formatWagoTemperatureSpareSignalLabel(row.sourceOffset),
          signalType: row.group,
          plcTagNumber: row.sourceOffset + 1,
          signalIndex: row.sourceOffset,
          modbusRegister: row.modbusRegister,
          sourceRegisterType: row.sourceRegisterType,
          sourceAddress: getWagoSourceAddress(row),
          defaultName: row.name,
          unit: getTemperatureUnitLabel('fahrenheit'),
          category: 'Temperatures Spares',
          displayTransform: 'temperature-spare'
        }
      ] as const
    })

    return [...rawEntries, ...temperatureSpareEntries]
  })()
)

export const getWagoIoTrendVariableMeta = (id: TrendVariableId): WagoIoVariableMeta | undefined =>
  isWagoIoTrendVariableId(id) ? WAGO_IO_VARIABLE_META_BY_ID.get(id) : undefined

export const getWagoIoTrendVariableDisplayValue = (
  id: WagoIoTrendVariableId,
  value: number,
  temperatureUnit: TemperatureUnit
): number => {
  const meta = WAGO_IO_VARIABLE_META_BY_ID.get(id)
  if (!meta || !Number.isFinite(value)) {
    return value
  }

  if (meta.displayTransform === 'transducer' && meta.transducerTag) {
    return scaleWagoTransducerRawValue(meta.transducerTag, value)
  }

  if (meta.displayTransform !== 'temperature-spare') {
    return value
  }

  const fahrenheitValue = toWagoTemperatureSpareFahrenheit(value)
  if (temperatureUnit === 'fahrenheit') {
    return fahrenheitValue
  }

  return toBaseCelsiusTemperature(fahrenheitValue, 'fahrenheit') ?? fahrenheitValue
}

export const getWagoIoTrendVariableDisplayUnit = (
  id: WagoIoTrendVariableId,
  temperatureUnit: TemperatureUnit
): string => {
  const meta = WAGO_IO_VARIABLE_META_BY_ID.get(id)
  if (meta?.displayTransform === 'temperature-spare') {
    return getTemperatureUnitLabel(temperatureUnit)
  }

  return meta?.unit ?? ''
}

const getWagoIoVariableLabel = (
  id: WagoIoTrendVariableId,
  overrides?: Record<string, string>
): string => {
  const meta = WAGO_IO_VARIABLE_META_BY_ID.get(id)
  if (!meta) return id

  const displayName = overrides?.[meta.rowId]?.trim() || meta.displayLabel || meta.defaultName
  return meta.category === 'Main' ? displayName : `${meta.signalCode} ${displayName}`
}

export const getTrendVariableLabel = (
  id: TrendVariableId,
  overrides?: Record<string, string>
): string => {
  if (isWagoIoTrendVariableId(id)) {
    return getWagoIoVariableLabel(id, overrides)
  }

  return toVariableLabel(id)
}

const CATEGORY_OVERRIDES: Partial<Record<ParameterId, VariableCategory>> = {
  'P1.00': 'Main',
  'P1.01': 'Main',
  'P1.02': 'Main',
  'P1.03': 'Main',
  'P1.04': 'Main',
  'P1.05': 'Main',
  'P9.03': 'Main',
  'P9.04': 'Main',
  'P11.03': 'Main',
  Coolant_Temp_DEGF: 'Main',
  Motor_Bearing_DE_DEGF: 'Main',
  Motor_Bearing_NDE_DEGF: 'Main',
  Motor_Winding_A2_DEGF: 'Main',
  Motor_Winding_B2_DEGF: 'Main',
  Motor_Winding_C2_DEGF: 'Main',
  'P45.00': 'IGBT',
  'P45.01': 'IGBT',
  'P45.02': 'IGBT',
  'P45.03': 'IGBT',
  'P45.04': 'IGBT',
  'P45.05': 'IGBT',
  'P45.06': 'IGBT',
  'P45.07': 'IGBT',
  'P45.08': 'IGBT',
  'P45.09': 'IGBT',
  'P45.10': 'IGBT',
  'P45.11': 'IGBT',
  'P45.12': 'IGBT',
  'P45.13': 'IGBT',
  'P45.14': 'IGBT',
  'P45.15': 'IGBT',
  'P45.16': 'IGBT',
  'P45.17': 'IGBT',
  'P45.18': 'IGBT',
  'P45.19': 'IGBT',
  'P45.20': 'IGBT',
  'P45.21': 'IGBT',
  Auto_Speed_SP1: 'Process',
  CoolPump1_HMI_Start: 'Cooling',
  CoolPump1_HMI_Stop: 'Cooling',
  CoolPump2_HMI_Start: 'Cooling',
  CoolPump2_HMI_Stop: 'Cooling',
  Coolant_Pump1_Run: 'Cooling',
  Coolant_Pump2_Run: 'Cooling',
  Cooling_Water_Press: 'Cooling',
  'Drive_Cooland Pump_Auto': 'Cooling',
  'Drive_Coolant Leak_Sw': 'Cooling',
  Drive_Coolant_Flow_Sw: 'Cooling',
  Drive_Coolant_Pressure_Sw: 'Cooling',
  Drive_Coolant_Pump1_Running: 'Cooling',
  Drive_Coolant_Pump2_Running: 'Cooling',
  Drive_Coolant_Pump_Sw: 'Cooling',
  Drive_Cooling_Temp: 'Temperature',
  Main_CB_Closed_Light: 'Status',
  Motor_Heater_Ctrl: 'Control',
  RB_Blower_Start: 'Cooling',
  RB_Breaker_Close: 'Status',
  RB_Breaker_Open: 'Status',
  RB_Drive_OK: 'Status',
  RB_Drive_Reset: 'Control',
  RB_Drive_Running: 'Status',
  RB_Drive_Start: 'Control',
  RB_Estop_Reset: 'Control',
  RB_Estop_Status: 'Status',
  RB_Local_Control: 'Control',
  RB_Main_Brk_Close: 'Control',
  RB_Main_Brk_Open: 'Control',
  RB_Precharge_OK: 'Status',
  RB_Remote_Control: 'Control',
  Remote_Speed_In: 'Drive',
  Speed_Out_Drive: 'Drive',
  Supply_480VAC_On: 'Electrical',
  Temp_Bearing_DE: 'Temperature',
  Temp_Bearing_NDE: 'Temperature',
  Temp_Winding_A1: 'Temperature',
  Temp_Winding_B1: 'Temperature',
  Temp_Winding_C1: 'Temperature',
  Trans_Cooling_Start: 'Cooling',
  'P5.22': 'Process',
  'P10.34': 'Diagnostics'
}

type VariableDisplayOverride = {
  label?: string
  unit?: string
  displayValueOffsetCelsius?: number
  followTemperatureScreenUnit?: boolean
  baseTemperatureUnit?: TemperatureUnit
  normalizeRawValue?: (value: number) => number
}

const normalizeCoolantTemperatureRawValue = (value: number): number =>
  Math.abs(value) >= 1000 ? value / 100 : value

const normalizeCoolantPressureRawValue = (value: number): number =>
  Math.abs(value) >= 150 ? value / 10 : value

const VARIABLE_DISPLAY_OVERRIDES: Partial<Record<ParameterId, VariableDisplayOverride>> = {
  Coolant_Temp_DEGF: {
    label: 'Coolant Temp',
    normalizeRawValue: normalizeCoolantTemperatureRawValue
  },
  Coolant_Pressure_PSI: {
    label: 'Coolant Pressure',
    unit: 'PSI',
    normalizeRawValue: normalizeCoolantPressureRawValue
  },
  Motor_Bearing_DE_DEGF: {
    label: 'Drive End'
  },
  Motor_Bearing_NDE_DEGF: {
    label: 'Non-Drive End'
  },
  Motor_Winding_A2_DEGF: {
    label: 'Winding A2'
  },
  Motor_Winding_B2_DEGF: {
    label: 'Winding B2'
  },
  Motor_Winding_C2_DEGF: {
    label: 'Winding C2'
  },
  Temp_Bearing_DE: {
    unit: 'deg C',
    displayValueOffsetCelsius: -20,
    followTemperatureScreenUnit: true,
    baseTemperatureUnit: 'celsius'
  },
  Temp_Bearing_NDE: {
    unit: 'deg C',
    displayValueOffsetCelsius: -20,
    followTemperatureScreenUnit: true,
    baseTemperatureUnit: 'celsius'
  },
  Temp_Winding_A1: {
    label: 'Temp Winding A2',
    unit: 'deg C',
    displayValueOffsetCelsius: -20,
    followTemperatureScreenUnit: true,
    baseTemperatureUnit: 'celsius'
  },
  Temp_Winding_B1: {
    label: 'Temp Winding B2',
    unit: 'deg C',
    displayValueOffsetCelsius: -20,
    followTemperatureScreenUnit: true,
    baseTemperatureUnit: 'celsius'
  },
  Temp_Winding_C1: {
    label: 'Temp Winding C2',
    unit: 'deg C',
    displayValueOffsetCelsius: -20,
    followTemperatureScreenUnit: true,
    baseTemperatureUnit: 'celsius'
  },
  Drive_Cooling_Temp: {
    unit: 'deg C',
    followTemperatureScreenUnit: true,
    baseTemperatureUnit: 'celsius'
  },
  'P45.00': {
    unit: 'deg C',
    followTemperatureScreenUnit: true,
    baseTemperatureUnit: 'celsius'
  },
  'P45.01': {
    unit: 'deg C',
    followTemperatureScreenUnit: true,
    baseTemperatureUnit: 'celsius'
  },
  'P45.02': {
    unit: 'deg C',
    followTemperatureScreenUnit: true,
    baseTemperatureUnit: 'celsius'
  },
  'P45.07': {
    unit: 'deg C',
    followTemperatureScreenUnit: true,
    baseTemperatureUnit: 'celsius'
  },
  'P45.08': {
    unit: 'deg C',
    followTemperatureScreenUnit: true,
    baseTemperatureUnit: 'celsius'
  },
  'P45.09': {
    unit: 'deg C',
    followTemperatureScreenUnit: true,
    baseTemperatureUnit: 'celsius'
  },
  'P45.10': {
    unit: 'deg C',
    followTemperatureScreenUnit: true,
    baseTemperatureUnit: 'celsius'
  },
  'P45.11': {
    unit: 'deg C',
    followTemperatureScreenUnit: true,
    baseTemperatureUnit: 'celsius'
  },
  'P45.12': {
    unit: 'deg C',
    followTemperatureScreenUnit: true,
    baseTemperatureUnit: 'celsius'
  }
}

const PARAMETER_DEVICE_ROLE_MAP = new Map<ParameterId, MotorDeviceRole>()

;(Object.keys(DEVICE_PARAMETERS) as DeviceId[]).forEach((deviceId) => {
  DEVICE_PARAMETERS[deviceId].forEach((parameterId) => {
    const role = getMotorDeviceRole(deviceId)
    if (role && !PARAMETER_DEVICE_ROLE_MAP.has(parameterId)) {
      PARAMETER_DEVICE_ROLE_MAP.set(parameterId, role)
    }
  })
})

const normalizeUnit = (unit?: string): string => {
  if (!unit) return ''
  return unit
    .replace(/\u00c3\u201a\u00c2\u00b0C/g, 'deg C')
    .replace(/\u00c2\u00b0C/g, 'deg C')
    .replace(/\u00b0C/g, 'deg C')
    .trim()
}

const getCategory = (id: ParameterId): VariableCategory => {
  const override = CATEGORY_OVERRIDES[id]
  if (override) return override

  const meta = PARAMETER_META[id]
  const text = [id, meta.alias, meta.name, meta.description].filter(Boolean).join(' ').toLowerCase()

  if (/warning|trip|fault/.test(text)) return 'Diagnostics'
  if (/temp|temperature|bearing|winding/.test(text)) return 'Temperature'
  if (/cool|coolant|pump|blower|water|flow|leak|fan/.test(text)) return 'Cooling'
  if (/volt|current|power|kwh|mwh|480vac|supply/.test(text)) return 'Electrical'
  if (/speed|frequency|torque|reference|rpm|jog/.test(text)) return 'Drive'
  if (/start|reset|control|auto|remote|local|heater/.test(text)) return 'Control'
  if (/status|running|closed|open|ok|light|precharge/.test(text) || meta.unit === 'Bool') {
    return 'Status'
  }
  if (/motor|bridge|drive/.test(text)) return 'Mechanical'
  return 'Process'
}

const getColor = (category: VariableCategory, index: number): string => {
  const hue = (CATEGORY_HUES[category] + index * 23) % 360
  const saturation = 72 - (index % 3) * 6
  const lightness = 48 + (index % 4) * 5
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`
}

export const getVariableDeviceRole = (id: ParameterId): MotorDeviceRole => {
  return PARAMETER_DEVICE_ROLE_MAP.get(id) ?? 'drive'
}

export const getVariableDisplayOffsetCelsius = (id: ParameterId): number => {
  return VARIABLE_DISPLAY_OVERRIDES[id]?.displayValueOffsetCelsius ?? 0
}

export const usesTemperatureScreenUnit = (id: ParameterId): boolean => {
  return (
    VARIABLE_DISPLAY_OVERRIDES[id]?.followTemperatureScreenUnit === true || id.endsWith('_DEGF')
  )
}

const getVariableBaseTemperatureUnit = (id: ParameterId): TemperatureUnit | null => {
  const override = VARIABLE_DISPLAY_OVERRIDES[id]
  if (override?.baseTemperatureUnit) return override.baseTemperatureUnit
  if (id.endsWith('_DEGF')) return 'fahrenheit'
  if (override?.followTemperatureScreenUnit) return 'celsius'
  return null
}

export const getVariableDisplayValueCelsius = (id: ParameterId, value: number): number => {
  if (!Number.isFinite(value)) return value

  const baseTemperatureUnit = getVariableBaseTemperatureUnit(id)
  const normalizedRawValue = VARIABLE_DISPLAY_OVERRIDES[id]?.normalizeRawValue?.(value) ?? value
  const normalizedValue =
    baseTemperatureUnit === null
      ? normalizedRawValue
      : (toBaseCelsiusTemperature(normalizedRawValue, baseTemperatureUnit) ?? normalizedRawValue)

  return normalizedValue + getVariableDisplayOffsetCelsius(id)
}

export const applyVariableDisplayValue = (
  id: ParameterId,
  value: number,
  temperatureUnit: TemperatureUnit
): number => {
  if (!Number.isFinite(value)) return value
  const adjustedValueCelsius = getVariableDisplayValueCelsius(id, value)

  if (usesTemperatureScreenUnit(id)) {
    return toDisplayTemperature(adjustedValueCelsius, temperatureUnit) ?? adjustedValueCelsius
  }

  return adjustedValueCelsius
}

export const getVariableDisplayUnit = (
  id: ParameterId,
  fallbackUnit: string | null | undefined,
  temperatureUnit: TemperatureUnit
): string => {
  if (usesTemperatureScreenUnit(id)) {
    return getTemperatureUnitLabel(temperatureUnit)
  }

  const override = VARIABLE_DISPLAY_OVERRIDES[id]?.unit
  if (override) return override

  return fallbackUnit ?? ''
}

const toVariableLabel = (id: ParameterId): string => {
  const override = VARIABLE_DISPLAY_OVERRIDES[id]?.label
  if (override) return override
  const meta = PARAMETER_META[id]
  return meta.name?.trim() || meta.alias?.trim() || id
}

const toVariableUnit = (id: ParameterId): string => {
  const override = VARIABLE_DISPLAY_OVERRIDES[id]?.unit
  if (override) return override
  return normalizeUnit(PARAMETER_META[id].unit)
}

export type AvailableVariable = {
  id: TrendVariableId
  label: string
  unit: string
  color: string
  category: string
  deviceRole: MotorDeviceRole
  dataSource: AvailableVariableDataSource
  wagoIoMeta?: WagoIoVariableMeta
  displayValueOffsetCelsius?: number
}

export type BackendAvailableVariable = AvailableVariable & {
  id: ParameterId
  dataSource: 'backend'
}

export type TrendAvailableVariable = AvailableVariable

const HIDDEN_TREND_VARIABLE_CATEGORIES = new Set<VariableCategory>([
  'Cooling',
  'Control',
  'Diagnostics',
  'Process',
  'Status',
  'Temperature'
])

const buildAvailableVariables = (): BackendAvailableVariable[] => {
  const categoryCount: Partial<Record<VariableCategory, number>> = {}

  return PARAMETER_IDS.flatMap((id) => {
    const category = getCategory(id)
    if (HIDDEN_TREND_VARIABLE_CATEGORIES.has(category)) return []
    const index = categoryCount[category] ?? 0
    categoryCount[category] = index + 1

    return [
      {
        id,
        label: toVariableLabel(id),
        unit: toVariableUnit(id),
        color: getColor(category, index),
        category,
        deviceRole: getVariableDeviceRole(id),
        dataSource: 'backend',
        displayValueOffsetCelsius: getVariableDisplayOffsetCelsius(id) || undefined
      }
    ]
  })
}

const buildAvailableWagoIoVariables = (): TrendAvailableVariable[] => {
  const categoryCount: Partial<Record<VariableCategory, number>> = {}

  return Array.from(WAGO_IO_VARIABLE_META_BY_ID.entries()).map(([id, meta]) => {
    const category = meta.category
    const categoryIndex = categoryCount[category] ?? 0
    categoryCount[category] = categoryIndex + 1

    const next: TrendAvailableVariable = {
      id,
      label: getWagoIoVariableLabel(id),
      unit: meta.unit,
      color: getColor(category, categoryIndex),
      category,
      deviceRole: 'wago',
      dataSource: 'wago-io-live',
      wagoIoMeta: meta
    }
    return next
  })
}

export const AVAILABLE_VARIABLES: BackendAvailableVariable[] = buildAvailableVariables()
export const TREND_AVAILABLE_VARIABLES: TrendAvailableVariable[] = [
  ...AVAILABLE_VARIABLES,
  ...buildAvailableWagoIoVariables()
]
export const TREND_AVAILABLE_VARIABLES_BY_ID = new Map(
  TREND_AVAILABLE_VARIABLES.map((variable) => [variable.id, variable] as const)
)

export const SENSOR_CATEGORIES = CATEGORY_ORDER.filter(
  (category) =>
    !HIDDEN_TREND_VARIABLE_CATEGORIES.has(category) &&
    TREND_AVAILABLE_VARIABLES.some((variable) => variable.category === category)
)

export const TIME_RANGES = [
  { label: '5M', value: 5 },
  { label: '15M', value: 15 },
  { label: '30M', value: 30 },
  { label: '1H', value: 60 },
  { label: '3H', value: 180 },
  { label: '6H', value: 360 },
  { label: '12H', value: 720 },
  { label: '1D', value: 1440 }
]

export const EXCEL_SAMPLE_INTERVAL_VALUE_OPTIONS = [
  0.25,
  0.5,
  1,
  2,
  3,
  4,
  5,
  10,
  15,
  20,
  30,
  45
] as const

export const EXCEL_SAMPLE_INTERVAL_UNITS = ['seconds', 'minutes'] as const

export type ExcelSampleIntervalUnit = (typeof EXCEL_SAMPLE_INTERVAL_UNITS)[number]

export const DEFAULT_EXCEL_SAMPLE_INTERVAL_VALUE = EXCEL_SAMPLE_INTERVAL_VALUE_OPTIONS[0]
export const DEFAULT_EXCEL_SAMPLE_INTERVAL_UNIT: ExcelSampleIntervalUnit = 'seconds'

export const TREND_COLOR_PALETTE = [
  '#06b6d4',
  '#38bdf8',
  '#3b82f6',
  '#2563eb',
  '#4f46e5',
  '#8b5cf6',
  '#a855f7',
  '#d946ef',
  '#ec4899',
  '#f43f5e',
  '#ef4444',
  '#f97316',
  '#b45309',
  '#f59e0b',
  '#eab308',
  '#84cc16',
  '#22c55e',
  '#10b981',
  '#14b8a6',
  '#0d9488'
] as const

export const MANUAL_COLORS = TREND_COLOR_PALETTE.slice(0, 5)
export const MAX_TREND_RANGE_MONTHS = 2

const toLocalDateTimeString = (date: Date): string => {
  const copy = new Date(date.getTime())
  const offsetMinutes = copy.getTimezoneOffset()
  copy.setMinutes(copy.getMinutes() - offsetMinutes)
  return copy.toISOString().slice(0, 19)
}

const toLocalDateTimeMinuteString = (date: Date): string => {
  return toLocalDateTimeString(date).slice(0, 16)
}

const parseLocalDateTimeInput = (value: string): Date | null => {
  if (!value) return null
  const parsed = new Date(value)
  return Number.isFinite(parsed.getTime()) ? parsed : null
}

const addMonths = (source: Date, months: number): Date => {
  const copy = new Date(source.getTime())
  copy.setMonth(copy.getMonth() + months)
  return copy
}

export const nowLocalInput = (): string => {
  return toLocalDateTimeString(new Date())
}

export const formatLocalInputFromDate = (source: Date): string => {
  return toLocalDateTimeString(source)
}

export const nowLocalMinuteInput = (): string => {
  return toLocalDateTimeMinuteString(new Date())
}

export const formatLocalMinuteInputFromDate = (source: Date): string => {
  return toLocalDateTimeMinuteString(source)
}

export const buildRelativeRangeInput = (
  minutes: number,
  anchorDate: Date = new Date()
): TrendCustomRange => {
  const end = new Date(anchorDate.getTime())
  const start = new Date(anchorDate.getTime() - minutes * 60_000)

  return {
    start: formatLocalMinuteInputFromDate(start),
    end: formatLocalMinuteInputFromDate(end)
  }
}

export const validateTrendCustomRange = (
  range: TrendCustomRange
):
  | {
      ok: true
      startDate: Date
      endDate: Date
      durationMinutes: number
      normalized: TrendCustomRange
    }
  | { ok: false; error: string } => {
  const startDate = parseLocalDateTimeInput(range.start)
  const endDate = parseLocalDateTimeInput(range.end)

  if (!startDate || !endDate) {
    return { ok: false, error: 'Select a valid start and end date' }
  }

  const startMs = startDate.getTime()
  const endMs = endDate.getTime()
  if (!(endMs > startMs)) {
    return { ok: false, error: 'End date must be later than start date' }
  }

  const nowMs = Date.now()
  if (endMs > nowMs + 60_000) {
    return { ok: false, error: 'End date cannot be in the future' }
  }

  const maxEnd = addMonths(startDate, MAX_TREND_RANGE_MONTHS)
  if (endMs > maxEnd.getTime()) {
    return { ok: false, error: 'Custom range supports up to 2 months' }
  }

  return {
    ok: true,
    startDate,
    endDate,
    durationMinutes: Math.max(1, Math.round((endMs - startMs) / 60_000)),
    normalized: {
      start: formatLocalMinuteInputFromDate(startDate),
      end: formatLocalMinuteInputFromDate(endDate)
    }
  }
}

export const formatTrendRangeSummary = (range: TrendCustomRange | null): string | null => {
  if (!range) return null

  const validation = validateTrendCustomRange(range)
  if (!validation.ok) return null

  const sameDay = validation.startDate.toDateString() === validation.endDate.toDateString()

  const startLabel = validation.startDate.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
  const endLabel = validation.endDate.toLocaleString([], {
    ...(sameDay ? {} : { month: 'short', day: 'numeric' }),
    hour: '2-digit',
    minute: '2-digit'
  })

  return `${startLabel} - ${endLabel}`
}
