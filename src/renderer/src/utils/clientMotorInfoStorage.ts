export type ClientMotorExtraField = {
  label: string
  value: string
}

export interface ClientMotorNameplate {
  customer: string
  driveModel: string
  motorType: string
  model: string
  catalog: string
  hp: string
  rpm: string
  volts: string
  amps: string
  hz: string
  frame: string
  duty: string
  enclosure: string
  tempRise: string
  serviceFactor: string
  efficiency: string
  inverterRating: string
  connection: string
  maxOperating: string
  extras: ClientMotorExtraField[]
}

export interface DualClientMotorInfo {
  drive1: ClientMotorNameplate
  drive2: ClientMotorNameplate
}

export const CLIENT_MOTOR_INFO_STORAGE_KEY = 'client_motor_info_ge_nameplate'
export const CLIENT_MOTOR_INFO_UPDATED_EVENT = 'client-motor-info-updated'
export const DUAL_CLIENT_MOTOR_INFO_STORAGE_KEY = 'dual_client_motor_info_ge_nameplate'
export const DUAL_CLIENT_MOTOR_INFO_UPDATED_EVENT = 'dual-client-motor-info-updated'
export const CLIENT_MOTOR_MAX_EXTRAS = 15

export const DEFAULT_CLIENT_MOTOR_INFO: ClientMotorNameplate = {
  customer: 'MANSON',
  driveModel: 'MV3000e',
  motorType: '',
  model: '5GEB22 D4',
  catalog: 'L145030050',
  hp: 'N/A',
  rpm: 'S9 / Continuous',
  volts: '3000 SCFM by blower',
  amps: 'Closed cooling, IP56',
  hz: '45 C internal max',
  frame: '45 C / 55 C',
  duty: '3',
  enclosure: '587',
  tempRise: '1380 / 1120 / 1048',
  serviceFactor: '0.85',
  efficiency: '800 / 40.7',
  inverterRating: '1400 / 1150 / 1075',
  connection: 'WYE',
  maxOperating: '3000 / 153',
  extras: []
}

export const cloneClientMotorInfo = (info: ClientMotorNameplate): ClientMotorNameplate => ({
  ...info,
  extras: info.extras.map((item) => ({ ...item }))
})

export const DEFAULT_DUAL_CLIENT_MOTOR_INFO: DualClientMotorInfo = {
  drive1: cloneClientMotorInfo(DEFAULT_CLIENT_MOTOR_INFO),
  drive2: cloneClientMotorInfo(DEFAULT_CLIENT_MOTOR_INFO)
}

const readString = (
  obj: Record<string, unknown>,
  key: keyof ClientMotorNameplate,
  fallback: ClientMotorNameplate
): string => {
  const value = obj[key]
  if (typeof value === 'string') return value
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  return fallback[key] as string
}

const sanitizeClientMotorInfo = (
  value: unknown,
  fallback: ClientMotorNameplate = DEFAULT_CLIENT_MOTOR_INFO
): ClientMotorNameplate => {
  if (!value || typeof value !== 'object') return cloneClientMotorInfo(fallback)

  const obj = value as Record<string, unknown>
  const extrasRaw = obj.extras
  const extras = Array.isArray(extrasRaw)
    ? extrasRaw
        .map((item) => {
          if (!item || typeof item !== 'object') return null
          const row = item as Record<string, unknown>
          const label = typeof row.label === 'string' ? row.label.trim() : ''
          const fieldValue = typeof row.value === 'string' ? row.value.trim() : ''
          if (!label) return null
          return { label, value: fieldValue }
        })
        .filter((item): item is ClientMotorExtraField => Boolean(item))
        .slice(0, CLIENT_MOTOR_MAX_EXTRAS)
    : fallback.extras.map((item) => ({ ...item }))

  return {
    customer: readString(obj, 'customer', fallback),
    driveModel: readString(obj, 'driveModel', fallback),
    motorType: readString(obj, 'motorType', fallback),
    model: readString(obj, 'model', fallback),
    catalog: readString(obj, 'catalog', fallback),
    hp: readString(obj, 'hp', fallback),
    rpm: readString(obj, 'rpm', fallback),
    volts: readString(obj, 'volts', fallback),
    amps: readString(obj, 'amps', fallback),
    hz: readString(obj, 'hz', fallback),
    frame: readString(obj, 'frame', fallback),
    duty: readString(obj, 'duty', fallback),
    enclosure: readString(obj, 'enclosure', fallback),
    tempRise: readString(obj, 'tempRise', fallback),
    serviceFactor: readString(obj, 'serviceFactor', fallback),
    efficiency: readString(obj, 'efficiency', fallback),
    inverterRating: readString(obj, 'inverterRating', fallback),
    connection: readString(obj, 'connection', fallback),
    maxOperating: readString(obj, 'maxOperating', fallback),
    extras
  }
}

export const loadClientMotorInfo = (): ClientMotorNameplate => {
  if (typeof window === 'undefined') return DEFAULT_CLIENT_MOTOR_INFO

  try {
    const raw = localStorage.getItem(CLIENT_MOTOR_INFO_STORAGE_KEY)
    if (!raw) return DEFAULT_CLIENT_MOTOR_INFO

    const parsed = JSON.parse(raw)
    return sanitizeClientMotorInfo(parsed, DEFAULT_CLIENT_MOTOR_INFO)
  } catch {
    return DEFAULT_CLIENT_MOTOR_INFO
  }
}

export const saveClientMotorInfo = (info: ClientMotorNameplate): void => {
  if (typeof window === 'undefined') return

  localStorage.setItem(CLIENT_MOTOR_INFO_STORAGE_KEY, JSON.stringify(info))
  window.dispatchEvent(new CustomEvent(CLIENT_MOTOR_INFO_UPDATED_EVENT, { detail: info }))
}

export const loadDualClientMotorInfo = (): DualClientMotorInfo => {
  const baseInfo = cloneClientMotorInfo(loadClientMotorInfo())
  const fallback: DualClientMotorInfo = {
    drive1: cloneClientMotorInfo(baseInfo),
    drive2: cloneClientMotorInfo(baseInfo)
  }

  if (typeof window === 'undefined') return fallback

  try {
    const raw = localStorage.getItem(DUAL_CLIENT_MOTOR_INFO_STORAGE_KEY)
    if (!raw) return fallback

    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return fallback
    const obj = parsed as Record<string, unknown>

    return {
      drive1: sanitizeClientMotorInfo(obj.drive1, fallback.drive1),
      drive2: sanitizeClientMotorInfo(obj.drive2, fallback.drive2)
    }
  } catch {
    return fallback
  }
}

export const saveDualClientMotorInfo = (info: DualClientMotorInfo): void => {
  if (typeof window === 'undefined') return

  localStorage.setItem(DUAL_CLIENT_MOTOR_INFO_STORAGE_KEY, JSON.stringify(info))
  window.dispatchEvent(new CustomEvent(DUAL_CLIENT_MOTOR_INFO_UPDATED_EVENT, { detail: info }))
}
