import styled from 'styled-components'

export const FooterContainer = styled.footer`
  height: 120px;
  width: 100%;
  background:
    linear-gradient(180deg, rgba(12, 20, 36, 0.98) 0%, rgba(9, 17, 32, 0.98) 100%);
  border-top: 1px solid ${({ theme }) => theme.colors.borders.primary};
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 10px;
  padding: 10px 10px 12px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03);
  position: relative;
  z-index: 50;
  flex-shrink: 0;

  @media (max-width: 1160px) {
    height: auto;
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @media (max-width: 640px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
    padding: 8px 8px 12px;
  }
`

export const NavButton = styled.button<{ $active?: boolean }>`
  position: relative;
  min-width: 0;
  height: 100%;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid
    ${({ $active, theme }) =>
      $active ? 'rgba(130, 200, 255, 0.3)' : theme.colors.borders.primary};
  background:
    radial-gradient(
      circle at top center,
      ${({ $active }) => ($active ? 'rgba(122, 223, 255, 0.24)' : 'rgba(122, 223, 255, 0.08)')}
        0%,
      transparent 58%
    ),
    ${({ $active }) =>
      $active
        ? 'linear-gradient(180deg, rgba(7, 181, 251, 0.98) 0%, rgba(17, 100, 244, 0.98) 100%)'
        : 'linear-gradient(180deg, rgba(20, 32, 56, 0.96) 0%, rgba(11, 20, 36, 0.98) 100%)'};
  color: ${({ $active, theme }) => ($active ? '#fff' : theme.colors.text.secondary)};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    background 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease;
  box-shadow: ${({ $active, theme }) =>
    $active
      ? `0 0 18px rgba(76, 164, 255, 0.22), inset 0 1px 0 rgba(255,255,255,0.08)`
      : `${theme.shadows.sm}, inset 0 1px 0 rgba(255,255,255,0.04)`};

  &:hover {
    transform: translateY(-1px);
    color: #fff;
    border-color: ${({ theme }) => `${theme.colors.borders.active}aa`};
  }

  @media (max-width: 640px) {
    min-height: 72px;
    gap: 4px;
    padding: 10px 6px;
  }
`

export const Label = styled.span`
  font-family: ${({ theme }) => theme.typography.displayFamily};
  font-size: 18px;
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  letter-spacing: 0.08em;
  line-height: 1;

  @media (max-width: 640px) {
    font-size: 16px;
  }
`

export const SubLabel = styled.span`
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.72);

  @media (max-width: 640px) {
    font-size: 10px;
  }
`
