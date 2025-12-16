import styled from 'styled-components'

export const MainContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`

export const PageTitle = styled.div`
  position: absolute;
  top: 10px;
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
