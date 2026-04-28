import { assertAccessAllowsMutation } from 'access/accessMode'
import { apiService } from './index'
import { Profile, ProfileCreate, ProfileUpdate, ApplyProfileResponse } from '../types/profile'

const BASE = '/profiles'
type ProfileApplyMotorScope = 1 | 2

export const getProfiles = async (): Promise<Profile[]> => {
  return apiService.get<Profile[]>(BASE)
}

export const createProfile = async (profile: ProfileCreate): Promise<Profile> => {
  assertAccessAllowsMutation('Profile creation')
  return apiService.post<Profile>(BASE, profile)
}

export const updateProfile = async (id: number, profile: ProfileUpdate): Promise<Profile> => {
  assertAccessAllowsMutation('Profile updates')
  return apiService.put<Profile>(`${BASE}/${id}`, profile)
}

export const deleteProfile = async (id: number): Promise<void> => {
  assertAccessAllowsMutation('Profile deletion')
  return apiService.delete(`${BASE}/${id}`)
}

export const applyProfile = async (
  id: number,
  targetMotorScope?: ProfileApplyMotorScope
): Promise<ApplyProfileResponse> => {
  assertAccessAllowsMutation('Profile apply')
  return apiService.post<ApplyProfileResponse>(`${BASE}/${id}/apply`, {
    target_motor_scope: targetMotorScope
  })
}
