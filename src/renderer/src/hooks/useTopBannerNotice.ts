import { useContext } from 'react'
import { TopBannerNoticeContext } from '../contexts/TopBannerNoticeContext'

export const useTopBannerNotice = () => {
  const context = useContext(TopBannerNoticeContext)

  if (!context) {
    throw new Error('useTopBannerNotice must be used within a TopBannerNoticeProvider')
  }

  return context
}
