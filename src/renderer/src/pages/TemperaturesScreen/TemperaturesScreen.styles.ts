import styled, { css, keyframes } from 'styled-components'

type SectionLayout = 'bearings' | 'windings' | 'cooling' | 'igbt'
type MetricAlertSeverity = 'normal' | 'warning' | 'critical'

const TEMPERATURE_ALERT_ACCENT = '#7adfff'
const WARNING_ALERT_ACCENT = '#facc15'
const CRITICAL_ALERT_ACCENT = '#ff6b6b'

const warningCardBlink = keyframes`
  0%,
  100% {
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.012),
      0 0 0 1px rgba(250, 204, 21, 0.3),
      0 0 24px rgba(250, 204, 21, 0.24);
  }

  50% {
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.008),
      0 0 0 1px rgba(250, 204, 21, 0.08),
      0 0 8px rgba(250, 204, 21, 0.08);
  }
`

const criticalCardBlink = keyframes`
  0%,
  100% {
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.012),
      0 0 0 1px rgba(255, 107, 107, 0.34),
      0 0 28px rgba(255, 107, 107, 0.3);
  }

  50% {
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.008),
      0 0 0 1px rgba(255, 107, 107, 0.1),
      0 0 10px rgba(255, 107, 107, 0.12);
  }
`

const warningValueBlink = keyframes`
  0%,
  100% {
    opacity: 1;
    text-shadow: 0 0 18px rgba(250, 204, 21, 0.28);
  }

  50% {
    opacity: 0.42;
    text-shadow: 0 0 8px rgba(250, 204, 21, 0.1);
  }
`

const criticalValueBlink = keyframes`
  0%,
  100% {
    opacity: 1;
    text-shadow: 0 0 20px rgba(255, 107, 107, 0.34);
  }

  50% {
    opacity: 0.36;
    text-shadow: 0 0 8px rgba(255, 107, 107, 0.14);
  }
`

const getMetricSeverityAccent = (severity: MetricAlertSeverity): string | null => {
  if (severity === 'warning') return WARNING_ALERT_ACCENT
  if (severity === 'critical') return CRITICAL_ALERT_ACCENT
  return null
}

type SectionPalette = {
  border: string
  edge: string
  surfaceStart: string
  surfaceEnd: string
  washStrong: string
  washSoft: string
  cardStart: string
  cardEnd: string
  cardWashStrong: string
  cardWashSoft: string
}

const SECTION_PALETTES: Record<SectionLayout, SectionPalette> = {
  bearings: {
    border: '#37c98b',
    edge: '#87efbc',
    surfaceStart: 'rgba(15, 37, 33, 0.98)',
    surfaceEnd: 'rgba(9, 18, 22, 1)',
    washStrong: 'rgba(55, 201, 139, 0.035)',
    washSoft: 'rgba(135, 239, 188, 0.015)',
    cardStart: 'rgba(13, 30, 27, 0.99)',
    cardEnd: 'rgba(8, 17, 20, 1)',
    cardWashStrong: 'rgba(55, 201, 139, 0.03)',
    cardWashSoft: 'rgba(135, 239, 188, 0.013)'
  },
  windings: {
    border: '#72b8ff',
    edge: '#b3d9ff',
    surfaceStart: 'rgba(15, 31, 48, 0.98)',
    surfaceEnd: 'rgba(9, 18, 30, 1)',
    washStrong: 'rgba(114, 184, 255, 0.04)',
    washSoft: 'rgba(179, 217, 255, 0.018)',
    cardStart: 'rgba(12, 26, 42, 0.99)',
    cardEnd: 'rgba(8, 16, 28, 1)',
    cardWashStrong: 'rgba(114, 184, 255, 0.033)',
    cardWashSoft: 'rgba(179, 217, 255, 0.013)'
  },
  cooling: {
    border: '#2fd4c8',
    edge: '#8ef3eb',
    surfaceStart: 'rgba(12, 36, 38, 0.98)',
    surfaceEnd: 'rgba(8, 19, 23, 1)',
    washStrong: 'rgba(47, 212, 200, 0.035)',
    washSoft: 'rgba(142, 243, 235, 0.015)',
    cardStart: 'rgba(11, 30, 31, 0.99)',
    cardEnd: 'rgba(7, 16, 19, 1)',
    cardWashStrong: 'rgba(47, 212, 200, 0.03)',
    cardWashSoft: 'rgba(142, 243, 235, 0.013)'
  },
  igbt: {
    border: '#5c8eff',
    edge: '#9cc2ff',
    surfaceStart: 'rgba(14, 28, 49, 0.98)',
    surfaceEnd: 'rgba(9, 16, 31, 1)',
    washStrong: 'rgba(92, 142, 255, 0.04)',
    washSoft: 'rgba(156, 194, 255, 0.018)',
    cardStart: 'rgba(12, 23, 44, 0.99)',
    cardEnd: 'rgba(8, 14, 27, 1)',
    cardWashStrong: 'rgba(92, 142, 255, 0.033)',
    cardWashSoft: 'rgba(156, 194, 255, 0.013)'
  }
}

