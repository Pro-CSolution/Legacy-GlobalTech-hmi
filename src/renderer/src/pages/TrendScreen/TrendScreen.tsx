import { Profiler, useCallback, useEffect, useRef, useState } from 'react'
import { TrendChart, TrendChartRef, Dataset } from 'components/TrendChart'
import { ScreenLayout } from 'layouts'
import { sendTrendReportEmail } from 'services'
import type { ClientMotorInfo, TrendReportSeries } from 'services'
import { runReportSend } from 'hooks/useReportSendStatus'
import { useTheme } from 'styled-components'
import { getErrorMessage, isAxiosErrorLike } from 'types/errors'
import { debugLog, isDebugEnabled } from 'utils/debug'
import { LegendBox } from './components/LegendBox'
import { ManualPanel } from './components/ManualPanel'
import { ReportPanel } from './components/ReportPanel'
import { TrendToolbar } from './components/TrendToolbar'
import { VariablesPanel } from './components/VariablesPanel'
import { TIME_RANGES, nowLocalInput } from './constants'
import { useTrendScreenState } from './hooks/useTrendScreenState'
import * as S from './TrendScreen.styles'

type ImageMimeType = 'image/png' | 'image/jpeg'

const perfNow = (): number =>
  typeof performance !== 'undefined' && typeof performance.now === 'function'
    ? performance.now()
    : Date.now()

const stripDataUrlPrefix = (dataUrl: string): string => {
  const idx = dataUrl.indexOf(',')
  return idx >= 0 ? dataUrl.slice(idx + 1) : dataUrl
}

const CLIENT_MOTOR_INFO_STORAGE_KEY = 'client_motor_info'
const CLIENT_MOTOR_MAX_EXTRAS = 15

const createBlankClientMotorInfo = (): ClientMotorInfo => ({
  customer: '',
  model: '',
  catalog: '',
  hp: '',
  rpm: '',
  volts: '',
  amps: '',
  hz: '',
  frame: '',
  duty: '',
  enclosure: '',
  tempRise: '',
  serviceFactor: '',
  efficiency: '',
  inverterRating: '',
  extras: []
})

const loadClientMotorInfoForReport = (): ClientMotorInfo => {
  const fallback = createBlankClientMotorInfo()
  if (typeof window === 'undefined') return fallback

  try {
    const raw = localStorage.getItem(CLIENT_MOTOR_INFO_STORAGE_KEY)
    if (!raw) return fallback

    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return fallback
    const obj = parsed as Record<string, unknown>

    const readString = (key: string): string => {
      const v = obj[key]
      if (typeof v === 'string') return v
      if (typeof v === 'number' && Number.isFinite(v)) return String(v)
      return ''
    }

    const extrasRaw = obj.extras
    const extras = Array.isArray(extrasRaw)
      ? extrasRaw
          .map((item) => {
            if (!item || typeof item !== 'object') return null
            const row = item as Record<string, unknown>
            const label = typeof row.label === 'string' ? row.label.trim() : ''
            const value = typeof row.value === 'string' ? row.value.trim() : ''
            if (!label) return null
            return { label, value }
          })
          .filter((v): v is { label: string; value: string } => Boolean(v))
          .slice(0, CLIENT_MOTOR_MAX_EXTRAS)
      : []

    return {
      customer: readString('customer'),
      model: readString('model'),
      catalog: readString('catalog'),
      hp: readString('hp'),
      rpm: readString('rpm'),
      volts: readString('volts'),
      amps: readString('amps'),
      hz: readString('hz'),
      frame: readString('frame'),
      duty: readString('duty'),
      enclosure: readString('enclosure'),
      tempRise: readString('tempRise'),
      serviceFactor: readString('serviceFactor'),
      efficiency: readString('efficiency'),
      inverterRating: readString('inverterRating'),
      extras
    }
  } catch {
    return fallback
  }
}

