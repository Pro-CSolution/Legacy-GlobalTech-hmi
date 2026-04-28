import styled, { css, keyframes } from 'styled-components'

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
  min-width: 0;
`

export const Subtitle = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.35;
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

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
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

export const MotorSelectorSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px 14px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  background: ${({ theme }) => theme.colors.background.secondary};
`

export const MotorSelectorLabel = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  color: ${({ theme }) => theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.06em;
`

export const MotorSelector = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 10px;
`

export const MotorSelectorButton = styled.button<{ $active: boolean }>`
  min-width: 152px;
  height: 42px;
  padding: 0 18px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid
    ${({ $active, theme }) =>
      $active ? `${theme.colors.borders.active}cc` : `${theme.colors.borders.primary}`};
  background:
    radial-gradient(
      circle at top center,
      ${({ $active }) => ($active ? 'rgba(122, 223, 255, 0.16)' : 'transparent')} 0%,
      transparent 54%
    ),
    linear-gradient(
      180deg,
      ${({ $active, theme }) =>
        $active ? `${theme.colors.background.tertiary}` : `${theme.colors.background.primary}`} 0%,
      ${({ theme }) => theme.colors.background.secondary} 100%
    );
  color: ${({ $active, theme }) =>
    $active ? theme.colors.accent.primary : theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.sizes.md};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  letter-spacing: 0.06em;
  text-transform: uppercase;
  cursor: pointer;
  box-shadow: ${({ $active, theme }) =>
    $active ? `0 0 18px rgba(122, 223, 255, 0.16)` : theme.shadows.sm};
  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    color 0.18s ease,
    box-shadow 0.18s ease,
    background 0.18s ease;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    border-color: ${({ theme }) => theme.colors.borders.active};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`

export const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
`

export const FieldGrid = styled.div`
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  gap: 12px;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`

export const Label = styled.label`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
`

const inputSurface = css`
  width: 100%;
  padding: 12px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  background: ${({ theme }) => theme.colors.background.secondary};
  color: ${({ theme }) => theme.colors.text.primary};
  outline: none;
`

export const Select = styled.select`
  ${inputSurface};
  font-size: ${({ theme }) => theme.typography.sizes.md};

  &:focus {
    border-color: ${({ theme }) => theme.colors.accent.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.accent.primary}22;
  }
`

export const FakeInput = styled.button`
  ${inputSurface};
  font-size: ${({ theme }) => theme.typography.sizes.lg};
  font-family: 'Roboto Mono', monospace;
  text-align: left;
  cursor: pointer;

  &:hover {
    border-color: ${({ theme }) => theme.colors.text.secondary};
  }

  &:focus-visible {
    border-color: ${({ theme }) => theme.colors.accent.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.accent.primary}22;
  }
`

export const MetaCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  background: ${({ theme }) => theme.colors.background.secondary};
`

export const MetaLabel = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.04em;
`

export const MetaValue = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.md};
  color: ${({ theme }) => theme.colors.text.primary};
  font-family: 'Roboto Mono', monospace;
`

export const Hint = styled.div`
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  background: ${({ theme }) => theme.colors.background.secondary};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  line-height: 1.4;
`

export const StatusBanner = styled.div<{ $tone?: 'info' | 'error' }>`
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  line-height: 1.35;
  border: 1px solid
    ${({ theme, $tone = 'info' }) =>
      $tone === 'error' ? `${theme.colors.status.alarm}66` : theme.colors.borders.primary};
  background: ${({ theme, $tone = 'info' }) =>
    $tone === 'error' ? `${theme.colors.status.alarm}18` : theme.colors.background.secondary};
  color: ${({ theme }) => theme.colors.text.primary};
`

export const EmptyState = styled.div`
  min-height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.sizes.md};
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
