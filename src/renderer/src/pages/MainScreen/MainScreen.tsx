import {
  type ChangeEvent,
  type KeyboardEvent,
  type PointerEvent,
  type TouchEvent as ReactTouchEvent,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import {
  Binary,
  Cable,
  ChevronRight,
  Play,
  Power,
  RefreshCcw,
  Square,
  UserRound,
  X
} from 'lucide-react'
import { useNavigate } from 'react-router'
import motorImage from 'assets/images/motor1.png'
import { ScreenLayout } from 'layouts'
import { VirtualKeyboard } from 'components/VirtualKeyboard'
import { ModalBase } from 'components/Modal/ModalBase'
import {
  GaugeConfigModal,
  type GaugeConfigValue,
  type GaugeVariableOption
} from 'components/GaugeConfigModal'
import {
  useAccessMode,
  useDeviceData,
  useIsViewportBelow,
  useMotorControlModePreference,
  usePreferredSingleMotorScope,
  setPreferredSingleMotorScopePreference,
  useSendCommand,
  useTopBannerNotice,
  useTemperatureUnitPreference,
  type TemperatureUnit
} from 'hooks'
import { useOnDemandParameters } from 'hooks/useOnDemandParameters'
import {
  applyVariableDisplayValue,
  AVAILABLE_VARIABLES,
  getVariableDisplayValueCelsius,
  getVariableDisplayUnit
} from 'pages/TrendScreen/constants'
import { fetchWagoLiveSnapshot } from 'services'
import { DEVICE_PARAMETERS, DeviceId, PARAMETER_ALIASES, PARAMETER_META, ParameterId } from 'types'
import { scaleWagoTransducerRawValue } from 'pages/WagoLiveScreen/wagoTransducerScaling'

import { ElectricalParams } from './localComponents/ElectricalParams'
import { SpeedControl } from './localComponents/SpeedControl'
import { DriveControl } from './localComponents/DriveControl'
import { ClientMotorInfo } from './localComponents/ClientMotorInfo'
import DualMotorDetailsModal from './localComponents/DualMotorDetailsModal/DualMotorDetailsModal'
import { getMotorMonitorValueOverride } from './monitorValueDisplay'
import {
  getMotorDriveDeviceId,
  getMotorWagoDeviceId,
  getMotorWagoLiveDeviceId,
  type MotorScope
} from 'utils/motorDeviceMapping'
import { hasActiveInterlockTrip } from 'utils/driveTripStatus'
import {
  getMotorTemperatureAlertSeverity,
  shouldAnimateMotorTemperatureAlert,
  type TemperatureAlertSeverity
} from 'utils/temperatureAlerts'
import {
  DUAL_CLIENT_MOTOR_INFO_UPDATED_EVENT,
  loadDualClientMotorInfo,
  saveDualClientMotorInfo
} from 'utils/clientMotorInfoStorage'
import { isSingleTouchContact, MULTI_TOUCH_CANCEL_EVENT } from 'utils/touch'
import * as S from './MainScreen.styles'
import { MAX_SPEED_REFERENCE } from './speedReference'

const MAIN_SCREEN_DEVICE_ID: DeviceId = 'drive_avid'
const ETHERNET_REFERENCE_PARAMETER_ID = 'P86.25' as ParameterId
const ETHERNET_REFERENCE_FALLBACK_PARAMETER_ID = 'P86.29' as ParameterId
const ETHERNET_CONTROL_WORD_PARAMETER_ID = 'P86.27' as ParameterId
const ETHERNET_REFERENCE_SOURCE_VALUE = 21
const ETHERNET_SPEED_REFERENCE_SOURCE_VALUE = 21
const KEYPAD_SPEED_REFERENCE_SOURCE_VALUE = 1
const ANALOG_REFERENCE_1_SOURCE_VALUE = 2
const ANALOG_REFERENCE_2_SOURCE_VALUE = 3
const ETHERNET_POINTER_SOURCE_VALUE = 86.25
const ETHERNET_POINTER_SCALE_VALUE = 100
const ETHERNET_REFERENCE_PRELOAD_VALUE = 0
const CONTROL_FLAG_SET_VALUE = 1
const CONTROL_FLAG_CLEAR_VALUE = 0
const DIGITAL_INPUT_REF1_SELECTOR_VALUE = -1004
const DIGITAL_INPUT_REF2_SELECTOR_VALUE = -1005
const DIGITAL_INPUT_REF3_SELECTOR_VALUE = 1005
const DRIVE_COMMAND_PULSE_MS = 500
const DRIVE_TRIP_RESET_PULSE_MS = 500
const ESTOP_RESET_PARAMETER_ID = 'RB_Estop_Reset' as ParameterId
const ESTOP_RESET_DRIVE_RESET_DELAY_MS = 100
const WAGO_COMMAND_HOLD_MS = 2000
const WAGO_COMMAND_REFRESH_MS = 250
const DRIVE_READY_WORD = 0x000d
const DRIVE_START_WORD = 0x000f
const DRIVE_STOP_WORD = 0x000c
const CF0_SOURCE_PARAMETER_ID = 'P33.00' as ParameterId
const CF1_SOURCE_PARAMETER_ID = 'P33.01' as ParameterId
const CF2_SOURCE_PARAMETER_ID = 'P33.02' as ParameterId
const CF4_SOURCE_PARAMETER_ID = 'P33.04' as ParameterId
const CF5_SOURCE_PARAMETER_ID = 'P33.05' as ParameterId
const CF6_SOURCE_PARAMETER_ID = 'P33.06' as ParameterId
const CF7_SOURCE_PARAMETER_ID = 'P33.07' as ParameterId
const CF116_SOURCE_PARAMETER_ID = 'P34.16' as ParameterId
const SPEED_REFERENCE_SOURCE_PARAMETER_ID = 'P5.01' as ParameterId
const SPEED_REFERENCE_2_SOURCE_PARAMETER_ID = 'P5.02' as ParameterId
const SPEED_REFERENCE_3_SOURCE_PARAMETER_ID = 'P5.03' as ParameterId
const SPEED_REFERENCE_4_SOURCE_PARAMETER_ID = 'P5.04' as ParameterId
const BACKUP_SPEED_REFERENCE_SOURCE_PARAMETER_ID = 'P5.05' as ParameterId
const CLAMP_ZERO_REFERENCE_PARAMETER_ID = 'P5.21' as ParameterId
const POINTER_1_SOURCE_PARAMETER_ID = 'P42.00' as ParameterId
const POINTER_1_SCALE_PARAMETER_ID = 'P42.01' as ParameterId
const DRIVE_RPM_PARAMETER_ID = 'P9.03' as ParameterId
const DUAL_METRIC_STORAGE_KEY = 'main_screen_dual_metrics_v1'
const LONG_PRESS_MS = 2000

type DriveMode = 'ethernet' | 'digital-input' | 'custom'
type NoticeTone = 'success' | 'error'
type MainBreakerStatus = 'open' | 'closed' | 'unknown'
type DualTone = 'default' | 'blue' | 'green' | 'amber' | 'red'
type DualMetricPanelId = 'drive1' | 'drive2'
type DualMetricSlotId = 'slot1' | 'slot2' | 'slot3' | 'slot4' | 'slot5' | 'slot6'
type WindingPhase = 'A' | 'B' | 'C'
type IgbtPhase = 'U' | 'V' | 'W'
type MainScreenWindingParameterId =
  | 'Motor_Winding_A1_DEGF'
  | 'Motor_Winding_A2_DEGF'
  | 'Motor_Winding_B1_DEGF'
  | 'Motor_Winding_B2_DEGF'
  | 'Motor_Winding_C1_DEGF'
  | 'Motor_Winding_C2_DEGF'
type MainScreenIgbtParameterId =
  | 'P45.00'
  | 'P45.01'
  | 'P45.02'
  | 'P45.07'
  | 'P45.08'
  | 'P45.09'
  | 'P45.10'
  | 'P45.11'
  | 'P45.12'
  | 'P45.13'
  | 'P45.14'
  | 'P45.15'
  | 'P45.16'
  | 'P45.17'
  | 'P45.18'
  | 'P45.19'
  | 'P45.20'
  | 'P45.21'
type MainScreenTransducerParameterId =
  | 'Motor_RPM_Transducer'
  | 'Motor_HP_Transducer'
  | 'Motor_Torque_Transducer'

type StoredTrendConfig = {
  parameterId: ParameterId
}

type TemperatureSummaryCard = {
  id: string
  label: string
  value: string
  unit?: string
  tone: DualTone
  alertSeverity: TemperatureAlertSeverity
  animateAlert: boolean
  detail?: string
  selectable?: boolean
  onSelect?: () => void
}

type DualMetric = {
  id: DualMetricSlotId
  label: string
  value: string
  unit?: string
  tone?: DualTone
  accent?: 'none' | 'blue' | 'green' | 'amber'
}

type StoredDualMetricConfig = Record<DualMetricPanelId, Record<DualMetricSlotId, StoredTrendConfig>>

type DualMotorPanelConfig = {
  title: string
  berth?: string
  motorType?: string
  live: boolean
  driveCommsOk?: boolean
  wagoCommsOk?: boolean
  mainBreakerStatus?: MainBreakerStatus
  stateLabel: string
  stateTone: 'running' | 'stopped'
  heroValue: string
  heroValueUnit: string
  heroValueTone?: DualTone
  heroSecondaryValue: string
  heroSecondaryUnit: string
  heroSecondaryTone?: DualTone
  metrics: DualMetric[]
  temperatureCards: TemperatureSummaryCard[]
  referenceValue: string
  sliderValue: number
  sliderDisabled: boolean
  controlDisabled: boolean
  modeSwitchDisabled: boolean
  onParameterDetails: () => void
  onMotorDetails: () => void
  onMotorTypePress?: () => void
  onMetricPressStart?: (metricId: DualMetricSlotId) => void
  onMetricPressEnd?: () => void
  onSpeedStep?: (delta: number) => void
  onSliderChange?: (value: number) => void
  onStart?: () => void
  onStop?: () => void
  onResetEstop?: () => void
  onEthernetMode?: () => void
  onDigitalMode?: () => void
  estopPressed?: boolean
  ethernetActive?: boolean
  digitalActive?: boolean
  modeBusy?: boolean
  driveBusy?: boolean
  resetBusy?: boolean
  resetDisabled?: boolean
}

const MAIN_SCREEN_TEMPERATURE_REGISTER_ENTRIES: ReadonlyArray<readonly [ParameterId, number]> = [
  ['Motor_Bearing_DE_DEGF', 400016],
  ['Motor_Bearing_NDE_DEGF', 400017],
  ['Motor_Winding_A1_DEGF', 400010],
  ['Motor_Winding_B1_DEGF', 400011],
  ['Motor_Winding_C1_DEGF', 400012],
  ['Motor_Winding_A2_DEGF', 400013],
  ['Motor_Winding_B2_DEGF', 400014],
  ['Motor_Winding_C2_DEGF', 400015],
  ['Coolant_Temp_DEGF', 400026]
]
const MAIN_SCREEN_TRANSDUCER_INPUT_ENTRIES: ReadonlyArray<
  readonly [MainScreenTransducerParameterId, number]
> = [
  ['Motor_RPM_Transducer', 0],
  ['Motor_HP_Transducer', 1],
  ['Motor_Torque_Transducer', 24]
]
const MOTOR_TWO_MAIN_SCREEN_REGISTER_OVERRIDES: Readonly<Partial<Record<ParameterId, number>>> = {
  Coolant_Temp_DEGF: 400024
}
type WindingOption = {
  phase: WindingPhase
  bank: '1' | '2'
  parameterId: MainScreenWindingParameterId
  label: string
}
type IgbtOption = {
  phase: IgbtPhase
  bank: '1' | '2' | '3' | '4' | '5' | '6'
  parameterId: MainScreenIgbtParameterId
  label: string
}

const MAIN_SCREEN_WINDING_SELECTION_STORAGE_KEY = 'main_screen_winding_selection_v1'
const MAIN_SCREEN_IGBT_SELECTION_STORAGE_KEY = 'main_screen_igbt_selection_v1'
const MOTOR_WINDING_PHASE_LABELS: readonly WindingPhase[] = ['A', 'B', 'C']
const MAIN_SCREEN_WINDING_OPTIONS: readonly WindingOption[] = [
  { phase: 'A', bank: '1', parameterId: 'Motor_Winding_A1_DEGF', label: 'Winding A1' },
  { phase: 'A', bank: '2', parameterId: 'Motor_Winding_A2_DEGF', label: 'Winding A2' },
  { phase: 'B', bank: '1', parameterId: 'Motor_Winding_B1_DEGF', label: 'Winding B1' },
  { phase: 'B', bank: '2', parameterId: 'Motor_Winding_B2_DEGF', label: 'Winding B2' },
  { phase: 'C', bank: '1', parameterId: 'Motor_Winding_C1_DEGF', label: 'Winding C1' },
  { phase: 'C', bank: '2', parameterId: 'Motor_Winding_C2_DEGF', label: 'Winding C2' }
]
const MAIN_SCREEN_IGBT_OPTIONS: readonly IgbtOption[] = [
  { phase: 'U', bank: '1', parameterId: 'P45.00', label: 'IGBT U1' },
  { phase: 'V', bank: '1', parameterId: 'P45.01', label: 'IGBT V1' },
  { phase: 'W', bank: '1', parameterId: 'P45.02', label: 'IGBT W1' },
  { phase: 'U', bank: '2', parameterId: 'P45.07', label: 'IGBT U2' },
  { phase: 'V', bank: '2', parameterId: 'P45.08', label: 'IGBT V2' },
  { phase: 'W', bank: '2', parameterId: 'P45.09', label: 'IGBT W2' },
  { phase: 'U', bank: '3', parameterId: 'P45.10', label: 'IGBT U3' },
  { phase: 'V', bank: '3', parameterId: 'P45.11', label: 'IGBT V3' },
  { phase: 'W', bank: '3', parameterId: 'P45.12', label: 'IGBT W3' },
  { phase: 'U', bank: '4', parameterId: 'P45.13', label: 'IGBT U4' },
  { phase: 'V', bank: '4', parameterId: 'P45.14', label: 'IGBT V4' },
  { phase: 'W', bank: '4', parameterId: 'P45.15', label: 'IGBT W4' },
  { phase: 'U', bank: '5', parameterId: 'P45.16', label: 'IGBT U5' },
  { phase: 'V', bank: '5', parameterId: 'P45.17', label: 'IGBT V5' },
  { phase: 'W', bank: '5', parameterId: 'P45.18', label: 'IGBT W5' },
  { phase: 'U', bank: '6', parameterId: 'P45.19', label: 'IGBT U6' },
  { phase: 'V', bank: '6', parameterId: 'P45.20', label: 'IGBT V6' },
  { phase: 'W', bank: '6', parameterId: 'P45.21', label: 'IGBT W6' }
]
const DEFAULT_MAIN_SCREEN_WINDING_SELECTION: Record<WindingPhase, MainScreenWindingParameterId> = {
  A: 'Motor_Winding_A2_DEGF',
  B: 'Motor_Winding_B2_DEGF',
  C: 'Motor_Winding_C2_DEGF'
}
const DEFAULT_MAIN_SCREEN_IGBT_SELECTION: Record<MotorScope, MainScreenIgbtParameterId> = {
  1: 'P45.00',
  2: 'P45.00'
}
const WINDING_OPTION_BY_PARAMETER_ID = new Map<MainScreenWindingParameterId, WindingOption>(
  MAIN_SCREEN_WINDING_OPTIONS.map((option) => [option.parameterId, option])
)
const IGBT_OPTION_BY_PARAMETER_ID = new Map<MainScreenIgbtParameterId, IgbtOption>(
  MAIN_SCREEN_IGBT_OPTIONS.map((option) => [option.parameterId, option])
)
const WINDING_OPTIONS_BY_PHASE = MAIN_SCREEN_WINDING_OPTIONS.reduce<
  Record<WindingPhase, WindingOption[]>
>(
  (optionsByPhase, option) => {
    optionsByPhase[option.phase].push(option)
    return optionsByPhase
  },
  { A: [], B: [], C: [] }
)
const IGBT_OPTIONS_BY_BANK = MAIN_SCREEN_IGBT_OPTIONS.reduce<
  Record<IgbtOption['bank'], IgbtOption[]>
>(
  (optionsByBank, option) => {
    optionsByBank[option.bank].push(option)
    return optionsByBank
  },
  { '1': [], '2': [], '3': [], '4': [], '5': [], '6': [] }
)
const MAIN_SCREEN_TEMPERATURE_REGISTER_BY_PARAMETER = new Map<ParameterId, number>(
  MAIN_SCREEN_TEMPERATURE_REGISTER_ENTRIES.map(([parameterId, modbusRegister]) => [
    parameterId,
    modbusRegister
  ])
)
const MAIN_SCREEN_TEMPERATURE_PARAMETER_IDS = MAIN_SCREEN_TEMPERATURE_REGISTER_ENTRIES.map(
  ([parameterId]) => parameterId
)
const MAIN_SCREEN_TRANSDUCER_INPUT_OFFSETS = MAIN_SCREEN_TRANSDUCER_INPUT_ENTRIES.map(
  ([, inputOffset]) => inputOffset
)
const MAIN_SCREEN_TEMPERATURE_HOLDING_REGISTERS = Array.from(
  new Set([
    ...MAIN_SCREEN_TEMPERATURE_REGISTER_ENTRIES.map(([, modbusRegister]) => modbusRegister),
    ...Object.values(MOTOR_TWO_MAIN_SCREEN_REGISTER_OVERRIDES).filter(
      (modbusRegister): modbusRegister is number => typeof modbusRegister === 'number'
    )
  ])
)
const MAIN_SCREEN_WAGO_LIVE_POLL_MS = 1000
const MAIN_BREAKER_CLOSED_STATUS_REGISTER = 30017

const DUAL_METRIC_PANEL_IDS: DualMetricPanelId[] = ['drive1', 'drive2']
const DUAL_METRIC_SLOT_IDS: DualMetricSlotId[] = [
  'slot1',
  'slot2',
  'slot3',
  'slot4',
  'slot5',
  'slot6'
]
const DUAL_PANEL_ID_BY_SCOPE: Record<MotorScope, DualMetricPanelId> = {
  1: 'drive1',
  2: 'drive2'
}
const MOTOR_INFO_SLOT_BY_SCOPE: Record<MotorScope, 'drive1' | 'drive2'> = {
  1: 'drive1',
  2: 'drive2'
}

const buildDefaultDualMetricPanelConfig = (): Record<DualMetricSlotId, StoredTrendConfig> => ({
  slot1: { parameterId: 'P9.03' as ParameterId },
  slot2: { parameterId: PARAMETER_ALIASES.motorCurrent },
  slot3: { parameterId: PARAMETER_ALIASES.torqueDemand },
  slot4: { parameterId: PARAMETER_ALIASES.motorPower },
  slot5: { parameterId: PARAMETER_ALIASES.frequencyFeedback },
  slot6: { parameterId: PARAMETER_ALIASES.dcLinkVoltage }
})

const createDefaultDualMetricConfig = (): StoredDualMetricConfig => ({
  drive1: buildDefaultDualMetricPanelConfig(),
  drive2: buildDefaultDualMetricPanelConfig()
})

const MODE_PARAMETER_IDS: ParameterId[] = [
  CF0_SOURCE_PARAMETER_ID,
  CF1_SOURCE_PARAMETER_ID,
  CF2_SOURCE_PARAMETER_ID,
  CF4_SOURCE_PARAMETER_ID,
  CF5_SOURCE_PARAMETER_ID,
  CF6_SOURCE_PARAMETER_ID,
  CF7_SOURCE_PARAMETER_ID,
  CF116_SOURCE_PARAMETER_ID,
  SPEED_REFERENCE_2_SOURCE_PARAMETER_ID,
  SPEED_REFERENCE_3_SOURCE_PARAMETER_ID,
  SPEED_REFERENCE_4_SOURCE_PARAMETER_ID,
  POINTER_1_SOURCE_PARAMETER_ID,
  POINTER_1_SCALE_PARAMETER_ID,
  BACKUP_SPEED_REFERENCE_SOURCE_PARAMETER_ID,
  SPEED_REFERENCE_SOURCE_PARAMETER_ID
]

const ETHERNET_MODE_VALUES: Record<string, number> = {
  [CF0_SOURCE_PARAMETER_ID]: 5300,
  [CF1_SOURCE_PARAMETER_ID]: 5301,
  [CF2_SOURCE_PARAMETER_ID]: 5302,
  [CF4_SOURCE_PARAMETER_ID]: CONTROL_FLAG_SET_VALUE,
  [CF5_SOURCE_PARAMETER_ID]: CONTROL_FLAG_CLEAR_VALUE,
  [CF6_SOURCE_PARAMETER_ID]: CONTROL_FLAG_CLEAR_VALUE,
  [CF7_SOURCE_PARAMETER_ID]: CONTROL_FLAG_CLEAR_VALUE,
  [CF116_SOURCE_PARAMETER_ID]: 5303,
  [POINTER_1_SOURCE_PARAMETER_ID]: ETHERNET_POINTER_SOURCE_VALUE,
  [POINTER_1_SCALE_PARAMETER_ID]: ETHERNET_POINTER_SCALE_VALUE,
  [BACKUP_SPEED_REFERENCE_SOURCE_PARAMETER_ID]: KEYPAD_SPEED_REFERENCE_SOURCE_VALUE,
  [CLAMP_ZERO_REFERENCE_PARAMETER_ID]: 0,
  [SPEED_REFERENCE_SOURCE_PARAMETER_ID]: ETHERNET_SPEED_REFERENCE_SOURCE_VALUE
}

const DIGITAL_INPUT_MODE_VALUES: Record<string, number> = {
  [CF0_SOURCE_PARAMETER_ID]: 1002,
  [CF1_SOURCE_PARAMETER_ID]: 1002,
  [CF2_SOURCE_PARAMETER_ID]: 1,
  [CF4_SOURCE_PARAMETER_ID]: DIGITAL_INPUT_REF1_SELECTOR_VALUE,
  [CF5_SOURCE_PARAMETER_ID]: DIGITAL_INPUT_REF2_SELECTOR_VALUE,
  [CF6_SOURCE_PARAMETER_ID]: DIGITAL_INPUT_REF3_SELECTOR_VALUE,
  [CF7_SOURCE_PARAMETER_ID]: CONTROL_FLAG_CLEAR_VALUE,
  [CF116_SOURCE_PARAMETER_ID]: 1
}

const DIGITAL_INPUT_REFERENCE_VALUES: Record<string, number> = {
  [SPEED_REFERENCE_SOURCE_PARAMETER_ID]: ANALOG_REFERENCE_1_SOURCE_VALUE,
  [SPEED_REFERENCE_2_SOURCE_PARAMETER_ID]: ANALOG_REFERENCE_1_SOURCE_VALUE,
  [SPEED_REFERENCE_3_SOURCE_PARAMETER_ID]: ANALOG_REFERENCE_2_SOURCE_VALUE,
  [SPEED_REFERENCE_4_SOURCE_PARAMETER_ID]: KEYPAD_SPEED_REFERENCE_SOURCE_VALUE,
  [BACKUP_SPEED_REFERENCE_SOURCE_PARAMETER_ID]: 0
}

const AVAILABLE_VARIABLES_BY_ID = new Map(
  AVAILABLE_VARIABLES.map((variable) => [variable.id, variable] as const)
)
const ALLOWED_TREND_PARAMETER_IDS = new Set(DEVICE_PARAMETERS[MAIN_SCREEN_DEVICE_ID])

const isBrowser = (): boolean => typeof window !== 'undefined'

const toFiniteNumber = (value: unknown, fallback = 0): number => {
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : fallback
}

const toNullableNumber = (value: unknown): number | null => {
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : null
}

const clampNumber = (value: number, min: number, max: number): number => {
  return Math.min(max, Math.max(min, value))
}

const formatDisplayNumber = (value: number, fractionDigits = 0): string => {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits
  })
}