const getSectionPalette = (layout: SectionLayout) => SECTION_PALETTES[layout]

export const MainContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;

  @media (max-width: 768px) {
    height: auto;
    min-height: 0;
  }
`

export const ScreenShell = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 14px;
  height: 100%;
  min-height: 0;
  isolation: isolate;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    top: -6px;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(122, 223, 255, 0.02) 18%,
      rgba(122, 223, 255, 0.11) 50%,
      rgba(122, 223, 255, 0.02) 82%,
      transparent 100%
    );
    box-shadow: 0 0 2px rgba(122, 223, 255, 0.035);
    pointer-events: none;
  }

  @media (max-width: 768px) {
    height: auto;
    min-height: 0;
    gap: 12px;
  }
`

export const ToolbarRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
`

export const HeaderRightLayout = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: 100%;
  white-space: normal;
  text-transform: none;
  opacity: 1;

  @media (max-width: 960px) {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
`

export const HeaderCenterControls = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  display: inline-flex;
  align-items: center;
  gap: 14px;
  pointer-events: auto;

  @media (max-width: 960px) {
    position: static;
    left: auto;
    top: auto;
    transform: none;
    justify-content: flex-start;
  }
`

export const HeaderRightInfo = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 12px;

  @media (max-width: 960px) {
    width: 100%;
    justify-content: space-between;
    flex-wrap: wrap;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }
`

export const HeaderMotorSelector = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 5px;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  background: rgba(13, 23, 48, 0.86);
  box-shadow: ${({ theme }) => theme.shadows.sm};

  @media (max-width: 640px) {
    width: 100%;
    justify-content: stretch;
  }
`

export const HeaderMotorButton = styled.button<{ $active: boolean }>`
  min-width: 164px;
  height: 40px;
  padding: 0 20px;
  border: 1px solid
    ${({ $active, theme }) =>
      $active ? `${theme.colors.borders.active}cc` : `${theme.colors.borders.primary}`};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background:
    radial-gradient(
      circle at top center,
      ${({ $active }) => ($active ? 'rgba(122, 223, 255, 0.09)' : 'transparent')} 0%,
      transparent 54%
    ),
    linear-gradient(
      180deg,
      ${({ $active, theme }) =>
          $active ? `${theme.colors.background.tertiary}` : `${theme.colors.background.secondary}`}
        0%,
      ${({ theme }) => theme.colors.background.primary} 100%
    );
  color: ${({ $active, theme }) =>
    $active ? theme.colors.accent.primary : theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.sizes.lg};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
  box-shadow: ${({ $active, theme }) =>
    $active ? `0 0 10px rgba(122, 223, 255, 0.09)` : theme.shadows.sm};
  transition:
    transform 0.18s ease,
    background 0.18s ease,
    border-color 0.18s ease,
    color 0.18s ease,
    box-shadow 0.18s ease;

  &:hover {
    transform: translateY(-1px);
    border-color: ${({ $active, theme }) =>
      $active ? `${theme.colors.borders.active}` : `${theme.colors.borders.active}90`};
  }

  &:active {
    transform: scale(0.98);
  }

  @media (max-width: 640px) {
    min-width: 0;
    flex: 1 1 0;
  }
