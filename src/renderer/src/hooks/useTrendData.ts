import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { fetchTrendHistory, onTrendUpdate, subscribeTrend, unsubscribeTrend } from 'services'
import { ParameterId } from 'types'
import { ParameterAlias, PARAMETER_ALIASES } from 'types/generated/devices'
import { Dataset } from 'components/TrendChart/TrendChart.types'
import { createKeyedThrottle, debugLog } from 'utils/debug'

type UseTrendDataOptions = {
  windowMinutes?: number
  startTime?: string
  endTime?: string
  limitPerParam?: number
  realtime?: boolean
}

type TrendDataset = Dataset & { parameterId: ParameterId }

const TREND_COLORS = ['#06b6d4', '#10b981', '#f59e0b', '#f43f5e'] as const

const HISTORY_RETRY = {
  INITIAL_DELAY_MS: 800,
  MAX_DELAY_MS: 7_000,
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

type Point = { x: number; y: number }

const filterValidPoints = (points: Point[]): Point[] =>
  points.filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y))

const perfNow = (): number =>
  typeof performance !== 'undefined' && typeof performance.now === 'function'
    ? performance.now()
    : Date.now()

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
  deviceId: string,
  parameterKeys: ParameterKey[],
  {
    windowMinutes = 5,
    startTime,
    endTime,
    limitPerParam = 2000,
    realtime = true
  }: UseTrendDataOptions = {}
) => {
  const [datasets, setDatasets] = useState<TrendDataset[]>([])
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
  const parameterIds = useMemo(() => resolveParameterIds(parameterKeys), [parameterKeys])
  const debugGate = useMemo(() => createKeyedThrottle(1500), [])
  const loadSeqRef = useRef(0)
  const lastRealtimeTsRef = useRef<number | null>(null)
  const prevDeviceIdRef = useRef<string | null>(null)
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

  // Inicializa datasets "vacíos" por parámetro para que el realtime pueda poblar incluso si falla el historial.
  useEffect(() => {
    if (!parameterIds.length) {
      clearRetryTimer()
      retryAttemptRef.current = 0
      setDatasets([])
      setXDomain(null)
      setError(null)
      setIsLoading(false)
      lastRealtimeTsRef.current = null
      prevDeviceIdRef.current = deviceId
      return
    }

    const deviceChanged = prevDeviceIdRef.current !== deviceId
    prevDeviceIdRef.current = deviceId

    setDatasets((prev) => {
      if (deviceChanged) {
        return parameterIds.map((pid, idx) => ({
          parameterId: pid,
          label: (parameterKeys[idx] ?? pid) as string,
          data: [],
          borderColor: TREND_COLORS[idx % TREND_COLORS.length],
          backgroundColor: 'transparent',
          tension: 0.4,
          pointRadius: 0,
          borderWidth: 2
        }))
      }

      const prevIds = prev.map((d) => d.parameterId)
      const sameIds =
        prevIds.length === parameterIds.length && prevIds.every((id, i) => id === parameterIds[i])

      if (sameIds) {
        // Mantiene data existente, pero refresca labels si cambian los keys/aliases.
        return prev.map((ds, idx) => ({
          ...ds,
          label: (parameterKeys[idx] ?? ds.parameterId) as string
        }))
      }

      const prevById = new Map(prev.map((dataset) => [dataset.parameterId, dataset] as const))

      return parameterIds.map((pid, idx) => ({
        ...(prevById.get(pid) ?? {}),
        parameterId: pid,
        label: (parameterKeys[idx] ?? pid) as string,
        data: prevById.get(pid)?.data ?? [],
        borderColor: prevById.get(pid)?.borderColor ?? TREND_COLORS[idx % TREND_COLORS.length],
        backgroundColor: prevById.get(pid)?.backgroundColor ?? 'transparent',
        tension: prevById.get(pid)?.tension ?? 0.4,
        pointRadius: prevById.get(pid)?.pointRadius ?? 0,
        borderWidth: prevById.get(pid)?.borderWidth ?? 2
      }))
    })

    // Si todavía no hay dominio, dejamos uno inicial para que el gráfico tenga un rango mientras llega el historial.
    const requestedDomain = absoluteRange
      ? { min: absoluteRange.startSec, max: absoluteRange.endSec }
      : (() => {
          const now = Date.now() / 1000
          return { min: now - timeWindowSeconds, max: now }
        })()

    setXDomain(requestedDomain)

    lastRealtimeTsRef.current = null
  }, [deviceId, parameterIds, parameterKeys, timeWindowSeconds, clearRetryTimer, absoluteRange])

  const loadHistory = useCallback(
    async ({ resetRetry = true }: { resetRetry?: boolean } = {}) => {
      if (!parameterIds.length) return

      const perfSessionId = `${deviceId}:${timeWindowSeconds}s:${parameterIds.length}p:${Date.now()}`
      const perfLoadStart = perfNow()
      if (resetRetry) {
        retryAttemptRef.current = 0
        clearRetryTimer()
        setError(null)
      }

      setIsLoading(true)
      const seq = ++loadSeqRef.current
      try {
        const nowSeconds = Date.now() / 1000
        const windowSec = timeWindowSeconds
        const rangeStartSec = absoluteRange?.startSec ?? nowSeconds - windowSec
        const rangeEndSec = absoluteRange?.endSec ?? nowSeconds

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
            startTime,
            endTime,
            timeWindowSeconds,
            limitPerParam,
            parameterIds,
            nowSeconds,
            rangeStartSec,
            rangeEndSec
          })
        }

        for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
          const reqStart = perfNow()
          response = await fetchTrendHistory({
            deviceId,
            parameterIds,
            windowMinutes,
            startTime,
            endTime,
            limitPerParam: requestLimit
          })
          const reqEnd = perfNow()

          if (seq !== loadSeqRef.current) return

          if (debugGate('trend.perf.history.request')) {
            debugLog('trend.perf', 'history request done', {
              id: perfSessionId,
              attempt,
              ms: Math.round(reqEnd - reqStart),
              deviceId,
              windowMinutes,
              params: parameterIds.length,
              requestLimit,
              server: response?.meta ?? null
            })
          }

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

          const anchorCandidate = absoluteRange
            ? rangeEndSec
            : Math.max(nowSeconds, Number.isFinite(observedMaxX) ? observedMaxX : nowSeconds)
          const cutoffCandidate = absoluteRange ? rangeStartSec : anchorCandidate - windowSec

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

          /**
           * Optimización: en rangos grandes (p.ej. 3H) el "doble y reintenta" puede tardar mucho
           * (5 requests: 2k→4k→8k→16k→32k...). Estimamos el límite necesario a partir del span
           * temporal cubierto por los puntos recibidos (rate aproximada) y saltamos más cerca
           * del valor final para evitar múltiples roundtrips.
           */
          let estimatedLimit = requestLimit
          for (const entry of perSeries) {
            if (entry.truncatedStart !== true) continue
            const minX = typeof entry.minX === 'number' ? entry.minX : null
            const maxX = typeof entry.maxX === 'number' ? entry.maxX : null
            const countValid = typeof entry.countValid === 'number' ? entry.countValid : null
            if (minX == null || maxX == null || countValid == null) continue
            const spanSec = maxX - minX
            if (!(spanSec > 0)) continue
            const needed = Math.ceil((countValid * windowSec) / spanSec)
            if (Number.isFinite(needed)) {
              estimatedLimit = Math.max(estimatedLimit, needed)
            }
          }

          const nextLimit = Math.min(
            MAX_REQUEST_LIMIT,
            // aseguramos progreso mínimo x2, pero si la estimación es mayor saltamos directo
            Math.max(requestLimit * 2, estimatedLimit)
          )

          if (debugGate('trend.perf.history.limit')) {
            debugLog('trend.perf', 'history requestLimit adjust', {
              attempt,
              requestLimit,
              estimatedLimit,
              nextLimit,
              windowSec
            })
          }

          requestLimit = nextLimit
        }

        if (!response) {
          throw new Error('Failed to get trend history (empty response)')
        }

        const mapStart = perfNow()
        if (debugGate('trend.data.history.response')) {
          debugLog('trend.data', 'history response', {
            deviceId,
            parameterIds,
            seriesKeys: Object.keys(response.series || {}),
            firstSeriesSample: response.series?.[parameterIds[0]]?.[0],
            meta: response.meta ?? null
          })
        }

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
        const anchorMax = absoluteRange ? rangeEndSec : Math.max(nowSeconds, observedMax)
        const cutoff = absoluteRange ? rangeStartSec : anchorMax - windowSec

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
        const mapEnd = perfNow()

        setDatasets(nextDatasets)
        setXDomain({ min: cutoff, max: anchorMax })
        lastRealtimeTsRef.current = absoluteRange ? null : anchorMax
        // Éxito: limpiar estado de retry
        retryAttemptRef.current = 0
        clearRetryTimer()
        setError(null)

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
            driftSec: absoluteRange ? null : nowSeconds - anchorMax,
            windowSec,
            stats
          })
        }

        if (debugGate('trend.perf.history.total')) {
          const totalPoints = nextDatasets.reduce((acc, ds) => acc + (ds.data?.length ?? 0), 0)
          debugLog('trend.perf', 'history mapped', {
            id: perfSessionId,
            ms: Math.round(mapEnd - mapStart),
            datasets: nextDatasets.length,
            totalPoints,
            pointsPerSeries: nextDatasets.map((ds) => ({
              parameterId: ds.parameterId,
              points: ds.data.length
            })),
            server: response.meta ?? null
          })
          debugLog('trend.perf', 'history load total', {
            id: perfSessionId,
            ms: Math.round(perfNow() - perfLoadStart)
          })
        }
      } catch (err) {
        console.error('Failed to load trend history', err)
        if (seq !== loadSeqRef.current) return

        setError('Failed to load history')

        // Reintentos automáticos estilo "reconexión" para evitar quedar en error hasta refrescar/navegar.
        const attempt = retryAttemptRef.current + 1
        retryAttemptRef.current = attempt

        if (debugGate('trend.perf.history.error')) {
          debugLog('trend.perf', 'history load failed', {
            id: perfSessionId,
            retryAttempt: attempt,
            msSinceStart: Math.round(perfNow() - perfLoadStart)
          })
        }

        // Evita múltiples timers paralelos.
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
    [
      deviceId,
      parameterIds,
      parameterKeys,
      windowMinutes,
      startTime,
      endTime,
      limitPerParam,
      timeWindowSeconds,
      absoluteRange,
      debugGate,
      clearRetryTimer
    ]
  )

  useEffect(() => {
    void loadHistory({ resetRetry: true })
  }, [loadHistory])

  useEffect(() => {
    if (!parameterIds.length || !realtime || absoluteRange) return

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
      // Cleanup defensivo: nunca debe bloquear navegación si falla socket/off.
      try {
        off()
      } catch (err) {
        console.error('[useTrendData] off() failed during cleanup', err)
      }
      try {
        unsubscribeTrend(deviceId)
      } catch (err) {
        console.error('[useTrendData] unsubscribeTrend failed during cleanup', err)
      }
    }
  }, [deviceId, parameterIds, timeWindowSeconds, debugGate, realtime, absoluteRange])

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

  const reload = useCallback(async (): Promise<void> => {
    await loadHistory({ resetRetry: true })
  }, [loadHistory])

  return { datasets, isLoading, error, reload, xDomain, getDataset }
}
