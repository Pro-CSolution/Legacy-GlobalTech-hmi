import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { fetchManualHistory } from 'services'
import { Dataset } from 'components/TrendChart/TrendChart.types'
import { ManualTrendPoint, ManualTrendSeries } from 'services/manualTrendService'
import { createKeyedThrottle, debugLog } from 'utils/debug'

type UseManualTrendOptions = {
  windowMinutes?: number
  startTime?: string
  endTime?: string
  limit?: number
}

type ManualDataset = Dataset & {
  seriesId: number
  unit?: string | null
  isManual?: boolean
  stepped?: boolean
}

const HISTORY_RETRY = {
  INITIAL_DELAY_MS: 800,
  MAX_DELAY_MS: 30_000,
  JITTER_RATIO: 0.2
} as const

const computeRetryDelayMs = (attempt: number): number => {
  const safeAttempt = Math.max(1, Math.floor(attempt))
  const base = HISTORY_RETRY.INITIAL_DELAY_MS * 2 ** (safeAttempt - 1)
  const capped = Math.min(HISTORY_RETRY.MAX_DELAY_MS, base)
  const jitter = capped * HISTORY_RETRY.JITTER_RATIO * (Math.random() * 2 - 1)
  return Math.max(250, Math.floor(capped + jitter))
}

const toSeconds = (iso: string | number): number =>
  typeof iso === 'number' ? iso : new Date(iso).getTime() / 1000

const toIsoStringFromSeconds = (seconds: number): string => new Date(seconds * 1000).toISOString()

const resolveAbsoluteRange = (
  startTime?: string,
  endTime?: string
): { startSec: number; endSec: number } | null => {
  if (!startTime || !endTime) return null

  const startSec = toSeconds(startTime)
  const endSec = toSeconds(endTime)
  if (!Number.isFinite(startSec) || !Number.isFinite(endSec) || !(endSec > startSec)) {
    return null
  }

  return { startSec, endSec }
}

const mapManualPoint = (point: ManualTrendPoint): { x: number; y: number } => ({
  x: toSeconds(point.time),
  y: point.value
})

const buildCarryForwardPoints = ({
  visiblePoints,
  previousPoint,
  windowStartSec,
  windowEndSec
}: {
  visiblePoints: ManualTrendPoint[]
  previousPoint?: ManualTrendPoint
  windowStartSec: number
  windowEndSec: number
}): {
  data: Array<{ x: number; y: number }>
  syntheticStart: boolean
  syntheticEnd: boolean
} => {
  const visible = visiblePoints
    .map(mapManualPoint)
    .filter(
      (point) =>
        Number.isFinite(point.x) &&
        Number.isFinite(point.y) &&
        point.x >= windowStartSec &&
        point.x <= windowEndSec
    )
    .sort((a, b) => a.x - b.x)

  const previous = previousPoint ? mapManualPoint(previousPoint) : null
  const hasPrevious =
    previous !== null &&
    Number.isFinite(previous.x) &&
    Number.isFinite(previous.y) &&
    previous.x < windowStartSec

  let syntheticStart = false
  let syntheticEnd = false
  const data = [...visible]

  if (hasPrevious) {
    const firstVisible = visible[0]
    if (!firstVisible || firstVisible.x > windowStartSec) {
      data.unshift({ x: windowStartSec, y: previous.y })
      syntheticStart = true
    }

    if (!visible.length) {
      data.push({ x: windowEndSec, y: previous.y })
      syntheticEnd = true
    }
  }

  return { data, syntheticStart, syntheticEnd }
}

