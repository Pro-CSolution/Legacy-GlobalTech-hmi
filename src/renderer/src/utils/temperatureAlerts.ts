import type { ParameterId } from 'types'

export type TemperatureAlertSeverity = 'normal' | 'warning' | 'critical'
export type TemperatureAlertUnit = 'fahrenheit' | 'celsius'
export type TemperatureAlertSource = 'drive' | 'wago'

export const MOTOR_WINDING_WARNING_F = 329
export const MOTOR_WINDING_CRITICAL_F = 347
export const MOTOR_BEARING_WARNING_F = 175
export const MOTOR_BEARING_CRITICAL_F = 185
export const IGBT_WARNING_C = 100
export const IGBT_CRITICAL_C = 115
export const MAX_ANIMATED_TEMPERATURE_F = 1000

export const fahrenheitToCelsius = (value: number): number => ((value - 32) * 5) / 9
export const celsiusToFahrenheit = (value: number): number => (value * 9) / 5 + 32

export const MOTOR_WINDING_WARNING_C = fahrenheitToCelsius(MOTOR_WINDING_WARNING_F)
export const MOTOR_WINDING_CRITICAL_C = fahrenheitToCelsius(MOTOR_WINDING_CRITICAL_F)
export const MOTOR_BEARING_WARNING_C = fahrenheitToCelsius(MOTOR_BEARING_WARNING_F)
export const MOTOR_BEARING_CRITICAL_C = fahrenheitToCelsius(MOTOR_BEARING_CRITICAL_F)
export const IGBT_WARNING_F = celsiusToFahrenheit(IGBT_WARNING_C)
export const IGBT_CRITICAL_F = celsiusToFahrenheit(IGBT_CRITICAL_C)
export const MAX_ANIMATED_TEMPERATURE_C = fahrenheitToCelsius(MAX_ANIMATED_TEMPERATURE_F)

const MOTOR_BEARING_PARAMETER_ID_LIST: readonly ParameterId[] = [
  'Motor_Bearing_DE_DEGF',
  'Motor_Bearing_NDE_DEGF'
]

const MOTOR_WINDING_PARAMETER_ID_LIST: readonly ParameterId[] = [
  'Motor_Winding_A1_DEGF',
  'Motor_Winding_B1_DEGF',
  'Motor_Winding_C1_DEGF',
  'Motor_Winding_A2_DEGF',
  'Motor_Winding_B2_DEGF',
  'Motor_Winding_C2_DEGF'
]

const MOTOR_IGBT_PARAMETER_ID_LIST: readonly ParameterId[] = [
  'P45.00',
  'P45.01',
  'P45.02',
  'P45.07',
  'P45.08',
  'P45.09',
  'P45.10',
  'P45.11',
  'P45.12',
  'P45.13',
  'P45.14',
  'P45.15',
  'P45.16',
  'P45.17',
  'P45.18',
  'P45.19',
  'P45.20',
  'P45.21'
]

export const MOTOR_TEMPERATURE_ALARM_PARAMETER_IDS: readonly ParameterId[] = [
  ...MOTOR_BEARING_PARAMETER_ID_LIST,
  ...MOTOR_WINDING_PARAMETER_ID_LIST,
  ...MOTOR_IGBT_PARAMETER_ID_LIST
]

const MOTOR_BEARING_PARAMETER_IDS = new Set<ParameterId>(MOTOR_BEARING_PARAMETER_ID_LIST)
const MOTOR_WINDING_PARAMETER_IDS = new Set<ParameterId>(MOTOR_WINDING_PARAMETER_ID_LIST)
const MOTOR_IGBT_PARAMETER_IDS = new Set<ParameterId>(MOTOR_IGBT_PARAMETER_ID_LIST)

const MOTOR_TEMPERATURE_ALERT_LABELS: Partial<Record<ParameterId, string>> = {
  Motor_Bearing_DE_DEGF: 'DE',
  Motor_Bearing_NDE_DEGF: 'NDE',
  Motor_Winding_A1_DEGF: 'Winding A1',
  Motor_Winding_B1_DEGF: 'Winding B1',
  Motor_Winding_C1_DEGF: 'Winding C1',
  Motor_Winding_A2_DEGF: 'Winding A2',
  Motor_Winding_B2_DEGF: 'Winding B2',
  Motor_Winding_C2_DEGF: 'Winding C2',
  'P45.00': 'IGBT U1',
  'P45.01': 'IGBT V1',
  'P45.02': 'IGBT W1',
  'P45.07': 'IGBT U2',
  'P45.08': 'IGBT V2',
  'P45.09': 'IGBT W2',
  'P45.10': 'IGBT U3',
  'P45.11': 'IGBT V3',
  'P45.12': 'IGBT W3',
  'P45.13': 'IGBT U4',
  'P45.14': 'IGBT V4',
  'P45.15': 'IGBT W4',
  'P45.16': 'IGBT U5',
  'P45.17': 'IGBT V5',
  'P45.18': 'IGBT W5',
  'P45.19': 'IGBT U6',
  'P45.20': 'IGBT V6',
  'P45.21': 'IGBT W6'
}

