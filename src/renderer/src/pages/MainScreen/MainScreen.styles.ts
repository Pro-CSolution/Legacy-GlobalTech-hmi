import styled, { css, keyframes } from 'styled-components'

export const MainContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`

export const StatusList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`

export const WarningGroup = styled.div`
  border-top: 1px solid ${({ theme }) => theme.colors.borders.primary};
  margin-top: 4px;
  padding-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`

export const ElectricalGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  height: 100%;
`

export const GaugeTile = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0px;
  background: linear-gradient(180deg, rgba(15, 25, 44, 0.98) 0%, rgba(10, 18, 33, 0.98) 100%);
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  height: 100%;
  min-height: 0;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03);
`

export const GaugeLabel = styled.span`
  font-family: ${({ theme }) => theme.typography.displayFamily};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.sizes.md};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  text-align: center;
  letter-spacing: 0.06em;
`

export const ElectricalHeaderMeta = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 12px;
  white-space: normal;
  text-transform: none;
`

export const ElectricalMotorBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 34px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid rgba(130, 180, 255, 0.24);
  background: rgba(16, 29, 52, 0.82);
  color: ${({ theme }) => theme.colors.text.primary};
  font-family: ${({ theme }) => theme.typography.displayFamily};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  letter-spacing: 0.08em;
  text-transform: uppercase;
`

export const ElectricalMotorTypeButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 34px;
  padding: 6px 12px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  border: 1px solid rgba(130, 180, 255, 0.2);
  background: rgba(14, 25, 44, 0.88);
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
  transition:
    border-color 0.18s ease,
    background 0.18s ease;
  white-space: nowrap;

  &:hover {
    border-color: ${({ theme }) => theme.colors.accent.primary};
    background: rgba(18, 33, 58, 0.96);
  }
`

export const ElectricalMotorTypeLabel = styled.span`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-family: ${({ theme }) => theme.typography.displayFamily};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  letter-spacing: 0.08em;
  text-transform: uppercase;
`

export const ElectricalMotorTypeValue = styled.span<{ $empty?: boolean }>`
  color: ${({ $empty, theme }) =>
    $empty ? theme.colors.text.secondary : theme.colors.text.primary};
  font-family: ${({ theme }) => theme.typography.bodyFamily};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  letter-spacing: 0.02em;
`

const getBreakerGlassBorder = (status: 'open' | 'closed' | 'unknown'): string => {
  if (status === 'closed') return 'rgba(151, 242, 168, 0.24)'
  if (status === 'open') return 'rgba(255, 106, 106, 0.28)'
  return 'rgba(120, 180, 255, 0.24)'
}

const getBreakerGlassBackground = (status: 'open' | 'closed' | 'unknown'): string => {
  if (status === 'closed') {
    return 'radial-gradient(circle at top right, rgba(151, 242, 168, 0.16), transparent 42%), linear-gradient(180deg, rgba(25, 59, 42, 0.26) 0%, rgba(10, 18, 33, 0.96) 100%)'
  }

  if (status === 'open') {
    return 'radial-gradient(circle at top right, rgba(255, 106, 106, 0.18), transparent 42%), linear-gradient(180deg, rgba(70, 28, 28, 0.26) 0%, rgba(10, 18, 33, 0.96) 100%)'
  }

  return 'radial-gradient(circle at top right, rgba(120, 180, 255, 0.16), transparent 42%), linear-gradient(180deg, rgba(26, 49, 77, 0.24) 0%, rgba(10, 18, 33, 0.96) 100%)'
}

const getBreakerGlassValueColor = (status: 'open' | 'closed' | 'unknown'): string => {
  if (status === 'closed') return '#c8f6c8'
  if (status === 'open') return '#fca5a5'
  return '#afd8ff'
}

export const ElectricalStatusButton = styled.div<{ $status: 'open' | 'closed' | 'unknown' }>`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-height: 34px;
  padding: 6px 12px;
  border-radius: 14px;
  border: 1px solid ${({ $status }) => getBreakerGlassBorder($status)};
  background: ${({ $status }) => getBreakerGlassBackground($status)};
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.03),
    0 12px 24px rgba(0, 0, 0, 0.22);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  white-space: nowrap;
`

export const ElectricalStatusLabel = styled.span`
  color: rgba(226, 236, 255, 0.78);
  font-family: ${({ theme }) => theme.typography.displayFamily};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  letter-spacing: 0.08em;
  text-transform: uppercase;
`

export const ElectricalStatusValue = styled.span<{ $status: 'open' | 'closed' | 'unknown' }>`
  color: ${({ $status }) => getBreakerGlassValueColor($status)};
  font-family: ${({ theme }) => theme.typography.displayFamily};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  letter-spacing: 0.08em;
  text-transform: uppercase;
`

export const ElectricalHeaderHint = styled.span`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-family: ${({ theme }) => theme.typography.displayFamily};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 0.9;
  white-space: nowrap;
`

type TrendTileProps = {
  $width: number
  $height: number
  $position: {
    left?: number
    top?: number
    right?: number
    bottom?: number
  }
}

export const TrendTile = styled.div<TrendTileProps>`
  position: absolute;
  width: ${({ $width }) => `${$width}px`};
  height: ${({ $height }) => `${$height}px`};
  touch-action: manipulation;

  ${({ $position }) => css`
    ${$position.left !== undefined && `left: ${$position.left}px;`}
    ${$position.top !== undefined && `top: ${$position.top}px;`}
    ${$position.right !== undefined && `right: ${$position.right}px;`}
    ${$position.bottom !== undefined && `bottom: ${$position.bottom}px;`}
  `}
`

export const TrendPlaceholder = styled.div`
  background: linear-gradient(180deg, rgba(17, 28, 49, 0.96) 0%, rgba(11, 20, 36, 0.96) 100%);
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03);
`

export const TrendLabel = styled.span`
  font-family: ${({ theme }) => theme.typography.displayFamily};
  font-size: ${({ theme }) => theme.typography.sizes.xl};
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text.secondary};
`

export const TrendStatus = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.xl};
  font-weight: bold;
  color: ${({ theme }) => theme.colors.status.alarm};
`

export const SliderWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
`

export const SliderContainer = styled.div`
  padding: 0 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`

export const SliderHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  width: 100%;
  margin-bottom: 10px;
`

export const SliderLabel = styled.span`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-family: ${({ theme }) => theme.typography.displayFamily};
  font-size: ${({ theme }) => theme.typography.sizes.xl};
  letter-spacing: 0.06em;
  text-transform: uppercase;
`

export const SliderValue = styled.span`
  font-family: ${({ theme }) => theme.typography.numericFamily};
  font-size: 60px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.accent.primary};
  letter-spacing: 0.04em;
`

