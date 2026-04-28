export type DriveMenu = {
  menu: number | string
  name: string
}

export type DriveParameterOption = {
  value: number
  label: string
}

export type DriveParameter = {
  id: string
  name?: string
  menu?: number
  unit?: string
  description?: string
  attributes?: string[]
  range_numeric?: { min?: number; max?: number }
  range_text?: string
  default?: string | number | null
  modbus_address?: number | null
  scale_factor: number
  options?: DriveParameterOption[] | null
}

export type DriveParametersResponse = {
  items: DriveParameter[]
  total: number
  page: number
  page_size: number
}
