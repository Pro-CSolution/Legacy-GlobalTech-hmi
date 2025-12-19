import {
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useState,
  useCallback,
  useMemo
} from 'react'
import uPlot from 'uplot'
import 'uplot/dist/uPlot.min.css'
import { useTheme } from 'styled-components'
import { createKeyedThrottle, debugLog } from 'utils/debug'
import {
  Container,
  TitleBar,
  TitleText,
  TimeIndicator,
  ChartWrapper,
  LoadingContainer,
  ErrorContainer,
  ErrorTitle,
  ErrorMessage,
  NoDataContainer,
  LegendContainer,
  LegendItem,
  LegendDot,
  TooltipContainer,
  TooltipRow,
  TooltipHeader
} from './TrendChart.styles'
import type {
  TrendChartProps,
  TrendChartRef,
  Dataset,
  ChartDataPoint,
  DemoDataConfig
} from './TrendChart.types'

// === Constants ===
const DEFAULT_TIME_WINDOW = 5 // minutes
const DEFAULT_UPDATE_INTERVAL = 1000 // ms
const SECONDS_PER_MINUTE = 60

// === Demo Data Generator ===
const generateDemoDataPoint = (timeInSeconds: number, config: DemoDataConfig): ChartDataPoint => {
  const { baseValue = 100, noiseAmplitude = 20, minValue = 0, maxValue = 350 } = config

  // Generate smooth noise using sine waves
  const noise =
    Math.sin(timeInSeconds * 0.1) * noiseAmplitude * 0.5 +
    Math.sin(timeInSeconds * 0.05) * noiseAmplitude * 0.3 +
    (Math.random() - 0.5) * noiseAmplitude * 0.4

  let value = baseValue + noise

  // Clamp to min/max
  value = Math.max(minValue, Math.min(maxValue, value))

  return { x: timeInSeconds, y: value }
}

const generateInitialDemoData = (
  timeWindowMinutes: number,
  config: DemoDataConfig
): ChartDataPoint[] => {
  const { pointCount = timeWindowMinutes * 60 } = config
  const totalSeconds = timeWindowMinutes * SECONDS_PER_MINUTE
  const data: ChartDataPoint[] = []

  for (let i = 0; i <= pointCount; i++) {
    const timeInSeconds = (i / pointCount) * totalSeconds
    data.push(generateDemoDataPoint(timeInSeconds, config))
  }

  return data
}

// === Helpers ===
type UPlotData = {
  data: uPlot.AlignedData
  xValues: number[]
  seriesValues: (number | null)[][]
}

const buildUPlotData = (datasets: Dataset[]): UPlotData => {
  if (!datasets.length) return { data: [], xValues: [], seriesValues: [] }

  const timelineMap = new Map<number, Array<number | null>>()
  datasets.forEach((ds, dsIdx) => {
    ds.data.forEach((point) => {
      const values = timelineMap.get(point.x) ?? Array.from({ length: datasets.length }, () => null)
      values[dsIdx] = point.y
      timelineMap.set(point.x, values)
    })
  })

  const xValues = Array.from(timelineMap.keys()).sort((a, b) => a - b)
  const seriesValues = Array.from({ length: datasets.length }, () =>
    new Array(xValues.length).fill(null)
  )

  xValues.forEach((x, idx) => {
    const vals = timelineMap.get(x) || []
    vals.forEach((v, seriesIdx) => {
      seriesValues[seriesIdx][idx] = v
    })
  })

  const data = [xValues, ...seriesValues] as uPlot.AlignedData

  return {
    data,
    xValues,
    seriesValues
  }
}

const findNearestPoint = (
  seriesValues: (number | null)[][],
  datasets: Dataset[],
  xValues: number[],
  idx: number
): { datasetIndex: number; point: ChartDataPoint } | null => {
  if (!seriesValues.length || !xValues.length) return null
  for (let i = 0; i < seriesValues.length; i++) {
    const val = seriesValues[i][idx]
    if (val !== null && datasets[i]) {
      return { datasetIndex: i, point: { x: xValues[idx] ?? 0, y: val } }
    }
  }
  return null
}