export const RangeInput = styled.input`
  width: 100%;
  height: 22px;
  background: linear-gradient(90deg, rgba(95, 130, 200, 0.18), rgba(75, 120, 200, 0.36));
  border-radius: 999px;
  appearance: none;
  outline: none;
  cursor: pointer;
  user-select: none;
  -webkit-user-select: none;
  touch-action: none;
  -webkit-tap-highlight-color: transparent;
  box-shadow:
    inset 0 1px 2px rgba(255, 255, 255, 0.04),
    inset 0 -1px 2px rgba(15, 23, 42, 0.4);

  &:disabled {
    cursor: not-allowed;
    opacity: 0.45;
  }

  &::-webkit-slider-thumb {
    appearance: none;
    width: 36px;
    height: 36px;
    background: linear-gradient(180deg, #8ecfff 0%, #4fb5ff 100%);
    border: 3px solid rgba(9, 17, 32, 0.9);
    border-radius: 50%;
    cursor: pointer;
    transition: transform 0.2s;
    box-shadow: 0 0 0 4px rgba(115, 210, 255, 0.12);
  }

  &::-webkit-slider-thumb:hover {
    transform: scale(1.1);
  }
`

export const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  min-height: 58px;
  margin-top: 8px;
  gap: 10px;
`

export const AdjustmentButton = styled.button`
  flex: 1;
  padding: 12px;
  background: linear-gradient(180deg, rgba(46, 64, 99, 0.95), rgba(35, 49, 78, 0.95));
  border: 1px solid rgba(130, 180, 255, 0.16);
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: #d8e8ff;
  font-family: ${({ theme }) => theme.typography.displayFamily};
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  font-size: ${({ theme }) => theme.typography.sizes.xl};
  letter-spacing: 0.06em;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);

  &:hover {
    background: linear-gradient(180deg, rgba(56, 76, 116, 0.96), rgba(40, 57, 90, 0.96));
    border-color: rgba(130, 200, 255, 0.24);
    color: ${({ theme }) => theme.colors.text.primary};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.45;
  }
`

export const DriveStatusBox = styled.div`
  background: linear-gradient(180deg, rgba(15, 25, 44, 0.98) 0%, rgba(10, 18, 33, 0.98) 100%);
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: 12px 14px;
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03);
`

export const DriveStatusRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
`

export const DriveLabel = styled.span`
  font-family: ${({ theme }) => theme.typography.displayFamily};
  font-size: ${({ theme }) => theme.typography.sizes.lg};
  color: ${({ theme }) => theme.colors.text.secondary};
  letter-spacing: 0.06em;
`

export const DriveState = styled.span<{ $active: boolean }>`
  font-family: ${({ theme }) => theme.typography.displayFamily};
  font-size: ${({ theme }) => theme.typography.sizes.lg};
  font-weight: bold;
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid
    ${({ $active }) => ($active ? 'rgba(151, 242, 168, 0.28)' : 'rgba(130, 180, 255, 0.16)')};
  background: ${({ $active }) =>
    $active
      ? 'linear-gradient(180deg, rgba(24, 53, 39, 0.92), rgba(16, 37, 28, 0.96))'
      : 'linear-gradient(180deg, rgba(46, 64, 99, 0.95), rgba(35, 49, 78, 0.95))'};
  color: ${({ $active, theme }) =>
    $active ? theme.colors.status.running : theme.colors.text.primary};
  letter-spacing: 0.06em;
`

export const DriveFaultBox = styled.div`
  margin-top: 8px;
  padding: 6px 8px;
  background: linear-gradient(180deg, rgba(70, 28, 28, 0.94), rgba(44, 18, 18, 0.96));
  border: 1px solid rgba(255, 106, 106, 0.3);
  color: ${({ theme }) => theme.colors.status.alarm};
  font-size: 12px;
  font-weight: bold;
  text-align: center;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  letter-spacing: 0.08em;
`

export const DriveControls = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

export const DriveContent = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  overflow-y: auto;
  padding-right: 2px;
`

export const DriveKeypadSection = styled.div`
  display: flex;
  justify-content: center;
  padding: 0;
  min-height: 200px;
  height: clamp(260px, 36vh, 320px);
  cursor: pointer;
`

export const EmergencyStopContainer = styled.div`
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px solid rgba(140, 185, 255, 0.14);
`

export const InlineStatus = styled.div<{ $tone: 'success' | 'error' }>`
  margin-top: 12px;
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  border: 1px solid
    ${({ $tone }) =>
      $tone === 'success' ? 'rgba(151, 242, 168, 0.28)' : 'rgba(255, 106, 106, 0.3)'};
  background: ${({ $tone }) =>
    $tone === 'success'
      ? 'linear-gradient(180deg, rgba(24, 53, 39, 0.9), rgba(16, 37, 28, 0.94))'
      : 'linear-gradient(180deg, rgba(70, 28, 28, 0.94), rgba(44, 18, 18, 0.96))'};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  display: flex;
  align-items: center;
  gap: 8px;
`

// Compact styles for SpeedControl
export const CompactSliderWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 6px;
  height: 100%;
  width: 100%;
  padding: 2px 0 8px;
`

export const CompactMainRow = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  width: 100%;
  gap: 10px;
  margin-bottom: 0;
`

export const CompactButtonPair = styled.div`
  display: flex;
  gap: 4px;
  flex: 0.95;

  ${AdjustmentButton} {
    padding: 0 8px;
    height: 34px;
    font-size: ${({ theme }) => theme.typography.sizes.sm};
  }
`

export const CompactSliderValue = styled.span<{ $isSyncing?: boolean }>`
  font-family: ${({ theme }) => theme.typography.numericFamily};
  font-size: 50px;
  font-weight: bold;
  color: ${({ theme, $isSyncing }) =>
    $isSyncing ? theme.colors.text.secondary : theme.colors.accent.primary};
  line-height: 0.94;
  min-width: 120px;
  text-align: center;
  transition: color 0.3s ease;
  opacity: ${({ $isSyncing }) => ($isSyncing ? 0.7 : 1)};
  animation: ${({ $isSyncing }) => ($isSyncing ? 'pulse 1.5s infinite ease-in-out' : 'none')};

  @keyframes pulse {
    0% {
      opacity: 0.5;
    }
    50% {
      opacity: 1;
    }
    100% {
      opacity: 0.5;
    }
  }
`

export const SliderRangeWrapper = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding-top: 0;
  padding-bottom: 6px;
`

type DualTone = 'default' | 'blue' | 'green' | 'amber' | 'red'
type TemperatureAlertSeverity = 'normal' | 'warning' | 'critical'

const temperatureWarningCardBlink = keyframes`
  0%,
  100% {
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.04),
      0 0 0 1px rgba(250, 204, 21, 0.24),
      0 0 18px rgba(250, 204, 21, 0.22);
  }

  50% {
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.03),
      0 0 0 1px rgba(250, 204, 21, 0.06),
      0 0 6px rgba(250, 204, 21, 0.08);
  }
`