`

export const HeaderMetaText = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  letter-spacing: 0.08em;
  text-transform: uppercase;
  white-space: nowrap;
  text-align: right;

  @media (max-width: 768px) {
    text-align: left;
    white-space: normal;
  }
`

export const UnitToggleGroup = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 7px;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  background: ${({ theme }) => theme.colors.background.secondary};
  box-shadow: ${({ theme }) => theme.shadows.sm};

  @media (max-width: 640px) {
    width: 100%;
    justify-content: stretch;
  }
`

export const UnitToggleButton = styled.button<{ $active: boolean }>`
  min-width: 92px;
  height: 40px;
  border: 1px solid
    ${({ $active, theme }) =>
      $active ? `${theme.colors.borders.active}` : `${theme.colors.borders.primary}`};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ $active, theme }) =>
    $active ? theme.colors.borders.active : theme.colors.background.primary};
  color: ${({ $active, theme }) =>
    $active ? theme.colors.text.inverse : theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.sizes.md};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  letter-spacing: 0.04em;
  cursor: pointer;
  transition:
    transform 0.18s ease,
    background 0.18s ease,
    border-color 0.18s ease,
    color 0.18s ease;

  &:hover {
    transform: translateY(-1px);
  }

  &:active {
    transform: scale(0.98);
  }

  @media (max-width: 640px) {
    flex: 1 1 0;
    min-width: 0;
  }
`

export const SpareTemperatureButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-width: 126px;
  height: 40px;
  padding: 0 14px;
  border: 1px solid rgba(122, 223, 255, 0.5);
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background:
    linear-gradient(180deg, rgba(122, 223, 255, 0.12) 0%, rgba(13, 23, 48, 0.92) 100%),
    ${({ theme }) => theme.colors.background.secondary};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.sizes.md};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  letter-spacing: 0.04em;
  cursor: pointer;
  white-space: nowrap;
  box-shadow: ${({ theme }) => theme.shadows.sm};
  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    color 0.18s ease,
    box-shadow 0.18s ease;

  &:hover {
    transform: translateY(-1px);
    border-color: rgba(122, 223, 255, 0.82);
    color: ${({ theme }) => theme.colors.accent.primary};
    box-shadow: 0 0 12px rgba(122, 223, 255, 0.1);
  }

  &:active {
    transform: scale(0.98);
  }

  @media (max-width: 640px) {
    width: 100%;
  }
`

export const SpareTemperatureModal = styled.div`
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.015) 0%, transparent 16%),
    linear-gradient(180deg, rgba(11, 19, 36, 0.99) 0%, rgba(7, 13, 24, 1) 100%);
  color: ${({ theme }) => theme.colors.text.primary};
`

export const SpareTemperatureModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 18px 20px 14px;
  border-bottom: 1px solid rgba(122, 223, 255, 0.16);
`

export const SpareTemperatureModalTitleBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`

export const SpareTemperatureModalTitle = styled.h2`
  margin: 0;
  color: ${({ theme }) => theme.colors.text.primary};
  font-family: ${({ theme }) => theme.typography.displayFamily};
  font-size: ${({ theme }) => theme.typography.sizes.xxl};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  letter-spacing: 0.04em;
`

export const SpareTemperatureModalSubtitle = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  letter-spacing: 0.06em;
  text-transform: uppercase;
`

export const SpareTemperatureCloseButton = styled.button`
  width: 38px;
  height: 38px;
  flex: 0 0 38px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme }) => theme.colors.background.primary};
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    color 0.18s ease;

  &:hover {
    transform: translateY(-1px);
    border-color: rgba(122, 223, 255, 0.78);
    color: ${({ theme }) => theme.colors.accent.primary};
  }

  &:active {
    transform: scale(0.96);
  }
`

export const SpareTemperatureDescription = styled.p`
  margin: 0;
  padding: 14px 20px;
  border-bottom: 1px solid rgba(122, 223, 255, 0.12);
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.sizes.md};
  line-height: 1.45;
