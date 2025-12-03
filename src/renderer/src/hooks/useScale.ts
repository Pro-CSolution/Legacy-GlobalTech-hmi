import { useRef, useState, useEffect } from 'react'

interface UseAspectScaleReturn {
  containerRef: React.RefObject<HTMLDivElement | null>
  scale: number
}

export const useAspectScale = (baseWidth: number, baseHeight: number): UseAspectScaleReturn => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const resize = (): void => {
      if (!containerRef.current) return
      const { clientWidth, clientHeight } = containerRef.current

      const scaleW = clientWidth / baseWidth
      const scaleH = clientHeight / baseHeight

      // We want to contain the canvas within the viewport, maintaining aspect ratio.
      // So we take the minimum of the two scale factors.
      const minScale = Math.min(scaleW, scaleH)

      setScale(minScale)
    }

    const observer = new ResizeObserver(resize)
    if (containerRef.current) observer.observe(containerRef.current)

    // Initial call
    resize()

    return () => observer.disconnect()
  }, [baseWidth, baseHeight])

  return { containerRef, scale }
}
