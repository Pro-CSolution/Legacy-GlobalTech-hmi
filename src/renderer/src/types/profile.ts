export interface ProfileParameter {
  id?: number
  profile_id?: number
  device_id: string
  parameter_id: string
  value: string | number | boolean
}

export interface Profile {
  id: number
  name: string
  color: string
  icon: string
  created_at: string
  last_used?: string
  parameters: ProfileParameter[]
}

export type ProfileCreate = Omit<Profile, 'id' | 'created_at' | 'last_used'>

export type ProfileUpdate = Partial<ProfileCreate>

export type ApplyProfileStatus = 'pending' | 'writing' | 'success' | 'error'

export interface ApplyProfileResult {
  device_id: string
  parameter_id: string
  status: ApplyProfileStatus
  message?: string
}

export interface ApplyProfileResponse {
  results: ApplyProfileResult[]
}