const temperatureCriticalCardBlink = keyframes`
  0%,
  100% {
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.04),
      0 0 0 1px rgba(255, 106, 106, 0.28),
      0 0 20px rgba(255, 106, 106, 0.24);
  }

  50% {
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.03),
      0 0 0 1px rgba(255, 106, 106, 0.08),
      0 0 7px rgba(255, 106, 106, 0.1);
  }
`

const temperatureWarningValueBlink = keyframes`
  0%,
  100% {
    opacity: 1;
    text-shadow: 0 0 14px rgba(250, 204, 21, 0.28);
  }

  50% {
    opacity: 0.42;
    text-shadow: 0 0 4px rgba(250, 204, 21, 0.1);
  }
`

const temperatureCriticalValueBlink = keyframes`
  0%,
  100% {
    opacity: 1;
    text-shadow: 0 0 16px rgba(255, 106, 106, 0.3);
  }

  50% {
    opacity: 0.34;
    text-shadow: 0 0 5px rgba(255, 106, 106, 0.12);
  }
`

const getTemperatureCardBorder = (
  tone: DualTone,
  alertSeverity: TemperatureAlertSeverity
): string => {
  if (alertSeverity === 'warning') return 'rgba(250, 204, 21, 0.72)'
  if (alertSeverity === 'critical') return 'rgba(255, 106, 106, 0.72)'
  if (tone === 'green') return 'rgba(151, 242, 168, 0.24)'
  if (tone === 'amber') return 'rgba(122, 223, 255, 0.34)'
  if (tone === 'red') return 'rgba(255, 106, 106, 0.28)'
  if (tone === 'blue') return 'rgba(120, 180, 255, 0.24)'
  return 'rgba(120, 170, 255, 0.12)'
}

const getTemperatureCardBackground = (
  tone: DualTone,
  alertSeverity: TemperatureAlertSeverity
): string => {
  if (alertSeverity === 'warning') {
    return 'radial-gradient(circle at top right, rgba(250, 204, 21, 0.18), transparent 42%), linear-gradient(180deg, rgba(82, 62, 18, 0.42) 0%, rgba(10, 18, 33, 0.98) 100%)'
  }

  if (alertSeverity === 'critical') {
    return 'radial-gradient(circle at top right, rgba(255, 106, 106, 0.2), transparent 42%), linear-gradient(180deg, rgba(88, 27, 27, 0.42) 0%, rgba(10, 18, 33, 0.98) 100%)'
  }

  if (tone === 'green') {
    return 'linear-gradient(180deg, rgba(25, 59, 42, 0.26) 0%, rgba(10, 18, 33, 0.98) 100%)'
  }

  if (tone === 'amber') {
    return 'linear-gradient(180deg, rgba(70, 55, 24, 0.24) 0%, rgba(10, 18, 33, 0.98) 100%)'
  }

  if (tone === 'red') {
    return 'linear-gradient(180deg, rgba(70, 28, 28, 0.26) 0%, rgba(10, 18, 33, 0.98) 100%)'
  }

  if (tone === 'blue') {
    return 'linear-gradient(180deg, rgba(26, 49, 77, 0.24) 0%, rgba(10, 18, 33, 0.98) 100%)'
  }

  return 'linear-gradient(180deg, rgba(15, 25, 44, 0.98) 0%, rgba(10, 18, 33, 0.98) 100%)'
}

const getTemperatureValueColor = (
  tone: DualTone,
  alertSeverity: TemperatureAlertSeverity
): string => {
  if (alertSeverity === 'warning') return '#facc15'
  if (alertSeverity === 'critical') return '#ff8f8f'
  if (tone === 'green') return '#c8f6c8'
  if (tone === 'amber') return '#f8d670'
  if (tone === 'blue') return '#afd8ff'
  if (tone === 'red') return '#fca5a5'
  return '#f8fafc'
}

export const SingleTemperaturePanel = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 6px 8px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  background: linear-gradient(180deg, rgba(17, 28, 49, 0.96) 0%, rgba(10, 18, 33, 0.96) 100%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03);
`

export const SingleTemperatureHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`

export const SingleTemperatureTitle = styled.span`
  font-family: ${({ theme }) => theme.typography.displayFamily};
  font-size: ${({ theme }) => theme.typography.sizes.md};
  color: ${({ theme }) => theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.08em;
`

export const SingleTemperatureDeck = styled.div`
  flex: 1;
  height: 100%;
  min-height: 0;
  display: grid;
  grid-template-columns: repeat(10, minmax(0, 1fr));
  grid-auto-rows: minmax(0, 1fr);
  gap: 4px;

  & > * {
    min-width: 0;
    grid-column: span 2;
  }

  @media (max-width: 768px) {
    height: auto;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-auto-rows: auto;
    gap: 3px;

    & > * {
      grid-column: auto;
    }
  }
`

export const TemperatureCard = styled.div<{
  $tone: DualTone
  $alertSeverity: TemperatureAlertSeverity
  $animateAlert: boolean
  $compact?: boolean
  $selectable?: boolean
}>`
  min-height: ${({ $compact }) => ($compact ? '58px' : '0')};
  padding: ${({ $compact }) => ($compact ? '3px 6px' : '12px 14px')};
  border-radius: 14px;
  border: 1px solid
    ${({ $tone, $alertSeverity }) => getTemperatureCardBorder($tone, $alertSeverity)};
  background: ${({ $tone, $alertSeverity }) => getTemperatureCardBackground($tone, $alertSeverity)};
  display: flex;
  flex-direction: column;
  justify-content: ${({ $compact }) => ($compact ? 'flex-start' : 'space-between')};
  gap: ${({ $compact }) => ($compact ? '0px' : '8px')};
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03);
  overflow: hidden;
  cursor: ${({ $selectable }) => ($selectable ? 'pointer' : 'default')};
  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    box-shadow 0.18s ease;

  ${({ $selectable }) =>
    $selectable &&
    css`
      &:hover {
        transform: translateY(-1px);
        border-color: rgba(103, 214, 255, 0.34);
        box-shadow:
          inset 0 1px 0 rgba(255, 255, 255, 0.03),
          0 8px 18px rgba(0, 0, 0, 0.18);
      }

      &:focus-visible {
        outline: 2px solid rgba(122, 223, 255, 0.78);
        outline-offset: 2px;
      }
    `}
  ${({ $alertSeverity, $animateAlert }) =>
    $animateAlert &&
    $alertSeverity === 'warning' &&
    css`
      animation: ${temperatureWarningCardBlink} 1.05s step-end infinite;
    `}
  ${({ $alertSeverity, $animateAlert }) =>
    $animateAlert &&
    $alertSeverity === 'critical' &&
    css`
      animation: ${temperatureCriticalCardBlink} 0.8s step-end infinite;
    `}
`

export const TemperatureLabel = styled.span<{ $compact?: boolean }>`
  display: block;
  font-family: ${({ theme }) => theme.typography.displayFamily};
  font-size: ${({ $compact }) =>
    $compact ? 'clamp(20px, 0.76vw, 13px)' : 'clamp(16px, 1.08vw, 19px)'};
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  letter-spacing: 0.04em;
  line-height: 1.1;
  white-space: normal;
  min-height: ${({ $compact }) => ($compact ? '40px' : '0')};

  @media (max-width: 768px) {
    font-size: ${({ $compact }) => ($compact ? '15px' : '14px')};
    min-height: 0;
  }
`

