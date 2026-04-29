import styled, { keyframes } from 'styled-components'

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`

export const ScreenContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background-color: ${({ theme }) => theme.colors.background.primary};
  color: ${({ theme }) => theme.colors.text.primary};
  overflow: hidden;
  padding: 10px;
  gap: 10px;

  @media (max-width: 768px) {
    height: auto;
    min-height: 100%;
    overflow: visible;
    padding: 0;
    gap: 12px;
  }
`

export const Toolbar = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  background-color: ${({ theme }) => theme.colors.background.secondary}80; // 50% opacity
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: 8px;
  flex-shrink: 0;
  gap: 12px;
`

export const ToolbarMain = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  flex: 1 1 720px;
  min-width: 0;
`

export const ToolbarActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 8px;
  flex: 0 1 auto;
`

export const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`

export const TimeButton = styled.button<{ $isActive?: boolean }>`
  background-color: ${({ $isActive, theme }) =>
    $isActive ? theme.colors.accent.primary : 'transparent'};
  color: ${({ $isActive, theme }) => ($isActive ? '#fff' : theme.colors.text.secondary)};
  border: 1px solid
    ${({ $isActive, theme }) => ($isActive ? theme.colors.accent.primary : 'transparent')};
  min-height: 40px;
  padding: 0 18px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    color: #fff;
    background-color: ${({ $isActive, theme }) =>
      $isActive ? theme.colors.accent.primary : theme.colors.background.tertiary};
  }
`

export const RangeTriggerButton = styled.button<{ $isActive?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 40px;
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid
    ${({ $isActive, theme }) =>
      $isActive ? `${theme.colors.accent.primary}CC` : theme.colors.borders.primary};
  background: ${({ $isActive, theme }) =>
    $isActive ? `${theme.colors.accent.primary}20` : 'transparent'};
  color: ${({ $isActive, theme }) =>
    $isActive ? theme.colors.text.primary : theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  letter-spacing: 0.06em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    color: ${({ theme }) => theme.colors.text.primary};
    border-color: ${({ theme }) => theme.colors.accent.primary};
    background: ${({ theme }) => `${theme.colors.accent.primary}16`};
  }
`

export const RangeBadge = styled.span<{ $active?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 22px;
  padding: 0 8px;
  border-radius: 999px;
  border: 1px solid
    ${({ $active, theme }) =>
      $active ? `${theme.colors.accent.primary}AA` : theme.colors.borders.primary};
  background: ${({ $active, theme }) =>
    $active ? `${theme.colors.accent.primary}22` : theme.colors.background.secondary};
  color: ${({ $active, theme }) =>
    $active ? theme.colors.text.primary : theme.colors.text.secondary};
  font-size: 11px;
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  letter-spacing: 0.05em;
  text-transform: uppercase;
`

export const RangeSummaryChip = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 40px;
  max-width: min(100%, 360px);
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.colors.borders.secondary};
  background: ${({ theme }) => theme.colors.background.primary}66;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 11px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

export const RangeLabel = styled.span`
  font-size: 11px;
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.text.secondary};
`

export const RangeInputGroup = styled.label`
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1 1 100%;
`

export const RangeInput = styled.input`
  width: 100%;
  min-height: 46px;
  background-color: ${({ theme }) => theme.colors.background.primary};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  color: ${({ theme }) => theme.colors.text.primary};
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  outline: none;

  &:focus {
    border-color: ${({ theme }) => theme.colors.accent.primary};
  }
`

export const RangeInputStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

export const ActionButton = styled.button<{
  $variant?: 'primary' | 'secondary' | 'danger' | 'success'
}>`
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: ${({ $variant, theme }) => {
    switch ($variant) {
      case 'primary':
        return theme.colors.accent.primary
      case 'success':
        return theme.colors.status.running
      case 'danger':
        return theme.colors.status.alarm
      default:
        return theme.colors.background.tertiary
    }
  }};
  color: #fff;
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  min-height: 40px;
  padding: 6px 12px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  cursor: pointer;
  transition: all 0.2s;
  text-transform: uppercase;

  &:hover {
    filter: brightness(1.1);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

export const RangeActionButton = styled(ActionButton)`
  min-height: 44px;
  padding: 8px 14px;
`

export const RangeHint = styled.div<{ $tone?: 'default' | 'error' }>`
  min-height: 18px;
  font-size: 11px;
  color: ${({ $tone, theme }) =>
    $tone === 'error' ? theme.colors.status.alarm : theme.colors.text.secondary};
