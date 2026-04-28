import { createContext, type FC, type ReactNode } from 'react'
import {
  type AccessMode,
  setAccessMode,
  VIEW_ONLY_ACTION_MESSAGE
} from '../access/accessMode'

export interface AccessModeContextValue {
  mode: AccessMode
  isViewOnly: boolean
  blockedActionMessage: string
}

export const AccessModeContext = createContext<AccessModeContextValue | null>(null)

export const AccessModeProvider: FC<{ mode: AccessMode; children: ReactNode }> = ({
  mode,
  children
}) => {
  setAccessMode(mode)

  return (
    <AccessModeContext.Provider
      value={{
        mode,
        isViewOnly: mode === 'view-only',
        blockedActionMessage: VIEW_ONLY_ACTION_MESSAGE
      }}
    >
      {children}
    </AccessModeContext.Provider>
  )
}
