import type { WagoLiveRegisterType } from 'services/wagoLiveService'

export type WagoMonitorGroupLabel =
  | 'Analog Input'
  | 'Digital Input'
  | 'Digital Output'
  | 'Analog Output'

export type WagoValueKind = 'raw'

export type WagoSpreadsheetRow = {
  id: string
  group: WagoMonitorGroupLabel
  systemId: string
  tag: string
  name: string
  modbusRegister: number
  modbusOffset: number
  sourceRegisterType: WagoLiveRegisterType
  sourceOffset: number
  valueKind: WagoValueKind
  unit: string
  access: string
}

const createRow = (
  systemId: string,
  tag: string,
  group: WagoMonitorGroupLabel,
  modbusRegister: number,
  modbusOffset: number,
  sourceRegisterType: WagoLiveRegisterType,
  sourceOffset: number,
  valueKind: WagoValueKind,
  unit: string,
  access: string
): WagoSpreadsheetRow => ({
  id: `${systemId}:${tag}`,
  group,
  systemId,
  tag,
  name: tag,
  modbusRegister,
  modbusOffset,
  sourceRegisterType,
  sourceOffset,
  valueKind,
  unit,
  access
})

const analogInputRow = (index: number, tag: string): WagoSpreadsheetRow =>
  createRow(
    `AI-${String(index).padStart(3, '0')}`,
    tag,
    'Analog Input',
    443000 + (index - 1),
    index - 1,
    'input',
    index - 1,
    'raw',
    'Raw',
    'R'
  )

const digitalInputRow = (index: number, tag: string): WagoSpreadsheetRow =>
  createRow(
    `DI-${String(index).padStart(3, '0')}`,
    tag,
    'Digital Input',
    30001 + (index - 1),
    index - 1,
    'discrete',
    index - 1,
    'raw',
    'Bool',
    'R'
  )

const digitalOutputRow = (index: number, tag: string): WagoSpreadsheetRow =>
  createRow(
    `DO-${String(index).padStart(3, '0')}`,
    tag,
    'Digital Output',
    30512 + (index - 1),
    index - 1,
    'coil',
    index - 1,
    'raw',
    'Bool',
    'R,W'
  )

const WAGO_ANALOG_OUTPUT_START_ADDRESS = 512

const analogOutputRow = (index: number, tag: string): WagoSpreadsheetRow => {
  const address = WAGO_ANALOG_OUTPUT_START_ADDRESS + (index - 1)

  return createRow(
    `AO-${String(index).padStart(3, '0')}`,
    tag,
    'Analog Output',
    address,
    address,
    'holding',
    address,
    'raw',
    'Raw',
    'R,W'
  )
}

