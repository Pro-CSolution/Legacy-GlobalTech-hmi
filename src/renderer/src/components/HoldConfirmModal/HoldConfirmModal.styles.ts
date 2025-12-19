import styled, { keyframes } from 'styled-components'

const popIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`

export const Body = styled.div`
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  animation: ${popIn} 180ms ease-out;
  color: ${({ theme }) => theme.colors.text.primary};
`

export const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
`

export const TitleGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
`

export const Title = styled.h3`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.sizes.xl};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.text.primary};
`

export const Message = styled.p`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.sizes.md};
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.35;
`

export const IconWrap = styled.div<{ $tone: 'default' | 'danger' }>`
  width: 56px;
  height: 56px;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid
    ${({ theme, $tone }) =>
      $tone === 'danger' ? `${theme.colors.status.alarm}66` : theme.colors.borders.primary};
  background: ${({ theme, $tone }) =>
    $tone === 'danger' ? `${theme.colors.status.alarm}1A` : theme.colors.background.secondary};
  color: ${({ theme, $tone }) =>
    $tone === 'danger' ? theme.colors.status.alarm : theme.colors.accent.primary};
  box-shadow: ${({ theme, $tone }) =>
    $tone === 'danger' ? `0 0 0 2px ${theme.colors.status.alarm}22` : 'none'};
`

export const Divider = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.colors.borders.primary};
  opacity: 0.9;
`

export const Hint = styled.div<{ $tone: 'default' | 'danger' }>`
  padding: 12px 14px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid
    ${({ theme, $tone }) =>
      $tone === 'danger' ? `${theme.colors.status.alarm}66` : theme.colors.borders.primary};
  background: ${({ theme, $tone }) =>
    $tone === 'danger' ? `${theme.colors.status.alarm}14` : theme.colors.background.secondary};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  line-height: 1.35;
`

export const Actions = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 0 24px 22px 24px;
`

export const CancelButton = styled.button`
  padding: 10px 16px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  background: transparent;
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  cursor: pointer;
  min-width: 110px;

  &:hover {
    border-color: ${({ theme }) => theme.colors.text.secondary};
  }
`
