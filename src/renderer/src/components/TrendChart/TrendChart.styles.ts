import styled, { css } from 'styled-components'
import type { TrendChartVariant, Position } from './TrendChart.types'

// === Variant Styles ===

const modernVariant = css`
  background: ${({ theme }) => theme.colors.gradients.card};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow:
    ${({ theme }) => theme.shadows.lg},
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
`

const industrialVariant = css`
  background: ${({ theme }) => theme.colors.background.primary};
  border: 2px solid ${({ theme }) => theme.colors.borders.primary};
  border-radius: 0;
  box-shadow:
    inset 0 0 0 1px rgba(51, 51, 51, 0.5),
    ${({ theme }) => theme.shadows.md};
`

const minimalVariant = css`
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  box-shadow: none;
  backdrop-filter: blur(20px);
`

const getVariantStyles = (variant: TrendChartVariant): ReturnType<typeof css> => {
  switch (variant) {
    case 'industrial':
      return industrialVariant
    case 'minimal':
      return minimalVariant
    case 'modern':
    default:
      return modernVariant
  }
}

// === Container Props ===

const shouldForwardContainerProp = (prop: string): boolean =>
  !['variant', 'width', 'height', 'position', 'backgroundColor', 'borderColor'].includes(prop)

interface ContainerProps {
  variant: TrendChartVariant
  width?: string | number
  height?: string | number
  position?: Position
  backgroundColor?: string
  borderColor?: string
}

export const Container = styled.div.withConfig({
  shouldForwardProp: (prop) => shouldForwardContainerProp(prop)
})<ContainerProps>`
  position: absolute;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: all 0.3s ease;

  /* Dimensions */
  width: ${({ width }) => (typeof width === 'number' ? `${width}px` : width || '400px')};
  height: ${({ height }) => (typeof height === 'number' ? `${height}px` : height || '300px')};

  /* Positioning */
  ${({ position }) =>
    position &&
    css`
      ${position.left !== undefined && `left: ${position.left}px;`}
      ${position.top !== undefined && `top: ${position.top}px;`}
      ${position.right !== undefined && `right: ${position.right}px;`}
      ${position.bottom !== undefined && `bottom: ${position.bottom}px;`}
    `}

  /* Apply variant styles */
  ${({ variant }) => getVariantStyles(variant)}

  /* Override colors if specified */
  ${({ backgroundColor }) =>
    backgroundColor &&
    css`
      background: ${backgroundColor} !important;
    `}

  ${({ borderColor }) =>
    borderColor &&
    css`
      border-color: ${borderColor} !important;
    `}
`

// === Title Bar ===

interface TitleBarProps {
  variant: TrendChartVariant
}

const shouldForwardVariantProp = (prop: string): boolean => prop !== 'variant'

export const TitleBar = styled.div.withConfig({
  shouldForwardProp: (prop) => shouldForwardVariantProp(prop)
})<TitleBarProps & { $compact?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ $compact }) => ($compact ? '4px 10px' : '8px 12px')};
  border-bottom: 1px solid ${({ theme }) => theme.colors.borders.primary};
  flex-shrink: 0;

  ${({ variant, theme }) => {
    switch (variant) {
      case 'industrial':
        return css`
          background: ${theme.colors.background.secondary};
        `
      case 'minimal':
        return css`
          background: transparent;
          border-bottom-color: rgba(255, 255, 255, 0.08);
        `
      default:
        return css`
          background: rgba(0, 0, 0, 0.2);
        `
    }
  }}
`

interface TitleTextProps {
  variant: TrendChartVariant
}

export const TitleText = styled.span.withConfig({
  shouldForwardProp: (prop) => shouldForwardVariantProp(prop)
})<TitleTextProps>`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  letter-spacing: 0.5px;
  text-transform: uppercase;

  ${({ variant }) =>
    variant === 'industrial' &&
    css`
      font-family: 'Consolas', 'Courier New', monospace;
    `}
`

export const TimeIndicator = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.md};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-variant-numeric: tabular-nums;
`

// === Chart Wrapper ===

export const ChartWrapper = styled.div<{ $compact?: boolean }>`
  flex: 1;
  position: relative;
  padding: ${({ $compact }) => ($compact ? '0px' : '8px')};
  min-height: 0;

  .uplot {
    width: 100%;
    height: 200%;
    font-family: ${({ theme }) => theme.typography.fontFamily};
  }
`

