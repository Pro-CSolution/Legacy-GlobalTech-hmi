import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTrendData, useManualTrendData } from 'hooks'
import {
  createManualPoint,
  createManualSeries,
  deleteManualPoint,
  deleteManualSeries,
  fetchManualHistory,
  fetchManualSeries,
  ManualTrendPoint,
  ManualTrendSeries,
  updateManualPoint,
  updateManualSeries
} from 'services/manualTrendService'
import { Dataset } from 'components/TrendChart/TrendChart.types'
import { DeviceId, ParameterId } from 'types/generated/devices'
import {
  AVAILABLE_VARIABLES,
  MANUAL_COLORS,
  nowLocalInput,
  TIME_RANGES,
  formatLocalInputFromDate
} from '../constants'
import { CurrentValueItem, ManualFormState, ManualMode } from '../types'

type ExtendedDataset = Dataset & {
  parameterId?: string
  unit?: string | null
  isManual?: boolean
}

type TrendScreenPersistedState = {
  selectedVarIds: ParameterId[]
  selectedManualIds: number[]
  timeRange: number
}

const DEFAULT_SELECTED_VAR_IDS: ParameterId[] = [
  AVAILABLE_VARIABLES[0]?.id,
  AVAILABLE_VARIABLES[1]?.id,
  AVAILABLE_VARIABLES[3]?.id
].filter((id): id is ParameterId => Boolean(id))

const DEFAULT_TIME_RANGE = TIME_RANGES[4]?.value ?? 60
const TREND_STORAGE_KEY = 'trend_screen_config'
const EMAIL_STORAGE_KEY = 'trend_report_emails'
const REPORT_META_STORAGE_KEY = 'trend_report_meta'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const isBrowser = (): boolean => typeof window !== 'undefined'

const normalizeEmail = (value: string): string => value.trim().toLowerCase()

const sanitizeEmailList = (value: unknown): string[] => {
  if (!Array.isArray(value)) return []
  const deduped = new Set<string>()
  value.forEach((raw) => {
    if (typeof raw !== 'string') return
    const normalized = normalizeEmail(raw)
    if (!normalized) return
    if (!EMAIL_REGEX.test(normalized)) return
    deduped.add(normalized)
  })
  return Array.from(deduped)
}

const getValidVariableIds = (value: unknown): ParameterId[] => {
  if (!Array.isArray(value)) return []
  const allowed = new Set<string>(AVAILABLE_VARIABLES.map((v) => v.id))
  return value.filter((id): id is ParameterId => typeof id === 'string' && allowed.has(id))
}

const getValidManualIds = (value: unknown): number[] => {
  if (!Array.isArray(value)) return []
  const deduped = new Set<number>()
  value.forEach((id) => {
    const numeric = typeof id === 'number' ? id : Number(id)
    if (Number.isFinite(numeric)) {
      deduped.add(numeric)
    }
  })
  return Array.from(deduped)
}

const getValidTimeRange = (value: unknown): number => {
  if (typeof value === 'number' && TIME_RANGES.some((range) => range.value === value)) {
    return value
  }
  return DEFAULT_TIME_RANGE
}

