import styled from 'styled-components'
import { HMI_CONFIG } from 'config/constants'

export const HeaderContainer = styled.header`
  height: ${HMI_CONFIG.UI.HEADER_HEIGHT}px;
  background:
    radial-gradient(circle at top center, rgba(72, 191, 255, 0.1), transparent 52%),
    linear-gradient(180deg, rgba(15, 26, 46, 0.98) 0%, rgba(10, 20, 36, 0.98) 100%);
  border-bottom: 1px solid ${({ theme }) => theme.colors.borders.primary};
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-shadow:
    ${({ theme }) => theme.shadows.md},
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
  position: relative;
  z-index: 50;
  flex-shrink: 0;

  @media (max-width: 960px) {
    height: auto;
    flex-wrap: wrap;
    gap: 12px;
    padding: 12px 14px;
    position: relative;
    z-index: 50;
  }
`

export const LeftSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  min-width: 0;
  flex: 0 0 auto;

  @media (max-width: 960px) {
    width: auto;
    max-width: none;
    flex: 1 1 auto;
    align-self: stretch;
    box-sizing: border-box;
    gap: 10px;
    position: sticky;
    top: 0;
    z-index: 120;
    margin:
      calc(-12px - env(safe-area-inset-top, 0px))
      calc(-14px - env(safe-area-inset-right, 0px))
      0
      calc(-14px - env(safe-area-inset-left, 0px));
    padding:
      calc(12px + env(safe-area-inset-top, 0px))
      calc(14px + env(safe-area-inset-right, 0px))
      12px
      calc(14px + env(safe-area-inset-left, 0px));
    background:
      radial-gradient(circle at top center, rgba(72, 191, 255, 0.1), transparent 52%),
      linear-gradient(180deg, rgba(15, 26, 46, 0.98) 0%, rgba(10, 20, 36, 0.98) 100%);
    border-bottom: 1px solid ${({ theme }) => theme.colors.borders.primary};
    box-shadow:
      ${({ theme }) => theme.shadows.md},
      inset 0 1px 0 rgba(255, 255, 255, 0.04);
  }
`

export const TitleGroup = styled.div`
  display: flex;
  align-items: center;
  min-width: 0;
`

export const BrandImage = styled.img`
  display: block;
  height: 42px;
  width: auto;
  max-width: min(280px, 22vw);
  object-fit: contain;

  @media (max-width: 960px) {
    height: 36px;
    max-width: min(220px, 50vw);
  }

  @media (max-width: 640px) {
    height: 34px;
    max-width: min(190px, 50vw);
  }
`

export const CenterSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1 1 340px;
  min-width: 0;

  @media (max-width: 960px) {
    width: 100%;
    justify-content: stretch;
  }
`

export const Title = styled.div`
  font-family: ${({ theme }) => theme.typography.displayFamily};
  font-size: 34px;
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  letter-spacing: 0.04em;
  line-height: 1;
  color: ${({ theme }) => theme.colors.text.primary};

  @media (max-width: 960px) {
    font-size: 28px;
  }

  @media (max-width: 640px) {
    font-size: 22px;
  }
`

export const Subtitle = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  letter-spacing: 0.06em;
  margin-top: 6px;
  text-transform: uppercase;

  @media (max-width: 640px) {
    letter-spacing: 0.04em;
    word-break: break-all;
  }
`

export const ModePill = styled.div`
  height: 40px;
  padding: 0 14px;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  border: 1px solid rgba(255, 214, 107, 0.34);
  background: linear-gradient(180deg, rgba(78, 62, 21, 0.96), rgba(58, 44, 13, 0.98));
  color: ${({ theme }) => theme.colors.status.warning};
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: ${({ theme }) => theme.typography.displayFamily};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  letter-spacing: 0.06em;
  text-transform: uppercase;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.06),
    0 10px 24px rgba(0, 0, 0, 0.24);

  @media (max-width: 640px) {
    height: 36px;
    padding: 0 12px;
    font-size: 13px;
  }
`

export const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  flex-shrink: 0;

  @media (max-width: 960px) {
    width: 100%;
    justify-content: stretch;
    flex-wrap: wrap;
  }

  @media (max-width: 640px) {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
    align-items: stretch;
  }
`

export const MotorSelector = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  background: rgba(12, 20, 36, 0.88);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.05),
    0 10px 24px rgba(0, 0, 0, 0.18);
  flex-wrap: wrap;

  @media (max-width: 640px) {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 6px;
    border-radius: ${({ theme }) => theme.borderRadius.lg};
  }