const isSignalActive = (value: unknown): boolean => toFiniteNumber(value) > 0

const getDriveModeLabel = (mode: DriveMode): string => {
  if (mode === 'ethernet') return 'ConView Control'
  if (mode === 'digital-input') return 'Keypad Control'
  return 'CUSTOM'
}

const isNumericTrendParameter = (parameterId: ParameterId): boolean => {
  return PARAMETER_META[parameterId]?.unit !== 'Bool'
}

const isAllowedTrendParameter = (value: unknown): value is ParameterId => {
  return (
    typeof value === 'string' &&
    ALLOWED_TREND_PARAMETER_IDS.has(value as ParameterId) &&
    isNumericTrendParameter(value as ParameterId)
  )
}

const isAllowedDualMetricParameter = (value: unknown): value is ParameterId => {
  if (!isAllowedTrendParameter(value)) return false

  const variable = AVAILABLE_VARIABLES_BY_ID.get(value as ParameterId)
  return variable?.category === 'Main' && variable.deviceRole === 'drive'
}

const sanitizeStoredDualMetricConfig = (value: unknown): StoredDualMetricConfig => {
  if (!value || typeof value !== 'object') return createDefaultDualMetricConfig()

  const obj = value as Record<string, unknown>
  const next = createDefaultDualMetricConfig()

  DUAL_METRIC_PANEL_IDS.forEach((panelId) => {
    const panel = obj[panelId]
    if (!panel || typeof panel !== 'object') return

    DUAL_METRIC_SLOT_IDS.forEach((slotId) => {
      const slot = (panel as Record<string, unknown>)[slotId]
      if (!slot || typeof slot !== 'object') return

      const parameterId = (slot as Record<string, unknown>).parameterId
      if (!isAllowedDualMetricParameter(parameterId)) return

      next[panelId][slotId] = { parameterId }
    })
  })

  return next
}

const loadStoredDualMetricConfig = (): StoredDualMetricConfig => {
  if (!isBrowser()) return createDefaultDualMetricConfig()
  try {
    const raw = localStorage.getItem(DUAL_METRIC_STORAGE_KEY)
    if (!raw) return createDefaultDualMetricConfig()
    return sanitizeStoredDualMetricConfig(JSON.parse(raw))
  } catch {
    return createDefaultDualMetricConfig()
  }
}

const persistStoredDualMetricConfig = (config: StoredDualMetricConfig): void => {
  if (!isBrowser()) return
  try {
    localStorage.setItem(DUAL_METRIC_STORAGE_KEY, JSON.stringify(config))
  } catch (err) {
    console.warn('Failed to persist dual metric configuration', err)
  }
}

const getTrendDisplayMeta = (
  parameterId: ParameterId
): { label: string; unit?: string; group?: string } => {
  const preset = AVAILABLE_VARIABLES_BY_ID.get(parameterId)
  if (preset) {
    return {
      label: preset.label,
      unit: preset.unit || undefined,
      group: preset.category
    }
  }

  const meta = PARAMETER_META[parameterId]
  return {
    label: meta?.name || parameterId,
    unit: meta?.unit,
    group: 'Drive'
  }
}

const formatParameterLabelWithId = (parameterId: ParameterId, label: string): string => {
  const trimmedId = String(parameterId).trim()
  const trimmedLabel = label.trim()

  if (!trimmedId) return trimmedLabel
  if (!trimmedLabel) return trimmedId
  if (trimmedLabel.toUpperCase().includes(trimmedId.toUpperCase())) return trimmedLabel

  return `${trimmedLabel} (${trimmedId})`
}

const buildDualMetricVariableOptions = (): GaugeVariableOption[] => {
  return AVAILABLE_VARIABLES.filter(
    (variable) =>
      variable.category === 'Main' &&
      variable.deviceRole === 'drive' &&
      isNumericTrendParameter(variable.id)
  ).map((variable) => ({
    id: variable.id,
    label: variable.label,
    unit: variable.unit || undefined,
    group: variable.category
  }))
}

const DUAL_METRIC_VARIABLE_OPTIONS = buildDualMetricVariableOptions()

const getTemperatureTone = (adjustedValueCelsius: number | null): DualTone => {
  if (adjustedValueCelsius === null) return 'default'
  if (adjustedValueCelsius > 75) return 'red'
  if (adjustedValueCelsius > 60) return 'amber'
  return 'green'
}

const getTemperatureCardTone = (
  alertSeverity: TemperatureAlertSeverity,
  normalTone: DualTone
): DualTone => {
  if (alertSeverity === 'critical') return 'red'
  if (alertSeverity === 'warning') return 'amber'
  return normalTone
}

const loadStoredMotorTypes = (): Record<MotorScope, string> => {
  const info = loadDualClientMotorInfo()

  return {
    1: info.drive1.motorType?.trim() ?? '',
    2: info.drive2.motorType?.trim() ?? ''
  }
}

const persistStoredMotorType = (scope: MotorScope, value: string): void => {
  const info = loadDualClientMotorInfo()
  const slot = MOTOR_INFO_SLOT_BY_SCOPE[scope]
  const nextValue = value.trim()

  saveDualClientMotorInfo({
    ...info,
    [slot]: {
      ...info[slot],
      motorType: nextValue
    }
  })
}

