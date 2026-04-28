import styled, { css } from 'styled-components'

export const PageContainer = styled.div<{ $embedded?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 16px;
  min-height: 0;
  width: 100%;
  ${({ $embedded }) =>
    $embedded
      ? css`
          height: 100%;
        `
      : css`
          height: 100%;
        `}
`

export const TopBar = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
`

export const TitleBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
  width: 100%;
`

export const Title = styled.h1`
  margin: 0;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.sizes.xxl};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  letter-spacing: 0.03em;
`

export const Subtitle = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.sizes.md};
  line-height: 1.45;
`

export const ControlRail = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px 14px;
  margin-top: 6px;
  width: 100%;
`

export const SelectorGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`

export const SelectorButton = styled.button<{ $active?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  padding: 0 16px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid
    ${({ $active, theme }) =>
      $active ? `${theme.colors.accent.primary}cc` : theme.colors.borders.primary};
  background: ${({ $active, theme }) =>
    $active
      ? `linear-gradient(180deg, ${theme.colors.accent.primary}22 0%, ${theme.colors.background.secondary} 100%)`
      : theme.colors.background.secondary};
  color: ${({ $active, theme }) =>
    $active ? theme.colors.text.primary : theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  cursor: pointer;
  transition:
    border-color 0.18s ease,
    background 0.18s ease,
    color 0.18s ease,
    transform 0.18s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.accent.primary};
    color: ${({ theme }) => theme.colors.text.primary};
    transform: translateY(-1px);
  }
`

export const StatusGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
`

export const StatusBadge = styled.div<{ $tone: 'ok' | 'warn' | 'off' }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 42px;
  padding: 0 16px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid
    ${({ $tone, theme }) =>
      $tone === 'ok'
        ? `${theme.colors.status.running}aa`
        : $tone === 'warn'
          ? `${theme.colors.status.warning}aa`
          : `${theme.colors.status.stopped}aa`};
  background: linear-gradient(
    180deg,
    ${({ $tone, theme }) =>
        $tone === 'ok'
          ? `${theme.colors.status.running}20`
          : $tone === 'warn'
            ? `${theme.colors.status.warning}20`
            : `${theme.colors.status.stopped}20`}
      0%,
    ${({ theme }) => theme.colors.background.primary} 100%
  );
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  letter-spacing: 0.08em;
  text-transform: uppercase;
`

export const SummaryChip = styled.div`
  display: inline-flex;
  align-items: center;
  min-height: 42px;
  padding: 0 14px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  background: ${({ theme }) => theme.colors.background.secondary};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  white-space: nowrap;
`

type IoCardTone = 'analog-input' | 'digital-input' | 'digital-output' | 'analog-output'

const getIoToneColor = (tone: IoCardTone, theme: any): string => {
  switch (tone) {
    case 'digital-input':
      return theme.colors.status.warning
    case 'digital-output':
      return theme.colors.status.stopped
    case 'analog-output':
      return '#ff9a57'
    case 'analog-input':
    default:
      return theme.colors.accent.primary
  }
}

export const IoCardsScroll = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 18px;
  height: 100%;
  min-height: 0;
  min-width: 100%;
  width: 100%;
  overflow: auto;
  padding: 12px;
`

export const IoSectionDivider = styled.div`
  width: 100%;
  height: 2px;
  margin: 6px 0 4px;
  flex: 0 0 auto;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  background: linear-gradient(
    90deg,
    ${({ theme }) => `${theme.colors.accent.primary}14`} 0%,
    ${({ theme }) => `${theme.colors.accent.primary}cc`} 50%,
    ${({ theme }) => `${theme.colors.accent.primary}14`} 100%
  );
  box-shadow: 0 0 18px ${({ theme }) => `${theme.colors.accent.primary}88`};
`

export const IoSection = styled.section`
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 12px;
  min-height: 0;
  min-width: 100%;
  width: 100%;
  position: relative;

  &:first-of-type {
    margin-top: 4px;
    padding-top: 18px;
  }

  &:first-of-type::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    border-radius: ${({ theme }) => theme.borderRadius.full};
    background: linear-gradient(
      90deg,
      ${({ theme }) => `${theme.colors.accent.primary}14`} 0%,
      ${({ theme }) => `${theme.colors.accent.primary}cc`} 50%,
      ${({ theme }) => `${theme.colors.accent.primary}14`} 100%
    );
    box-shadow: 0 0 18px ${({ theme }) => `${theme.colors.accent.primary}88`};
  }
`

export const IoSectionHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
`

export const IoSectionTitleBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`

export const IoSectionTitle = styled.h2`
  margin: 0;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.sizes.xl};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  letter-spacing: 0.03em;
`