export const TemperatureValueRow = styled.div<{ $compact?: boolean }>`
  display: flex;
  align-items: flex-end;
  gap: ${({ $compact }) => ($compact ? '6px' : '8px')};
  min-height: ${({ $compact }) => ($compact ? '14px' : '54px')};
  margin-top: ${({ $compact }) => ($compact ? 'auto' : '0')};

  @media (max-width: 768px) {
    min-height: 0;
    margin-top: 0;
  }
`

export const TemperatureValue = styled.span<{
  $tone: DualTone
  $alertSeverity: TemperatureAlertSeverity
  $animateAlert: boolean
  $compact?: boolean
}>`
  font-family: ${({ theme }) => theme.typography.numericFamily};
  font-size: ${({ $compact }) =>
    $compact ? 'clamp(30px, 1.4vw, 26px)' : 'clamp(36px, 2.35vw, 48px)'};
  line-height: 0.95;
  color: ${({ $tone, $alertSeverity }) => getTemperatureValueColor($tone, $alertSeverity)};
  ${({ $alertSeverity, $animateAlert }) =>
    $animateAlert &&
    $alertSeverity === 'warning' &&
    css`
      animation: ${temperatureWarningValueBlink} 1.05s step-end infinite;
    `}
  ${({ $alertSeverity, $animateAlert }) =>
    $animateAlert &&
    $alertSeverity === 'critical' &&
    css`
      animation: ${temperatureCriticalValueBlink} 0.8s step-end infinite;
    `}
`

export const TemperatureUnit = styled.span<{ $compact?: boolean }>`
  margin-bottom: ${({ $compact }) => ($compact ? '2px' : '5px')};
  font-family: ${({ theme }) => theme.typography.displayFamily};
  font-size: ${({ $compact }) =>
    $compact ? 'clamp(9px, 0.6vw, 11px)' : 'clamp(14px, 0.96vw, 17px)'};
  color: ${({ theme }) => theme.colors.text.primary};
  letter-spacing: 0.04em;
`

export const TemperatureDetail = styled.span`
  font-size: 12px;
  line-height: 1.25;
  color: ${({ theme }) => theme.colors.text.secondary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @media (max-width: 768px) {
    white-space: normal;
  }
`

export const WindingSelectorModal = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 22px;
  background: linear-gradient(180deg, rgba(17, 28, 49, 0.98) 0%, rgba(10, 18, 33, 0.98) 100%);
`

export const WindingSelectorHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
`

export const WindingSelectorTitle = styled.h2`
  margin: 0;
  font-family: ${({ theme }) => theme.typography.displayFamily};
  font-size: 24px;
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  letter-spacing: 0.06em;
  color: ${({ theme }) => theme.colors.text.primary};
  text-transform: uppercase;
`

export const WindingSelectorSubtitle = styled.p`
  margin: 6px 0 0;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  line-height: 1.4;
`

export const WindingSelectorCloseButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: 12px;
  border: 1px solid rgba(130, 180, 255, 0.18);
  background: rgba(14, 25, 44, 0.86);
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;

  &:hover {
    border-color: rgba(103, 214, 255, 0.34);
    background: rgba(18, 33, 58, 0.94);
  }
`

export const WindingSelectorRows = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

export const WindingSelectorRow = styled.div`
  display: grid;
  grid-template-columns: 118px minmax(0, 1fr);
  align-items: center;
  gap: 12px;

  @media (max-width: 520px) {
    grid-template-columns: minmax(0, 1fr);
  }
`

export const WindingSelectorPhase = styled.span`
  font-family: ${({ theme }) => theme.typography.displayFamily};
  font-size: ${({ theme }) => theme.typography.sizes.md};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  letter-spacing: 0.08em;
  color: ${({ theme }) => theme.colors.text.secondary};
  text-transform: uppercase;
`

export const WindingSelectorOptions = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
`

export const IgbtSelectorOptions = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
`

export const WindingSelectorOption = styled.button<{ $active: boolean }>`
  min-height: 64px;
  border-radius: 14px;
  border: 1px solid
    ${({ $active }) => ($active ? 'rgba(122, 223, 255, 0.72)' : 'rgba(120, 170, 255, 0.14)')};
  background: ${({ $active }) =>
    $active
      ? 'linear-gradient(180deg, rgba(28, 67, 96, 0.92), rgba(16, 39, 58, 0.96))'
      : 'linear-gradient(180deg, rgba(15, 25, 44, 0.96), rgba(10, 18, 33, 0.98))'};
  color: ${({ theme }) => theme.colors.text.primary};
  font-family: ${({ theme }) => theme.typography.displayFamily};
  font-size: 24px;
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  letter-spacing: 0.08em;
  cursor: pointer;
  box-shadow: ${({ $active }) =>
    $active
      ? '0 0 18px rgba(122, 223, 255, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
      : 'inset 0 1px 0 rgba(255, 255, 255, 0.03)'};

  &:hover {
    border-color: rgba(103, 214, 255, 0.44);
  }
`

export const WindingSelectorFooter = styled.div`
  padding-top: 2px;
  font-family: ${({ theme }) => theme.typography.displayFamily};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  letter-spacing: 0.08em;
  color: ${({ theme }) => theme.colors.text.secondary};
  text-transform: uppercase;
`

export const DualMainShell = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 4px;
  border-radius: 18px;
  background:
    radial-gradient(circle at top center, rgba(35, 77, 160, 0.18), transparent 30%),
    radial-gradient(circle at bottom left, rgba(72, 191, 255, 0.08), transparent 32%),
    linear-gradient(180deg, #08111f 0%, #0a1425 40%, #091221 100%);

  @media (max-width: 768px) {
    height: auto;
    min-height: 100%;
    overflow: visible;
    padding: 0;
    border-radius: 0;
    background: transparent;
  }
`

export const DualInfoItem = styled.div`
  display: flex;
  align-items: baseline;
  gap: 8px;
  min-width: 0;
`

export const DualInfoLabel = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.08em;
`

export const DualInfoValue = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.lg};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  letter-spacing: 0.02em;
`

export const DualInfoDivider = styled.div`
  width: 1px;
  height: 28px;
  background: rgba(148, 163, 184, 0.16);
`

