import styled from 'styled-components'

export const MainContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;

  @media (max-width: 768px) {
    height: auto;
    min-height: 0;
  }
`

export const HeaderRightLayout = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: 100%;
  white-space: normal;
  text-transform: none;
  opacity: 1;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    justify-content: flex-start;
    gap: 12px;
  }
`

export const HeaderCenterControls = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  display: inline-flex;
  align-items: center;
  gap: 14px;
  pointer-events: auto;

  @media (max-width: 768px) {
    position: static;
    left: auto;
    top: auto;
    transform: none;
    width: 100%;
    justify-content: stretch;
  }
`

export const HeaderRightInfo = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 12px;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: flex-start;
  }
`

export const HeaderMotorSelector = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 5px;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  background: rgba(13, 23, 48, 0.86);
  box-shadow: ${({ theme }) => theme.shadows.sm};

  @media (max-width: 768px) {
    width: 100%;
    justify-content: stretch;
    flex-wrap: wrap;
    gap: 8px;
  }
`

export const HeaderMotorOption = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 10px;

  @media (max-width: 768px) {
    flex: 1 1 calc(50% - 4px);
    min-width: 0;
  }
`

export const HeaderMotorButton = styled.button<{ $active: boolean }>`
  min-width: 164px;
  height: 40px;
  padding: 0 20px;
  border: 1px solid
    ${({ $active, theme }) =>
      $active ? `${theme.colors.borders.active}cc` : `${theme.colors.borders.primary}`};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background:
    radial-gradient(
      circle at top center,
      ${({ $active }) => ($active ? 'rgba(122, 223, 255, 0.18)' : 'transparent')} 0%,
      transparent 54%
    ),
    linear-gradient(
      180deg,
      ${({ $active, theme }) =>
          $active ? `${theme.colors.background.tertiary}` : `${theme.colors.background.secondary}`}
        0%,
      ${({ theme }) => theme.colors.background.primary} 100%
    );
  color: ${({ $active, theme }) =>
    $active ? theme.colors.accent.primary : theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.sizes.lg};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
  box-shadow: ${({ $active, theme }) =>
    $active ? `0 0 18px rgba(122, 223, 255, 0.18)` : theme.shadows.sm};
  transition:
    transform 0.18s ease,
    background 0.18s ease,
    border-color 0.18s ease,
    color 0.18s ease,
    box-shadow 0.18s ease;

  &:hover {
    transform: translateY(-1px);
    border-color: ${({ $active, theme }) =>
      $active ? `${theme.colors.borders.active}` : `${theme.colors.borders.active}90`};
  }

  &:active {
    transform: scale(0.98);
  }

  @media (max-width: 768px) {
    min-width: 0;
    width: 100%;
    padding: 0 14px;
    font-size: ${({ theme }) => theme.typography.sizes.md};
  }
`

export const HeaderAlarmLight = styled.span<{ $active: boolean }>`
  position: relative;
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  border-radius: 9999px;
  overflow: hidden;
  border: 1px solid
    ${({ $active }) => ($active ? 'rgba(255, 160, 160, 0.9)' : 'rgba(120, 24, 24, 0.85)')};
  background: radial-gradient(
    circle at 50% 50%,
    ${({ $active }) =>
      $active
        ? 'rgba(255, 118, 118, 1) 0%, rgba(255, 74, 74, 1) 42%, rgba(225, 24, 24, 1) 70%, rgba(112, 6, 6, 1) 100%'
        : 'rgba(120, 24, 24, 0.55) 0%, rgba(88, 10, 10, 0.72) 46%, rgba(40, 4, 4, 0.96) 100%'};
  );
  box-shadow:
    inset 0 1px 2px rgba(255, 255, 255, 0.2),
    inset 0 0 8px ${({ $active }) => ($active ? 'rgba(255, 24, 24, 0.75)' : 'rgba(0, 0, 0, 0.35)')},
    ${({ $active }) =>
      $active
        ? '0 0 10px rgba(255, 64, 64, 0.88), 0 0 22px rgba(255, 32, 32, 0.55)'
        : '0 0 0 rgba(0, 0, 0, 0)'};
  transition:
    background 0.18s ease,
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    transform 0.18s ease;

  &::after {
    content: '';
    position: absolute;
    inset: 4px;
    border-radius: inherit;
    background: ${({ $active }) =>
      $active
        ? 'radial-gradient(circle, rgba(255, 188, 188, 0.98) 0%, rgba(255, 76, 76, 0.96) 48%, rgba(196, 10, 10, 0.96) 100%)'
        : 'radial-gradient(circle, rgba(124, 28, 28, 0.75) 0%, rgba(72, 10, 10, 0.88) 100%)'};
    box-shadow: ${({ $active }) => ($active ? '0 0 8px rgba(255, 72, 72, 0.9)' : 'none')};
  }

  ${HeaderMotorOption}:hover & {
    transform: scale(1.05);
  }
`