export const IoSectionDescription = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
`

export const IoSectionMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`

export const IoCardGrid = styled.div`
  display: grid;
  flex: 1;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 14px;
  min-width: 100%;
  width: 100%;
  align-content: start;
`

export const IoModuleCard = styled.article<{ $tone: IoCardTone }>`
  display: flex;
  flex-direction: column;
  min-width: 0;
  gap: 12px;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px solid ${({ $tone, theme }) => `${getIoToneColor($tone, theme)}66`};
  background: linear-gradient(
    180deg,
    ${({ theme }) => theme.colors.background.secondary} 0%,
    ${({ theme }) => theme.colors.background.primary} 100%
  );
  box-shadow: ${({ theme }) => theme.shadows.md};
  padding: 12px;
  overflow: hidden;
`

export const IoModuleHeader = styled.div<{ $tone: IoCardTone }>`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
`

export const IoModuleHeaderSlot = styled.div<{ $tone: IoCardTone; $inactive?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  min-height: 42px;
  padding: 0 12px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ $tone, theme }) => `${getIoToneColor($tone, theme)}88`};
  background: ${({ $inactive, $tone, theme }) =>
    $inactive
      ? theme.colors.background.tertiary
      : `linear-gradient(180deg, ${getIoToneColor($tone, theme)}30 0%, ${theme.colors.background.secondary} 100%)`};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.sizes.md};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  letter-spacing: 0.06em;
  text-transform: uppercase;

  span {
    min-width: 0;
  }
`

export const IoModuleType = styled.div<{ $tone: IoCardTone }>`
  color: ${({ $tone, theme }) => getIoToneColor($tone, theme)};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  letter-spacing: 0.08em;
  text-transform: uppercase;
`

export const IoModuleChannels = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`

export const IoChannel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 7px;
  min-height: 132px;
  padding: 12px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  background: rgba(255, 255, 255, 0.03);
`

export const IoChannelHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`

export const IoBulb = styled.div<{ $active?: boolean }>`
  width: 22px;
  height: 22px;
  flex: 0 0 auto;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  border: 1px solid
    ${({ $active, theme }) =>
      $active ? `${theme.colors.status.running}cc` : theme.colors.borders.primary};
  background: ${({ $active, theme }) =>
    $active
      ? `radial-gradient(circle at 35% 35%, #f3ffd8 0%, ${theme.colors.status.running} 52%, #2d9e42 100%)`
      : 'radial-gradient(circle at 35% 35%, #405064 0%, #1a2333 60%, #0e1623 100%)'};
  box-shadow: ${({ $active, theme }) =>
    $active ? `0 0 18px ${theme.colors.status.running}aa` : 'inset 0 0 8px rgba(0, 0, 0, 0.45)'};
`

export const IoBulbButton = styled.button<{ $interactive?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  background: transparent;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  cursor: ${({ $interactive }) => ($interactive ? 'pointer' : 'help')};
  transition:
    transform 0.18s ease,
    opacity 0.18s ease;

  &:hover {
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.65;
    cursor: not-allowed;
    transform: none;
  }
`

export const IoChannelTitleBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`

export const IoChannelCode = styled.div`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  letter-spacing: 0.04em;
`

export const IoChannelName = styled.div`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 15px;
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  line-height: 1.15;
  overflow-wrap: anywhere;
  word-break: break-word;
`

export const IoChannelMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 12px;

  span {
    overflow-wrap: anywhere;
    word-break: break-word;
    line-height: 1.25;
  }
`

export const IoChannelValueRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: auto;
`

export const IoChannelState = styled.div<{ $active?: boolean }>`
  color: ${({ $active, theme }) =>
    $active ? theme.colors.status.running : theme.colors.text.secondary};
  font-size: 13px;
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  letter-spacing: 0.06em;
  text-transform: uppercase;
`

export const IoChannelValue = styled.div<{ $active?: boolean }>`
  color: ${({ $active, theme }) =>
    $active ? theme.colors.text.primary : theme.colors.text.secondary};
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace;
  font-size: 15px;
  font-weight: ${({ theme }) => theme.typography.weights.bold};
`

export const ForceLayout = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 12px;
  height: 100%;
  padding: 8px;
`

export const ForceCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  background: linear-gradient(
    180deg,
    ${({ theme }) => theme.colors.background.secondary} 0%,
    ${({ theme }) => theme.colors.background.primary} 100%
  );
  box-shadow: ${({ theme }) => theme.shadows.md};
  padding: 14px;
  min-height: 0;
`

export const ForceTitle = styled.h2`
  margin: 0;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.sizes.xl};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  letter-spacing: 0.03em;
