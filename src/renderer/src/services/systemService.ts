import { apiService } from './index'
import { SYSTEM_ACTIONS_CONFIG } from 'config/app.config'

const BASE = '/system'

export const rebootSystem = async (): Promise<void> => {
  const token = SYSTEM_ACTIONS_CONFIG.TOKEN

  await apiService.post(`${BASE}/reboot`, undefined, {
    headers: token ? { 'X-System-Token': token } : undefined
  })
}