`

export const SpareTemperatureTable = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
`

export const SpareTemperatureTableHead = styled.div`
  display: grid;
  grid-template-columns: 120px minmax(220px, 1.2fr) minmax(160px, 0.7fr) minmax(130px, 0.55fr);
  gap: 12px;
  padding: 12px 20px;
  border-bottom: 1px solid rgba(122, 223, 255, 0.12);
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 11px;
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  letter-spacing: 0.12em;
  text-transform: uppercase;

  @media (max-width: 760px) {
    display: none;
  }
`

export const SpareTemperatureTableBody = styled.div`
  min-height: 0;
  overflow-y: auto;
  padding: 8px 12px 14px;
`

export const SpareTemperatureTableRow = styled.div`
  display: grid;
  grid-template-columns: 120px minmax(220px, 1.2fr) minmax(160px, 0.7fr) minmax(130px, 0.55fr);
  gap: 12px;
  align-items: center;
  min-height: 54px;
  padding: 8px;
  border-bottom: 1px solid rgba(122, 223, 255, 0.07);

  &:last-child {
    border-bottom: none;
  }

  @media (max-width: 760px) {
    grid-template-columns: minmax(0, 1fr);
    gap: 6px;
    align-items: start;
    min-height: 0;
    padding: 12px 8px;
  }
`

export const SpareTemperatureSignal = styled.div`
  color: ${({ theme }) => theme.colors.accent.primary};
  font-family: ${({ theme }) => theme.typography.displayFamily};
  font-size: ${({ theme }) => theme.typography.sizes.md};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  letter-spacing: 0.05em;
`

export const SpareTemperatureName = styled.div`
  min-width: 0;
  overflow: hidden;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.sizes.md};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  text-overflow: ellipsis;
  white-space: nowrap;

  @media (max-width: 760px) {
    white-space: normal;
  }
`

export const SpareTemperatureValue = styled.div`
  display: inline-flex;
  align-items: baseline;
  gap: 7px;
  color: ${({ theme }) => theme.colors.text.primary};
  font-family: ${({ theme }) => theme.typography.numericFamily};
  font-size: 28px;
  line-height: 1;
`

export const SpareTemperatureUnit = styled.span`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-family: ${({ theme }) => theme.typography.displayFamily};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  letter-spacing: 0.06em;
  text-transform: uppercase;
`

export const SpareTemperatureRawValue = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-family: ${({ theme }) => theme.typography.numericFamily};
  font-size: ${({ theme }) => theme.typography.sizes.lg};
`

export const CategoryRow = styled.div`
  position: relative;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  padding-bottom: 20px;

  &::before {
    content: '';
    position: absolute;
    left: 8%;
    right: 8%;
    bottom: 2px;
    height: 22px;
    background: radial-gradient(
      ellipse at center,
      rgba(122, 223, 255, 0.22) 0%,
      rgba(76, 170, 255, 0.12) 26%,
      transparent 70%
    );
    filter: blur(12px);
    pointer-events: none;
  }

  &::after {
    content: '';
    position: absolute;
    left: 4%;
    right: 4%;
    bottom: 0;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(122, 223, 255, 0.1) 12%,
      rgba(122, 223, 255, 0.78) 50%,
      rgba(122, 223, 255, 0.1) 88%,
      transparent 100%
    );
    box-shadow:
      0 0 10px rgba(122, 223, 255, 0.36),
      0 0 24px rgba(76, 170, 255, 0.18);
    pointer-events: none;
  }
`

export const CategoryButton = styled.button<{ $active: boolean; $accent: string }>`
  position: relative;
  overflow: hidden;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px solid
    ${({ $active, $accent, theme }) =>
      $active ? `${$accent}aa` : `${theme.colors.borders.primary}bb`};
  background:
    radial-gradient(
      circle at top right,
      ${({ $active, $accent }) => ($active ? `${$accent}33` : 'transparent')} 0%,
      transparent 42%
    ),
    linear-gradient(
      180deg,
      ${({ $active, theme }) =>
          $active ? `${theme.colors.background.tertiary}` : `${theme.colors.background.secondary}`}
        0%,
      ${({ theme }) => theme.colors.background.primary} 100%
    );
  color: ${({ theme }) => theme.colors.text.primary};
  min-height: 118px;
  padding: 18px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  text-align: left;
  cursor: pointer;
  box-shadow: ${({ $active, $accent, theme }) =>
    $active ? `0 0 22px ${$accent}33` : theme.shadows.md};
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    background 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    border-color: ${({ $active, $accent, theme }) =>
      $active ? `${$accent}cc` : `${theme.colors.borders.active}90`};
  }

  &:active {
    transform: scale(0.99);
  }
