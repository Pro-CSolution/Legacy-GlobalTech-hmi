// AUTO-GENERATED FILE - DO NOT EDIT
// Fuente: config/devices.yaml y parameters.json
// Ejecutar: bun run generate:types

export const DEVICE_IDS = ['drive_avid'] as const

export type DeviceId = (typeof DEVICE_IDS)[number]

export const PARAMETER_IDS = [
  'P1.00',
  'P1.01',
  'P1.02',
  'P1.03',
  'P1.04',
  'P1.05',
  'P1.12',
  'P1.13',
  'P1.14',
  'P1.15',
  'P1.16',
  'P1.17',
  'P1.18',
  'P10.00',
  'P10.01',
  'P10.02',
  'P10.03',
  'P10.04',
  'P10.05',
  'P10.06',
  'P10.07',
  'P10.08',
  'P10.09',
  'P10.10',
  'P10.11',
  'P10.12',
  'P10.13',
  'P10.14',
  'P10.15',
  'P10.16',
  'P10.17',
  'P10.18',
  'P10.19',
  'P11.00',
  'P11.01',
  'P11.03',
  'P11.04',
  'P11.05',
  'P11.06',
  'P11.07',
  'P11.08',
  'P11.09',
  'P11.10',
  'P11.11',
  'P11.19',
  'P11.20',
  'P11.49',
  'P11.50',
  'P2.01',
  'P2.02',
  'P2.03',
  'P5.00',
  'P5.14',
  'P5.22',
  'P8.00',
  'P9.04',
  'P9.05',
  'P9.06',
  'P9.08'
] as const

export type ParameterId = (typeof PARAMETER_IDS)[number]

export type ParameterMeta = {
  id: ParameterId
  alias?: string
  name?: string
  unit?: string
  menu?: number
  description?: string
  range?: { min?: number; max?: number }
  attributes?: string[]
}

export const DEVICE_PARAMETERS: Record<DeviceId, ParameterId[]> = {
  drive_avid: [
    'P1.00',
    'P1.01',
    'P1.02',
    'P1.03',
    'P1.04',
    'P1.05',
    'P1.12',
    'P1.13',
    'P1.14',
    'P1.15',
    'P1.16',
    'P1.17',
    'P1.18',
    'P2.01',
    'P2.02',
    'P2.03',
    'P5.00',
    'P5.14',
    'P5.22',
    'P8.00',
    'P9.04',
    'P9.05',
    'P9.06',
    'P9.08',
    'P10.00',
    'P10.01',
    'P10.02',
    'P10.03',
    'P10.04',
    'P10.05',
    'P10.06',
    'P10.07',
    'P10.08',
    'P10.09',
    'P10.10',
    'P10.11',
    'P10.12',
    'P10.13',
    'P10.14',
    'P10.15',
    'P10.16',
    'P10.17',
    'P10.18',
    'P10.19',
    'P11.00',
    'P11.01',
    'P11.03',
    'P11.04',
    'P11.05',
    'P11.06',
    'P11.07',
    'P11.08',
    'P11.09',
    'P11.10',
    'P11.11',
    'P11.19',
    'P11.20',
    'P11.49',
    'P11.50'
  ] as const
} as const

