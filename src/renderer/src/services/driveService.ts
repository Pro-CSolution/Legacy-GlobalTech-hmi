import { assertAccessAllowsMutation, isViewOnlyAccessMode } from 'access/accessMode'
import { apiService } from './index'
import { DriveMenu, DriveParametersResponse } from '../types/drive'

const BASE = '/drive'
const MONITOR_BASE = '/monitor/drive'

export const getDriveMenus = async (): Promise<DriveMenu[]> => {
  const base = isViewOnlyAccessMode() ? MONITOR_BASE : BASE
  return apiService.get<DriveMenu[]>(`${base}/menus`)
}

export const getDriveMenusForDevice = async (deviceId = 'drive_avid'): Promise<DriveMenu[]> => {
  const base = isViewOnlyAccessMode() ? MONITOR_BASE : BASE
  return apiService.get<DriveMenu[]>(`${base}/menus`, {
    device_id: deviceId
  })
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
  const base = isViewOnlyAccessMode() ? MONITOR_BASE : BASE
  return apiService.get<DriveParametersResponse>(`${base}/parameters`, {
    device_id: deviceId,
    menu,
    search,
    page,
    page_size: pageSize
  })
}

export type UpdateDriveParameterScaleFactorParams = {
  deviceId?: string
  parameterId: string
  scaleFactor: number
}

export type UpdateDriveParameterScaleFactorResponse = {
  device_id: string
  parameter_id: string
  scale_factor: number
}

export const updateDriveParameterScaleFactor = async ({
  deviceId = 'drive_avid',
  parameterId,
  scaleFactor
}: UpdateDriveParameterScaleFactorParams): Promise<UpdateDriveParameterScaleFactorResponse> => {
  assertAccessAllowsMutation('Scale factor updates')

  return apiService.patch<UpdateDriveParameterScaleFactorResponse>(
    `${BASE}/parameters/${encodeURIComponent(parameterId)}/scale-factor`,
    {
      device_id: deviceId,
      scale_factor: scaleFactor
    }
  )
}
