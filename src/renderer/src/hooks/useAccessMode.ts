import { useContext } from 'react'
import { AccessModeContext } from '../contexts/AccessModeContext'

export const useAccessMode = () => {
  const value = useContext(AccessModeContext)

  if (!value) {
    throw new Error('useAccessMode must be used within an AccessModeProvider')
  }

  return value
}
