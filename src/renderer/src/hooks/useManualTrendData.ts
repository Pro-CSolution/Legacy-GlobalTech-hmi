import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { fetchManualHistory } from 'services'
import { Dataset } from 'components/TrendChart/TrendChart.types'
import { ManualTrendSeries } from 'services/manualTrendService'
import { createKeyedThrottle, debugLog } from 'utils/debug'

type UseManualTrendOptions = {
  windowMinutes?: number
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

export const useManualTrendData = (
  seriesList: ManualTrendSeries[],
  { windowMinutes = 60, limit = 2000 }: UseManualTrendOptions = {}
) => {
  const [datasets, setDatasets] = useState<ManualDataset[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [xDomain, setXDomain] = useState<{ min: number; max: number } | null>(null)

  const timeWindowSeconds = useMemo(() => windowMinutes * 60, [windowMinutes])
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
        if (debugGate('trend.manual.history.start')) {
          debugLog('trend.data', 'manual loadHistory start', {
            windowMinutes,
            timeWindowSeconds,
            limit,
            seriesList: seriesList.map((s) => ({ id: s.id, name: s.name }))
          })
        }

        const responses = await Promise.all(
          seriesList.map((series) =>
            fetchManualHistory({
              seriesId: series.id,
              windowMinutes,
              limit
            })
          )
        )
        console.debug('[useManualTrendData] history responses', {
          seriesList: seriesList.map((s) => ({ id: s.id, name: s.name })),
          counts: responses.map((r) => r.points.length)
        })

        const nextDatasets: ManualDataset[] = responses.map((resp, idx) => {
          const series = seriesList[idx]
          const mapped = resp.points.map((p) => ({
            x: toSeconds(p.time),
            y: p.value
          }))
          console.debug('[useManualTrendData] mapped series', {
            series: series.name,
            count: mapped.length,
            sample: mapped.slice(-3)
          })

          return {
            seriesId: series.id,
            label: series.name,
            unit: series.unit,
            isManual: true,
            stepped: true,
            data: mapped,
            borderColor: series.color || '#3b82f6',
            backgroundColor: 'transparent',
            tension: 0,
            pointRadius: 2,
            borderWidth: 2
          }
        })

        setDatasets(nextDatasets)
        const lastTs = Math.max(
          ...nextDatasets.flatMap((ds) => ds.data.map((p) => p.x)),
          Date.now() / 1000
        )
        setXDomain({ min: lastTs - timeWindowSeconds, max: lastTs })
        // Éxito: limpiar estado de retry
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
            xDomain: { min: lastTs - timeWindowSeconds, max: lastTs },
            lastTs,
            stats
          })
        }
      } catch (err) {
        console.error('Failed to load manual trend history', err)
        if (seq !== loadSeqRef.current) return

        setError('No se pudo cargar el historial manual')

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
    [limit, seriesList, timeWindowSeconds, windowMinutes, debugGate, clearRetryTimer]
  )

  useEffect(() => {
    void loadHistory({ resetRetry: true })
  }, [loadHistory])

  const reload = useCallback(async (): Promise<void> => {
    await loadHistory({ resetRetry: true })
  }, [loadHistory])

  return { datasets, isLoading, error, reload, xDomain }
}