const useMotorTypeEditor = () => {
  const [motorTypes, setMotorTypes] = useState<Record<MotorScope, string>>(loadStoredMotorTypes)
  const [editingMotorScope, setEditingMotorScope] = useState<MotorScope | null>(null)

  useEffect(() => {
    if (!isBrowser()) return

    const syncMotorTypes = () => {
      setMotorTypes(loadStoredMotorTypes())
    }

    window.addEventListener(DUAL_CLIENT_MOTOR_INFO_UPDATED_EVENT, syncMotorTypes)

    return () => {
      window.removeEventListener(DUAL_CLIENT_MOTOR_INFO_UPDATED_EVENT, syncMotorTypes)
    }
  }, [])

  const openMotorTypeEditor = (scope: MotorScope) => {
    setEditingMotorScope(scope)
  }

  const closeMotorTypeEditor = () => {
    setEditingMotorScope(null)
  }

  const handleMotorTypeConfirm = (value: string) => {
    if (editingMotorScope === null) return

    const nextValue = value.trim()
    setMotorTypes((prev) => ({ ...prev, [editingMotorScope]: nextValue }))
    persistStoredMotorType(editingMotorScope, nextValue)
    closeMotorTypeEditor()
  }

  return {
    motorTypes,
    openMotorTypeEditor,
    keyboardState: {
      visible: editingMotorScope !== null,
      label: editingMotorScope !== null ? `Motor #${editingMotorScope} Motor Type` : 'Motor Type',
      initialValue: editingMotorScope !== null ? motorTypes[editingMotorScope] : ''
    },
    handleMotorTypeConfirm,
    closeMotorTypeEditor
  }
}

const getTemperatureSnapshot = (
  parameterId: ParameterId,
  rawValue: unknown,
  temperatureUnit: TemperatureUnit
): {
  adjustedValueCelsius: number | null
  displayValue: number | null
  unit: string
} => {
  const numeric = toNullableNumber(rawValue)
  const unit = getVariableDisplayUnit(
    parameterId,
    PARAMETER_META[parameterId]?.unit,
    temperatureUnit
  )

  if (numeric === null) {
    return {
      adjustedValueCelsius: null,
      displayValue: null,
      unit
    }
  }

  return {
    adjustedValueCelsius: getVariableDisplayValueCelsius(parameterId, numeric),
    displayValue: applyVariableDisplayValue(parameterId, numeric, temperatureUnit),
    unit
  }
}

const formatTemperatureCardValue = (value: number | null): string => {
  return value === null ? '--' : formatDisplayNumber(value, 0)
}

const formatMonitorCardValue = (value: number | null, fractionDigits = 0): string => {
  return value === null ? '--' : formatDisplayNumber(value, fractionDigits)
}

const toHoldingRegisterOffset = (modbusRegister: number): number => modbusRegister - 400001
const toInputRegisterOffset = (modbusRegister: number): number => modbusRegister - 443000

const isMainScreenWindingParameterId = (
  parameterId: unknown
): parameterId is MainScreenWindingParameterId =>
  typeof parameterId === 'string' &&
  WINDING_OPTION_BY_PARAMETER_ID.has(parameterId as MainScreenWindingParameterId)

const normalizeWindingSelection = (
  selection: Partial<Record<WindingPhase, unknown>>
): Record<WindingPhase, MainScreenWindingParameterId> => {
  return MOTOR_WINDING_PHASE_LABELS.reduce<Record<WindingPhase, MainScreenWindingParameterId>>(
    (normalized, phase) => {
      const parameterId = selection[phase]
      const option = isMainScreenWindingParameterId(parameterId)
        ? WINDING_OPTION_BY_PARAMETER_ID.get(parameterId)
        : undefined

      normalized[phase] =
        option?.phase === phase ? option.parameterId : DEFAULT_MAIN_SCREEN_WINDING_SELECTION[phase]
      return normalized
    },
    { ...DEFAULT_MAIN_SCREEN_WINDING_SELECTION }
  )
}

const loadStoredWindingSelection = (): Record<WindingPhase, MainScreenWindingParameterId> => {
  if (typeof window === 'undefined') return { ...DEFAULT_MAIN_SCREEN_WINDING_SELECTION }

  try {
    const raw = window.localStorage.getItem(MAIN_SCREEN_WINDING_SELECTION_STORAGE_KEY)
    if (!raw) return { ...DEFAULT_MAIN_SCREEN_WINDING_SELECTION }

    const parsed = JSON.parse(raw) as Partial<Record<WindingPhase, unknown>>
    return normalizeWindingSelection(parsed)
  } catch {
    return { ...DEFAULT_MAIN_SCREEN_WINDING_SELECTION }
  }
}

const persistWindingSelection = (selection: Record<WindingPhase, MainScreenWindingParameterId>) => {
  if (typeof window === 'undefined') return

  window.localStorage.setItem(MAIN_SCREEN_WINDING_SELECTION_STORAGE_KEY, JSON.stringify(selection))
}

const isMainScreenIgbtParameterId = (
  parameterId: unknown
): parameterId is MainScreenIgbtParameterId =>
  typeof parameterId === 'string' && IGBT_OPTION_BY_PARAMETER_ID.has(parameterId as MainScreenIgbtParameterId)

const normalizeIgbtSelection = (
  selection: Partial<Record<MotorScope, unknown>>
): Record<MotorScope, MainScreenIgbtParameterId> => {
  return {
    1: isMainScreenIgbtParameterId(selection[1])
      ? selection[1]
      : DEFAULT_MAIN_SCREEN_IGBT_SELECTION[1],
    2: isMainScreenIgbtParameterId(selection[2])
      ? selection[2]
      : DEFAULT_MAIN_SCREEN_IGBT_SELECTION[2]
  }
}

const loadStoredIgbtSelection = (): Record<MotorScope, MainScreenIgbtParameterId> => {
  if (typeof window === 'undefined') return { ...DEFAULT_MAIN_SCREEN_IGBT_SELECTION }

  try {
    const raw = window.localStorage.getItem(MAIN_SCREEN_IGBT_SELECTION_STORAGE_KEY)
    if (!raw) return { ...DEFAULT_MAIN_SCREEN_IGBT_SELECTION }

    const parsed = JSON.parse(raw) as Partial<Record<MotorScope, unknown>>
    return normalizeIgbtSelection(parsed)
  } catch {
    return { ...DEFAULT_MAIN_SCREEN_IGBT_SELECTION }
  }
}

const persistIgbtSelection = (selection: Record<MotorScope, MainScreenIgbtParameterId>) => {
  if (typeof window === 'undefined') return

  window.localStorage.setItem(MAIN_SCREEN_IGBT_SELECTION_STORAGE_KEY, JSON.stringify(selection))
}

const getWindingSelectionSummary = (
  selection: Record<WindingPhase, MainScreenWindingParameterId>
): string =>
  MOTOR_WINDING_PHASE_LABELS.map((phase) => {
    const parameterId = selection[phase]
    return WINDING_OPTION_BY_PARAMETER_ID.get(parameterId)?.label.replace('Winding ', '') ?? phase
  }).join(' / ')

const getResolvedMainScreenTemperatureRegister = (
  parameterId: ParameterId,
  scope: MotorScope
): number | undefined => {
  if (scope === 2) {
    const overrideRegister = MOTOR_TWO_MAIN_SCREEN_REGISTER_OVERRIDES[parameterId]
    if (typeof overrideRegister === 'number') {
      return overrideRegister
    }
  }

  return MAIN_SCREEN_TEMPERATURE_REGISTER_BY_PARAMETER.get(parameterId)
}

const useWagoTemperatureSnapshot = (
  scope: MotorScope
): Partial<Record<ParameterId, number | null>> => {
  const [valuesByParameter, setValuesByParameter] = useState<
    Partial<Record<ParameterId, number | null>>
  >({})
  const deviceId = getMotorWagoLiveDeviceId(scope)
  const resolvedParameterByRegister = useMemo(() => {
    const parameterByRegister = new Map<number, ParameterId>()

    MAIN_SCREEN_TEMPERATURE_PARAMETER_IDS.forEach((parameterId) => {
      const modbusRegister = getResolvedMainScreenTemperatureRegister(parameterId, scope)
      if (typeof modbusRegister === 'number') {
        parameterByRegister.set(modbusRegister, parameterId)
      }
    })

    return parameterByRegister
  }, [scope])

  useEffect(() => {
    let mounted = true

    const loadSnapshot = async () => {
      try {
        const snapshot = await fetchWagoLiveSnapshot({
          deviceId,
          registerType: 'holding',
          addresses: MAIN_SCREEN_TEMPERATURE_HOLDING_REGISTERS.map(toHoldingRegisterOffset)
        })

        if (!mounted) return

        const nextValues = snapshot.values.reduce<Partial<Record<ParameterId, number | null>>>(
          (map, entry) => {
            const parameterId = resolvedParameterByRegister.get(entry.modbus_register)
            if (parameterId) {
              map[parameterId] = entry.value
            }
            return map
          },
          {}
        )

        setValuesByParameter(nextValues)
      } catch {
        if (mounted) {
          setValuesByParameter({})
        }
      }
    }

    void loadSnapshot()
    const intervalId = window.setInterval(() => {
      void loadSnapshot()
    }, MAIN_SCREEN_WAGO_LIVE_POLL_MS)

    return () => {
      mounted = false
      window.clearInterval(intervalId)
    }
  }, [deviceId, resolvedParameterByRegister])

  return valuesByParameter
}

const useWagoTransducerSnapshot = (
  scope: MotorScope
): Partial<Record<MainScreenTransducerParameterId, number | null>> => {
  const [valuesByParameter, setValuesByParameter] = useState<
    Partial<Record<MainScreenTransducerParameterId, number | null>>
  >({})
  const deviceId = getMotorWagoLiveDeviceId(scope)
  const resolvedParameterByInputOffset = useMemo(
    () =>
      new Map<number, MainScreenTransducerParameterId>(
        MAIN_SCREEN_TRANSDUCER_INPUT_ENTRIES.map(([parameterId, inputOffset]) => [
          inputOffset,
          parameterId
        ])
      ),
    []
  )

  useEffect(() => {
    let mounted = true

    const loadSnapshot = async () => {
      try {
        const snapshot = await fetchWagoLiveSnapshot({
          deviceId,
          registerType: 'input',
          addresses: MAIN_SCREEN_TRANSDUCER_INPUT_OFFSETS.map((inputOffset) =>
            toInputRegisterOffset(443000 + inputOffset)
          )
        })

        if (!mounted) return

        const nextValues = snapshot.values.reduce<
          Partial<Record<MainScreenTransducerParameterId, number | null>>
        >((map, entry) => {
          const parameterId = resolvedParameterByInputOffset.get(entry.address)
          if (parameterId) {
            map[parameterId] = entry.value
          }
          return map
        }, {})

        setValuesByParameter(nextValues)
      } catch {
        if (mounted) {
          setValuesByParameter({})
        }
      }
    }

    void loadSnapshot()
    const intervalId = window.setInterval(() => {
      void loadSnapshot()
    }, MAIN_SCREEN_WAGO_LIVE_POLL_MS)

    return () => {
      mounted = false
      window.clearInterval(intervalId)
    }
  }, [deviceId, resolvedParameterByInputOffset])

  return valuesByParameter
}

const useMainBreakerStatus = (deviceId: DeviceId): MainBreakerStatus => {
  const [status, setStatus] = useState<MainBreakerStatus>('unknown')

  useEffect(() => {
    let mounted = true

    const loadSnapshot = async () => {
      try {
        const snapshot = await fetchWagoLiveSnapshot({
          deviceId,
          registerType: 'discrete',
          addresses: [MAIN_BREAKER_CLOSED_STATUS_REGISTER]
        })

        if (!mounted) return

        const closedStatus = snapshot.values.find(
          (entry) => entry.modbus_register === MAIN_BREAKER_CLOSED_STATUS_REGISTER
        )?.value

        if (!snapshot.connected || closedStatus === null || closedStatus === undefined) {
          setStatus('unknown')
          return
        }

        setStatus(Number(closedStatus) > 0 ? 'closed' : 'open')
      } catch {
        if (mounted) {
          setStatus('unknown')
        }
      }
    }

    void loadSnapshot()
    const intervalId = window.setInterval(() => {
      void loadSnapshot()
    }, MAIN_SCREEN_WAGO_LIVE_POLL_MS)

    return () => {
      mounted = false
      window.clearInterval(intervalId)
    }
  }, [deviceId])

  return status
}