`

export const CategoryIconWrap = styled.div<{ $accent: string; $active: boolean }>`
  width: 58px;
  height: 58px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 18px;
  background: ${({ $accent, $active }) =>
    $active ? `linear-gradient(160deg, ${$accent} 0%, ${$accent}aa 100%)` : `${$accent}18`};
  color: ${({ $active, theme }) =>
    $active ? theme.colors.text.inverse : theme.colors.text.primary};
  box-shadow: ${({ $active, $accent }) => ($active ? `0 10px 28px ${$accent}44` : 'none')};
`

export const CategoryText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
`

export const CategoryTitle = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.lg};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  letter-spacing: 0.03em;
`

export const CategoryDescription = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  line-height: 1.4;
`

export const ContentGrid = styled.div`
  position: relative;
  flex: 1;
  min-height: 0;
  display: block;
  padding-top: 0;

  @media (max-width: 768px) {
    flex: 0 0 auto;
  }
`

export const SectionBoard = styled.div`
  position: relative;
  min-height: 0;
  height: 100%;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.005) 0%, transparent 16%),
    linear-gradient(180deg, rgba(14, 24, 39, 0.98) 0%, rgba(8, 14, 24, 1) 100%);
  padding: 14px;
  overflow: hidden;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.03),
    0 12px 24px rgba(5, 9, 16, 0.24);

  &::before {
    content: '';
    position: absolute;
    left: 16%;
    right: 16%;
    top: 0;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(122, 223, 255, 0.015) 18%,
      rgba(122, 223, 255, 0.085) 50%,
      rgba(122, 223, 255, 0.015) 82%,
      transparent 100%
    );
    box-shadow: 0 0 2px rgba(122, 223, 255, 0.03);
    pointer-events: none;
  }

  @media (max-width: 768px) {
    height: auto;
    padding: 12px;
    overflow: visible;
  }
`

export const SectionScroller = styled.div`
  height: 100%;
  min-height: 0;
  overflow: hidden;

  @media (max-width: 768px) {
    height: auto;
    overflow: visible;
  }
`

export const SectionList = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 0.88fr) minmax(0, 0.72fr) minmax(0, 1.4fr);
  gap: 14px;
  height: 100%;
  min-height: 100%;
  align-content: stretch;

  @media (max-width: 768px) {
    grid-template-columns: minmax(0, 1fr);
    height: auto;
    min-height: 0;
  }