export const DualStatusBadge = styled.div<{ $tone: 'ok' | 'off' }>`
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 46px;
  padding: 0 14px;
  border-radius: 12px;
  border: 1px solid
    ${({ $tone }) => ($tone === 'ok' ? 'rgba(151, 242, 168, 0.28)' : 'rgba(255, 106, 106, 0.28)')};
  background: ${({ $tone }) =>
    $tone === 'ok'
      ? 'linear-gradient(180deg, rgba(24, 53, 39, 0.9), rgba(16, 37, 28, 0.94))'
      : 'linear-gradient(180deg, rgba(70, 28, 28, 0.94), rgba(44, 18, 18, 0.96))'};
  color: ${({ theme }) => theme.colors.text.primary};
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);

  span {
    font-family: ${({ theme }) => theme.typography.displayFamily};
    font-size: ${({ theme }) => theme.typography.sizes.sm};
    color: ${({ theme }) => theme.colors.text.secondary};
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  strong {
    font-family: ${({ theme }) => theme.typography.displayFamily};
    font-size: ${({ theme }) => theme.typography.sizes.md};
    letter-spacing: 0.04em;
  }
`

export const DualModePill = styled.div<{ $ethernet: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 46px;
  padding: 0 54px 0 14px;
  border-radius: 12px;
  border: 1px solid
    ${({ $ethernet }) => ($ethernet ? 'rgba(94, 234, 212, 0.32)' : 'rgba(148, 163, 184, 0.22)')};
  background: ${({ $ethernet }) =>
    $ethernet ? 'rgba(15, 57, 59, 0.82)' : 'rgba(30, 41, 59, 0.86)'};
  color: ${({ theme }) => theme.colors.text.primary};

  span {
    font-size: ${({ theme }) => theme.typography.sizes.sm};
    color: ${({ theme }) => theme.colors.text.secondary};
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  strong {
    font-size: ${({ theme }) => theme.typography.sizes.md};
    letter-spacing: 0.04em;
  }
`

export const DualModeKnob = styled.span<{ $ethernet: boolean }>`
  position: absolute;
  right: 8px;
  width: 34px;
  height: 20px;
  border-radius: 999px;
  background: ${({ $ethernet }) =>
    $ethernet ? 'linear-gradient(90deg, #2dd4bf 0%, #99f6e4 100%)' : 'rgba(71, 85, 105, 0.9)'};
  box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.12);

  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: ${({ $ethernet }) => ($ethernet ? '16px' : '2px')};
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #f8fafc;
    transition: left 0.18s ease;
  }
`

export const DualMotorGrid = styled.div<{ $columns?: number }>`
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: repeat(${({ $columns = 2 }) => $columns}, minmax(0, 1fr));
  gap: 20px;

  @media (max-width: 1200px) {
    grid-template-columns: minmax(0, 1fr);
  }

  @media (max-width: 768px) {
    gap: 14px;
  }
`

export const DualMotorPanel = styled.section<{ $live: boolean }>`
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px;
  border-radius: 18px;
  border: 1px solid
    ${({ $live }) => ($live ? 'rgba(151, 242, 168, 0.2)' : 'rgba(120, 170, 255, 0.14)')};
  background: linear-gradient(180deg, rgba(18, 30, 52, 0.96) 0%, rgba(10, 18, 33, 0.96) 100%);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.04),
    0 10px 24px rgba(0, 0, 0, 0.35);

  @media (max-width: 768px) {
    padding: 12px;
    border-radius: 16px;
  }
`

export const DualMotorPanelHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: nowrap;

  @media (max-width: 768px) {
    flex-wrap: wrap;
    align-items: stretch;
  }
`

export const DualPanelActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: nowrap;
  gap: 6px;
  min-width: 0;
  flex-shrink: 0;
  margin-left: auto;

  @media (max-width: 768px) {
    width: 100%;
    flex-wrap: wrap;
    justify-content: flex-start;
    margin-left: 0;
  }
`

export const DualMotorHeading = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 0 0 auto;
  flex-wrap: nowrap;
  min-width: max-content;

  @media (max-width: 768px) {
    width: 100%;
    min-width: 0;
  }
`

export const DualMotorHeadingStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
`

export const DualMotorTitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  color: ${({ theme }) => theme.colors.text.primary};
`

export const DualMotorTitle = styled.span`
  font-family: ${({ theme }) => theme.typography.displayFamily};
  font-size: 18px;
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  letter-spacing: 0.08em;
`

export const DualMotorSubheading = styled.span`
  font-family: ${({ theme }) => theme.typography.displayFamily};
  font-size: ${({ theme }) => theme.typography.sizes.lg};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.text.secondary};
  letter-spacing: 0.06em;
`

export const DualMotorTypeButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 38px;
  height: 38px;
  padding: 0 9px;
  border-radius: 12px;
  border: 1px solid rgba(130, 180, 255, 0.18);
  background: rgba(14, 25, 44, 0.86);
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
  transition:
    border-color 0.18s ease,
    background 0.18s ease;
  white-space: nowrap;

  &:hover {
    border-color: ${({ theme }) => theme.colors.accent.primary};
    background: rgba(18, 33, 58, 0.94);
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`

export const DualMotorTypeLabel = styled.span`
  font-family: ${({ theme }) => theme.typography.displayFamily};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.text.secondary};
`

export const DualMotorTypeValue = styled.span<{ $empty?: boolean }>`
  font-family: ${({ theme }) => theme.typography.bodyFamily};
  font-size: 13px;
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  letter-spacing: 0.02em;
  color: ${({ $empty, theme }) =>
    $empty ? theme.colors.text.secondary : theme.colors.text.primary};
`

export const DualCommsBadge = styled.div<{ $tone: 'ok' | 'off' }>`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2px;
  min-height: 38px;
  height: 38px;
  padding: 4px 10px 3px;
  border-radius: 12px;
  border: 1px solid
    ${({ theme, $tone }) =>
      $tone === 'ok' ? `${theme.colors.status.running}66` : `${theme.colors.status.alarm}66`};
  background: ${({ $tone }) =>
    $tone === 'ok'
      ? 'linear-gradient(180deg, rgba(24, 53, 39, 0.92), rgba(16, 37, 28, 0.96))'
      : 'linear-gradient(180deg, rgba(70, 28, 28, 0.94), rgba(44, 18, 18, 0.96))'};
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.04),
    0 8px 18px rgba(0, 0, 0, 0.18);
`

export const DualCommsBadgeTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  line-height: 1;

  span {
    font-family: ${({ theme }) => theme.typography.displayFamily};
    font-size: 12px;
    font-weight: ${({ theme }) => theme.typography.weights.bold};
    letter-spacing: 0.08em;
    color: ${({ theme }) => theme.colors.text.primary};
    text-transform: uppercase;
    white-space: nowrap;
  }
`

export const DualCommsBadgeDot = styled.span<{ $tone: 'ok' | 'off' }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
  background: ${({ theme, $tone }) =>
    $tone === 'ok' ? theme.colors.status.running : theme.colors.status.alarm};
  box-shadow: ${({ theme, $tone }) =>
    $tone === 'ok' ? `0 0 10px ${theme.colors.status.running}88` : 'none'};
`

export const DualCommsBadgeMeta = styled.strong`
  font-family: ${({ theme }) => theme.typography.bodyFamily};
  font-size: 11px;
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  letter-spacing: 0.02em;
  line-height: 1.05;
  color: ${({ theme }) => theme.colors.text.secondary};
  white-space: nowrap;
