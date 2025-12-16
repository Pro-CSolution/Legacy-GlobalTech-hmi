import { ParameterId, PARAMETER_ALIASES } from 'types/generated/devices'

export const AVAILABLE_VARIABLES: {
  id: ParameterId
  label: string
  unit: string
  color: string
  category: string
}[] = [
  {
    id: PARAMETER_ALIASES.motorVolts,
    label: 'Line Voltage',
    unit: 'VAC',
    color: '#06b6d4',
    category: 'Electrical'
  },
  {
    id: PARAMETER_ALIASES.motorCurrent,
    label: 'Total Current',
    unit: 'A',
    color: '#10b981',
    category: 'Electrical'
  },
  {
    id: PARAMETER_ALIASES.motorPower,
    label: 'Active Power',
    unit: 'kW',
    color: '#8b5cf6',
    category: 'Electrical'
  },
  {
    id: PARAMETER_ALIASES.frequencyFeedback,
    label: 'Frequency',
    unit: 'Hz',
    color: '#f59e0b',
    category: 'Drive'
  },
  {
    id: PARAMETER_ALIASES.torqueDemand,
    label: 'Motor Torque',
    unit: '%',
    color: '#f43f5e',
    category: 'Drive'
  },
  {
    id: PARAMETER_ALIASES.cdcElectronicsTemperature,
    label: 'Winding Temp',
    unit: '°C',
    color: '#3b82f6',
    category: 'Temperature'
  },
  {
    id: PARAMETER_ALIASES.inputBridgeTemperature,
    label: 'Bearing Temp',
    unit: '°C',
    color: '#ec4899',
    category: 'Temperature'
  },
  {
    id: PARAMETER_ALIASES.driveCurrent,
    label: 'Vibration X',
    unit: 'mm/s',
    color: '#d946ef',
    category: 'Mechanical'
  },
  {
    id: PARAMETER_ALIASES.torqueLimitPositive1,
    label: 'Coolant Pressure',
    unit: 'PSI',
    color: '#14b8a6',
    category: 'Process'
  },
  {
    id: PARAMETER_ALIASES.jogSpeed1,
    label: 'Jog Speed 1',
    unit: '',
    color: '#14b8a6',
    category: 'Process'
  }
]

export const TIME_RANGES = [
  { label: '1M', value: 1 },
  { label: '5M', value: 5 },
  { label: '15M', value: 15 },
  { label: '30M', value: 30 },
  { label: '1H', value: 60 }
]

export const MANUAL_COLORS = ['#06b6d4', '#10b981', '#f59e0b', '#f43f5e', '#3b82f6', '#8b5cf6']

const toLocalDateTimeString = (date: Date): string => {
  const copy = new Date(date.getTime())
  const offsetMinutes = copy.getTimezoneOffset()
  copy.setMinutes(copy.getMinutes() - offsetMinutes)
  return copy.toISOString().slice(0, 19)
}

export const nowLocalInput = (): string => {
  return toLocalDateTimeString(new Date())
}

export const formatLocalInputFromDate = (source: Date): string => {
  return toLocalDateTimeString(source)
}
