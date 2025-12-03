import {
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useState,
  useCallback,
  useMemo
} from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import type { ChartOptions, ChartData } from 'chart.js'
import { Line } from 'react-chartjs-2'
import { useTheme } from 'styled-components'
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
  NoDataContainer
} from './TrendChart.styles'
import type {
  TrendChartProps,
  TrendChartRef,
  Dataset,
  ChartDataPoint,
  DemoDataConfig
} from './TrendChart.types'

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

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
      maintainAspectRatio = false,
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
    const chartRef = useRef<ChartJS<'line'>>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [internalDatasets, setInternalDatasets] = useState<Dataset[]>([])
    const startTimeRef = useRef<number>(Date.now())
    const demoIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

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

    // Format time for X axis (converts seconds to "Xm" format)
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
          setError('No datasets provided')
          setIsLoading(false)
          return
        }

        const hasValidData = externalDatasets.some((ds) => ds.data && ds.data.length > 0)
        if (!hasValidData) {
          setError('No valid data in datasets')
          setIsLoading(false)
          return
        }

        setInternalDatasets(externalDatasets)
        setError(null)
        setIsLoading(false)
      }
    }, [demoData, externalDatasets])

    // Get active datasets (internal for demo, external otherwise)
    const activeDatasets = demoData ? internalDatasets : externalDatasets || []

    // Chart data configuration
    const chartData: ChartData<'line'> = useMemo(
      () => ({
        datasets: activeDatasets.map((dataset, index) => ({
          data: dataset.data,
          borderColor:
            dataset.borderColor || (index === 0 ? colors.line : theme.colors.accent.secondary),
          backgroundColor: dataset.backgroundColor || 'transparent',
          borderWidth: dataset.borderWidth || 1.5,
          fill: dataset.fill || false,
          tension: dataset.tension || 0.2,
          pointRadius: dataset.pointRadius || 0,
          pointHoverRadius: dataset.pointHoverRadius || 4,
          label: dataset.label || `Dataset ${index + 1}`
        }))
      }),
      [activeDatasets, colors.line, theme.colors.accent.secondary]
    )

    // Chart options configuration
    const chartOptions: ChartOptions<'line'> = useMemo(
      () => ({
        responsive,
        maintainAspectRatio,
        animation: {
          duration: 0 // Disable animations for real-time performance
        },
        interaction: {
          intersect: false,
          mode: 'index' as const
        },
        plugins: {
          legend: {
            display: showLegend,
            labels: {
              color: colors.text,
              font: {
                family: theme.typography.fontFamily,
                size: 11
              }
            }
          },
          tooltip: {
            enabled: showTooltips,
            backgroundColor: colors.tooltip,
            titleColor: theme.colors.text.primary,
            bodyColor: theme.colors.text.primary,
            borderColor: colors.border,
            borderWidth: 1,
            callbacks: {
              title: (items) => {
                if (items.length > 0) {
                  const seconds = items[0].parsed.x || 0
                  const minutes = Math.floor(seconds / SECONDS_PER_MINUTE)
                  const secs = Math.floor(seconds % SECONDS_PER_MINUTE)
                  return `${minutes}m ${secs}s`
                }
                return ''
              },
              label: (item) => {
                return `${item.dataset.label}: ${item.parsed.y?.toFixed(1)}`
              }
            }
          }
        },
        scales: {
          x: {
            type: 'linear' as const,
            display: scales?.x?.display !== false,
            min: scales?.x?.min ?? 0,
            max: scales?.x?.max ?? timeWindow * SECONDS_PER_MINUTE,
            grid: {
              display: showGrid && scales?.x?.grid !== false,
              color: colors.grid
            },
            ticks: {
              color: colors.text,
              font: {
                family: theme.typography.fontFamily,
                size: 15
              },
              stepSize: SECONDS_PER_MINUTE, // One tick per minute
              maxTicksLimit: timeWindow + 1,
              callback: function (value) {
                return formatTimeLabel(value as number)
              },
              ...(scales?.x?.ticks as object)
            },
            title: scales?.x?.title
              ? {
                  display: scales.x.title.display,
                  text: scales.x.title.text,
                  color: colors.text,
                  font: {
                    family: theme.typography.fontFamily,
                    size: 11
                  }
                }
              : undefined
          },
          y: {
            display: scales?.y?.display !== false,
            min: scales?.y?.min,
            max: scales?.y?.max,
            grid: {
              display: showGrid && scales?.y?.grid !== false,
              color: colors.grid
            },
            ticks: {
              color: colors.text,
              font: {
                family: theme.typography.fontFamily,
                size: 15
              }
            },
            title: scales?.y?.title
              ? {
                  display: scales.y.title.display,
                  text: scales.y.title.text,
                  color: colors.text,
                  font: {
                    family: theme.typography.fontFamily,
                    size: 11
                  }
                }
              : undefined
          }
        },
        onClick: (_, elements) => {
          if (onDataPointClick && elements.length > 0) {
            const element = elements[0]
            const datasetIndex = element.datasetIndex
            const dataIndex = element.index
            const point = activeDatasets[datasetIndex]?.data[dataIndex]
            if (point) {
              onDataPointClick(point, datasetIndex)
            }
          }
        },
        onHover: onHover as ChartOptions<'line'>['onHover']
      }),
      [
        responsive,
        maintainAspectRatio,
        showLegend,
        showTooltips,
        showGrid,
        colors,
        theme,
        scales,
        timeWindow,
        formatTimeLabel,
        activeDatasets,
        onDataPointClick,
        onHover
      ]
    )

    // Expose ref methods
    useImperativeHandle(ref, () => ({
      getChart: () => chartRef.current,
      updateData: (newDatasets: Dataset[]) => {
        if (chartRef.current) {
          chartRef.current.data.datasets = newDatasets.map((dataset, index) => ({
            data: dataset.data,
            borderColor:
              dataset.borderColor || (index === 0 ? colors.line : theme.colors.accent.secondary),
            backgroundColor: dataset.backgroundColor || 'transparent',
            borderWidth: dataset.borderWidth || 1.5,
            fill: dataset.fill || false,
            tension: dataset.tension || 0.2,
            pointRadius: dataset.pointRadius || 0,
            pointHoverRadius: dataset.pointHoverRadius || 4,
            label: dataset.label || `Dataset ${index + 1}`
          }))
          chartRef.current.update('none')
        }
      },
      reset: () => {
        if (chartRef.current) {
          chartRef.current.reset()
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

    // Render no data state
    if (activeDatasets.length === 0) {
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
          <NoDataContainer>No data available</NoDataContainer>
        </Container>
      )
    }

    // Render chart
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
          <Line ref={chartRef} data={chartData} options={chartOptions} />
        </ChartWrapper>
      </Container>
    )
  }
)

TrendChart.displayName = 'TrendChart'

export default TrendChart