const buildTemperatureCards = (
  rawValues: Record<string, unknown>,
  transducerValues: Partial<Record<MainScreenTransducerParameterId, number | null>>,
  temperatureUnit: TemperatureUnit,
  windingSelection: Record<WindingPhase, MainScreenWindingParameterId>,
  igbtSelection: MainScreenIgbtParameterId,
  actions?: {
    onWindingSelect?: () => void
    onIgbtSelect?: () => void
  }
): TemperatureSummaryCard[] => {
  const driveEnd = getTemperatureSnapshot(
    'Motor_Bearing_DE_DEGF',
    rawValues.Motor_Bearing_DE_DEGF,
    temperatureUnit
  )
  const nonDriveEnd = getTemperatureSnapshot(
    'Motor_Bearing_NDE_DEGF',
    rawValues.Motor_Bearing_NDE_DEGF,
    temperatureUnit
  )
  const coolantTemp = getTemperatureSnapshot(
    'Coolant_Temp_DEGF',
    rawValues.Coolant_Temp_DEGF,
    temperatureUnit
  )
  const driveEndAlertSeverity = getMotorTemperatureAlertSeverity(
    'Motor_Bearing_DE_DEGF',
    driveEnd.displayValue,
    temperatureUnit
  )
  const nonDriveEndAlertSeverity = getMotorTemperatureAlertSeverity(
    'Motor_Bearing_NDE_DEGF',
    nonDriveEnd.displayValue,
    temperatureUnit
  )
  const windingCards: TemperatureSummaryCard[] = []

  for (const phase of MOTOR_WINDING_PHASE_LABELS) {
    const parameterId = windingSelection[phase]
    const option = WINDING_OPTION_BY_PARAMETER_ID.get(parameterId)
    if (!option) continue

    const winding = getTemperatureSnapshot(parameterId, rawValues[parameterId], temperatureUnit)
    const alertSeverity = getMotorTemperatureAlertSeverity(
      parameterId,
      winding.displayValue,
      temperatureUnit
    )
    windingCards.push({
      id: `winding-${phase.toLowerCase()}${option.bank}`,
      label: option.label,
      value: formatTemperatureCardValue(winding.displayValue),
      unit: winding.displayValue === null ? undefined : winding.unit,
      tone: getTemperatureCardTone(
        alertSeverity,
        winding.displayValue === null ? 'default' : 'green'
      ),
      alertSeverity,
      animateAlert: shouldAnimateMotorTemperatureAlert(
        parameterId,
        winding.displayValue,
        temperatureUnit
      ),
      selectable: true
    })
  }

  const motorTorqueRaw = toNullableNumber(transducerValues.Motor_Torque_Transducer)
  const motorHorsepowerRaw = toNullableNumber(transducerValues.Motor_HP_Transducer)
  const motorRpmRaw = toNullableNumber(transducerValues.Motor_RPM_Transducer)
  const motorTorque =
    motorTorqueRaw === null
      ? null
      : scaleWagoTransducerRawValue('Motor_Torque_Transducer', motorTorqueRaw)
  const motorHorsepower =
    motorHorsepowerRaw === null
      ? null
      : scaleWagoTransducerRawValue('Motor_HP_Transducer', motorHorsepowerRaw)
  const motorRpm =
    motorRpmRaw === null ? null : scaleWagoTransducerRawValue('Motor_RPM_Transducer', motorRpmRaw)
  const driveMonitorCards: TemperatureSummaryCard[] = [
    {
      id: 'motor-torque',
      label: 'Motor Transducer Torque',
      value: formatMonitorCardValue(motorTorque, 0),
      unit: motorTorque === null ? undefined : 'ft lbs',
      tone: 'amber',
      alertSeverity: 'normal',
      animateAlert: false
    },
    {
      id: 'motor-hp',
      label: 'Motor Transducer HP',
      value: formatMonitorCardValue(motorHorsepower, 1),
      unit: motorHorsepower === null ? undefined : 'HP',
      tone: 'blue',
      alertSeverity: 'normal',
      animateAlert: false
    },
    {
      id: 'motor-rpm',
      label: 'Motor Transducer RPM',
      value: formatMonitorCardValue(motorRpm, 0),
      unit: motorRpm === null ? undefined : 'RPM',
      tone: 'blue',
      alertSeverity: 'normal',
      animateAlert: false
    }
  ]
  const igbtOption = IGBT_OPTION_BY_PARAMETER_ID.get(igbtSelection)
  const igbtSnapshot = getTemperatureSnapshot(igbtSelection, rawValues[igbtSelection], temperatureUnit)
  const igbtAlertSeverity = getMotorTemperatureAlertSeverity(
    igbtSelection,
    igbtSnapshot.displayValue,
    temperatureUnit
  )
  const igbtCard: TemperatureSummaryCard = {
    id: 'igbt-temp',
    label: igbtOption?.label ?? 'IGBT U1',
    value: formatTemperatureCardValue(igbtSnapshot.displayValue),
    unit: igbtSnapshot.displayValue === null ? undefined : igbtSnapshot.unit,
    tone: getTemperatureCardTone(
      igbtAlertSeverity,
      getTemperatureTone(igbtSnapshot.adjustedValueCelsius)
    ),
    alertSeverity: igbtAlertSeverity,
    animateAlert: shouldAnimateMotorTemperatureAlert(
      igbtSelection,
      igbtSnapshot.displayValue,
      temperatureUnit
    ),
    selectable: true,
    onSelect: actions?.onIgbtSelect
  }

  return [
    {
      id: 'drive-end',
      label: 'Drive End',
      value: formatTemperatureCardValue(driveEnd.displayValue),
      unit: driveEnd.displayValue === null ? undefined : driveEnd.unit,
      tone: getTemperatureCardTone(
        driveEndAlertSeverity,
        driveEnd.displayValue === null ? 'default' : 'green'
      ),
      alertSeverity: driveEndAlertSeverity,
      animateAlert: shouldAnimateMotorTemperatureAlert(
        'Motor_Bearing_DE_DEGF',
        driveEnd.displayValue,
        temperatureUnit
      )
    },
    {
      id: 'non-drive-end',
      label: 'Non-Drive End',
      value: formatTemperatureCardValue(nonDriveEnd.displayValue),
      unit: nonDriveEnd.displayValue === null ? undefined : nonDriveEnd.unit,
      tone: getTemperatureCardTone(
        nonDriveEndAlertSeverity,
        nonDriveEnd.displayValue === null ? 'default' : 'green'
      ),
      alertSeverity: nonDriveEndAlertSeverity,
      animateAlert: shouldAnimateMotorTemperatureAlert(
        'Motor_Bearing_NDE_DEGF',
        nonDriveEnd.displayValue,
        temperatureUnit
      )
    },
    {
      id: 'coolant-temp',
      label: 'Coolant Temp',
      value: formatTemperatureCardValue(coolantTemp.displayValue),
      unit: coolantTemp.displayValue === null ? undefined : coolantTemp.unit,
      tone: getTemperatureTone(coolantTemp.adjustedValueCelsius),
      alertSeverity: getMotorTemperatureAlertSeverity(
        'Coolant_Temp_DEGF',
        coolantTemp.displayValue,
        temperatureUnit
      ),
      animateAlert: shouldAnimateMotorTemperatureAlert(
        'Coolant_Temp_DEGF',
        coolantTemp.displayValue,
        temperatureUnit
      )
    },
    driveMonitorCards[0],
    driveMonitorCards[1],
    ...windingCards.map((card) => ({
      ...card,
      onSelect: actions?.onWindingSelect
    })),
    driveMonitorCards[2],
    igbtCard
  ]
}

const getDualMetricCardLabel = (parameterId: ParameterId): string => {
  switch (parameterId) {
    case 'P9.03':
      return 'RPM'
    case PARAMETER_ALIASES.motorCurrent:
    case PARAMETER_ALIASES.motorCurrentP9:
      return 'Current'
    case PARAMETER_ALIASES.torqueDemand:
      return 'Torque Demand'
    case PARAMETER_ALIASES.motorPower:
    case PARAMETER_ALIASES.motorPowerP9:
      return 'Motor Power'
    case PARAMETER_ALIASES.frequencyFeedback:
      return 'Frequency'
    case PARAMETER_ALIASES.dcLinkVoltage:
      return 'DC Link Voltage'
    case PARAMETER_ALIASES.motorVolts:
      return 'Motor Volts'
    case PARAMETER_ALIASES.speedFeedback:
      return 'Speed Feedback'
    case PARAMETER_ALIASES.speedReference:
      return 'Speed Reference'
    default: {
      const { label, unit } = getTrendDisplayMeta(parameterId)
      if (!unit) return label

      const normalizedUnit = unit.trim().toLowerCase()
      return label.replace(/\s*\(([^)]+)\)\s*$/, (match, inner: string) =>
        inner.trim().toLowerCase() === normalizedUnit ? '' : match
      )
    }
  }
}

const formatDualMetricUnit = (unit?: string): string | undefined => {
  if (!unit) return undefined
  if (unit === '% Top Speed') return '%'
  if (unit === 'rpm') return 'RPM'
  if (unit === 'Vrms') return 'V'
  return unit
}

const getDualMetricDisplayStyle = (
  parameterId: ParameterId
): {
  tone: DualTone
  accent: 'none' | 'blue' | 'green' | 'amber'
  fractionDigits: number
} => {
  switch (parameterId) {
    case 'P9.03':
      return { tone: 'blue', accent: 'none', fractionDigits: 0 }
    case PARAMETER_ALIASES.motorCurrent:
    case PARAMETER_ALIASES.motorCurrentP9:
      return { tone: 'green', accent: 'green', fractionDigits: 0 }
    case PARAMETER_ALIASES.torqueDemand:
      return { tone: 'amber', accent: 'amber', fractionDigits: 0 }
    case PARAMETER_ALIASES.motorPower:
    case PARAMETER_ALIASES.motorPowerP9:
      return { tone: 'blue', accent: 'blue', fractionDigits: 1 }
    case PARAMETER_ALIASES.frequencyFeedback:
      return { tone: 'blue', accent: 'none', fractionDigits: 1 }
    case PARAMETER_ALIASES.dcLinkVoltage:
      return { tone: 'default', accent: 'amber', fractionDigits: 0 }
    case PARAMETER_ALIASES.motorVolts:
      return { tone: 'blue', accent: 'none', fractionDigits: 0 }
    case PARAMETER_ALIASES.speedFeedback:
      return { tone: 'blue', accent: 'none', fractionDigits: 1 }
    case PARAMETER_ALIASES.speedReference:
      return { tone: 'blue', accent: 'none', fractionDigits: 0 }
    default: {
      const unit = PARAMETER_META[parameterId]?.unit
      return {
        tone: 'default',
        accent: 'none',
        fractionDigits: unit === 'kW' || unit === 'Hz' ? 1 : 0
      }
    }
  }
}

const toTrendModalValue = (config: StoredTrendConfig): GaugeConfigValue => {
  const range = PARAMETER_META[config.parameterId]?.range
  const minValue = typeof range?.min === 'number' && Number.isFinite(range.min) ? range.min : 0
  const maxValue =
    typeof range?.max === 'number' && Number.isFinite(range.max)
      ? range.max
      : Math.max(100, minValue + 1)

  return {
    parameterId: config.parameterId,
    minValue,
    maxValue
  }
}

interface WindingSelectionModalProps {
  isOpen: boolean
  selection: Record<WindingPhase, MainScreenWindingParameterId>
  onClose: () => void
  onSelect: (phase: WindingPhase, parameterId: MainScreenWindingParameterId) => void
}

const WindingSelectionModal = ({
  isOpen,
  selection,
  onClose,
  onSelect
}: WindingSelectionModalProps) => {
  return (
    <ModalBase
      isOpen={isOpen}
      onRequestClose={onClose}
      ariaLabel="Select main screen windings"
      width={560}
    >
      <S.WindingSelectorModal>
        <S.WindingSelectorHeader>
          <div>
            <S.WindingSelectorTitle>Select Windings</S.WindingSelectorTitle>
            <S.WindingSelectorSubtitle>
              Choose which winding temperature appears on the main screen.
            </S.WindingSelectorSubtitle>
          </div>
          <S.WindingSelectorCloseButton type="button" onClick={onClose} aria-label="Close">
            <X size={22} />
          </S.WindingSelectorCloseButton>
        </S.WindingSelectorHeader>

        <S.WindingSelectorRows>
          {MOTOR_WINDING_PHASE_LABELS.map((phase) => (
            <S.WindingSelectorRow key={phase}>
              <S.WindingSelectorPhase>Phase {phase}</S.WindingSelectorPhase>
              <S.WindingSelectorOptions>
                {WINDING_OPTIONS_BY_PHASE[phase].map((option) => {
                  const active = selection[phase] === option.parameterId

                  return (
                    <S.WindingSelectorOption
                      key={option.parameterId}
                      type="button"
                      $active={active}
                      onClick={() => onSelect(phase, option.parameterId)}
                    >
                      {option.label.replace('Winding ', '')}
                    </S.WindingSelectorOption>
                  )
                })}
              </S.WindingSelectorOptions>
            </S.WindingSelectorRow>
          ))}
        </S.WindingSelectorRows>

        <S.WindingSelectorFooter>
          Current: {getWindingSelectionSummary(selection)}
        </S.WindingSelectorFooter>
      </S.WindingSelectorModal>
    </ModalBase>
  )
}

interface IgbtSelectionModalProps {
  isOpen: boolean
  scope: MotorScope
  selection: Record<MotorScope, MainScreenIgbtParameterId>
  onClose: () => void
  onSelect: (scope: MotorScope, parameterId: MainScreenIgbtParameterId) => void
}

const IgbtSelectionModal = ({
  isOpen,
  scope,
  selection,
  onClose,
  onSelect
}: IgbtSelectionModalProps) => {
  const activeParameterId = selection[scope]

  return (
    <ModalBase
      isOpen={isOpen}
      onRequestClose={onClose}
      ariaLabel={`Select Motor #${scope} IGBT temperature`}
      width={680}
    >
      <S.WindingSelectorModal>
        <S.WindingSelectorHeader>
          <div>
            <S.WindingSelectorTitle>Select IGBT Temp</S.WindingSelectorTitle>
            <S.WindingSelectorSubtitle>
              Choose which IGBT temperature appears on the main screen for Motor #{scope}.
            </S.WindingSelectorSubtitle>
          </div>
          <S.WindingSelectorCloseButton type="button" onClick={onClose} aria-label="Close">
            <X size={22} />
          </S.WindingSelectorCloseButton>
        </S.WindingSelectorHeader>

        <S.WindingSelectorRows>
          {Object.entries(IGBT_OPTIONS_BY_BANK).map(([bank, options]) => (
            <S.WindingSelectorRow key={bank}>
              <S.WindingSelectorPhase>IGBT {bank}</S.WindingSelectorPhase>
              <S.IgbtSelectorOptions>
                {options.map((option) => {
                  const active = activeParameterId === option.parameterId

                  return (
                    <S.WindingSelectorOption
                      key={option.parameterId}
                      type="button"
                      $active={active}
                      onClick={() => onSelect(scope, option.parameterId)}
                    >
                      {option.phase}
                    </S.WindingSelectorOption>
                  )
                })}
              </S.IgbtSelectorOptions>
            </S.WindingSelectorRow>
          ))}
        </S.WindingSelectorRows>

        <S.WindingSelectorFooter>
          Current: {IGBT_OPTION_BY_PARAMETER_ID.get(activeParameterId)?.label ?? 'IGBT U1'}
        </S.WindingSelectorFooter>
      </S.WindingSelectorModal>
    </ModalBase>
  )
}

const handleSelectableCardKeyDown = (event: KeyboardEvent<HTMLDivElement>, action?: () => void) => {
  if (!action) return

  if (event.key !== 'Enter' && event.key !== ' ') return

  event.preventDefault()
  action()
}

