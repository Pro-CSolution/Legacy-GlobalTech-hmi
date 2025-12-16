import { apiService } from './index'
import { DriveMenu, DriveParametersResponse } from '../types/drive'

const BASE = '/drive'

export const getDriveMenus = async (): Promise<DriveMenu[]> => {
  return apiService.get<DriveMenu[]>(`${BASE}/menus`)
}

export type GetDriveParametersParams = {
  deviceId?: string
  menu?: number
  search?: string
  page?: number
  pageSize?: number
}

export const getDriveParameters = async ({
  deviceId = 'drive_avid',
  menu,
  search,
  page = 1,
  pageSize = 12
}: GetDriveParametersParams): Promise<DriveParametersResponse> => {
  return apiService.get<DriveParametersResponse>(`${BASE}/parameters`, {
    device_id: deviceId,
    menu,
    search,
    page,
    page_size: pageSize
  })
}