`

export const RangeDialog = styled.div`
  width: min(92vw, 420px);
  background: ${({ theme }) => theme.colors.background.secondary};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  display: flex;
  flex-direction: column;
  overflow: hidden;

  @media (max-width: 768px) {
    width: 100vw;
    max-width: none;
    height: 100dvh;
    border-radius: 0;
  }
`

export const RangeDialogHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 16px 12px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borders.primary};
`

export const RangeDialogTitle = styled.h3`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  letter-spacing: 0.06em;
  text-transform: uppercase;
`

export const RangeDialogSubtitle = styled.p`
  margin: 6px 0 0;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.secondary};
`

export const RangeDialogClose = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  background: transparent;
  color: ${({ theme }) => theme.colors.text.secondary};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &:hover {
    color: ${({ theme }) => theme.colors.text.primary};
    border-color: ${({ theme }) => theme.colors.accent.primary};
  }
`

export const RangeDialogBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 16px;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
`

export const RangeDialogFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  flex-wrap: wrap;
  padding: 0 16px 16px;
`

export const RangeMetaRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
`

export const RangeMetaText = styled.span`
  font-size: 11px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.text.secondary};
`

export const ContentArea = styled.div`
  display: flex;
  flex-grow: 1;
  gap: 12px;
  min-height: 0;
  position: relative;

  @media (max-width: 768px) {
    display: block;
    min-height: 0;
  }
`

export const ChartSection = styled.div<{ $isShrunk?: boolean }>`
  flex-grow: 1;
  background-color: ${({ theme }) => theme.colors.background.secondary}99;
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 16px;
  display: flex;
  flex-direction: column;
  transition: margin-right 0.3s ease-in-out;
  /* When shrunk, we add margin to the right to make space for the panel */
  margin-right: ${({ $isShrunk }) => ($isShrunk ? '336px' : '0')};
  position: relative;

  @media (max-width: 768px) {
    margin-right: 0;
    padding: 12px;
  }
`

export const ChartCanvasShell = styled.div`
  position: relative;
  flex: 1;
  min-height: 0;
`

export const RecordingStatusBar = styled.div<{ $tone?: 'warning' | 'recording' | 'stopped' }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 12px;
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid
    ${({ $tone, theme }) => {
      if ($tone === 'recording') return `${theme.colors.status.running}88`
      if ($tone === 'stopped') return `${theme.colors.accent.primary}88`
      return '#facc15'
    }};
  background:
    ${({ $tone, theme }) => {
      if ($tone === 'recording') return `${theme.colors.status.running}18`
      if ($tone === 'stopped') return `${theme.colors.accent.primary}16`
      return 'rgba(250, 204, 21, 0.14)'
    }};
`

export const RecordingStatusText = styled.div<{ $tone?: 'warning' | 'recording' | 'stopped' }>`
  font-size: 12px;
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  letter-spacing: 0.03em;
  color: ${({ $tone, theme }) => {
    if ($tone === 'recording') return theme.colors.status.running
    if ($tone === 'stopped') return theme.colors.text.primary
    return '#facc15'
  }};
`

export const RecordingStatusMeta = styled.div`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.text.secondary};
`

export const DualChartsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  grid-template-rows: minmax(0, 1fr);
  gap: 14px;
  flex: 1;
  min-height: 0;

  @media (max-width: 1200px) {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: repeat(2, minmax(0, 1fr));
  }
`

export const DualChartPanel = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  background:
    linear-gradient(
      180deg,
      ${({ theme }) => theme.colors.background.secondary}CC 0%,
      ${({ theme }) => theme.colors.background.primary}E6 100%
    );
  box-shadow:
    ${({ theme }) => theme.shadows.md},
    inset 0 1px 0 rgba(255, 255, 255, 0.03);
  overflow: hidden;
`

export const DualChartHeader = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px 12px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borders.primary};
  background:
    linear-gradient(
      180deg,
      rgba(21, 35, 60, 0.92) 0%,
      rgba(13, 24, 43, 0.72) 100%
    );
`

export const DualChartHeaderInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`

export const DualChartHeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
`

export const DualChartTitle = styled.h3`
  margin: 0;
  color: ${({ theme }) => theme.colors.text.primary};
  font-family: ${({ theme }) => theme.typography.displayFamily};
  font-size: ${({ theme }) => theme.typography.sizes.lg};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  letter-spacing: 0.08em;
  text-transform: uppercase;
`

