import styled from 'styled-components'
import { getPositionStyles, PositionProps, shouldForwardPositionProp } from 'styles/mixins'

export const Container = styled.div.withConfig({
  shouldForwardProp: (prop) => shouldForwardPositionProp(prop)
})<PositionProps>`
  background: ${({ theme }) => theme.colors.background.primary};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: 8px;
  padding-left: 16px;
  position: relative;
  overflow: hidden;
  transition: border-color 0.3s ease;

  ${(props) => getPositionStyles(props)}

  &:hover {
    border-color: ${({ theme }) => theme.colors.accent.primary}50;
  }
`

export const GlowEffect = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  width: 64px;
  height: 64px;
  background: ${({ theme }) => theme.colors.accent.primary}10;
  border-radius: 50%;
  transform: translate(50%, -50%);
  filter: blur(24px);
  pointer-events: none;
`

export const Label = styled.span`
  display: block;
  font-size: ${({ theme }) => theme.typography.sizes.lg};
  color: ${({ theme }) => theme.colors.text.secondary};
  text-transform: uppercase;
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  letter-spacing: 0.05em;
  margin-bottom: 2px;
`

export const ValueContainer = styled.div`
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin-top: 8px;
`

export const Value = styled.span.withConfig({
  shouldForwardProp: (prop) => prop !== 'size'
})<{ size: 'normal' | 'large' }>`
  font-family: 'Roboto Mono', monospace;
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ size, theme }) =>
    size === 'large' ? theme.typography.sizes.xxl : theme.typography.sizes.xl};
`

export const Unit = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.lg};
  color: ${({ theme }) => theme.colors.accent.primary};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
`