`

const sectionPlacement = ({ $layout }: { $layout: SectionLayout }) => {
  switch ($layout) {
    case 'bearings':
      return css`
        grid-column: 1;
        grid-row: 1;
      `
    case 'cooling':
      return css`
        grid-column: 2;
        grid-row: 1;
      `
    case 'windings':
      return css`
        grid-column: 1 / span 2;
        grid-row: 2;
      `
    case 'igbt':
      return css`
        grid-column: 3;
        grid-row: 1 / span 2;
        height: 100%;
      `
    default:
      return ''
  }
}

export const CategorySection = styled.section<{
  $accent: string
  $alarm: boolean
  $layout: SectionLayout
}>`
  position: relative;
  overflow: hidden;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px solid ${({ $layout }) => `${getSectionPalette($layout).border}8f`};
  background:
    linear-gradient(
      135deg,
      ${({ $layout }) => getSectionPalette($layout).washSoft} 0%,
      transparent 44%
    ),
    linear-gradient(
      220deg,
      ${({ $layout }) => getSectionPalette($layout).washStrong} 0%,
      transparent 34%
    ),
    linear-gradient(
      180deg,
      ${({ $layout }) => getSectionPalette($layout).surfaceStart} 0%,
      ${({ $layout }) => getSectionPalette($layout).surfaceEnd} 100%
    );
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding: 14px;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.008),
    0 0 0 1px ${({ $layout }) => `${getSectionPalette($layout).border}14`},
    0 12px 22px rgba(5, 10, 18, 0.22);
  ${sectionPlacement}

  &::before {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    height: 2px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      ${({ $layout }) => `${getSectionPalette($layout).edge}10`} 14%,
      ${({ $layout }) => `${getSectionPalette($layout).edge}31`} 50%,
      ${({ $layout }) => `${getSectionPalette($layout).edge}10`} 86%,
      transparent 100%
    );
    box-shadow: 0 0 2px ${({ $layout }) => `${getSectionPalette($layout).edge}0a`};
    pointer-events: none;
  }

  &::after {
    content: ${({ $alarm }) => ($alarm ? "''" : 'none')};
    position: absolute;
    inset: 0;
    border-radius: inherit;
    box-shadow: inset 0 0 0 1px rgba(122, 223, 255, 0.34);
    pointer-events: none;
  }

  @media (max-width: 768px) {
    grid-column: 1;
    grid-row: auto;
    height: auto;
  }
`

export const CategorySectionHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 12px;
  margin-bottom: 12px;

  @media (max-width: 768px) {
    margin-bottom: 10px;
  }
`

export const CategorySectionTitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
`

export const CategorySectionIcon = styled.div<{ $accent: string }>`
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  border: 1px solid ${({ $accent }) => `${$accent}40`};
  background: linear-gradient(
    180deg,
    ${({ $accent }) => `${$accent}08`} 0%,
    rgba(7, 14, 24, 0.86) 100%
  );
  color: ${({ $accent }) => $accent};
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.01);
`

export const CategorySectionHeading = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`

export const CategorySectionTitle = styled.h3`
  margin: 0;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.sizes.xl};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  letter-spacing: 0.04em;
`

export const CategorySectionDescription = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  line-height: 1.45;
`

export const MetricGrid = styled.div<{ $layout: SectionLayout }>`
  display: grid;
  gap: 10px;
  grid-auto-rows: minmax(0, 1fr);
  ${({ $layout }) => {
    switch ($layout) {
      case 'bearings':
        return css`
          grid-template-columns: repeat(2, minmax(0, 1fr));
        `
      case 'cooling':
        return css`
          grid-template-columns: minmax(0, 1fr);
          gap: 8px;
          align-content: start;
        `
      case 'windings':
        return css`
          grid-template-columns: repeat(3, minmax(0, 1fr));
        `
      case 'igbt':
        return css`
          grid-template-columns: repeat(3, minmax(0, 1fr));
          flex: 1;
          min-height: 0;
          align-content: stretch;
        `
      default:
        return css`
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        `
    }
  }}

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-auto-rows: minmax(96px, auto);
  }
