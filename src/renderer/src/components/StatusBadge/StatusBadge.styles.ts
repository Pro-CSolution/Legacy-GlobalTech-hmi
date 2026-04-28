import styled, { css, keyframes } from 'styled-components'
import { getPositionStyles, PositionProps, shouldForwardPositionProp } from 'styles/mixins'
import { Theme } from 'styles/theme'

export const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
  70% { box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
  100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
`

export const getStatusStyles = (status: string, theme: Theme) => {
  const s = status.toLowerCase()

  if (['on', 'ok', 'local', 'closed', 'running'].includes(s)) {
    return css`
      background: linear-gradient(180deg, rgba(24, 53, 39, 0.9) 0%, rgba(16, 37, 28, 0.94) 100%);
      color: ${theme.colors.status.running};
      border-color: rgba(151, 242, 168, 0.28);
      box-shadow: 0 0 12px rgba(151, 242, 168, 0.12);
    `
  }

  if (['fault', 'high', 'critical'].includes(s)) {
    return css`
      background: linear-gradient(180deg, rgba(70, 28, 28, 0.94) 0%, rgba(44, 18, 18, 0.96) 100%);
      color: ${theme.colors.status.alarm};
      border-color: rgba(255, 106, 106, 0.32);
      box-shadow: 0 0 12px rgba(255, 106, 106, 0.12);
      animation: ${pulse} 2s infinite;
    `
  }

  if (['warning', 'warn'].includes(s)) {
    return css`
      background: linear-gradient(180deg, rgba(78, 58, 22, 0.94) 0%, rgba(52, 39, 16, 0.96) 100%);
      color: ${theme.colors.status.warning};
      border-color: rgba(255, 214, 107, 0.3);
    `
  }

  // Default / Stopped / Off
  return css`
    background: linear-gradient(180deg, rgba(35, 49, 78, 0.95) 0%, rgba(27, 38, 60, 0.98) 100%);
    color: ${theme.colors.text.secondary};
    border-color: ${theme.colors.borders.primary};
  `
}

export const Container = styled.div.withConfig({
  shouldForwardProp: (prop) => shouldForwardPositionProp(prop)
})<PositionProps>`
  display: flex;
  flex-direction: column;
  margin-bottom: 8px;

  ${(props) => getPositionStyles(props)}
`

export const Label = styled.span`
  font-family: ${({ theme }) => theme.typography.displayFamily};
  font-size: 18px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: 4px;
  margin-left: 4px;
`

export const Badge = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'status'
})<{ status: string }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid transparent;
  transition: all 0.3s ease;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);

  ${({ status, theme }) => getStatusStyles(status, theme)}
`

export const StatusText = styled.span`
  font-family: ${({ theme }) => theme.typography.displayFamily};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 20px;
`
