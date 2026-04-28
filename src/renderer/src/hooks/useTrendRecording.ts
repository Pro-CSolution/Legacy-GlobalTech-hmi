import { useContext } from 'react'
import { TrendRecordingContext } from 'contexts/TrendRecordingContext'

export const useTrendRecording = () => {
  const context = useContext(TrendRecordingContext)
  if (!context) {
    throw new Error('useTrendRecording must be used within a TrendRecordingProvider')
  }

  return context
}
