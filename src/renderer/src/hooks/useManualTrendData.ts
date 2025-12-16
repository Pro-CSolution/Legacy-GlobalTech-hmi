import { useCallback, useEffect, useMemo, useState } from 'react'
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

  const loadHistory = useCallback(async () => {
    if (!seriesList.length) {
      setDatasets([])
      setXDomain(null)
      return
    }

    setIsLoading(true)
    setError(null)
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
      setError('No se pudo cargar el historial manual')
    } finally {
      setIsLoading(false)
    }
  }, [limit, seriesList, timeWindowSeconds, windowMinutes, debugGate])

  useEffect(() => {
    void loadHistory()
  }, [loadHistory])

  return { datasets, isLoading, error, reload: loadHistory, xDomain }
}
