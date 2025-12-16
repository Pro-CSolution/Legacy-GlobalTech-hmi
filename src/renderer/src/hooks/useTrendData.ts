import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { fetchTrendHistory, onTrendUpdate, subscribeTrend, unsubscribeTrend } from 'services'
import { DeviceId, ParameterId } from 'types'
import { ParameterAlias, PARAMETER_ALIASES } from 'types/generated/devices'
import { Dataset } from 'components/TrendChart/TrendChart.types'
import { createKeyedThrottle, debugLog } from 'utils/debug'

type UseTrendDataOptions = {
  windowMinutes?: number
  limitPerParam?: number
}

type TrendDataset = Dataset & { parameterId: ParameterId }

const toSeconds = (iso: string | number): number =>
  typeof iso === 'number' ? iso : new Date(iso).getTime() / 1000

type Point = { x: number; y: number }

const filterValidPoints = (points: Point[]): Point[] =>
  points.filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y))

const computeSpan = (
  points: Point[]
): { minX: number | null; maxX: number | null; spanSec: number } => {
  if (!points.length) return { minX: null, maxX: null, spanSec: 0 }
  let minX = Number.POSITIVE_INFINITY
  let maxX = Number.NEGATIVE_INFINITY
  for (const p of points) {
    minX = Math.min(minX, p.x)
    maxX = Math.max(maxX, p.x)
  }
  if (!Number.isFinite(minX) || !Number.isFinite(maxX))
    return { minX: null, maxX: null, spanSec: 0 }
  return { minX, maxX, spanSec: Math.max(0, maxX - minX) }
}

