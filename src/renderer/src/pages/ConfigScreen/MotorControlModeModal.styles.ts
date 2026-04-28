import styled from 'styled-components'

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
`

export const Content = styled.div`
  padding: 18px 20px 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 18px;
`

export const OptionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`

export const OptionButton = styled.button<{ $selected: boolean }>`
  position: relative;
  overflow: hidden;
  min-height: 148px;
  padding: 18px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid
    ${({ theme, $selected }) =>
      $selected ? theme.colors.accent.primary : theme.colors.borders.primary};
  background: ${({ theme, $selected }) =>
    $selected
      ? 'linear-gradient(180deg, rgba(103, 214, 255, 0.16) 0%, rgba(17, 31, 55, 0.94) 100%)'
      : theme.colors.background.secondary};
  color: ${({ theme }) => theme.colors.text.primary};
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 8px;
  cursor: pointer;
  box-shadow: ${({ theme, $selected }) =>
    $selected
      ? `0 16px 36px rgba(0, 0, 0, 0.34), ${theme.shadows.glow}`
      : '0 10px 24px rgba(0, 0, 0, 0.2)'};
  transition:
    border-color 0.18s ease,
    background 0.18s ease,
    transform 0.18s ease,
    box-shadow 0.18s ease;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(circle at top right, rgba(103, 214, 255, 0.12), transparent 42%),
      linear-gradient(180deg, rgba(255, 255, 255, 0.03), transparent 34%);
    opacity: ${({ $selected }) => ($selected ? 1 : 0.72)};
    pointer-events: none;
  }

  > * {
    position: relative;
    z-index: 1;
  }

  &:hover {
    border-color: ${({ theme }) => theme.colors.accent.primary};
    background: ${({ theme, $selected }) =>
      $selected
        ? 'linear-gradient(180deg, rgba(103, 214, 255, 0.2) 0%, rgba(18, 34, 58, 0.96) 100%)'
        : theme.colors.background.tertiary};
    transform: translateY(-2px);
    box-shadow: ${({ theme, $selected }) =>
      $selected
        ? `0 18px 42px rgba(0, 0, 0, 0.38), ${theme.shadows.glow}`
        : '0 16px 30px rgba(0, 0, 0, 0.26)'};
  }
`

export const SingleSelectionFlow = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 2px;
`

export const SelectionFlowHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-left: 28px;

  @media (max-width: 720px) {
    padding-left: 0;
  }
`

export const SelectionFlowLabel = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.accent.primary};
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-weight: ${({ theme }) => theme.typography.weights.bold};
`

export const SelectionFlowHint = styled.span`
  max-width: 460px;
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.45;
`

export const SelectionConnector = styled.div<{ $scope: 1 | 2 }>`
  position: relative;
  width: calc(100% - 96px);
  height: 92px;
  margin-left: 28px;
  margin-top: -2px;
  margin-bottom: -8px;
  pointer-events: none;

  svg {
    width: 100%;
    height: 100%;
    overflow: visible;
  }

  .connector-underlay {
    fill: none;
    stroke: rgba(103, 214, 255, 0.18);
    stroke-width: 7;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .connector-main {
    fill: none;
    stroke: ${({ theme }) => theme.colors.accent.primary};
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
    opacity: 0.9;
    filter: drop-shadow(0 0 8px ${({ theme }) => `${theme.colors.accent.primary}44`});
  }

  .connector-guide {
    fill: none;
    stroke: rgba(255, 255, 255, 0.35);
    stroke-width: 0.8;
    stroke-linecap: round;
    stroke-dasharray: 2 8;
    opacity: 0.45;
  }

  .connector-arrow-underlay {
    fill: rgba(103, 214, 255, 0.22);
  }

  .connector-arrow {
    fill: ${({ theme }) => theme.colors.accent.primary};
    filter: drop-shadow(0 0 10px ${({ theme }) => `${theme.colors.accent.primary}88`});
  }

  @media (max-width: 820px) {
    width: calc(100% - 56px);
  }

  @media (max-width: 720px) {
    display: none;
  }
`

export const SelectionOptionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  width: calc(100% - 56px);
  margin-left: 28px;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
    width: 100%;
    margin-left: 0;
  }
`

export const SelectionOptionButton = styled(OptionButton)`
  min-height: 118px;
  padding: 14px 16px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
`

export const SelectionOptionHeader = styled.div`
  width: 100%;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
`

export const SelectionStateBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 26px;
  padding: 4px 10px;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  border: 1px solid rgba(103, 214, 255, 0.24);
  background: rgba(103, 214, 255, 0.14);
  color: ${({ theme }) => theme.colors.accent.primary};
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-weight: ${({ theme }) => theme.typography.weights.bold};
`

export const OptionEyebrow = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.08em;
`

export const OptionLabel = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.xl};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
`

export const OptionMeta = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.45;
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
