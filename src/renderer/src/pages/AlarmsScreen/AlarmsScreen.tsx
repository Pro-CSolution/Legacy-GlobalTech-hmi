import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import {
  AlertTriangle,
  Bell,
  BookOpen,
  ChevronDown,
  ChevronUp,
  History,
  RefreshCcw,
  Siren
} from 'lucide-react'
import { useTheme } from 'styled-components'
import { ScreenLayout } from 'layouts'
import ActionButton from 'components/ActionButton'
import Card from 'components/Card'
import { FaultCodeDetailModal } from 'components/FaultCodeDetailModal'
import { ManualModal } from 'components/ManualModal'
import Panel from 'components/Panel'
import {
  useAccessMode,
  useDeviceData,
  useIsViewportBelow,
  useMotorControlModePreference,
  usePreferredSingleMotorScope,
  useSendCommand,
  useTopBannerNotice
} from 'hooks'
import type { FaultCodeEntry, TripEvent } from 'services'
import { fetchTripEvents, getFaultCodesById } from 'services'
import { DeviceId } from 'types'
import { getMotorDriveDeviceId, type MotorScope } from 'utils/motorDeviceMapping'
import * as S from './AlarmsScreen.styles'
import alarmsManualPdfUrl from 'assets/manual/T1679EN Software Manual Rev 07 - Alarms Section.pdf?url'

const TRIP_HISTORY_LIMIT = 10

type TripHistoryRow = {
  slot: string
  code: number
  mostRecent: boolean
  occurredAt: string | null
}

