import { Centerer, Canvas } from './HMIContainer.styles'
import { useAspectScale } from 'hooks/useScale'
import { HMI_CONFIG } from 'config/constants'
import { useEffect, useMemo, useRef } from 'react'
import { debugLog, isDebugEnabled } from 'utils/debug'

export interface HMIContainerProps {
  children: React.ReactNode
  baseWidth?: number
  baseHeight?: number
}

const HMIContainer = ({
  children,
  baseWidth = HMI_CONFIG.SCREEN.BASE_WIDTH,
  baseHeight = HMI_CONFIG.SCREEN.BASE_HEIGHT
}: HMIContainerProps) => {
  const { containerRef, scale } = useAspectScale(baseWidth, baseHeight)

  const supportsZoom = (): boolean => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return false
    try {
      if (typeof CSS !== 'undefined' && typeof CSS.supports === 'function') {
        return CSS.supports('zoom', '1')
      }
    } catch {
      // ignore
    }
    return 'zoom' in (document.documentElement.style as unknown as Record<string, unknown>)
  }

  const useZoom = useMemo(() => supportsZoom(), [])
  const lastLogRef = useRef<{ mode: 'zoom' | 'transform'; scale: number } | null>(null)

  // Log on meaningful changes only (avoid flooding on re-renders)
  useEffect(() => {
    if (!isDebugEnabled('trend') && !isDebugEnabled('scale') && !isDebugEnabled('trend.scale'))
      return

    const mode: 'zoom' | 'transform' = useZoom ? 'zoom' : 'transform'
    const prev = lastLogRef.current
    if (prev && prev.mode === mode && Math.abs(prev.scale - scale) < 0.01) return
    lastLogRef.current = { mode, scale }

    debugLog('trend.scale', 'HMIContainer scaling update', {
      mode,
      base: { width: baseWidth, height: baseHeight },
      scale
    })
  }, [useZoom, baseWidth, baseHeight, scale])

  return (
    <Centerer ref={containerRef}>
      <Canvas width={baseWidth} height={baseHeight} scale={scale} $useZoom={useZoom}>
        {children}
      </Canvas>
    </Centerer>
  )
}

export default HMIContainer
