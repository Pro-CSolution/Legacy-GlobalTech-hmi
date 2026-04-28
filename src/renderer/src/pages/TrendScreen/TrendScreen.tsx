import { Profiler, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Activity,
  CalendarRange,
  ChartLine,
  ChevronRight,
  Filter,
  Mail,
  SlidersHorizontal,
  X,
  ZoomOut
} from 'lucide-react'
import { TrendChart, TrendChartRef, Dataset } from 'components/TrendChart'
import { ScreenLayout } from 'layouts'
import { sendTrendReportEmail } from 'services'
import type {
  ClientMotorInfo,
  DualClientMotorInfo,
  TrendReportSeries,
  TrendReportWorkbookSheet,
  TrendReportWorkbookSeries
} from 'services'
import { runReportSend } from 'hooks/useReportSendStatus'
import { useMotorControlModePreference } from 'hooks/useMotorControlModePreference'
import { usePreferredSingleMotorScope } from 'hooks/usePreferredSingleMotorScope'
import {
  useAccessMode,
  useIsViewportBelow,
  useTemperatureUnitPreference,
  useTrendRecording,
  useWagoDisplayNameOverrides
} from 'hooks'
import { useTheme } from 'styled-components'
import { getErrorMessage, isAxiosErrorLike } from 'types/errors'
import type { ParameterId } from 'types'
import { debugLog, isDebugEnabled } from 'utils/debug'
import { loadClientMotorInfo, loadDualClientMotorInfo } from 'utils/clientMotorInfoStorage'
import { CurrentValuesPanel } from './components/CurrentValuesPanel'
import { ManualPanel } from './components/ManualPanel'
import { ReportPanel } from './components/ReportPanel'
import { ScalePanel } from './components/ScalePanel'
import { TrendRangeNavigator } from './components/TrendRangeNavigator'
import { TrendToolbar } from './components/TrendToolbar'
import { VariablesPanel } from './components/VariablesPanel'
import {
  TIME_RANGES,
  applyVariableDisplayValue,
  getTrendVariableLabel,
  getVariableDisplayUnit,
  getWagoIoTrendVariableDisplayValue,
  getWagoIoTrendVariableDisplayUnit,
  getWagoIoTrendVariableMeta,
  nowLocalInput,
  type TrendVariableId,
  type WagoIoTrendVariableId
} from './constants'
import { useTrendScreenState } from './hooks/useTrendScreenState'
import * as S from './TrendScreen.styles'
import type { CurrentValueItem } from './types'

type ImageMimeType = 'image/png' | 'image/jpeg'

const perfNow = (): number =>
  typeof performance !== 'undefined' && typeof performance.now === 'function'
    ? performance.now()
    : Date.now()

const stripDataUrlPrefix = (dataUrl: string): string => {
  const idx = dataUrl.indexOf(',')
  return idx >= 0 ? dataUrl.slice(idx + 1) : dataUrl
}