export const PARAMETER_META: Record<ParameterId, ParameterMeta> = {
  'P1.00': {
    id: 'P1.00',
    alias: 'speedReference',
    name: 'Speed Reference',
    unit: '% Top Speed',
    menu: 1,
    description: 'Source: P9.00. Configured by Menu 39.',
    range: { min: -100, max: 100 },
    attributes: ['O'] as const
  },
  'P1.01': {
    id: 'P1.01',
    alias: 'speedFeedback',
    name: 'Speed Feedback',
    unit: '% Top Speed',
    menu: 1,
    description: 'Source: P9.01. Configured by Menu 39.',
    range: { min: -300, max: 300 },
    attributes: ['R'] as const
  },
  'P1.02': {
    id: 'P1.02',
    alias: 'motorCurrent',
    name: 'Motor Current',
    unit: 'A',
    menu: 1,
    description: 'Source: P9.05.',
    range: { min: 0, max: 9999 },
    attributes: ['R'] as const
  },
  'P1.03': {
    id: 'P1.03',
    alias: 'frequencyFeedback',
    name: 'Frequency Feedback',
    unit: 'Hz',
    menu: 1,
    description: 'Source: P9.09.',
    range: { min: -200, max: 200 },
    attributes: ['R'] as const
  },
  'P1.04': {
    id: 'P1.04',
    alias: 'motorVolts',
    name: 'Motor Volts',
    unit: 'Vrms',
    menu: 1,
    description: 'Source: P9.07.',
    range: { min: 10, max: 999 },
    attributes: ['R'] as const
  },
  'P1.05': {
    id: 'P1.05',
    alias: 'motorPower',
    name: 'Motor Power',
    unit: 'kW',
    menu: 1,
    description: 'Source: P9.08.',
    range: { min: -9999, max: 9999 },
    attributes: ['R'] as const
  },
  'P1.12': {
    id: 'P1.12',
    alias: 'motorFullLoadCurrent',
    name: 'Motor Full Load Current',
    unit: 'A',
    menu: 1,
    description: 'Source: P2.02. Range depends on P99.05.',
    attributes: ['S', 'E', 'N'] as const
  },
  'P1.13': {
    id: 'P1.13',
    alias: 'motorNominalSpeed',
    name: 'Motor Nominal Speed',
    unit: 'rpm',
    menu: 1,
    description: 'Source: P2.04.',
    range: { min: 100, max: 9999 },
    attributes: ['S', 'E', 'N'] as const
  },
  'P1.14': {
    id: 'P1.14',
    alias: 'motorFullLoadPower',
    name: 'Motor Full Load Power',
    menu: 1,
    description: 'Source: P2.05 (Corresponds to Power Factor in advanced menus).',
    range: { min: 0.1, max: 0.99 },
    attributes: ['S', 'E'] as const
  },
  'P1.15': {
    id: 'P1.15',
    alias: 'maximumSpeedFwd',
    name: 'Maximum Speed Fwd',
    unit: 'rpm',
    menu: 1,
    description: 'Source: P5.15.',
    range: { min: 10, max: 6000 },
    attributes: ['S', 'E'] as const
  },
  'P1.16': {
    id: 'P1.16',
    alias: 'maximumSpeedRev',
    name: 'Maximum Speed Rev',
    unit: 'rpm',
    menu: 1,
    description: 'Source: P5.16.',
    range: { min: 0, max: 6000 },
    attributes: ['S', 'E'] as const
  },
  'P1.17': {
    id: 'P1.17',
    alias: 'minimumSpeedFwd',
    name: 'Minimum Speed Fwd',
    unit: 'rpm',
    menu: 1,
    description: 'Source: P5.17.',
    attributes: ['S', 'E'] as const
  },
  'P1.18': {
    id: 'P1.18',
    alias: 'minimumSpeedRev',
    name: 'Minimum Speed Rev',
    unit: 'rpm',
    menu: 1,
    description: 'Source: P5.18.',
    attributes: ['S', 'E'] as const
  },
  'P10.00': {
    id: 'P10.00',
    alias: 'warning1',
    name: 'Warning No. 1',
    menu: 10,
    range: { min: 100, max: 199 },
    attributes: ['R'] as const
  },
  'P10.01': {
    id: 'P10.01',
    alias: 'warning2',
    name: 'Warning No. 2',
    menu: 10,
    range: { min: 100, max: 199 },
    attributes: ['R'] as const
  },
  'P10.02': {
    id: 'P10.02',
    alias: 'warning3',
    name: 'Warning No. 3',
    menu: 10,
    range: { min: 100, max: 199 },
    attributes: ['R'] as const
  },
  'P10.03': {
    id: 'P10.03',
    alias: 'warning4',
    name: 'Warning No. 4',
    menu: 10,
    range: { min: 100, max: 199 },
    attributes: ['R'] as const
  },
  'P10.04': {
    id: 'P10.04',
    alias: 'warning5',
    name: 'Warning No. 5',
    menu: 10,
    range: { min: 100, max: 199 },
    attributes: ['R'] as const
  },
  'P10.05': {
    id: 'P10.05',
    alias: 'warning6',
    name: 'Warning No. 6',
    menu: 10,
    range: { min: 100, max: 199 },
    attributes: ['R'] as const
  },
  'P10.06': {
    id: 'P10.06',
    alias: 'warning7',
    name: 'Warning No. 7',
    menu: 10,
    range: { min: 100, max: 199 },
    attributes: ['R'] as const
  },
  'P10.07': {
    id: 'P10.07',
    alias: 'warning8',
    name: 'Warning No. 8',
    menu: 10,
    range: { min: 100, max: 199 },
    attributes: ['R'] as const
  },
  'P10.08': {
    id: 'P10.08',
    alias: 'warning9',
    name: 'Warning No. 9',
    menu: 10,
    range: { min: 100, max: 199 },
    attributes: ['R'] as const
  },
  'P10.09': {
    id: 'P10.09',
    alias: 'warning10',
    name: 'Warning No. 10',
    menu: 10,
    range: { min: 100, max: 199 },
    attributes: ['R'] as const
  },
  'P10.10': {
    id: 'P10.10',
    alias: 'trip1',
    name: 'Trip No. 1',
    menu: 10,
    attributes: ['R'] as const
  },
  'P10.11': {
    id: 'P10.11',
    alias: 'trip2',
    name: 'Trip No. 2',
    menu: 10,
    attributes: ['R'] as const
  },
  'P10.12': {
    id: 'P10.12',
    alias: 'trip3',
    name: 'Trip No. 3',
    menu: 10,
    attributes: ['R'] as const
  },
  'P10.13': {
    id: 'P10.13',
    alias: 'trip4',
    name: 'Trip No. 4',
    menu: 10,
    attributes: ['R'] as const
  },
  'P10.14': {
    id: 'P10.14',
    alias: 'trip5',
    name: 'Trip No. 5',
    menu: 10,
    attributes: ['R'] as const
  },
  'P10.15': {
    id: 'P10.15',
    alias: 'trip6',
    name: 'Trip No. 6',
    menu: 10,
    attributes: ['R'] as const
  },
  'P10.16': {
    id: 'P10.16',
    alias: 'trip7',
    name: 'Trip No. 7',
    menu: 10,
    attributes: ['R'] as const
  },
  'P10.17': {
    id: 'P10.17',
    alias: 'trip8',
    name: 'Trip No. 8',
    menu: 10,
    attributes: ['R'] as const
  },
  'P10.18': {
    id: 'P10.18',
    alias: 'trip9',
    name: 'Trip No. 9',
    menu: 10,
    attributes: ['R'] as const
  },
  'P10.19': {
    id: 'P10.19',
    alias: 'trip10',
    name: 'Trip No. 10',
    menu: 10,
    attributes: ['R'] as const
  },
  'P11.00': {
    id: 'P11.00',
    alias: 'activeCurrentFLC',
    name: 'Active Current',
    unit: '%',
    menu: 11,
    description: '% of drive FLC',
    range: { min: -150, max: 150 },
    attributes: ['R'] as const
  },
  'P11.01': {
    id: 'P11.01',
    alias: 'magnetisingCurrentFLC',
    name: 'Magnetising Current',
    unit: '%',
    menu: 11,
    description: '% of drive FLC',
    range: { min: -150, max: 150 },
    attributes: ['R'] as const
  },
  'P11.03': {
    id: 'P11.03',
    alias: 'dcLinkVoltage',
    name: 'DC Link Voltage',
    unit: 'V',
    menu: 11,
    range: { min: 0, max: 30000 },
    attributes: ['R'] as const
  },
  'P11.04': {
    id: 'P11.04',
    alias: 'cdcElectronicsTemperature',
    name: 'CDC Electronics Temperature',
    unit: '°C',
    menu: 11,
    range: { min: -40, max: 150 },
    attributes: ['R'] as const
  },
  'P11.05': {
    id: 'P11.05',
    alias: 'outputBridge1Temperature',
    name: 'Output Bridge 1 Temperature',
    unit: '°C',
    menu: 11,
    range: { min: -40, max: 150 },
    attributes: ['R'] as const
  },
  'P11.06': {
    id: 'P11.06',
    alias: 'outputBridge2Temperature',
    name: 'Output Bridge 2 Temperature',
    unit: '°C',
    menu: 11,
    range: { min: -40, max: 150 },
    attributes: ['R'] as const
  },
  'P11.07': {
    id: 'P11.07',
    alias: 'outputBridge3Temperature',
    name: 'Output Bridge 3 Temperature',
    unit: '°C',
    menu: 11,
    range: { min: -40, max: 150 },
    attributes: ['R'] as const
  },
  'P11.08': {
    id: 'P11.08',
    alias: 'inputBridgeTemperature',
    name: 'Input Bridge Temperature',
    unit: '°C',
    menu: 11,
    range: { min: -40, max: 150 },
    attributes: ['R'] as const
  },
  'P11.09': {
    id: 'P11.09',
    alias: 'outputBridge4Temperature',
    name: 'Output Bridge 4 Temperature',
    unit: '°C',
    menu: 11,
    range: { min: -40, max: 150 },
    attributes: ['R'] as const
  },
  'P11.10': {
    id: 'P11.10',
    alias: 'outputBridge5Temperature',
    name: 'Output Bridge 5 Temperature',
    unit: '°C',
    menu: 11,
    range: { min: -40, max: 150 },
    attributes: ['R'] as const
  },
  'P11.11': {
    id: 'P11.11',
    alias: 'outputBridge6Temperature',
    name: 'Output Bridge 6 Temperature',
    unit: '°C',
    menu: 11,
    range: { min: -40, max: 150 },
    attributes: ['R'] as const
  },
  'P11.19': {
    id: 'P11.19',
    alias: 'kWHours',
    name: 'kW-Hours',
    unit: 'kWh',
    menu: 11,
    range: { min: 0, max: 999.9 },
    attributes: ['R'] as const
  },
  'P11.20': {
    id: 'P11.20',
    alias: 'mWHours',
    name: 'MW-Hours',
    unit: 'MWh',
    menu: 11,
    range: { min: 0, max: 9999 },
    attributes: ['R'] as const
  },
  'P11.49': {
    id: 'P11.49',
    alias: 'maximumTorqueAvailable',
    name: 'Maximum Torque Available',
    unit: '%',
    menu: 11,
    description: 'Calculated on line by the drive.',
    range: { min: 0, max: 300 },
    attributes: ['R'] as const
  },
  'P11.50': {
    id: 'P11.50',
    alias: 'torqueReference',
    name: 'Torque Reference',
    unit: '%',
    menu: 11,
    description: '% of nominal torque (not available in VVVF mode)',
    range: { min: -100, max: 100 },
    attributes: ['O'] as const
  },
  'P2.01': {
    id: 'P2.01',
    alias: 'motorBaseVoltage',
    name: 'Motor Base Voltage',
    unit: 'Vrms',
    menu: 2,
    range: { min: 25, max: 1000 },
    attributes: ['S', 'E', 'N'] as const
  },
  'P2.02': {
    id: 'P2.02',
    alias: 'motorFullLoadCurrentP2',
    name: 'Motor Full Load Current',
    unit: 'A',
    menu: 2,
    description: 'Range depends on P99.05.',
    attributes: ['S', 'E', 'N'] as const
  },
  'P2.03': {
    id: 'P2.03',
    alias: 'motorNominalPowerP2',
    name: 'Motor Nominal Power',
    menu: 2,
    attributes: ['S', 'E', 'N'] as const
  },
  'P5.00': {
    id: 'P5.00',
    alias: 'speedReferenceP5',
    name: 'Speed Reference',
    unit: '% Top Speed',
    menu: 5,
    description: '0.01% of Top Speed (0.1% from Push Buttons)',
    range: { min: -100, max: 100 },
    attributes: ['O'] as const
  },
  'P5.14': {
    id: 'P5.14',
    alias: 'jogSpeed1',
    name: 'Jog Speed 1',
    unit: '% Top Speed',
    menu: 5,
    description: '0.1% of Top Speed',
    range: { min: -100, max: 100 },
    attributes: ['O'] as const
  },
  'P5.22': {
    id: 'P5.22',
    alias: 'processTopSpeed',
    name: 'Process Top Speed',
    unit: 'Units',
    menu: 5,
    description: 'User defined units',
    range: { min: -9999, max: 9999 },
    attributes: ['E'] as const
  },
  'P8.00': {
    id: 'P8.00',
    alias: 'torqueLimitPositive1',
    name: 'Torque Limit (Also positive torque limit 1)',
    unit: '%',
    menu: 8,
    description: '0.1% of nominal torque.',
    range: { min: 0, max: 300 },
    attributes: ['E'] as const
  },
  'P9.04': {
    id: 'P9.04',
    alias: 'torqueDemand',
    name: 'Torque Demand',
    unit: '%',
    menu: 9,
    description: '0.1% of nominal torque',
    range: { min: -300, max: 300 },
    attributes: ['R'] as const
  },
  'P9.05': {
    id: 'P9.05',
    alias: 'motorCurrentP9',
    name: 'Motor Current',
    unit: 'A',
    menu: 9,
    range: { min: 0, max: 9999 },
    attributes: ['R'] as const
  },
  'P9.06': {
    id: 'P9.06',
    alias: 'driveCurrent',
    name: 'Drive Current',
    unit: '%',
    menu: 9,
    description: '0.1% of Drive FLC',
    range: { min: 0, max: 300 },
    attributes: ['R'] as const
  },
  'P9.08': {
    id: 'P9.08',
    alias: 'motorPowerP9',
    name: 'Motor Power',
    unit: 'kW',
    menu: 9,
    range: { min: -9999, max: 9999 },
    attributes: ['R'] as const
  }
} as const