const AlarmsScreen = () => {
  const { isViewOnly } = useAccessMode()
  const isViewportMobile = useIsViewportBelow(768)
  const isMobileViewOnly = isViewOnly && isViewportMobile
  const theme = useTheme()
  const motorOneDriveId = getMotorDriveDeviceId(1)
  const motorTwoDriveId = getMotorDriveDeviceId(2)
  const { data: motorOneDriveData } = useDeviceData(motorOneDriveId)
  const { data: motorTwoDriveData } = useDeviceData(motorTwoDriveId)
  const { executeAction } = useSendCommand()
  const { showNotice } = useTopBannerNotice()

  const tripsRef = useRef<HTMLDivElement | null>(null)
  const warningsRef = useRef<HTMLDivElement | null>(null)
  const historyRef = useRef<HTMLDivElement | null>(null)
  const scrollIntervalRef = useRef<number | null>(null)

  const [selectedMotor, setSelectedMotor] = useState<MotorScope>(1)
  const [isTripResetting, setIsTripResetting] = useState(false)
  const [faultCodesById, setFaultCodesById] = useState<Record<number, FaultCodeEntry>>({})
  const [selectedFaultCodeId, setSelectedFaultCodeId] = useState<number | null>(null)
  const [isManualOpen, setIsManualOpen] = useState(false)
  const [tripEventsByDriveId, setTripEventsByDriveId] = useState<Record<string, TripEvent[]>>({})
  const [motorControlMode] = useMotorControlModePreference()
  const singleMotorScope = usePreferredSingleMotorScope()
  const isDualMotorMode = motorControlMode === 'dual'
  const activeMotorScope: MotorScope = isDualMotorMode ? selectedMotor : singleMotorScope
  const selectedMotorLabel = `Motor #${activeMotorScope}`
  const selectedDriveId: DeviceId = activeMotorScope === 1 ? motorOneDriveId : motorTwoDriveId
  const selectedDriveData = activeMotorScope === 1 ? motorOneDriveData : motorTwoDriveData

  useEffect(() => {
    let alive = true
    getFaultCodesById()
      .then((map) => {
        if (alive) setFaultCodesById(map)
      })
      .catch(() => {
        // Non-fatal: UI still shows codes, just without metadata
      })
    return () => {
      alive = false
    }
  }, [])

  useEffect(() => {
    return () => {
      if (scrollIntervalRef.current) {
        window.clearInterval(scrollIntervalRef.current)
        scrollIntervalRef.current = null
      }
    }
  }, [])

  // Some drives/controllers may expose these codes scaled (x100) or as signed 16-bit.
  // Normalize to an integer fault code id compatible with fault_codes.json.
  const decodeFaultCode = useCallback((val: unknown): number => {
    const n = Number(val)
    if (!Number.isFinite(n)) return 0
    let v = Math.trunc(n)
    if (v < 0) v = v & 0xffff
    if (v > 999) v = Math.round(v / 100)
    return v > 0 ? v : 0
  }, [])

  const buildActiveTrips = useCallback(
    (driveData: typeof motorOneDriveData) => {
      const hasInfo = (code: number) => {
        const title = faultCodesById[code]?.title
        return typeof title === 'string' && title.trim().length > 0
      }
      const rows = [
        { slot: 'Trip 1', code: decodeFaultCode(driveData.trip1?.value), mostRecent: true },
        { slot: 'Trip 2', code: decodeFaultCode(driveData.trip2?.value), mostRecent: false },
        { slot: 'Trip 3', code: decodeFaultCode(driveData.trip3?.value), mostRecent: false },
        { slot: 'Trip 4', code: decodeFaultCode(driveData.trip4?.value), mostRecent: false },
        { slot: 'Trip 5', code: decodeFaultCode(driveData.trip5?.value), mostRecent: false }
      ]
      return rows.filter((r) => r.code > 0 && hasInfo(r.code))
    },
    [decodeFaultCode, faultCodesById]
  )

  const buildActiveWarnings = useCallback(
    (driveData: typeof motorOneDriveData) => {
      const hasInfo = (code: number) => {
        const title = faultCodesById[code]?.title
        return typeof title === 'string' && title.trim().length > 0
      }
      const rows = [
        { slot: 'Warning 1', code: decodeFaultCode(driveData.warning1?.value), mostRecent: true },
        { slot: 'Warning 2', code: decodeFaultCode(driveData.warning2?.value), mostRecent: false },
        { slot: 'Warning 3', code: decodeFaultCode(driveData.warning3?.value), mostRecent: false }
      ]
      return rows.filter((r) => r.code > 0 && hasInfo(r.code))
    },
    [decodeFaultCode, faultCodesById]
  )

  const buildTripHistory = useCallback(
    (driveData: typeof motorOneDriveData): TripHistoryRow[] => {
      const currentTripCode = decodeFaultCode(driveData.tripHistory1?.value)
      const currentTripHours = Math.max(0, Math.floor(Number(driveData.hoursSinceTrip?.value) || 0))
      const currentTripSeconds = Math.max(
        0,
        Math.floor(Number(driveData.secondsSinceTrip?.value) || 0)
      )
      const currentTripOccurredAt =
        currentTripCode > 0
          ? new Date(
              Date.now() - (currentTripHours * 3600 + currentTripSeconds) * 1000
            ).toISOString()
          : null

      return [
        {
          slot: 'History 1',
          code: currentTripCode,
          mostRecent: true,
          occurredAt: currentTripOccurredAt
        },
        {
          slot: 'History 2',
          code: decodeFaultCode(driveData.tripHistory2?.value),
          mostRecent: false,
          occurredAt: null
        },
        {
          slot: 'History 3',
          code: decodeFaultCode(driveData.tripHistory3?.value),
          mostRecent: false,
          occurredAt: null
        },
        {
          slot: 'History 4',
          code: decodeFaultCode(driveData.tripHistory4?.value),
          mostRecent: false,
          occurredAt: null
        },
        {
          slot: 'History 5',
          code: decodeFaultCode(driveData.tripHistory5?.value),
          mostRecent: false,
          occurredAt: null
        },
        {
          slot: 'History 6',
          code: decodeFaultCode(driveData.tripHistory6?.value),
          mostRecent: false,
          occurredAt: null
        },
        {
          slot: 'History 7',
          code: decodeFaultCode(driveData.tripHistory7?.value),
          mostRecent: false,
          occurredAt: null
        },
        {
          slot: 'History 8',
          code: decodeFaultCode(driveData.tripHistory8?.value),
          mostRecent: false,
          occurredAt: null
        },
        {
          slot: 'History 9',
          code: decodeFaultCode(driveData.tripHistory9?.value),
          mostRecent: false,
          occurredAt: null
        },
        {
          slot: 'History 10',
          code: decodeFaultCode(driveData.tripHistory10?.value),
          mostRecent: false,
          occurredAt: null
        }
      ]
    },
    [decodeFaultCode]
  )

  const attachTripEventTimes = useCallback((rows: TripHistoryRow[], tripEvents: TripEvent[]) => {
    const firstActiveRow = rows.find((row) => row.code > 0)
    if (!firstActiveRow || tripEvents.length === 0) {
      return rows
    }

    if (tripEvents[0].code !== firstActiveRow.code) {
      return rows
    }

    return rows.map((row, index) => {
      const event = tripEvents[index]
      if (row.code === 0 || !event || event.code !== row.code) {
        return row
      }

      return {
        ...row,
        occurredAt: event.time
      }
    })
  }, [])

  const motorOneActiveTrips = useMemo(
    () => buildActiveTrips(motorOneDriveData),
    [buildActiveTrips, motorOneDriveData]
  )

  const motorTwoActiveTrips = useMemo(
    () => buildActiveTrips(motorTwoDriveData),
    [buildActiveTrips, motorTwoDriveData]
  )

  const motorOneActiveWarnings = useMemo(
    () => buildActiveWarnings(motorOneDriveData),
    [buildActiveWarnings, motorOneDriveData]
  )

  const motorTwoActiveWarnings = useMemo(
    () => buildActiveWarnings(motorTwoDriveData),
    [buildActiveWarnings, motorTwoDriveData]
  )

  const activeTrips = useMemo(
    () => buildActiveTrips(selectedDriveData),
    [buildActiveTrips, selectedDriveData]
  )

  const activeWarnings = useMemo(
    () => buildActiveWarnings(selectedDriveData),
    [buildActiveWarnings, selectedDriveData]
  )

  const rawTripHistory = useMemo(
    () => buildTripHistory(selectedDriveData),
    [buildTripHistory, selectedDriveData]
  )
  const hasTripHistory = useMemo(() => rawTripHistory.some((row) => row.code > 0), [rawTripHistory])
  const tripHistorySignature = useMemo(
    () => rawTripHistory.map((row) => String(row.code)).join('|'),
    [rawTripHistory]
  )
  const tripHistory = useMemo(
    () => attachTripEventTimes(rawTripHistory, tripEventsByDriveId[selectedDriveId] ?? []),
    [attachTripEventTimes, rawTripHistory, selectedDriveId, tripEventsByDriveId]
  )

  useEffect(() => {
    if (!hasTripHistory) {
      setTripEventsByDriveId((prev) => {
        const current = prev[selectedDriveId] ?? []
        if (current.length === 0) {
          return prev
        }

        return {
          ...prev,
          [selectedDriveId]: []
        }
      })
      return
    }

    let cancelled = false

    const loadTripEvents = async () => {
      try {
        const events = await fetchTripEvents({
          deviceId: selectedDriveId,
          limit: TRIP_HISTORY_LIMIT
        })
        if (cancelled) return

        setTripEventsByDriveId((prev) => ({
          ...prev,
          [selectedDriveId]: events
        }))
      } catch {
        if (cancelled) return

        setTripEventsByDriveId((prev) => ({
          ...prev,
          [selectedDriveId]: []
        }))
      }
    }

    void loadTripEvents()
    const retryTimer = window.setTimeout(() => {
      void loadTripEvents()
    }, 2500)

    return () => {
      cancelled = true
      window.clearTimeout(retryTimer)
    }
  }, [hasTripHistory, selectedDriveId, tripHistorySignature])

  const activeTripsCount = activeTrips.length
  const activeWarningsCount = activeWarnings.length

  const hoursSinceTrip = Math.max(
    0,
    Math.floor(Number(selectedDriveData.hoursSinceTrip?.value) || 0)
  )
  const secondsSinceTrip = Math.max(
    0,
    Math.floor(Number(selectedDriveData.secondsSinceTrip?.value) || 0)
  )
  const minutes = Math.floor((secondsSinceTrip % 3600) / 60)
  const seconds = secondsSinceTrip % 60
  const pad2 = (n: number) => String(n).padStart(2, '0')
  const lastTripAgeText = `${hoursSinceTrip}:${pad2(minutes)}:${pad2(seconds)}`
  const motorAlarmLights: Record<1 | 2, boolean> = {
    1: motorOneActiveTrips.length > 0 || motorOneActiveWarnings.length > 0,
    2: motorTwoActiveTrips.length > 0 || motorTwoActiveWarnings.length > 0
  }
  const overviewHeaderMeta = isDualMotorMode
    ? `${selectedMotorLabel} - Trips, warnings, and history`
    : `${activeTripsCount} trips - ${activeWarningsCount} warnings`
  const overviewHeaderRight = isDualMotorMode ? (
    <S.HeaderRightLayout>
      <S.HeaderCenterControls>
        <S.HeaderMotorSelector>
          <S.HeaderMotorOption>
            <S.HeaderMotorButton
              type="button"
              $active={selectedMotor === 2}
              onClick={() => setSelectedMotor(2)}
            >
              Motor #2
            </S.HeaderMotorButton>
            <S.HeaderAlarmLight
              $active={motorAlarmLights[2]}
              aria-label={motorAlarmLights[2] ? 'Motor 2 alarm active' : 'Motor 2 alarm inactive'}
              title={motorAlarmLights[2] ? 'Motor #2 alarm active' : 'Motor #2 alarm inactive'}
            />
          </S.HeaderMotorOption>

          <S.HeaderMotorOption>
            <S.HeaderMotorButton
              type="button"
              $active={selectedMotor === 1}
              onClick={() => setSelectedMotor(1)}
            >
              Motor #1
            </S.HeaderMotorButton>
            <S.HeaderAlarmLight
              $active={motorAlarmLights[1]}
              aria-label={motorAlarmLights[1] ? 'Motor 1 alarm active' : 'Motor 1 alarm inactive'}
              title={motorAlarmLights[1] ? 'Motor #1 alarm active' : 'Motor #1 alarm inactive'}
            />
          </S.HeaderMotorOption>
        </S.HeaderMotorSelector>
      </S.HeaderCenterControls>

      <S.HeaderRightInfo>
        <S.HeaderMetaText>{overviewHeaderMeta}</S.HeaderMetaText>
      </S.HeaderRightInfo>
    </S.HeaderRightLayout>
  ) : (
    overviewHeaderMeta
  )

  const openFaultDetails = (code: number) => {
    if (code <= 0) return
    setSelectedFaultCodeId(code)
  }

  const getFaultTitle = useCallback(
    (code: number) => {
      if (code <= 0) return '-'
      const title = faultCodesById[code]?.title
      return title && title.trim().length ? title : `Code ${code}`
    },
    [faultCodesById]
  )

  const getRowHint = (code: number, isMostRecent: boolean, emptyLabel: string) => {
    if (code === 0) return emptyLabel
    return isMostRecent ? `Most recent Â· CODE: ${code}` : `CODE: ${code}`
  }

  const formatTripTimestamp = (value: string | null) => {
    if (!value) return '--'

    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) {
      return '--'
    }

    const dateText = parsed.toLocaleDateString()
    const timeText = parsed.toLocaleTimeString([], {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    })
    return `${dateText} ${timeText}`
  }

  const formatTripHistoryText = (code: number, occurredAt: string | null) => {
    if (code === 0) return '-'

    const tripName = getFaultTitle(code)
    const happenedAt = formatTripTimestamp(occurredAt)

    return happenedAt === '--' ? tripName : `${tripName} ${happenedAt}`
  }

  const startScroll = (ref: RefObject<HTMLDivElement | null>, direction: 'up' | 'down') => {
    if (scrollIntervalRef.current) return
    const step = direction === 'up' ? -60 : 60
    const tick = () => {
      if (ref.current) ref.current.scrollBy({ top: step, behavior: 'auto' })
    }
    tick()
    scrollIntervalRef.current = window.setInterval(tick, 50)
  }

  const stopScroll = () => {
    if (scrollIntervalRef.current) {
      window.clearInterval(scrollIntervalRef.current)
      scrollIntervalRef.current = null
    }
  }

  const handleTripReset = async () => {
    if (isTripResetting) return
    setIsTripResetting(true)
    try {
      const sent = await executeAction({
        deviceId: selectedDriveId,
        actionName: 'trip-reset-direct',
        parameters: { pulseMs: 500 }
      })
      if (!sent) throw new Error('Failed to trigger trip reset')

      showNotice({ tone: 'success', message: 'Direct trip reset pulse sent' }, 3500)
    } catch (err) {
      const message = (err as Error)?.message || 'Trip reset failed'
      showNotice({ tone: 'error', message }, 3500)
    } finally {
      setTimeout(() => setIsTripResetting(false), 500)
    }
  }

  return (
    <ScreenLayout>
      <S.MainContainer>
        {/* Overview */}
        <Panel
          position={isMobileViewOnly ? undefined : { left: 20, top: 5 }}
          width={isMobileViewOnly ? '100%' : 1880}
          height={isMobileViewOnly ? 'auto' : 180}
        >
          <Card title="Overview" icon={Bell} headerRight={overviewHeaderRight}>
            <S.SummaryLayout>
              <S.Metrics>
                <S.Metric>
                  <S.MetricLabel>Active Trips</S.MetricLabel>
                  <S.MetricValue>{activeTripsCount}</S.MetricValue>
                </S.Metric>
                <S.Metric>
                  <S.MetricLabel>Active Warnings</S.MetricLabel>
                  <S.MetricValue>{activeWarningsCount}</S.MetricValue>
                </S.Metric>
                <S.Metric>
                  <S.MetricLabel>Last Trip Age</S.MetricLabel>
                  <S.MetricValueCompact>{lastTripAgeText}</S.MetricValueCompact>
                </S.Metric>
              </S.Metrics>
              <S.Actions>
                <S.ActionsRow>
                  <ActionButton
                    label={isTripResetting ? 'TRIP RESETTING...' : 'TRIP RESET'}
                    color="yellow"
                    icon={RefreshCcw}
                    height="64px"
                    width={200}
                    disabled={isViewOnly || isTripResetting}
                    onClick={handleTripReset}
                  />
                  <ActionButton
                    label="OPEN MANUAL"
                    color="slate"
                    icon={BookOpen}
                    height="64px"
                    width={200}
                    onClick={() => setIsManualOpen(true)}
                  />
                </S.ActionsRow>
              </S.Actions>
            </S.SummaryLayout>
          </Card>
        </Panel>

        {/* Tables */}
        <Panel
          position={isMobileViewOnly ? undefined : { left: 20, top: 205 }}
          width={isMobileViewOnly ? '100%' : 610}
          height={isMobileViewOnly ? 'auto' : 645}
        >
          <Card title="Active Trips" icon={Siren} titleColor={theme.colors.status.alarm}>
            <S.ScrollLayout>
              <S.ScrollButton
                onMouseDown={() => startScroll(tripsRef, 'up')}
                onMouseUp={stopScroll}
                onMouseLeave={stopScroll}
                onTouchStart={() => startScroll(tripsRef, 'up')}
                onTouchEnd={stopScroll}
                onTouchCancel={stopScroll}
              >
                <ChevronUp />
              </S.ScrollButton>

              <S.ScrollViewport ref={tripsRef}>
                {activeTrips.length === 0 ? (
                  <S.TableEmpty>No active trips</S.TableEmpty>
                ) : (
                  activeTrips.map((row) => {
                    const title = getFaultTitle(row.code)
                    return (
                      <S.TableRowButton key={row.slot} onClick={() => openFaultDetails(row.code)}>
                        <S.RowLeft>
                          <S.RowSlot>{row.slot}</S.RowSlot>
                          <S.RowCode title={title}>{title}</S.RowCode>
                        </S.RowLeft>
                        <S.RowHint>{getRowHint(row.code, row.mostRecent, 'Empty')}</S.RowHint>
                      </S.TableRowButton>
                    )
                  })
                )}
              </S.ScrollViewport>

              <S.ScrollButton
                onMouseDown={() => startScroll(tripsRef, 'down')}
                onMouseUp={stopScroll}
                onMouseLeave={stopScroll}
                onTouchStart={() => startScroll(tripsRef, 'down')}
                onTouchEnd={stopScroll}
                onTouchCancel={stopScroll}
              >
                <ChevronDown />
              </S.ScrollButton>
            </S.ScrollLayout>
          </Card>
        </Panel>

        <Panel
          position={isMobileViewOnly ? undefined : { left: 650, top: 205 }}
          width={isMobileViewOnly ? '100%' : 610}
          height={isMobileViewOnly ? 'auto' : 645}
        >
          <Card
            title="Active Warnings"
            icon={AlertTriangle}
            titleColor={theme.colors.status.warning}
          >
            <S.ScrollLayout>
              <S.ScrollButton
                onMouseDown={() => startScroll(warningsRef, 'up')}
                onMouseUp={stopScroll}
                onMouseLeave={stopScroll}
                onTouchStart={() => startScroll(warningsRef, 'up')}
                onTouchEnd={stopScroll}
                onTouchCancel={stopScroll}
              >
                <ChevronUp />
              </S.ScrollButton>

              <S.ScrollViewport ref={warningsRef}>
                {activeWarnings.length === 0 ? (
                  <S.TableEmpty>No active warnings</S.TableEmpty>
                ) : (
                  activeWarnings.map((row) => {
                    const title = getFaultTitle(row.code)
                    return (
                      <S.TableRowButton key={row.slot} onClick={() => openFaultDetails(row.code)}>
                        <S.RowLeft>
                          <S.RowSlot>{row.slot}</S.RowSlot>
                          <S.RowCode title={title}>{title}</S.RowCode>
                        </S.RowLeft>
                        <S.RowHint>{getRowHint(row.code, row.mostRecent, 'Empty')}</S.RowHint>
                      </S.TableRowButton>
                    )
                  })
                )}
              </S.ScrollViewport>

              <S.ScrollButton
                onMouseDown={() => startScroll(warningsRef, 'down')}
                onMouseUp={stopScroll}
                onMouseLeave={stopScroll}
                onTouchStart={() => startScroll(warningsRef, 'down')}
                onTouchEnd={stopScroll}
                onTouchCancel={stopScroll}
              >
                <ChevronDown />
              </S.ScrollButton>
            </S.ScrollLayout>
          </Card>
        </Panel>

        <Panel
          position={isMobileViewOnly ? undefined : { left: 1280, top: 205 }}
          width={isMobileViewOnly ? '100%' : 610}
          height={isMobileViewOnly ? 'auto' : 645}
        >
          <Card title="Trip History" icon={History} titleColor={theme.colors.accent.primary}>
            <S.ScrollLayout>
              <S.ScrollButton
                onMouseDown={() => startScroll(historyRef, 'up')}
                onMouseUp={stopScroll}
                onMouseLeave={stopScroll}
                onTouchStart={() => startScroll(historyRef, 'up')}
                onTouchEnd={stopScroll}
                onTouchCancel={stopScroll}
              >
                <ChevronUp />
              </S.ScrollButton>

              <S.ScrollViewport ref={historyRef}>
                {tripHistory.map((row) => (
                  <S.TableRowButton
                    key={row.slot}
                    onClick={() => openFaultDetails(row.code)}
                    disabled={row.code === 0}
                  >
                    <S.RowLeft>
                      <S.RowSlot>{row.slot}</S.RowSlot>
                      <S.RowCode
                        $compact
                        $isEmpty={row.code === 0}
                        title={
                          row.code === 0
                            ? undefined
                            : formatTripHistoryText(row.code, row.occurredAt)
                        }
                      >
                        {formatTripHistoryText(row.code, row.occurredAt)}
                      </S.RowCode>
                    </S.RowLeft>
                  </S.TableRowButton>
                ))}
              </S.ScrollViewport>

              <S.ScrollButton
                onMouseDown={() => startScroll(historyRef, 'down')}
                onMouseUp={stopScroll}
                onMouseLeave={stopScroll}
                onTouchStart={() => startScroll(historyRef, 'down')}
                onTouchEnd={stopScroll}
                onTouchCancel={stopScroll}
              >
                <ChevronDown />
              </S.ScrollButton>
            </S.ScrollLayout>
          </Card>
        </Panel>

        <FaultCodeDetailModal
          isOpen={selectedFaultCodeId !== null}
          faultCodeId={selectedFaultCodeId}
          faultCode={selectedFaultCodeId ? faultCodesById[selectedFaultCodeId] || null : null}
          onClose={() => setSelectedFaultCodeId(null)}
        />

        <ManualModal
          isOpen={isManualOpen}
          onClose={() => setIsManualOpen(false)}
          fileUrl={alarmsManualPdfUrl}
          title="Alarms Manual"
        />
      </S.MainContainer>
    </ScreenLayout>
  )
}

export default AlarmsScreen
