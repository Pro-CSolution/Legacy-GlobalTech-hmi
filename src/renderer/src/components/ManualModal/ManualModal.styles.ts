import styled from 'styled-components'

export const ManualModalBody = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  min-height: 0;
`

export const ManualModalHeader = styled.div`
  padding: 16px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borders.primary};
  flex-shrink: 0;
`

export const ManualModalTitle = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.xl};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  letter-spacing: 0.06em;
  text-transform: uppercase;
`

export const ManualModalClose = styled.button`
  width: 56px;
  height: 56px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  background: ${({ theme }) => theme.colors.background.tertiary};
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: ${({ theme }) => theme.colors.background.secondary};
  }

  &:active {
    transform: scale(0.99);
  }
`

export const ManualModalContent = styled.div`
  flex: 1;
  padding: 10px 14px 14px;
  overflow: hidden;
  min-height: 0;
`

