import styled from 'styled-components'

export const ConfigContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 40px;
  width: 100%;
  height: 100%;
  overflow-y: auto;
`

export const Title = styled.h1`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.sizes.xxl};
  margin-bottom: 40px;
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  border-bottom: 1px solid ${({ theme }) => theme.colors.borders.primary};
  padding-bottom: 20px;
`

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
`

export const TimeZoneSection = styled.section`
  margin-top: 28px;
  padding: 28px;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  background:
    linear-gradient(
      135deg,
      ${({ theme }) => `${theme.colors.accent.primary}10`} 0%,
      transparent 38%
    ),
    ${({ theme }) => theme.colors.background.secondary};
  display: flex;
  flex-direction: column;
  gap: 22px;
`

export const TimeZoneHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
`

export const TimeZoneTitleGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

export const TimeZoneTitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  color: ${({ theme }) => theme.colors.text.primary};
`

export const TimeZoneTitle = styled.h2`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.sizes.xl};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
`

export const TimeZoneDescription = styled.p`
  margin: 0;
  max-width: 760px;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.sizes.md};
  line-height: 1.45;
`

export const TimeZoneSummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
`

export const TimeZoneSummaryCard = styled.div`
  padding: 18px 20px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  background: ${({ theme }) => theme.colors.background.primary};
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 124px;
`

export const SummaryLabel = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  color: ${({ theme }) => theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.08em;
`

export const SummaryValue = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.xl};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  font-family: 'Roboto Mono', monospace;
  line-height: 1.2;
`

export const SummaryMeta = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.md};
  color: ${({ theme }) => theme.colors.text.primary};
  line-height: 1.35;
`

export const SummaryHint = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.4;
`

export const TimeZoneOptionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
`

export const TimeZoneOptionButton = styled.button<{ $selected: boolean }>`
  min-height: 156px;
  padding: 20px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid
    ${({ theme, $selected }) =>
      $selected ? theme.colors.accent.primary : theme.colors.borders.primary};
  background: ${({ theme, $selected }) =>
    $selected ? `${theme.colors.accent.primary}14` : theme.colors.background.primary};
  color: ${({ theme }) => theme.colors.text.primary};
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  cursor: pointer;
  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    background 0.18s ease,
    box-shadow 0.18s ease;
  box-shadow: ${({ theme, $selected }) =>
    $selected ? `0 0 0 2px ${theme.colors.accent.primary}22` : 'none'};

  &:hover {
    transform: translateY(-2px);
    border-color: ${({ theme }) => theme.colors.accent.primary};
    background: ${({ theme, $selected }) =>
      $selected ? `${theme.colors.accent.primary}1c` : theme.colors.background.secondary};
  }

  &:disabled {
    opacity: 0.65;
    cursor: not-allowed;
    transform: none;
  }
`

export const TimeZoneOptionLabel = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.lg};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
`

export const TimeZoneOptionTime = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.xl};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  font-family: 'Roboto Mono', monospace;
  color: ${({ theme }) => theme.colors.text.primary};
`

export const TimeZoneOptionMeta = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.35;
`

export const TimeZoneFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
`

export const StatusBanner = styled.div<{ $tone?: 'info' | 'success' | 'error' }>`
  flex: 1;
  min-width: 280px;
  padding: 12px 14px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid
    ${({ theme, $tone = 'info' }) => {
      if ($tone === 'error') return `${theme.colors.status.alarm}66`
      if ($tone === 'success') return `${theme.colors.status.running}66`
      return theme.colors.borders.primary
    }};
  background: ${({ theme, $tone = 'info' }) => {
    if ($tone === 'error') return `${theme.colors.status.alarm}14`
    if ($tone === 'success') return `${theme.colors.status.running}14`
    return theme.colors.background.primary
  }};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  line-height: 1.4;
`

export const ApplyButton = styled.button`
  min-width: 190px;
  padding: 14px 20px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid transparent;
  background: ${({ theme }) => theme.colors.accent.primary};
  color: ${({ theme }) => theme.colors.text.inverse};
  font-size: ${({ theme }) => theme.typography.sizes.md};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  cursor: pointer;
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;

  &:hover {
    opacity: 0.94;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`

export const ConfigCard = styled.button`
  background: ${({ theme }) => theme.colors.background.secondary};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: ${({ theme }) => theme.colors.text.primary};

  &:hover {
    background: ${({ theme }) => theme.colors.background.tertiary};
    border-color: ${({ theme }) => theme.colors.accent.primary};
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.md};
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.65;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`

export const CardIcon = styled.div`
  color: ${({ theme }) => theme.colors.accent.primary};
  background: ${({ theme }) => `${theme.colors.accent.primary}15`};
  padding: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;

  ${ConfigCard}:hover & {
    background: ${({ theme }) => `${theme.colors.accent.primary}25`};
  }
`

export const CardLabel = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.lg};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
`

export const CardDescription = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  text-align: center;
`