// === Main Component ===
const TrendChart = forwardRef<TrendChartRef, TrendChartProps>(
  (
    {
      datasets: externalDatasets,
      demoData = false,
      demoDataConfig,
      timeWindow = DEFAULT_TIME_WINDOW,
      updateInterval = DEFAULT_UPDATE_INTERVAL,
      width = 400,
      height = 300,
      position,
      variant = 'modern',
      backgroundColor,
      borderColor,
      gridColor,
      textColor,
      lineColor,
      scales,
      showGrid = true,
      showLegend = false,
      showTooltips = true,
      responsive = true,
      maintainAspectRatio = false, // kept for API parity (ResizeObserver handles sizing)
      showTitle = true,
      title = 'Trend',
      className,
      style,
      onDataPointClick,
      onHover
    },
    ref
  ) => {
    const theme = useTheme()
    void maintainAspectRatio // API compat: handled by ResizeObserver
    const plotContainerRef = useRef<HTMLDivElement>(null)
    const plotInstanceRef = useRef<uPlot | null>(null)
    const resizeObserverRef = useRef<ResizeObserver | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [internalDatasets, setInternalDatasets] = useState<Dataset[]>([])
    const [overrideDatasets, setOverrideDatasets] = useState<Dataset[] | null>(null)
    const [tooltipState, setTooltipState] = useState<{
      idx: number
      left: number
      top: number
      xVal?: number
    } | null>(null)
    const startTimeRef = useRef<number>(Date.now())
    const demoIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
    const latestDataRef = useRef<UPlotData>({ data: [], xValues: [], seriesValues: [] })
    const latestDatasetsRef = useRef<Dataset[]>([])
    const clickHandlerRef = useRef<((event: MouseEvent) => void) | null>(null)
    const lastPointerRef = useRef<{
      clientX: number
      clientY: number
      relX: number
      relY: number
      at: number
    } | null>(null)

    const debugGate = useMemo(() => createKeyedThrottle(600), [])
    const cursorDebugGate = useMemo(() => createKeyedThrottle(250), [])

    useEffect(() => {
      const el = plotContainerRef.current
      if (!el) return

      const onPointerMove = (ev: PointerEvent) => {
        const rect = el.getBoundingClientRect()
        lastPointerRef.current = {
          clientX: ev.clientX,
          clientY: ev.clientY,
          relX: ev.clientX - rect.left,
          relY: ev.clientY - rect.top,
          at: typeof performance !== 'undefined' ? performance.now() : Date.now()
        }
      }

      el.addEventListener('pointermove', onPointerMove)
      return () => el.removeEventListener('pointermove', onPointerMove)
    }, [])

    // Memoize demo config with defaults
    const mergedDemoConfig = useMemo<DemoDataConfig>(
      () => ({
        pointCount: timeWindow * 60,
        minValue: 0,
        maxValue: 350,
        baseValue: 100,
        noiseAmplitude: 20,
        updateInterval: updateInterval,
        ...demoDataConfig
      }),
      [timeWindow, updateInterval, demoDataConfig]
    )

    // Theme colors with fallbacks
    const colors = useMemo(
      () => ({
        text: textColor || theme.colors.text.secondary,
        grid: gridColor || theme.colors.borders.primary,
        border: borderColor || theme.colors.borders.primary,
        background: backgroundColor || theme.colors.background.primary,
        line: lineColor || theme.colors.accent.primary,
        tooltip: theme.colors.background.tertiary
      }),
      [theme, textColor, gridColor, borderColor, backgroundColor, lineColor]
    )

    // Format time for X axis (converts seconds to "Xm" format when relative)
    const formatTimeLabel = useCallback((seconds: number): string => {
      const minutes = Math.floor(seconds / SECONDS_PER_MINUTE)
      return `${minutes}m`
    }, [])

    // Initialize demo data
    useEffect(() => {
      if (demoData) {
        const initialData = generateInitialDemoData(timeWindow, mergedDemoConfig)
        setInternalDatasets([
          {
            data: initialData,
            borderColor: colors.line,
            backgroundColor: 'transparent',
            borderWidth: 1.5,
            fill: false,
            tension: 0.2,
            pointRadius: 0,
            pointHoverRadius: 4,
            label: title
          }
        ])
        setIsLoading(false)
        startTimeRef.current = Date.now()
      }
    }, [demoData, timeWindow, mergedDemoConfig, colors.line, title])

    // Demo data update interval
    useEffect(() => {
      if (!demoData) return

      demoIntervalRef.current = setInterval(() => {
        setInternalDatasets((prev) => {
          if (prev.length === 0) return prev

          const updatedDatasets = prev.map((dataset) => {
            const newData = [...dataset.data]

            // Calculate elapsed time
            const elapsedMs = Date.now() - startTimeRef.current
            const elapsedSeconds = elapsedMs / 1000

            // Add new point
            const newPoint = generateDemoDataPoint(elapsedSeconds, mergedDemoConfig)
            newData.push(newPoint)

            // Remove old points outside time window
            const cutoffTime = elapsedSeconds - timeWindow * SECONDS_PER_MINUTE
            const filteredData = newData.filter((point) => point.x >= cutoffTime)

            // Normalize X values to start from 0
            const minX = filteredData.length > 0 ? filteredData[0].x : 0
            const normalizedData = filteredData.map((point) => ({
              x: point.x - minX,
              y: point.y
            }))

            return { ...dataset, data: normalizedData }
          })

          return updatedDatasets
        })
      }, updateInterval)

      return () => {
        if (demoIntervalRef.current) {
          clearInterval(demoIntervalRef.current)
        }
      }
    }, [demoData, updateInterval, timeWindow, mergedDemoConfig])

    // Handle external datasets
    useEffect(() => {
      if (!demoData && externalDatasets) {
        if (externalDatasets.length === 0) {
          // En un HMI esto no es un "error" del gráfico: simplemente no hay datos aún.
          setError(null)
          setIsLoading(false)
          return
        }

        const hasValidData = externalDatasets.some((ds) => ds.data && ds.data.length > 0)
        if (!hasValidData) {
          // Dataset existe pero aún no llegaron puntos (historial/realtime).
          setError(null)
          setIsLoading(false)
          return
        }

        setInternalDatasets(externalDatasets)
        setError(null)
        setIsLoading(false)
      }
    }, [demoData, externalDatasets])

    // Get active datasets (internal/demo, or override, else external)
    const activeDatasets = useMemo(() => {
      return overrideDatasets || (demoData ? internalDatasets : externalDatasets || [])
    }, [overrideDatasets, demoData, internalDatasets, externalDatasets])

    const hasExternalData = useMemo(
      () => !demoData && activeDatasets.length > 0,
      [demoData, activeDatasets.length]
    )

    // Resuelve el máximo de X para formatear etiquetas (si no se define, se deja auto)
    const resolvedXMax = useMemo(() => {
      if (typeof scales?.x?.max === 'number') return scales.x.max
      if (!hasExternalData) return timeWindow * SECONDS_PER_MINUTE
      return undefined
    }, [scales?.x?.max, hasExternalData, timeWindow])

    // uPlot data
    const uplotData = useMemo(() => buildUPlotData(activeDatasets), [activeDatasets])

    useEffect(() => {
      latestDataRef.current = uplotData
      latestDatasetsRef.current = activeDatasets
    }, [uplotData, activeDatasets])

    // uPlot series styles
    const uPlotSeries = useMemo(
      () =>
        [
          { label: 'Time' },
          ...activeDatasets.map((dataset, index) => ({
            label: dataset.label || `Dataset ${index + 1}`,
            stroke:
              dataset.borderColor || (index === 0 ? colors.line : theme.colors.accent.secondary),
            width: dataset.borderWidth || 1.5,
            fill: dataset.fill ? dataset.backgroundColor || 'transparent' : undefined,
            points: { show: (dataset.pointRadius ?? 0) > 0 },
            spanGaps: true,
            paths:
              dataset.stepped && uPlot.paths && uPlot.paths.stepped
                ? uPlot.paths.stepped({ align: 1 })
                : undefined
          }))
        ] satisfies uPlot.Series[],
      [activeDatasets, colors.line, theme.colors.accent.secondary]
    )

    const applyScales = useCallback(
      (plot: uPlot) => {
        const xMin = scales?.x?.min ?? undefined
        const xMax = resolvedXMax ?? undefined
        const yMin = scales?.y?.min ?? undefined
        const yMax = scales?.y?.max ?? undefined

        if (xMin !== undefined || xMax !== undefined) {
          const nextMin = xMin ?? plot.scales.x.min ?? null
          const nextMax = xMax ?? plot.scales.x.max ?? null
          if (nextMin !== null && nextMax !== null) {
            plot.setScale('x', { min: nextMin, max: nextMax })
          }
        }

        if (yMin !== undefined || yMax !== undefined) {
          const nextMin = yMin ?? plot.scales.y.min ?? null
          const nextMax = yMax ?? plot.scales.y.max ?? null
          if (nextMin !== null && nextMax !== null) {
            plot.setScale('y', { min: nextMin, max: nextMax })
          }
        }
      },
      [scales?.x?.min, scales?.y?.min, scales?.y?.max, resolvedXMax]
    )

    const xTickFormatter = useCallback(
      (val: number) => {
        const customCallback = scales?.x?.ticks?.callback as
          | ((value: number) => string | number)
          | undefined

        if (customCallback) {
          const maybe = customCallback(val)
          return typeof maybe === 'string' || typeof maybe === 'number'
            ? maybe
            : formatTimeLabel(val)
        }

        if (typeof resolvedXMax === 'number') {
          const remaining = Math.max(resolvedXMax - val, 0)
          const minutes = Math.floor(remaining / SECONDS_PER_MINUTE)
          return `${minutes}m`
        }

        return formatTimeLabel(val)
      },
      [scales?.x?.ticks, resolvedXMax, formatTimeLabel]
    )

    const yTickFormatter = useCallback(
      (val: number) => {
        const ticks = scales?.y?.ticks as { callback?: (value: number) => string | number }
        const custom = ticks?.callback
        if (custom) {
          const maybe = custom(val)
          if (typeof maybe === 'string' || typeof maybe === 'number') return maybe
        }
        return Number.isFinite(val) ? val.toFixed(0) : ''
      },
      [scales?.y?.ticks]
    )

    const destroyPlot = useCallback(() => {
      if (resizeObserverRef.current && plotContainerRef.current) {
        resizeObserverRef.current.disconnect()
        resizeObserverRef.current = null
      }
      if (plotContainerRef.current && clickHandlerRef.current) {
        plotContainerRef.current.removeEventListener('click', clickHandlerRef.current)
        clickHandlerRef.current = null
      }
      if (plotInstanceRef.current) {
        plotInstanceRef.current.destroy()
        plotInstanceRef.current = null
      }
    }, [])

    const handleSetCursor = useCallback(
      (plot: uPlot) => {
        const idx = plot.cursor.idx
        if (idx == null || idx < 0) {
          setTooltipState(null)
          if (onHover) onHover(undefined, [])
          return
        }

        const left = plot.cursor.left ?? 0
        const top = plot.cursor.top ?? 0
        const xValAtCursor = plot.posToVal(left, 'x')
        setTooltipState({ idx, left, top, xVal: xValAtCursor })

        if (cursorDebugGate('trend.tooltip.setCursor')) {
          const rootEl = plot.root as unknown as HTMLElement | null
          const rootRect = rootEl?.getBoundingClientRect()
          const rootOffsetW = rootEl?.offsetWidth
          const rootOffsetH = rootEl?.offsetHeight

          const contEl = plotContainerRef.current
          const contRect = contEl?.getBoundingClientRect()
          const contOffsetW = contEl?.offsetWidth
          const contOffsetH = contEl?.offsetHeight

          const ratio = {
            containerX:
              contRect && contOffsetW && contOffsetW > 0 ? contRect.width / contOffsetW : undefined,
            containerY:
              contRect && contOffsetH && contOffsetH > 0
                ? contRect.height / contOffsetH
                : undefined,
            rootX:
              rootRect && rootOffsetW && rootOffsetW > 0 ? rootRect.width / rootOffsetW : undefined,
            rootY:
              rootRect && rootOffsetH && rootOffsetH > 0 ? rootRect.height / rootOffsetH : undefined
          }

          const pointer = lastPointerRef.current
          const xVal = latestDataRef.current.xValues[idx]
          const valToPosX =
            typeof xVal === 'number' && Number.isFinite(xVal) ? plot.valToPos(xVal, 'x') : undefined

          debugLog('trend.tooltip', 'setCursor', {
            idx,
            cursor: { left, top },
            pointer,
            ratio,
            xVal,
            valToPosX,
            dpr: typeof window !== 'undefined' ? window.devicePixelRatio : undefined
          })
        }

        if (onHover) {
          const hit = findNearestPoint(
            latestDataRef.current.seriesValues,
            latestDatasetsRef.current,
            latestDataRef.current.xValues,
            idx
          )
          if (hit) {
            onHover(undefined, [{ datasetIndex: hit.datasetIndex, index: idx }])
          }
        }
      },
      [onHover, cursorDebugGate]
    )

    const createPlot = useCallback(() => {
      const container = plotContainerRef.current
      if (!container || !uplotData.data.length) return

      destroyPlot()

      const { width: boxWidth, height: boxHeight } = container.getBoundingClientRect()
      const baseWidth = boxWidth || (typeof width === 'number' ? width : 400)
      const baseHeight = boxHeight || (typeof height === 'number' ? height : 300)

      if (debugGate('trend.chart.createPlot')) {
        const rect = container.getBoundingClientRect()
        const offsetW = container.offsetWidth
        const offsetH = container.offsetHeight
        debugLog('trend.chart', 'createPlot', {
          container: {
            rect: { w: rect.width, h: rect.height, left: rect.left, top: rect.top },
            offset: { w: offsetW, h: offsetH }
          },
          base: { w: baseWidth, h: baseHeight },
          ratio: {
            x: offsetW > 0 ? rect.width / offsetW : undefined,
            y: offsetH > 0 ? rect.height / offsetH : undefined
          },
          dpr: typeof window !== 'undefined' ? window.devicePixelRatio : undefined
        })
      }

      const plot = new uPlot(
        {
          width: baseWidth,
          height: baseHeight,
          series: uPlotSeries,
          axes: [
            {
              show: scales?.x?.display !== false,
              stroke: colors.text,
              grid: {
                show: showGrid && scales?.x?.grid !== false,
                stroke: colors.grid,
                width: 1
              },
              ticks: {
                show: true,
                stroke: colors.grid,
                width: 1
              },
              values: (_, vals) => vals.map((v) => xTickFormatter(v as number)),
              space: 50
            },
            {
              show: scales?.y?.display !== false,
              stroke: colors.text,
              grid: {
                show: showGrid && scales?.y?.grid !== false,
                stroke: colors.grid,
                width: 1
              },
              values: (_, vals) => vals.map((v) => yTickFormatter(v as number)),
              space: 40
            }
          ],
          scales: {
            x: { time: false },
            y: { auto: true }
          },
          cursor: {
            points: { show: false },
            /**
             * Corrige el desfase del cursor/tooltip cuando el árbol está escalado (p.ej. transform: scale o zoom).
             * uPlot trabaja en "layout px" del plot area (`self.over.offsetWidth`), pero el evento llega en "visual px"
             * (`getBoundingClientRect`). Ajustamos left/top dividiendo por la relación rect/offset.
             */
            move: (self, mouseLeft, mouseTop) => {
              const over = self.over
              const rect = over.getBoundingClientRect()
              const offsetW = over.offsetWidth || rect.width || 1
              const offsetH = over.offsetHeight || rect.height || 1

              const scaleX = rect.width / offsetW
              const scaleY = rect.height / offsetH

              const ev = self.cursor.event
              const rawLeft = ev ? ev.clientX - rect.left : mouseLeft
              const rawTop = ev ? ev.clientY - rect.top : mouseTop

              const left = scaleX ? rawLeft / scaleX : rawLeft
              const top = scaleY ? rawTop / scaleY : rawTop

              if (cursorDebugGate('trend.tooltip.move')) {
                debugLog('trend.tooltip', 'cursor.move adjust', {
                  mouse: { left: mouseLeft, top: mouseTop },
                  raw: { left: rawLeft, top: rawTop },
                  rect: { w: rect.width, h: rect.height, left: rect.left, top: rect.top },
                  offset: { w: offsetW, h: offsetH },
                  scale: { x: scaleX, y: scaleY },
                  adjusted: { left, top }
                })
              }

              return [left, top]
            },
            drag: { x: false, y: false }
          },
          legend: { show: false },
          hooks: {
            setCursor: [handleSetCursor]
          }
        },
        uplotData.data,
        container
      )

      plotInstanceRef.current = plot
      applyScales(plot)

      if (responsive) {
        resizeObserverRef.current = new ResizeObserver((entries) => {
          const entry = entries[0]
          if (!entry || !plotInstanceRef.current) return
          const nextWidth = entry.contentRect.width
          const nextHeight = entry.contentRect.height

          if (debugGate('trend.chart.resize')) {
            debugLog('trend.chart', 'ResizeObserver setSize', {
              contentRect: { w: nextWidth, h: nextHeight }
            })
          }
          plotInstanceRef.current.setSize({ width: nextWidth, height: nextHeight })
        })
        resizeObserverRef.current.observe(container)
      }

      const clickHandler = () => {
        const idx = plot.cursor.idx
        if (idx == null || idx < 0 || !onDataPointClick) return
        const hit = findNearestPoint(
          latestDataRef.current.seriesValues,
          latestDatasetsRef.current,
          latestDataRef.current.xValues,
          idx
        )
        if (hit) onDataPointClick(hit.point, hit.datasetIndex)
      }

      clickHandlerRef.current = clickHandler
      container.addEventListener('click', clickHandler)
    }, [
      applyScales,
      colors.grid,
      colors.text,
      debugGate,
      cursorDebugGate,
      handleSetCursor,
      destroyPlot,
      height,
      onDataPointClick,
      responsive,
      scales?.x?.display,
      scales?.x?.grid,
      scales?.y?.display,
      scales?.y?.grid,
      showGrid,
      xTickFormatter,
      yTickFormatter,
      uPlotSeries,
      uplotData.data,
      width
    ])

    // Create / update plot
    useEffect(() => {
      if (!plotContainerRef.current) return

      if (!uplotData.data.length) {
        destroyPlot()
        return
      }

      const currentSeriesCount = plotInstanceRef.current?.series.length || 0
      const expectedSeriesCount = uPlotSeries.length

      const needsRecreate = currentSeriesCount !== expectedSeriesCount

      if (needsRecreate || !plotInstanceRef.current) {
        createPlot()
      } else {
        plotInstanceRef.current.setData(uplotData.data)
        applyScales(plotInstanceRef.current)
      }

      return () => {
        // cleanup handled separately on unmount
      }
    }, [uPlotSeries, uPlotSeries.length, uplotData, createPlot, applyScales, destroyPlot])

    // Cleanup on unmount
    useEffect(
      () => () => {
        destroyPlot()
        if (plotContainerRef.current && clickHandlerRef.current) {
          plotContainerRef.current.removeEventListener('click', clickHandlerRef.current)
        }
      },
      [destroyPlot]
    )

    // Expose ref methods
    useImperativeHandle(ref, () => ({
      getChart: () => plotInstanceRef.current,
      updateData: (newDatasets: Dataset[]) => {
        setOverrideDatasets(newDatasets)
      },
      exportImage: (opts?: { type?: 'image/png' | 'image/jpeg'; quality?: number }) => {
        const plot = plotInstanceRef.current
        if (!plot) return null

        const type = opts?.type ?? 'image/png'
        const quality = opts?.quality ?? 0.92

        const canvases = Array.from(
          plot.root?.querySelectorAll('canvas') ?? []
        ) as HTMLCanvasElement[]
        if (!canvases.length) {
          console.debug('[TrendChart.exportImage] no canvases found', { type })
          return null
        }

        const canvas = canvases
          .filter((c) => (c.width ?? 0) > 0 && (c.height ?? 0) > 0)
          .sort((a, b) => b.width * b.height - a.width * a.height)[0]

        if (!canvas) {
          console.debug('[TrendChart.exportImage] canvases found but no sized canvas', {
            type,
            canvases: canvases.map((c) => ({ w: c.width, h: c.height }))
          })
          return null
        }

        try {
          const dataUrl =
            type === 'image/jpeg' ? canvas.toDataURL(type, quality) : canvas.toDataURL(type)
          if (!dataUrl || !dataUrl.startsWith('data:image/')) {
            console.debug('[TrendChart.exportImage] empty/invalid dataUrl', {
              type,
              size: { w: canvas.width, h: canvas.height }
            })
          }
          return dataUrl
        } catch {
          console.debug('[TrendChart.exportImage] toDataURL failed', {
            type,
            size: { w: canvas.width, h: canvas.height }
          })
          return null
        }
      },
      reset: () => {
        setOverrideDatasets(null)
        if (plotInstanceRef.current && uplotData.data.length) {
          plotInstanceRef.current.setData(uplotData.data)
          applyScales(plotInstanceRef.current)
        }
        if (demoData) {
          startTimeRef.current = Date.now()
          const initialData = generateInitialDemoData(timeWindow, mergedDemoConfig)
          setInternalDatasets([
            {
              data: initialData,
              borderColor: colors.line,
              backgroundColor: 'transparent',
              borderWidth: 1.5,
              fill: false,
              tension: 0.2,
              pointRadius: 0,
              pointHoverRadius: 4,
              label: title
            }
          ])
        }
      },
      addDataPoint: (datasetIndex: number, point: ChartDataPoint) => {
        setInternalDatasets((prev) => {
          const updated = [...prev]
          if (updated[datasetIndex]) {
            updated[datasetIndex] = {
              ...updated[datasetIndex],
              data: [...updated[datasetIndex].data, point]
            }
          }
          return updated
        })
      },
      clearData: () => {
        setInternalDatasets((prev) =>
          prev.map((dataset) => ({
            ...dataset,
            data: []
          }))
        )
      }
    }))

    // Render loading state
    if (isLoading) {
      return (
        <Container
          variant={variant}
          width={width}
          height={height}
          position={position}
          backgroundColor={backgroundColor}
          borderColor={borderColor}
          className={className}
          style={style}
        >
          {showTitle && (
            <TitleBar variant={variant}>
              <TitleText variant={variant}>{title}</TitleText>
            </TitleBar>
          )}
          <LoadingContainer>Loading chart...</LoadingContainer>
        </Container>
      )
    }

    // Render error state
    if (error) {
      return (
        <Container
          variant={variant}
          width={width}
          height={height}
          position={position}
          backgroundColor={backgroundColor}
          borderColor={borderColor}
          className={className}
          style={style}
        >
          {showTitle && (
            <TitleBar variant={variant}>
              <TitleText variant={variant}>{title}</TitleText>
            </TitleBar>
          )}
          <ErrorContainer>
            <ErrorTitle>Chart Error</ErrorTitle>
            <ErrorMessage>{error}</ErrorMessage>
          </ErrorContainer>
        </Container>
      )
    }

    const hasPoints = uplotData.xValues.length > 0

    // Render no data state
    if (activeDatasets.length === 0 || !hasPoints) {
      return (
        <Container
          variant={variant}
          width={width}
          height={height}
          position={position}
          backgroundColor={backgroundColor}
          borderColor={borderColor}
          className={className}
          style={style}
        >
          {showTitle && (
            <TitleBar variant={variant}>
              <TitleText variant={variant}>{title}</TitleText>
            </TitleBar>
          )}
          <NoDataContainer>Sin datos disponibles</NoDataContainer>
        </Container>
      )
    }

    return (
      <Container
        variant={variant}
        width={width}
        height={height}
        position={position}
        backgroundColor={backgroundColor}
        borderColor={borderColor}
        className={className}
        style={style}
      >
        {showTitle && (
          <TitleBar variant={variant}>
            <TitleText variant={variant}>{title}</TitleText>
            <TimeIndicator>{timeWindow}m window</TimeIndicator>
          </TitleBar>
        )}
        <ChartWrapper>
          <div ref={plotContainerRef} style={{ width: '100%', height: '100%' }} />

          {showLegend && (
            <LegendContainer>
              {activeDatasets.map((ds, idx) => (
                <LegendItem key={idx}>
                  <LegendDot
                    style={{
                      background:
                        ds.borderColor || (idx === 0 ? colors.line : theme.colors.accent.secondary)
                    }}
                  />
                  <span>{ds.label || `Dataset ${idx + 1}`}</span>
                </LegendItem>
              ))}
            </LegendContainer>
          )}

          {showTooltips && tooltipState && uplotData.data.length > 0 && (
            <TooltipContainer style={{ left: tooltipState.left + 12, top: tooltipState.top + 12 }}>
              <TooltipHeader>
                {(() => {
                  const tsRaw =
                    typeof tooltipState.xVal === 'number' && Number.isFinite(tooltipState.xVal)
                      ? tooltipState.xVal
                      : uplotData.xValues[tooltipState.idx]

                  const isEpochTime = tsRaw >= 1e8

                  // For real trend data (epoch seconds), always show local clock time.
                  if (isEpochTime) {
                    const date = new Date(tsRaw * 1000)
                    return date.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })
                  }

                  // For relative/demo charts, show remaining if a max is defined, else show elapsed.
                  if (typeof resolvedXMax === 'number') {
                    const remaining = Math.max(resolvedXMax - tsRaw, 0)
                    const minutes = Math.floor(remaining / SECONDS_PER_MINUTE)
                    const seconds = Math.floor(remaining % SECONDS_PER_MINUTE)
                    return `${minutes}m ${seconds}s`
                  }

                  const minutes = Math.floor(tsRaw / SECONDS_PER_MINUTE)
                  const seconds = Math.floor(tsRaw % SECONDS_PER_MINUTE)
                  return `${minutes}m ${seconds}s`
                })()}
              </TooltipHeader>
              {activeDatasets.map((ds, idx) => {
                const val = uplotData.seriesValues[idx]?.[tooltipState.idx]
                if (val === null || val === undefined) return null
                const unit = ds.unit
                return (
                  <TooltipRow key={`${ds.label ?? idx}-${tooltipState.idx}`}>
                    <LegendDot
                      style={{
                        background:
                          ds.borderColor ||
                          (idx === 0 ? colors.line : theme.colors.accent.secondary)
                      }}
                    />
                    <span style={{ color: theme.colors.text.secondary }}>
                      {ds.label || `Dataset ${idx + 1}`}
                    </span>
                    <div
                      style={{ fontFamily: 'monospace', fontWeight: 'bold', marginLeft: '10px' }}
                    >
                      {val.toFixed(1)}{' '}
                      {unit && (
                        <span style={{ fontSize: '10px', color: theme.colors.text.secondary }}>
                          {unit}
                        </span>
                      )}
                    </div>
                  </TooltipRow>
                )
              })}
            </TooltipContainer>
          )}
        </ChartWrapper>
      </Container>
    )
  }
)

TrendChart.displayName = 'TrendChart'

export default TrendChart
