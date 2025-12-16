import styled from 'styled-components'

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`

export const Header = styled.div`
  padding: 18px 20px 14px 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borders.primary};
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
`

export const TitleGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`

export const Title = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.xl};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  letter-spacing: 0.02em;
`

export const Subtitle = styled.div`
  font-family: 'Roboto Mono', monospace;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.secondary};
  letter-spacing: 0.08em;
  text-transform: uppercase;
`

export const TypePill = styled.div<{ $tone: 'warning' | 'alarm' | 'neutral' }>`
  padding: 6px 10px;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-size: 12px;
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  letter-spacing: 0.1em;
  text-transform: uppercase;
  border: 1px solid
    ${({ theme, $tone }) =>
      $tone === 'alarm'
        ? `${theme.colors.status.alarm}CC`
        : $tone === 'warning'
          ? `${theme.colors.status.warning}CC`
          : `${theme.colors.borders.primary}`};
  background: ${({ theme, $tone }) =>
    $tone === 'alarm'
      ? `${theme.colors.status.alarm}1F`
      : $tone === 'warning'
        ? `${theme.colors.status.warning}1F`
        : `${theme.colors.background.tertiary}`};
  color: ${({ theme, $tone }) =>
    $tone === 'alarm'
      ? theme.colors.status.alarm
      : $tone === 'warning'
        ? theme.colors.status.warning
        : theme.colors.text.primary};
  white-space: nowrap;
`

export const Body = styled.div`
  padding: 18px 20px 20px 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  overflow: auto;
`

export const Section = styled.div`
  background: ${({ theme }) => theme.colors.background.primary};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 14px;
`

export const SectionTitle = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 12px;
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  text-transform: uppercase;
  letter-spacing: 0.12em;
  margin-bottom: 10px;
`

export const SectionText = styled.div`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.sizes.md};
  line-height: 1.35;
  white-space: pre-wrap;
`

export const MetaRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`

export const Tag = styled.div`
  padding: 6px 10px;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  background: ${({ theme }) => theme.colors.background.secondary};
  color: ${({ theme }) => theme.colors.text.primary};
  font-family: 'Roboto Mono', monospace;
  font-size: 12px;
`

export const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 0 20px 18px 20px;
  gap: 10px;
`

export const CloseButton = styled.button`
  padding: 10px 18px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  background: ${({ theme }) => theme.colors.background.tertiary};
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.colors.background.secondary};
  }
`
