import { useEffect, useState } from 'react'

const getWindowWidth = (): number => {
  if (typeof window === 'undefined') {
    return 1920
  }

  return window.innerWidth
}

export const useViewportWidth = (): number => {
  const [viewportWidth, setViewportWidth] = useState(getWindowWidth)

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined
    }

    const handleResize = () => {
      setViewportWidth(window.innerWidth)
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return viewportWidth
}

export const useIsViewportBelow = (maxWidth: number): boolean => {
  return useViewportWidth() <= maxWidth
}