const safeSeconds = (value: unknown, fallbackSeconds: number): { seconds: number; ok: boolean } => {
  if (typeof value === 'number' && Number.isFinite(value)) return { seconds: value, ok: true }
  if (typeof value === 'string' && value) {
    const parsed = toSeconds(value)
    if (Number.isFinite(parsed)) return { seconds: parsed, ok: true }
  }
  return { seconds: fallbackSeconds, ok: false }
}

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
  const debugGate = useMemo(() => createKeyedThrottle(1500), [])
  const loadSeqRef = useRef(0)
  const lastRealtimeTsRef = useRef<number | null>(null)

  const loadHistory = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const seq = ++loadSeqRef.current
      const nowSeconds = Date.now() / 1000
      const windowSec = timeWindowSeconds
      const cutoffForNow = nowSeconds - windowSec

      // El backend limita por parámetro y devuelve *los más recientes primero*.
      // Si la señal es de alta frecuencia, 2000 puntos pueden NO cubrir la ventana completa.
      // Por eso: reintentamos con un límite mayor si detectamos truncamiento.
      const MAX_REQUEST_LIMIT = 100_000
      const MAX_ATTEMPTS = 5

      let requestLimit = Math.max(1, limitPerParam)
      let response: Awaited<ReturnType<typeof fetchTrendHistory>> | null = null

      if (debugGate('trend.data.history.start')) {
        debugLog('trend.data', 'loadHistory start', {
          deviceId,
          windowMinutes,
          timeWindowSeconds,
          limitPerParam,
          parameterIds,
          nowSeconds,
          cutoffForNow
        })
      }

      for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        response = await fetchTrendHistory({
          deviceId,
          parameterIds,
          windowMinutes,
          limitPerParam: requestLimit
        })

        if (seq !== loadSeqRef.current) return

        const perSeries: Array<Record<string, unknown>> = []
        let hitLimit = false
        let anyTruncatedStart = false
        let observedMaxX = Number.NEGATIVE_INFINITY
        for (const pid of parameterIds) {
          const series = response.series?.[pid] || []
          const hit = series.length >= requestLimit
          if (hit) hitLimit = true

          let minX = Number.POSITIVE_INFINITY
          let maxX = Number.NEGATIVE_INFINITY
          let countValid = 0
          for (const p of series) {
            const x = toSeconds(p.time)
            if (!Number.isFinite(x)) continue
            countValid += 1
            minX = Math.min(minX, x)
            maxX = Math.max(maxX, x)
          }

          const hasBounds = Number.isFinite(minX) && Number.isFinite(maxX)
          if (hasBounds) observedMaxX = Math.max(observedMaxX, maxX)

          perSeries.push({
            parameterId: pid,
            requestLimit,
            count: series.length,
            countValid,
            hitLimit: hit,
            minX: hasBounds ? minX : null,
            maxX: hasBounds ? maxX : null
          })
        }

        const anchorCandidate = Math.max(
          nowSeconds,
          Number.isFinite(observedMaxX) ? observedMaxX : nowSeconds
        )
        const cutoffCandidate = anchorCandidate - windowSec

        perSeries.forEach((entry) => {
          const minX = entry.minX as number | null
          const hit = entry.hitLimit as boolean
          const truncatedStart =
            hit && typeof minX === 'number' ? minX > cutoffCandidate + 1 : false
          entry.truncatedStart = truncatedStart
          if (truncatedStart) anyTruncatedStart = true
        })

        if (debugGate('trend.data.history.attempt')) {
          debugLog('trend.data', 'loadHistory attempt', {
            attempt,
            requestLimit,
            hitLimit,
            anchorCandidate,
            cutoffCandidate,
            anyTruncatedStart,
            windowSec,
            perSeries
          })
        }

        // Si no estamos golpeando el límite, no hay más datos que pedir.
        if (!hitLimit) break
        // Si no falta el inicio de la ventana, aumentar el límite no va a ayudar.
        if (!anyTruncatedStart) break
        // Si llegamos al tope, no podemos pedir más sin arriesgar performance.
        if (requestLimit >= MAX_REQUEST_LIMIT) break

        requestLimit = Math.min(MAX_REQUEST_LIMIT, requestLimit * 2)
      }

      if (!response) {
        throw new Error('No se pudo obtener historial de tendencia (respuesta vacía)')
      }

      console.debug('[useTrendData] history response', {
        deviceId,
        parameterIds,
        seriesKeys: Object.keys(response.series || {}),
        firstSeriesSample: response.series?.[parameterIds[0]]?.[0]
      })

      // Ancla de tiempo consistente: usamos el mayor entre "ahora" (cliente) y el último timestamp observado en el historial.
      // Esto evita saltos fuertes si hay drift de reloj entre backend/cliente, y también evita que el 1er update realtime recorte de golpe.
      let maxTsFromResponse = Number.NEGATIVE_INFINITY
      for (const pid of parameterIds) {
        const series = response.series?.[pid] || []
        for (const p of series) {
          const x = toSeconds(p.time)
          if (!Number.isFinite(x)) continue
          maxTsFromResponse = Math.max(maxTsFromResponse, x)
        }
      }

      const observedMax = Number.isFinite(maxTsFromResponse) ? maxTsFromResponse : nowSeconds
      const anchorMax = Math.max(nowSeconds, observedMax)
      const cutoff = anchorMax - windowSec

      const nextDatasets: TrendDataset[] = parameterIds.map((pid, idx) => {
        const series = response.series?.[pid] || []
        const mapped = filterValidPoints(
          series.map((point) => ({
            x: toSeconds(point.time),
            y: Number(point.value)
          }))
        ).filter((p) => p.x >= cutoff && p.x <= anchorMax)

        return {
          parameterId: pid,
          label: parameterKeys[idx] ?? pid,
          // Sin recorte por cantidad: solo por tiempo (uPlot es eficiente).
          data: mapped,
          borderColor: ['#06b6d4', '#10b981', '#f59e0b', '#f43f5e'][idx % 4],
          backgroundColor: 'transparent',
          tension: 0.4,
          pointRadius: 0,
          borderWidth: 2
        }
      })

      setDatasets(nextDatasets)
      setXDomain({ min: cutoff, max: anchorMax })
      lastRealtimeTsRef.current = anchorMax

      if (debugGate('trend.data.history.done')) {
        const stats = nextDatasets.map((ds) => {
          return {
            parameterId: ds.parameterId,
            count: ds.data.length,
            ...computeSpan(ds.data)
          }
        })

        debugLog('trend.data', 'loadHistory done', {
          xDomain: { min: cutoff, max: anchorMax },
          nowSeconds,
          observedMax,
          maxTsFromResponse: Number.isFinite(maxTsFromResponse) ? maxTsFromResponse : null,
          anchorMax,
          driftSec: nowSeconds - anchorMax,
          windowSec,
          stats
        })
      }
    } catch (err) {
      console.error('Failed to load trend history', err)
      setError('No se pudo cargar el historial')
    } finally {
      setIsLoading(false)
    }
  }, [
    deviceId,
    parameterIds,
    parameterKeys,
    windowMinutes,
    limitPerParam,
    timeWindowSeconds,
    debugGate
  ])

  useEffect(() => {
    if (!parameterIds.length) return
    void loadHistory()
  }, [loadHistory, parameterIds.length])

  useEffect(() => {
    if (!parameterIds.length) return

    subscribeTrend(deviceId, parameterIds)
    const off = onTrendUpdate((payload) => {
      if (payload.device_id !== deviceId) return
      const fallbackNow = Date.now() / 1000
      const parsed = safeSeconds(payload.ts, fallbackNow)
      const rawTs = parsed.seconds
      const prevTs = lastRealtimeTsRef.current
      const tsSeconds =
        prevTs != null && Number.isFinite(prevTs) && Number.isFinite(rawTs)
          ? Math.max(rawTs, prevTs)
          : rawTs
      const cutoff = tsSeconds - timeWindowSeconds

      if (debugGate('trend.data.realtime')) {
        const updatedCount = parameterIds.reduce(
          (acc, pid) => (payload.data[pid] != null ? acc + 1 : acc),
          0
        )
        debugLog('trend.data', 'trend_update', {
          tsSeconds,
          rawTs,
          tsParsedOk: parsed.ok,
          deltaFromPrev: prevTs != null ? tsSeconds - prevTs : null,
          cutoff,
          updatedCount,
          totalParams: parameterIds.length,
          hasTs: Boolean(payload.ts)
        })
      }

      const shouldLogApply = debugGate('trend.data.realtime.apply')
      const metrics: Array<Record<string, unknown>> = []

      setDatasets((prev) => {
        const next = prev.map((ds) => {
          const val = payload.data[ds.parameterId]

          const prevLen = ds.data.length
          const last = ds.data[prevLen - 1]

          let updated: Point[]
          let replacedLast = false
          if (val === undefined || val === null) {
            updated = ds.data
          } else {
            const nextPoint = { x: tsSeconds, y: Number(val) }
            if (last && Number.isFinite(last.x) && last.x === tsSeconds) {
              // Si llega múltiples veces el mismo timestamp, reemplazamos en vez de crecer.
              replacedLast = true
              updated = [...ds.data.slice(0, -1), nextPoint]
            } else {
              updated = [...ds.data, nextPoint]
            }
          }

          const windowed = updated.filter((p) => p.x >= cutoff)

          if (shouldLogApply) {
            const before = computeSpan(updated)
            const after = computeSpan(windowed)
            metrics.push({
              parameterId: ds.parameterId,
              prevLen,
              nextLenBefore: updated.length,
              nextLenWindowed: windowed.length,
              replacedLast,
              spanBeforeSec: before.spanSec,
              spanAfterSec: after.spanSec,
              minX: after.minX,
              maxX: after.maxX
            })
          }

          return { ...ds, data: windowed }
        })
        return next
      })

      if (shouldLogApply) {
        debugLog('trend.data', 'realtime apply', {
          tsSeconds,
          cutoff,
          series: metrics
        })
      }

      setXDomain({ min: tsSeconds - timeWindowSeconds, max: tsSeconds })
      lastRealtimeTsRef.current = tsSeconds
    })

    return () => {
      off()
      unsubscribeTrend(deviceId)
    }
  }, [deviceId, parameterIds, timeWindowSeconds, limitPerParam, debugGate])

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