`

export const DualDetailsButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  min-height: 38px;
  height: 38px;
  padding: 0 10px;
  white-space: nowrap;
  border-radius: 12px;
  border: 1px solid rgba(130, 180, 255, 0.18);
  background: rgba(34, 50, 80, 0.65);
  color: ${({ theme }) => theme.colors.text.primary};
  font-family: ${({ theme }) => theme.typography.displayFamily};
  font-size: 12px;
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  letter-spacing: 0.08em;
  cursor: pointer;
  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    background 0.18s ease;

  svg {
    width: 15px;
    height: 15px;
    flex-shrink: 0;
  }

  &:hover {
    transform: translateY(-1px);
    border-color: rgba(103, 214, 255, 0.28);
    background: rgba(44, 63, 100, 0.82);
  }
`

export const DualMotorBody = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
`

export const DualMotorHeroGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }
`

export const DualHeroCard = styled.div<{ $tone: 'running' | 'stopped' | 'neutral' }>`
  position: relative;
  min-height: 92px;
  overflow: hidden;
  padding: 12px 14px;
  border-radius: 14px;
  border: 1px solid rgba(120, 170, 255, 0.12);
  background: ${({ $tone }) =>
    $tone === 'running'
      ? 'radial-gradient(circle at left center, rgba(151, 242, 168, 0.08), transparent 40%), linear-gradient(180deg, rgba(18, 31, 27, 0.98), rgba(9, 17, 31, 0.98))'
      : $tone === 'stopped'
        ? 'radial-gradient(circle at left center, rgba(255, 106, 106, 0.08), transparent 40%), linear-gradient(180deg, rgba(30, 18, 24, 0.98), rgba(9, 17, 31, 0.98))'
        : 'radial-gradient(circle at left center, rgba(120, 180, 255, 0.1), transparent 40%), linear-gradient(180deg, rgba(12, 21, 39, 0.98), rgba(9, 17, 31, 0.98))'};

  @media (max-width: 768px) {
    min-height: 128px;
    padding: 12px 12px 56px;
  }
`

export const DualHeroLabel = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: ${({ theme }) => theme.typography.displayFamily};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  letter-spacing: 0.08em;
  text-transform: uppercase;

  @media (max-width: 768px) {
    gap: 6px;
    font-size: ${({ theme }) => theme.typography.sizes.sm};
  }
`

export const DualHeroStateText = styled.span<{ $tone: 'running' | 'stopped' | 'neutral' }>`
  color: ${({ $tone }) =>
    $tone === 'running' ? '#b6f1bf' : $tone === 'stopped' ? '#fca5a5' : '#93c5fd'};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
`

export const DualHeroValueRow = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  align-items: flex-end;
  gap: 8px;
  margin-top: 8px;
`

export const DualHeroValue = styled.span<{ $tone: DualTone }>`
  font-family: ${({ theme }) => theme.typography.numericFamily};
  font-size: clamp(38px, 2.5vw, 56px);
  line-height: 1;
  color: ${({ $tone }) => {
    if ($tone === 'green') return '#c6f7c6'
    if ($tone === 'amber') return '#f8d670'
    if ($tone === 'blue') return '#a8d7ff'
    if ($tone === 'red') return '#fca5a5'
    return '#f8fafc'
  }};
  text-shadow: 0 8px 20px rgba(0, 0, 0, 0.22);

  @media (max-width: 768px) {
    font-size: clamp(26px, 9vw, 36px);
  }
`

export const DualHeroUnit = styled.span`
  margin-bottom: 4px;
  font-family: ${({ theme }) => theme.typography.displayFamily};
  font-size: 16px;
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.text.primary};

  @media (max-width: 768px) {
    margin-bottom: 4px;
    font-size: 12px;
  }
`

export const DualHeroImage = styled.img`
  position: absolute;
  right: -84px;
  bottom: -60px;
  width: 350px;
  opacity: 0.33;
  filter: drop-shadow(0 14px 28px rgba(0, 0, 0, 0.3));
  pointer-events: none;

  @media (max-width: 768px) {
    right: -64px;
    bottom: -72px;
    width: 180px;
    opacity: 0.14;
  }
`

export const DualMetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 6px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`

export const DualMetricCard = styled.div<{ $accent: 'none' | 'blue' | 'green' | 'amber' }>`
  min-height: 78px;
  padding: 7px 10px 8px;
  border-radius: 14px;
  border: 1px solid rgba(120, 170, 255, 0.12);
  background: ${({ $accent }) =>
    $accent === 'amber'
      ? 'linear-gradient(180deg, rgba(70, 55, 24, 0.24) 0%, rgba(10, 18, 33, 0.98) 100%)'
      : $accent === 'blue'
        ? 'linear-gradient(180deg, rgba(26, 49, 77, 0.24) 0%, rgba(10, 18, 33, 0.98) 100%)'
        : $accent === 'green'
          ? 'linear-gradient(180deg, rgba(25, 59, 42, 0.22) 0%, rgba(10, 18, 33, 0.98) 100%)'
          : 'linear-gradient(180deg, rgba(15, 25, 44, 0.98) 0%, rgba(10, 18, 33, 0.98) 100%)'};
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03);
  position: relative;
  overflow: hidden;
  text-align: center;
  cursor: pointer;
  user-select: none;
  touch-action: manipulation;
  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    box-shadow 0.18s ease;

  &::before {
    content: '';
    position: absolute;
    left: 14px;
    right: 14px;
    top: 34px;
    height: 1px;
    background: rgba(140, 185, 255, 0.16);
    pointer-events: none;
  }

  &:hover {
    transform: translateY(-1px);
    border-color: rgba(103, 214, 255, 0.24);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.03),
      0 8px 18px rgba(0, 0, 0, 0.18);
  }

  &:active {
    transform: scale(0.99);
  }

  @media (max-width: 768px) {
    min-height: 72px;
    padding: 8px 8px 10px;
  }
`

export const DualMetricLabel = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  font-family: ${({ theme }) => theme.typography.displayFamily};
  font-size: clamp(13px, 0.82vw, 16px);
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  letter-spacing: 0.02em;
  min-height: 20px;

  @media (max-width: 768px) {
    font-size: 12px;
    min-height: 0;
  }
`

export const DualMetricValueRow = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 6px;
  flex: 1;
  width: 100%;
  padding-top: 14px;
  padding-bottom: 0;
`

export const DualMetricValue = styled.span<{ $tone: DualTone }>`
  font-family: ${({ theme }) => theme.typography.numericFamily};
  font-size: clamp(32px, 1.9vw, 44px);
  line-height: 0.92;
  color: ${({ $tone }) => {
    if ($tone === 'green') return '#c8f6c8'
    if ($tone === 'amber') return '#f8d670'
    if ($tone === 'blue') return '#afd8ff'
    if ($tone === 'red') return '#fca5a5'
    return '#f8fafc'
  }};

  @media (max-width: 768px) {
    font-size: clamp(24px, 8vw, 34px);
  }
