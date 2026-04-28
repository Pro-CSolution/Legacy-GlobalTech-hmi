import { useCallback, useMemo, useRef, useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import styled from 'styled-components'
import type { Dataset } from 'components/TrendChart'

type Domain = { min: number; max: number }

type Props = {
  datasets: Dataset[]
  fullDomain: Domain | null
  value: Domain | null
  onChange: (domain: Domain | null) => void
}

type DragMode = 'move' | 'left' | 'right'

const SVG_WIDTH = 1000
const SVG_HEIGHT = 72
const PREVIEW_PADDING_X = 12
const PREVIEW_PADDING_Y = 10

const Container = styled.div`
  position: relative;
  width: 100%;
  padding: 10px 14px 12px;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  background:
    linear-gradient(180deg, ${({ theme }) => `${theme.colors.background.primary}E8`} 0%, ${({ theme }) => `${theme.colors.background.secondary}E8`} 100%);
  box-shadow: inset 0 1px 0 ${({ theme }) => `${theme.colors.text.primary}08`};
  touch-action: none;
  user-select: none;
`

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 8px;
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.text.secondary};
`

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`

const ZoomButton = styled.button`
  width: 28px;
  height: 28px;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  background: ${({ theme }) => theme.colors.background.primary};
  color: ${({ theme }) => theme.colors.text.primary};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    background 0.15s ease,
    transform 0.15s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.accent.primary};
    background: ${({ theme }) => `${theme.colors.accent.primary}12`};
    transform: scale(1.03);
  }
`

const Timeline = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 6px;
  font-size: 10px;
  color: ${({ theme }) => theme.colors.text.secondary};
`

const Surface = styled.div`
  position: relative;
  width: 100%;
  height: 78px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  overflow: visible;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0) 100%),
    ${({ theme }) => theme.colors.background.primary};
`

const SvgOverlay = styled.svg`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
`

const Selection = styled.div`
  position: absolute;
  top: 6px;
  bottom: 6px;
  border-radius: 16px;
  border: 2px solid ${({ theme }) => theme.colors.accent.primary};
  background: ${({ theme }) => `${theme.colors.accent.primary}18`};
  box-shadow:
    0 0 0 1px ${({ theme }) => `${theme.colors.accent.primary}25`} inset,
    0 6px 16px rgba(0, 0, 0, 0.18);
  touch-action: none;
`

const Handle = styled.div<{ $side: 'left' | 'right' }>`
  position: absolute;
  top: 50%;
  ${({ $side }) => ($side === 'left' ? 'left: 8px;' : 'right: 8px;')}
  transform: translateY(-50%);
  width: 32px;
  height: 32px;
  border-radius: 999px;
  background: ${({ theme }) => `${theme.colors.background.secondary}F2`};
  border: 2px solid ${({ theme }) => theme.colors.borders.primary};
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  touch-action: none;
  z-index: 2;

  &::before,
  &::after {
    content: '';
    display: block;
    width: 2px;
    height: 10px;
    border-radius: 999px;
    background: ${({ theme }) => theme.colors.text.secondary};
  }

  &::after {
    margin-left: 3px;
  }
`

const EmptyState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 78px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme }) => theme.colors.background.primary};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
`

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value))

