import styled from 'styled-components'

export const BottomNavContainer = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 90px;
  background-color: ${({ theme }) => theme.colors.background.tertiary};
  border-top: 1px solid ${({ theme }) => theme.colors.borders.primary};
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px;
  z-index: 10;
`

export const NavButton = styled.button<{
  variant?: 'primary' | 'secondary'
  $isActive?: boolean
}>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 110px;
  height: 70px;
  background-color: ${({ variant = 'primary', $isActive, theme }) => {
    if ($isActive) {
      return variant === 'secondary' ? theme.colors.accent.secondary : theme.colors.accent.primary
    }
    return theme.colors.background.secondary
  }};
  border: ${({ $isActive, theme }) =>
    $isActive ? `2px solid ${theme.colors.accent.primary}` : 'none'};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background-color: ${({ variant = 'primary', $isActive, theme }) => {
      if ($isActive) return 'inherit'
      return variant === 'secondary' ? theme.colors.accent.secondary : theme.colors.accent.primary
    }};
    transform: translateY(-1px);
    box-shadow: ${({ theme }) => theme.shadows.md};
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    background-color: ${({ theme }) => theme.colors.background.secondary};
    color: ${({ theme }) => theme.colors.text.disabled};
    cursor: not-allowed;
    opacity: 0.6;
  }
`

export const ButtonIcon = styled.div`
  font-size: 24px;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 24px;
  width: 100%;
  flex-shrink: 0;

  svg {
    width: 24px;
    height: 24px;
    display: block;
  }
`

export const ButtonLabel = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  text-align: center;
  line-height: 1.1;
  max-width: 100%;
  word-wrap: break-word;
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  letter-spacing: 0.5px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
`
