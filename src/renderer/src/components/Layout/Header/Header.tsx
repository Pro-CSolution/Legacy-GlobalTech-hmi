import { BellRing } from 'lucide-react'
import { useNavigate } from 'react-router'
import { useCurrentTime, useDeviceData } from '../../../hooks'
import { DeviceId } from 'types'
import {
  HeaderContainer,
  LeftSection,
  Badge,
  BadgeLabel,
  BadgeValue,
  Divider,
  InfoText,
  RightSection,
  TimeBlock,
  AlarmButton,
  AlarmIconWrap,
  AlarmInfo,
  AlarmCounts,
  AlarmAge,
  Time,
  DateText
} from './Header.styles'

const Header = () => {
  const navigate = useNavigate()
  const currentTime = useCurrentTime()
  const driveId: DeviceId = 'drive_avid'
  const { data: driveData } = useDeviceData(driveId)

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

  return (
    <HeaderContainer>
      <LeftSection>
        <Badge>
          <BadgeLabel>Test Stand</BadgeLabel>
          <BadgeValue>TEST STAND A</BadgeValue>
        </Badge>
        <Divider />
        <InfoText>
          <span>PROJECT: RTE-002</span>
          <span className="separator">|</span>
          <span>IP: 192.168.10.24</span>
        </InfoText>
      </LeftSection>

      <RightSection>
        <AlarmButton $tone={tone} onClick={() => navigate('/alarms')} aria-label="Open alarms">
          <AlarmIconWrap $tone={tone}>
            <BellRing size={22} />
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
      </RightSection>
    </HeaderContainer>
  )
}

export default Header
