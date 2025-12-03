import styled, { css, keyframes } from 'styled-components'
import { getPositionStyles, PositionProps } from '../../styles/mixins'

export const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
  70% { box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
  100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
`

export const getStatusStyles = (status: string, theme: any) => {
  const s = status.toLowerCase()

  if (['on', 'ok', 'local', 'closed', 'running'].includes(s)) {
    return css`
      background: ${theme.colors.status.running}20;
      color: ${theme.colors.status.running};
      border-color: ${theme.colors.status.running}80;
      box-shadow: 0 0 10px ${theme.colors.status.running}20;
    `
  }

  if (['fault', 'high', 'critical'].includes(s)) {
    return css`
      background: ${theme.colors.status.alarm}20;
      color: ${theme.colors.status.alarm};
      border-color: ${theme.colors.status.alarm}80;
      box-shadow: 0 0 10px ${theme.colors.status.alarm}20;
      animation: ${pulse} 2s infinite;
    `
  }

  if (['warning', 'warn'].includes(s)) {
    return css`
      background: ${theme.colors.status.warning}20;
      color: ${theme.colors.status.warning};
      border-color: ${theme.colors.status.warning}80;
    `
  }

  // Default / Stopped / Off
  return css`
    background: ${theme.colors.background.tertiary};
    color: ${theme.colors.text.disabled};
    border-color: ${theme.colors.borders.primary};
  `
}

export const Container = styled.div<PositionProps>`
  display: flex;
  flex-direction: column;
  margin-bottom: 8px;

  ${(props) => getPositionStyles(props)}
`

export const Label = styled.span`
  font-size: 18px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: 4px;
  margin-left: 4px;
`

export const Badge = styled.div<{ status: string }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid transparent;
  transition: all 0.3s ease;

  ${({ status, theme }) => getStatusStyles(status, theme)}
`

export const StatusText = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 20px;
`
