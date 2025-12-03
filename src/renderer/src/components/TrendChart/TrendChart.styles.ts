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

interface ContainerProps {
  variant: TrendChartVariant
  width?: string | number
  height?: string | number
  position?: Position
  backgroundColor?: string
  borderColor?: string
}

export const Container = styled.div<ContainerProps>`
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

export const TitleBar = styled.div<TitleBarProps>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
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

export const TitleText = styled.span<TitleTextProps>`
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

export const ChartWrapper = styled.div`
  flex: 1;
  position: relative;
  padding: 8px;
  min-height: 0;

  canvas {
    width: 100% !important;
    height: 100% !important;
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