`

export const ForceText = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.sizes.md};
  line-height: 1.5;
`

export const ForceFieldGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`

export const ForceField = styled.label`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

export const ForceFieldLabel = styled.span`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  letter-spacing: 0.06em;
  text-transform: uppercase;
`

export const ForceInput = styled.input`
  min-height: 46px;
  padding: 0 14px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  background: ${({ theme }) => theme.colors.background.secondary};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.sizes.md};
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.accent.primary};
    box-shadow: 0 0 0 1px ${({ theme }) => theme.colors.accent.primary}66;
  }
`

export const ForceInfoRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`

export const ForceNotice = styled.div<{ $tone: 'success' | 'error' }>`
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid
    ${({ $tone, theme }) =>
      $tone === 'success'
        ? `${theme.colors.status.running}88`
        : `${theme.colors.status.stopped}88`};
  background: ${({ $tone, theme }) =>
    $tone === 'success'
      ? `${theme.colors.status.running}14`
      : `${theme.colors.status.stopped}14`};
  color: ${({ theme }) => theme.colors.text.primary};
  padding: 10px 12px;
  line-height: 1.35;
`

export const ForceActionRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
`

export const ForceActionButton = styled.button<{ $tone: 'on' | 'off' | 'pulse' }>`
  min-height: 48px;
  padding: 0 16px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid
    ${({ $tone, theme }) =>
      $tone === 'on'
        ? `${theme.colors.status.running}88`
        : $tone === 'off'
          ? `${theme.colors.status.stopped}88`
          : `${theme.colors.status.warning}88`};
  background: ${({ $tone, theme }) =>
    $tone === 'on'
      ? `linear-gradient(180deg, ${theme.colors.status.running}20 0%, ${theme.colors.background.secondary} 100%)`
      : $tone === 'off'
        ? `linear-gradient(180deg, ${theme.colors.status.stopped}20 0%, ${theme.colors.background.secondary} 100%)`
        : `linear-gradient(180deg, ${theme.colors.status.warning}20 0%, ${theme.colors.background.secondary} 100%)`};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  letter-spacing: 0.04em;
  cursor: pointer;
  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    opacity 0.18s ease;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`

export const InlineForceCell = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
`

export const InlineForceToggle = styled.button<{
  $active?: boolean
  $disabled?: boolean
  $readOnly?: boolean
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  flex: 0 0 auto;
  border-radius: 8px;
  border: 1px solid
    ${({ $active, $readOnly, theme }) =>
      $active
        ? `${theme.colors.status.running}aa`
        : $readOnly
          ? `${theme.colors.borders.primary}cc`
          : theme.colors.borders.primary};
  background: ${({ $active, $readOnly, theme }) =>
    $active
      ? `linear-gradient(180deg, ${theme.colors.status.running}24 0%, ${theme.colors.background.secondary} 100%)`
      : $readOnly
        ? `${theme.colors.background.secondary}aa`
        : theme.colors.background.secondary};
  color: ${({ $active, $readOnly, theme }) =>
    $active
      ? theme.colors.status.running
      : $readOnly
        ? theme.colors.text.secondary
        : theme.colors.text.primary};
  cursor: ${({ $disabled, $readOnly }) =>
    $disabled || $readOnly ? 'not-allowed' : 'pointer'};
  font-size: ${({ theme }) => theme.typography.sizes.md};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    background 0.18s ease,
    opacity 0.18s ease;
  opacity: ${({ $disabled }) => ($disabled ? 0.65 : 1)};

  &:hover {
    transform: ${({ $disabled, $readOnly }) =>
      $disabled || $readOnly ? 'none' : 'translateY(-1px)'};
  }
`

export const InlineForceValue = styled.input`
  width: 96px;
  min-height: 34px;
  padding: 0 10px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  background: ${({ theme }) => theme.colors.background.secondary};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.accent.primary};
    box-shadow: 0 0 0 1px ${({ theme }) => theme.colors.accent.primary}55;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

export const InlineForceWriteButton = styled.button`
  min-height: 34px;
  padding: 0 12px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  border: 1px solid ${({ theme }) => theme.colors.accent.primary}88;
  background: linear-gradient(
    180deg,
    ${({ theme }) => theme.colors.accent.primary}20 0%,
    ${({ theme }) => theme.colors.background.secondary} 100%
  );
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  cursor: pointer;
  transition:
    transform 0.18s ease,
    opacity 0.18s ease;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`

export const InlineForceHint = styled.div<{ $tone?: 'muted' | 'warn' }>`
  color: ${({ $tone = 'muted', theme }) =>
    $tone === 'warn' ? theme.colors.status.warning : theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.sizes.xs ?? theme.typography.sizes.sm};
  white-space: nowrap;
