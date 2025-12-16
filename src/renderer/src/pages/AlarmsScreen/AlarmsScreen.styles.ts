import styled from 'styled-components'

export const MainContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`

export const SummaryLayout = styled.div`
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  gap: 16px;
  height: 100%;
  min-height: 0;
`

export const Metrics = styled.div`
  flex: 1;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  height: 100%;
  min-height: 0;
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

export const MetricSubValue = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  letter-spacing: 0.08em;
  text-transform: uppercase;
`

export const Actions = styled.div`
  width: 420px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 10px;
  min-height: 0;
`

export const ActionsRow = styled.div`
  display: flex;
  gap: 10px;
`

export const ScrollLayout = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  height: 100%;
  min-height: 0;
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
`

export const RowLeft = styled.div`
  display: flex;
  align-items: baseline;
  gap: 10px;
  min-width: 0;
`

export const RowSlot = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 12px;
  white-space: nowrap;
`

export const RowCode = styled.div<{ $isEmpty?: boolean }>`
  font-size: 22px;
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme, $isEmpty }) => ($isEmpty ? theme.colors.text.disabled : theme.colors.text.primary)};
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

export const RowHint = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  white-space: nowrap;
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

export const ManualModalBody = styled.div`
  height: min(86vh, 980px);
  display: flex;
  flex-direction: column;
  min-height: 0;
`

export const ManualModalHeader = styled.div`
  padding: 16px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borders.primary};
  flex-shrink: 0;
`

export const ManualModalTitle = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.xl};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  letter-spacing: 0.06em;
  text-transform: uppercase;
`

export const ManualModalClose = styled.button`
  width: 56px;
  height: 56px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  background: ${({ theme }) => theme.colors.background.tertiary};
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: ${({ theme }) => theme.colors.background.secondary};
  }

  &:active {
    transform: scale(0.99);
  }
`

export const ManualModalContent = styled.div`
  flex: 1;
  padding: 14px 18px 18px 18px;
  overflow: hidden;
  min-height: 0;
`



