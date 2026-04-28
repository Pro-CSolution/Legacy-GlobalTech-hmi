import styled, { css } from 'styled-components'

export const FloatingButton = styled.button<{ $open: boolean }>`
  position: fixed;
  right: 16px;
  bottom: calc(16px + env(safe-area-inset-bottom));
  z-index: 140;
  width: 58px;
  height: 58px;
  border: 1px solid
    ${({ $open, theme }) =>
      $open ? `${theme.colors.borders.active}` : `${theme.colors.borders.primary}`};
  border-radius: 18px;
  background:
    radial-gradient(
      circle at top center,
      ${({ $open }) => ($open ? 'rgba(122, 223, 255, 0.26)' : 'rgba(122, 223, 255, 0.14)')} 0%,
      transparent 58%
    ),
    ${({ $open }) =>
      $open
        ? 'linear-gradient(180deg, rgba(7, 181, 251, 0.98) 0%, rgba(17, 100, 244, 0.98) 100%)'
        : 'linear-gradient(180deg, rgba(20, 32, 56, 0.96) 0%, rgba(11, 20, 36, 0.98) 100%)'};
  color: ${({ theme }) => theme.colors.text.primary};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow:
    0 18px 34px rgba(0, 0, 0, 0.28),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
  cursor: pointer;
  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    background 0.18s ease,
    box-shadow 0.18s ease;

  &:active {
    transform: scale(0.96);
  }
`

export const Overlay = styled.button<{ $open: boolean }>`
  position: fixed;
  inset: 0;
  z-index: 130;
  border: 0;
  background: rgba(4, 10, 18, 0.52);
  opacity: ${({ $open }) => ($open ? 1 : 0)};
  pointer-events: ${({ $open }) => ($open ? 'auto' : 'none')};
  transition: opacity 0.18s ease;
`

export const Drawer = styled.aside<{ $open: boolean }>`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 135;
  width: min(86vw, 320px);
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: calc(18px + env(safe-area-inset-top)) 18px calc(22px + env(safe-area-inset-bottom));
  background:
    radial-gradient(circle at top center, rgba(72, 191, 255, 0.12), transparent 34%),
    linear-gradient(180deg, rgba(15, 26, 46, 0.99) 0%, rgba(10, 20, 36, 0.99) 100%);
  border-left: 1px solid ${({ theme }) => theme.colors.borders.primary};
  box-shadow: -24px 0 40px rgba(0, 0, 0, 0.34);
  transform: translateX(${({ $open }) => ($open ? '0' : '104%')});
  transition: transform 0.2s ease;
`

export const DrawerHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
`

export const DrawerTitleStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
`

export const DrawerEyebrow = styled.span`
  font-family: ${({ theme }) => theme.typography.displayFamily};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.text.secondary};
  letter-spacing: 0.12em;
  text-transform: uppercase;
`

export const DrawerTitle = styled.h3`
  margin: 0;
  font-family: ${({ theme }) => theme.typography.displayFamily};
  font-size: ${({ theme }) => theme.typography.sizes.xl};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  letter-spacing: 0.06em;
  text-transform: uppercase;
`

export const CurrentRoute = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.accent.primary};
  letter-spacing: 0.06em;
  text-transform: uppercase;
`

export const CloseButton = styled.button`
  width: 42px;
  height: 42px;
  border-radius: 14px;
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  background: rgba(16, 28, 47, 0.96);
  color: ${({ theme }) => theme.colors.text.secondary};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`

export const RouteList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

export const RouteButton = styled.button<{ $active: boolean }>`
  width: 100%;
  border-radius: 18px;
  border: 1px solid
    ${({ $active, theme }) =>
      $active ? `${theme.colors.borders.active}` : `${theme.colors.borders.primary}`};
  background:
    radial-gradient(
      circle at top center,
      ${({ $active }) => ($active ? 'rgba(122, 223, 255, 0.22)' : 'rgba(122, 223, 255, 0.06)')} 0%,
      transparent 60%
    ),
    ${({ $active }) =>
      $active
        ? 'linear-gradient(180deg, rgba(7, 181, 251, 0.96) 0%, rgba(17, 100, 244, 0.96) 100%)'
        : 'linear-gradient(180deg, rgba(18, 30, 52, 0.96) 0%, rgba(10, 18, 33, 0.96) 100%)'};
  color: ${({ $active, theme }) => ($active ? '#fff' : theme.colors.text.primary)};
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 14px;
  cursor: pointer;
  box-shadow:
    ${({ theme }) => theme.shadows.md},
    inset 0 1px 0 rgba(255, 255, 255, 0.04);

  ${({ $active }) =>
    $active &&
    css`
      box-shadow:
        0 0 18px rgba(76, 164, 255, 0.22),
        inset 0 1px 0 rgba(255, 255, 255, 0.08);
    `}
`

export const RouteIconWrap = styled.span`
  width: 40px;
  height: 40px;
  border-radius: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(8, 17, 32, 0.22);
  flex-shrink: 0;
`

export const RouteText = styled.span`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  min-width: 0;
`

export const RouteLabel = styled.span`
  font-family: ${({ theme }) => theme.typography.displayFamily};
  font-size: ${({ theme }) => theme.typography.sizes.lg};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  letter-spacing: 0.08em;
  text-transform: uppercase;
`

export const RouteSubLabel = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: rgba(255, 255, 255, 0.74);
  letter-spacing: 0.12em;
  text-transform: uppercase;
`
