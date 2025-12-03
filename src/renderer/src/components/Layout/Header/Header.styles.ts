import styled from 'styled-components'

export const HeaderContainer = styled.header`
  height: ${({ theme }) => theme.config?.UI?.HEADER_HEIGHT || 80}px;
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
  text-align: right;
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
