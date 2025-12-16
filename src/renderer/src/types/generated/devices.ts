// AUTO-GENERATED FILE - DO NOT EDIT
// Fuente: config/devices.yaml y parameters.json
// Ejecutar: bun run generate:types

export const DEVICE_IDS = ['drive_avid', 'wago'] as const

export type DeviceId = (typeof DEVICE_IDS)[number]

export const PARAMETER_IDS = [
  'Auto_Speed_SP1',
  'Conv_Cooling_Start',
  'Conv_Pump_Auto',
  'Conv_Pump_Run',
  'Cooling_Water_Press',
  'Drive_Coolant_Flow',
  'Drive_Coolant_Leak',
  'Drive_Coolant_Press',
  'Drive_Cooling_Start',
  'Drive_Cooling_Temp',
  'Main_CB_Closed_Light',
  'Motor_Heater_Ctrl',
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
  'P10.10',
  'P10.11',
  'P10.12',
  'P10.13',
  'P10.14',
  'P10.20',
  'P10.21',
  'P10.22',
  'P10.23',
  'P10.24',
  'P10.25',
  'P10.26',
  'P10.27',
  'P10.28',
  'P10.29',
  'P10.30',
  'P10.31',
  'P10.34',
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
  'P9.08',
  'RB_Blower_Start',
  'RB_Breaker_Close',
  'RB_Breaker_Open',
  'RB_Drive_OK',
  'RB_Drive_Reset',
  'RB_Drive_Running',
  'RB_Drive_Start',
  'RB_Estop_Reset',
  'RB_Estop_Status',
  'RB_Local_Control',
  'RB_Main_Brk_Close',
  'RB_Main_Brk_Open',
  'RB_Precharge_OK',
  'RB_Remote_Control',
  'Remote_Speed_In',
  'Speed_Out_Drive',
  'Supply_480VAC_On',
  'Temp_Bearing_DE',
  'Temp_Bearing_NDE',
  'Temp_Winding_A1',
  'Temp_Winding_B1',
  'Temp_Winding_C1',
  'Trans_Cooling_Start'
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
    'P10.10',
    'P10.11',
    'P10.12',
    'P10.13',
    'P10.14',
    'P10.20',
    'P10.21',
    'P10.22',
    'P10.23',
    'P10.24',
    'P10.25',
    'P10.26',
    'P10.27',
    'P10.28',
    'P10.29',
    'P10.30',
    'P10.31',
    'P10.34',
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
  ] as const,
  wago: [
    'Remote_Speed_In',
    'Auto_Speed_SP1',
    'Cooling_Water_Press',
    'Drive_Cooling_Temp',
    'Temp_Winding_A1',
    'Temp_Winding_B1',
    'Temp_Winding_C1',
    'Temp_Bearing_DE',
    'Temp_Bearing_NDE',
    'Speed_Out_Drive',
    'RB_Local_Control',
    'RB_Remote_Control',
    'RB_Breaker_Close',
    'RB_Breaker_Open',
    'RB_Estop_Status',
    'Supply_480VAC_On',
    'Drive_Coolant_Flow',
    'Drive_Coolant_Press',
    'Drive_Coolant_Leak',
    'Conv_Pump_Run',
    'Conv_Pump_Auto',
    'RB_Drive_OK',
    'RB_Drive_Running',
    'RB_Precharge_OK',
    'Conv_Cooling_Start',
    'Trans_Cooling_Start',
    'Motor_Heater_Ctrl',
    'RB_Estop_Reset',
    'RB_Blower_Start',
    'RB_Main_Brk_Close',
    'RB_Main_Brk_Open',
    'RB_Drive_Start',
    'RB_Drive_Reset',
    'Main_CB_Closed_Light',
    'Drive_Cooling_Start'
  ] as const
} as const