const sanitizeFilenamePart = (value: string): string =>
  value
    .replace(/[\\/:*?"<>|]+/g, '-')
    .replace(/\s+/g, ' ')
    .trim()

const formatIsoForFilename = (iso: string): string =>
  iso.replace(/\.\d{3}Z$/, 'Z').replace(/:/g, '-')

const formatEpochSecondsToLocalTime = (seconds: number): string => {
  const date = new Date(seconds * 1000)
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
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

const TrendScreen = () => {
  void useTheme()
  const perfEnabled = isDebugEnabled('trend.perf')
  const {
    timeRange,
    setTimeRange,
    isConfigOpen,
    setIsConfigOpen,
    isReportOpen,
    setIsReportOpen,
    isManualPanelOpen,
    setIsManualPanelOpen,
    selectedVarIds,
    handleToggleVar,
    combinedDatasets,
    combinedXDomain,
    currentValues,
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
    setPrivateMode
  } = useTrendScreenState()

  const selectedCount = selectedVarIds.length + selectedManualIds.length
  const chartRef = useRef<TrendChartRef>(null)
  const exportChartRef = useRef<TrendChartRef>(null)
  const [exportRequest, setExportRequest] = useState<HiddenExportRequest | null>(null)
  const exportResolveRef = useRef<((value: string | null) => void) | null>(null)
  const renderStartRef = useRef<number>(perfNow())
  renderStartRef.current = perfNow()

  useEffect(() => {
    debugLog('trend.screen', 'state snapshot', {
      timeRange,
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
    selectedVarIds.length,
    selectedManualIds.length,
    selectedCount,
    combinedDatasets.length,
    combinedXDomain
  ])

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
    if (!combinedXDomain) return { ok: false, message: 'No valid range for sending the report' }
    if (!emailList.length) return { ok: false, message: 'Add at least one recipient' }

    const startSec = combinedXDomain.min
    const endSec = combinedXDomain.max

    const startIso = new Date(startSec * 1000).toISOString()
    const endIso = new Date(endSec * 1000).toISOString()

    const startStamp = formatIsoForFilename(startIso)
    const endStamp = formatIsoForFilename(endIso)

    setIsSending(true)
    try {
      const clientMotorInfo = loadClientMotorInfoForReport()

      console.debug('[report.send] start', {
        recipients: emailList.length,
        range: { startSec, endSec, startIso, endIso },
        datasets: combinedDatasets.map((d) => ({
          label: d.label,
          points: d.data?.length ?? 0,
          isManual: d.isManual,
          unit: d.unit
        }))
      })

      const series: TrendReportSeries[] = []
      combinedDatasets.forEach((ds) => {
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

      const images: Array<{ filename: string; mimeType: ImageMimeType; contentBase64: string }> = []

      const globalFilename = sanitizeFilenamePart(
        `Trend - All Parameters - ${startStamp}_to_${endStamp}.png`
      )

      const globalDataUrl =
        chartRef.current?.exportImage({ type: 'image/png' }) ??
        (await exportChartHidden({
          datasets: combinedDatasets,
          width: 1500,
          height: 600,
          xMin: startSec,
          xMax: endSec,
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

      for (const ds of combinedDatasets) {
        const label = ds.label || 'Series'
        const unitLabel = ds.unit ? ` (${ds.unit})` : ''
        const kindLabel = ds.isManual === true ? 'Manual' : 'Sensor'

        const { yMin, yMax } = computePaddedYRange(ds, startSec, endSec)
        const dataUrl = await exportChartHidden({
          datasets: [ds],
          width: 1500,
          height: 600,
          xMin: startSec,
          xMax: endSec,
          yMin,
          yMax,
          type: 'image/jpeg',
          quality: 1
        })

        if (!dataUrl) {
          console.debug('[report.send] per-series export failed', {
            label,
            kind: kindLabel,
            points: ds.data?.length ?? 0,
            y: { yMin, yMax }
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
        images: images.length,
        imageNames: images.map((i) => i.filename)
      })

      const response = await runReportSend('trend', async () => {
        return await sendTrendReportEmail({
          recipients: emailList,
          privateMode,
          subject: reportSubject,
          note: reportNote,
          timeRange: { start: startIso, end: endIso },
          series,
          images,
          clientMotorInfo
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
    combinedXDomain,
    emailList,
    privateMode,
    reportNote,
    reportSubject,
    exportChartHidden,
    setIsSending
  ])

  return (
    <ScreenLayout>
      <S.ScreenContainer>
        <TrendToolbar
          timeRange={timeRange}
          timeRanges={TIME_RANGES}
          onSelectRange={setTimeRange}
          selectedCount={selectedCount}
          isVariablesOpen={isConfigOpen}
          onToggleVariables={() => setIsConfigOpen((v) => !v)}
          isManualOpen={isManualPanelOpen}
          onToggleManual={() => setIsManualPanelOpen((v) => !v)}
          isReportOpen={isReportOpen}
          onToggleReport={() => setIsReportOpen((v) => !v)}
        />

        <S.ContentArea>
          <S.ChartSection $isShrunk={isReportOpen || isManualPanelOpen || isConfigOpen}>
            {perfEnabled ? (
              <Profiler
                id="TrendChart"
                onRender={(
                  id,
                  phase,
                  actualDuration,
                  baseDuration,
                  startTime,
                  commitTime
                ) => {
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
                  ref={chartRef}
                  datasets={combinedDatasets}
                  timeWindow={timeRange}
                  showLegend={false}
                  showTitle={false}
                  responsive={true}
                  maintainAspectRatio={false}
                  height={'97%'}
                  width={'98%'}
                  scales={{
                    x: {
                      min: combinedXDomain?.min,
                      max: combinedXDomain?.max,
                      ticks: {
                        callback: (val: unknown): string => {
                          const date = new Date((val as number) * 1000)
                          return date.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                          })
                        }
                      }
                    }
                  }}
                />
              </Profiler>
            ) : (
              <TrendChart
                ref={chartRef}
                datasets={combinedDatasets}
                timeWindow={timeRange}
                showLegend={false}
                showTitle={false}
                responsive={true}
                maintainAspectRatio={false}
                height={'97%'}
                width={'98%'}
                scales={{
                  x: {
                    min: combinedXDomain?.min,
                    max: combinedXDomain?.max,
                    ticks: {
                      callback: (val: unknown): string => {
                        const date = new Date((val as number) * 1000)
                        return date.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })
                      }
                    }
                  }
                }}
              />
            )}
            <LegendBox values={currentValues} />

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
                        callback: (val: number) => formatEpochSecondsToLocalTime(val),
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

          <VariablesPanel
            isOpen={isConfigOpen}
            onClose={() => setIsConfigOpen(false)}
            selectedVarIds={selectedVarIds}
            onToggleVar={handleToggleVar}
            selectedManualIds={selectedManualIds}
            onToggleManualSeries={handleToggleManualSeries}
            manualSeries={manualSeries}
            onOpenManualPanel={() => setIsManualPanelOpen(true)}
          />
        </S.ContentArea>
      </S.ScreenContainer>
    </ScreenLayout>
  )
}

export default TrendScreen