const DualMotorPanel = ({
  title,
  berth,
  motorType = '',
  live,
  driveCommsOk = true,
  wagoCommsOk = true,
  mainBreakerStatus = 'unknown',
  stateLabel,
  stateTone,
  heroValue,
  heroValueUnit,
  heroValueTone = 'default',
  heroSecondaryValue,
  heroSecondaryUnit,
  heroSecondaryTone = 'default',
  metrics,
  temperatureCards,
  referenceValue,
  sliderValue,
  sliderDisabled,
  controlDisabled,
  modeSwitchDisabled,
  onParameterDetails,
  onMotorDetails,
  onMotorTypePress,
  onMetricPressStart,
  onMetricPressEnd,
  onSpeedStep,
  onSliderChange,
  onStart,
  onStop,
  onResetEstop,
  onEthernetMode,
  onDigitalMode,
  estopPressed = false,
  ethernetActive = false,
  digitalActive = false,
  modeBusy = false,
  driveBusy = false,
  resetBusy = false,
  resetDisabled = false
}: DualMotorPanelConfig) => {
  const { isViewOnly } = useAccessMode()
  const [localSliderValue, setLocalSliderValue] = useState(sliderValue)
  const sliderValueRef = useRef(sliderValue)
  const isSliderDragging = useRef(false)
  const isCompactMobile = useIsViewportBelow(768)
  const commsOk = driveCommsOk && wagoCommsOk
  const trimmedMotorType = motorType.trim()
  const mainBreakerLabel =
    mainBreakerStatus === 'closed' ? 'CLOSED' : mainBreakerStatus === 'open' ? 'OPEN' : 'UNKNOWN'
  const resetLabel = estopPressed ? 'E-STOP PRESSED' : 'E-STOP OK'
  const resetLabelSecondary = estopPressed ? 'PRESSED' : 'OK'
  const resetTone = estopPressed ? 'stop' : 'start'
  const startButtonTitle = driveBusy ? 'Starting drive' : 'Start drive'
  const stopButtonTitle = driveBusy ? 'Stopping drive' : 'Stop drive'
  const resetButtonTitle = resetBusy ? 'Resetting emergency stop' : resetLabel
  const breakerTitle = `Main breaker ${mainBreakerLabel.toLowerCase()}`
  const ethernetModeTitle =
    modeBusy && ethernetActive ? 'Switching to ConView Control' : 'ConView Control'
  const digitalModeTitle =
    modeBusy && digitalActive ? 'Switching to Keypad Control' : 'Keypad Control'
  const startStopDisabled = isViewOnly || controlDisabled
  const modeButtonsDisabled = isViewOnly || modeSwitchDisabled
  const resetActionDisabled = isViewOnly || resetDisabled

  useEffect(() => {
    sliderValueRef.current = sliderValue

    if (!isSliderDragging.current) {
      setLocalSliderValue(sliderValue)
    }
  }, [sliderValue])

  const updateSliderValue = (value: number) => {
    const nextValue = clampNumber(value, 0, MAX_SPEED_REFERENCE)
    sliderValueRef.current = nextValue
    setLocalSliderValue(nextValue)
  }

  const commitSliderValue = () => {
    if (!isSliderDragging.current) {
      return
    }

    isSliderDragging.current = false

    if (Math.abs(sliderValueRef.current - sliderValue) < 0.1) {
      return
    }

    onSliderChange?.(sliderValueRef.current)
  }

  const cancelSliderInteraction = () => {
    if (!isSliderDragging.current) {
      return
    }

    isSliderDragging.current = false
    updateSliderValue(sliderValue)
  }

  const handleSliderPointerDown = (event: PointerEvent<HTMLInputElement>) => {
    if (sliderDisabled) {
      return
    }

    event.stopPropagation()
    isSliderDragging.current = true
    event.currentTarget.setPointerCapture?.(event.pointerId)
  }

  const handleSliderPointerUp = (event: PointerEvent<HTMLInputElement>) => {
    event.stopPropagation()

    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }

    commitSliderValue()
  }

  const handleSliderPointerCancel = (event: PointerEvent<HTMLInputElement>) => {
    event.stopPropagation()
    cancelSliderInteraction()
  }

  const handleSliderLostPointerCapture = () => {
    commitSliderValue()
  }

  const handleSliderChange = (event: ChangeEvent<HTMLInputElement>) => {
    event.stopPropagation()
    updateSliderValue(Number(event.target.value))
  }

  const handleSliderKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    event.stopPropagation()
    isSliderDragging.current = true
  }

  const handleSliderKeyUp = (event: KeyboardEvent<HTMLInputElement>) => {
    event.stopPropagation()
    commitSliderValue()
  }

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleMultiTouchCancel = () => {
      if (!isSliderDragging.current) {
        return
      }

      isSliderDragging.current = false
      sliderValueRef.current = sliderValue
      setLocalSliderValue(sliderValue)
    }

    window.addEventListener(MULTI_TOUCH_CANCEL_EVENT, handleMultiTouchCancel)

    return () => {
      window.removeEventListener(MULTI_TOUCH_CANCEL_EVENT, handleMultiTouchCancel)
    }
  }, [sliderValue])

  const handleMetricTouchStart = (
    event: ReactTouchEvent<HTMLDivElement>,
    metricId: DualMetricSlotId
  ) => {
    if (!isSingleTouchContact(event.nativeEvent)) {
      onMetricPressEnd?.()
      return
    }

    onMetricPressStart?.(metricId)
  }

  return (
    <S.DualMotorPanel $live={live}>
      <S.DualMotorPanelHeader>
        <S.DualMotorHeading>
          <S.DualMotorTitleRow>
            <UserRound size={20} />
            <S.DualMotorTitle>{title}</S.DualMotorTitle>
            {berth ? <S.DualMotorSubheading>{berth}</S.DualMotorSubheading> : null}
          </S.DualMotorTitleRow>
        </S.DualMotorHeading>

        <S.DualPanelActions>
          <S.DualMotorTypeButton type="button" onClick={onMotorTypePress} disabled={isViewOnly}>
            <S.DualMotorTypeLabel>Motor Type</S.DualMotorTypeLabel>
            <S.DualMotorTypeValue $empty={!trimmedMotorType}>
              {trimmedMotorType || 'Tap to enter'}
            </S.DualMotorTypeValue>
          </S.DualMotorTypeButton>

          <S.DualCommsBadge $tone={commsOk ? 'ok' : 'off'}>
            <S.DualCommsBadgeTitle>
              <S.DualCommsBadgeDot $tone={commsOk ? 'ok' : 'off'} />
              <span>DRIVE - WAGO</span>
            </S.DualCommsBadgeTitle>
            <S.DualCommsBadgeMeta>
              {driveCommsOk ? 'Drive OK' : 'Drive OFF'} - {wagoCommsOk ? 'WAGO OK' : 'WAGO OFF'}
            </S.DualCommsBadgeMeta>
          </S.DualCommsBadge>

          <S.DualDetailsButton type="button" onClick={onParameterDetails}>
            PARAMETER DETAILS
            <ChevronRight size={18} />
          </S.DualDetailsButton>

          <S.DualDetailsButton type="button" onClick={onMotorDetails}>
            MOTOR DETAILS
            <ChevronRight size={18} />
          </S.DualDetailsButton>
        </S.DualPanelActions>
      </S.DualMotorPanelHeader>

      <S.DualMotorBody>
        <S.DualControlRow $compact={isCompactMobile}>
          <S.DualCommandButton
            type="button"
            $tone="start"
            $compact={isCompactMobile}
            disabled={startStopDisabled}
            onClick={onStart}
            title={startButtonTitle}
            aria-label={startButtonTitle}
          >
            <Play size={18} />
            {isCompactMobile ? null : driveBusy ? 'STARTING...' : 'START'}
          </S.DualCommandButton>

          <S.DualCommandButton
            type="button"
            $tone="stop"
            $compact={isCompactMobile}
            disabled={startStopDisabled}
            onClick={onStop}
            title={stopButtonTitle}
            aria-label={stopButtonTitle}
          >
            <Square size={18} />
            {isCompactMobile ? null : driveBusy ? 'STOPPING...' : 'STOP'}
          </S.DualCommandButton>

          <S.DualCommandButton
            type="button"
            $tone={resetTone}
            $active={estopPressed || resetBusy}
            $compact={isCompactMobile}
            disabled={resetActionDisabled}
            onClick={onResetEstop}
            title={resetButtonTitle}
            aria-label={resetButtonTitle}
          >
            <RefreshCcw size={18} />
            {isCompactMobile ? null : resetBusy ? (
              'RESETTING...'
            ) : (
              <S.DualModeButtonLabel>
                <span>E-STOP</span>
                <span>{resetLabelSecondary}</span>
              </S.DualModeButtonLabel>
            )}
          </S.DualCommandButton>

          <S.DualBreakerStatusButton
            $status={mainBreakerStatus}
            $compact={isCompactMobile}
            role="status"
            aria-label={breakerTitle}
            title={breakerTitle}
          >
            <Power size={18} />
            {isCompactMobile ? null : (
              <>
                <S.DualBreakerStatusLabel>MAIN BREAKER</S.DualBreakerStatusLabel>
                <S.DualBreakerStatusValue $status={mainBreakerStatus}>
                  {mainBreakerLabel}
                </S.DualBreakerStatusValue>
              </>
            )}
          </S.DualBreakerStatusButton>

          <S.DualCommandButton
            type="button"
            $tone="mode"
            $active={ethernetActive}
            $compact={isCompactMobile}
            disabled={modeButtonsDisabled}
            onClick={onEthernetMode}
            title={ethernetModeTitle}
            aria-label={ethernetModeTitle}
          >
            <Cable size={18} />
            {isCompactMobile ? null : modeBusy && ethernetActive ? (
              'SWITCHING...'
            ) : (
              <S.DualModeButtonLabel>
                <span>ConView</span>
                <span>Control</span>
              </S.DualModeButtonLabel>
            )}
          </S.DualCommandButton>

          <S.DualCommandButton
            type="button"
            $tone="mode"
            $active={digitalActive}
            $compact={isCompactMobile}
            disabled={modeButtonsDisabled}
            onClick={onDigitalMode}
            title={digitalModeTitle}
            aria-label={digitalModeTitle}
          >
            <Binary size={18} />
            {isCompactMobile ? null : modeBusy && digitalActive ? (
              'SWITCHING...'
            ) : (
              <S.DualModeButtonLabel>
                <span>Keypad</span>
                <span>Control</span>
              </S.DualModeButtonLabel>
            )}
          </S.DualCommandButton>
        </S.DualControlRow>

        <S.DualMotorHeroGrid>
          <S.DualHeroCard $tone={stateTone}>
            <S.DualHeroLabel>
              STATE:
              <S.DualHeroStateText $tone={stateTone}>{stateLabel}</S.DualHeroStateText>
            </S.DualHeroLabel>
            <S.DualHeroValueRow>
              <S.DualHeroValue $tone={heroValueTone}>{heroValue}</S.DualHeroValue>
              <S.DualHeroUnit>{heroValueUnit}</S.DualHeroUnit>
            </S.DualHeroValueRow>
            <S.DualHeroImage src={motorImage} alt="" aria-hidden="true" />
          </S.DualHeroCard>

          <S.DualHeroCard $tone="neutral">
            <S.DualHeroLabel>VOLTAGE</S.DualHeroLabel>
            <S.DualHeroValueRow>
              <S.DualHeroValue $tone={heroSecondaryTone}>{heroSecondaryValue}</S.DualHeroValue>
              <S.DualHeroUnit>{heroSecondaryUnit}</S.DualHeroUnit>
            </S.DualHeroValueRow>
            <S.DualHeroImage src={motorImage} alt="" aria-hidden="true" />
          </S.DualHeroCard>
        </S.DualMotorHeroGrid>

        <S.DualMetricsGrid>
          {metrics.map((metric) => (
            <S.DualMetricCard
              key={metric.id}
              $accent={metric.accent ?? 'none'}
              onMouseDown={() => onMetricPressStart?.(metric.id)}
              onMouseUp={onMetricPressEnd}
              onMouseLeave={onMetricPressEnd}
              onTouchStart={(event) => handleMetricTouchStart(event, metric.id)}
              onTouchEnd={onMetricPressEnd}
              onTouchCancel={onMetricPressEnd}
            >
              <S.DualMetricLabel>{metric.label}</S.DualMetricLabel>
              <S.DualMetricValueRow>
                <S.DualMetricValue $tone={metric.tone ?? 'default'}>
                  {metric.value}
                </S.DualMetricValue>
                {metric.unit ? <S.DualMetricUnit>{metric.unit}</S.DualMetricUnit> : null}
              </S.DualMetricValueRow>
            </S.DualMetricCard>
          ))}
        </S.DualMetricsGrid>

        <S.DualTemperatureGrid>
          {temperatureCards.map((card) => (
            <S.TemperatureCard
              key={card.id}
              $tone={card.tone}
              $alertSeverity={card.alertSeverity}
              $animateAlert={card.animateAlert}
              $selectable={card.selectable}
              $compact
              role={card.selectable ? 'button' : undefined}
              tabIndex={card.selectable ? 0 : undefined}
              onClick={card.selectable ? card.onSelect : undefined}
              onKeyDown={(event) =>
                card.selectable ? handleSelectableCardKeyDown(event, card.onSelect) : undefined
              }
            >
              <S.TemperatureLabel $compact>{card.label}</S.TemperatureLabel>
              <S.TemperatureValueRow $compact>
                <S.TemperatureValue
                  $tone={card.tone}
                  $alertSeverity={card.alertSeverity}
                  $animateAlert={card.animateAlert}
                  $compact
                >
                  {card.value}
                </S.TemperatureValue>
                {card.unit ? <S.TemperatureUnit $compact>{card.unit}</S.TemperatureUnit> : null}
              </S.TemperatureValueRow>
              {card.detail ? <S.TemperatureDetail>{card.detail}</S.TemperatureDetail> : null}
            </S.TemperatureCard>
          ))}
        </S.DualTemperatureGrid>

        <S.DualReferenceSection>
          <S.DualReferenceHeader>
            <S.DualReferenceLabel>Speed Adjustment</S.DualReferenceLabel>
            {isViewOnly ? <S.DualReferenceMeta>View Only</S.DualReferenceMeta> : null}
          </S.DualReferenceHeader>

          {isViewOnly ? (
            <S.DualReferenceValue>{referenceValue}</S.DualReferenceValue>
          ) : (
            <>
              <S.DualReferenceControlRow>
                <S.DualAdjustmentCluster $align="start">
                  <S.DualAdjustmentButton
                    type="button"
                    disabled={controlDisabled}
                    onClick={() => onSpeedStep?.(-1)}
                  >
                    -1%
                  </S.DualAdjustmentButton>
                  <S.DualAdjustmentButton
                    type="button"
                    disabled={controlDisabled}
                    onClick={() => onSpeedStep?.(-10)}
                  >
                    -10%
                  </S.DualAdjustmentButton>
                </S.DualAdjustmentCluster>

                <S.DualReferenceValue>{referenceValue}</S.DualReferenceValue>

                <S.DualAdjustmentCluster $align="end">
                  <S.DualAdjustmentButton
                    type="button"
                    disabled={controlDisabled}
                    onClick={() => onSpeedStep?.(10)}
                  >
                    +10%
                  </S.DualAdjustmentButton>
                  <S.DualAdjustmentButton
                    type="button"
                    disabled={controlDisabled}
                    onClick={() => onSpeedStep?.(1)}
                  >
                    +1%
                  </S.DualAdjustmentButton>
                </S.DualAdjustmentCluster>
              </S.DualReferenceControlRow>

              <S.DualRangeShell>
                <S.DualRangeLabel>0%</S.DualRangeLabel>
                <S.DualRangeInput
                  type="range"
                  min="0"
                  max={MAX_SPEED_REFERENCE}
                  step="1"
                  value={localSliderValue}
                  disabled={sliderDisabled}
                  onPointerDown={handleSliderPointerDown}
                  onPointerUp={handleSliderPointerUp}
                  onPointerCancel={handleSliderPointerCancel}
                  onLostPointerCapture={handleSliderLostPointerCapture}
                  onChange={handleSliderChange}
                  onKeyDown={handleSliderKeyDown}
                  onKeyUp={handleSliderKeyUp}
                  onBlur={commitSliderValue}
                  onClick={(event) => event.stopPropagation()}
                />
                <S.DualRangeLabel>{MAX_SPEED_REFERENCE}%</S.DualRangeLabel>
              </S.DualRangeShell>
            </>
          )}
        </S.DualReferenceSection>
      </S.DualMotorBody>
    </S.DualMotorPanel>
  )
}

