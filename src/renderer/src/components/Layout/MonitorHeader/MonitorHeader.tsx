import { ChevronDown, ClipboardList, Clock3, Eye, X, Wifi } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import conviewLogo from 'assets/images/logo-transparent.png'
import {
  getCompactTimeZoneLabel,
  useCurrentTime,
  useMotorControlModePreference,
  usePreferredSingleMotorScope,
  usePreferredSingleMotorScopePreference,
  useRealtime,
  useSystemTimeZone
} from 'hooks'
import {
  BrandImage,
  CenterSection,
  ClientMotorButton,
  ClientMotorButtonMeta,
  ClientMotorButtonValue,
  DialogCloseButton,
  DialogMeta,
  DialogOptionLabel,
  DialogOptionMeta,
  DialogOptionTime,
  DialogOptionTitle,
  DialogOptionValue,
  DialogOptionsList,
  DialogSubtitle,
  DialogTitle,
  DialogTitleRow,
  DateValue,
  HeaderContainer,
  LeftSection,
  ModePill,
  MotorButton,
  MotorSelector,
  RightSection,
  StatusDot,
  StatusLabel,
  StatusPill,
  StatusText,
  StatusValue,
  TimeZoneDialog,
  TimeZoneDialogHeader,
  TimeZoneOptionButton,
  TimeZoneOverlay,
  TimeBlock,
  TimeBlockLabel,
  TimeBlockValueGroup,
  TimeValue,
  TitleGroup
} from './MonitorHeader.styles'
import DualMotorDetailsModal from 'pages/MainScreen/localComponents/DualMotorDetailsModal/DualMotorDetailsModal'
import type { MotorScope } from 'utils/motorDeviceMapping'

const DISPLAY_TIME_ZONE_STORAGE_KEY = 'monitor_display_time_zone_id'
const SYSTEM_TIME_ZONE_OPTION_ID = '__system__'

