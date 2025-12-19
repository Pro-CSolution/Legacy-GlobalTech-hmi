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
  flex-shrink: 0;
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
  padding: 8px 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  height: 60px;
  justify-content: center;
`

export const BadgeLabel = styled.span`
  font-size: 10px;
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.text.secondary};
  letter-spacing: 0.1em;
  text-transform: uppercase;
  line-height: 1.1;
`

export const BadgeValue = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.lg};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  letter-spacing: 0.05em;
  line-height: 1.3;
`

export const Divider = styled.div`
  height: 48px;
  width: 1px;
  background: ${({ theme }) => theme.colors.borders.primary};
  flex-shrink: 0;
`

export const InfoText = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.3;
  font-weight: ${({ theme }) => theme.typography.weights.medium};

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
  line-height: 1.3;
`

export const DateText = styled.div`
  font-size: 14px;
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.1em;
  line-height: 1.3;
`

export const TimeBlock = styled.div`
  text-align: right;
  display: flex;
  flex-direction: column;
  gap: 5px;
  justify-content: center;
`

export const AlarmButton = styled.button<{ $tone: 'ok' | 'warning' | 'alarm' }>`
  display: flex;
  align-items: center;
  gap: 12px;
  height: 60px;
  min-width: 260px;
  padding: 10px 14px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  background: ${({ theme }) => theme.colors.background.secondary};
  cursor: pointer;
  transition: all 0.15s ease;
  flex-shrink: 0;

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
  width: 40px;
  height: 40px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
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
  gap: 4px;
  text-align: left;
  flex: 1;
  min-width: 0;
`

export const AlarmCounts = styled.div`
  font-size: 12px;
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  letter-spacing: 0.08em;
  color: ${({ theme }) => theme.colors.text.primary};
  line-height: 1.3;
`

export const AlarmAge = styled.div`
  font-family: 'Roboto Mono', monospace;
  font-size: 11px;
  color: ${({ theme }) => theme.colors.text.secondary};
  letter-spacing: 0.06em;
  line-height: 1.3;
`

export const CommGroup = styled.div`
  display: flex;
  flex-direction: row;
  gap: 8px;
  align-items: center;
`

export const CommPill = styled.div<{ $tone: 'ok' | 'off' | 'warning' }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  height: 60px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme }) => theme.colors.background.secondary};
  border: 1px solid
    ${({ theme, $tone }) => {
      if ($tone === 'off') return `${theme.colors.status.alarm}66`
      if ($tone === 'warning') return `${theme.colors.status.warning}66`
      return `${theme.colors.status.running}66`
    }};
  transition: all 0.2s ease;
  flex-shrink: 0;
`

export const CommDot = styled.div<{ $tone: 'ok' | 'off' | 'warning' }>`
  width: 10px;
  height: 10px;
  border-radius: 9999px;
  background: ${({ theme, $tone }) => {
    if ($tone === 'off') return theme.colors.status.alarm
    if ($tone === 'warning') return theme.colors.status.warning
    return theme.colors.status.running
  }};
  box-shadow: ${({ theme, $tone }) => {
    if ($tone === 'ok') return `0 0 10px ${theme.colors.status.running}88`
    return 'none'
  }};
  flex-shrink: 0;
`

export const CommText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  line-height: 1;
  justify-content: center;
`

export const CommTitle = styled.div`
  font-size: 10px;
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  letter-spacing: 0.1em;
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.1;
`

export const CommValue = styled.div`
  font-family: 'Roboto Mono', monospace;
  font-size: 14px;
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  letter-spacing: 0.08em;
  color: ${({ theme }) => theme.colors.text.primary};
  line-height: 1.3;
`

export const CommSub = styled.div`
  font-family: 'Roboto Mono', monospace;
  font-size: 12px;
  letter-spacing: 0.04em;
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.3;
`

export const ConfigButton = styled.button`
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.background.secondary};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;

  &:hover {
    background: ${({ theme }) => theme.colors.background.tertiary};
    color: ${({ theme }) => theme.colors.accent.primary};
    border-color: ${({ theme }) => theme.colors.accent.primary};
  }
`
