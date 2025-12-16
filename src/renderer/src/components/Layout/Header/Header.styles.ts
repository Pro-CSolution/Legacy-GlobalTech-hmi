import styled from 'styled-components'
import { HMI_CONFIG } from 'config/constants'

export const HeaderContainer = styled.header`
  height: ${HMI_CONFIG.UI.HEADER_HEIGHT}px;
  background: ${({ theme }) => theme.colors.background.primary}F2; /* 95% opacity */
  border-bottom: 1px solid ${({ theme }) => theme.colors.borders.primary};
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  backdrop-filter: blur(8px);
  z-index: 50;
  box-shadow: ${({ theme }) => theme.shadows.md};
`

export const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
`

export const Badge = styled.div`
  background: ${({ theme }) => theme.colors.background.secondary};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  padding: 4px 12px;
  display: flex;
  flex-direction: column;
`

export const BadgeLabel = styled.span`
  font-size: 10px;
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.text.secondary};
  letter-spacing: 0.1em;
  text-transform: uppercase;
`

export const BadgeValue = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.lg};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  letter-spacing: 0.05em;
`

export const Divider = styled.div`
  height: 32px;
  width: 1px;
  background: ${({ theme }) => theme.colors.borders.primary};
`

export const InfoText = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.text.secondary};

  span.separator {
    color: ${({ theme }) => theme.colors.borders.primary};
  }
`

export const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`

export const Time = styled.div`
  font-family: 'Roboto Mono', monospace;
  font-size: ${({ theme }) => theme.typography.sizes.xl};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.text.primary};
`

export const DateText = styled.div`
  font-size: 10px;
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.1em;
`

export const TimeBlock = styled.div`
  text-align: right;
`

export const AlarmButton = styled.button<{ $tone: 'ok' | 'warning' | 'alarm' }>`
  display: flex;
  align-items: center;
  gap: 10px;
  height: 64px;
  min-width: 240px;
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  background: ${({ theme }) => theme.colors.background.secondary};
  cursor: pointer;
  transition: all 0.15s ease;

  box-shadow: ${({ $tone, theme }) => {
    if ($tone === 'alarm') return `0 0 0 2px ${theme.colors.status.alarm}66`
    if ($tone === 'warning') return `0 0 0 2px ${theme.colors.status.warning}66`
    return 'none'
  }};

  &:hover {
    background: ${({ theme }) => theme.colors.background.tertiary};
  }

  &:active {
    transform: scale(0.99);
  }
`

export const AlarmIconWrap = styled.div<{ $tone: 'ok' | 'warning' | 'alarm' }>`
  width: 44px;
  height: 44px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme, $tone }) => {
    if ($tone === 'alarm') return `${theme.colors.status.alarm}22`
    if ($tone === 'warning') return `${theme.colors.status.warning}22`
    return `${theme.colors.accent.primary}1A`
  }};
  border: 1px solid
    ${({ theme, $tone }) => {
      if ($tone === 'alarm') return `${theme.colors.status.alarm}66`
      if ($tone === 'warning') return `${theme.colors.status.warning}66`
      return `${theme.colors.borders.primary}`
    }};
  color: ${({ theme, $tone }) => {
    if ($tone === 'alarm') return theme.colors.status.alarm
    if ($tone === 'warning') return theme.colors.status.warning
    return theme.colors.accent.primary
  }};
`

export const AlarmInfo = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2px;
  text-align: left;
`

export const AlarmCounts = styled.div`
  font-size: 12px;
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  letter-spacing: 0.08em;
  color: ${({ theme }) => theme.colors.text.primary};
`

export const AlarmAge = styled.div`
  font-family: 'Roboto Mono', monospace;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.secondary};
  letter-spacing: 0.06em;
`