`

export const MetricCard = styled.div<{
  $alarm: boolean
  $animateAlert: boolean
  $severity: MetricAlertSeverity
  $layout: SectionLayout
  $accent: string
}>`
  position: relative;
  overflow: hidden;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px solid
    ${({ $alarm, $layout, $severity }) => {
      const severityAccent = getMetricSeverityAccent($severity)
      if (severityAccent) return `${severityAccent}b0`
      return $alarm ? `${TEMPERATURE_ALERT_ACCENT}72` : `${getSectionPalette($layout).border}52`
    }};
  background:
    radial-gradient(
      circle at top right,
      ${({ $severity }) =>
          $severity === 'warning'
            ? 'rgba(250, 204, 21, 0.16)'
            : $severity === 'critical'
              ? 'rgba(255, 107, 107, 0.18)'
              : 'transparent'}
        0%,
      transparent 48%
    ),
    linear-gradient(
      150deg,
      ${({ $layout }) => getSectionPalette($layout).cardWashSoft} 0%,
      transparent 48%
    ),
    linear-gradient(
      210deg,
      ${({ $layout }) => getSectionPalette($layout).cardWashStrong} 0%,
      transparent 34%
    ),
    linear-gradient(
      180deg,
      ${({ $layout }) => getSectionPalette($layout).cardStart} 0%,
      ${({ $layout }) => getSectionPalette($layout).cardEnd} 100%
    );
  padding: 12px 12px 14px;
  min-height: 118px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 10px;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.008),
    ${({ $alarm }) =>
      $alarm ? '0 0 0 1px rgba(122, 223, 255, 0.14)' : '0 10px 18px rgba(4, 8, 14, 0.14)'};
  ${({ $severity, $animateAlert }) =>
    $animateAlert &&
    $severity === 'warning' &&
    css`
      animation: ${warningCardBlink} 1.05s step-end infinite;
    `}
  ${({ $severity, $animateAlert }) =>
    $animateAlert &&
    $severity === 'critical' &&
    css`
      animation: ${criticalCardBlink} 0.8s step-end infinite;
    `}

  ${({ $layout }) =>
    $layout === 'cooling' &&
    css`
      min-height: 90px;
      padding: 10px 12px 12px;
      gap: 8px;
    `}

  ${({ $layout, $alarm }) => {
    const cardAccent = $alarm ? TEMPERATURE_ALERT_ACCENT : getSectionPalette($layout).edge

    return css`
      &::before {
        content: '';
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        height: 1px;
        background: linear-gradient(
          90deg,
          transparent 0%,
          ${cardAccent}08 12%,
          ${cardAccent}1b 50%,
          ${cardAccent}08 88%,
          transparent 100%
        );
        box-shadow: 0 0 2px ${cardAccent}05;
        pointer-events: none;
      }
    `
  }}

  @media (max-width: 768px) {
    min-height: 0;
    padding: 12px;
  }
`

export const MetricCardTop = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`

export const MetricLabel = styled.div`
  color: ${({ theme }) => theme.colors.text.primary};
  font-family: ${({ theme }) => theme.typography.displayFamily};
  font-size: ${({ theme }) => theme.typography.sizes.lg};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  letter-spacing: 0.05em;

  @media (max-width: 768px) {
    font-size: ${({ theme }) => theme.typography.sizes.md};
  }
`

export const MetricValueRow = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 6px;
`

export const MetricValue = styled.span<{
  $alarm: boolean
  $animateAlert: boolean
  $severity: MetricAlertSeverity
  $layout?: SectionLayout
}>`
  font-family: ${({ theme }) => theme.typography.numericFamily};
  font-size: ${({ $layout }) =>
    $layout === 'cooling' ? 'clamp(34px, 2.05vw, 42px)' : 'clamp(42px, 2.6vw, 54px)'};
  line-height: ${({ $layout }) => ($layout === 'cooling' ? 0.96 : 0.92)};
  color: ${({ $alarm, $severity, theme }) => {
    if ($severity === 'warning') return WARNING_ALERT_ACCENT
    if ($severity === 'critical') return CRITICAL_ALERT_ACCENT
    return $alarm ? TEMPERATURE_ALERT_ACCENT : theme.colors.text.primary
  }};
  ${({ $severity, $animateAlert }) =>
    $animateAlert &&
    $severity === 'warning' &&
    css`
      animation: ${warningValueBlink} 1.05s step-end infinite;
    `}
  ${({ $severity, $animateAlert }) =>
    $animateAlert &&
    $severity === 'critical' &&
    css`
      animation: ${criticalValueBlink} 0.8s step-end infinite;
    `}

  @media (max-width: 768px) {
    font-size: ${({ $layout }) =>
      $layout === 'cooling' ? 'clamp(28px, 8vw, 36px)' : 'clamp(32px, 9vw, 40px)'};
  }
`

export const MetricUnit = styled.span<{ $layout?: SectionLayout }>`
  margin-bottom: ${({ $layout }) => ($layout === 'cooling' ? '2px' : '4px')};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-family: ${({ theme }) => theme.typography.displayFamily};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  letter-spacing: 0.06em;
  text-transform: uppercase;