`

export const DualMetricUnit = styled.span`
  margin-bottom: 5px;
  font-family: ${({ theme }) => theme.typography.displayFamily};
  font-size: clamp(13px, 0.9vw, 18px);
  color: ${({ theme }) => theme.colors.text.primary};

  @media (max-width: 768px) {
    margin-bottom: 4px;
    font-size: 12px;
  }
`

export const DualTemperatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(10, minmax(0, 1fr));
  grid-auto-rows: auto;
  gap: 3px;

  & > * {
    min-width: 0;
    grid-column: span 2;
  }

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 3px;

    & > * {
      grid-column: auto;
    }
  }
`

export const DualReferenceSection = styled.div`
  flex: 1;
  min-height: 112px;
  padding: 10px 12px 12px;
  border-radius: 14px;
  border: 1px solid rgba(120, 170, 255, 0.12);
  background: linear-gradient(180deg, rgba(15, 25, 44, 0.98) 0%, rgba(10, 18, 33, 0.98) 100%);
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 20px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03);
  overflow: hidden;

  @media (max-width: 768px) {
    padding: 12px;
    gap: 6px;
  }
`

export const DualReferenceHeader = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;

  @media (max-width: 768px) {
    align-items: center;
    justify-content: space-between;
  }
`

export const DualReferenceLabel = styled.span`
  font-family: ${({ theme }) => theme.typography.displayFamily};
  font-size: ${({ theme }) => theme.typography.sizes.lg};
  color: ${({ theme }) => theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.08em;
`

export const DualReferenceValue = styled.span`
  font-family: ${({ theme }) => theme.typography.numericFamily};
  min-width: 108px;
  text-align: center;
  font-size: clamp(80px, 2vw, 22px);
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.accent.primary};
  line-height: 0.95;
  letter-spacing: 0.02em;

  @media (max-width: 768px) {
    min-width: 0;
    text-align: left;
    font-size: clamp(28px, 10vw, 38px);
  }
`

export const DualRangeShell = styled.div`
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 8px;
  align-items: center;
  width: 100%;
  padding-top: 10px;

  @media (max-width: 768px) {
    grid-template-columns: minmax(0, 1fr);
    gap: 6px;
  }
`

export const DualRangeLabel = styled.span`
  font-family: ${({ theme }) => theme.typography.displayFamily};
  font-size: ${({ theme }) => theme.typography.sizes.lg};
  color: ${({ theme }) => theme.colors.text.secondary};
  white-space: nowrap;
