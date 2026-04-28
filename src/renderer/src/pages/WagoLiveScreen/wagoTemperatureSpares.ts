import { WAGO_LIVE_ROWS, type WagoSpreadsheetRow } from './wagoSpreadsheetRows'

export const WAGO_TEMPERATURE_SPARE_TAGS = [
  'Motor_Winding_A1_Spare',
  'Motor_Winding_B1_Spare',
  'Motor_Winding_C1_Spare',
  'Motor_Winding_A2_Spare',
  'Motor_Winding_B2_Spare',
  'Motor_Winding_C2_Spare',
  'Motor_Bearing_DE_Spare',
  'Motor_Bearing_NDE_Spare',
  'Coolant_Temp',
  'RTD_Spare1',
  'RTD_Spare2',
  'RTD_Spare3'
] as const

const WAGO_TEMPERATURE_SPARE_TAG_SET = new Set<string>(WAGO_TEMPERATURE_SPARE_TAGS)

export const WAGO_TEMPERATURE_SPARE_ROWS: ReadonlyArray<WagoSpreadsheetRow> = WAGO_LIVE_ROWS.filter(
  (row) => row.group === 'Analog Input' && WAGO_TEMPERATURE_SPARE_TAG_SET.has(row.tag)
)

export const toWagoTemperatureSpareFahrenheit = (rawValue: number): number =>
  ((rawValue / 10) * 9) / 5 + 32

export const formatWagoTemperatureSpareSignalLabel = (signalIndex: number): string => {
  const moduleIndex = Math.floor(signalIndex / 2)
  const channelIndex = (signalIndex % 2) + 1
  return `AI${String(moduleIndex).padStart(2, '0')} CH${channelIndex}`
}

export const getWagoTemperatureSpareDisplayName = (
  row: WagoSpreadsheetRow,
  overrides?: Record<string, string>
): string => overrides?.[row.id]?.trim() || row.name
