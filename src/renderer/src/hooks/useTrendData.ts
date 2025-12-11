import { useCallback, useEffect, useMemo, useState } from 'react'
import { fetchTrendHistory, onTrendUpdate, subscribeTrend, unsubscribeTrend } from 'services'
import { DeviceId, ParameterId } from 'types'
import { ParameterAlias, PARAMETER_ALIASES } from 'types/generated/devices'
import { Dataset } from 'components/TrendChart/TrendChart.types'

type UseTrendDataOptions = {
  windowMinutes?: number
  limitPerParam?: number
}

type TrendDataset = Dataset & { parameterId: ParameterId }

const toSeconds = (iso: string | number): number =>
  typeof iso === 'number' ? iso : new Date(iso).getTime() / 1000

type ParameterKey = ParameterId | ParameterAlias

const resolveParameterIds = (keys: ParameterKey[]): ParameterId[] =>
  keys
    .map((key) => {
      const mapped = PARAMETER_ALIASES[key as ParameterAlias]
      return (mapped ?? key) as ParameterId
    })
    // Filtro defensivo por si llega algo fuera del catálogo
    .filter((v, idx, arr): v is ParameterId => typeof v === 'string' && arr.indexOf(v) === idx)

export const useTrendData = (
  deviceId: DeviceId,
  parameterKeys: ParameterKey[],
  { windowMinutes = 5, limitPerParam = 2000 }: UseTrendDataOptions = {}
) => {
  const [datasets, setDatasets] = useState<TrendDataset[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [xDomain, setXDomain] = useState<{ min: number; max: number } | null>(null)

  const timeWindowSeconds = useMemo(() => windowMinutes * 60, [windowMinutes])
  const parameterIds = useMemo(() => resolveParameterIds(parameterKeys), [parameterKeys])

  const loadHistory = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const nowSeconds = Date.now() / 1000
      const cutoff = nowSeconds - windowMinutes * 60

      const response = await fetchTrendHistory({
        deviceId,
        parameterIds,
        windowMinutes,
        limitPerParam
      })

      console.debug('[useTrendData] history response', {
        deviceId,
        parameterIds,
        seriesKeys: Object.keys(response.series || {}),
        firstSeriesSample: response.series?.[parameterIds[0]]?.[0]
      })

      const nextDatasets: TrendDataset[] = parameterIds.map((pid, idx) => {
        const series = response.series[pid] || []
        const mapped = series
          .map((point) => ({
            x: toSeconds(point.time),
            y: point.value
          }))
          .filter((p) => p.x >= cutoff)

        return {
          parameterId: pid,
          label: parameterKeys[idx] ?? pid,
          data: mapped,
          borderColor: ['#06b6d4', '#10b981', '#f59e0b', '#f43f5e'][idx % 4],
          backgroundColor: 'transparent',
          tension: 0.4,
          pointRadius: 0,
          borderWidth: 2
        }
      })

      setDatasets(nextDatasets)
      const lastTs = Math.max(...nextDatasets.flatMap((ds) => ds.data.map((p) => p.x)), nowSeconds)
      setXDomain({ min: lastTs - timeWindowSeconds, max: lastTs })
    } catch (err) {
      console.error('Failed to load trend history', err)
      setError('No se pudo cargar el historial')
    } finally {
      setIsLoading(false)
    }
  }, [deviceId, parameterIds, parameterKeys, windowMinutes, limitPerParam, timeWindowSeconds])

  useEffect(() => {
    if (!parameterIds.length) return
    void loadHistory()
  }, [loadHistory, parameterIds.length])

  useEffect(() => {
    if (!parameterIds.length) return

    console.debug('[trend] subscribing', { deviceId, parameterIds })
    subscribeTrend(deviceId, parameterIds)
    const off = onTrendUpdate((payload) => {
      if (payload.device_id !== deviceId) return
      const tsSeconds = payload.ts ? toSeconds(payload.ts) : Date.now() / 1000
      const cutoff = tsSeconds - timeWindowSeconds

      setDatasets((prev) =>
        prev.map((ds) => {
          const val = payload.data[ds.parameterId]
          if (val === undefined || val === null) return ds

          console.debug('[trend] update', {
            deviceId,
            pid: ds.parameterId,
            ts: tsSeconds,
            val,
            prevLen: ds.data.length
          })

          const nextAbsolute = [...ds.data, { x: tsSeconds, y: Number(val) }].filter(
            (p) => p.x >= cutoff
          )

          return { ...ds, data: nextAbsolute.slice(-limitPerParam) }
        })
      )
      setXDomain({ min: tsSeconds - timeWindowSeconds, max: tsSeconds })
    })

    return () => {
      off()
      console.debug('[trend] unsubscribing', { deviceId })
      unsubscribeTrend(deviceId)
    }
  }, [deviceId, parameterIds, timeWindowSeconds, limitPerParam])

  const getDataset = useCallback(
    (key: ParameterKey | ParameterId): TrendDataset[] => {
      const idx = parameterKeys.indexOf(key as ParameterKey)
      if (idx >= 0 && datasets[idx]) return [datasets[idx]]
      const pidIdx = parameterIds.indexOf(key as ParameterId)
      if (pidIdx >= 0 && datasets[pidIdx]) return [datasets[pidIdx]]
      return []
    },
    [datasets, parameterIds, parameterKeys]
  )

  return { datasets, isLoading, error, reload: loadHistory, xDomain, getDataset }
}
