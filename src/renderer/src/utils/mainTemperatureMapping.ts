import type { ParameterId } from 'types/generated/devices'
import type { MotorScope } from 'utils/motorDeviceMapping'

export const MAIN_SCREEN_TEMPERATURE_REGISTER_ENTRIES: ReadonlyArray<
  readonly [ParameterId, number]
> = [
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

export const MOTOR_TWO_MAIN_SCREEN_REGISTER_OVERRIDES: Readonly<
  Partial<Record<ParameterId, number>>
> = {
  Coolant_Temp_DEGF: 400024
}

const MAIN_SCREEN_TEMPERATURE_REGISTER_BY_PARAMETER = new Map<ParameterId, number>(
  MAIN_SCREEN_TEMPERATURE_REGISTER_ENTRIES.map(([parameterId, modbusRegister]) => [
    parameterId,
    modbusRegister
  ])
)

export const MAIN_SCREEN_TEMPERATURE_PARAMETER_IDS = MAIN_SCREEN_TEMPERATURE_REGISTER_ENTRIES.map(
  ([parameterId]) => parameterId
)

export const MAIN_SCREEN_WINDING_PARAMETER_IDS: readonly ParameterId[] = [
  'Motor_Winding_A1_DEGF',
  'Motor_Winding_B1_DEGF',
  'Motor_Winding_C1_DEGF',
  'Motor_Winding_A2_DEGF',
  'Motor_Winding_B2_DEGF',
  'Motor_Winding_C2_DEGF'
]

export const getResolvedMainScreenTemperatureRegister = (
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

export const toHoldingRegisterOffset = (modbusRegister: number): number => modbusRegister - 400001

export const LEGACY_MAIN_TEMPERATURE_PARAMETER_REDIRECTS: Partial<
  Record<ParameterId, ParameterId>
> = {
  Temp_Bearing_DE: 'Motor_Bearing_DE_DEGF',
  Temp_Bearing_NDE: 'Motor_Bearing_NDE_DEGF',
  Temp_Winding_A1: 'Motor_Winding_A2_DEGF',
  Temp_Winding_B1: 'Motor_Winding_B2_DEGF',
  Temp_Winding_C1: 'Motor_Winding_C2_DEGF'
}

export const redirectLegacyMainTemperatureParameter = (parameterId: ParameterId): ParameterId =>
  LEGACY_MAIN_TEMPERATURE_PARAMETER_REDIRECTS[parameterId] ?? parameterId
