import { apiService } from './index'
import { Profile, ProfileCreate, ProfileUpdate, ApplyProfileResponse } from '../types/profile'

const BASE = '/profiles'

export const getProfiles = async (): Promise<Profile[]> => {
  return apiService.get<Profile[]>(BASE)
}

export const createProfile = async (profile: ProfileCreate): Promise<Profile> => {
  return apiService.post<Profile>(BASE, profile)
}

export const updateProfile = async (id: number, profile: ProfileUpdate): Promise<Profile> => {
  return apiService.put<Profile>(`${BASE}/${id}`, profile)
}

export const deleteProfile = async (id: number): Promise<void> => {
  return apiService.delete(`${BASE}/${id}`)
}

export const applyProfile = async (id: number): Promise<ApplyProfileResponse> => {
  return apiService.post<ApplyProfileResponse>(`${BASE}/${id}/apply`, {})
}
