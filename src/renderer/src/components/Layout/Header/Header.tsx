import { BellRing, Settings, Circle, Square, CheckCircle2, AlertTriangle } from 'lucide-react'
import { useNavigate } from 'react-router'
import React, { useState, useEffect } from 'react'
import { useCurrentTime, useDeviceData } from 'hooks'
import { useScreenRecorder } from 'hooks/useScreenRecorder'
import { useReportSendStatus } from 'hooks/useReportSendStatus'
import { VideoReportModal } from '../../Modals/VideoReportModal/VideoReportModal'
import { DeviceId } from 'types'
import {
  HeaderContainer,
  LeftSection,
  Badge,
  BadgeLabel,
  BadgeValue,
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
  SendStatusMsg
} from './Header.styles'

const Header = () => {
  const navigate = useNavigate()
  const currentTime = useCurrentTime()
  const driveId: DeviceId = 'drive_avid'
  const wagoId: DeviceId = 'wago'
  const { data: driveData, raw: driveRaw, isConnected: socketConnected } = useDeviceData(driveId)
  const { raw: wagoRaw } = useDeviceData(wagoId)

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
  const [showVideoModal, setShowVideoModal] = useState(false)

  const driveConnected = socketConnected && Boolean(driveRaw['__connected'])
  const wagoConnected = socketConnected && Boolean(wagoRaw['__connected'])

  const driveLastOkTs = typeof driveRaw['__lastOkTs'] === 'string' ? driveRaw['__lastOkTs'] : null
  const wagoLastOkTs = typeof wagoRaw['__lastOkTs'] === 'string' ? wagoRaw['__lastOkTs'] : null

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

  const activeTripsCount = [
    driveData.trip1?.value,
    driveData.trip2?.value,
    driveData.trip3?.value,
    driveData.trip4?.value,
    driveData.trip5?.value
  ].filter((v) => toNumber(v) > 0).length

  const activeWarningsCount = [
    driveData.warning1?.value,
    driveData.warning2?.value,
    driveData.warning3?.value
  ].filter((v) => toNumber(v) > 0).length

  const hoursSinceTrip = Math.max(0, Math.floor(toNumber(driveData.hoursSinceTrip?.value)))
  const secondsSinceTrip = Math.max(0, Math.floor(toNumber(driveData.secondsSinceTrip?.value)))
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

  const handleModalClose = () => {
    setShowVideoModal(false)
  }

  const progressDeg = isRecording ? Math.round((elapsedSeconds / maxDuration) * 360) : 0
  const recordProgressStyle = {
    '--record-progress-deg': `${progressDeg}deg`
  } as React.CSSProperties

  return (
    <HeaderContainer>
      <LeftSection>
        <Badge>
          <BadgeLabel>Drive Model</BadgeLabel>
          <BadgeValue>MV3000e</BadgeValue>
        </Badge>
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
          <Time>{currentTime.toLocaleTimeString([], { hour12: false })}</Time>
          <DateText>{currentTime.toLocaleDateString()}</DateText>
        </TimeBlock>

        <ConfigButton onClick={() => go('/config')} aria-label="Settings">
          <Settings size={24} />
        </ConfigButton>
      </RightSection>

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