const loadPersistedTrendConfig = (): TrendScreenPersistedState | null => {
  if (!isBrowser()) return null
  try {
    const raw = localStorage.getItem(TREND_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return null

    const sanitizedVarIds = getValidVariableIds((parsed as Record<string, unknown>).selectedVarIds)
    const sanitizedManualIds = getValidManualIds(
      (parsed as Record<string, unknown>).selectedManualIds
    )
    const sanitizedRange = getValidTimeRange((parsed as Record<string, unknown>).timeRange)

    return {
      selectedVarIds: sanitizedVarIds.length ? sanitizedVarIds : DEFAULT_SELECTED_VAR_IDS,
      selectedManualIds: sanitizedManualIds,
      timeRange: sanitizedRange
    }
  } catch {
    return null
  }
}

const loadPersistedEmailList = (): string[] | null => {
  if (!isBrowser()) return null
  try {
    const raw = localStorage.getItem(EMAIL_STORAGE_KEY)
    if (raw === null) return null
    const parsed = JSON.parse(raw)
    return sanitizeEmailList(parsed)
  } catch {
    return null
  }
}

type TrendReportPersistedMeta = {
  subject: string
  note: string
  privateMode: boolean
}

const sanitizeReportMeta = (value: unknown): TrendReportPersistedMeta | null => {
  if (!value || typeof value !== 'object') return null
  const v = value as Record<string, unknown>
  const subject = typeof v.subject === 'string' ? v.subject : ''
  const note = typeof v.note === 'string' ? v.note : ''
  const privateMode = typeof v.privateMode === 'boolean' ? v.privateMode : false
  return { subject, note, privateMode }
}

const loadPersistedReportMeta = (): TrendReportPersistedMeta | null => {
  if (!isBrowser()) return null
  try {
    const raw = localStorage.getItem(REPORT_META_STORAGE_KEY)
    if (raw === null) return null
    const parsed = JSON.parse(raw)
    return sanitizeReportMeta(parsed)
  } catch {
    return null
  }
}

const persistTrendConfig = (config: TrendScreenPersistedState): void => {
  if (!isBrowser()) return
  try {
    localStorage.setItem(TREND_STORAGE_KEY, JSON.stringify(config))
  } catch (err) {
    console.warn('Failed to persist trend configuration', err)
  }
}

const persistEmailList = (emails: string[]): void => {
  if (!isBrowser()) return
  try {
    localStorage.setItem(EMAIL_STORAGE_KEY, JSON.stringify(emails))
  } catch (err) {
    console.warn('Failed to persist email list for report', err)
  }
}

const persistReportMeta = (meta: TrendReportPersistedMeta): void => {
  if (!isBrowser()) return
  try {
    localStorage.setItem(REPORT_META_STORAGE_KEY, JSON.stringify(meta))
  } catch (err) {
    console.warn('Failed to persist report metadata', err)
  }
}

const DEFAULT_DEVICE_ID: DeviceId = 'drive_avid'

export const useTrendScreenState = () => {
  const storedConfig = useMemo(() => loadPersistedTrendConfig(), [])
  const storedEmails = useMemo(() => loadPersistedEmailList(), [])
  const storedReportMeta = useMemo(() => loadPersistedReportMeta(), [])

  // Base state
  const [selectedVarIds, setSelectedVarIds] = useState<ParameterId[]>(
    storedConfig?.selectedVarIds ?? DEFAULT_SELECTED_VAR_IDS
  )
  const [timeRange, setTimeRange] = useState<number>(storedConfig?.timeRange ?? DEFAULT_TIME_RANGE)
  const [activePanel, setActivePanel] = useState<'none' | 'variables' | 'manual' | 'report'>('none')

  // Derived states for backward compatibility
  const isConfigOpen = activePanel === 'variables'
  const isReportOpen = activePanel === 'report'
  const isManualPanelOpen = activePanel === 'manual'

  const setIsConfigOpen = (val: boolean | ((prev: boolean) => boolean)): void => {
    const next = typeof val === 'function' ? val(activePanel === 'variables') : val
    setActivePanel(next ? 'variables' : 'none')
  }

  const setIsReportOpen = (val: boolean | ((prev: boolean) => boolean)): void => {
    const next = typeof val === 'function' ? val(activePanel === 'report') : val
    setActivePanel(next ? 'report' : 'none')
  }

  const setIsManualPanelOpen = (val: boolean | ((prev: boolean) => boolean)): void => {
    const next = typeof val === 'function' ? val(activePanel === 'manual') : val
    setActivePanel(next ? 'manual' : 'none')
  }

  // Report state
  const [emailList, setEmailList] = useState<string[]>(storedEmails ?? ['admin@plant.com'])
  const [newEmail, setNewEmailValue] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [reportSubject, setReportSubject] = useState<string>(storedReportMeta?.subject ?? '')
  const [reportNote, setReportNote] = useState<string>(storedReportMeta?.note ?? '')
  const [privateMode, setPrivateMode] = useState<boolean>(storedReportMeta?.privateMode ?? false)

  // Manual trend state
  const [manualSeries, setManualSeries] = useState<ManualTrendSeries[]>([])
  const [selectedManualIds, setSelectedManualIds] = useState<number[]>(
    storedConfig?.selectedManualIds ?? []
  )
  const [hasLoadedManualSeries, setHasLoadedManualSeries] = useState(false)
  const [manualPoints, setManualPoints] = useState<ManualTrendPoint[]>([])
  const [manualPointsSeriesId, setManualPointsSeriesId] = useState<number | null>(null)
  const [isManualSubmitting, setIsManualSubmitting] = useState(false)
  const [manualMode, setManualMode] = useState<ManualMode>('existing')
  const [manualForm, setManualForm] = useState<ManualFormState>({
    seriesId: undefined,
    name: '',
    unit: '',
    color: MANUAL_COLORS[0],
    value: '',
    time: nowLocalInput(),
    note: '',
    createdBy: '',
    pointId: undefined
  })

  // Data hooks
  const { datasets: sensorDatasets, xDomain } = useTrendData(DEFAULT_DEVICE_ID, selectedVarIds, {
    windowMinutes: timeRange
  })

  const manualSelectedSeries = useMemo(
    () => manualSeries.filter((s) => selectedManualIds.includes(s.id)),
    [manualSeries, selectedManualIds]
  )

  const {
    datasets: manualDatasets,
    xDomain: manualXDomain,
    reload: reloadManualData
  } = useManualTrendData(manualSelectedSeries, {
    windowMinutes: timeRange
  })

  useEffect(() => {
    const loadSeries = async (): Promise<void> => {
      try {
        const list = await fetchManualSeries()
        setManualSeries(list)
        setHasLoadedManualSeries(true)
        if (list.length && manualPointsSeriesId === null) {
          setManualPointsSeriesId(list[0].id)
        }
      } catch (err) {
        console.error('Failed to load manual series', err)
      }
    }
    void loadSeries()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!hasLoadedManualSeries) return
    setSelectedManualIds((prev) => {
      if (!prev.length && !manualSeries.length) return prev
      const validSet = new Set(manualSeries.map((series) => series.id))
      const filtered = prev.filter((id) => validSet.has(id))
      return filtered.length === prev.length ? prev : filtered
    })
  }, [manualSeries, hasLoadedManualSeries])

  useEffect(() => {
    persistTrendConfig({ selectedVarIds, selectedManualIds, timeRange })
  }, [selectedVarIds, selectedManualIds, timeRange])

  useEffect(() => {
    persistEmailList(emailList)
  }, [emailList])

  useEffect(() => {
    persistReportMeta({ subject: reportSubject, note: reportNote, privateMode })
  }, [reportSubject, reportNote, privateMode])

  // Handlers
  const handleToggleVar = (id: ParameterId): void => {
    setSelectedVarIds((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]))
  }

  const handleToggleManualSeries = (id: number): void => {
    setSelectedManualIds((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    )
  }

  const loadManualPoints = useCallback(
    async (seriesId: number): Promise<void> => {
      try {
        const res = await fetchManualHistory({ seriesId, limit: 200, windowMinutes: timeRange })
        setManualPoints(res.points)
        setManualPointsSeriesId(seriesId)
      } catch (err) {
        console.error('Failed to load manual points', err)
      }
    },
    [timeRange]
  )

  const resetManualForm = (): void => {
    setManualMode('new')
    setManualForm({
      seriesId: undefined,
      name: '',
      unit: '',
      color: MANUAL_COLORS[0],
      value: '',
      time: nowLocalInput(),
      note: '',
      createdBy: '',
      pointId: undefined
    })
  }

  const handleManualSubmit = async (): Promise<void> => {
    try {
      setIsManualSubmitting(true)

      let targetSeriesId = manualMode === 'existing' ? manualForm.seriesId : undefined

      if (!manualForm.value) {
        setIsManualSubmitting(false)
        return
      }

      if (manualMode === 'new') {
        if (!manualForm.name.trim()) {
          setIsManualSubmitting(false)
          return
        }

        const targetId = manualForm.seriesId
        if (targetId) {
          // Update existing series
          await updateManualSeries({
            seriesId: targetId,
            name: manualForm.name.trim(),
            unit: manualForm.unit || undefined,
            color: manualForm.color
          })
          const updatedList = await fetchManualSeries()
          setManualSeries(updatedList)
          targetSeriesId = targetId
        } else {
          // Create new series
          const created = await createManualSeries({
            name: manualForm.name.trim(),
            unit: manualForm.unit || undefined,
            color: manualForm.color
          })
          targetSeriesId = created.id
          setManualSeries((prev) => [...prev, created])
        }
      }

      if (!targetSeriesId) {
        setIsManualSubmitting(false)
        return
      }

      setManualPointsSeriesId(targetSeriesId)

      const payload = {
        seriesId: targetSeriesId,
        value: Number(manualForm.value),
        time: manualForm.time ? new Date(manualForm.time).toISOString() : undefined,
        note: manualForm.note || undefined,
        created_by: manualForm.createdBy || undefined
      }

      if (manualForm.pointId) {
        await updateManualPoint({ pointId: manualForm.pointId, ...payload })
        console.debug('[TrendScreen] manual point updated', {
          pointId: manualForm.pointId,
          payload
        })
      } else {
        const created = await createManualPoint(payload)
        console.debug('[TrendScreen] manual point created', created)
      }

      if (!selectedManualIds.includes(targetSeriesId)) {
        setSelectedManualIds((prev) => [...prev, targetSeriesId!])
      }

      await Promise.all([
        reloadManualData(),
        loadManualPoints(targetSeriesId),
        fetchManualSeries().then((list) => setManualSeries(list))
      ])

      resetManualForm()
    } catch (err) {
      console.error('Failed to save manual point', err)
    } finally {
      setIsManualSubmitting(false)
    }
  }

  const handleEditPoint = (point: ManualTrendPoint): void => {
    setManualMode('existing')
    setManualForm({
      seriesId: point.series_id,
      name: '',
      unit: '',
      color: manualSeries.find((s) => s.id === point.series_id)?.color || MANUAL_COLORS[0],
      value: String(point.value),
      time: formatLocalInputFromDate(new Date(point.time)),
      note: point.note || '',
      createdBy: point.created_by || '',
      pointId: point.id
    })
    if (!selectedManualIds.includes(point.series_id)) {
      setSelectedManualIds((prev) => [...prev, point.series_id])
    }
    setManualPointsSeriesId(point.series_id)
  }

  const handleDeletePoint = async (pointId: number): Promise<void> => {
    try {
      await deleteManualPoint(pointId)
      if (manualPointsSeriesId) {
        await Promise.all([loadManualPoints(manualPointsSeriesId), reloadManualData()])
      }
    } catch (err) {
      console.error('Failed to delete manual point', err)
    }
  }

  const handleEditSeries = (series: ManualTrendSeries): void => {
    setManualMode('new')
    setManualForm({
      seriesId: series.id,
      name: series.name,
      unit: series.unit || '',
      color: series.color,
      value: '',
      time: nowLocalInput(),
      note: '',
      createdBy: '',
      pointId: undefined
    })
  }

  const handleDeleteSeries = async (seriesId: number): Promise<void> => {
    try {
      await deleteManualSeries(seriesId)
      setSelectedManualIds((prev) => prev.filter((id) => id !== seriesId))
      setManualSeries((prev) => prev.filter((s) => s.id !== seriesId))
      if (manualPointsSeriesId === seriesId) {
        setManualPointsSeriesId(null)
        setManualPoints([])
      }
      await reloadManualData()
    } catch (err) {
      console.error('Failed to delete manual series', err)
    }
  }

  useEffect(() => {
    if (isManualPanelOpen && manualPointsSeriesId) {
      void loadManualPoints(manualPointsSeriesId)
    }
  }, [isManualPanelOpen, manualPointsSeriesId, loadManualPoints])

  const handleChangeNewEmail = (value: string): void => {
    setNewEmailValue(value)
    if (emailError) setEmailError(null)
  }

  const isNewEmailValid = useMemo(() => {
    const trimmed = newEmail.trim()
    if (!trimmed) return true
    return EMAIL_REGEX.test(normalizeEmail(trimmed))
  }, [newEmail])

  const handleAddEmail = (): void => {
    const normalized = normalizeEmail(newEmail)
    if (!normalized) {
      setEmailError('Email requerido')
      return
    }
    if (!EMAIL_REGEX.test(normalized)) {
      setEmailError('Invalid email')
      return
    }

    setEmailList((prev) => {
      const exists = prev.some((e) => normalizeEmail(e) === normalized)
      return exists ? prev : [...prev, normalized]
    })
    setNewEmailValue('')
    setEmailError(null)
  }

  const handleRemoveEmail = (email: string): void => {
    const normalized = normalizeEmail(email)
    setEmailList((prev) => prev.filter((e) => normalizeEmail(e) !== normalized))
  }

  const decoratedSensorDatasets = useMemo<ExtendedDataset[]>(
    () =>
      sensorDatasets.map((ds) => {
        const meta = AVAILABLE_VARIABLES.find((v) => v.id === ds.parameterId)
        return {
          ...ds,
          label: meta?.label || ds.label || ds.parameterId,
          unit: meta?.unit || ds.unit || null,
          borderColor: meta?.color || ds.borderColor
        }
      }),
    [sensorDatasets]
  )

  const decoratedManualDatasets = useMemo<ExtendedDataset[]>(
    () =>
      manualDatasets.map((ds) => ({
        ...ds,
        label: ds.label || 'Manual series',
        unit: ds.unit || null
      })),
    [manualDatasets]
  )

  const combinedDatasets = useMemo<ExtendedDataset[]>(
    () => [...decoratedSensorDatasets, ...decoratedManualDatasets],
    [decoratedSensorDatasets, decoratedManualDatasets]
  )

  const combinedXDomain = useMemo(() => {
    const maxs: number[] = []
    if (xDomain) {
      maxs.push(xDomain.max)
    }
    if (manualXDomain) {
      maxs.push(manualXDomain.max)
    }
    if (!maxs.length) return null
    const max = Math.max(...maxs)
    const min = max - timeRange * 60
    return { min, max }
  }, [xDomain, manualXDomain, timeRange])

  const currentValues: CurrentValueItem[] = useMemo(() => {
    return combinedDatasets.map((ds) => {
      const latest = ds.data.length > 0 ? ds.data[ds.data.length - 1].y : 0
      const unit =
        'parameterId' in ds
          ? AVAILABLE_VARIABLES.find((v) => v.id === ds.parameterId)?.unit
          : ds.unit
      const isManual = ds.isManual === true || !('parameterId' in ds)

      return {
        id: ds.label || ds.parameterId || 'manual',
        label:
          AVAILABLE_VARIABLES.find((v) => v.id === ds.parameterId)?.label ||
          ds.label ||
          ds.parameterId ||
          'manual',
        color: ds.borderColor,
        value: latest,
        unit,
        isManual
      }
    })
  }, [combinedDatasets])

  return {
    // base toggles
    timeRange,
    setTimeRange,
    isConfigOpen,
    setIsConfigOpen,
    isReportOpen,
    setIsReportOpen,
    isManualPanelOpen,
    setIsManualPanelOpen,

    // data
    selectedVarIds,
    handleToggleVar,
    sensorDatasets,
    xDomain,
    manualDatasets,
    manualXDomain,
    combinedDatasets,
    combinedXDomain,
    currentValues,

    // manual series
    manualSeries,
    selectedManualIds,
    handleToggleManualSeries,
    manualSelectedSeries,

    // manual points
    manualPoints,
    manualPointsSeriesId,
    setManualPointsSeriesId,
    loadManualPoints,
    isManualSubmitting,
    manualMode,
    setManualMode,
    manualForm,
    setManualForm,
    resetManualForm,
    handleManualSubmit,
    handleEditPoint,
    handleDeletePoint,
    handleEditSeries,
    handleDeleteSeries,

    // report/email
    emailList,
    newEmail,
    setNewEmail: handleChangeNewEmail,
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

    // meta
    reloadManualData
  }
}
