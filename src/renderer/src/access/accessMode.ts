export type AccessMode = 'operator' | 'view-only'

export const VIEW_ONLY_ACTION_MESSAGE = 'View-only mode does not allow changes.'

let currentAccessMode: AccessMode = 'operator'

export const setAccessMode = (mode: AccessMode): void => {
  currentAccessMode = mode
}

export const getAccessMode = (): AccessMode => currentAccessMode

export const isViewOnlyAccessMode = (): boolean => currentAccessMode === 'view-only'

export const getViewOnlyActionMessage = (action = 'This action'): string =>
  `${action} is unavailable in view-only mode.`

export const assertAccessAllowsMutation = (action = 'This action'): void => {
  if (isViewOnlyAccessMode()) {
    throw new Error(getViewOnlyActionMessage(action))
  }
}