const SingleMotorMainScreen = () => {
  const singleMotorScope = usePreferredSingleMotorScope()
  const driveId = getMotorDriveDeviceId(singleMotorScope)
  const wagoId = getMotorWagoDeviceId(singleMotorScope)
  const { data: driveData, raw: driveRaw } = useDeviceData(driveId)
  const motorTemperatureRaw = useWagoTemperatureSnapshot(singleMotorScope)
  const motorTransducerRaw = useWagoTransducerSnapshot(singleMotorScope)
  const mainBreakerStatus = useMainBreakerStatus(wagoId)
  const [temperatureUnit] = useTemperatureUnitPreference()

  const { writeParameter } = useSendCommand()
  const [speedRef, setSpeedRef] = useState<number>(0)
  const [windingSelection, setWindingSelection] = useState(loadStoredWindingSelection)
  const [isWindingSelectorOpen, setIsWindingSelectorOpen] = useState(false)
  const [igbtSelection, setIgbtSelection] = useState(loadStoredIgbtSelection)
  const [isIgbtSelectorOpen, setIsIgbtSelectorOpen] = useState(false)
  const {
    motorTypes,
    openMotorTypeEditor,
    keyboardState,
    handleMotorTypeConfirm,
    closeMotorTypeEditor
  } = useMotorTypeEditor()

  useEffect(() => {
    const live = driveData.speedReference?.value
    if (live !== undefined && live !== null) {
      const numeric = Number(live)
      if (!Number.isNaN(numeric)) setSpeedRef(numeric)
    }
  }, [driveData])

  const electrical = useMemo(() => {
    return {
      volts: toFiniteNumber(driveData.motorVolts?.value),
      hz: toFiniteNumber(driveData.frequencyFeedback?.value),
      kw: toFiniteNumber(driveData.motorPower?.value),
      amps: toFiniteNumber(driveData.motorCurrent?.value),
      torque: toFiniteNumber(driveData.torqueDemand?.value)
    }
  }, [driveData])

  const clampZeroReferenceSource = driveRaw[CLAMP_ZERO_REFERENCE_PARAMETER_ID]
  const isClampZeroReferenceCleared =
    clampZeroReferenceSource === undefined || clampZeroReferenceSource === null
      ? true
      : Math.abs(Number(clampZeroReferenceSource)) < 0.01

  const isEthernetModeActive =
    Number(driveData.speedReferenceSource?.value) === ETHERNET_REFERENCE_SOURCE_VALUE &&
    isClampZeroReferenceCleared

  const driveRunning = electrical.hz > 0.1 || electrical.torque > 0.1 || electrical.amps > 0.1
  const temperatureCards = useMemo(
    () =>
      buildTemperatureCards(
        motorTemperatureRaw,
        motorTransducerRaw,
        temperatureUnit,
        windingSelection,
        igbtSelection[singleMotorScope],
        {
          onWindingSelect: () => setIsWindingSelectorOpen(true),
          onIgbtSelect: () => setIsIgbtSelectorOpen(true)
        }
      ),
    [
      motorTemperatureRaw,
      motorTransducerRaw,
      temperatureUnit,
      windingSelection,
      igbtSelection,
      singleMotorScope
    ]
  )

  const [controlState, setControlState] = useState({
    mode: 'local',
    breaker: 'closed',
    driveRunning: false,
    driveFault: false,
    blower: 'on',
    motorTempWarn: 'ok',
    motorTempHigh: 'ok'
  })

  useEffect(() => {
    setControlState((prev) => ({
      ...prev,
      driveRunning
    }))
  }, [driveRunning])

  const handleSetSpeedRef = async (value: number) => {
    if (!isEthernetModeActive) return

    const nextValue = clampNumber(value, 0, MAX_SPEED_REFERENCE)
    setSpeedRef(nextValue)
    await writeParameter({
      deviceId: driveId,
      parameterId: ETHERNET_REFERENCE_PARAMETER_ID,
      value: nextValue
    })
  }

  const handleSelectWinding = (phase: WindingPhase, parameterId: MainScreenWindingParameterId) => {
    setWindingSelection((prev) => {
      const next = normalizeWindingSelection({ ...prev, [phase]: parameterId })
      persistWindingSelection(next)
      return next
    })
  }

  const handleSelectIgbt = (scope: MotorScope, parameterId: MainScreenIgbtParameterId) => {
    setIgbtSelection((prev) => {
      const next = normalizeIgbtSelection({ ...prev, [scope]: parameterId })
      persistIgbtSelection(next)
      return next
    })
  }

  return (
    <ScreenLayout>
      <S.MainContainer>
        <ClientMotorInfo position={{ left: 20, top: 0 }} width={380} height={850} />

        <DriveControl
          deviceId={driveId}
          wagoId={wagoId}
          controlState={controlState}
          setControlState={setControlState}
          position={{ left: 1520, top: 0 }}
          height={850}
          width={350}
        />

        <ElectricalParams
          deviceId={driveId}
          deviceSnapshot={driveRaw}
          mainBreakerStatus={mainBreakerStatus}
          position={{ left: 420, top: 0 }}
          height={460}
          connectedMotorLabel={`Motor #${singleMotorScope}`}
          motorType={motorTypes[singleMotorScope]}
          onMotorTypePress={() => openMotorTypeEditor(singleMotorScope)}
        />

        <SpeedControl
          speedRef={speedRef}
          setSpeedRef={handleSetSpeedRef}
          speedReferenceSourceValue={driveData.speedReferenceSource?.value}
          isEthernetMode={isEthernetModeActive}
          position={{ left: 420, bottom: 1 }}
          height={185}
          width={1080}
        />

        <S.TrendTile $position={{ left: 420, top: 466 }} $width={1080} $height={194}>
          <S.SingleTemperaturePanel>
            <S.SingleTemperatureDeck>
              {temperatureCards.map((card) => (
                <S.TemperatureCard
                  key={card.id}
                  $tone={card.tone}
                  $alertSeverity={card.alertSeverity}
                  $animateAlert={card.animateAlert}
                  $selectable={card.selectable}
                  $compact
                  role={card.selectable ? 'button' : undefined}
                  tabIndex={card.selectable ? 0 : undefined}
                  onClick={card.selectable ? card.onSelect : undefined}
                  onKeyDown={(event) =>
                    card.selectable ? handleSelectableCardKeyDown(event, card.onSelect) : undefined
                  }
                >
                  <S.TemperatureLabel $compact>{card.label}</S.TemperatureLabel>
                  <S.TemperatureValueRow $compact>
                    <S.TemperatureValue
                      $tone={card.tone}
                      $alertSeverity={card.alertSeverity}
                      $animateAlert={card.animateAlert}
                      $compact
                    >
                      {card.value}
                    </S.TemperatureValue>
                    {card.unit ? <S.TemperatureUnit $compact>{card.unit}</S.TemperatureUnit> : null}
                  </S.TemperatureValueRow>
                  {card.detail ? <S.TemperatureDetail>{card.detail}</S.TemperatureDetail> : null}
                </S.TemperatureCard>
              ))}
            </S.SingleTemperatureDeck>
          </S.SingleTemperaturePanel>
        </S.TrendTile>
      </S.MainContainer>

      <WindingSelectionModal
        isOpen={isWindingSelectorOpen}
        selection={windingSelection}
        onClose={() => setIsWindingSelectorOpen(false)}
        onSelect={handleSelectWinding}
      />

      <IgbtSelectionModal
        isOpen={isIgbtSelectorOpen}
        scope={singleMotorScope}
        selection={igbtSelection}
        onClose={() => setIsIgbtSelectorOpen(false)}
        onSelect={handleSelectIgbt}
      />

      <VirtualKeyboard
        visible={keyboardState.visible}
        mode="text"
        label={keyboardState.label}
        initialValue={keyboardState.initialValue}
        onConfirm={handleMotorTypeConfirm}
        onCancel={closeMotorTypeEditor}
      />
    </ScreenLayout>
  )
}

interface DualMotorMainScreenProps {
  visibleScopes?: readonly MotorScope[]
}

