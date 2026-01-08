import styled from 'styled-components'

export const FooterContainer = styled.footer`
  height: 120px; /* Fixed height */
  background: ${({ theme }) => theme.colors.background.primary};
  border-top: 1px solid ${({ theme }) => theme.colors.borders.primary};
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 10px;
  padding: 8px;
  flex-shrink: 0;
  position: relative; /* enable z-index (ensure footer stays above screen overlays) */
  z-index: 50;
`

export const NavButton = styled.button<{ $active?: boolean }>`
  background: ${({ $active, theme }) =>
    $active ? theme.colors.accent.primary : theme.colors.background.secondary};
  color: ${({ $active, theme }) => ($active ? '#fff' : theme.colors.text.secondary)};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: ${({ $active, theme }) =>
    $active ? `0 0 15px ${theme.colors.accent.primary}66` : 'none'};

  &:hover {
    background: ${({ $active, theme }) =>
      $active ? theme.colors.accent.primary : theme.colors.background.tertiary};
    color: ${({ $active, theme }) => ($active ? '#fff' : theme.colors.text.primary)};
  }
`

export const Label = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.xxl};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  letter-spacing: 0.05em;
`

// Additional placeholder style for disabled/feature buttons
export const FeatureButton = styled(NavButton)`
  background: ${({ theme }) => theme.colors.background.secondary}80;
  border: 1px solid ${({ theme }) => theme.colors.borders.primary}50;

  &:hover {
    color: ${({ theme }) => theme.colors.text.primary};
  }
`
