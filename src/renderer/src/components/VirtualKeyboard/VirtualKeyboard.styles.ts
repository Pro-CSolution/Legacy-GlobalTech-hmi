import styled, { keyframes } from 'styled-components'

const blink = keyframes`
  50% { opacity: 0; }
`

export const Overlay = styled.div<{ $visible: boolean }>`
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
  height: ${({ $visible }) => ($visible ? '380px' : '0')};
  background: ${({ theme }) => theme.colors.background.secondary};
  border-top: 3px solid ${({ theme }) => theme.colors.accent.primary};
  transition: height 0.28s cubic-bezier(0.16, 1, 0.3, 1);
  z-index: 2000;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.shadows.lg};
  pointer-events: ${({ $visible }) => ($visible ? 'auto' : 'none')};
`

export const Header = styled.div`
  height: 56px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: ${({ theme }) => theme.colors.background.primary}e6;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borders.primary};
  justify-content: center;

  & > div.header-content {
    display: flex;
    align-items: center;
    gap: 12px;
    max-width: 1200px;
    width: 100%;
    margin: 0 auto;
  }
`

export const Label = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.md};
  color: ${({ theme }) => theme.colors.text.primary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
  width: auto;
  min-width: 150px;
`

export const Preview = styled.div`
  flex: 1;
  min-height: 40px;
  padding: 10px 14px;
  background: ${({ theme }) => theme.colors.background.secondary};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-family: 'Roboto Mono', 'Inter', monospace;
  font-size: ${({ theme }) => theme.typography.sizes.lg};
  color: ${({ theme }) => theme.colors.text.primary};
  display: flex;
  align-items: center;
  gap: 4px;
  position: relative;
  white-space: pre;
  overflow: hidden;

  &::after {
    content: '|';
    color: ${({ theme }) => theme.colors.accent.primary};
    animation: ${blink} 1s step-end infinite;
  }
`

export const HeaderActions = styled.div`
  display: flex;
  gap: 8px;
  width: auto;

  & > button {
    flex: initial;
    min-width: 48px;
  }
`

export const Body = styled.div<{ $mode: 'numeric' | 'alpha' }>`
  flex: 1;
  padding: 10px 12px 14px;
  display: ${({ $mode }) => ($mode === 'numeric' ? 'grid' : 'flex')};
  gap: 8px;
  grid-template-columns: ${({ $mode }) => ($mode === 'numeric' ? 'repeat(4, 1fr)' : 'none')};
  grid-template-rows: ${({ $mode }) => ($mode === 'numeric' ? 'repeat(4, 1fr)' : 'none')};
  justify-content: center;

  & > div {
    max-width: ${({ $mode }) => ($mode === 'alpha' ? '1200px' : '600px')};
    width: 100%;
    margin: 0 auto;
  }
`

export const Row = styled.div`
  display: flex;
  gap: 6px;
  flex: 1;
`

export const KeyButton = styled.button<{
  $variant?: 'confirm' | 'cancel' | 'special'
  $active?: boolean
}>`
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  background: ${({ theme, $variant }) => {
    if ($variant === 'confirm') return theme.colors.accent.primary
    if ($variant === 'cancel') return theme.colors.status.stopped
    if ($variant === 'special') return theme.colors.background.tertiary
    return theme.colors.background.primary
  }};
  color: ${({ theme, $variant }) =>
    $variant === 'confirm' ? theme.colors.text.inverse : theme.colors.text.primary};
  box-shadow: 0 4px 0
    ${({ theme, $variant }) => {
      if ($variant === 'confirm') return `${theme.colors.accent.primary}80`
      if ($variant === 'cancel') return `${theme.colors.status.stopped}80`
      return `${theme.colors.background.primary}80`
    }};
  font-size: ${({ theme }) => theme.typography.sizes.lg};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.08s ease;
  position: relative;
  top: 0;
  padding: 8px;
  flex: 1;

  &:active {
    top: 3px;
    box-shadow: none;
  }

  ${({ $active, theme }) =>
    $active &&
    `
    background: ${theme.colors.accent.primary}66;
    border: 1px solid ${theme.colors.accent.primary};
  `}
`

export const KeyWide = styled(KeyButton)`
  flex: 1.5;
`

export const AlphaRow = styled.div`
  display: flex;
  gap: 6px;
  flex: 1;
`