`

export const MotorButton = styled.button<{ $active: boolean }>`
  min-width: 114px;
  min-height: 40px;
  padding: 0 14px;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  border: 1px solid
    ${({ $active, theme }) =>
      $active ? `${theme.colors.borders.active}` : `${theme.colors.borders.primary}`};
  background:
    radial-gradient(
      circle at top center,
      ${({ $active }) => ($active ? 'rgba(122, 223, 255, 0.22)' : 'transparent')} 0%,
      transparent 58%
    ),
    ${({ $active, theme }) =>
      $active
        ? 'linear-gradient(180deg, rgba(19, 87, 194, 0.98) 0%, rgba(10, 130, 244, 0.98) 100%)'
        : `linear-gradient(180deg, ${theme.colors.background.tertiary} 0%, ${theme.colors.background.primary} 100%)`};
  color: ${({ $active, theme }) => ($active ? '#fff' : theme.colors.text.secondary)};
  font-family: ${({ theme }) => theme.typography.displayFamily};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  letter-spacing: 0.07em;
  text-transform: uppercase;
  cursor: pointer;
  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    color 0.18s ease,
    filter 0.18s ease;

  &:hover {
    filter: brightness(1.05);
  }

  &:active {
    transform: scale(0.98);
  }

  @media (max-width: 640px) {
    flex: 1 1 0;
    min-width: 0;
    padding: 0 10px;
    font-size: 12px;

    &:last-child {
      grid-column: 1 / -1;
    }
  }
`

export const StatusPill = styled.div<{ $connected: boolean }>`
  min-width: 170px;
  height: 52px;
  padding: 0 16px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid
    ${({ $connected }) =>
      $connected ? 'rgba(151, 242, 168, 0.26)' : 'rgba(255, 106, 106, 0.26)'};
  background: ${({ $connected }) =>
    $connected
      ? 'linear-gradient(180deg, rgba(22, 52, 39, 0.96), rgba(14, 34, 24, 0.98))'
      : 'linear-gradient(180deg, rgba(71, 28, 28, 0.96), rgba(44, 18, 18, 0.98))'};
  display: flex;
  align-items: center;
  gap: 12px;

  @media (max-width: 640px) {
    min-width: 0;
    width: 100%;
    padding: 0 12px;
  }
`

export const ClientMotorButton = styled.button`
  min-width: 170px;
  height: 52px;
  padding: 0 16px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  background: linear-gradient(180deg, rgba(24, 38, 63, 0.96), rgba(16, 28, 47, 0.98));
  color: ${({ theme }) => theme.colors.text.primary};
  display: inline-flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
  transition:
    border-color 0.18s ease,
    filter 0.18s ease,
    transform 0.18s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.accent.primary};
    filter: brightness(1.04);
  }

  &:active {
    transform: scale(0.99);
  }

  @media (max-width: 640px) {
    min-width: 0;
    width: 100%;
    padding: 0 12px;
  }
`

export const ClientMotorButtonMeta = styled.div`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.text.secondary};
  letter-spacing: 0.12em;
  text-transform: uppercase;
`

export const ClientMotorButtonValue = styled.div`
  font-family: ${({ theme }) => theme.typography.displayFamily};
  font-size: 18px;
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  letter-spacing: 0.06em;
`

export const StatusDot = styled.span<{ $connected: boolean }>`
  width: 12px;
  height: 12px;
  border-radius: 9999px;
  background: ${({ theme, $connected }) =>
    $connected ? theme.colors.status.running : theme.colors.status.alarm};
  box-shadow: 0 0 12px
    ${({ theme, $connected }) =>
      $connected ? `${theme.colors.status.running}99` : `${theme.colors.status.alarm}99`};
  flex-shrink: 0;
`

export const StatusText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  line-height: 1.05;
`

export const StatusLabel = styled.div`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.text.secondary};
  letter-spacing: 0.12em;
  text-transform: uppercase;
`

export const StatusValue = styled.div`
  font-family: ${({ theme }) => theme.typography.displayFamily};
  font-size: 18px;
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  letter-spacing: 0.06em;
`

export const TimeBlock = styled.button`
  min-width: 170px;
  padding: 8px 14px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  background: linear-gradient(180deg, rgba(24, 38, 63, 0.96), rgba(16, 28, 47, 0.98));
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
  cursor: pointer;
  transition:
    border-color 0.18s ease,
    filter 0.18s ease,
    transform 0.18s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.accent.primary};
    filter: brightness(1.04);
  }

  &:active {
    transform: scale(0.99);
  }

  @media (max-width: 640px) {
    grid-column: 1 / -1;
    width: 100%;
    min-width: 0;
    align-items: stretch;
  }
`