`

export const DualRangeInput = styled.input`
  width: 100%;
  height: 30px;
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(95, 130, 200, 0.18), rgba(75, 120, 200, 0.36));
  appearance: none;
  outline: none;
  user-select: none;
  -webkit-user-select: none;
  touch-action: none;
  -webkit-tap-highlight-color: transparent;
  box-shadow:
    inset 0 1px 2px rgba(255, 255, 255, 0.04),
    inset 0 -1px 2px rgba(15, 23, 42, 0.4);

  &::-webkit-slider-thumb {
    appearance: none;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: linear-gradient(180deg, #8ecfff 0%, #4fb5ff 100%);
    border: 2px solid rgba(9, 17, 32, 0.9);
    box-shadow:
      0 0 0 4px rgba(115, 210, 255, 0.12),
      0 8px 20px rgba(39, 122, 227, 0.28);
    cursor: pointer;
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  &:disabled::-webkit-slider-thumb {
    cursor: not-allowed;
  }
`

export const DualAdjustmentRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: auto;
`

export const DualReferenceControlRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: clamp(10px, 1.5vw, 20px);
  width: 100%;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }
`

export const DualAdjustmentCluster = styled.div<{ $align?: 'start' | 'end' }>`
  display: flex;
  gap: 8px;
  flex: 0 0 auto;
  justify-content: ${({ $align = 'start' }) => ($align === 'end' ? 'flex-end' : 'flex-start')};

  @media (max-width: 768px) {
    width: 100%;
    justify-content: stretch;
  }
`

export const DualAdjustmentButton = styled.button`
  flex:0 0 clamp(120px, 4.2vw, 120px);
  width: clamp(120px, 4.2vw, 120px);
  height: 50px;
  padding: 0 8px;
  border-radius: 10px;
  border: 1px solid rgba(130, 180, 255, 0.16);
  background: linear-gradient(180deg, rgba(46, 64, 99, 0.95), rgba(35, 49, 78, 0.95));
  color: #d8e8ff;
  font-family: ${({ theme }) => theme.typography.displayFamily};
  font-size: 25px;
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  white-space: nowrap;
  cursor: pointer;
  transition:
    transform 0.18s ease,
    color 0.18s ease,
    border-color 0.18s ease,
    background 0.18s ease;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);

  &:hover {
    transform: translateY(-1px);
    color: ${({ theme }) => theme.colors.text.primary};
    border-color: rgba(103, 214, 255, 0.24);
    background: linear-gradient(180deg, rgba(56, 76, 116, 0.96), rgba(40, 57, 90, 0.96));
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  @media (max-width: 768px) {
    flex: 1 1 0;
    width: 100%;
    height: 40px;
    font-size: 14px;
  }
`

export const DualReferenceMeta = styled.span`
  font-family: ${({ theme }) => theme.typography.displayFamily};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
`

export const DualControlRow = styled.div<{ $compact?: boolean }>`
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 6px;
  min-height: 50px;
  align-items: stretch;
  margin-top: 8px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @media (max-width: 768px) {
    margin-top: 10px;
    gap: ${({ $compact }) => ($compact ? '8px' : '8px')};
    grid-template-columns: ${({ $compact }) =>
      $compact ? 'repeat(3, minmax(0, 1fr))' : 'repeat(2, minmax(0, 1fr))'};
  }

  @media (max-width: 520px) {
    grid-template-columns: ${({ $compact }) =>
      $compact ? 'repeat(3, minmax(0, 1fr))' : 'minmax(0, 1fr)'};
  }
`

export const DualCommandButton = styled.button<{
  $tone: 'start' | 'stop' | 'reset' | 'mode'
  $active?: boolean
  $compact?: boolean
}>`
  position: relative;
  min-height: 44px;
  height: 100%;
  padding: 6px;
  border-radius: 12px;
  border: 1px solid
    ${({ $tone, $active }) => {
      if ($tone === 'start')
        return $active ? 'rgba(151, 242, 168, 0.56)' : getBreakerGlassBorder('closed')
      if ($tone === 'stop')
        return $active ? 'rgba(255, 106, 106, 0.56)' : getBreakerGlassBorder('open')
      if ($tone === 'reset') return 'rgba(255, 210, 92, 0.42)'
      return $active ? 'rgba(146, 208, 255, 0.58)' : 'rgba(148, 183, 255, 0.34)'
    }};
  background: ${({ $tone, $active }) => {
    if ($tone === 'start') return getBreakerGlassBackground('closed')
    if ($tone === 'stop') return getBreakerGlassBackground('open')
    if ($tone === 'reset')
      return 'linear-gradient(180deg, rgba(114, 87, 24, 0.96) 0%, rgba(81, 58, 14, 0.98) 100%)'
    if ($active)
      return 'linear-gradient(180deg, rgba(72, 117, 201, 0.98) 0%, rgba(48, 84, 156, 0.98) 100%)'
    return 'linear-gradient(180deg, rgba(44, 61, 96, 0.96) 0%, rgba(29, 42, 72, 0.96) 100%)'
  }};
  color: ${({ theme }) => theme.colors.text.primary};
  font-family: ${({ theme }) => theme.typography.displayFamily};
  font-size: clamp(12px, 0.72vw, 14px);
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  letter-spacing: 0.06em;
  line-height: 1.05;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  cursor: pointer;
  overflow: hidden;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    border-color 0.18s ease,
    opacity 0.18s ease;
  box-shadow:
    inset 0 0 0 1px
      ${({ $tone, $active }) => {
        if ($tone === 'start' || $tone === 'stop') return 'rgba(255, 255, 255, 0.03)'
        if ($tone === 'reset') return 'rgba(255, 237, 190, 0.08)'
        return $active ? 'rgba(222, 240, 255, 0.16)' : 'rgba(210, 226, 255, 0.08)'
      }},
    inset 0 1px 0
      ${({ $tone }) =>
        $tone === 'start' || $tone === 'stop'
          ? 'rgba(255, 255, 255, 0.03)'
          : $tone === 'reset'
            ? 'rgba(255, 244, 215, 0.08)'
            : 'rgba(255, 255, 255, 0.08)'},
    ${({ $active, $tone }) => {
      if ($tone === 'start')
        return $active
          ? '0 0 18px rgba(75, 210, 123, 0.22), 0 12px 24px rgba(0, 0, 0, 0.22)'
          : '0 12px 24px rgba(0, 0, 0, 0.22)'
      if ($tone === 'stop')
        return $active
          ? '0 0 18px rgba(255, 106, 106, 0.22), 0 12px 24px rgba(0, 0, 0, 0.22)'
          : '0 12px 24px rgba(0, 0, 0, 0.22)'
      if ($tone === 'reset') return '0 12px 24px rgba(48, 30, 0, 0.28)'
      if ($active) return '0 0 18px rgba(76, 164, 255, 0.2), 0 10px 24px rgba(17, 32, 59, 0.28)'
      return '0 10px 24px rgba(0, 0, 0, 0.2)'
    }};
  ${({ $tone }) =>
    ($tone === 'start' || $tone === 'stop' || $tone === 'reset') &&
    css`
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
    `}

  svg {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
  }

  &:hover {
    transform: translateY(-1px);
    border-color: ${({ $tone, $active }) => {
      if ($tone === 'start') return 'rgba(151, 242, 168, 0.34)'
      if ($tone === 'stop') return 'rgba(255, 106, 106, 0.34)'
      if ($tone === 'reset') return 'rgba(255, 223, 126, 0.58)'
      return $active ? 'rgba(165, 219, 255, 0.8)' : 'rgba(165, 196, 255, 0.5)'
    }};
    box-shadow:
      inset 0 0 0 1px rgba(255, 255, 255, 0.06),
      inset 0 1px 0 rgba(255, 255, 255, 0.05),
      0 12px 28px rgba(0, 0, 0, 0.26);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  @media (max-width: 768px) {
    min-height: ${({ $compact }) => ($compact ? '40px' : '48px')};
    padding: ${({ $compact }) => ($compact ? '6px 0' : '6px 8px')};
    gap: ${({ $compact }) => ($compact ? '0' : '5px')};
    font-size: ${({ $compact }) => ($compact ? '11px' : '13px')};
    border-radius: ${({ $compact }) => ($compact ? '14px' : '12px')};

    svg {
      width: ${({ $compact }) => ($compact ? '16px' : '15px')};
      height: ${({ $compact }) => ($compact ? '16px' : '15px')};
    }
  }
`

export const DualModeButtonLabel = styled.span`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0;
  font-size: 13px;
  line-height: 0.96;
  letter-spacing: 0.06em;
  text-transform: uppercase;
`

export const DualBreakerStatusButton = styled.div<{
  $status: 'open' | 'closed' | 'unknown'
  $compact?: boolean
}>`
  position: relative;
  min-height: 44px;
  height: 100%;
  padding: ${({ $compact }) => ($compact ? '8px 0' : '6px 8px')};
  border-radius: ${({ $compact }) => ($compact ? '16px' : '14px')};
  border: 1px solid ${({ $status }) => getBreakerGlassBorder($status)};
  background: ${({ $status }) => getBreakerGlassBackground($status)};
  color: ${({ theme }) => theme.colors.text.primary};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  overflow: hidden;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.03),
    0 12px 24px rgba(0, 0, 0, 0.22);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  user-select: none;

  svg {
    width: ${({ $compact }) => ($compact ? '18px' : '15px')};
    height: ${({ $compact }) => ($compact ? '18px' : '15px')};
    flex-shrink: 0;
  }

  @media (max-width: 768px) {
    min-height: ${({ $compact }) => ($compact ? '40px' : '48px')};
    gap: ${({ $compact }) => ($compact ? '0' : '3px')};
  }
`

export const DualBreakerStatusLabel = styled.span`
  font-family: ${({ theme }) => theme.typography.displayFamily};
  font-size: 12px;
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  letter-spacing: 0.08em;
  line-height: 1;
  text-transform: uppercase;
  opacity: 0.9;
  width: 100%;
  text-align: center;

  @media (max-width: 768px) {
    font-size: 12px;
  }
`

export const DualBreakerStatusValue = styled.span<{ $status: 'open' | 'closed' | 'unknown' }>`
  font-family: ${({ theme }) => theme.typography.displayFamily};
  font-size: clamp(12px, 0.78vw, 15px);
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  letter-spacing: 0.08em;
  line-height: 1.05;
  text-align: center;
  text-transform: uppercase;
  color: ${({ $status }) => getBreakerGlassValueColor($status)};

  @media (max-width: 768px) {
    font-size: 14px;
  }
`

export const DualInlineNotice = styled.div<{ $tone: 'success' | 'error' }>`
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid
    ${({ $tone }) =>
      $tone === 'success' ? 'rgba(151, 242, 168, 0.28)' : 'rgba(255, 106, 106, 0.3)'};
  background: ${({ $tone }) =>
    $tone === 'success'
      ? 'linear-gradient(180deg, rgba(24, 53, 39, 0.9), rgba(16, 37, 28, 0.94))'
      : 'linear-gradient(180deg, rgba(70, 28, 28, 0.94), rgba(44, 18, 18, 0.96))'};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  line-height: 1.4;
`
