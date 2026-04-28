export type WagoTransducerTag =
  | 'Motor_RPM_Transducer'
  | 'Motor_HP_Transducer'
  | 'Motor_Torque_Transducer'

type WagoTransducerSpec = {
  label: string
  unit: string
  fullScale: number
}

const WAGO_ANALOG_0_TO_10V_RAW_MAX = 32767

const WAGO_TRANSDUCER_SPECS: Record<WagoTransducerTag, WagoTransducerSpec> = {
  Motor_RPM_Transducer: {
    label: 'Motor Transducer RPM',
    unit: 'RPM',
    fullScale: 4000
  },
  Motor_HP_Transducer: {
    label: 'Motor Transducer HP',
    unit: 'HP',
    fullScale: 19040
  },
  Motor_Torque_Transducer: {
    label: 'Motor Transducer Torque',
    unit: 'ft lbs',
    fullScale: 25000
  }
}

export const isWagoTransducerTag = (value: string): value is WagoTransducerTag =>
  value in WAGO_TRANSDUCER_SPECS

export const getWagoTransducerSpec = (tag: WagoTransducerTag): WagoTransducerSpec =>
  WAGO_TRANSDUCER_SPECS[tag]

export const scaleWagoTransducerRawValue = (
  tag: WagoTransducerTag,
  rawValue: number
): number => {
  if (!Number.isFinite(rawValue)) {
    return rawValue
  }

  const boundedRawValue = Math.min(Math.max(rawValue, 0), WAGO_ANALOG_0_TO_10V_RAW_MAX)
  return (boundedRawValue / WAGO_ANALOG_0_TO_10V_RAW_MAX) * WAGO_TRANSDUCER_SPECS[tag].fullScale
}
