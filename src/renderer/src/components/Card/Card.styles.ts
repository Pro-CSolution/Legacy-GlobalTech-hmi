import styled from 'styled-components'
import { getPositionStyles, PositionProps, shouldForwardPositionProp } from 'styles/mixins'

export const CardContainer = styled.div.withConfig({
  shouldForwardProp: (prop) => shouldForwardPositionProp(prop) && prop !== 'active'
})<{ active: boolean } & PositionProps>`
  background: ${({ theme }) => theme.colors.background.secondary}99; /* /60 opacity equivalent */
  backdrop-filter: blur(12px);
  border: 1px solid ${({ theme }) => theme.colors.borders.primary}99;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 16px;
  display: flex;
  flex-direction: column;
  box-shadow: ${({ theme }) => theme.shadows.lg};
  transition: all 0.3s ease;
  opacity: ${({ active }) => (active ? 1 : 0.5)};
  filter: ${({ active }) => (active ? 'none' : 'grayscale(100%)')};
  height: 100%;
  position: relative;
  overflow: hidden;

  ${(props) => getPositionStyles(props)}

  &:hover {
    box-shadow: ${({ theme }) => theme.shadows.glow};
    border-color: ${({ theme }) => theme.colors.borders.active}50;
  }
`

export const Header = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borders.primary}80;
  gap: 8px;
  justify-content: space-between;
`

export const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
`

export const HeaderRight = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  letter-spacing: 0.02em;
  user-select: none;
  white-space: nowrap;
  opacity: 0.9;
`

export const Title = styled.h3<{ color?: string }>`
  font-size: ${({ theme }) => theme.typography.sizes.xl};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  text-transform: uppercase;
  letter-spacing: 1px;
  color: ${({ color, theme }) => color || theme.colors.accent.primary};
  margin: 0;
`

export const Content = styled.div`
  flex-grow: 1;
  position: relative;
  height: 100%;
  min-height: 0; /* allow nested flex children to size correctly (prevents overflow) */
`