export const PARAMETER_ALIASES = {
  speedReference: 'P1.00',
  speedFeedback: 'P1.01',
  motorCurrent: 'P1.02',
  frequencyFeedback: 'P1.03',
  motorVolts: 'P1.04',
  motorPower: 'P1.05',
  motorFullLoadCurrent: 'P1.12',
  motorNominalSpeed: 'P1.13',
  motorFullLoadPower: 'P1.14',
  maximumSpeedFwd: 'P1.15',
  maximumSpeedRev: 'P1.16',
  minimumSpeedFwd: 'P1.17',
  minimumSpeedRev: 'P1.18',
  warning1: 'P10.00',
  warning2: 'P10.01',
  warning3: 'P10.02',
  warning4: 'P10.03',
  warning5: 'P10.04',
  warning6: 'P10.05',
  warning7: 'P10.06',
  warning8: 'P10.07',
  warning9: 'P10.08',
  warning10: 'P10.09',
  trip1: 'P10.10',
  trip2: 'P10.11',
  trip3: 'P10.12',
  trip4: 'P10.13',
  trip5: 'P10.14',
  trip6: 'P10.15',
  trip7: 'P10.16',
  trip8: 'P10.17',
  trip9: 'P10.18',
  trip10: 'P10.19',
  activeCurrentFLC: 'P11.00',
  magnetisingCurrentFLC: 'P11.01',
  dcLinkVoltage: 'P11.03',
  cdcElectronicsTemperature: 'P11.04',
  outputBridge1Temperature: 'P11.05',
  outputBridge2Temperature: 'P11.06',
  outputBridge3Temperature: 'P11.07',
  inputBridgeTemperature: 'P11.08',
  outputBridge4Temperature: 'P11.09',
  outputBridge5Temperature: 'P11.10',
  outputBridge6Temperature: 'P11.11',
  kWHours: 'P11.19',
  mWHours: 'P11.20',
  maximumTorqueAvailable: 'P11.49',
  torqueReference: 'P11.50',
  motorBaseVoltage: 'P2.01',
  motorFullLoadCurrentP2: 'P2.02',
  motorNominalPowerP2: 'P2.03',
  speedReferenceP5: 'P5.00',
  jogSpeed1: 'P5.14',
  processTopSpeed: 'P5.22',
  torqueLimitPositive1: 'P8.00',
  torqueDemand: 'P9.04',
  motorCurrentP9: 'P9.05',
  driveCurrent: 'P9.06',
  motorPowerP9: 'P9.08'
} as const

export type ParameterAlias = keyof typeof PARAMETER_ALIASES
