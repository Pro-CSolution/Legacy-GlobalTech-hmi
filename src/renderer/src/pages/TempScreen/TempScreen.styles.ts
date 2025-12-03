import styled from 'styled-components'

export const MainContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`

export const PageTitle = styled.div`
  position: absolute;
  top: 30px;
  left: 50%;
  transform: translateX(-50%);
  background: ${({ theme }) => theme.colors.background.secondary};
  padding: 12px 60px;
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.sizes.xxl};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  text-transform: uppercase;
  letter-spacing: 2px;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;

  /* Subtle glow */
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
  border-bottom: 2px solid ${({ theme }) => theme.colors.accent.primary};
`

export const GaugeWrapper = styled.div<{ left: number; top: number }>`
  position: absolute;
  left: ${({ left }) => left}px;
  top: ${({ top }) => top}px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  /* background: ${({ theme }) => theme.colors.gradients.card}; */
  background: none;
  padding: 8px;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  box-shadow: ${({ theme }) => theme.shadows.md};
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.lg};
    border-color: ${({ theme }) => theme.colors.accent.primary};
  }
`

export const GaugeLabel = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  text-align: center;
  max-width: 160px;
  min-height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: ${({ theme }) => theme.colors.background.primary};
  padding: 8px 12px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.borders.secondary};
  width: 100%;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.2);
`