const sanitizeFilenamePart = (value: string): string =>
  value
    .replace(/[\\/:*?"<>|]+/g, '-')
    .replace(/\s+/g, ' ')
    .trim()

const formatIsoForFilename = (iso: string): string =>
  iso.replace(/\.\d{3}Z$/, 'Z').replace(/:/g, '-')

const formatEpochSecondsForSpan = (seconds: number, spanSec: number): string => {
  const date = new Date(seconds * 1000)

  if (spanSec <= 24 * 60 * 60) {
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (spanSec <= 7 * 24 * 60 * 60) {
    return date.toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return date.toLocaleDateString([], {
    month: 'short',
    day: 'numeric'
  })
}

const computePaddedYRange = (
  dataset: Dataset,
  xMin: number,
  xMax: number
): { yMin?: number; yMax?: number } => {
  let min = Number.POSITIVE_INFINITY
  let max = Number.NEGATIVE_INFINITY

  dataset.data.forEach((p) => {
    if (p.x < xMin || p.x > xMax) return
    if (!Number.isFinite(p.y)) return
    min = Math.min(min, p.y)
    max = Math.max(max, p.y)
  })

  if (!Number.isFinite(min) || !Number.isFinite(max)) return {}

  const range = max - min
  const pad = range > 0 ? range * 0.05 : Math.max(Math.abs(max) * 0.05, 1)
  return { yMin: min - pad, yMax: max + pad }
}

type HiddenExportRequest = {
  datasets: Dataset[]
  width: number
  height: number
  xMin: number
  xMax: number
  yMin?: number
  yMax?: number
  type: ImageMimeType
  quality?: number
}

type SendReportResult = {
  ok: boolean
  message: string
}

type TrendPanelKey = 'variables' | 'manual' | 'scale' | 'currentValues' | 'report'

type ReportReadyDataset = Dataset & {
  parameterId?: string
  seriesId?: number
  isManual?: boolean
  unit?: string | null
  label?: string
}

type RecordedSensorDataset = Dataset & {
  parameterId: TrendVariableId
  scope: 1 | 2
}

const getFastApiErrorDetail = (error: unknown): string | null => {
  if (!isAxiosErrorLike(error)) return null

  const data = error.response?.data
  if (!data) return null

  if (typeof data === 'string') return data
  if (typeof data !== 'object') return null

  const detail = (data as Record<string, unknown>).detail
  if (typeof detail === 'string') return detail

  // FastAPI validation errors (422) are usually { detail: [{ msg, ... }, ...] }
  if (Array.isArray(detail)) {
    const msgs = detail
      .map((item) => {
        if (!item || typeof item !== 'object') return null
        const msg = (item as Record<string, unknown>).msg
        return typeof msg === 'string' ? msg : null
      })
      .filter((m): m is string => typeof m === 'string' && m.trim().length > 0)

    if (msgs.length) return msgs.join(' · ')
  }

  return null
}

const sanitizeSheetName = (value: string, fallback: string): string => {
  const cleaned = value
    .replace(/[\[\]:*?/\\]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^'+|'+$/g, '')

  return (cleaned || fallback).slice(0, 31)
}

const buildWorkbookSeries = (
  dataset: ReportReadyDataset,
  xMin: number,
  xMax: number
): TrendReportWorkbookSeries | null => {
  const label = dataset.label?.trim() || 'Series'
  const unit = dataset.unit ?? null
  const points = (dataset.data || [])
    .filter(
      (point) =>
        Number.isFinite(point.x) && Number.isFinite(point.y) && point.x >= xMin && point.x <= xMax
    )
    .map((point) => ({ x: point.x, y: point.y }))
    .sort((a, b) => a.x - b.x)

  if (dataset.isManual === true) {
    if (typeof dataset.seriesId !== 'number') return null
    return {
      kind: 'manual',
      seriesId: dataset.seriesId,
      label,
      unit,
      points
    }
  }

  if (typeof dataset.parameterId !== 'string') return null

  return {
    kind: 'sensor',
    parameterId: dataset.parameterId,
    label,
    unit,
    points
  }
}

const buildWorkbookSheet = (
  name: string,
  datasets: ReportReadyDataset[],
  xMin: number,
  xMax: number
): TrendReportWorkbookSheet => ({
  name: sanitizeSheetName(name, 'Trend Report'),
  series: datasets
    .map((dataset) => buildWorkbookSeries(dataset, xMin, xMax))
    .filter((series): series is TrendReportWorkbookSeries => Boolean(series))
})

const decorateRecordedSensorDatasets = (
  datasets: RecordedSensorDataset[],
  {
    displayNameOverrides,
    temperatureUnit,
    labelPrefix,
    getEffectiveSensorColor
  }: {
    displayNameOverrides: Record<string, string>
    temperatureUnit: 'celsius' | 'fahrenheit'
    labelPrefix?: string
    getEffectiveSensorColor: (id: TrendVariableId) => string
  }
): ReportReadyDataset[] =>
  datasets.map((dataset) => {
    const meta = getWagoIoTrendVariableMeta(dataset.parameterId)
    const adjustedData = meta
      ? dataset.data.map((point) => ({
          ...point,
          y: getWagoIoTrendVariableDisplayValue(
            dataset.parameterId as WagoIoTrendVariableId,
            point.y,
            temperatureUnit
          )
        }))
      : dataset.data.map((point) => ({
          ...point,
          y: applyVariableDisplayValue(dataset.parameterId as ParameterId, point.y, temperatureUnit)
        }))

    const baseLabel = getTrendVariableLabel(dataset.parameterId, displayNameOverrides)

    return {
      ...dataset,
      data: adjustedData,
      label: labelPrefix ? `${labelPrefix} - ${baseLabel}` : baseLabel,
      unit: meta
        ? getWagoIoTrendVariableDisplayUnit(
            dataset.parameterId as WagoIoTrendVariableId,
            temperatureUnit
          ) || dataset.unit || null
        : getVariableDisplayUnit(
            dataset.parameterId as ParameterId,
            dataset.unit || null,
            temperatureUnit
          ),
      borderColor: getEffectiveSensorColor(dataset.parameterId)
    }
  })

const buildCurrentValueItems = (datasets: Dataset[]): CurrentValueItem[] =>
  datasets.map((dataset) => ({
    id:
      dataset.label ||
      ('parameterId' in dataset && typeof dataset.parameterId === 'string'
        ? dataset.parameterId
        : 'manual'),
    label:
      dataset.label ||
      ('parameterId' in dataset && typeof dataset.parameterId === 'string'
        ? dataset.parameterId
        : 'manual'),
    color: dataset.borderColor,
    value: dataset.data.length > 0 ? dataset.data[dataset.data.length - 1].y : 0,
    unit: dataset.unit ?? null,
    isManual: dataset.isManual === true
  }))

const TrendScreen = () => {
  void useTheme()
  const { isViewOnly } = useAccessMode()
  const isMobileViewOnly = isViewOnly && useIsViewportBelow(768)
  const [motorControlMode] = useMotorControlModePreference()
  const singleMotorScope = usePreferredSingleMotorScope()
  const [temperatureUnit] = useTemperatureUnitPreference()
  const displayNameOverrides = useWagoDisplayNameOverrides()
  const perfEnabled = isDebugEnabled('trend.perf')
  const {
    timeRange,
    effectiveTimeRange,
    rangeMode,
    customRangeDraft,
    customRangeError,
    activeRangeSummary,
    canApplyCustomRange,
    maxRangeDateTime,
    setTimeRange,
    setCustomRangeDraft,
    applyCustomRange,
    clearCustomRange,
    isConfigOpen,
    setIsConfigOpen,
    isReportOpen,
    setIsReportOpen,
    isManualPanelOpen,
    setIsManualPanelOpen,
    isScalePanelOpen,
    setIsScalePanelOpen,
    selectedVarIds,
    handleToggleVar,
    combinedDatasets: previewCombinedDatasets,
    motorOneCombinedDatasets: previewMotorOneCombinedDatasets,
    motorTwoCombinedDatasets: previewMotorTwoCombinedDatasets,
    combinedXDomain: previewCombinedXDomain,
    currentValues: previewCurrentValues,
    currentValuesByMotor: previewCurrentValuesByMotor,
    trendColorPalette,
    getEffectiveSensorColor,
    getEffectiveManualColor,
    setSeriesColorOverride,
    clearSeriesColorOverride,
    yAxisScale,
    setYAxisScale,
    yAxisScaleError,
    resolvedYAxisScale,
    manualSeries,
    selectedManualIds,
    handleToggleManualSeries,
    manualMode,
    setManualMode,
    manualForm,
    setManualForm,
    manualPoints,
    manualPointsSeriesId,
    setManualPointsSeriesId,
    loadManualPoints,
    isManualSubmitting,
    handleManualSubmit,
    handleEditPoint,
    handleDeletePoint,
    handleEditSeries,
    handleDeleteSeries,
    emailList,
    newEmail,
    setNewEmail,
    isNewEmailValid,
    emailError,
    handleAddEmail,
    handleRemoveEmail,
    isSending,
    setIsSending,
    reportSubject,
    setReportSubject,
    reportNote,
    setReportNote,
    privateMode,
    setPrivateMode,
    excelSampleIntervalValue,
    setExcelSampleIntervalValue,
    excelSampleIntervalUnit,
    setExcelSampleIntervalUnit
  } = useTrendScreenState()
  const {
    status: recordingStatus,
    startedAt: recordingStartedAt,
    stoppedAt: recordingStoppedAt,
    sessionXDomain,
    hasRecordedSession,
    hasRecordedPoints,
    setTrackedSensorIds,
    startRecording,
    stopRecording,
    motorOneDatasets,
    motorTwoDatasets,
    motorOneDatasetsAll,
    motorTwoDatasetsAll
  } = useTrendRecording()

  const selectedCount = selectedVarIds.length + selectedManualIds.length
  const isDualMotorMode = motorControlMode === 'dual'
  const chartRef = useRef<TrendChartRef>(null)
  const exportChartRef = useRef<TrendChartRef>(null)
  const [exportRequest, setExportRequest] = useState<HiddenExportRequest | null>(null)
  const [zoomXDomain, setZoomXDomain] = useState<{ min: number; max: number } | null>(null)
  const [isCurrentValuesOpen, setIsCurrentValuesOpen] = useState(false)
  const [isRangeDialogOpen, setIsRangeDialogOpen] = useState(false)
  const [mobileTrendScope, setMobileTrendScope] = useState<1 | 2 | 'single' | null>(null)
  const exportResolveRef = useRef<((value: string | null) => void) | null>(null)
  const renderStartRef = useRef<number>(perfNow())
  renderStartRef.current = perfNow()

  const previewManualDatasets = useMemo(
    () => previewCombinedDatasets.filter((dataset) => dataset.isManual === true),
    [previewCombinedDatasets]
  )
  const previewManualDatasetsByMotor = useMemo(
    () => previewMotorOneCombinedDatasets.filter((dataset) => dataset.isManual === true),
    [previewMotorOneCombinedDatasets]
  )

  useEffect(() => {
    setTrackedSensorIds(selectedVarIds)
  }, [selectedVarIds, setTrackedSensorIds])

  const handleToggleRecording = useCallback(() => {
    if (recordingStatus === 'recording') {
      stopRecording()
      return
    }

    startRecording(selectedVarIds)
    setZoomXDomain(null)
  }, [recordingStatus, selectedVarIds, startRecording, stopRecording])

  const recordedMotorOneDatasets = useMemo(
    () =>
      decorateRecordedSensorDatasets(motorOneDatasets, {
        displayNameOverrides,
        temperatureUnit,
        getEffectiveSensorColor
      }),
    [displayNameOverrides, getEffectiveSensorColor, motorOneDatasets, temperatureUnit]
  )

  const recordedMotorTwoDatasets = useMemo(
    () =>
      decorateRecordedSensorDatasets(motorTwoDatasets, {
        displayNameOverrides,
        temperatureUnit,
        getEffectiveSensorColor
      }),
    [displayNameOverrides, getEffectiveSensorColor, motorTwoDatasets, temperatureUnit]
  )

  const recordedMotorOneDatasetsAll = useMemo(
    () =>
      decorateRecordedSensorDatasets(motorOneDatasetsAll, {
        displayNameOverrides,
        temperatureUnit,
        labelPrefix: 'Motor #1',
        getEffectiveSensorColor
      }),
    [displayNameOverrides, getEffectiveSensorColor, motorOneDatasetsAll, temperatureUnit]
  )

  const recordedMotorTwoDatasetsAll = useMemo(
    () =>
      decorateRecordedSensorDatasets(motorTwoDatasetsAll, {
        displayNameOverrides,
        temperatureUnit,
        labelPrefix: 'Motor #2',
        getEffectiveSensorColor
      }),
    [displayNameOverrides, getEffectiveSensorColor, motorTwoDatasetsAll, temperatureUnit]
  )

  const showRecordedSession = hasRecordedSession

  const motorOneCombinedDatasets = useMemo(
    () =>
      showRecordedSession
        ? [...recordedMotorOneDatasets, ...previewManualDatasetsByMotor]
        : previewMotorOneCombinedDatasets,
    [
      previewManualDatasetsByMotor,
      previewMotorOneCombinedDatasets,
      recordedMotorOneDatasets,
      showRecordedSession
    ]
  )

  const motorTwoCombinedDatasets = useMemo(
    () =>
      showRecordedSession
        ? [...recordedMotorTwoDatasets, ...previewManualDatasetsByMotor]
        : previewMotorTwoCombinedDatasets,
    [
      previewManualDatasetsByMotor,
      previewMotorTwoCombinedDatasets,
      recordedMotorTwoDatasets,
      showRecordedSession
    ]
  )

  const combinedDatasets = useMemo(
    () =>
      showRecordedSession
        ? isDualMotorMode
          ? [
              ...recordedMotorOneDatasetsAll,
              ...recordedMotorTwoDatasetsAll,
              ...previewManualDatasets
            ]
          : singleMotorScope === 2
            ? motorTwoCombinedDatasets
            : motorOneCombinedDatasets
        : previewCombinedDatasets,
    [
      isDualMotorMode,
      motorOneCombinedDatasets,
      motorTwoCombinedDatasets,
      previewCombinedDatasets,
      previewManualDatasets,
      recordedMotorOneDatasetsAll,
      recordedMotorTwoDatasetsAll,
      showRecordedSession,
      singleMotorScope
    ]
  )

  const combinedXDomain = useMemo(
    () => (showRecordedSession ? sessionXDomain : previewCombinedXDomain),
    [previewCombinedXDomain, sessionXDomain, showRecordedSession]
  )

  const currentValues = useMemo(
    () => (showRecordedSession ? buildCurrentValueItems(combinedDatasets) : previewCurrentValues),
    [combinedDatasets, previewCurrentValues, showRecordedSession]
  )

  const currentValuesByMotor = useMemo(
    () =>
      showRecordedSession
        ? {
            1: buildCurrentValueItems(motorOneCombinedDatasets),
            2: buildCurrentValueItems(motorTwoCombinedDatasets)
          }
        : previewCurrentValuesByMotor,
    [
      motorOneCombinedDatasets,
      motorTwoCombinedDatasets,
      previewCurrentValuesByMotor,
      showRecordedSession
    ]
  )

  const reportDatasets = useMemo<ReportReadyDataset[]>(
    () =>
      showRecordedSession
        ? [...recordedMotorOneDatasetsAll, ...recordedMotorTwoDatasetsAll, ...previewManualDatasets]
        : (combinedDatasets as ReportReadyDataset[]),
    [
      combinedDatasets,
      previewManualDatasets,
      recordedMotorOneDatasetsAll,
      recordedMotorTwoDatasetsAll,
      showRecordedSession
    ]
  )
  const reportIsDual = useMemo(
    () =>
      showRecordedSession
        ? recordedMotorTwoDatasetsAll.some((dataset) => dataset.data.length > 0)
        : isDualMotorMode,
    [isDualMotorMode, recordedMotorTwoDatasetsAll, showRecordedSession]
  )

  const recordingStatusTone = showRecordedSession
    ? recordingStatus === 'recording'
      ? 'recording'
      : 'stopped'
    : 'warning'

  const recordingStatusMessage = showRecordedSession
    ? recordingStatus === 'recording'
      ? 'Recording in progress. Data will keep recording even if you leave this screen.'
      : 'Recording stopped. Reports and Excel exports use the recorded session shown here.'
    : 'Recording not started yet. The chart below is only a live preview until you press Start Recording Data.'

  const recordingStatusMeta = showRecordedSession
    ? `Session start: ${new Date((recordingStartedAt ?? Date.now() / 1000) * 1000).toLocaleString()}`
    : selectedVarIds.length > 0
      ? `${selectedVarIds.length} live variable${selectedVarIds.length === 1 ? '' : 's'} selected`
      : 'Select at least one variable, then press Start Recording Data.'

  const closeAllPanels = useCallback(() => {
    setIsConfigOpen(false)
    setIsManualPanelOpen(false)
    setIsScalePanelOpen(false)
    setIsCurrentValuesOpen(false)
    setIsReportOpen(false)
  }, [setIsConfigOpen, setIsManualPanelOpen, setIsScalePanelOpen, setIsReportOpen])

  const openExclusivePanel = useCallback(
    (panel: TrendPanelKey) => {
      closeAllPanels()

      switch (panel) {
        case 'variables':
          setIsConfigOpen(true)
          break
        case 'manual':
          setIsManualPanelOpen(true)
          break
        case 'scale':
          setIsScalePanelOpen(true)
          break
        case 'currentValues':
          setIsCurrentValuesOpen(true)
          break
        case 'report':
          setIsReportOpen(true)
          break
      }
    },
    [closeAllPanels, setIsConfigOpen, setIsManualPanelOpen, setIsScalePanelOpen, setIsReportOpen]
  )

  const toggleExclusivePanel = useCallback(
    (panel: TrendPanelKey) => {
      if (isViewOnly && panel === 'manual') {
        return
      }

      const isOpen =
        panel === 'variables'
          ? isConfigOpen
          : panel === 'manual'
            ? isManualPanelOpen
            : panel === 'scale'
              ? isScalePanelOpen
              : panel === 'currentValues'
                ? isCurrentValuesOpen
                : isReportOpen

      if (isOpen) {
        closeAllPanels()
        return
      }

      openExclusivePanel(panel)
    },
    [
      closeAllPanels,
      openExclusivePanel,
      isViewOnly,
      isConfigOpen,
      isManualPanelOpen,
      isScalePanelOpen,
      isCurrentValuesOpen,
      isReportOpen
    ]
  )

  useEffect(() => {
    debugLog('trend.screen', 'state snapshot', {
      timeRange,
      effectiveTimeRange,
      rangeMode,
      activeRangeSummary,
      selected: {
        sensors: selectedVarIds.length,
        manual: selectedManualIds.length,
        total: selectedCount
      },
      datasets: combinedDatasets.length,
      xDomain: combinedXDomain
        ? {
            min: combinedXDomain.min,
            max: combinedXDomain.max,
            spanSec: combinedXDomain.max - combinedXDomain.min
          }
        : null
    })
  }, [
    timeRange,
    effectiveTimeRange,
    rangeMode,
    activeRangeSummary,
    selectedVarIds.length,
    selectedManualIds.length,
    selectedCount,
    combinedDatasets.length,
    combinedXDomain
  ])

  useEffect(() => {
    if (!combinedXDomain) {
      setZoomXDomain(null)
      return
    }

    setZoomXDomain((prev) => {
      if (!prev) return prev

      const min = Math.max(prev.min, combinedXDomain.min)
      const max = Math.min(prev.max, combinedXDomain.max)
      if (!(max > min)) return null
      if (min === prev.min && max === prev.max) return prev

      return { min, max }
    })
  }, [combinedXDomain])

  const effectiveXDomain = useMemo(
    () => zoomXDomain ?? combinedXDomain,
    [zoomXDomain, combinedXDomain]
  )

  const formatXAxisTick = useCallback(
    (val: unknown): string => {
      const spanSec =
        effectiveXDomain && Number.isFinite(effectiveXDomain.max - effectiveXDomain.min)
          ? Math.max(effectiveXDomain.max - effectiveXDomain.min, 60)
          : Math.max(effectiveTimeRange * 60, 60)

      return formatEpochSecondsForSpan(val as number, spanSec)
    },
    [effectiveTimeRange, effectiveXDomain]
  )

  const handleSelectTimeRange = useCallback(
    (minutes: number) => {
      setZoomXDomain(null)
      setTimeRange(minutes)
    },
    [setTimeRange]
  )

  const handleChangeRangeStart = useCallback(
    (value: string) => {
      setCustomRangeDraft('start', value)
    },
    [setCustomRangeDraft]
  )

  const handleChangeRangeEnd = useCallback(
    (value: string) => {
      setCustomRangeDraft('end', value)
    },
    [setCustomRangeDraft]
  )

  const handleApplyCustomRange = useCallback(() => {
    if (!applyCustomRange()) return
    setZoomXDomain(null)
  }, [applyCustomRange])

  const handleClearCustomRange = useCallback(() => {
    setZoomXDomain(null)
    clearCustomRange()
  }, [clearCustomRange])

  const handleOpenRangeDialog = useCallback(() => {
    closeAllPanels()
    setIsRangeDialogOpen(true)
  }, [closeAllPanels])

  const handleCloseRangeDialog = useCallback(() => {
    setIsRangeDialogOpen(false)
  }, [])

  const handleSelectPresetRangeAndClose = useCallback(
    (minutes: number) => {
      handleSelectTimeRange(minutes)
      setIsRangeDialogOpen(false)
    },
    [handleSelectTimeRange]
  )

  const handleApplyCustomRangeAndClose = useCallback(() => {
    if (!applyCustomRange()) return
    setZoomXDomain(null)
    setIsRangeDialogOpen(false)
  }, [applyCustomRange])

  const handleUsePresetAndClose = useCallback(() => {
    setZoomXDomain(null)
    clearCustomRange()
    setIsRangeDialogOpen(false)
  }, [clearCustomRange])

  const handleOpenMobileTrend = useCallback(
    (scope: 1 | 2 | 'single') => {
      closeAllPanels()
      setIsRangeDialogOpen(false)
      setMobileTrendScope(scope)
    },
    [closeAllPanels]
  )

  const handleCloseMobileTrend = useCallback(() => {
    setMobileTrendScope(null)
  }, [])

  const handleOpenMobilePanel = useCallback(
    (panel: Exclude<TrendPanelKey, 'manual'>) => {
      setIsRangeDialogOpen(false)
      setMobileTrendScope(null)
      toggleExclusivePanel(panel)
    },
    [toggleExclusivePanel]
  )

  useEffect(() => {
    if (isMobileViewOnly) return

    setIsRangeDialogOpen(false)
    setMobileTrendScope(null)
  }, [isMobileViewOnly])

  const chartScales = useMemo(
    () => ({
      x: {
        min: effectiveXDomain?.min,
        max: effectiveXDomain?.max,
        ticks: {
          callback: formatXAxisTick
        }
      },
      y: {
        min: resolvedYAxisScale?.min,
        max: resolvedYAxisScale?.max
      }
    }),
    [effectiveXDomain?.min, effectiveXDomain?.max, formatXAxisTick, resolvedYAxisScale]
  )

  const activeMobileTrend = useMemo(() => {
    if (mobileTrendScope === 1) {
      return {
        title: 'Motor #1 Trend',
        meta: selectedCount > 0 ? `${selectedCount} series selected` : 'No series selected',
        datasets: motorOneCombinedDatasets
      }
    }

    if (mobileTrendScope === 2) {
      return {
        title: 'Motor #2 Trend',
        meta: selectedCount > 0 ? `${selectedCount} series selected` : 'No series selected',
        datasets: motorTwoCombinedDatasets
      }
    }

    if (mobileTrendScope === 'single') {
      return {
        title: 'Trend',
        meta: selectedCount > 0 ? `${selectedCount} series selected` : 'No series selected',
        datasets: combinedDatasets
      }
    }

    return null
  }, [
    combinedDatasets,
    mobileTrendScope,
    motorOneCombinedDatasets,
    motorTwoCombinedDatasets,
    selectedCount
  ])

  const presetRangeLabel = useMemo(
    () => TIME_RANGES.find((range) => range.value === timeRange)?.label ?? `${timeRange} min`,
    [timeRange]
  )

  const rangeSummaryText =
    rangeMode === 'absolute'
      ? activeRangeSummary ?? 'Custom range selected'
      : `Preset: ${presetRangeLabel}`

  useEffect(() => {
    if (!perfEnabled) return

    const totalPoints = combinedDatasets.reduce((acc, ds) => acc + (ds.data?.length ?? 0), 0)
    const pointsPerSeries = combinedDatasets.map((ds) => ({
      label: ds.label,
      parameterId: (ds as unknown as { parameterId?: string }).parameterId ?? null,
      isManual: Boolean((ds as unknown as { isManual?: boolean }).isManual),
      points: ds.data?.length ?? 0
    }))

    debugLog('trend.perf', 'TrendScreen commit', {
      ms: Math.round(perfNow() - renderStartRef.current),
      selectedCount,
      datasets: combinedDatasets.length,
      totalPoints,
      xDomain: combinedXDomain,
      pointsPerSeries
    })
  }, [perfEnabled, selectedCount, combinedDatasets, combinedXDomain])

  useEffect(() => {
    if (!exportRequest) return
    let cancelled = false
    let attempts = 0

    const tryExport = () => {
      if (cancelled) return
      attempts += 1
      const dataUrl =
        exportChartRef.current?.exportImage({
          type: exportRequest.type,
          quality: exportRequest.quality
        }) ?? null

      if (!dataUrl) {
        const plot = exportChartRef.current?.getChart()
        const canvases = Array.from(
          plot?.root?.querySelectorAll('canvas') ?? []
        ) as HTMLCanvasElement[]
        console.debug('[report.export.hidden] retry', {
          attempt: attempts,
          type: exportRequest.type,
          plot: Boolean(plot),
          canvases: canvases.map((c) => ({ w: c.width, h: c.height }))
        })
      }

      if (dataUrl || attempts >= 20) {
        exportResolveRef.current?.(dataUrl)
        exportResolveRef.current = null
        setExportRequest(null)
        return
      }

      window.setTimeout(tryExport, 120)
    }

    console.debug('[report.export.hidden] start', {
      type: exportRequest.type,
      quality: exportRequest.quality,
      datasets: exportRequest.datasets.map((d) => ({
        label: d.label,
        points: d.data?.length ?? 0,
        isManual: d.isManual,
        unit: d.unit
      })),
      x: { min: exportRequest.xMin, max: exportRequest.xMax },
      y: { min: exportRequest.yMin, max: exportRequest.yMax },
      size: { w: exportRequest.width, h: exportRequest.height }
    })

    const id = window.setTimeout(tryExport, 220)
    return () => {
      cancelled = true
      window.clearTimeout(id)
    }
  }, [exportRequest])

  const exportChartHidden = useCallback(
    async (req: HiddenExportRequest): Promise<string | null> => {
      return await new Promise<string | null>((resolve) => {
        exportResolveRef.current = resolve
        setExportRequest(req)
      })
    },
    []
  )

  const handleSendReport = useCallback(async (): Promise<SendReportResult> => {
    if (!showRecordedSession || !recordingStartedAt) {
      return {
        ok: false,
        message: 'Start recording data first. Reports and Excel exports now use recorded sessions only.'
      }
    }
    if (showRecordedSession && !hasRecordedPoints) {
      return { ok: false, message: 'Recording started, but no recorded points are available yet' }
    }
    if (!emailList.length) return { ok: false, message: 'Add at least one recipient' }

    const startSec = recordingStartedAt
    const endSec = recordingStoppedAt ?? Date.now() / 1000

    const startIso = new Date(startSec * 1000).toISOString()
    const endIso = new Date(endSec * 1000).toISOString()
    const excelSampleSeconds =
      excelSampleIntervalUnit === 'minutes'
        ? excelSampleIntervalValue * 60
        : excelSampleIntervalValue

    const startStamp = formatIsoForFilename(startIso)
    const endStamp = formatIsoForFilename(endIso)

    setIsSending(true)
    try {
      const clientMotorInfo: ClientMotorInfo | undefined = reportIsDual
        ? undefined
        : loadClientMotorInfo()
      const dualClientMotorInfo: DualClientMotorInfo | undefined = reportIsDual
        ? loadDualClientMotorInfo()
        : undefined

      console.debug('[report.send] start', {
        recipients: emailList.length,
        range: { startSec, endSec, startIso, endIso },
        excelSampleSeconds,
        excelSampleInterval: {
          value: excelSampleIntervalValue,
          unit: excelSampleIntervalUnit
        },
        datasets: reportDatasets.map((d) => ({
          label: d.label,
          points: d.data?.length ?? 0,
          isManual: d.isManual,
          unit: d.unit
        }))
      })

      const series: TrendReportSeries[] = []
      reportDatasets.forEach((ds) => {
        const parameterId = (ds as unknown as { parameterId?: string }).parameterId
        const label = ds.label || parameterId || 'Series'
        const unit = ds.unit ?? null

        if (ds.isManual === true) {
          const seriesId = (ds as unknown as { seriesId?: number }).seriesId
          if (typeof seriesId !== 'number') return
          series.push({ kind: 'manual', seriesId, label, unit })
          return
        }

        if (typeof parameterId !== 'string') return
        series.push({ kind: 'sensor', parameterId, label, unit })
      })

      const workbookSheets: TrendReportWorkbookSheet[] = showRecordedSession
        ? reportIsDual
          ? [
              buildWorkbookSheet(
                'Motor #1 Trend',
                [...recordedMotorOneDatasetsAll, ...previewManualDatasets] as ReportReadyDataset[],
                startSec,
                endSec
              ),
              buildWorkbookSheet(
                'Motor #2 Trend',
                [...recordedMotorTwoDatasetsAll, ...previewManualDatasets] as ReportReadyDataset[],
                startSec,
                endSec
              )
            ]
          : [
              buildWorkbookSheet(
                'Trend Report',
                [...recordedMotorOneDatasetsAll, ...previewManualDatasets] as ReportReadyDataset[],
                startSec,
                endSec
              )
            ]
        : isDualMotorMode
          ? [
              buildWorkbookSheet(
                'Motor #1 Trend',
                motorOneCombinedDatasets as ReportReadyDataset[],
                startSec,
                endSec
              ),
              buildWorkbookSheet(
                'Motor #2 Trend',
                motorTwoCombinedDatasets as ReportReadyDataset[],
                startSec,
                endSec
              )
            ]
          : [
              buildWorkbookSheet(
                'Trend Report',
                combinedDatasets as ReportReadyDataset[],
                startSec,
                endSec
              )
            ]

      const images: Array<{ filename: string; mimeType: ImageMimeType; contentBase64: string }> = []

      const globalFilename = sanitizeFilenamePart(
        `Trend - All Parameters - ${startStamp}_to_${endStamp}.png`
      )

      const globalDataUrl =
        (!zoomXDomain && !isDualMotorMode && !showRecordedSession
          ? chartRef.current?.exportImage({ type: 'image/png' })
          : null) ??
        (await exportChartHidden({
          datasets: reportDatasets,
          width: 1500,
          height: 600,
          xMin: startSec,
          xMax: endSec,
          yMin: resolvedYAxisScale?.min,
          yMax: resolvedYAxisScale?.max,
          type: 'image/png',
          quality: 1
        }))

      if (globalDataUrl) {
        images.push({
          filename: globalFilename,
          mimeType: 'image/png',
          contentBase64: stripDataUrlPrefix(globalDataUrl)
        })
      } else {
        console.debug('[report.send] global image export failed')
      }

      for (const ds of reportDatasets) {
        const label = ds.label || 'Series'
        const unitLabel = ds.unit ? ` (${ds.unit})` : ''
        const kindLabel = ds.isManual === true ? 'Manual' : 'Sensor'

        const seriesYRange = resolvedYAxisScale
          ? { yMin: resolvedYAxisScale.min, yMax: resolvedYAxisScale.max }
          : computePaddedYRange(ds, startSec, endSec)
        const dataUrl = await exportChartHidden({
          datasets: [ds],
          width: 1500,
          height: 600,
          xMin: startSec,
          xMax: endSec,
          yMin: seriesYRange.yMin,
          yMax: seriesYRange.yMax,
          type: 'image/jpeg',
          quality: 1
        })

        if (!dataUrl) {
          console.debug('[report.send] per-series export failed', {
            label,
            kind: kindLabel,
            points: ds.data?.length ?? 0,
            y: seriesYRange
          })
          continue
        }

        const filename = sanitizeFilenamePart(
          `Trend - ${kindLabel} - ${label}${unitLabel} - ${startStamp}_to_${endStamp}.jpg`
        )

        images.push({
          filename,
          mimeType: 'image/jpeg',
          contentBase64: stripDataUrlPrefix(dataUrl)
        })
      }

      console.debug('[report.send] payload ready', {
        series: series.length,
        excelSampleSeconds,
        excelSampleInterval: {
          value: excelSampleIntervalValue,
          unit: excelSampleIntervalUnit
        },
        workbookSheets: workbookSheets.map((sheet) => ({
          name: sheet.name,
          series: sheet.series.length
        })),
        images: images.length,
        imageNames: images.map((i) => i.filename)
      })

      const response = await runReportSend('trend', async () => {
        return await sendTrendReportEmail({
          recipients: emailList,
          privateMode,
          excelSampleSeconds,
          subject: reportSubject,
          note: reportNote,
          timeRange: { start: startIso, end: endIso },
          series,
          workbookSheets,
          images,
          clientMotorInfo,
          dualClientMotorInfo
        })
      })

      console.debug('[report.send] sent ok')
      const recipientsCount = response?.recipients?.length ?? emailList.length
      const attachmentsCount = response?.attachments
      const message =
        typeof attachmentsCount === 'number'
          ? `Report sent (${recipientsCount} recipients, ${attachmentsCount} attachments)`
          : `Report sent (${recipientsCount} recipients)`

      return { ok: true, message }
    } catch (err) {
      console.error('Failed to send report', err)
      const detail = getFastApiErrorDetail(err)
      const message = detail ?? getErrorMessage(err, 'Could not send the report')
      return { ok: false, message }
    } finally {
      setIsSending(false)
    }
  }, [
    combinedDatasets,
    emailList,
    excelSampleIntervalUnit,
    excelSampleIntervalValue,
    exportChartHidden,
    hasRecordedPoints,
    isDualMotorMode,
    motorOneCombinedDatasets,
    motorTwoCombinedDatasets,
    previewManualDatasets,
    privateMode,
    recordedMotorOneDatasetsAll,
    recordedMotorTwoDatasetsAll,
    recordingStartedAt,
    recordingStoppedAt,
    reportDatasets,
    reportIsDual,
    reportNote,
    reportSubject,
    resolvedYAxisScale,
    setIsSending,
    showRecordedSession,
    zoomXDomain,
  ])

  const renderTrendChartCanvas = (
    chartId: string,
    datasets: Dataset[],
    exportTarget = false,
    panelLabel?: string
  ) => {
    const chartNode = perfEnabled ? (
      <Profiler
        id={chartId}
        onRender={(id, phase, actualDuration, baseDuration, startTime, commitTime) => {
          debugLog('trend.perf', 'React Profiler', {
            id,
            phase,
            actualMs: Math.round(actualDuration),
            baseMs: Math.round(baseDuration),
            startTime: Math.round(startTime),
            commitTime: Math.round(commitTime)
          })
        }}
      >
        <TrendChart
          ref={exportTarget ? chartRef : undefined}
          datasets={datasets}
          timeWindow={effectiveTimeRange}
          showLegend={false}
          showTitle={false}
          responsive={true}
          maintainAspectRatio={false}
          height={'100%'}
          width={'100%'}
          enableXSelectionZoom={true}
          onXSelectionZoom={setZoomXDomain}
          scales={chartScales}
        />
      </Profiler>
    ) : (
      <TrendChart
        ref={exportTarget ? chartRef : undefined}
        datasets={datasets}
        timeWindow={effectiveTimeRange}
        showLegend={false}
        showTitle={false}
        responsive={true}
        maintainAspectRatio={false}
        height={'100%'}
        width={'100%'}
        enableXSelectionZoom={true}
        onXSelectionZoom={setZoomXDomain}
        scales={chartScales}
      />
    )

    return (
      <S.ChartCanvasShell>
        {chartNode}

        {zoomXDomain && exportTarget && (
          <S.ActionButton
            $variant="primary"
            onClick={() => setZoomXDomain(null)}
            style={{
              position: 'absolute',
              top: 16,
              left: 16,
              zIndex: 11,
              justifyContent: 'center'
            }}
          >
            <ZoomOut size={14} />
            <span>{panelLabel ? `RESET ${panelLabel}` : 'RESET ZOOM'}</span>
          </S.ActionButton>
        )}
      </S.ChartCanvasShell>
    )
  }

  return (
    <ScreenLayout>
      <S.ScreenContainer>
        {isMobileViewOnly ? (
          <>
            <S.MobileActionGrid>
              {isDualMotorMode ? (
                <>
                  <S.MobileActionCard $primary onClick={() => handleOpenMobileTrend(1)}>
                    <S.MobileActionLabelStack>
                      <S.MobileActionTitle>Motor #1 Trend</S.MobileActionTitle>
                      <S.MobileActionMeta>
                        {motorOneCombinedDatasets.length > 0
                          ? `${motorOneCombinedDatasets.length} series visible`
                          : 'No series selected'}
                      </S.MobileActionMeta>
                    </S.MobileActionLabelStack>
                    <ChevronRight size={22} />
                  </S.MobileActionCard>

                  <S.MobileActionCard $primary onClick={() => handleOpenMobileTrend(2)}>
                    <S.MobileActionLabelStack>
                      <S.MobileActionTitle>Motor #2 Trend</S.MobileActionTitle>
                      <S.MobileActionMeta>
                        {motorTwoCombinedDatasets.length > 0
                          ? `${motorTwoCombinedDatasets.length} series visible`
                          : 'No series selected'}
                      </S.MobileActionMeta>
                    </S.MobileActionLabelStack>
                    <ChevronRight size={22} />
                  </S.MobileActionCard>
                </>
              ) : (
                <S.MobileActionCard $primary onClick={() => handleOpenMobileTrend('single')}>
                  <S.MobileActionLabelStack>
                    <S.MobileActionTitle>Open Trend</S.MobileActionTitle>
                    <S.MobileActionMeta>
                      {combinedDatasets.length > 0
                        ? `${combinedDatasets.length} series visible`
                        : 'No series selected'}
                    </S.MobileActionMeta>
                  </S.MobileActionLabelStack>
                  <ChartLine size={22} />
                </S.MobileActionCard>
              )}

              <S.MobileActionCard onClick={() => handleOpenMobilePanel('variables')}>
                <S.MobileActionLabelStack>
                  <S.MobileActionTitle>Variables</S.MobileActionTitle>
                  <S.MobileActionMeta>
                    {selectedCount > 0
                      ? `${selectedCount} series configured`
                      : 'No visible series configured'}
                  </S.MobileActionMeta>
                </S.MobileActionLabelStack>
                <Filter size={22} />
              </S.MobileActionCard>

              <S.MobileActionCard onClick={() => handleOpenMobilePanel('currentValues')}>
                <S.MobileActionLabelStack>
                  <S.MobileActionTitle>Current Values</S.MobileActionTitle>
                  <S.MobileActionMeta>Open the live series snapshot in a full-screen popup.</S.MobileActionMeta>
                </S.MobileActionLabelStack>
                <Activity size={22} />
              </S.MobileActionCard>

              <S.MobileActionCard onClick={() => handleOpenMobilePanel('scale')}>
                <S.MobileActionLabelStack>
                  <S.MobileActionTitle>Y Scale</S.MobileActionTitle>
                  <S.MobileActionMeta>
                    {resolvedYAxisScale
                      ? `${resolvedYAxisScale.min.toFixed(1)} to ${resolvedYAxisScale.max.toFixed(1)}`
                      : 'Automatic chart scale'}
                  </S.MobileActionMeta>
                </S.MobileActionLabelStack>
                <SlidersHorizontal size={22} />
              </S.MobileActionCard>

              <S.MobileActionCard onClick={() => handleOpenMobilePanel('report')}>
                <S.MobileActionLabelStack>
                  <S.MobileActionTitle>Send Report</S.MobileActionTitle>
                  <S.MobileActionMeta>
                    {emailList.length > 0
                      ? `${emailList.length} recipients configured`
                      : 'No recipients configured'}
                  </S.MobileActionMeta>
                </S.MobileActionLabelStack>
                <Mail size={22} />
              </S.MobileActionCard>
            </S.MobileActionGrid>

            {activeMobileTrend ? (
              <S.ModalOverlay onClick={handleCloseMobileTrend}>
                <S.ModalContent onClick={(event) => event.stopPropagation()}>
                  <S.ModalHeader>
                    <h3>
                      <ChartLine size={18} />
                      {activeMobileTrend.title}
                    </h3>

                    <S.ActionButton
                      onClick={handleCloseMobileTrend}
                      style={{ minWidth: 44, justifyContent: 'center' }}
                    >
                      <X size={16} />
                    </S.ActionButton>
                  </S.ModalHeader>

                  <S.MobileTrendModalBody>
                    <S.MobileTrendToolbar>
                      <S.RangeTriggerButton
                        type="button"
                        $isActive={rangeMode === 'absolute'}
                        onClick={handleOpenRangeDialog}
                      >
                        <CalendarRange size={18} />
                        <span>Select X Range</span>
                      </S.RangeTriggerButton>
                      <S.RangeMetaText>{rangeSummaryText}</S.RangeMetaText>
                    </S.MobileTrendToolbar>

                    <S.MobileTrendChartFrame>
                      {renderTrendChartCanvas(
                        `MobileTrendChart-${activeMobileTrend.title}`,
                        activeMobileTrend.datasets,
                        true,
                        'ZOOM'
                      )}
                    </S.MobileTrendChartFrame>
                  </S.MobileTrendModalBody>
                </S.ModalContent>
              </S.ModalOverlay>
            ) : null}
          </>
        ) : (
          <>
            <TrendToolbar
              timeRange={timeRange}
              rangeMode={rangeMode}
              timeRanges={TIME_RANGES}
              onSelectRange={handleSelectTimeRange}
              customRange={customRangeDraft}
              customRangeError={customRangeError}
              activeRangeSummary={activeRangeSummary}
              canApplyCustomRange={canApplyCustomRange}
              maxRangeDateTime={maxRangeDateTime}
              onChangeRangeStart={handleChangeRangeStart}
              onChangeRangeEnd={handleChangeRangeEnd}
              onApplyCustomRange={handleApplyCustomRange}
              onClearCustomRange={handleClearCustomRange}
              selectedCount={selectedCount}
              isVariablesOpen={isConfigOpen}
              onToggleVariables={() => toggleExclusivePanel('variables')}
              isManualOpen={isManualPanelOpen}
              onToggleManual={() => toggleExclusivePanel('manual')}
              manualDisabled={isViewOnly}
              isScaleOpen={isScalePanelOpen}
              onToggleScale={() => toggleExclusivePanel('scale')}
              isCurrentValuesOpen={isCurrentValuesOpen}
              onToggleCurrentValues={() => toggleExclusivePanel('currentValues')}
              isReportOpen={isReportOpen}
              onToggleReport={() => toggleExclusivePanel('report')}
              isRecording={recordingStatus === 'recording'}
              onToggleRecording={handleToggleRecording}
              recordingDisabled={isViewOnly || (recordingStatus !== 'recording' && selectedVarIds.length === 0)}
            />

            <S.ContentArea>
              <S.ChartSection
                $isShrunk={
                  isReportOpen ||
                  isManualPanelOpen ||
                  isConfigOpen ||
                  isScalePanelOpen ||
                  isCurrentValuesOpen
                }
              >
                <S.RecordingStatusBar $tone={recordingStatusTone}>
                  <S.RecordingStatusText $tone={recordingStatusTone}>
                    {recordingStatusMessage}
                  </S.RecordingStatusText>
                  <S.RecordingStatusMeta>{recordingStatusMeta}</S.RecordingStatusMeta>
                </S.RecordingStatusBar>

                <TrendRangeNavigator
                  datasets={combinedDatasets}
                  fullDomain={combinedXDomain}
                  value={zoomXDomain}
                  onChange={setZoomXDomain}
                />

                {isDualMotorMode ? (
                  <S.DualChartsGrid>
                    <S.DualChartPanel>
                      <S.DualChartHeader>
                        <S.DualChartTitle>Motor #2</S.DualChartTitle>
                        <S.DualChartMeta>
                          {selectedCount > 0
                            ? `${selectedCount} series selected`
                            : 'No series selected'}
                        </S.DualChartMeta>
                      </S.DualChartHeader>
                      <S.DualChartBody>
                        {renderTrendChartCanvas('TrendChartMotor2', motorTwoCombinedDatasets)}
                      </S.DualChartBody>
                    </S.DualChartPanel>

                    <S.DualChartPanel>
                      <S.DualChartHeader>
                        <S.DualChartTitle>Motor #1</S.DualChartTitle>
                        <S.DualChartMeta>
                          {selectedCount > 0
                            ? `${selectedCount} series selected`
                            : 'No series selected'}
                        </S.DualChartMeta>
                      </S.DualChartHeader>
                      <S.DualChartBody>
                        {renderTrendChartCanvas(
                          'TrendChartMotor1',
                          motorOneCombinedDatasets,
                          true,
                          'ZOOM'
                        )}
                      </S.DualChartBody>
                    </S.DualChartPanel>
                  </S.DualChartsGrid>
                ) : (
                  renderTrendChartCanvas('TrendChart', combinedDatasets, true)
                )}

                {/* Hidden exporter (inside the real ThemeProvider) */}
                {exportRequest && (
                  <div
                    style={{
                      position: 'fixed',
                      left: '-10000px',
                      top: '-10000px',
                      width: exportRequest.width,
                      height: exportRequest.height,
                      pointerEvents: 'none',
                      opacity: 0
                    }}
                  >
                    <TrendChart
                      ref={exportChartRef}
                      datasets={exportRequest.datasets}
                      responsive={false}
                      maintainAspectRatio={false}
                      showLegend={false}
                      showTitle={false}
                      showTooltips={false}
                      width={exportRequest.width}
                      height={exportRequest.height}
                      position={{ left: 0, top: 0 }}
                      scales={{
                        x: {
                          min: exportRequest.xMin,
                          max: exportRequest.xMax,
                          ticks: {
                            callback: (val: number) =>
                              formatEpochSecondsForSpan(
                                val,
                                Math.max(exportRequest.xMax - exportRequest.xMin, 60)
                              ),
                            space: 100
                          }
                        },
                        y: {
                          min: exportRequest.yMin,
                          max: exportRequest.yMax
                        }
                      }}
                    />
                  </div>
                )}
              </S.ChartSection>
            </S.ContentArea>
          </>
        )}

        {isRangeDialogOpen ? (
          <S.ModalOverlay onClick={handleCloseRangeDialog}>
            <S.RangeDialog onClick={(event) => event.stopPropagation()}>
              <S.RangeDialogHeader>
                <div>
                  <S.RangeDialogTitle>Select Range</S.RangeDialogTitle>
                  <S.RangeDialogSubtitle>
                    Touch-friendly custom range up to 2 months.
                  </S.RangeDialogSubtitle>
                </div>

                <S.RangeDialogClose onClick={handleCloseRangeDialog} aria-label="Close range popup">
                  <X size={16} />
                </S.RangeDialogClose>
              </S.RangeDialogHeader>

              <S.RangeDialogBody>
                <S.RangeMetaRow>
                  <S.RangeBadge $active={rangeMode === 'absolute'}>
                    {rangeMode === 'absolute' ? 'Custom range active' : 'Using preset window'}
                  </S.RangeBadge>
                  <S.RangeMetaText>Maximum: 2 months</S.RangeMetaText>
                </S.RangeMetaRow>

                <S.ButtonGroup>
                  {TIME_RANGES.map((range) => (
                    <S.TimeButton
                      key={range.value}
                      $isActive={rangeMode === 'relative' && timeRange === range.value}
                      onClick={() => handleSelectPresetRangeAndClose(range.value)}
                    >
                      {range.label}
                    </S.TimeButton>
                  ))}
                </S.ButtonGroup>

                <S.RangeInputStack>
                  <S.RangeInputGroup>
                    <S.RangeLabel>From</S.RangeLabel>
                    <S.RangeInput
                      type="datetime-local"
                      step={60}
                      value={customRangeDraft.start}
                      max={maxRangeDateTime}
                      onChange={(event) => handleChangeRangeStart(event.target.value)}
                    />
                  </S.RangeInputGroup>

                  <S.RangeInputGroup>
                    <S.RangeLabel>To</S.RangeLabel>
                    <S.RangeInput
                      type="datetime-local"
                      step={60}
                      value={customRangeDraft.end}
                      min={customRangeDraft.start || undefined}
                      max={maxRangeDateTime}
                      onChange={(event) => handleChangeRangeEnd(event.target.value)}
                    />
                  </S.RangeInputGroup>
                </S.RangeInputStack>

                <S.RangeHint $tone={customRangeError ? 'error' : 'default'}>
                  {customRangeError ??
                    activeRangeSummary ??
                    'Pick the historical slice you want to inspect.'}
                </S.RangeHint>
              </S.RangeDialogBody>

              <S.RangeDialogFooter>
                {rangeMode === 'absolute' ? (
                  <S.RangeActionButton onClick={handleUsePresetAndClose}>
                    USE PRESET
                  </S.RangeActionButton>
                ) : null}
                <S.RangeActionButton onClick={handleCloseRangeDialog}>CLOSE</S.RangeActionButton>
                <S.RangeActionButton
                  $variant="primary"
                  disabled={!canApplyCustomRange}
                  onClick={handleApplyCustomRangeAndClose}
                >
                  APPLY
                </S.RangeActionButton>
              </S.RangeDialogFooter>
            </S.RangeDialog>
          </S.ModalOverlay>
        ) : null}

        <ReportPanel
          isOpen={isReportOpen}
          onClose={() => setIsReportOpen(false)}
          emailList={emailList}
          newEmail={newEmail}
          onChangeNewEmail={setNewEmail}
          onAddEmail={handleAddEmail}
          onSendReport={handleSendReport}
          isSending={isSending}
          onRemoveEmail={handleRemoveEmail}
          isNewEmailValid={isNewEmailValid}
          emailError={emailError}
          subject={reportSubject}
          onChangeSubject={setReportSubject}
          note={reportNote}
          onChangeNote={setReportNote}
          privateMode={privateMode}
          onTogglePrivateMode={() => setPrivateMode((v) => !v)}
          excelSampleIntervalValue={excelSampleIntervalValue}
          onChangeExcelSampleIntervalValue={setExcelSampleIntervalValue}
          excelSampleIntervalUnit={excelSampleIntervalUnit}
          onChangeExcelSampleIntervalUnit={setExcelSampleIntervalUnit}
          readOnly={isViewOnly}
        />

        <ManualPanel
          isOpen={isManualPanelOpen}
          onClose={() => setIsManualPanelOpen(false)}
          manualSeries={manualSeries}
          selectedManualIds={selectedManualIds}
          onToggleManualSeries={handleToggleManualSeries}
          manualMode={manualMode}
          onChangeManualMode={setManualMode}
          manualForm={manualForm}
          onChangeManualForm={setManualForm}
          onSubmit={handleManualSubmit}
          onResetForm={() =>
            setManualForm((prev) => ({
              ...prev,
              seriesId: undefined,
              name: '',
              unit: '',
              value: '',
              time: nowLocalInput(),
              note: '',
              createdBy: '',
              pointId: undefined
            }))
          }
          isSubmitting={isManualSubmitting}
          manualPoints={manualPoints}
          manualPointsSeriesId={manualPointsSeriesId}
          onChangeManualPointsSeriesId={setManualPointsSeriesId}
          onReloadPoints={loadManualPoints}
          onEditPoint={handleEditPoint}
          onDeletePoint={handleDeletePoint}
          onEditSeries={handleEditSeries}
          onDeleteSeries={handleDeleteSeries}
        />

        <ScalePanel
          isOpen={isScalePanelOpen}
          onClose={() => setIsScalePanelOpen(false)}
          yAxisScale={yAxisScale}
          onChangeYAxisScale={setYAxisScale}
          resolvedYAxisScale={resolvedYAxisScale}
          error={yAxisScaleError}
          readOnly={isViewOnly}
        />

        <CurrentValuesPanel
          isOpen={isCurrentValuesOpen}
          onClose={() => setIsCurrentValuesOpen(false)}
          values={currentValues}
          valuesByMotor={currentValuesByMotor}
          isDualMotorMode={isDualMotorMode}
        />

        <VariablesPanel
          isOpen={isConfigOpen}
          onClose={() => setIsConfigOpen(false)}
          selectedVarIds={selectedVarIds}
          onToggleVar={handleToggleVar}
          trendColorPalette={trendColorPalette}
          getEffectiveSensorColor={getEffectiveSensorColor}
          onSetSeriesColor={setSeriesColorOverride}
          onClearSeriesColor={clearSeriesColorOverride}
          selectedManualIds={selectedManualIds}
          onToggleManualSeries={handleToggleManualSeries}
          getEffectiveManualColor={getEffectiveManualColor}
          manualSeries={manualSeries}
          onOpenManualPanel={() => openExclusivePanel('manual')}
          sensorSelectionDisabled={false}
          manualSelectionDisabled={isViewOnly}
          colorEditingDisabled={isViewOnly}
          manualManageDisabled={isViewOnly}
        />
      </S.ScreenContainer>
    </ScreenLayout>
  )
}

export default TrendScreen