const formatNavigatorTime = (seconds: number, spanSec: number): string => {
  const date = new Date(seconds * 1000)

  if (spanSec <= 24 * 60 * 60) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  if (spanSec <= 7 * 24 * 60 * 60) {
    return date.toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

const toPercent = (value: number, min: number, max: number): number => {
  if (!(max > min)) return 0
  return ((value - min) / (max - min)) * 100
}

const buildPreviewPaths = (datasets: Dataset[], domain: Domain): string[] => {
  const points: Array<{ x: number; y: number; color: string }> = []
  let yMin = Number.POSITIVE_INFINITY
  let yMax = Number.NEGATIVE_INFINITY

  datasets.forEach((dataset, datasetIndex) => {
    const color = dataset.borderColor || `hsl(${(datasetIndex * 47) % 360}, 70%, 60%)`
    const source = dataset.data
    const step = Math.max(1, Math.ceil(source.length / 180))
    const reduced = source.filter((_, index) => index % step === 0 || index === source.length - 1)

    reduced.forEach((point) => {
      if (point.x < domain.min || point.x > domain.max || !Number.isFinite(point.y)) return
      yMin = Math.min(yMin, point.y)
      yMax = Math.max(yMax, point.y)
      points.push({ x: point.x, y: point.y, color })
    })
  })

  if (!points.length || !Number.isFinite(yMin) || !Number.isFinite(yMax)) return []

  const ySpan = yMax - yMin || 1
  const xSpan = domain.max - domain.min || 1
  const drawableWidth = SVG_WIDTH - PREVIEW_PADDING_X * 2
  const drawableHeight = SVG_HEIGHT - PREVIEW_PADDING_Y * 2

  return datasets
    .map((dataset, datasetIndex) => {
      const color = dataset.borderColor || `hsl(${(datasetIndex * 47) % 360}, 70%, 60%)`
      const source = dataset.data
      const step = Math.max(1, Math.ceil(source.length / 180))
      const reduced = source.filter((_, index) => index % step === 0 || index === source.length - 1)
      const coords = reduced
        .filter((point) => point.x >= domain.min && point.x <= domain.max && Number.isFinite(point.y))
        .map((point) => {
          const x = PREVIEW_PADDING_X + ((point.x - domain.min) / xSpan) * drawableWidth
          const y =
            PREVIEW_PADDING_Y + drawableHeight - ((point.y - yMin) / ySpan) * drawableHeight
          return `${x.toFixed(1)},${y.toFixed(1)}`
        })

      if (coords.length < 2) return ''

      return `<polyline fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" points="${coords.join(' ')}" />`
    })
    .filter(Boolean)
}

export const TrendRangeNavigator = ({ datasets, fullDomain, value, onChange }: Props) => {
  const surfaceRef = useRef<HTMLDivElement>(null)
  const [drag, setDrag] = useState<{
    pointerId: number
    mode: DragMode
    startRatio: number
    startSelection: Domain
  } | null>(null)

  const selection = useMemo(() => {
    if (!fullDomain) return null
    return value ?? fullDomain
  }, [fullDomain, value])

  const previewMarkup = useMemo(() => {
    if (!fullDomain) return ''
    return buildPreviewPaths(datasets, fullDomain).join('')
  }, [datasets, fullDomain])

  const emitDomain = useCallback(
    (next: Domain) => {
      if (!fullDomain) return

      const min = clamp(next.min, fullDomain.min, fullDomain.max)
      const max = clamp(next.max, fullDomain.min, fullDomain.max)
      const normalized = min < max ? { min, max } : { min: fullDomain.min, max: fullDomain.max }
      const epsilon = (fullDomain.max - fullDomain.min) * 0.001

      if (
        Math.abs(normalized.min - fullDomain.min) <= epsilon &&
        Math.abs(normalized.max - fullDomain.max) <= epsilon
      ) {
        onChange(null)
        return
      }

      onChange(normalized)
    },
    [fullDomain, onChange]
  )

  const zoomByFactor = useCallback(
    (factor: number) => {
      if (!fullDomain || !selection) return

      const fullSpan = fullDomain.max - fullDomain.min
      const currentSpan = selection.max - selection.min
      const minSpan = Math.max(fullSpan * 0.04, 60)
      const nextSpan = clamp(currentSpan * factor, minSpan, fullSpan)
      const center = (selection.min + selection.max) / 2
      let nextMin = center - nextSpan / 2
      let nextMax = center + nextSpan / 2

      if (nextMin < fullDomain.min) {
        nextMax += fullDomain.min - nextMin
        nextMin = fullDomain.min
      }

      if (nextMax > fullDomain.max) {
        nextMin -= nextMax - fullDomain.max
        nextMax = fullDomain.max
      }

      emitDomain({ min: nextMin, max: nextMax })
    },
    [emitDomain, fullDomain, selection]
  )

  const ratioFromClientX = useCallback((clientX: number): number | null => {
    const element = surfaceRef.current
    if (!element) return null
    const rect = element.getBoundingClientRect()
    if (!(rect.width > 0)) return null
    return clamp((clientX - rect.left) / rect.width, 0, 1)
  }, [])

  const beginDrag = useCallback(
    (event: React.PointerEvent, mode: DragMode) => {
      if (!selection) return

      const ratio = ratioFromClientX(event.clientX)
      if (ratio === null) return

      setDrag({
        pointerId: event.pointerId,
        mode,
        startRatio: ratio,
        startSelection: selection
      })

      event.currentTarget.setPointerCapture?.(event.pointerId)
      event.stopPropagation()
      event.preventDefault()
    },
    [ratioFromClientX, selection]
  )

  const updateDrag = useCallback(
    (clientX: number) => {
      if (!drag || !fullDomain) return
      const ratio = ratioFromClientX(clientX)
      if (ratio === null) return

      const fullSpan = fullDomain.max - fullDomain.min
      const delta = (ratio - drag.startRatio) * fullSpan
      const start = drag.startSelection
      const minSpan = Math.max(fullSpan * 0.04, 60)

      if (drag.mode === 'move') {
        let nextMin = start.min + delta
        let nextMax = start.max + delta

        if (nextMin < fullDomain.min) {
          nextMax += fullDomain.min - nextMin
          nextMin = fullDomain.min
        }
        if (nextMax > fullDomain.max) {
          nextMin -= nextMax - fullDomain.max
          nextMax = fullDomain.max
        }

        emitDomain({ min: nextMin, max: nextMax })
        return
      }

      if (drag.mode === 'left') {
        const nextMin = clamp(start.min + delta, fullDomain.min, start.max - minSpan)
        emitDomain({ min: nextMin, max: start.max })
        return
      }

      const nextMax = clamp(start.max + delta, start.min + minSpan, fullDomain.max)
      emitDomain({ min: start.min, max: nextMax })
    },
    [drag, emitDomain, fullDomain, ratioFromClientX]
  )

  const handleSurfacePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!selection || !fullDomain) return
      const ratio = ratioFromClientX(event.clientX)
      if (ratio === null) return

      const targetX = fullDomain.min + (fullDomain.max - fullDomain.min) * ratio
      const half = (selection.max - selection.min) / 2
      let nextMin = targetX - half
      let nextMax = targetX + half

      if (nextMin < fullDomain.min) {
        nextMax += fullDomain.min - nextMin
        nextMin = fullDomain.min
      }
      if (nextMax > fullDomain.max) {
        nextMin -= nextMax - fullDomain.max
        nextMax = fullDomain.max
      }

      emitDomain({ min: nextMin, max: nextMax })
      setDrag({
        pointerId: event.pointerId,
        mode: 'move',
        startRatio: ratio,
        startSelection: { min: nextMin, max: nextMax }
      })
      event.currentTarget.setPointerCapture?.(event.pointerId)
      event.preventDefault()
    },
    [emitDomain, fullDomain, ratioFromClientX, selection]
  )

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!drag || event.pointerId !== drag.pointerId) return
      updateDrag(event.clientX)
    },
    [drag, updateDrag]
  )

  const handlePointerEnd = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!drag || event.pointerId !== drag.pointerId) return
      setDrag(null)
      event.currentTarget.releasePointerCapture?.(event.pointerId)
    },
    [drag]
  )

  if (!fullDomain || !selection) {
    return (
      <Container>
        <Header>
          <span>Navigator</span>
          <span>No data</span>
        </Header>
        <EmptyState>Waiting for trend data</EmptyState>
      </Container>
    )
  }

  const leftPercent = toPercent(selection.min, fullDomain.min, fullDomain.max)
  const rightPercent = toPercent(selection.max, fullDomain.min, fullDomain.max)
  const widthPercent = Math.max(rightPercent - leftPercent, 4)
  const spanSec = fullDomain.max - fullDomain.min

  return (
    <Container>
      <Header>
        <span>Zoom Navigator</span>
        <HeaderActions>
          <span>
            {formatNavigatorTime(selection.min, spanSec)} -{' '}
            {formatNavigatorTime(selection.max, spanSec)}
          </span>
          <ZoomButton type="button" onClick={() => zoomByFactor(0.7)} title="Zoom in">
            <Plus size={14} />
          </ZoomButton>
          <ZoomButton type="button" onClick={() => zoomByFactor(1.4)} title="Zoom out">
            <Minus size={14} />
          </ZoomButton>
        </HeaderActions>
      </Header>

      <Surface
        ref={surfaceRef}
        onPointerDown={handleSurfacePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
      >
        <SvgOverlay viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} preserveAspectRatio="none">
          <rect
            x="0"
            y="0"
            width={SVG_WIDTH}
            height={SVG_HEIGHT}
            fill="transparent"
            stroke="rgba(255,255,255,0.04)"
          />
          {[0.25, 0.5, 0.75].map((stop) => (
            <line
              key={stop}
              x1={stop * SVG_WIDTH}
              y1="8"
              x2={stop * SVG_WIDTH}
              y2={SVG_HEIGHT - 8}
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="1"
            />
          ))}
          <g dangerouslySetInnerHTML={{ __html: previewMarkup }} />
        </SvgOverlay>

        <Selection
          style={{
            left: `${leftPercent}%`,
            width: `${widthPercent}%`
          }}
          onPointerDown={(event) => beginDrag(event, 'move')}
        >
          <Handle $side="left" onPointerDown={(event) => beginDrag(event, 'left')} />
          <Handle $side="right" onPointerDown={(event) => beginDrag(event, 'right')} />
        </Selection>
      </Surface>

      <Timeline>
        <span>{formatNavigatorTime(fullDomain.min, spanSec)}</span>
        <span>{formatNavigatorTime(fullDomain.max, spanSec)}</span>
      </Timeline>
    </Container>
  )
}