export const DualChartMeta = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 11px;
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  letter-spacing: 0.08em;
  text-transform: uppercase;
  white-space: nowrap;
`

export const DualChartExpandButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 34px;
  padding: 6px 10px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  background: ${({ theme }) => `${theme.colors.background.primary}CC`};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 10px;
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    transform 0.15s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.accent.primary};
    background: ${({ theme }) => `${theme.colors.accent.primary}18`};
    transform: translateY(-1px);
  }
`

export const DualChartBody = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  padding: 12px;
`

export const SidePanel = styled.div<{ $isOpen: boolean; $width?: string }>`
  width: ${({ $width }) => $width || '300px'};
  background-color: ${({ theme }) => theme.colors.background.secondary};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  display: flex;
  flex-direction: column;
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  transform: ${({ $isOpen }) => ($isOpen ? 'translateX(0)' : 'translateX(110%)')};
  transition: transform 0.3s ease-in-out;
  box-shadow: ${({ theme }) => theme.shadows.lg};
  z-index: 20;
  padding: 14px;
  gap: 16px;

  @media (max-width: 768px) {
    position: fixed;
    inset: 0;
    width: 100vw;
    border-radius: 0;
    border-left: none;
    border-right: none;
    border-bottom: none;
    padding: 16px 16px calc(20px + env(safe-area-inset-bottom));
    transform: ${({ $isOpen }) => ($isOpen ? 'translateY(0)' : 'translateY(105%)')};
    z-index: 120;
  }
`

export const PanelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borders.primary};

  h3 {
    margin: 0;
    font-size: ${({ theme }) => theme.typography.sizes.sm};
    text-transform: uppercase;
    color: ${({ theme }) => theme.colors.text.secondary};
    display: flex;
    align-items: center;
    gap: 8px;
  }
`

export const EmailList = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px;
  background-color: ${({ theme }) => theme.colors.background.primary}80;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.borders.secondary};
`

export const EmailItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.background.secondary};
  padding: 8px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  font-size: ${({ theme }) => theme.typography.sizes.xs};

  button {
    color: ${({ theme }) => theme.colors.text.secondary};
    &:hover {
      color: ${({ theme }) => theme.colors.status.alarm};
    }
  }
`

export const InputGroup = styled.div`
  display: flex;
  gap: 4px;

  input {
    flex-grow: 1;
    background-color: ${({ theme }) => theme.colors.background.primary};
    border: 1px solid ${({ theme }) => theme.colors.borders.primary};
    color: ${({ theme }) => theme.colors.text.primary};
    padding: 6px 10px;
    border-radius: ${({ theme }) => theme.borderRadius.sm};
    font-size: ${({ theme }) => theme.typography.sizes.xs};
    outline: none;

    &:focus {
      border-color: ${({ theme }) => theme.colors.accent.primary};
    }
  }
`

// Modal Styles
export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 260;
  animation: ${fadeIn} 0.2s ease-out;

  @media (max-width: 768px) {
    align-items: stretch;
  }
`

export const ModalContent = styled.div`
  background-color: ${({ theme }) => theme.colors.background.secondary};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  width: 95%;
  max-width: 1200px;
  height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: ${({ theme }) => theme.shadows.lg};

  @media (max-width: 768px) {
    width: 100vw;
    max-width: none;
    height: 100dvh;
    min-height: 100dvh;
    border-radius: 0;
  }
`

export const ModalHeader = styled.div`
  padding: 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borders.primary};
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.background.primary}80;
  border-radius: ${({ theme }) => theme.borderRadius.lg} ${({ theme }) => theme.borderRadius.lg} 0 0;

  h3 {
    margin: 0;
    color: ${({ theme }) => theme.colors.text.primary};
    display: flex;
    align-items: center;
    gap: 8px;
  }
`

export const ModalBody = styled.div`
  padding: 24px;

  @media (max-width: 768px) {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 16px;
  }
`

export const ModalFooter = styled.div`
  padding: 16px;
  border-top: 1px solid ${({ theme }) => theme.colors.borders.primary};
  display: flex;
  justify-content: flex-end;
  background-color: ${({ theme }) => theme.colors.background.primary}80;
  border-radius: 0 0 ${({ theme }) => theme.borderRadius.lg} ${({ theme }) => theme.borderRadius.lg};
`

export const MobileActionGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 12px;
`