const DualMotorMainScreen = ({ visibleScopes }: DualMotorMainScreenProps) => {
  const navigate = useNavigate()
  const { isViewOnly } = useAccessMode()
  const [temperatureUnit] = useTemperatureUnitPreference()
  const { showNotice } = useTopBannerNotice()
  const motorOneDriveId = getMotorDriveDeviceId(1)
  const motorOneWagoId = getMotorWagoDeviceId(1)
  const motorTwoDriveId = getMotorDriveDeviceId(2)
  const motorTwoWagoId = getMotorWagoDeviceId(2)
  const motorOneMainBreakerStatus = useMainBreakerStatus(motorOneWagoId)
  const motorTwoMainBreakerStatus = useMainBreakerStatus(motorTwoWagoId)
  const { data: motorOneDriveData, raw: motorOneDriveRaw } = useDeviceData(motorOneDriveId)
  const { raw: motorOneWagoRaw } = useDeviceData(motorOneWagoId)
  const { data: motorTwoDriveData, raw: motorTwoDriveRaw } = useDeviceData(motorTwoDriveId)
  const { raw: motorTwoWagoRaw } = useDeviceData(motorTwoWagoId)
  const motorOneTemperatureRaw = useWagoTemperatureSnapshot(1)
  const motorTwoTemperatureRaw = useWagoTemperatureSnapshot(2)
  const motorOneTransducerRaw = useWagoTransducerSnapshot(1)
  const motorTwoTransducerRaw = useWagoTransducerSnapshot(2)
  const { writeParameter, executeAction } = useSendCommand()
  const [speedRefByMotor, setSpeedRefByMotor] = useState<Record<MotorScope, number>>({
    1: 0,
    2: 0
  })
  const [modeChangeInFlight, setModeChangeInFlight] = useState<
    Record<MotorScope, DriveMode | null>
  >({
    1: null,
    2: null
  })
  const [driveCommandInFlight, setDriveCommandInFlight] = useState<
    Record<MotorScope, 'start' | 'stop' | null>
  >({
    1: null,
    2: null
  })
  const [estopResetInFlight, setEstopResetInFlight] = useState<Record<MotorScope, boolean>>({
    1: false,
    2: false
  })
  const [dualMetricConfigByPanel, setDualMetricConfigByPanel] = useState<StoredDualMetricConfig>(
    loadStoredDualMetricConfig
  )
  const [isMotorDetailsOpen, setIsMotorDetailsOpen] = useState(false)
  const [windingSelection, setWindingSelection] = useState(loadStoredWindingSelection)
  const [isWindingSelectorOpen, setIsWindingSelectorOpen] = useState(false)
  const [igbtSelection, setIgbtSelection] = useState(loadStoredIgbtSelection)
  const [igbtSelectorScope, setIgbtSelectorScope] = useState<MotorScope>(1)
  const [isIgbtSelectorOpen, setIsIgbtSelectorOpen] = useState(false)
  const dualMetricPressTimer = useRef<number | null>(null)
  const [editingDualMetric, setEditingDualMetric] = useState<{
    panelId: DualMetricPanelId
    slotId: DualMetricSlotId
  } | null>(null)
  const {
    motorTypes,
    openMotorTypeEditor,
    keyboardState,
    handleMotorTypeConfirm,
    closeMotorTypeEditor
  } = useMotorTypeEditor()
  const defaultDualMetricConfig = useMemo(() => createDefaultDualMetricConfig(), [])

  const dualMetricParameterIdsByRole = useMemo(() => {
    const driveParameterIds = new Set<ParameterId>()
    const wagoParameterIds = new Set<ParameterId>()

    DUAL_METRIC_PANEL_IDS.forEach((panelId) => {
      DUAL_METRIC_SLOT_IDS.forEach((slotId) => {
        const parameterId =
          dualMetricConfigByPanel[panelId]?.[slotId]?.parameterId ??
          defaultDualMetricConfig[panelId][slotId].parameterId

        const variable = AVAILABLE_VARIABLES_BY_ID.get(parameterId)
        if (variable?.deviceRole === 'wago') {
          wagoParameterIds.add(parameterId)
          return
        }

        driveParameterIds.add(parameterId)
      })
    })

    return {
      drive: Array.from(driveParameterIds),
      wago: Array.from(wagoParameterIds)
    }
  }, [defaultDualMetricConfig, dualMetricConfigByPanel])

  const driveOnDemandParameterIds = useMemo(
    () => Array.from(new Set([...MODE_PARAMETER_IDS, ...dualMetricParameterIdsByRole.drive])),
    [dualMetricParameterIdsByRole.drive]
  )

  useOnDemandParameters({
    deviceId: motorOneDriveId,
    parameterIds: driveOnDemandParameterIds,
    limit: 32
  })

  useOnDemandParameters({
    deviceId: motorTwoDriveId,
    parameterIds: driveOnDemandParameterIds,
    limit: 32
  })

  useEffect(() => {
    const live = motorOneDriveData.speedReference?.value
    if (live !== undefined && live !== null) {
      const numeric = Number(live)
      if (!Number.isNaN(numeric)) {
        setSpeedRefByMotor((prev) => (prev[1] === numeric ? prev : { ...prev, 1: numeric }))
      }
    }
  }, [motorOneDriveData.speedReference?.value])

  useEffect(() => {
    const live = motorTwoDriveData.speedReference?.value
    if (live !== undefined && live !== null) {
      const numeric = Number(live)
      if (!Number.isNaN(numeric)) {
        setSpeedRefByMotor((prev) => (prev[2] === numeric ? prev : { ...prev, 2: numeric }))
      }
    }
  }, [motorTwoDriveData.speedReference?.value])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleMultiTouchCancel = () => {
      if (dualMetricPressTimer.current !== null) {
        window.clearTimeout(dualMetricPressTimer.current)
        dualMetricPressTimer.current = null
      }
    }

    window.addEventListener(MULTI_TOUCH_CANCEL_EVENT, handleMultiTouchCancel)

    return () => {
      window.removeEventListener(MULTI_TOUCH_CANCEL_EVENT, handleMultiTouchCancel)
      if (dualMetricPressTimer.current !== null) {
        window.clearTimeout(dualMetricPressTimer.current)
        dualMetricPressTimer.current = null
      }
    }
  }, [])

  useOnDemandParameters({
    deviceId: motorOneWagoId,
    parameterIds: dualMetricParameterIdsByRole.wago,
    limit: 16
  })

  useOnDemandParameters({
    deviceId: motorTwoWagoId,
    parameterIds: dualMetricParameterIdsByRole.wago,
    limit: 16
  })

  const getDriveModeFromRaw = (driveRaw: Record<string, unknown>): DriveMode => {
    const cf0 = Number(driveRaw[CF0_SOURCE_PARAMETER_ID])
    const cf1 = Number(driveRaw[CF1_SOURCE_PARAMETER_ID])
    const cf2 = Number(driveRaw[CF2_SOURCE_PARAMETER_ID])
    const cf4 = Number(driveRaw[CF4_SOURCE_PARAMETER_ID])
    const cf5 = Number(driveRaw[CF5_SOURCE_PARAMETER_ID])
    const cf6 = Number(driveRaw[CF6_SOURCE_PARAMETER_ID])
    const cf7 = Number(driveRaw[CF7_SOURCE_PARAMETER_ID])
    const cf116 = Number(driveRaw[CF116_SOURCE_PARAMETER_ID])
    const speedReference2Source = Number(driveRaw[SPEED_REFERENCE_2_SOURCE_PARAMETER_ID])
    const speedReference3Source = Number(driveRaw[SPEED_REFERENCE_3_SOURCE_PARAMETER_ID])
    const speedReference4Source = Number(driveRaw[SPEED_REFERENCE_4_SOURCE_PARAMETER_ID])
    const backupSpeedReferenceSource = Number(driveRaw[BACKUP_SPEED_REFERENCE_SOURCE_PARAMETER_ID])
    const clampZeroReference = Number(driveRaw[CLAMP_ZERO_REFERENCE_PARAMETER_ID])
    const pointer1Source = Number(driveRaw[POINTER_1_SOURCE_PARAMETER_ID])
    const pointer1Scale = Number(driveRaw[POINTER_1_SCALE_PARAMETER_ID])
    const speedReferenceSource = Number(driveRaw[SPEED_REFERENCE_SOURCE_PARAMETER_ID])

    if (
      cf0 === ETHERNET_MODE_VALUES[CF0_SOURCE_PARAMETER_ID] &&
      cf1 === ETHERNET_MODE_VALUES[CF1_SOURCE_PARAMETER_ID] &&
      cf2 === ETHERNET_MODE_VALUES[CF2_SOURCE_PARAMETER_ID] &&
      cf4 === ETHERNET_MODE_VALUES[CF4_SOURCE_PARAMETER_ID] &&
      cf5 === ETHERNET_MODE_VALUES[CF5_SOURCE_PARAMETER_ID] &&
      cf6 === ETHERNET_MODE_VALUES[CF6_SOURCE_PARAMETER_ID] &&
      cf7 === ETHERNET_MODE_VALUES[CF7_SOURCE_PARAMETER_ID] &&
      cf116 === ETHERNET_MODE_VALUES[CF116_SOURCE_PARAMETER_ID] &&
      Math.abs(pointer1Source - ETHERNET_POINTER_SOURCE_VALUE) < 0.01 &&
      Math.abs(pointer1Scale - ETHERNET_POINTER_SCALE_VALUE) < 0.01 &&
      clampZeroReference === ETHERNET_MODE_VALUES[CLAMP_ZERO_REFERENCE_PARAMETER_ID] &&
      speedReferenceSource === ETHERNET_SPEED_REFERENCE_SOURCE_VALUE
    ) {
      return 'ethernet'
    }

    if (
      cf0 === DIGITAL_INPUT_MODE_VALUES[CF0_SOURCE_PARAMETER_ID] &&
      cf1 === DIGITAL_INPUT_MODE_VALUES[CF1_SOURCE_PARAMETER_ID] &&
      cf2 === DIGITAL_INPUT_MODE_VALUES[CF2_SOURCE_PARAMETER_ID] &&
      cf4 === DIGITAL_INPUT_MODE_VALUES[CF4_SOURCE_PARAMETER_ID] &&
      cf5 === DIGITAL_INPUT_MODE_VALUES[CF5_SOURCE_PARAMETER_ID] &&
      cf6 === DIGITAL_INPUT_MODE_VALUES[CF6_SOURCE_PARAMETER_ID] &&
      cf7 === DIGITAL_INPUT_MODE_VALUES[CF7_SOURCE_PARAMETER_ID] &&
      cf116 === DIGITAL_INPUT_MODE_VALUES[CF116_SOURCE_PARAMETER_ID] &&
      speedReferenceSource ===
        DIGITAL_INPUT_REFERENCE_VALUES[SPEED_REFERENCE_SOURCE_PARAMETER_ID] &&
      speedReference2Source ===
        DIGITAL_INPUT_REFERENCE_VALUES[SPEED_REFERENCE_2_SOURCE_PARAMETER_ID] &&
      speedReference3Source ===
        DIGITAL_INPUT_REFERENCE_VALUES[SPEED_REFERENCE_3_SOURCE_PARAMETER_ID] &&
      speedReference4Source ===
        DIGITAL_INPUT_REFERENCE_VALUES[SPEED_REFERENCE_4_SOURCE_PARAMETER_ID] &&
      backupSpeedReferenceSource ===
        DIGITAL_INPUT_REFERENCE_VALUES[BACKUP_SPEED_REFERENCE_SOURCE_PARAMETER_ID]
    ) {
      return 'digital-input'
    }

    return 'custom'
  }

  const motorOneElectrical = {
    motorVolts: toFiniteNumber(motorOneDriveData.motorVolts?.value),
    volts: toFiniteNumber(motorOneDriveData.dcLinkVoltage?.value),
    hz: toFiniteNumber(motorOneDriveData.frequencyFeedback?.value),
    kw: toFiniteNumber(motorOneDriveData.motorPower?.value),
    amps: toFiniteNumber(motorOneDriveData.motorCurrent?.value),
    torque: toFiniteNumber(motorOneDriveData.torqueDemand?.value)
  }
  const motorTwoElectrical = {
    motorVolts: toFiniteNumber(motorTwoDriveData.motorVolts?.value),
    volts: toFiniteNumber(motorTwoDriveData.dcLinkVoltage?.value),
    hz: toFiniteNumber(motorTwoDriveData.frequencyFeedback?.value),
    kw: toFiniteNumber(motorTwoDriveData.motorPower?.value),
    amps: toFiniteNumber(motorTwoDriveData.motorCurrent?.value),
    torque: toFiniteNumber(motorTwoDriveData.torqueDemand?.value)
  }

  const motorOneDriveMode = useMemo(() => getDriveModeFromRaw(motorOneDriveRaw), [motorOneDriveRaw])
  const motorTwoDriveMode = useMemo(() => getDriveModeFromRaw(motorTwoDriveRaw), [motorTwoDriveRaw])

  const motorOneLiveRpm = toFiniteNumber(motorOneDriveRaw[DRIVE_RPM_PARAMETER_ID])
  const motorTwoLiveRpm = toFiniteNumber(motorTwoDriveRaw[DRIVE_RPM_PARAMETER_ID])
  const motorOneDriveRunning =
    isSignalActive(motorOneWagoRaw.RB_Drive_Running) ||
    Math.abs(motorOneLiveRpm) > 0.1 ||
    motorOneElectrical.hz > 0.1 ||
    motorOneElectrical.torque > 0.1
  const motorTwoDriveRunning =
    isSignalActive(motorTwoWagoRaw.RB_Drive_Running) ||
    Math.abs(motorTwoLiveRpm) > 0.1 ||
    motorTwoElectrical.hz > 0.1 ||
    motorTwoElectrical.torque > 0.1

  const handleOpenParameterDetails = (scope: MotorScope) => {
    setPreferredSingleMotorScopePreference(scope)
    navigate('/drive-parameters', {
      flushSync: true,
      state: { motorScope: scope }
    })
  }

  const handleOpenMotorDetails = () => {
    setIsMotorDetailsOpen(true)
  }

  const handleSelectWinding = (phase: WindingPhase, parameterId: MainScreenWindingParameterId) => {
    setWindingSelection((prev) => {
      const next = normalizeWindingSelection({ ...prev, [phase]: parameterId })
      persistWindingSelection(next)
      return next
    })
  }

  const handleSelectIgbt = (scope: MotorScope, parameterId: MainScreenIgbtParameterId) => {
    setIgbtSelection((prev) => {
      const next = normalizeIgbtSelection({ ...prev, [scope]: parameterId })
      persistIgbtSelection(next)
      return next
    })
  }

  const cancelDualMetricPress = () => {
    if (dualMetricPressTimer.current !== null) {
      window.clearTimeout(dualMetricPressTimer.current)
      dualMetricPressTimer.current = null
    }
  }

  const startDualMetricPress = (panelId: DualMetricPanelId, slotId: DualMetricSlotId) => {
    cancelDualMetricPress()
    dualMetricPressTimer.current = window.setTimeout(() => {
      dualMetricPressTimer.current = null
      setEditingDualMetric({ panelId, slotId })
    }, LONG_PRESS_MS)
  }

  const editingDualMetricConfig = editingDualMetric
    ? toTrendModalValue(
        dualMetricConfigByPanel[editingDualMetric.panelId]?.[editingDualMetric.slotId] ??
          defaultDualMetricConfig[editingDualMetric.panelId][editingDualMetric.slotId]
      )
    : null

  const editingDualMetricMeta = editingDualMetricConfig
    ? getTrendDisplayMeta(editingDualMetricConfig.parameterId)
    : null
  const editingDualMetricSubtitle =
    editingDualMetricConfig && editingDualMetricMeta
      ? formatParameterLabelWithId(editingDualMetricConfig.parameterId, editingDualMetricMeta.label)
      : undefined

  const handleSaveDualMetric = (next: GaugeConfigValue) => {
    if (!editingDualMetric) return

    setDualMetricConfigByPanel((prev) => {
      const updated: StoredDualMetricConfig = {
        ...prev,
        [editingDualMetric.panelId]: {
          ...prev[editingDualMetric.panelId],
          [editingDualMetric.slotId]: {
            parameterId: next.parameterId
          }
        }
      }
      persistStoredDualMetricConfig(updated)
      return updated
    })

    setEditingDualMetric(null)
  }

  const getMetricSourceValue = (
    parameterId: ParameterId,
    driveRaw: Record<string, unknown>,
    wagoRaw: Record<string, unknown>
  ): number => {
    const variable = AVAILABLE_VARIABLES_BY_ID.get(parameterId)
    if (variable?.deviceRole === 'wago') {
      return toFiniteNumber(wagoRaw[parameterId])
    }

    return toFiniteNumber(driveRaw[parameterId])
  }

  const buildPanelMetrics = (scope: MotorScope): DualMetric[] => {
    const panelId = DUAL_PANEL_ID_BY_SCOPE[scope]
    const driveRaw = scope === 1 ? motorOneDriveRaw : motorTwoDriveRaw
    const wagoRaw = scope === 1 ? motorOneWagoRaw : motorTwoWagoRaw

    return DUAL_METRIC_SLOT_IDS.map((slotId) => {
      const parameterId =
        dualMetricConfigByPanel[panelId]?.[slotId]?.parameterId ??
        defaultDualMetricConfig[panelId][slotId].parameterId
      const { tone, accent, fractionDigits } = getDualMetricDisplayStyle(parameterId)
      const sourceValue = getMetricSourceValue(parameterId, driveRaw, wagoRaw)
      const displayOverride = getMotorMonitorValueOverride(parameterId, sourceValue)
      const unit =
        displayOverride?.unit ??
        formatDualMetricUnit(
          AVAILABLE_VARIABLES_BY_ID.get(parameterId)?.unit || PARAMETER_META[parameterId]?.unit
        )

      return {
        id: slotId,
        label: getDualMetricCardLabel(parameterId),
        value: displayOverride?.valueText ?? formatDisplayNumber(sourceValue, fractionDigits),
        unit,
        tone,
        accent
      }
    })
  }

  const delay = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms))

  const getDriveIdForMotor = (scope: MotorScope): DeviceId =>
    scope === 1 ? motorOneDriveId : motorTwoDriveId

  const getWagoIdForMotor = (scope: MotorScope): DeviceId =>
    scope === 1 ? motorOneWagoId : motorTwoWagoId

  const setMotorNotice = (
    _scope: MotorScope,
    notice: { tone: NoticeTone; message: string } | null
  ) => {
    if (notice) {
      showNotice(notice, 4000)
    }
  }

  const isMotorBusy = (scope: MotorScope): boolean =>
    driveCommandInFlight[scope] !== null ||
    modeChangeInFlight[scope] !== null ||
    estopResetInFlight[scope]

  const isMotorDriveCommsOk = (scope: MotorScope): boolean =>
    scope === 1 ? motorOneDriveCommsOk : motorTwoDriveCommsOk

  const isMotorWagoCommsOk = (scope: MotorScope): boolean =>
    scope === 1 ? motorOneWagoCommsOk : motorTwoWagoCommsOk

  const isMotorEstopPressed = (scope: MotorScope): boolean =>
    scope === 1 ? motorOneEstopPressed : motorTwoEstopPressed

  const isMotorEthernetMode = (scope: MotorScope): boolean =>
    (scope === 1 ? motorOneDriveMode : motorTwoDriveMode) === 'ethernet'

  const writeParameterOrThrow = async (
    deviceId: DeviceId,
    parameterId: ParameterId,
    value: number,
    errorMessage: string
  ) => {
    const wrote = await writeParameter({
      deviceId,
      parameterId,
      value
    })

    if (!wrote) {
      throw new Error(errorMessage)
    }
  }

  const holdMomentaryWagoCommand = async (
    deviceId: DeviceId,
    parameterId: ParameterId,
    holdMs: number,
    commandLabel: string
  ) => {
    const holdUntil = Date.now() + holdMs

    await writeParameterOrThrow(deviceId, parameterId, 0, `Failed to reset ${commandLabel}.`)
    await writeParameterOrThrow(deviceId, parameterId, 1, `Failed to send ${commandLabel}.`)

    while (Date.now() < holdUntil) {
      await delay(Math.min(WAGO_COMMAND_REFRESH_MS, holdUntil - Date.now()))
      if (Date.now() < holdUntil) {
        await writeParameterOrThrow(deviceId, parameterId, 1, `Failed to sustain ${commandLabel}.`)
      }
    }

    await writeParameterOrThrow(deviceId, parameterId, 0, `Failed to clear ${commandLabel}.`)
  }

  const writeEthernetControlWord = async (scope: MotorScope, value: number) => {
    await writeParameterOrThrow(
      getDriveIdForMotor(scope),
      ETHERNET_CONTROL_WORD_PARAMETER_ID,
      value,
      'Failed to write the ConView Control word.'
    )
  }

  const applyDriveMode = async (
    scope: MotorScope,
    nextMode: Exclude<DriveMode, 'custom'>,
    values: Record<string, number>,
    successMessage: string
  ) => {
    if (isMotorBusy(scope)) return

    setMotorNotice(scope, null)
    setModeChangeInFlight((prev) => ({ ...prev, [scope]: nextMode }))

    try {
      if (nextMode === 'ethernet') {
        await writeParameterOrThrow(
          getDriveIdForMotor(scope),
          ETHERNET_REFERENCE_PARAMETER_ID,
          ETHERNET_REFERENCE_PRELOAD_VALUE,
          'Failed to preload the ConView Control reference.'
        )

        await writeParameterOrThrow(
          getDriveIdForMotor(scope),
          ETHERNET_REFERENCE_FALLBACK_PARAMETER_ID,
          ETHERNET_REFERENCE_PRELOAD_VALUE,
          'Failed to preload the ConView Control fallback reference.'
        )
      }

      for (const [parameterId, value] of Object.entries(values)) {
        await writeParameterOrThrow(
          getDriveIdForMotor(scope),
          parameterId as ParameterId,
          value,
          `Failed to switch the drive to ${getDriveModeLabel(nextMode)}.`
        )
      }

      setMotorNotice(scope, { tone: 'success', message: successMessage })
    } catch (error) {
      setMotorNotice(scope, {
        tone: 'error',
        message:
          (error as Error)?.message ||
          `Failed to switch the drive to ${getDriveModeLabel(nextMode)}.`
      })
    } finally {
      setModeChangeInFlight((prev) => ({ ...prev, [scope]: null }))
    }
  }

  const handleStartDrive = async (scope: MotorScope) => {
    if (isMotorBusy(scope) || !isMotorEthernetMode(scope)) return

    setMotorNotice(scope, null)
    setDriveCommandInFlight((prev) => ({ ...prev, [scope]: 'start' }))
    try {
      await writeEthernetControlWord(scope, DRIVE_READY_WORD)
      await delay(DRIVE_COMMAND_PULSE_MS)
      await writeEthernetControlWord(scope, DRIVE_START_WORD)
      setMotorNotice(scope, {
        tone: 'success',
        message: 'ConView Control start sequence sent.'
      })
    } catch (error) {
      setMotorNotice(scope, {
        tone: 'error',
        message: (error as Error)?.message || 'Failed to start the drive.'
      })
    } finally {
      setDriveCommandInFlight((prev) => ({ ...prev, [scope]: null }))
    }
  }

  const handleStopDrive = async (scope: MotorScope) => {
    if (isMotorBusy(scope) || !isMotorEthernetMode(scope)) return

    setMotorNotice(scope, null)
    setDriveCommandInFlight((prev) => ({ ...prev, [scope]: 'stop' }))
    try {
      await writeEthernetControlWord(scope, DRIVE_STOP_WORD)
      setMotorNotice(scope, {
        tone: 'success',
        message: 'ConView Control stop command sent.'
      })
    } catch (error) {
      setMotorNotice(scope, {
        tone: 'error',
        message: (error as Error)?.message || 'Failed to stop the drive.'
      })
    } finally {
      setDriveCommandInFlight((prev) => ({ ...prev, [scope]: null }))
    }
  }

  const handleEstopReset = async (scope: MotorScope) => {
    if (
      isMotorBusy(scope) ||
      !isMotorEstopPressed(scope) ||
      !isMotorWagoCommsOk(scope) ||
      !isMotorDriveCommsOk(scope)
    ) {
      return
    }

    setMotorNotice(scope, null)
    setEstopResetInFlight((prev) => ({ ...prev, [scope]: true }))

    try {
      const coilPulsePromise = holdMomentaryWagoCommand(
        getWagoIdForMotor(scope),
        ESTOP_RESET_PARAMETER_ID,
        WAGO_COMMAND_HOLD_MS,
        'E-stop reset'
      )

      const driveResetPromise = (async () => {
        await delay(ESTOP_RESET_DRIVE_RESET_DELAY_MS)
        const sent = await executeAction({
          deviceId: getDriveIdForMotor(scope),
          actionName: 'trip-reset-direct',
          parameters: { pulseMs: DRIVE_TRIP_RESET_PULSE_MS }
        })

        if (!sent) {
          throw new Error('Failed to trigger drive trip reset.')
        }
      })()

      await Promise.all([coilPulsePromise, driveResetPromise])

      setMotorNotice(scope, { tone: 'success', message: 'E-stop reset sequence sent.' })
    } catch (error) {
      setMotorNotice(scope, {
        tone: 'error',
        message: (error as Error)?.message || 'Failed to trigger e-stop reset sequence.'
      })
    } finally {
      setEstopResetInFlight((prev) => ({ ...prev, [scope]: false }))
    }
  }

  const setEthernetSpeedReference = async (scope: MotorScope, value: number) => {
    if (!isMotorEthernetMode(scope)) return

    const nextValue = clampNumber(value, 0, MAX_SPEED_REFERENCE)
    setSpeedRefByMotor((prev) => ({ ...prev, [scope]: nextValue }))

    try {
      await writeParameterOrThrow(
        getDriveIdForMotor(scope),
        ETHERNET_REFERENCE_PARAMETER_ID,
        nextValue,
        'Failed to update the ConView Control speed reference.'
      )
    } catch (error) {
      setMotorNotice(scope, {
        tone: 'error',
        message: (error as Error)?.message || 'Failed to update the speed reference.'
      })
    }
  }

  const motorOneMetrics = buildPanelMetrics(1)
  const motorTwoMetrics = buildPanelMetrics(2)
  const motorOneTemperatureCards = useMemo(
    () =>
      buildTemperatureCards(
        motorOneTemperatureRaw,
        motorOneTransducerRaw,
        temperatureUnit,
        windingSelection,
        igbtSelection[1],
        {
          onWindingSelect: () => setIsWindingSelectorOpen(true),
          onIgbtSelect: () => {
            setIgbtSelectorScope(1)
            setIsIgbtSelectorOpen(true)
          }
        }
      ),
    [
      motorOneTemperatureRaw,
      motorOneTransducerRaw,
      temperatureUnit,
      windingSelection,
      igbtSelection
    ]
  )
  const motorTwoTemperatureCards = useMemo(
    () =>
      buildTemperatureCards(
        motorTwoTemperatureRaw,
        motorTwoTransducerRaw,
        temperatureUnit,
        windingSelection,
        igbtSelection[2],
        {
          onWindingSelect: () => setIsWindingSelectorOpen(true),
          onIgbtSelect: () => {
            setIgbtSelectorScope(2)
            setIsIgbtSelectorOpen(true)
          }
        }
      ),
    [
      motorTwoTemperatureRaw,
      motorTwoTransducerRaw,
      temperatureUnit,
      windingSelection,
      igbtSelection
    ]
  )
  const motorOneDriveCommsOk = Boolean(motorOneDriveRaw.__connected)
  const motorOneWagoCommsOk = Boolean(motorOneWagoRaw.__connected)
  const motorTwoDriveCommsOk = Boolean(motorTwoDriveRaw.__connected)
  const motorTwoWagoCommsOk = Boolean(motorTwoWagoRaw.__connected)
  const motorOneEstopPressed = hasActiveInterlockTrip(motorOneDriveRaw)
  const motorTwoEstopPressed = hasActiveInterlockTrip(motorTwoDriveRaw)
  const scopesToRender =
    visibleScopes && visibleScopes.length > 0 ? visibleScopes : ([2, 1] as const)
  const visibleMotorSlots = visibleScopes?.map((scope) => (scope === 1 ? 'drive1' : 'drive2')) as
    | readonly ('drive1' | 'drive2')[]
    | undefined
  const panelConfigsByScope: Record<MotorScope, DualMotorPanelConfig & { title: string }> = {
    1: {
      title: 'MOTOR #1',
      motorType: motorTypes[1],
      live: true,
      driveCommsOk: motorOneDriveCommsOk,
      wagoCommsOk: motorOneWagoCommsOk,
      mainBreakerStatus: motorOneMainBreakerStatus,
      stateLabel: motorOneDriveRunning ? 'RUNNING' : 'STOPPED',
      stateTone: motorOneDriveRunning ? 'running' : 'stopped',
      heroValue: formatDisplayNumber(motorOneLiveRpm, 0),
      heroValueUnit: 'RPM',
      heroValueTone: motorOneDriveRunning ? 'green' : 'default',
      heroSecondaryValue: formatDisplayNumber(motorOneElectrical.motorVolts, 0),
      heroSecondaryUnit: 'V',
      heroSecondaryTone: 'default',
      metrics: motorOneMetrics,
      temperatureCards: motorOneTemperatureCards,
      referenceValue: formatDisplayNumber(speedRefByMotor[1], 0),
      sliderValue: speedRefByMotor[1],
      sliderDisabled: !isMotorEthernetMode(1) || isMotorBusy(1),
      controlDisabled: !isMotorEthernetMode(1) || isMotorBusy(1),
      modeSwitchDisabled: isMotorBusy(1),
      onParameterDetails: () => handleOpenParameterDetails(1),
      onMotorDetails: handleOpenMotorDetails,
      onMotorTypePress: () => openMotorTypeEditor(1),
      onMetricPressStart: (slotId) => startDualMetricPress('drive1', slotId),
      onMetricPressEnd: cancelDualMetricPress,
      onSpeedStep: (delta) => {
        void setEthernetSpeedReference(1, speedRefByMotor[1] + delta)
      },
      onSliderChange: (value) => {
        void setEthernetSpeedReference(1, value)
      },
      onStart: () => {
        void handleStartDrive(1)
      },
      onStop: () => {
        void handleStopDrive(1)
      },
      onResetEstop: () => {
        void handleEstopReset(1)
      },
      estopPressed: motorOneEstopPressed,
      onEthernetMode: () => {
        void applyDriveMode(1, 'ethernet', ETHERNET_MODE_VALUES, 'ConView Control applied.')
      },
      onDigitalMode: () => {
        void applyDriveMode(
          1,
          'digital-input',
          { ...DIGITAL_INPUT_MODE_VALUES, ...DIGITAL_INPUT_REFERENCE_VALUES },
          'Keypad Control applied.'
        )
      },
      ethernetActive: isMotorEthernetMode(1),
      digitalActive: motorOneDriveMode === 'digital-input',
      modeBusy: modeChangeInFlight[1] !== null,
      driveBusy: driveCommandInFlight[1] !== null,
      resetBusy: estopResetInFlight[1],
      resetDisabled:
        isMotorBusy(1) || !motorOneEstopPressed || !motorOneWagoCommsOk || !motorOneDriveCommsOk
    },
    2: {
      title: 'MOTOR #2',
      motorType: motorTypes[2],
      live: true,
      driveCommsOk: motorTwoDriveCommsOk,
      wagoCommsOk: motorTwoWagoCommsOk,
      mainBreakerStatus: motorTwoMainBreakerStatus,
      stateLabel: motorTwoDriveRunning ? 'RUNNING' : 'STOPPED',
      stateTone: motorTwoDriveRunning ? 'running' : 'stopped',
      heroValue: formatDisplayNumber(motorTwoLiveRpm, 0),
      heroValueUnit: 'RPM',
      heroValueTone: motorTwoDriveRunning ? 'green' : 'default',
      heroSecondaryValue: formatDisplayNumber(motorTwoElectrical.motorVolts, 0),
      heroSecondaryUnit: 'V',
      heroSecondaryTone: 'blue',
      metrics: motorTwoMetrics,
      temperatureCards: motorTwoTemperatureCards,
      referenceValue: formatDisplayNumber(speedRefByMotor[2], 0),
      sliderValue: speedRefByMotor[2],
      sliderDisabled: !isMotorEthernetMode(2) || isMotorBusy(2),
      controlDisabled: !isMotorEthernetMode(2) || isMotorBusy(2),
      modeSwitchDisabled: isMotorBusy(2),
      onParameterDetails: () => handleOpenParameterDetails(2),
      onMotorDetails: handleOpenMotorDetails,
      onMotorTypePress: () => openMotorTypeEditor(2),
      onMetricPressStart: (slotId) => startDualMetricPress('drive2', slotId),
      onMetricPressEnd: cancelDualMetricPress,
      onSpeedStep: (delta) => {
        void setEthernetSpeedReference(2, speedRefByMotor[2] + delta)
      },
      onSliderChange: (value) => {
        void setEthernetSpeedReference(2, value)
      },
      onStart: () => {
        void handleStartDrive(2)
      },
      onStop: () => {
        void handleStopDrive(2)
      },
      onResetEstop: () => {
        void handleEstopReset(2)
      },
      estopPressed: motorTwoEstopPressed,
      onEthernetMode: () => {
        void applyDriveMode(2, 'ethernet', ETHERNET_MODE_VALUES, 'ConView Control applied.')
      },
      onDigitalMode: () => {
        void applyDriveMode(
          2,
          'digital-input',
          { ...DIGITAL_INPUT_MODE_VALUES, ...DIGITAL_INPUT_REFERENCE_VALUES },
          'Keypad Control applied.'
        )
      },
      ethernetActive: isMotorEthernetMode(2),
      digitalActive: motorTwoDriveMode === 'digital-input',
      modeBusy: modeChangeInFlight[2] !== null,
      driveBusy: driveCommandInFlight[2] !== null,
      resetBusy: estopResetInFlight[2],
      resetDisabled:
        isMotorBusy(2) || !motorTwoEstopPressed || !motorTwoWagoCommsOk || !motorTwoDriveCommsOk
    }
  }

  return (
    <ScreenLayout>
      <S.DualMainShell>
        <S.DualMotorGrid $columns={scopesToRender.length > 1 ? 2 : 1}>
          {scopesToRender.map((scope) => {
            const panelConfig = panelConfigsByScope[scope]

            return <DualMotorPanel key={scope} {...panelConfig} />
          })}
        </S.DualMotorGrid>
      </S.DualMainShell>

      <DualMotorDetailsModal
        isOpen={isMotorDetailsOpen}
        onClose={() => setIsMotorDetailsOpen(false)}
        readOnly={isViewOnly}
        visibleMotors={visibleMotorSlots}
      />

      <WindingSelectionModal
        isOpen={isWindingSelectorOpen}
        selection={windingSelection}
        onClose={() => setIsWindingSelectorOpen(false)}
        onSelect={handleSelectWinding}
      />

      <IgbtSelectionModal
        isOpen={isIgbtSelectorOpen}
        scope={igbtSelectorScope}
        selection={igbtSelection}
        onClose={() => setIsIgbtSelectorOpen(false)}
        onSelect={handleSelectIgbt}
      />

      {editingDualMetric && editingDualMetricConfig && (
        <GaugeConfigModal
          isOpen={!!editingDualMetric}
          title="Configure gauge"
          subtitle={editingDualMetricSubtitle}
          variables={[
            ...(!DUAL_METRIC_VARIABLE_OPTIONS.some(
              (option) => option.id === editingDualMetricConfig.parameterId
            )
              ? [
                  {
                    id: editingDualMetricConfig.parameterId,
                    label: editingDualMetricMeta?.label || editingDualMetricConfig.parameterId,
                    unit: editingDualMetricMeta?.unit,
                    group: editingDualMetricMeta?.group || 'Main'
                  }
                ]
              : []),
            ...DUAL_METRIC_VARIABLE_OPTIONS
          ]}
          initialValue={editingDualMetricConfig}
          showRangeFields={false}
          hintText="Tip: press and hold any dual-motor metric card to choose which Main variable it should display."
          onClose={() => setEditingDualMetric(null)}
          onSave={handleSaveDualMetric}
        />
      )}

      <VirtualKeyboard
        visible={keyboardState.visible}
        mode="text"
        label={keyboardState.label}
        initialValue={keyboardState.initialValue}
        onConfirm={handleMotorTypeConfirm}
        onCancel={closeMotorTypeEditor}
      />
    </ScreenLayout>
  )
}

const MainScreen = () => {
  const { isViewOnly } = useAccessMode()
  const [motorControlMode] = useMotorControlModePreference()
  const preferredSingleMotorScope = usePreferredSingleMotorScope()
  const isBelowMobileViewport = useIsViewportBelow(768)
  const isMobileMonitor = isViewOnly && isBelowMobileViewport

  if (isMobileMonitor) {
    const mobileVisibleScopes =
      motorControlMode === 'dual' ? ([1, 2] as const) : ([preferredSingleMotorScope] as const)

    return <DualMotorMainScreen visibleScopes={mobileVisibleScopes} />
  }

  if (motorControlMode === 'dual') {
    return <DualMotorMainScreen />
  }

  return <SingleMotorMainScreen />
}

export default MainScreen