export const useManualTrendData = (
  seriesList: ManualTrendSeries[],
  { windowMinutes = 60, startTime, endTime, limit = 2000 }: UseManualTrendOptions = {}
) => {
  const [datasets, setDatasets] = useState<ManualDataset[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [xDomain, setXDomain] = useState<{ min: number; max: number } | null>(null)

  const absoluteRange = useMemo(
    () => resolveAbsoluteRange(startTime, endTime),
    [startTime, endTime]
  )
  const timeWindowSeconds = useMemo(() => {
    if (absoluteRange) {
      return absoluteRange.endSec - absoluteRange.startSec
    }

    return windowMinutes * 60
  }, [absoluteRange, windowMinutes])
  const debugGate = useMemo(() => createKeyedThrottle(1500), [])
  const loadSeqRef = useRef(0)
  const retryAttemptRef = useRef(0)
  const retryTimerRef = useRef<number | null>(null)

  const clearRetryTimer = useCallback(() => {
    if (retryTimerRef.current !== null) {
      window.clearTimeout(retryTimerRef.current)
      retryTimerRef.current = null
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => clearRetryTimer, [clearRetryTimer])

  const loadHistory = useCallback(
    async ({ resetRetry = true }: { resetRetry?: boolean } = {}) => {
      if (!seriesList.length) {
        clearRetryTimer()
        retryAttemptRef.current = 0
        setDatasets([])
        setXDomain(null)
        setError(null)
        setIsLoading(false)
        return
      }

      if (resetRetry) {
        retryAttemptRef.current = 0
        clearRetryTimer()
        setError(null)
      }

      setIsLoading(true)
      const seq = ++loadSeqRef.current
      try {
        const windowEndSec = absoluteRange?.endSec ?? Date.now() / 1000
        const windowStartSec = absoluteRange?.startSec ?? windowEndSec - timeWindowSeconds
        const startTime = toIsoStringFromSeconds(windowStartSec)
        const endTime = toIsoStringFromSeconds(windowEndSec)

        if (debugGate('trend.manual.history.start')) {
          debugLog('trend.data', 'manual loadHistory start', {
            windowMinutes,
            startTime,
            endTime,
            timeWindowSeconds,
            limit,
            windowStartSec,
            windowEndSec,
            seriesList: seriesList.map((s) => ({ id: s.id, name: s.name }))
          })
        }

        const responses = await Promise.all(
          seriesList.map(async (series) => {
            const [visible, previous] = await Promise.all([
              fetchManualHistory({
                seriesId: series.id,
                startTime,
                endTime,
                limit
              }),
              fetchManualHistory({
                seriesId: series.id,
                endTime: startTime,
                limit: 1
              })
            ])

            return {
              visible,
              previous: previous.points.at(-1)
            }
          })
        )

        console.debug('[useManualTrendData] history responses', {
          seriesList: seriesList.map((s) => ({ id: s.id, name: s.name })),
          counts: responses.map((r) => ({
            visible: r.visible.points.length,
            previous: r.previous ? 1 : 0
          }))
        })

        const nextDatasets: ManualDataset[] = responses.map((resp, idx) => {
          const series = seriesList[idx]
          const { data, syntheticStart, syntheticEnd } = buildCarryForwardPoints({
            visiblePoints: resp.visible.points,
            previousPoint: resp.previous,
            windowStartSec,
            windowEndSec
          })

          console.debug('[useManualTrendData] mapped series', {
            series: series.name,
            count: data.length,
            visibleCount: resp.visible.points.length,
            syntheticStart,
            syntheticEnd,
            sample: data.slice(-3)
          })

          return {
            seriesId: series.id,
            label: series.name,
            unit: series.unit,
            isManual: true,
            stepped: true,
            data,
            borderColor: series.color || '#3b82f6',
            backgroundColor: 'transparent',
            tension: 0,
            pointRadius: 2,
            borderWidth: 2
          }
        })

        setDatasets(nextDatasets)
        setXDomain({ min: windowStartSec, max: windowEndSec })
        retryAttemptRef.current = 0
        clearRetryTimer()
        setError(null)

        if (debugGate('trend.manual.history.done')) {
          const stats = nextDatasets.map((ds) => {
            let minX = Number.POSITIVE_INFINITY
            let maxX = Number.NEGATIVE_INFINITY
            ds.data.forEach((p) => {
              minX = Math.min(minX, p.x)
              maxX = Math.max(maxX, p.x)
            })
            return {
              seriesId: ds.seriesId,
              label: ds.label,
              count: ds.data.length,
              minX: Number.isFinite(minX) ? minX : null,
              maxX: Number.isFinite(maxX) ? maxX : null
            }
          })

          debugLog('trend.data', 'manual loadHistory done', {
            xDomain: { min: windowStartSec, max: windowEndSec },
            stats
          })
        }
      } catch (err) {
        console.error('Failed to load manual trend history', err)
        if (seq !== loadSeqRef.current) return

        setError('Failed to load manual history')

        const attempt = retryAttemptRef.current + 1
        retryAttemptRef.current = attempt

        if (retryTimerRef.current === null) {
          const delayMs = computeRetryDelayMs(attempt)
          retryTimerRef.current = window.setTimeout(() => {
            retryTimerRef.current = null
            if (seq !== loadSeqRef.current) return
            void loadHistory({ resetRetry: false })
          }, delayMs)
        }
      } finally {
        if (seq === loadSeqRef.current) {
          setIsLoading(false)
        }
      }
    },
    [absoluteRange, limit, seriesList, timeWindowSeconds, windowMinutes, debugGate, clearRetryTimer]
  )

  useEffect(() => {
    void loadHistory({ resetRetry: true })
  }, [loadHistory])

  const reload = useCallback(async (): Promise<void> => {
    await loadHistory({ resetRetry: true })
  }, [loadHistory])

  return { datasets, isLoading, error, reload, xDomain }
}
