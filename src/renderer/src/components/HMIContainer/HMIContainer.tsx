import { Centerer, Canvas, FluidCanvas } from './HMIContainer.styles'
import { useAspectScale } from 'hooks/useScale'
import { HMI_CONFIG } from 'config/constants'
import { useEffect, useMemo, useRef, useState } from 'react'
import { debugLog, isDebugEnabled } from 'utils/debug'

export interface HMIContainerProps {
  children: React.ReactNode
  baseWidth?: number
  baseHeight?: number
  responsiveOnSmallScreens?: boolean
}

const HMIContainer = ({
  children,
  baseWidth = HMI_CONFIG.SCREEN.BASE_WIDTH,
  baseHeight = HMI_CONFIG.SCREEN.BASE_HEIGHT,
  responsiveOnSmallScreens = false
}: HMIContainerProps) => {
  const { containerRef, scale } = useAspectScale(baseWidth, baseHeight)
  const [viewportWidth, setViewportWidth] = useState(
    typeof window === 'undefined' ? baseWidth : window.innerWidth
  )

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
  const isFluidViewport = responsiveOnSmallScreens && viewportWidth <= 768
  const isSmallViewport = responsiveOnSmallScreens && viewportWidth <= 900 && !isFluidViewport
  const effectiveScale = useMemo(() => {
    if (!isSmallViewport) return scale

    return Math.max(Math.min(viewportWidth / 540, 0.9), 0.68)
  }, [isSmallViewport, scale, viewportWidth])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleResize = () => {
      setViewportWidth(window.innerWidth)
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Log on meaningful changes only (avoid flooding on re-renders)
  useEffect(() => {
    if (!isDebugEnabled('trend') && !isDebugEnabled('scale') && !isDebugEnabled('trend.scale'))
      return

    const mode: 'zoom' | 'transform' = useZoom ? 'zoom' : 'transform'
    const prev = lastLogRef.current
    if (prev && prev.mode === mode && Math.abs(prev.scale - effectiveScale) < 0.01) return
    lastLogRef.current = { mode, scale: effectiveScale }

    debugLog('trend.scale', 'HMIContainer scaling update', {
      mode,
      base: { width: baseWidth, height: baseHeight },
      scale: effectiveScale
    })
  }, [useZoom, baseWidth, baseHeight, effectiveScale])

  if (isFluidViewport) {
    return (
      <Centerer ref={containerRef} $scrollable $alignTop>
        <FluidCanvas>{children}</FluidCanvas>
      </Centerer>
    )
  }

  if (isSmallViewport) {
    const frameWidth = Math.round(baseWidth * effectiveScale)
    const frameHeight = Math.round(baseHeight * effectiveScale)

    return (
      <Centerer ref={containerRef} $scrollable $alignTop>
        <div
          style={{
            position: 'relative',
            width: `${frameWidth}px`,
            height: `${frameHeight}px`,
            flexShrink: 0
          }}
        >
          <Canvas
            width={baseWidth}
            height={baseHeight}
            scale={effectiveScale}
            $useZoom={false}
            style={{ position: 'absolute', top: 0, left: 0, transformOrigin: 'top left' }}
          >
            {children}
          </Canvas>
        </div>
      </Centerer>
    )
  }

  return (
    <Centerer ref={containerRef}>
      <Canvas width={baseWidth} height={baseHeight} scale={effectiveScale} $useZoom={useZoom}>
        {children}
      </Canvas>
    </Centerer>
  )
}

export default HMIContainer
