import styled from 'styled-components'

export const FooterContainer = styled.footer`
  height: 120px;
  width: 100%;
  box-sizing: border-box;
  background:
    linear-gradient(180deg, rgba(12, 20, 36, 0.98) 0%, rgba(9, 17, 32, 0.98) 100%);
  border-top: 1px solid ${({ theme }) => theme.colors.borders.primary};
  display: flex;
  align-items: stretch;
  gap: 8px;
  padding: 8px 8px 10px;
  flex-shrink: 0;
  position: relative;
  z-index: 50;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03);
`

export const NavButton = styled.button<{ $active?: boolean }>`
  position: relative;
  flex: 1 1 0;
  min-width: 0;
  height: 100%;
  overflow: hidden;
  background:
    radial-gradient(
      circle at top center,
      ${({ $active }) => ($active ? 'rgba(122, 223, 255, 0.22)' : 'rgba(122, 223, 255, 0.08)')}
        0%,
      transparent 56%
    ),
    ${({ $active }) =>
      $active
        ? 'linear-gradient(180deg,  rgba(7, 181, 251, 0.98) 0%, rgba(17, 100, 244, 0.98) 100%)'
        : 'linear-gradient(180deg, rgba(20, 32, 56, 0.96) 0%, rgba(11, 20, 36, 0.98) 100%)'};
  color: ${({ $active, theme }) => ($active ? '#fff' : theme.colors.text.secondary)};
  border: 1px solid
    ${({ $active, theme }) =>
      $active ? 'rgba(130, 200, 255, 0.28)' : theme.colors.borders.primary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 10px 6px;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    background 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease,
    box-shadow 0.2s ease;
  box-shadow: ${({ $active, theme }) =>
    $active
      ? `0 0 18px rgba(76, 164, 255, 0.22), inset 0 1px 0 rgba(255,255,255,0.08)`
      : `${theme.shadows.sm}, inset 0 1px 0 rgba(255,255,255,0.04)`};

  &::before {
    content: '';
    position: absolute;
    left: 18px;
    right: 18px;
    top: 0;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      ${({ $active }) => ($active ? 'rgba(122, 223, 255, 0.62)' : 'rgba(122, 223, 255, 0.24)')}
        50%,
      transparent 100%
    );
    box-shadow: ${({ $active }) =>
      $active ? '0 0 10px rgba(122, 223, 255, 0.22)' : '0 0 8px rgba(122, 223, 255, 0.08)'};
    pointer-events: none;
  }

  &:hover {
    background:
      radial-gradient(circle at top center, rgba(122, 223, 255, 0.2) 0%, transparent 56%),
      ${({ $active }) =>
        $active
          ? 'linear-gradient(180deg, rgba(7, 181, 251, 0.98) 0%, rgba(17, 100, 244, 0.98) 100%)'
          : 'linear-gradient(180deg, rgba(25, 39, 66, 0.98) 0%, rgba(18, 29, 48, 0.98) 100%)'};
    color: ${({ $active, theme }) => ($active ? '#fff' : theme.colors.text.primary)};
    border-color: ${({ $active, theme }) =>
      $active ? 'rgba(130, 200, 255, 0.34)' : `${theme.colors.borders.active}90`};
    transform: translateY(-1px);
  }
`

export const Label = styled.span`
  font-family: ${({ theme }) => theme.typography.displayFamily};
  font-size: clamp(0.92rem, 1.05vw, 1.45rem);
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  letter-spacing: 0.08em;
  line-height: 1;
  text-align: center;
`

// Additional placeholder style for disabled/feature buttons
export const FeatureButton = styled(NavButton)`
  background: ${({ theme }) => theme.colors.background.secondary}80;
  border: 1px solid ${({ theme }) => theme.colors.borders.primary}50;

  &:hover {
    color: ${({ theme }) => theme.colors.text.primary};
  }
`
