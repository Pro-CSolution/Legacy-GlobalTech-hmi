import { ParameterId } from 'types'

const INTERLOCK_TRIP_CODE = 1

const ACTIVE_TRIP_PARAMETER_IDS: readonly ParameterId[] = [
  'P10.10',
  'P10.11',
  'P10.12',
  'P10.13',
  'P10.14'
]

export const decodeDriveFaultCode = (value: unknown): number => {
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return 0

  let decoded = Math.trunc(numeric)
  if (decoded < 0) decoded = decoded & 0xffff
  if (decoded > 999) decoded = Math.round(decoded / 100)

  return decoded > 0 ? decoded : 0
}

export const hasActiveInterlockTrip = (snapshot: Record<string, unknown>): boolean => {
  return ACTIVE_TRIP_PARAMETER_IDS.some(
    (parameterId) => decodeDriveFaultCode(snapshot[parameterId]) === INTERLOCK_TRIP_CODE
  )
}
