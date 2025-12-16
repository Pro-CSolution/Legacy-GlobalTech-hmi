import { useCurrentTime } from './useCurrentTime'

export const useCurrentTimeForInput = () => {
  const currentTime = useCurrentTime()
  const local = new Date(currentTime.getTime())
  const offsetMinutes = local.getTimezoneOffset()
  local.setMinutes(local.getMinutes() - offsetMinutes)
  return local.toISOString().slice(0, 19)
}
