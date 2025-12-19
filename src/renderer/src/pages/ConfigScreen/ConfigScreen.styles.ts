import styled from 'styled-components'

export const ConfigContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 40px;
  width: 100%;
  height: 100%;
`

export const Title = styled.h1`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.sizes.xxl};
  margin-bottom: 40px;
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  border-bottom: 1px solid ${({ theme }) => theme.colors.borders.primary};
  padding-bottom: 20px;
`

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
`

export const ConfigCard = styled.button`
  background: ${({ theme }) => theme.colors.background.secondary};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: ${({ theme }) => theme.colors.text.primary};

  &:hover {
    background: ${({ theme }) => theme.colors.background.tertiary};
    border-color: ${({ theme }) => theme.colors.accent.primary};
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.md};
  }

  &:active {
    transform: translateY(0);
  }
`

export const CardIcon = styled.div`
  color: ${({ theme }) => theme.colors.accent.primary};
  background: ${({ theme }) => `${theme.colors.accent.primary}15`};
  padding: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;

  ${ConfigCard}:hover & {
    background: ${({ theme }) => `${theme.colors.accent.primary}25`};
  }
`

export const CardLabel = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.lg};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
`

export const CardDescription = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  text-align: center;
`

