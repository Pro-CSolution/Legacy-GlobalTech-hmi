import styled from 'styled-components'

export const Body = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 0;
`

export const Header = styled.div`
  padding: 18px 20px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borders.primary};
`

export const TitleGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
`

export const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
`

export const Title = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.xl};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.text.primary};
`

export const Subtitle = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.35;
`

export const CloseButton = styled.button`
  width: 52px;
  height: 52px;
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
    border-color: ${({ theme }) => theme.colors.text.secondary};
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`

export const Content = styled.div`
  padding: 18px 20px 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`

export const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`

export const SummaryCard = styled.div`
  padding: 14px 16px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  background: ${({ theme }) => theme.colors.background.secondary};
  display: flex;
  flex-direction: column;
  gap: 6px;
`

export const SummaryLabel = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.04em;
`

export const SummaryValue = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.xl};
  color: ${({ theme }) => theme.colors.text.primary};
  font-family: 'Roboto Mono', monospace;
  font-weight: ${({ theme }) => theme.typography.weights.bold};
`

export const SummaryMeta = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.35;
`

export const OptionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`

export const OptionButton = styled.button<{ $selected: boolean }>`
  min-height: 118px;
  padding: 16px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid
    ${({ theme, $selected }) =>
      $selected ? theme.colors.accent.primary : theme.colors.borders.primary};
  background: ${({ theme, $selected }) =>
    $selected ? `${theme.colors.accent.primary}14` : theme.colors.background.secondary};
  color: ${({ theme }) => theme.colors.text.primary};
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  cursor: pointer;
  transition:
    border-color 0.18s ease,
    background 0.18s ease,
    transform 0.18s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.accent.primary};
    background: ${({ theme, $selected }) =>
      $selected ? `${theme.colors.accent.primary}1c` : theme.colors.background.tertiary};
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.65;
    cursor: not-allowed;
    transform: none;
  }
`

export const OptionLabel = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.lg};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
`

export const OptionTime = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.lg};
  font-family: 'Roboto Mono', monospace;
  font-weight: ${({ theme }) => theme.typography.weights.bold};
`

export const OptionMeta = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.35;
`

export const Hint = styled.div`
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  background: ${({ theme }) => theme.colors.background.secondary};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  line-height: 1.4;
`

export const StatusBanner = styled.div<{ $tone?: 'info' | 'error' }>`
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  line-height: 1.35;
  border: 1px solid
    ${({ theme, $tone = 'info' }) =>
      $tone === 'error' ? `${theme.colors.status.alarm}66` : theme.colors.borders.primary};
  background: ${({ theme, $tone = 'info' }) =>
    $tone === 'error' ? `${theme.colors.status.alarm}18` : theme.colors.background.secondary};
  color: ${({ theme }) => theme.colors.text.primary};
`

export const EmptyState = styled.div`
  min-height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.sizes.md};
`

export const Footer = styled.div`
  padding: 0 20px 18px 20px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  border-top: 1px solid ${({ theme }) => theme.colors.borders.primary};
`

export const Button = styled.button<{ $primary?: boolean }>`
  padding: 10px 16px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  border: 1px solid
    ${({ theme, $primary }) => ($primary ? 'transparent' : theme.colors.borders.primary)};
  background: ${({ theme, $primary }) => ($primary ? theme.colors.accent.primary : 'transparent')};
  color: ${({ theme, $primary }) =>
    $primary ? theme.colors.text.inverse : theme.colors.text.primary};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  cursor: pointer;
  min-width: 120px;

  &:hover {
    opacity: 0.92;
    border-color: ${({ theme, $primary }) =>
      $primary ? 'transparent' : theme.colors.text.secondary};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`
