import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import {
  AlertTriangle,
  Bell,
  BookOpen,
  ChevronDown,
  ChevronUp,
  History,
  RefreshCcw,
  Siren,
  X
} from 'lucide-react'
import { useTheme } from 'styled-components'
import { ScreenLayout } from 'layouts'
import ActionButton from 'components/ActionButton'
import Card from 'components/Card'
import { FaultCodeDetailModal } from 'components/FaultCodeDetailModal'
import { PdfViewer } from 'components/PdfViewer'
import Panel from 'components/Panel'
import { ModalBase } from 'components/Modal'
import { useDeviceData, useSendCommand } from 'hooks'
import type { FaultCodeEntry } from 'services'
import { getFaultCodesById } from 'services'
import { DeviceId } from 'types'
import * as S from './AlarmsScreen.styles'
import alarmsManualPdfUrl from 'assets/manual/T1679EN Software Manual Rev 07 - Alarms Section.pdf?url'

const AlarmsScreen = () => {
  const theme = useTheme()
  const driveId: DeviceId = 'drive_avid'
  const { data: driveData } = useDeviceData(driveId)
  const { writeParameter } = useSendCommand()

  const tripsRef = useRef<HTMLDivElement | null>(null)
  const warningsRef = useRef<HTMLDivElement | null>(null)
  const historyRef = useRef<HTMLDivElement | null>(null)
  const scrollIntervalRef = useRef<number | null>(null)

  const [isTripResetting, setIsTripResetting] = useState(false)
  const [pulseToast, setPulseToast] = useState<{
    tone: 'success' | 'error'
    message: string
  } | null>(null)
  const [faultCodesById, setFaultCodesById] = useState<Record<number, FaultCodeEntry>>({})
  const [selectedFaultCodeId, setSelectedFaultCodeId] = useState<number | null>(null)
  const [isManualOpen, setIsManualOpen] = useState(false)

  useEffect(() => {
    if (!pulseToast) return undefined
    const t = setTimeout(() => setPulseToast(null), 3500)
    return () => clearTimeout(t)
  }, [pulseToast])

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

  const activeTrips = useMemo(() => {
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
  }, [driveData, decodeFaultCode, faultCodesById])

  const activeWarnings = useMemo(() => {
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
  }, [driveData, decodeFaultCode, faultCodesById])

  const tripHistory = useMemo(() => {
    return [
      { slot: 'History 1', code: decodeFaultCode(driveData.tripHistory1?.value), mostRecent: true },
      {
        slot: 'History 2',
        code: decodeFaultCode(driveData.tripHistory2?.value),
        mostRecent: false
      },
      {
        slot: 'History 3',
        code: decodeFaultCode(driveData.tripHistory3?.value),
        mostRecent: false
      },
      {
        slot: 'History 4',
        code: decodeFaultCode(driveData.tripHistory4?.value),
        mostRecent: false
      },
      {
        slot: 'History 5',
        code: decodeFaultCode(driveData.tripHistory5?.value),
        mostRecent: false
      },
      {
        slot: 'History 6',
        code: decodeFaultCode(driveData.tripHistory6?.value),
        mostRecent: false
      },
      {
        slot: 'History 7',
        code: decodeFaultCode(driveData.tripHistory7?.value),
        mostRecent: false
      },
      {
        slot: 'History 8',
        code: decodeFaultCode(driveData.tripHistory8?.value),
        mostRecent: false
      },
      {
        slot: 'History 9',
        code: decodeFaultCode(driveData.tripHistory9?.value),
        mostRecent: false
      },
      {
        slot: 'History 10',
        code: decodeFaultCode(driveData.tripHistory10?.value),
        mostRecent: false
      }
    ]
  }, [driveData, decodeFaultCode])

  const activeTripsCount = activeTrips.length
  const activeWarningsCount = activeWarnings.length

  const hoursSinceTrip = Math.max(0, Math.floor(Number(driveData.hoursSinceTrip?.value) || 0))
  const secondsSinceTrip = Math.max(0, Math.floor(Number(driveData.secondsSinceTrip?.value) || 0))
  const minutes = Math.floor((secondsSinceTrip % 3600) / 60)
  const seconds = secondsSinceTrip % 60
  const pad2 = (n: number) => String(n).padStart(2, '0')
  const lastTripAgeText = `${hoursSinceTrip}:${pad2(minutes)}:${pad2(seconds)}`

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
    return isMostRecent ? `Most recent · CODE: ${code}` : `CODE: ${code}`
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
    setPulseToast(null)
    setIsTripResetting(true)
    try {
      const wroteHigh = await writeParameter({
        deviceId: driveId,
        parameterId: 'P10.34',
        value: 1
      })
      if (!wroteHigh) throw new Error('Failed to trigger trip reset')

      await new Promise<void>((resolve) => setTimeout(resolve, 500))

      await writeParameter({
        deviceId: driveId,
        parameterId: 'P10.34',
        value: 0
      })

      setPulseToast({ tone: 'success', message: 'Trip reset pulse sent' })
    } catch (err) {
      const message = (err as Error)?.message || 'Trip reset failed'
      setPulseToast({ tone: 'error', message })
    } finally {
      setTimeout(() => setIsTripResetting(false), 500)
    }
  }

  return (
    <ScreenLayout>
      <S.MainContainer>
        {/* Overview */}
        <Panel position={{ left: 20, top: 5 }} width={1880} height={180}>
          <Card title="Overview" icon={Bell}>
            <S.SummaryLayout>
              <S.Metrics>
                <S.Metric>
                  <S.MetricLabel>Active Trips</S.MetricLabel>
                  <S.MetricValue>{activeTripsCount}</S.MetricValue>
                  <S.MetricSubValue>Slots P10.10–P10.14</S.MetricSubValue>
                </S.Metric>
                <S.Metric>
                  <S.MetricLabel>Active Warnings</S.MetricLabel>
                  <S.MetricValue>{activeWarningsCount}</S.MetricValue>
                  <S.MetricSubValue>Slots P10.00–P10.02</S.MetricSubValue>
                </S.Metric>
                <S.Metric>
                  <S.MetricLabel>Last Trip Age</S.MetricLabel>
                  <S.MetricValueCompact>{lastTripAgeText}</S.MetricValueCompact>
                  <S.MetricSubValue>H:MM:SS</S.MetricSubValue>
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
                    disabled={isTripResetting}
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
                {pulseToast && <S.Toast $tone={pulseToast.tone}>{pulseToast.message}</S.Toast>}
              </S.Actions>
            </S.SummaryLayout>
          </Card>
        </Panel>

        {/* Tables */}
        <Panel position={{ left: 20, top: 205 }} width={610} height={645}>
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

        <Panel position={{ left: 650, top: 205 }} width={610} height={645}>
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

        <Panel position={{ left: 1280, top: 205 }} width={610} height={645}>
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
                        $isEmpty={row.code === 0}
                        title={row.code === 0 ? undefined : getFaultTitle(row.code)}
                      >
                        {row.code === 0 ? '-' : getFaultTitle(row.code)}
                      </S.RowCode>
                    </S.RowLeft>
                    <S.RowHint>{getRowHint(row.code, row.mostRecent, 'Empty')}</S.RowHint>
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

        <ModalBase
          isOpen={isManualOpen}
          onRequestClose={() => setIsManualOpen(false)}
          width={1240}
          ariaLabel="Alarms manual"
        >
          <S.ManualModalBody>
            <S.ManualModalHeader>
              <S.ManualModalTitle>Alarms Manual</S.ManualModalTitle>
              <S.ManualModalClose onClick={() => setIsManualOpen(false)} aria-label="Close manual">
                <X size={22} />
              </S.ManualModalClose>
            </S.ManualModalHeader>
            <S.ManualModalContent>
              {isManualOpen && <PdfViewer fileUrl={alarmsManualPdfUrl} initialPage={1} />}
            </S.ManualModalContent>
          </S.ManualModalBody>
        </ModalBase>
      </S.MainContainer>
    </ScreenLayout>
  )
}

export default AlarmsScreen
