import styled from 'styled-components'

type Tone = 'ok' | 'warn' | 'fault' | 'off'

const toneBorder = (tone: Tone, theme: { colors: { status: { running: string; warning: string; stopped: string }; borders: { primary: string } } }) => {
  if (tone === 'ok') return `${theme.colors.status.running}88`
  if (tone === 'warn') return `${theme.colors.status.warning}88`
  if (tone === 'fault') return `${theme.colors.status.stopped}88`
  return theme.colors.borders.primary
}

const toneBackground = (
  tone: Tone,
  theme: {
    colors: {
      status: { running: string; warning: string; stopped: string }
      background: { primary: string; secondary: string }
    }
  }
) => {
  if (tone === 'ok') {
    return `linear-gradient(180deg, ${theme.colors.status.running}18 0%, ${theme.colors.background.primary} 100%)`
  }
  if (tone === 'warn') {
    return `linear-gradient(180deg, ${theme.colors.status.warning}18 0%, ${theme.colors.background.primary} 100%)`
  }
  if (tone === 'fault') {
    return `linear-gradient(180deg, ${theme.colors.status.stopped}18 0%, ${theme.colors.background.primary} 100%)`
  }
  return `linear-gradient(180deg, ${theme.colors.background.secondary} 0%, ${theme.colors.background.primary} 100%)`
}

const toneColor = (
  tone: Tone,
  theme: {
    colors: {
      status: { running: string; warning: string; stopped: string }
      text: { primary: string; secondary: string }
      accent: { primary: string }
    }
  }
) => {
  if (tone === 'ok') return theme.colors.status.running
  if (tone === 'warn') return theme.colors.status.warning
  if (tone === 'fault') return theme.colors.status.stopped
  return theme.colors.text.secondary
}

export const MainContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;

  @media (max-width: 768px) {
    height: auto;
    min-height: 0;
  }
`

export const HeaderControls = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 12px;
  white-space: normal;
  text-transform: none;

  @media (max-width: 960px) {
    flex-wrap: wrap;
    justify-content: flex-start;
  }
`

export const ConnectionBadge = styled.div<{ $tone: Tone }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 42px;
  padding: 0 16px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ $tone, theme }) => toneBorder($tone, theme)};
  background: ${({ $tone, theme }) => toneBackground($tone, theme)};
  color: ${({ $tone, theme }) => toneColor($tone, theme)};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  letter-spacing: 0.08em;
  text-transform: uppercase;
`

export const MotorSelector = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 5px;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  background: ${({ theme }) => theme.colors.background.secondary};

  @media (max-width: 640px) {
    width: 100%;
    justify-content: stretch;
    flex-wrap: wrap;
  }
`

export const MotorButton = styled.button<{ $active: boolean }>`
  min-width: 132px;
  height: 38px;
  padding: 0 14px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid
    ${({ $active, theme }) =>
      $active ? `${theme.colors.borders.active}` : `${theme.colors.borders.primary}`};
  background: ${({ $active, theme }) =>
    $active ? theme.colors.gradients.active : theme.colors.background.primary};
  color: ${({ $active, theme }) =>
    $active ? theme.colors.text.primary : theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.sizes.md};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  letter-spacing: 0.06em;
  text-transform: uppercase;
  cursor: pointer;

  @media (max-width: 640px) {
    min-width: 0;
    flex: 1 1 0;
  }
`

export const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 260px;
  gap: 18px;
  height: 100%;
  min-height: 0;
  align-items: stretch;

  @media (max-width: 960px) {
    grid-template-columns: minmax(0, 1fr);
    height: auto;
  }

  @media (max-width: 768px) {
    gap: 14px;
  }
`

export const LeftPane = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 0;

  @media (max-width: 768px) {
    gap: 12px;
  }
`

