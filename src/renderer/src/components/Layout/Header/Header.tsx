import { BellRing, Settings, Circle, Square, CheckCircle2, AlertTriangle } from 'lucide-react'
import { useNavigate } from 'react-router'
import React, { useState, useEffect } from 'react'
import {
  useCurrentTime,
  useDeviceData,
  useMotorControlModePreference,
  useSystemTimeZone,
  useTopBannerNotice
} from 'hooks'
import { useScreenRecorder } from 'hooks/useScreenRecorder'
import { useReportSendStatus } from 'hooks/useReportSendStatus'
import { VideoReportModal } from '../../Modals/VideoReportModal/VideoReportModal'
import {
  CLIENT_MOTOR_INFO_STORAGE_KEY,
  CLIENT_MOTOR_INFO_UPDATED_EVENT,
  DEFAULT_CLIENT_MOTOR_INFO,
  loadClientMotorInfo
} from 'utils/clientMotorInfoStorage'
import {
  getMotorDriveDeviceId,
  getMotorWagoDeviceId,
  resolvePreferredSingleMotorScope
} from 'utils/motorDeviceMapping'
import conviewLogo from 'assets/images/logo-transparent.png'
import {
  HeaderContainer,
  LeftSection,
  Badge,
  BadgeLabel,
  BadgeValue,
  BrandGroup,
  BrandImageWrap,
  BrandImage,
  HeaderNoticeDock,
  RightSection,
  TimeBlock,
  AlarmButton,
  AlarmIconWrap,
  AlarmInfo,
  AlarmCounts,
  AlarmAge,
  Time,
  DateText,
  CommGroup,
  CommPill,
  CommDot,
  CommText,
  CommTitle,
  CommValue,
  CommSub,
  ConfigButton,
  RecordButton,
  SendStatusPill,
  SendSpinner,
  SendStatusText,
  SendStatusTitle,
  SendStatusMsg,
  HeaderNoticePill,
  HeaderNoticeText
} from './Header.styles'