`

export const GaugeBoard = styled.div`
  position: relative;
  min-height: 0;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  background: linear-gradient(
    180deg,
    ${({ theme }) => theme.colors.background.secondary} 0%,
    ${({ theme }) => theme.colors.background.primary} 100%
  );
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    left: 16%;
    right: 16%;
    top: 0;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(122, 223, 255, 0.14) 18%,
      rgba(122, 223, 255, 0.86) 50%,
      rgba(122, 223, 255, 0.14) 82%,
      transparent 100%
    );
    box-shadow: 0 0 12px rgba(122, 223, 255, 0.28);
    pointer-events: none;
  }
`

export const GaugeScroller = styled.div`
  flex: 1;
  display: flex;
  min-height: 0;
  overflow-y: auto;
  padding-right: 6px;
`

export const GaugeGrid = styled.div<{ $compact?: boolean }>`
  display: grid;
  flex: 1;
  grid-template-columns: ${({ $compact }) =>
    $compact ? 'repeat(6, minmax(0, 1fr))' : 'repeat(auto-fit, minmax(150px, 1fr))'};
  grid-template-rows: ${({ $compact }) => ($compact ? 'repeat(2, minmax(0, 1fr))' : 'none')};
  gap: ${({ $compact }) => ($compact ? '12px' : '16px')};
  align-items: stretch;
  align-content: stretch;
  min-height: 100%;
`

export const ThermometerCard = styled.div<{
  $alarm: boolean
  $expanded?: boolean
  $compact?: boolean
}>`
  position: relative;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px solid
    ${({ $alarm, theme }) =>
      $alarm ? `${TEMPERATURE_ALERT_ACCENT}88` : `${theme.colors.borders.primary}`};
  background: linear-gradient(
    180deg,
    ${({ $alarm, theme }) =>
        $alarm ? `${TEMPERATURE_ALERT_ACCENT}12` : `${theme.colors.background.primary}`}
      0%,
    ${({ theme }) => theme.colors.background.secondary} 100%
  );
  padding: ${({ $compact }) => ($compact ? '12px 12px 14px' : '14px 12px 16px')};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ $compact }) => ($compact ? '10px' : '12px')};
  height: ${({ $compact }) => ($compact ? '100%' : 'auto')};
  min-height: ${({ $expanded, $compact }) => ($expanded ? '500px' : $compact ? '0' : '380px')};
  box-shadow: ${({ theme }) => theme.shadows.md};
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    left: ${({ $compact }) => ($compact ? '16px' : '24px')};
    right: ${({ $compact }) => ($compact ? '16px' : '24px')};
    top: ${({ $compact }) => ($compact ? '52px' : '68px')};
    height: ${({ $compact }) => ($compact ? '16px' : '20px')};
    background: radial-gradient(
      ellipse at center,
      rgba(76, 170, 255, 0.14) 0%,
      rgba(76, 170, 255, 0.06) 34%,
      transparent 76%
    );
    filter: blur(10px);
    pointer-events: none;
  }
`

export const ThermometerTop = styled.div<{ $compact?: boolean }>`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: ${({ $compact }) => ($compact ? '2px' : '4px')};
  align-items: center;
  text-align: center;
`

export const GaugeLabel = styled.div<{ $compact?: boolean }>`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ $compact, theme }) =>
    $compact ? theme.typography.sizes.xl : theme.typography.sizes.xl};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  line-height: ${({ $compact }) => ($compact ? 1.1 : 1.25)};
  letter-spacing: ${({ $compact }) => ($compact ? '0.02em' : 'normal')};
`

export const GaugeMeta = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  line-height: 1.35;
`

export const ThermometerWrap = styled.div<{ $compact?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  min-height: 0;
  width: 100%;
  padding-top: ${({ $compact }) => ($compact ? '4px' : '0')};
`

export const GaugeFooter = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
`

export const GaugeFooterItem = styled.div`
  padding: 8px 10px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme }) => theme.colors.background.primary};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  text-align: center;
`

export const GaugeFooterLabel = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
`

export const GaugeFooterValue = styled.div`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  margin-top: 4px;
`