export const TimeBlockValueGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;

  @media (max-width: 640px) {
    align-items: flex-start;
  }
`

export const TimeBlockLabel = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: ${({ theme }) => theme.typography.displayFamily};
  font-size: 11px;
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  letter-spacing: 0.08em;
  color: ${({ theme }) => theme.colors.text.secondary};
  text-transform: uppercase;
  white-space: nowrap;
`

export const TimeValue = styled.div`
  font-family: ${({ theme }) => theme.typography.numericFamily};
  font-size: 24px;
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  letter-spacing: 0.06em;
  line-height: 1;
`

export const DateValue = styled.div`
  margin-top: 4px;
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  letter-spacing: 0.04em;
`

export const TimeZoneOverlay = styled.button`
  position: fixed;
  inset: 0;
  border: none;
  background: rgba(2, 8, 20, 0.7);
  backdrop-filter: blur(4px);
  z-index: 220;
  cursor: pointer;
`

export const TimeZoneDialog = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: min(92vw, 520px);
  max-height: min(84vh, 760px);
  display: flex;
  flex-direction: column;
  border-radius: 20px;
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  background:
    radial-gradient(circle at top center, rgba(72, 191, 255, 0.08), transparent 40%),
    linear-gradient(180deg, rgba(18, 30, 52, 0.98), rgba(10, 18, 33, 0.98));
  box-shadow: ${({ theme }) => theme.shadows.lg};
  overflow: hidden;
  z-index: 230;

  @media (max-width: 640px) {
    inset: auto 0 0 0;
    width: 100vw;
    max-height: 84dvh;
    transform: none;
    border-radius: 22px 22px 0 0;
  }
`

export const TimeZoneDialogHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 18px 18px 14px;
  border-bottom: 1px solid rgba(140, 185, 255, 0.14);
`

export const DialogTitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${({ theme }) => theme.colors.text.primary};
`

export const DialogTitle = styled.h3`
  margin: 0;
  font-family: ${({ theme }) => theme.typography.displayFamily};
  font-size: ${({ theme }) => theme.typography.sizes.xl};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  letter-spacing: 0.06em;
  text-transform: uppercase;
`

export const DialogSubtitle = styled.p`
  margin: 8px 0 0;
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  line-height: 1.45;
  color: ${({ theme }) => theme.colors.text.secondary};
`

export const DialogCloseButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  background: rgba(14, 25, 44, 0.82);
  color: ${({ theme }) => theme.colors.text.secondary};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &:hover {
    color: ${({ theme }) => theme.colors.text.primary};
    border-color: ${({ theme }) => theme.colors.accent.primary};
  }
`

export const DialogOptionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px 18px 18px;
  overflow-y: auto;
`

export const TimeZoneOptionButton = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 14px 16px;
  border-radius: 16px;
  border: 1px solid
    ${({ $active, theme }) =>
      $active ? `${theme.colors.borders.active}` : `${theme.colors.borders.primary}`};
  background:
    radial-gradient(
      circle at top right,
      ${({ $active }) => ($active ? 'rgba(72, 191, 255, 0.14)' : 'transparent')} 0%,
      transparent 42%
    ),
    linear-gradient(180deg, rgba(16, 29, 52, 0.96), rgba(10, 18, 33, 0.98));
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
  text-align: left;
  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    background 0.18s ease;

  &:hover {
    transform: translateY(-1px);
    border-color: ${({ theme }) => theme.colors.accent.primary};
  }

  &:active {
    transform: scale(0.99);
  }

  @media (max-width: 640px) {
    align-items: flex-start;
    flex-direction: column;
  }
`

export const DialogOptionLabel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`

export const DialogOptionTitle = styled.div`
  font-family: ${({ theme }) => theme.typography.displayFamily};
  font-size: ${({ theme }) => theme.typography.sizes.lg};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  letter-spacing: 0.05em;
`

export const DialogOptionMeta = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.35;
`

export const DialogOptionValue = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;

  @media (max-width: 640px) {
    align-items: flex-start;
  }
`

export const DialogOptionTime = styled.div`
  font-family: ${({ theme }) => theme.typography.numericFamily};
  font-size: ${({ theme }) => theme.typography.sizes.xl};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  letter-spacing: 0.04em;
`

export const DialogMeta = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`
