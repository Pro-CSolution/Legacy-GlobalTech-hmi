import { PARAMETER_ALIASES, type ParameterId } from 'types'

const UNCOLLATED_DC_LINK_VOLTAGE_THRESHOLD = 10000

export type MotorMonitorValueOverride = {
  valueText: string
  unit?: string
  gaugeValue?: number
}

export const getMotorMonitorValueOverride = (
  parameterId: ParameterId,
  value: number
): MotorMonitorValueOverride | null => {
  if (
    parameterId === PARAMETER_ALIASES.dcLinkVoltage &&
    Number.isFinite(value) &&
    value > UNCOLLATED_DC_LINK_VOLTAGE_THRESHOLD
  ) {
    return {
      valueText: 'UNCOLLATED',
      unit: 'V',
      gaugeValue: 0
    }
  }

  return null
}
