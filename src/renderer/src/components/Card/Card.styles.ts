import styled from 'styled-components'
import { getPositionStyles, PositionProps, shouldForwardPositionProp } from 'styles/mixins'

export const CardContainer = styled.div.withConfig({
  shouldForwardProp: (prop) => shouldForwardPositionProp(prop) && prop !== 'active'
})<{ active: boolean } & PositionProps>`
  background: ${({ theme }) => theme.colors.gradients.card};
  backdrop-filter: blur(16px);
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 16px;
  display: flex;
  flex-direction: column;
  box-shadow:
    ${({ theme }) => theme.shadows.lg},
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
  transition: all 0.3s ease;
  opacity: ${({ active }) => (active ? 1 : 0.5)};
  filter: ${({ active }) => (active ? 'none' : 'grayscale(100%)')};
  height: 100%;
  position: relative;
  overflow: hidden;
  isolation: isolate;

  ${(props) => getPositionStyles(props)}

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 16px;
    right: 16px;
    height: 1px;
    background: linear-gradient(90deg, transparent 0%, rgba(160, 208, 255, 0.28) 50%, transparent 100%);
    pointer-events: none;
  }

  &:hover {
    box-shadow:
      ${({ theme }) => theme.shadows.glow},
      ${({ theme }) => theme.shadows.lg},
      inset 0 1px 0 rgba(255, 255, 255, 0.06);
    border-color: rgba(103, 214, 255, 0.24);
  }

  @media (max-width: 768px) {
    height: auto;
    min-height: 0;
  }
`

export const Header = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  margin-bottom: 0px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(140, 185, 255, 0.14);
  gap: 8px;
  justify-content: space-between;

  @media (max-width: 768px) {
    flex-wrap: wrap;
    align-items: flex-start;
  }
`

export const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
`

export const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  min-width: 0;
  font-family: ${({ theme }) => theme.typography.bodyFamily};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  letter-spacing: 0.08em;
  text-transform: uppercase;
  user-select: none;
  white-space: nowrap;
  opacity: 0.9;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: flex-start;
    white-space: normal;
  }
`

export const Title = styled.h3<{ color?: string }>`
  font-family: ${({ theme }) => theme.typography.displayFamily};
  font-size: ${({ theme }) => theme.typography.sizes.xl};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: ${({ color, theme }) => color || theme.colors.accent.primary};
  margin: 0;
`

export const Content = styled.div`
  flex-grow: 1;
  position: relative;
  height: 100%;
  min-height: 0; /* allow nested flex children to size correctly (prevents overflow) */

  @media (max-width: 768px) {
    height: auto;
  }
`