const Header = () => {
  const navigate = useNavigate()
  const currentTime = useCurrentTime()
  const { timeZone, compactTimeZoneLabel } = useSystemTimeZone()
  const [motorControlMode] = useMotorControlModePreference()
  const motorOneDriveId = getMotorDriveDeviceId(1)
  const motorOneWagoId = getMotorWagoDeviceId(1)
  const motorTwoDriveId = getMotorDriveDeviceId(2)
  const motorTwoWagoId = getMotorWagoDeviceId(2)
  const {
    data: motorOneDriveData,
    raw: motorOneDriveRaw,
    isConnected: socketConnected
  } = useDeviceData(motorOneDriveId)
  const { raw: motorOneWagoRaw } = useDeviceData(motorOneWagoId)
  const { data: motorTwoDriveData, raw: motorTwoDriveRaw } = useDeviceData(motorTwoDriveId)
  const { raw: motorTwoWagoRaw } = useDeviceData(motorTwoWagoId)
  const singleMotorScope = resolvePreferredSingleMotorScope({
    1: {
      driveConnected: Boolean(motorOneDriveRaw['__connected']),
      wagoConnected: Boolean(motorOneWagoRaw['__connected'])
    },
    2: {
      driveConnected: Boolean(motorTwoDriveRaw['__connected']),
      wagoConnected: Boolean(motorTwoWagoRaw['__connected'])
    }
  })
  const selectedSingleDriveData = singleMotorScope === 2 ? motorTwoDriveData : motorOneDriveData
  const selectedSingleDriveRaw = singleMotorScope === 2 ? motorTwoDriveRaw : motorOneDriveRaw
  const selectedSingleWagoRaw = singleMotorScope === 2 ? motorTwoWagoRaw : motorOneWagoRaw

  const {
    isRecording,
    recordedBlob,
    startRecording,
    stopRecording,
    clearRecording,
    elapsedSeconds,
    maxDuration,
    maxDurationReached
  } = useScreenRecorder()
  const sendStatus = useReportSendStatus()
  const { notice } = useTopBannerNotice()
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [driveModel, setDriveModel] = useState(DEFAULT_CLIENT_MOTOR_INFO.model)

  const driveConnected = socketConnected && Boolean(selectedSingleDriveRaw['__connected'])
  const wagoConnected = socketConnected && Boolean(selectedSingleWagoRaw['__connected'])

  const driveLastOkTs =
    typeof selectedSingleDriveRaw['__lastOkTs'] === 'string'
      ? selectedSingleDriveRaw['__lastOkTs']
      : null
  const wagoLastOkTs =
    typeof selectedSingleWagoRaw['__lastOkTs'] === 'string'
      ? selectedSingleWagoRaw['__lastOkTs']
      : null

  const fmt = (ts: string | null) => {
    if (!ts) return '--'
    const d = new Date(ts)
    return Number.isNaN(d.getTime()) ? '--' : d.toLocaleTimeString([], { hour12: false })
  }

  const commMode: 'ok' | 'partial' | 'off' =
    driveConnected && wagoConnected ? 'ok' : !driveConnected && !wagoConnected ? 'off' : 'partial'

  const toNumber = (val: unknown): number => {
    const n = Number(val)
    return Number.isFinite(n) ? n : 0
  }

  const getAlarmCounts = (driveData: typeof motorOneDriveData) => ({
    trips: [
      driveData.trip1?.value,
      driveData.trip2?.value,
      driveData.trip3?.value,
      driveData.trip4?.value,
      driveData.trip5?.value
    ].filter((v) => toNumber(v) > 0).length,
    warnings: [
      driveData.warning1?.value,
      driveData.warning2?.value,
      driveData.warning3?.value
    ].filter((v) => toNumber(v) > 0).length
  })

  const motorOneAlarmCounts = getAlarmCounts(motorOneDriveData)
  const motorTwoAlarmCounts = getAlarmCounts(motorTwoDriveData)

  const activeTripsCount =
    motorControlMode === 'dual'
      ? motorOneAlarmCounts.trips + motorTwoAlarmCounts.trips
      : getAlarmCounts(selectedSingleDriveData).trips

  const activeWarningsCount =
    motorControlMode === 'dual'
      ? motorOneAlarmCounts.warnings + motorTwoAlarmCounts.warnings
      : getAlarmCounts(selectedSingleDriveData).warnings

  const getTripAgeSeconds = (driveData: typeof motorOneDriveData): number => {
    const hoursSinceTrip = Math.max(0, Math.floor(toNumber(driveData.hoursSinceTrip?.value)))
    const secondsSinceTrip = Math.max(0, Math.floor(toNumber(driveData.secondsSinceTrip?.value)))
    return hoursSinceTrip * 3600 + secondsSinceTrip
  }

  const tripAgeCandidates =
    motorControlMode === 'dual'
      ? [motorOneDriveData, motorTwoDriveData]
          .map((data) => getTripAgeSeconds(data))
          .filter((value) => value > 0)
      : [getTripAgeSeconds(selectedSingleDriveData)].filter((value) => value > 0)

  const totalTripAgeSeconds = tripAgeCandidates.length > 0 ? Math.min(...tripAgeCandidates) : 0
  const hoursSinceTrip = Math.floor(totalTripAgeSeconds / 3600)
  const secondsSinceTrip = totalTripAgeSeconds % 3600
  const minutes = Math.floor((secondsSinceTrip % 3600) / 60)
  const seconds = secondsSinceTrip % 60

  const pad2 = (n: number) => String(n).padStart(2, '0')
  const lastTripAgeText = `${hoursSinceTrip}:${pad2(minutes)}:${pad2(seconds)}`

  const tone: 'ok' | 'warning' | 'alarm' =
    activeTripsCount > 0 ? 'alarm' : activeWarningsCount > 0 ? 'warning' : 'ok'

  const go = (to: string) => navigate(to, { flushSync: true })

  const handleToggleRecording = () => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  useEffect(() => {
    if (recordedBlob && !isRecording) {
      setShowVideoModal(true)
    }
  }, [recordedBlob, isRecording])

  useEffect(() => {
    const syncDriveModel = () => {
      setDriveModel(loadClientMotorInfo().driveModel || DEFAULT_CLIENT_MOTOR_INFO.driveModel)
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key && event.key !== CLIENT_MOTOR_INFO_STORAGE_KEY) return
      syncDriveModel()
    }

    syncDriveModel()
    window.addEventListener('storage', handleStorage)
    window.addEventListener(CLIENT_MOTOR_INFO_UPDATED_EVENT, syncDriveModel)

    return () => {
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener(CLIENT_MOTOR_INFO_UPDATED_EVENT, syncDriveModel)
    }
  }, [])

  const handleModalClose = () => {
    setShowVideoModal(false)
  }

  const progressDeg = isRecording ? Math.round((elapsedSeconds / maxDuration) * 360) : 0
  const recordProgressStyle = {
    '--record-progress-deg': `${progressDeg}deg`
  } as React.CSSProperties
  const formattedTime = currentTime.toLocaleTimeString([], { hour12: false, timeZone })
  const formattedDate = currentTime.toLocaleDateString([], { timeZone })
  const formattedDateWithZone = compactTimeZoneLabel
    ? `${formattedDate} · ${compactTimeZoneLabel}`
    : formattedDate

  return (
    <HeaderContainer>
      <LeftSection>
        <Badge>
          <BadgeLabel>Drive Model</BadgeLabel>
          <BadgeValue>{driveModel}</BadgeValue>
        </Badge>
        <BrandGroup>
          <BrandImageWrap aria-label="ConView Integrated Controller">
            <BrandImage src={conviewLogo} alt="ConView Integrated Controller" />
          </BrandImageWrap>
        </BrandGroup>
        {/* <Divider />
        <InfoText>
          <span>PROJECT: RTE-002</span>
          <span className="separator">|</span>
          <span>IP: 192.168.10.24</span>
        </InfoText> */}
      </LeftSection>

      <RightSection>
        <RecordButton
          $isRecording={isRecording}
          style={recordProgressStyle}
          onClick={handleToggleRecording}
          title={isRecording ? 'Stop Recording' : 'Start Screen Recording'}
        >
          {isRecording ? <Square size={20} fill="currentColor" /> : <Circle size={20} />}
        </RecordButton>

        {sendStatus.status !== 'idle' && (
          <SendStatusPill
            $tone={sendStatus.status === 'sending' ? 'sending' : sendStatus.status}
            title={sendStatus.message || ''}
          >
            {sendStatus.status === 'sending' && <SendSpinner />}
            {sendStatus.status === 'success' && <CheckCircle2 size={18} />}
            {sendStatus.status === 'error' && <AlertTriangle size={18} />}
            <SendStatusText>
              <SendStatusTitle>
                {sendStatus.status === 'sending'
                  ? 'SENDING'
                  : sendStatus.status === 'success'
                    ? 'SENT'
                    : 'ERROR'}
              </SendStatusTitle>
              <SendStatusMsg>{sendStatus.kind === 'video' ? 'Video' : 'Report'}</SendStatusMsg>
            </SendStatusText>
          </SendStatusPill>
        )}

        {motorControlMode !== 'dual' && (
          <CommGroup>
            {/* Ambos OK: un solo pill, sin last ok */}
            {commMode === 'ok' && (
              <CommPill $tone="ok">
                <CommDot $tone="ok" />
                <CommText>
                  <CommValue>DRIVE · WAGO</CommValue>
                </CommText>
              </CommPill>
            )}

            {/* Ambos OFF: un solo pill, ambos muestran last ok */}
            {commMode === 'off' && (
              <CommPill $tone="off">
                <CommDot $tone="off" />
                <CommText>
                  <CommValue>DRIVE · WAGO</CommValue>
                  <CommSub>
                    Drive {fmt(driveLastOkTs)} · WAGO {fmt(wagoLastOkTs)}
                  </CommSub>
                </CommText>
              </CommPill>
            )}

            {/* Uno OK y otro OFF: separar, solo el OFF muestra last ok */}
            {commMode === 'partial' && (
              <>
                <CommPill $tone={driveConnected ? 'ok' : 'off'}>
                  <CommDot $tone={driveConnected ? 'ok' : 'off'} />
                  <CommText>
                    <CommTitle>DRIVE</CommTitle>
                    <CommValue>{driveConnected ? 'OK' : 'OFF'}</CommValue>
                    {!driveConnected && <CommSub>LAST {fmt(driveLastOkTs)}</CommSub>}
                  </CommText>
                </CommPill>

                <CommPill $tone={wagoConnected ? 'ok' : 'off'}>
                  <CommDot $tone={wagoConnected ? 'ok' : 'off'} />
                  <CommText>
                    <CommTitle>WAGO</CommTitle>
                    <CommValue>{wagoConnected ? 'OK' : 'OFF'}</CommValue>
                    {!wagoConnected && <CommSub>LAST {fmt(wagoLastOkTs)}</CommSub>}
                  </CommText>
                </CommPill>
              </>
            )}
          </CommGroup>
        )}

        <AlarmButton $tone={tone} onClick={() => go('/alarms')} aria-label="Open alarms">
          <AlarmIconWrap $tone={tone}>
            <BellRing size={20} />
          </AlarmIconWrap>
          <AlarmInfo>
            <AlarmCounts>
              TRIPS: {activeTripsCount} · WARNINGS: {activeWarningsCount}
            </AlarmCounts>
            <AlarmAge>LAST TRIP: {lastTripAgeText}</AlarmAge>
          </AlarmInfo>
        </AlarmButton>

        <TimeBlock>
          <Time>{formattedTime}</Time>
          <DateText>{formattedDateWithZone}</DateText>
        </TimeBlock>

        <ConfigButton onClick={() => go('/config')} aria-label="Settings">
          <Settings size={24} />
        </ConfigButton>
      </RightSection>

      {notice ? (
        <HeaderNoticeDock>
          <HeaderNoticePill $tone={notice.tone} $visible={notice.visible} role="status" aria-live="polite">
            {notice.tone === 'success' ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
            <HeaderNoticeText>{notice.message}</HeaderNoticeText>
          </HeaderNoticePill>
        </HeaderNoticeDock>
      ) : null}

      <VideoReportModal
        isOpen={showVideoModal}
        onClose={handleModalClose}
        videoBlob={recordedBlob}
        onDiscard={clearRecording}
        autoStopped={maxDurationReached}
      />
    </HeaderContainer>
  )
}

export default Header