`

export const TableCard = styled.div<{ $embedded?: boolean }>`
  display: flex;
  flex-direction: column;
  align-self: stretch;
  width: 100%;
  min-width: 100%;
  max-width: none;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  background: linear-gradient(
    180deg,
    ${({ theme }) => theme.colors.background.secondary} 0%,
    ${({ theme }) => theme.colors.background.primary} 100%
  );
  box-shadow: ${({ theme }) => theme.shadows.md};
  overflow: hidden;
  ${({ $embedded }) =>
    $embedded
      ? css`
          flex: 1;
          min-height: 0;
        `
      : css`
          flex: 1;
          min-height: 0;
        `}
`

export const TableScroll = styled.div`
  flex: 1;
  height: 100%;
  min-height: 0;
  width: 100%;
  overflow: auto;
`

export const Table = styled.table`
  width: 100%;
  min-width: 1480px;
  border-collapse: collapse;
  table-layout: auto;
`

export const HeadCell = styled.th`
  position: sticky;
  top: 0;
  z-index: 1;
  padding: 14px 12px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borders.primary};
  background: rgba(9, 17, 32, 0.98);
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  letter-spacing: 0.08em;
  text-align: left;
  text-transform: uppercase;
`

export const Row = styled.tr`
  &:nth-child(even) {
    background: rgba(255, 255, 255, 0.02);
  }
`

export const Cell = styled.td`
  padding: 12px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borders.primary};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  vertical-align: middle;
`

export const IndexCell = styled(Cell)`
  width: 64px;
  color: ${({ theme }) => theme.colors.text.secondary};
`

export const Tag = styled.div`
  color: ${({ theme }) => theme.colors.accent.primary};
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace;
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  word-break: break-word;
`

export const Description = styled.div`
  color: ${({ theme }) => theme.colors.text.primary};
  line-height: 1.35;
`

export const RenameableTextButton = styled.button`
  display: inline-flex;
  width: 100%;
  padding: 0;
  border: none;
  background: transparent;
  color: inherit;
  text-align: left;
  cursor: pointer;

  &:hover ${Description} {
    color: ${({ theme }) => theme.colors.accent.primary};
  }
`

export const ValueText = styled.div<{ $missing?: boolean }>`
  color: ${({ $missing, theme }) =>
    $missing ? theme.colors.text.secondary : theme.colors.text.primary};
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace;
  font-size: ${({ theme }) => theme.typography.sizes.md};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
`

export const MetaText = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
`

export const RenameModalBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px;
  color: ${({ theme }) => theme.colors.text.primary};
`

export const RenameModalTitle = styled.h2`
  margin: 0;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.sizes.xl};
`

export const RenameModalText = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.sizes.md};
  line-height: 1.45;
`

export const RenameModalField = styled.label`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

export const RenameModalLabel = styled.span`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  letter-spacing: 0.06em;
  text-transform: uppercase;
`

export const RenameModalInput = styled.input`
  min-height: 48px;
  padding: 0 14px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  background: ${({ theme }) => theme.colors.background.secondary};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.sizes.md};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.accent.primary};
    box-shadow: 0 0 0 1px ${({ theme }) => theme.colors.accent.primary}55;
  }
`

export const RenameModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 0 24px 24px;
  flex-wrap: wrap;
`

export const RenameModalButton = styled.button<{
  $tone?: 'neutral' | 'primary' | 'danger'
}>`
  min-width: 110px;
  min-height: 42px;
  padding: 0 16px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  border: 1px solid
    ${({ $tone = 'neutral', theme }) =>
      $tone === 'primary'
        ? `${theme.colors.accent.primary}aa`
        : $tone === 'danger'
          ? `${theme.colors.status.alarm}aa`
          : theme.colors.borders.primary};
  background: ${({ $tone = 'neutral', theme }) =>
    $tone === 'primary'
      ? `linear-gradient(180deg, ${theme.colors.accent.primary}24 0%, ${theme.colors.background.secondary} 100%)`
      : $tone === 'danger'
        ? `linear-gradient(180deg, ${theme.colors.status.alarm}20 0%, ${theme.colors.background.secondary} 100%)`
        : 'transparent'};
  color: ${({ $tone = 'neutral', theme }) =>
    $tone === 'danger'
      ? theme.colors.status.alarm
      : $tone === 'primary'
        ? theme.colors.text.primary
        : theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  cursor: pointer;

  &:hover:not(:disabled) {
    opacity: 0.92;
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`