const MOTOR_TEMPERATURE_ALERT_SOURCES: Partial<Record<ParameterId, TemperatureAlertSource>> = {
  Motor_Bearing_DE_DEGF: 'wago',
  Motor_Bearing_NDE_DEGF: 'wago',
  Motor_Winding_A1_DEGF: 'wago',
  Motor_Winding_B1_DEGF: 'wago',
  Motor_Winding_C1_DEGF: 'wago',
  Motor_Winding_A2_DEGF: 'wago',
  Motor_Winding_B2_DEGF: 'wago',
  Motor_Winding_C2_DEGF: 'wago',
  'P45.00': 'drive',
  'P45.01': 'drive',
  'P45.02': 'drive',
  'P45.07': 'drive',
  'P45.08': 'drive',
  'P45.09': 'drive',
  'P45.10': 'drive',
  'P45.11': 'drive',
  'P45.12': 'drive',
  'P45.13': 'drive',
  'P45.14': 'drive',
  'P45.15': 'drive',
  'P45.16': 'drive',
  'P45.17': 'drive',
  'P45.18': 'drive',
  'P45.19': 'drive',
  'P45.20': 'drive',
  'P45.21': 'drive'
}

export const isMotorBearingTemperatureParameter = (parameterId: ParameterId): boolean =>
  MOTOR_BEARING_PARAMETER_IDS.has(parameterId)

export const isMotorWindingTemperatureParameter = (parameterId: ParameterId): boolean =>
  MOTOR_WINDING_PARAMETER_IDS.has(parameterId)

export const isMotorIgbtTemperatureParameter = (parameterId: ParameterId): boolean =>
  MOTOR_IGBT_PARAMETER_IDS.has(parameterId)

export const getMotorTemperatureAlertLabel = (parameterId: ParameterId): string =>
  MOTOR_TEMPERATURE_ALERT_LABELS[parameterId] ?? parameterId

export const getMotorTemperatureAlertSource = (
  parameterId: ParameterId
): TemperatureAlertSource | null => MOTOR_TEMPERATURE_ALERT_SOURCES[parameterId] ?? null

export const getMotorTemperatureAlertSourceUnit = (
  parameterId: ParameterId
): TemperatureAlertUnit | null => {
  if (isMotorIgbtTemperatureParameter(parameterId)) {
    return 'celsius'
  }

  if (
    isMotorBearingTemperatureParameter(parameterId) ||
    isMotorWindingTemperatureParameter(parameterId)
  ) {
    return 'fahrenheit'
  }

  return null
}

export const isDisconnectedMotorWindingTemperature = (
  parameterId: ParameterId,
  value: number | null,
  unit: TemperatureAlertUnit = 'fahrenheit'
): boolean => {
  if (!isMotorWindingTemperatureParameter(parameterId) || value === null || Number.isNaN(value)) {
    return false
  }

  const disconnectedCutoff =
    unit === 'celsius' ? MAX_ANIMATED_TEMPERATURE_C : MAX_ANIMATED_TEMPERATURE_F

  return value > disconnectedCutoff
}

const getThresholds = (
  parameterId: ParameterId,
  unit: TemperatureAlertUnit
): { warning: number; critical: number } | null => {
  if (isMotorBearingTemperatureParameter(parameterId)) {
    return {
      warning: unit === 'celsius' ? MOTOR_BEARING_WARNING_C : MOTOR_BEARING_WARNING_F,
      critical: unit === 'celsius' ? MOTOR_BEARING_CRITICAL_C : MOTOR_BEARING_CRITICAL_F
    }
  }

  if (isMotorWindingTemperatureParameter(parameterId)) {
    return {
      warning: unit === 'celsius' ? MOTOR_WINDING_WARNING_C : MOTOR_WINDING_WARNING_F,
      critical: unit === 'celsius' ? MOTOR_WINDING_CRITICAL_C : MOTOR_WINDING_CRITICAL_F
    }
  }

  if (isMotorIgbtTemperatureParameter(parameterId)) {
    return {
      warning: unit === 'celsius' ? IGBT_WARNING_C : IGBT_WARNING_F,
      critical: unit === 'celsius' ? IGBT_CRITICAL_C : IGBT_CRITICAL_F
    }
  }

  return null
}

export const getMotorTemperatureAlertSeverity = (
  parameterId: ParameterId,
  value: number | null,
  unit: TemperatureAlertUnit = 'fahrenheit'
): TemperatureAlertSeverity => {
  if (value === null || Number.isNaN(value)) {
    return 'normal'
  }

  const thresholds = getThresholds(parameterId, unit)
  if (!thresholds) {
    return 'normal'
  }

  if (value >= thresholds.critical) {
    return 'critical'
  }

  if (value >= thresholds.warning) {
    return 'warning'
  }

  return 'normal'
}

export const shouldAnimateMotorTemperatureAlert = (
  parameterId: ParameterId,
  value: number | null,
  unit: TemperatureAlertUnit = 'fahrenheit'
): boolean => {
  if (value === null || Number.isNaN(value)) {
    return false
  }

  if (getMotorTemperatureAlertSeverity(parameterId, value, unit) === 'normal') {
    return false
  }

  const maxAnimatedTemperature =
    unit === 'celsius' ? MAX_ANIMATED_TEMPERATURE_C : MAX_ANIMATED_TEMPERATURE_F

  return value <= maxAnimatedTemperature
}