export const MobileActionCard = styled.button<{ $primary?: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px solid
    ${({ $primary, theme }) =>
      $primary ? `${theme.colors.accent.primary}` : `${theme.colors.borders.primary}`};
  background:
    radial-gradient(
      circle at top right,
      ${({ $primary }) => ($primary ? 'rgba(72, 191, 255, 0.16)' : 'transparent')} 0%,
      transparent 42%
    ),
    linear-gradient(180deg, rgba(17, 28, 49, 0.98) 0%, rgba(10, 18, 33, 0.98) 100%);
  color: ${({ theme }) => theme.colors.text.primary};
  text-align: left;
  box-shadow: ${({ theme }) => theme.shadows.md};
  cursor: pointer;
`

export const MobileActionLabelStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`

export const MobileActionTitle = styled.div`
  font-family: ${({ theme }) => theme.typography.displayFamily};
  font-size: ${({ theme }) => theme.typography.sizes.lg};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  letter-spacing: 0.06em;
  text-transform: uppercase;
`

export const MobileActionMeta = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  line-height: 1.45;
`

export const MobileTrendModalBody = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  gap: 8px;
  padding: 12px 12px 16px;
`

export const MobileTrendToolbar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

export const MobileTrendChartFrame = styled.div`
  flex: 1;
  min-height: 0;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  background:
    linear-gradient(
      180deg,
      ${({ theme }) => theme.colors.background.secondary}CC 0%,
      ${({ theme }) => theme.colors.background.primary}F0 100%
    );
  padding: 8px;
`

export const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
`

export const CategoryCard = styled.div`
  background-color: ${({ theme }) => theme.colors.background.primary}40;
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: 12px;
`

export const CategoryTitle = styled.h4`
  font-size: 16px;
  font-weight: bold;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.accent.primary};
  margin: 0 0 12px 0;
  padding-bottom: 4px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borders.primary}80;
`

export const VariableButton = styled.button<{ $isSelected: boolean; $isDisabled: boolean }>`
  width: 100%;
  display: flex;
  align-items: flex-start;
  padding: 14px 10px;
  margin-bottom: 0;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid
    ${({ $isSelected, theme }) =>
      $isSelected ? theme.colors.accent.primary : theme.colors.borders.primary};
  background-color: ${({ $isSelected, theme }) =>
    $isSelected ? `${theme.colors.accent.primary}20` : theme.colors.background.primary};
  cursor: ${({ $isDisabled }) => ($isDisabled ? 'not-allowed' : 'pointer')};
  opacity: ${({ $isDisabled }) => ($isDisabled ? 0.5 : 1)};
  transition:
    background 0.2s,
    border-color 0.2s,
    transform 0.05s;

  &:hover {
    border-color: ${({ $isDisabled, theme }) =>
      $isDisabled ? theme.colors.borders.primary : theme.colors.accent.primary};
    background-color: ${({ $isDisabled, $isSelected, theme }) =>
      $isDisabled
        ? 'transparent'
        : $isSelected
          ? `${theme.colors.accent.primary}30`
          : theme.colors.background.tertiary};
  }

  &:active {
    transform: ${({ $isDisabled }) => ($isDisabled ? 'none' : 'scale(0.99)')};
  }

  span {
    font-size: ${({ theme }) => theme.typography.sizes.md};
    font-weight: ${({ theme }) => theme.typography.weights.bold};
    color: ${({ $isSelected, theme }) =>
      $isSelected ? theme.colors.text.primary : theme.colors.text.secondary};
  }
`

export const ColorDot = styled.div<{ color: string }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${({ color }) => color};
  margin-left: auto;
`

export const CheckBox = styled.div<{ $isSelected: boolean }>`
  width: 14px;
  height: 14px;
  border: 1px solid
    ${({ $isSelected, theme }) =>
      $isSelected ? theme.colors.accent.primary : theme.colors.text.disabled};
  background-color: ${({ $isSelected, theme }) =>
    $isSelected ? theme.colors.accent.primary : 'transparent'};
  margin-right: 8px;
  margin-top: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;

  svg {
    width: 12px;
    height: 12px;
    color: #fff;
  }
`

export const Toast = styled.div<{ $tone: 'success' | 'error' }>`
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid
    ${({ theme, $tone }) =>
      $tone === 'success' ? `${theme.colors.status.running}CC` : `${theme.colors.status.alarm}CC`};
  background: ${({ theme, $tone }) =>
    $tone === 'success' ? `${theme.colors.status.running}1F` : `${theme.colors.status.alarm}1F`};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
`