export const RightPane = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 0;

  @media (max-width: 768px) {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  @media (max-width: 520px) {
    grid-template-columns: minmax(0, 1fr);
  }
`

export const NoticeBanner = styled.div<{ $tone: 'success' | 'error' }>`
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid
    ${({ $tone, theme }) =>
      $tone === 'success'
        ? `${theme.colors.status.running}88`
        : `${theme.colors.status.stopped}88`};
  background:
    linear-gradient(
      180deg,
      ${({ $tone, theme }) =>
        $tone === 'success'
          ? `${theme.colors.status.running}14`
          : `${theme.colors.status.stopped}14`} 0%,
      ${({ theme }) => theme.colors.background.primary} 100%
    );
  color: ${({ theme }) => theme.colors.text.primary};
  padding: 10px 12px;
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  letter-spacing: 0.03em;
`

export const PumpGrid = styled.div`
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  grid-template-rows: repeat(2, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 768px) {
    flex: 0 0 auto;
    grid-template-rows: none;
  }
`

export const PumpCard = styled.div`
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  background:
    radial-gradient(circle at top right, rgba(103, 214, 255, 0.12) 0%, transparent 38%),
    linear-gradient(
      180deg,
      ${({ theme }) => theme.colors.background.secondary} 0%,
      ${({ theme }) => theme.colors.background.primary} 100%
    );
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 0;
  box-shadow: ${({ theme }) => theme.shadows.md};

  @media (max-width: 768px) {
    padding: 12px;
  }
`

export const PumpTitle = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  text-align: center;
  letter-spacing: 0.08em;
  text-transform: uppercase;
`

export const PumpState = styled.div<{ $tone: Tone }>`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ $tone, theme }) => toneBorder($tone, theme)};
  background: ${({ $tone, theme }) => toneBackground($tone, theme)};
  color: ${({ $tone, theme }) => toneColor($tone, theme)};
  font-size: 20px;
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  letter-spacing: 0.08em;
  text-transform: uppercase;
`

export const PumpButtons = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 26px;
  margin-top: 8px;
  padding-top: 0;
  align-items: center;

  & > button {
    width: 118px;
    height: 118px;
    padding: 8px;
    border-radius: 9999px;
    flex-direction: column;
    gap: 4px;
  }

  & > button > span {
    font-size: 22px;
    line-height: 1;
  }

  @media (max-width: 640px) {
    gap: 14px;

    & > button {
      width: 96px;
      height: 96px;
    }

    & > button > span {
      font-size: 18px;
    }
  }

  @media (max-width: 520px) {
    gap: 10px;

    & > button {
      width: 82px;
      height: 82px;
    }

    & > button > span {
      font-size: 16px;
    }
  }
`

export const IndicationSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

export const IndicationRow = styled.div<{ $columns: number }>`
  display: grid;
  grid-template-columns: repeat(${({ $columns }) => $columns}, minmax(0, 1fr));
  gap: 8px;

  @media (max-width: 640px) {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }
`

export const IndicationCard = styled.div<{ $tone: Tone; $compact?: boolean }>`
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ $tone, theme }) => toneBorder($tone, theme)};
  background: ${({ $tone, theme }) => toneBackground($tone, theme)};
  min-height: ${({ $compact }) => ($compact ? '72px' : '84px')};
  padding: ${({ $compact }) => ($compact ? '8px 10px' : '10px 12px')};
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: ${({ theme }) => theme.shadows.sm};
`

export const IndicationTitle = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-align: center;
`

export const IndicationValue = styled.div<{ $compact?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ $compact, theme }) => ($compact ? theme.typography.sizes.lg : '20px')};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  letter-spacing: 0.08em;
  text-transform: uppercase;
`

export const GaugeCard = styled.div`
  flex: 1;
  min-height: 0;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  background:
    linear-gradient(
      180deg,
      ${({ theme }) => theme.colors.background.secondary} 0%,
      ${({ theme }) => theme.colors.background.primary} 100%
    );
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: center;
  box-shadow: ${({ theme }) => theme.shadows.md};

  @media (max-width: 768px) {
    min-height: 240px;
  }
`

export const GaugeTitle = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.sizes.md};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-align: center;
`

export const GaugeMeta = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  text-transform: uppercase;
  letter-spacing: 0.08em;
  text-align: center;
  min-height: 16px;
`

export const GaugeBody = styled.div`
  flex: 1;
  min-height: 0;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 768px) {
    min-height: 180px;
  }
`