export const HeaderMetaText = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  letter-spacing: 0.08em;
  text-transform: uppercase;
  white-space: nowrap;
  text-align: right;

  @media (max-width: 768px) {
    width: 100%;
    white-space: normal;
    text-align: left;
  }
`

export const SummaryLayout = styled.div`
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  gap: 16px;
  height: 100%;
  min-height: 0;

  @media (max-width: 768px) {
    flex-direction: column;
    height: auto;
  }
`

export const Metrics = styled.div`
  flex: 1;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  height: 100%;
  min-height: 0;

  @media (max-width: 960px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 640px) {
    grid-template-columns: minmax(0, 1fr);
    height: auto;
  }
`

export const Metric = styled.div`
  background: ${({ theme }) => theme.colors.background.primary};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 6px;
  min-height: 0;
  overflow: hidden;
`

export const MetricLabel = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  letter-spacing: 0.12em;
  text-transform: uppercase;
`

export const MetricValue = styled.div`
  color: ${({ theme }) => theme.colors.text.primary};
  font-family: 'Roboto Mono', monospace;
  font-size: 38px;
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  line-height: 1;
`

export const MetricValueCompact = styled(MetricValue)`
  font-size: 30px;
`

export const Actions = styled.div`
  width: 420px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 10px;
  min-height: 0;

  @media (max-width: 768px) {
    width: 100%;
  }
`

export const ActionsRow = styled.div`
  display: flex;
  gap: 10px;

  @media (max-width: 640px) {
    flex-direction: column;
  }
`

export const ScrollLayout = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  height: 100%;
  min-height: 0;

  @media (max-width: 768px) {
    height: auto;
  }
`

export const ScrollButton = styled.button`
  width: 100%;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.background.tertiary};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
  user-select: none;
  flex-shrink: 0;

  &:active {
    background: ${({ theme }) => `${theme.colors.accent.primary}1F`};
    border-color: ${({ theme }) => `${theme.colors.borders.active}80`};
  }
`

export const ScrollViewport = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 2px 0;

  @media (max-width: 768px) {
    flex: 0 0 auto;
    max-height: 320px;
  }
`

export const TableEmpty = styled.div`
  margin-top: 10px;
  padding: 18px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px dashed ${({ theme }) => theme.colors.borders.primary};
  color: ${({ theme }) => theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  text-align: center;
`

export const TableRowButton = styled.button<{ $tone?: 'neutral' | 'warning' | 'alarm' }>`
  width: 100%;
  min-height: 56px;
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  background: ${({ theme }) => theme.colors.background.primary};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  cursor: pointer;
  transition: all 0.15s ease;
  flex-shrink: 0;

  &:hover:not(:disabled) {
    border-color: ${({ theme }) => theme.colors.borders.active}80;
    box-shadow: ${({ theme }) => theme.shadows.sm};
  }

  &:active:not(:disabled) {
    transform: scale(0.99);
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    align-items: flex-start;
    flex-direction: column;
    gap: 8px;
  }
`

export const RowLeft = styled.div`
  display: flex;
  align-items: baseline;
  gap: 10px;
  min-width: 0;

  @media (max-width: 768px) {
    width: 100%;
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
`

export const RowSlot = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 12px;
  white-space: nowrap;
`

export const RowCode = styled.div<{ $isEmpty?: boolean; $compact?: boolean }>`
  font-size: ${({ $compact }) => ($compact ? '16px' : '22px')};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme, $isEmpty }) =>
    $isEmpty ? theme.colors.text.disabled : theme.colors.text.primary};
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  @media (max-width: 768px) {
    width: 100%;
    overflow: visible;
    text-overflow: unset;
    white-space: normal;
    line-height: 1.15;
  }
`

export const RowRight = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  flex-shrink: 0;
  min-width: 136px;

  @media (max-width: 768px) {
    width: 100%;
    min-width: 0;
    align-items: flex-start;
  }
`

export const RowTimestamp = styled.div<{ $isUnavailable?: boolean }>`
  color: ${({ theme, $isUnavailable }) =>
    $isUnavailable ? theme.colors.text.disabled : theme.colors.text.primary};
  font-family: 'Roboto Mono', monospace;
  font-size: 13px;
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  letter-spacing: 0.04em;
  white-space: nowrap;

  @media (max-width: 768px) {
    white-space: normal;
  }
`

export const RowHint = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  white-space: nowrap;

  @media (max-width: 768px) {
    width: 100%;
    white-space: normal;
    line-height: 1.3;
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
