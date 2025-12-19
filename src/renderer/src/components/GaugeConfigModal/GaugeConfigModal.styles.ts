import styled, { keyframes } from 'styled-components'

const popIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.99);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`

export const Body = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 0;
`

export const Header = styled.div`
  padding: 18px 20px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borders.primary};
`

export const TitleGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
`

export const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
`

export const Title = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.xl};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  letter-spacing: 0.02em;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

export const Subtitle = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

export const CloseButton = styled.button`
  width: 52px;
  height: 52px;
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
    border-color: ${({ theme }) => theme.colors.text.secondary};
  }

  &:active {
    transform: scale(0.99);
  }
`

export const Content = styled.div`
  padding: 18px 20px 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  animation: ${popIn} 160ms ease-out;
  min-height: 0;
`

export const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
`

export const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
`

export const Label = styled.label`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
`

export const Select = styled.select`
  width: 100%;
  padding: 12px 12px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  background: ${({ theme }) => theme.colors.background.secondary};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.sizes.md};
  outline: none;

  &:focus {
    border-color: ${({ theme }) => theme.colors.accent.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.accent.primary}22;
  }
`

export const FakeInput = styled.button`
  width: 100%;
  padding: 12px 12px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  background: ${({ theme }) => theme.colors.background.secondary};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.sizes.lg};
  font-family: 'Roboto Mono', monospace;
  text-align: left;
  cursor: pointer;
  outline: none;

  &:hover {
    border-color: ${({ theme }) => theme.colors.text.secondary};
  }

  &:focus-visible {
    border-color: ${({ theme }) => theme.colors.accent.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.accent.primary}22;
  }
`

export const Hint = styled.div`
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  background: ${({ theme }) => theme.colors.background.secondary};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  line-height: 1.35;
`

export const ErrorBanner = styled.div`
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => `${theme.colors.status.alarm}66`};
  background: ${({ theme }) => `${theme.colors.status.alarm}18`};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  line-height: 1.35;
`

export const Footer = styled.div`
  padding: 0 20px 18px 20px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  border-top: 1px solid ${({ theme }) => theme.colors.borders.primary};
`

export const Button = styled.button<{ $primary?: boolean }>`
  padding: 10px 16px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  border: 1px solid
    ${({ theme, $primary }) => ($primary ? 'transparent' : theme.colors.borders.primary)};
  background: ${({ theme, $primary }) => ($primary ? theme.colors.accent.primary : 'transparent')};
  color: ${({ theme, $primary }) =>
    $primary ? theme.colors.text.inverse : theme.colors.text.primary};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  cursor: pointer;
  min-width: 120px;

  &:hover {
    opacity: 0.92;
    border-color: ${({ theme, $primary }) =>
      $primary ? 'transparent' : theme.colors.text.secondary};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`