const MonitorHeader = () => {
  const currentTime = useCurrentTime()
  const { config, timeZone, timeZoneLabel, compactTimeZoneLabel } = useSystemTimeZone()
  const { isConnected } = useRealtime()
  const [motorControlMode, setMotorControlMode] = useMotorControlModePreference()
  const effectiveSingleMotorScope = usePreferredSingleMotorScope()
  const [storedSingleMotorScope, setStoredSingleMotorScope] =
    usePreferredSingleMotorScopePreference()
  const [displayTimeZoneId, setDisplayTimeZoneId] = useState(SYSTEM_TIME_ZONE_OPTION_ID)
  const [isTimeZoneDialogOpen, setIsTimeZoneDialogOpen] = useState(false)
  const [isClientMotorOpen, setIsClientMotorOpen] = useState(false)
  const activeSingleMotorScope = storedSingleMotorScope ?? effectiveSingleMotorScope

  useEffect(() => {
    if (typeof window === 'undefined') return

    const storedValue = window.localStorage.getItem(DISPLAY_TIME_ZONE_STORAGE_KEY)
    if (storedValue) {
      setDisplayTimeZoneId(storedValue)
    }
  }, [])

  const systemTimeZone = timeZone ?? Intl.DateTimeFormat().resolvedOptions().timeZone
  const timeZoneOptions = useMemo(() => {
    const supportedTimeZones = config?.supportedTimeZones ?? []

    return [
      {
        id: SYSTEM_TIME_ZONE_OPTION_ID,
        label: timeZoneLabel || 'System Time',
        ianaName: systemTimeZone,
        compactLabel: getCompactTimeZoneLabel(timeZoneLabel) || compactTimeZoneLabel || 'System',
        meta: 'Display the live system time zone'
      },
      ...supportedTimeZones.map((zone) => ({
        id: zone.id,
        label: zone.label,
        ianaName: zone.ianaName,
        compactLabel: getCompactTimeZoneLabel(zone.label),
        meta: zone.id
      }))
    ]
  }, [compactTimeZoneLabel, config?.supportedTimeZones, systemTimeZone, timeZoneLabel])

  const activeTimeZoneOption =
    timeZoneOptions.find((option) => option.id === displayTimeZoneId) ?? timeZoneOptions[0]
  const resolvedTimeZone = activeTimeZoneOption?.ianaName ?? systemTimeZone
  const resolvedTimeZoneLabel = activeTimeZoneOption?.compactLabel || compactTimeZoneLabel || ''
  const formattedTime = currentTime.toLocaleTimeString([], {
    hour12: false,
    timeZone: resolvedTimeZone
  })
  const formattedDate = currentTime.toLocaleDateString([], { timeZone: resolvedTimeZone })
  const formattedDateWithZone =
    resolvedTimeZoneLabel !== null && resolvedTimeZoneLabel !== ''
      ? `${formattedDate} - ${resolvedTimeZoneLabel}`
      : formattedDate
  const visibleMotors =
    motorControlMode === 'dual'
      ? (['drive1', 'drive2'] as const)
      : ([activeSingleMotorScope === 1 ? 'drive1' : 'drive2'] as const)

  const handleSelectScope = (scope: MotorScope | 'dual') => {
    if (scope === 'dual') {
      setMotorControlMode('dual')
      return
    }

    setStoredSingleMotorScope(scope)
    setMotorControlMode('single')
  }

  const handleSelectDisplayTimeZone = (timeZoneId: string) => {
    setDisplayTimeZoneId(timeZoneId)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(DISPLAY_TIME_ZONE_STORAGE_KEY, timeZoneId)
    }
    setIsTimeZoneDialogOpen(false)
  }

  return (
    <>
      <HeaderContainer>
      <LeftSection>
        <TitleGroup>
          <BrandImage src={conviewLogo} alt="ConView" />
        </TitleGroup>

        <ModePill>
          <Eye size={18} />
          View Only
        </ModePill>
      </LeftSection>

      <CenterSection>
        <MotorSelector>
          <MotorButton
            type="button"
            $active={motorControlMode === 'single' && activeSingleMotorScope === 1}
            onClick={() => handleSelectScope(1)}
          >
            Motor #1
          </MotorButton>
          <MotorButton
            type="button"
            $active={motorControlMode === 'single' && activeSingleMotorScope === 2}
            onClick={() => handleSelectScope(2)}
          >
            Motor #2
          </MotorButton>
          <MotorButton
            type="button"
            $active={motorControlMode === 'dual'}
            onClick={() => handleSelectScope('dual')}
          >
            Both
          </MotorButton>
        </MotorSelector>
      </CenterSection>

      <RightSection>
        <StatusPill $connected={isConnected}>
          <StatusDot $connected={isConnected} />
          <StatusText>
            <StatusLabel>Realtime</StatusLabel>
            <StatusValue>{isConnected ? 'Connected' : 'Disconnected'}</StatusValue>
          </StatusText>
          <Wifi size={18} />
        </StatusPill>

        <ClientMotorButton type="button" onClick={() => setIsClientMotorOpen(true)}>
          <ClipboardList size={18} />
          <div>
            <ClientMotorButtonMeta>View Details</ClientMotorButtonMeta>
            <ClientMotorButtonValue>Client & Motor</ClientMotorButtonValue>
          </div>
        </ClientMotorButton>

        <TimeBlock type="button" onClick={() => setIsTimeZoneDialogOpen(true)}>
          <TimeBlockValueGroup>
            <TimeValue>{formattedTime}</TimeValue>
            <DateValue>{formattedDateWithZone}</DateValue>
          </TimeBlockValueGroup>
          <TimeBlockLabel>
            <Clock3 size={14} />
            <span>Display Zone</span>
            <ChevronDown size={14} />
          </TimeBlockLabel>
        </TimeBlock>
      </RightSection>
      </HeaderContainer>

      {isTimeZoneDialogOpen ? (
        <>
          <TimeZoneOverlay
            type="button"
            aria-label="Close display time zone dialog"
            onClick={() => setIsTimeZoneDialogOpen(false)}
          />
          <TimeZoneDialog>
            <TimeZoneDialogHeader>
              <div>
                <DialogTitleRow>
                  <Clock3 size={18} />
                  <DialogTitle>Display Time Zone</DialogTitle>
                </DialogTitleRow>
                <DialogSubtitle>
                  Choose which clock zone the monitor should display. This only changes the website
                  view.
                </DialogSubtitle>
              </div>

              <DialogCloseButton
                type="button"
                aria-label="Close display time zone dialog"
                onClick={() => setIsTimeZoneDialogOpen(false)}
              >
                <X size={18} />
              </DialogCloseButton>
            </TimeZoneDialogHeader>

            <DialogOptionsList>
              {timeZoneOptions.map((option) => {
                const optionTime = currentTime.toLocaleTimeString([], {
                  hour12: false,
                  timeZone: option.ianaName
                })
                const optionDate = currentTime.toLocaleDateString([], {
                  timeZone: option.ianaName
                })

                return (
                  <TimeZoneOptionButton
                    key={option.id}
                    type="button"
                    $active={option.id === activeTimeZoneOption?.id}
                    onClick={() => handleSelectDisplayTimeZone(option.id)}
                  >
                    <DialogOptionLabel>
                      <DialogOptionTitle>{option.label}</DialogOptionTitle>
                      <DialogOptionMeta>{option.meta}</DialogOptionMeta>
                    </DialogOptionLabel>

                    <DialogOptionValue>
                      <DialogOptionTime>{optionTime}</DialogOptionTime>
                      <DialogMeta>
                        {optionDate}
                        {option.compactLabel ? ` - ${option.compactLabel}` : ''}
                      </DialogMeta>
                    </DialogOptionValue>
                  </TimeZoneOptionButton>
                )
              })}
            </DialogOptionsList>
          </TimeZoneDialog>
        </>
      ) : null}

      <DualMotorDetailsModal
        isOpen={isClientMotorOpen}
        onClose={() => setIsClientMotorOpen(false)}
        readOnly
        visibleMotors={visibleMotors}
      />
    </>
  )
}

export default MonitorHeader