// === Loading State ===

export const LoadingContainer = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.sm};

  &::after {
    content: '';
    width: 20px;
    height: 20px;
    margin-left: 10px;
    border: 2px solid ${({ theme }) => theme.colors.borders.primary};
    border-top-color: ${({ theme }) => theme.colors.accent.primary};
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`

// === Error State ===

export const ErrorContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px;
  text-align: center;
  gap: 8px;
`

export const ErrorTitle = styled.div`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.status.alarm};
`

export const ErrorMessage = styled.div`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
  max-width: 80%;
`

// === No Data State ===

export const NoDataContainer = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-style: italic;
`

// === Legend ===

export const LegendContainer = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  padding: 6px 10px;
  background: ${({ theme }) => `${theme.colors.background.tertiary}cc`};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  box-shadow: ${({ theme }) => theme.shadows.md};
  backdrop-filter: blur(6px);
  z-index: 2;
`

export const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
`

export const LegendDot = styled.span`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
`

// === Tooltip ===

export const TooltipContainer = styled.div`
  position: absolute;
  min-width: 160px;
  background: ${({ theme }) => theme.colors.background.tertiary};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  padding: 8px 10px;
  pointer-events: none;
  color: ${({ theme }) => theme.colors.text.primary};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  z-index: 3;
`

export const TooltipHeader = styled.div`
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  margin-bottom: 6px;
  color: ${({ theme }) => theme.colors.text.secondary};
  letter-spacing: 0.2px;
`

export const TooltipRow = styled.div`
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 8px;
  padding: 2px 0;
  color: ${({ theme }) => theme.colors.text.primary};
`

// === Inspector Panel ===

export const InspectorContainer = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  width: 240px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px 12px;
  background: ${({ theme }) => `${theme.colors.background.secondary}e6`};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  backdrop-filter: blur(6px);
  z-index: 3;
  pointer-events: none;
`

export const InspectorSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`

export const InspectorHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  letter-spacing: 0.2px;
`

export const InspectorTitle = styled.span`
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  text-transform: uppercase;
`

export const InspectorTime = styled.span`
  font-variant-numeric: tabular-nums;
  color: ${({ theme }) => theme.colors.text.secondary};
`

export const InspectorRow = styled.div`
  display: grid;
  grid-template-columns: auto 1fr auto auto;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
  color: ${({ theme }) => theme.colors.text.primary};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
`

export const InspectorValue = styled.span`
  font-variant-numeric: tabular-nums;
  color: ${({ theme }) => theme.colors.text.primary};
`

export const DeltaBadge = styled.span<{ tone: 'positive' | 'negative' | 'neutral' }>`
  padding: 2px 6px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-variant-numeric: tabular-nums;
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  color: ${({ theme, tone }) => {
    if (tone === 'positive') return theme.colors.status.running
    if (tone === 'negative') return theme.colors.status.alarm
    return theme.colors.text.secondary
  }};
  background: ${({ theme }) => `${theme.colors.background.tertiary}aa`};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
`

export const InspectorActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 4px;
`

export const ClearPinButton = styled.button`
  pointer-events: auto;
  padding: 6px 10px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  background: ${({ theme }) => `${theme.colors.background.tertiary}dd`};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.background.secondary};
    color: ${({ theme }) => theme.colors.accent.primary};
  }
`

export const Divider = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.colors.borders.primary};
  opacity: 0.3;
`

export const EmptyState = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-family: ${({ theme }) => theme.typography.fontFamily};
`

// === Scrubber Lines ===

export const ScrubberLine = styled.div`
  position: absolute;
  top: 8px;
  bottom: 8px;
  width: 1px;
  background: ${({ theme }) => theme.colors.accent.primary};
  opacity: 0.8;
  pointer-events: none;
  z-index: 2;
`

export const PinnedLine = styled.div`
  position: absolute;
  top: 8px;
  bottom: 8px;
  width: 1px;
  background: ${({ theme }) => theme.colors.status.warning};
  opacity: 0.9;
  pointer-events: none;
  z-index: 2;
  box-shadow: 0 0 0 1px ${({ theme }) => `${theme.colors.status.warning}55`};
`
