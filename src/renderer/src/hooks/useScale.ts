import { useRef, useState, useLayoutEffect, RefObject } from 'react'
import { debugLog, isDebugEnabled } from 'utils/debug'

interface UseAspectScaleReturn {
  containerRef: RefObject<HTMLDivElement | null>
  scale: number
}

export const useAspectScale = (baseWidth: number, baseHeight: number): UseAspectScaleReturn => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  // Use layout effect so the first paint already uses the correct scale.
  // This prevents a visible "jump" (render at scale=1, then quickly correcting)
  // when navigating between routes that mount/unmount the scaled container.
  useLayoutEffect(() => {
    let lastLogAt = -Infinity
    const resize = (): void => {
      if (!containerRef.current) return
      const { clientWidth, clientHeight } = containerRef.current

      const scaleW = clientWidth / baseWidth
      const scaleH = clientHeight / baseHeight

      // We want to contain the canvas within the viewport, maintaining aspect ratio.
      // So we take the minimum of the two scale factors.
      const minScale = Math.min(scaleW, scaleH)

      setScale(minScale)

      if (isDebugEnabled('trend') || isDebugEnabled('scale') || isDebugEnabled('trend.scale')) {
        const now = typeof performance !== 'undefined' ? performance.now() : Date.now()
        if (now - lastLogAt >= 250) {
          lastLogAt = now
          debugLog('trend.scale', 'useAspectScale resize', {
            base: { width: baseWidth, height: baseHeight },
            container: { width: clientWidth, height: clientHeight },
            scale: { w: scaleW, h: scaleH, min: minScale }
          })
        }
      }
    }

    const observer = new ResizeObserver(resize)
    if (containerRef.current) observer.observe(containerRef.current)

    // Initial call
    resize()

    return () => observer.disconnect()
  }, [baseWidth, baseHeight])

  return { containerRef, scale }
}