export const PARAMETER_META: Record<ParameterId, ParameterMeta> = {
  Auto_Speed_SP1: {
    id: 'Auto_Speed_SP1',
    name: 'Test Stand A Analog In SP 1',
    unit: 'Raw',
    description: 'Test Stand A Analog In SP 1',
    attributes: ['R'] as const
  },
  Conv_Cooling_Start: {
    id: 'Conv_Cooling_Start',
    name: 'Converter Cooling Water Pump 1 Start',
    unit: 'Bool',
    description: 'Converter Cooling Water Pump 1 Start',
    attributes: ['R', 'W'] as const
  },
  Conv_Pump_Auto: {
    id: 'Conv_Pump_Auto',
    name: 'Converter Cooling Water Pump Auto',
    unit: 'Bool',
    description: 'Converter Cooling Water Pump Auto',
    attributes: ['R'] as const
  },
  Conv_Pump_Run: {
    id: 'Conv_Pump_Run',
    name: 'Converter Cooling Water Pump 1 Running',
    unit: 'Bool',
    description: 'Converter Cooling Water Pump 1 Running',
    attributes: ['R'] as const
  },
  Cooling_Water_Press: {
    id: 'Cooling_Water_Press',
    name: 'Converter Cooling Water Pressure',
    unit: 'Raw',
    description: 'Converter Cooling Water Pressure',
    attributes: ['R'] as const
  },
  Drive_Coolant_Flow: {
    id: 'Drive_Coolant_Flow',
    name: 'Drive Coolant Flow',
    unit: 'Bool',
    description: 'Drive Coolant Flow',
    attributes: ['R'] as const
  },
  Drive_Coolant_Leak: {
    id: 'Drive_Coolant_Leak',
    name: 'Spare',
    unit: 'Bool',
    description: 'Spare',
    attributes: ['R'] as const
  },
  Drive_Coolant_Press: {
    id: 'Drive_Coolant_Press',
    name: 'Drive Coolant Pressure',
    unit: 'Bool',
    description: 'Drive Coolant Pressure',
    attributes: ['R'] as const
  },
  Drive_Cooling_Start: {
    id: 'Drive_Cooling_Start',
    name: 'Drive Cooling Water Pump 2 Start',
    unit: 'Bool',
    description: 'Drive Cooling Water Pump 2 Start',
    attributes: ['R', 'W'] as const
  },
  Drive_Cooling_Temp: {
    id: 'Drive_Cooling_Temp',
    name: 'Drive Cooling Water Temp',
    unit: 'Raw',
    description: 'Drive Cooling Water Temp',
    attributes: ['R'] as const
  },
  Main_CB_Closed_Light: {
    id: 'Main_CB_Closed_Light',
    name: 'Main CB Closed Light',
    unit: 'Bool',
    description: 'Main CB Closed Light',
    attributes: ['R', 'W'] as const
  },
  Motor_Heater_Ctrl: {
    id: 'Motor_Heater_Ctrl',
    name: 'Motor Heater Control Relay (DRV Running)',
    unit: 'Bool',
    description: 'Motor Heater Control Relay (DRV Running)',
    attributes: ['R', 'W'] as const
  },
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
    description: 'Represents Warning No. 1 to Warning No. 10 (P10.00 to P10.09)',
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
  'P10.10': {
    id: 'P10.10',
    alias: 'trip1',
    name: 'Trip No. 1',
    menu: 10,
    description: 'Represents Trip No. 1 to Trip No. 10 (P10.10 to P10.19)',
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
  'P10.20': {
    id: 'P10.20',
    alias: 'tripHistory1',
    name: 'Trip History 1',
    menu: 10,
    description: 'Represents Trip History 1 to Trip History 10 (P10.20 to P10.29)',
    range: { min: 0, max: 999 },
    attributes: ['R'] as const
  },
  'P10.21': {
    id: 'P10.21',
    alias: 'tripHistory2',
    name: 'Trip History 2',
    menu: 10,
    range: { min: 0, max: 999 },
    attributes: ['R'] as const
  },
  'P10.22': {
    id: 'P10.22',
    alias: 'tripHistory3',
    name: 'Trip History 3',
    menu: 10,
    range: { min: 0, max: 999 },
    attributes: ['R'] as const
  },
  'P10.23': {
    id: 'P10.23',
    alias: 'tripHistory4',
    name: 'Trip History 4',
    menu: 10,
    range: { min: 0, max: 999 },
    attributes: ['R'] as const
  },
  'P10.24': {
    id: 'P10.24',
    alias: 'tripHistory5',
    name: 'Trip History 5',
    menu: 10,
    range: { min: 0, max: 999 },
    attributes: ['R'] as const
  },
  'P10.25': {
    id: 'P10.25',
    alias: 'tripHistory6',
    name: 'Trip History 6',
    menu: 10,
    range: { min: 0, max: 999 },
    attributes: ['R'] as const
  },
  'P10.26': {
    id: 'P10.26',
    alias: 'tripHistory7',
    name: 'Trip History 7',
    menu: 10,
    range: { min: 0, max: 999 },
    attributes: ['R'] as const
  },
  'P10.27': {
    id: 'P10.27',
    alias: 'tripHistory8',
    name: 'Trip History 8',
    menu: 10,
    range: { min: 0, max: 999 },
    attributes: ['R'] as const
  },
  'P10.28': {
    id: 'P10.28',
    alias: 'tripHistory9',
    name: 'Trip History 9',
    menu: 10,
    range: { min: 0, max: 999 },
    attributes: ['R'] as const
  },
  'P10.29': {
    id: 'P10.29',
    alias: 'tripHistory10',
    name: 'Trip History 10',
    menu: 10,
    range: { min: 0, max: 999 },
    attributes: ['R'] as const
  },
  'P10.30': {
    id: 'P10.30',
    alias: 'secondsSinceTrip',
    name: 'Seconds Since Trip',
    unit: 's',
    menu: 10,
    range: { min: 0, max: 3599 },
    attributes: ['R'] as const
  },
  'P10.31': {
    id: 'P10.31',
    alias: 'hoursSinceTrip',
    name: 'Hours Since Trip',
    unit: 'h',
    menu: 10,
    range: { min: 0, max: 672 },
    attributes: ['R'] as const
  },
  'P10.34': {
    id: 'P10.34',
    alias: 'tripReset',
    name: 'CF9: Trip Reset',
    menu: 10,
    description: 'Control Flag (Dig I/P 6)',
    attributes: ['E', 'N'] as const
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
  },
  RB_Blower_Start: {
    id: 'RB_Blower_Start',
    name: 'Relay Booster Pump Motor Blower Start',
    unit: 'Bool',
    description: 'Relay Booster Pump Motor Blower Start',
    attributes: ['R', 'W'] as const
  },
  RB_Breaker_Close: {
    id: 'RB_Breaker_Close',
    name: 'Relay Booster Breaker Close',
    unit: 'Bool',
    description: 'Relay Booster Breaker Close',
    attributes: ['R'] as const
  },
  RB_Breaker_Open: {
    id: 'RB_Breaker_Open',
    name: 'Relay Booster Breaker Open',
    unit: 'Bool',
    description: 'Relay Booster Breaker Open',
    attributes: ['R'] as const
  },
  RB_Drive_OK: {
    id: 'RB_Drive_OK',
    name: 'Relay Booster Pump Drive DO1 Drive OK',
    unit: 'Bool',
    description: 'Relay Booster Pump Drive DO1 Drive OK',
    attributes: ['R'] as const
  },
  RB_Drive_Reset: {
    id: 'RB_Drive_Reset',
    name: 'Relay Booster Pump Drive Reset',
    unit: 'Bool',
    description: 'Relay Booster Pump Drive Reset',
    attributes: ['R', 'W'] as const
  },
  RB_Drive_Running: {
    id: 'RB_Drive_Running',
    name: 'Relay Booster Pump Drive DO2 Drive Running',
    unit: 'Bool',
    description: 'Relay Booster Pump Drive DO2 Drive Running',
    attributes: ['R'] as const
  },
  RB_Drive_Start: {
    id: 'RB_Drive_Start',
    name: 'Relay Booster Pump Drive Start',
    unit: 'Bool',
    description: 'Relay Booster Pump Drive Start',
    attributes: ['R', 'W'] as const
  },
  RB_Estop_Reset: {
    id: 'RB_Estop_Reset',
    name: 'Relay Pump E-Stop Reset',
    unit: 'Bool',
    description: 'Relay Pump E-Stop Reset',
    attributes: ['R', 'W'] as const
  },
  RB_Estop_Status: {
    id: 'RB_Estop_Status',
    name: 'Relay Booster E-Stop Status',
    unit: 'Bool',
    description: 'Relay Booster E-Stop Status',
    attributes: ['R'] as const
  },
  RB_Local_Control: {
    id: 'RB_Local_Control',
    name: 'Relay Booster Local Control',
    unit: 'Bool',
    description: 'Relay Booster Local Control',
    attributes: ['R'] as const
  },
  RB_Main_Brk_Close: {
    id: 'RB_Main_Brk_Close',
    name: 'Relay Pump Main Breaker Close',
    unit: 'Bool',
    description: 'Relay Pump Main Breaker Close',
    attributes: ['R', 'W'] as const
  },
  RB_Main_Brk_Open: {
    id: 'RB_Main_Brk_Open',
    name: 'Relay Booster Main Breaker Open',
    unit: 'Bool',
    description: 'Relay Booster Main Breaker Open',
    attributes: ['R', 'W'] as const
  },
  RB_Precharge_OK: {
    id: 'RB_Precharge_OK',
    name: 'Relay Booster Pump Drive DO3 Precharge Complete',
    unit: 'Bool',
    description: 'Relay Booster Pump Drive DO3 Precharge Complete',
    attributes: ['R'] as const
  },
  RB_Remote_Control: {
    id: 'RB_Remote_Control',
    name: 'Relay Booster Remote Control',
    unit: 'Bool',
    description: 'Relay Booster Remote Control',
    attributes: ['R'] as const
  },
  Remote_Speed_In: {
    id: 'Remote_Speed_In',
    name: 'Test Stand A Remote SPD IN',
    unit: 'Raw',
    description: 'Test Stand A Remote SPD IN',
    attributes: ['R'] as const
  },
  Speed_Out_Drive: {
    id: 'Speed_Out_Drive',
    name: 'Relay Booster Pump Speed Ref to Drive',
    unit: 'Raw',
    description: 'Relay Booster Pump Speed Ref to Drive',
    attributes: ['R', 'W'] as const
  },
  Supply_480VAC_On: {
    id: 'Supply_480VAC_On',
    name: '480VAC Supply ON',
    unit: 'Bool',
    description: '480VAC Supply ON',
    attributes: ['R'] as const
  },
  Temp_Bearing_DE: {
    id: 'Temp_Bearing_DE',
    name: 'Test Motor A Temp Bearing Drive End',
    unit: 'Raw',
    description: 'Test Motor A Temp Bearing Drive End',
    attributes: ['R'] as const
  },
  Temp_Bearing_NDE: {
    id: 'Temp_Bearing_NDE',
    name: 'Test Motor A Temp Bearing Non-Drive End',
    unit: 'Raw',
    description: 'Test Motor A Temp Bearing Non-Drive End',
    attributes: ['R'] as const
  },
  Temp_Winding_A1: {
    id: 'Temp_Winding_A1',
    alias: 'temperaturexdd',
    name: 'Test Motor A Temp Winding A1',
    unit: 'Raw',
    description: 'Test Motor A Temp Winding A1',
    attributes: ['R'] as const
  },
  Temp_Winding_B1: {
    id: 'Temp_Winding_B1',
    name: 'Test Motor A Temp Winding B1',
    unit: 'Raw',
    description: 'Test Motor A Temp Winding B1',
    attributes: ['R'] as const
  },
  Temp_Winding_C1: {
    id: 'Temp_Winding_C1',
    name: 'Test Motor A Temp Winding C1',
    unit: 'Raw',
    description: 'Test Motor A Temp Winding C1',
    attributes: ['R'] as const
  },
  Trans_Cooling_Start: {
    id: 'Trans_Cooling_Start',
    name: 'Transformer Cooling Fan Start',
    unit: 'Bool',
    description: 'Transformer Cooling Fan Start',
    attributes: ['R', 'W'] as const
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
  trip1: 'P10.10',
  trip2: 'P10.11',
  trip3: 'P10.12',
  trip4: 'P10.13',
  trip5: 'P10.14',
  tripHistory1: 'P10.20',
  tripHistory2: 'P10.21',
  tripHistory3: 'P10.22',
  tripHistory4: 'P10.23',
  tripHistory5: 'P10.24',
  tripHistory6: 'P10.25',
  tripHistory7: 'P10.26',
  tripHistory8: 'P10.27',
  tripHistory9: 'P10.28',
  tripHistory10: 'P10.29',
  secondsSinceTrip: 'P10.30',
  hoursSinceTrip: 'P10.31',
  tripReset: 'P10.34',
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
  motorPowerP9: 'P9.08',
  temperaturexdd: 'Temp_Winding_A1'
} as const

export type ParameterAlias = keyof typeof PARAMETER_ALIASES
