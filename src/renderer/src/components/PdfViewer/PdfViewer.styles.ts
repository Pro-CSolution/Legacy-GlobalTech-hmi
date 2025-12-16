import styled from 'styled-components'

export const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
`

export const Toolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  background: ${({ theme }) => theme.colors.background.primary};
`

export const ToolbarGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`

export const ToolButton = styled.button`
  min-width: 56px;
  height: 52px;
  padding: 0 14px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  background: ${({ theme }) => theme.colors.background.secondary};
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  letter-spacing: 0.06em;
  text-transform: uppercase;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover:not(:disabled) {
    border-color: ${({ theme }) => theme.colors.borders.active};
    box-shadow: ${({ theme }) => theme.shadows.sm};
  }

  &:active:not(:disabled) {
    transform: scale(0.99);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

export const PageIndicator = styled.button`
  height: 52px;
  min-width: 200px;
  padding: 0 16px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  background: ${({ theme }) => theme.colors.background.secondary};
  color: ${({ theme }) => theme.colors.text.primary};
  font-family: 'Roboto Mono', monospace;
  font-size: ${({ theme }) => theme.typography.sizes.md};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;

  &:hover {
    border-color: ${({ theme }) => theme.colors.borders.active};
  }

  &:active {
    transform: scale(0.99);
  }
`

export const Viewer = styled.div`
  flex: 1;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  background: ${({ theme }) => theme.colors.background.primary};
  overflow: auto;
  padding: 12px;
`

export const PageWrap = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
`

export const InfoText = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 12px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
`