export const WAGO_LIVE_ROWS: ReadonlyArray<WagoSpreadsheetRow> = [
  analogInputRow(1, 'Motor_RPM_Transducer'),
  analogInputRow(2, 'Motor_HP_Transducer'),
  analogInputRow(3, 'Coolant_Pressure_In'),
  analogInputRow(4, 'TSA_AnIn_Spare2'),
  analogInputRow(5, 'Motor_Winding_A1'),
  analogInputRow(6, 'Motor_Winding_B1'),
  analogInputRow(7, 'Motor_Winding_C1'),
  analogInputRow(8, 'Motor_Winding_A2'),
  analogInputRow(9, 'Motor_Winding_B2'),
  analogInputRow(10, 'Motor_Winding_C2'),
  analogInputRow(11, 'Motor_Bearing_DE'),
  analogInputRow(12, 'Motor_Bearing_NDE'),
  analogInputRow(13, 'Motor_Winding_A1_Spare'),
  analogInputRow(14, 'Motor_Winding_B1_Spare'),
  analogInputRow(15, 'Motor_Winding_C1_Spare'),
  analogInputRow(16, 'Motor_Winding_A2_Spare'),
  analogInputRow(17, 'Motor_Winding_B2_Spare'),
  analogInputRow(18, 'Motor_Winding_C2_Spare'),
  analogInputRow(19, 'Motor_Bearing_DE_Spare'),
  analogInputRow(20, 'Motor_Bearing_NDE_Spare'),
  analogInputRow(21, 'Coolant_Temp'),
  analogInputRow(22, 'RTD_Spare1'),
  analogInputRow(23, 'RTD_Spare2'),
  analogInputRow(24, 'RTD_Spare3'),
  analogInputRow(25, 'Motor_Torque_Transducer'),
  analogInputRow(26, 'Transducer_Spare'),

  digitalInputRow(1, 'PS1_Bad_Fuse'),
  digitalInputRow(2, 'PS1_OK'),
  digitalInputRow(3, 'PS2_Bad_Fuse'),
  digitalInputRow(4, 'PS2_OK'),
  digitalInputRow(5, 'Loc_Sel_Sw'),
  digitalInputRow(6, 'Rem_Sel_Sw'),
  digitalInputRow(7, 'DigIn1_Fail'),
  digitalInputRow(8, 'DigIn2_Fail'),
  digitalInputRow(9, 'CB_Close_PB'),
  digitalInputRow(10, 'CB_Open_PB'),
  digitalInputRow(11, 'DigIn3_Fail'),
  digitalInputRow(12, 'DigIn4_Fail'),
  digitalInputRow(13, 'Estop_Status'),
  digitalInputRow(14, 'DigIn6_Spare'),
  digitalInputRow(15, 'DigIn5_Fail'),
  digitalInputRow(16, 'DigIn6_Fail'),
  digitalInputRow(17, 'CB_Closed Status'),
  digitalInputRow(18, 'DigIn8_Spare'),
  digitalInputRow(19, 'DigIn7_Fail'),
  digitalInputRow(20, 'DigIn8_Fail'),
  digitalInputRow(21, 'Drive Coolant Leak'),
  digitalInputRow(22, '480VAC On'),
  digitalInputRow(23, 'DigIn9_Fail'),
  digitalInputRow(24, 'DigIn10_Fail'),
  digitalInputRow(25, 'DigIn11_Spare'),
  digitalInputRow(26, 'DigIn12_Spare'),
  digitalInputRow(27, 'DigIn11_Fail'),
  digitalInputRow(28, 'DigIn12_Fail'),
  digitalInputRow(29, 'DigIn13_Spare'),
  digitalInputRow(30, 'DigIn14_Spare'),
  digitalInputRow(31, 'DigIn13_Fail'),
  digitalInputRow(32, 'DigIn14_Fail'),
  digitalInputRow(33, 'Drive_Coolant_Pump2_Running'),
  digitalInputRow(34, 'Drive_Coolant_Pump_Hand'),
  digitalInputRow(35, 'DigIn15_Fail'),
  digitalInputRow(36, 'DigIn16_Fail'),
  digitalInputRow(37, 'Drive_Cooland Pump_Auto'),
  digitalInputRow(38, 'Drive_Coolant_Pump1_Running'),
  digitalInputRow(39, 'DigIn17_Fail'),
  digitalInputRow(40, 'DigIn18_Fail'),
  digitalInputRow(41, 'Drive_Coolant_Flow_Sw'),
  digitalInputRow(42, 'Drive_Coolant_Pressure_Sw'),
  digitalInputRow(43, 'DigIn19_Fail'),
  digitalInputRow(44, 'DigIn20_Fail'),
  digitalInputRow(45, 'Drive_Coolant Leak_Sw'),
  digitalInputRow(46, 'DigIn22_Spare'),
  digitalInputRow(47, 'DigIn21_Fail'),
  digitalInputRow(48, 'DigIn22_Fail'),
  digitalInputRow(49, 'DigIn23_Spare'),
  digitalInputRow(50, 'Drive_Coolant_Pump_Sw'),
  digitalInputRow(51, 'DigIn23_Fail'),
  digitalInputRow(52, 'DigIn24_Fail'),
  digitalInputRow(53, 'DigIn25_Spare'),
  digitalInputRow(54, 'Blower_Motor_Aux'),
  digitalInputRow(55, 'DigIn25_Fail'),
  digitalInputRow(56, 'DigIn26_Fail'),
  digitalInputRow(57, 'DigIn27_Spare'),
  digitalInputRow(58, 'DigIn28_Spare'),
  digitalInputRow(59, 'DigIn27_Fail'),
  digitalInputRow(60, 'DigIn28_Fail'),
  digitalInputRow(61, 'Drive OK'),
  digitalInputRow(62, 'Drive_Running'),
  digitalInputRow(63, 'DigIn29_Fail'),
  digitalInputRow(64, 'DigIn30_Fail'),
  digitalInputRow(65, 'Drive_Precharge_Complete'),
  digitalInputRow(66, 'DigIn32_Spare'),
  digitalInputRow(67, 'DigIn31_Fail'),
  digitalInputRow(68, 'DigIn32_Fail'),
  digitalInputRow(69, 'DigIn33_Spare'),
  digitalInputRow(70, 'DigIn34_Spare'),
  digitalInputRow(71, 'DigIn33_Fail'),
  digitalInputRow(72, 'DigIn34_Fail'),
  digitalInputRow(73, 'DigIn35_Spare'),
  digitalInputRow(74, 'DigIn36_Spare'),
  digitalInputRow(75, 'DigIn35_Fail'),
  digitalInputRow(76, 'DigIn36_Fail'),
  digitalInputRow(77, 'DigIn37_Spare'),
  digitalInputRow(78, 'DigIn38_Spare'),
  digitalInputRow(79, 'DigIn37_Fail'),
  digitalInputRow(80, 'DigIn38_Fail'),

  digitalOutputRow(1, 'Coolant_Pump1_Run'),
  digitalOutputRow(2, 'DigOut2_Spare'),
  digitalOutputRow(3, 'DigOut3_Spare'),
  digitalOutputRow(4, 'DigOut4_Spare'),
  digitalOutputRow(5, 'DigOut5_Spare'),
  digitalOutputRow(6, 'Main_CB_Open'),
  digitalOutputRow(7, 'Estop_Reset_Out'),
  digitalOutputRow(8, 'DigOut8_Spare'),
  digitalOutputRow(9, 'Blower_Motor_Run_Out'),
  digitalOutputRow(10, 'DigOut10_Spare'),
  digitalOutputRow(11, 'DigOut11_Spare'),
  digitalOutputRow(12, 'DigOut12_Spare'),
  digitalOutputRow(13, 'Main_CB_Close'),
  digitalOutputRow(14, 'Precharge1_PC1_Out'),
  digitalOutputRow(15, 'Precharge_2_PC2_Out'),
  digitalOutputRow(16, 'DigOut16_Spare'),
  digitalOutputRow(17, 'DigOut17_Spare'),
  digitalOutputRow(18, 'Coolant_Pump2_Run'),
  digitalOutputRow(19, 'Main_CB_Open_Light'),
  digitalOutputRow(20, 'Main_CB_Closed_Light'),
  digitalOutputRow(21, 'Drive_Start_Out'),
  digitalOutputRow(22, 'Drive_Reset_Out'),
  digitalOutputRow(23, 'Drive_Spare_Out'),
  digitalOutputRow(24, 'DigOut24_Spare'),
  digitalOutputRow(25, 'DigOut25_Spare'),
  digitalOutputRow(26, 'DigOut26_Spare'),
  digitalOutputRow(27, 'DigOut27_Spare'),
  digitalOutputRow(28, 'DigOut28_Spare'),
  digitalOutputRow(29, 'DigOut29_Spare'),
  digitalOutputRow(30, 'DigOut30_Spare'),

  analogOutputRow(1, 'Speed_Output_to_Drive'),
  analogOutputRow(2, 'Analog_Output_Spare1'),
  analogOutputRow(3, 'Analog_Output_Spare2'),
  analogOutputRow(4, 'Analog_Output_Spare3')
]
