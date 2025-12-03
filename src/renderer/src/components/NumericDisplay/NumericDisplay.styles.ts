import styled, { css } from 'styled-components'
import type {
  DisplayVariant,
  LabelPosition,
  ContentAlignment,
  InternalSpacing
} from './NumericDisplay.types'

// Style variants using the theme
const modernVariant = css`
  background: ${({ theme }) => theme.colors.gradients.card};
  border: 2px solid ${({ theme }) => theme.colors.borders.primary};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow:
    ${({ theme }) => theme.shadows.lg},
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);

  &:hover {
    transform: translateY(-2px);
    box-shadow:
      ${({ theme }) => theme.shadows.glow},
      inset 0 1px 0 rgba(255, 255, 255, 0.15);
    border-color: ${({ theme }) => theme.colors.accent.primary};
  }
`

const industrialVariant = css`
  background: ${({ theme }) => theme.colors.background.primary};
  border: 2px solid ${({ theme }) => theme.colors.borders.primary};
  border-radius: 0;
  box-shadow:
    inset 0 0 0 1px #333333,
    ${({ theme }) => theme.shadows.md};

  &:hover {
    border-color: ${({ theme }) => theme.colors.text.secondary};
    box-shadow:
      inset 0 0 0 1px #444444,
      ${({ theme }) => theme.shadows.lg};
  }
`

const minimalVariant = css`
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  box-shadow: none;
  backdrop-filter: blur(20px);

  &:hover {
    background: rgba(255, 255, 255, 0.04);
    border-color: rgba(255, 255, 255, 0.2);
  }
`

const getVariantStyles = (variant: DisplayVariant) => {
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

export const DisplayContainer = styled.div<{
  variant: DisplayVariant
  width?: string | number
  height?: string | number
  position?: {
    left?: string | number
    top?: string | number
    right?: string | number
    bottom?: string | number
  }
  backgroundColor?: string
  borderColor?: string
  spacing?: InternalSpacing
  contentAlignment?: ContentAlignment
  labelPosition?: LabelPosition
}>`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  overflow: hidden;

  /* Dimensiones exactas */
  width: ${({ width }) => (typeof width === 'number' ? `${width}px` : width || '200px')};
  height: ${({ height }) => (typeof height === 'number' ? `${height}px` : height || '120px')};

  /* Posicionamiento */
  ${({ position }) =>
    position &&
    css`
      left: ${position.left
        ? typeof position.left === 'number'
          ? `${position.left}px`
          : position.left
        : 'auto'};
      top: ${position.top
        ? typeof position.top === 'number'
          ? `${position.top}px`
          : position.top
        : 'auto'};
      right: ${position.right
        ? typeof position.right === 'number'
          ? `${position.right}px`
          : position.right
        : 'auto'};
      bottom: ${position.bottom
        ? typeof position.bottom === 'number'
          ? `${position.bottom}px`
          : position.bottom
        : 'auto'};
    `}

  /* Padding personalizable */
  padding: ${({ spacing }) =>
    spacing?.padding
      ? typeof spacing.padding === 'number'
        ? `${spacing.padding}px`
        : spacing.padding
      : '8px'};

  /* Variante de estilo */
  ${({ variant }) => getVariantStyles(variant)}

  /* Override de colores si se especifican */
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

  /* Layout according to label position */
  ${({ labelPosition }) => {
    switch (labelPosition) {
      case 'top':
        return css`
          flex-direction: column;
          justify-content: center;
        `
      case 'bottom':
        return css`
          flex-direction: column-reverse;
          justify-content: center;
        `
      case 'left':
        return css`
          flex-direction: row;
          justify-content: center;
        `
      case 'right':
        return css`
          flex-direction: row-reverse;
          justify-content: center;
        `
      default:
        return css`
          flex-direction: column;
          justify-content: center;
        `
    }
  }}

  /* Content alignment */
  ${({ contentAlignment }) => {
    switch (contentAlignment) {
      case 'left':
        return css`
          text-align: left;
          align-items: flex-start;
        `
      case 'right':
        return css`
          text-align: right;
          align-items: flex-end;
        `
      default:
        return css`
          text-align: center;
          align-items: center;
        `
    }
  }}
`

export const ContentWrapper = styled.div<{
  labelPosition?: LabelPosition
  spacing?: InternalSpacing
  isSmall?: boolean
}>`
  display: flex;
  flex-direction: column;
  align-items: inherit;
  justify-content: center;
  flex: 1;
  min-width: 0; /* Para permitir ellipsis */

  /* Espaciado con etiqueta */
  ${({ labelPosition, spacing, isSmall }) => {
    const gap = spacing?.labelGap
      ? typeof spacing.labelGap === 'number'
        ? `${spacing.labelGap}px`
        : spacing.labelGap
      : '8px'

    // Reduce spacing when space is small
    const adjustedGap = isSmall ? '2px' : gap

    switch (labelPosition) {
      case 'top':
        return css`
          margin-bottom: ${adjustedGap};
        `
      case 'bottom':
        return css`
          margin-top: ${adjustedGap};
        `
      case 'left':
        return css`
          margin-right: ${adjustedGap};
        `
      case 'right':
        return css`
          margin-left: ${adjustedGap};
        `
      default:
        return css`
          margin-bottom: ${adjustedGap};
        `
    }
  }}
`

export const ValueContainer = styled.div<{
  variant: DisplayVariant
  valueColor?: string
  valueFontSize?: string | number
  fontFamily?: string
  spacing?: InternalSpacing
  useEllipsis?: boolean
  scaleFactor?: number
}>`
  display: flex;
  align-items: baseline;
  justify-content: inherit;
  min-width: 0;

  /* Espaciado entre valor y unidad */
  gap: ${({ spacing }) =>
    spacing?.valueUnitGap
      ? typeof spacing.valueUnitGap === 'number'
        ? `${spacing.valueUnitGap}px`
        : spacing.valueUnitGap
      : '6px'};

  /* Base typography */
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  letter-spacing: 0.5px;

  /* Responsive font size */
  font-size: ${({ valueFontSize, scaleFactor }) => {
    const baseSize =
      typeof valueFontSize === 'number' ? valueFontSize : parseInt(valueFontSize as string) || 32
    const finalSize = scaleFactor ? baseSize * scaleFactor : baseSize
    return `${finalSize}px`
  }};

  /* Familia de fuente por variante */
  font-family: ${({ variant, fontFamily, theme }) => {
    if (fontFamily) return fontFamily
    return theme.typography.fontFamily
  }};

  /* Color por variante */
  color: ${({ variant, valueColor, theme }) => {
    if (valueColor) return valueColor
    switch (variant) {
      case 'industrial':
        return '#ffff00'
      case 'minimal':
        return theme.colors.text.primary
      case 'modern':
      default:
        return theme.colors.accent.success
    }
  }};

  /* Efectos por variante */
  ${({ variant, valueColor }) => {
    const color =
      valueColor ||
      (variant === 'industrial' ? '#ffff00' : variant === 'minimal' ? '#f8f9fa' : '#00ff88')

    switch (variant) {
      case 'industrial':
        return css`
          text-shadow:
            0 0 3px ${color}80,
            0 0 6px ${color}40;
          filter: brightness(1);
        `
      case 'minimal':
        return css`
          text-shadow: none;
        `
      case 'modern':
      default:
        return css`
          text-shadow: 0 0 10px ${color}40;
        `
    }
  }}

  /* Ellipsis if enabled */
  ${({ useEllipsis }) =>
    useEllipsis &&
    css`
      overflow: hidden;
      white-space: nowrap;

      & > span {
        overflow: hidden;
        text-overflow: ellipsis;
      }
    `}

  /* Entry animation */
  animation: fadeInUp 0.5s ease-out;

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(5px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`

export const UnitText = styled.span<{
  variant: DisplayVariant
  unitColor?: string
  unitFontSize?: string | number
  scaleFactor?: number
}>`
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  opacity: 0.9;

  /* Responsive size */
  font-size: ${({ unitFontSize, scaleFactor }) => {
    const baseSize =
      typeof unitFontSize === 'number' ? unitFontSize : parseInt(unitFontSize as string) || 18
    const finalSize = scaleFactor ? baseSize * scaleFactor : baseSize
    return `${finalSize}px`
  }};

  /* Color por variante */
  color: ${({ variant, unitColor, theme }) => {
    if (unitColor) return unitColor
    switch (variant) {
      case 'industrial':
        return '#ffff00'
      case 'minimal':
        return theme.colors.text.secondary
      case 'modern':
      default:
        return theme.colors.text.secondary
    }
  }};
`

export const LabelText = styled.div<{
  variant: DisplayVariant
  labelColor?: string
  labelFontSize?: string | number
  scaleFactor?: number
  isHidden?: boolean
}>`
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  letter-spacing: 0.5px;
  text-transform: uppercase;
  opacity: ${({ isHidden }) => (isHidden ? 0 : 0.9)};
  pointer-events: ${({ isHidden }) => (isHidden ? 'none' : 'auto')};
  transition: opacity 0.3s ease;

  /* Responsive size */
  font-size: ${({ labelFontSize, scaleFactor }) => {
    const baseSize =
      typeof labelFontSize === 'number' ? labelFontSize : parseInt(labelFontSize as string) || 14
    const finalSize = scaleFactor ? baseSize * scaleFactor : baseSize
    return `${Math.max(finalSize, 6)}px`
  }};

  /* Color por variante */
  color: ${({ variant, labelColor, theme }) => {
    if (labelColor) return labelColor
    switch (variant) {
      case 'industrial':
        return theme.colors.text.primary
      case 'minimal':
        return theme.colors.text.secondary
      case 'modern':
      default:
        return theme.colors.text.primary
    }
  }};
`

export const PlaceholderText = styled.span<{
  variant: DisplayVariant
}>`
  font-weight: ${({ theme }) => theme.typography.weights.regular};
  opacity: 0.6;

  color: ${({ variant, theme }) => {
    switch (variant) {
      case 'industrial':
        return '#666600'
      case 'minimal':
        return theme.colors.text.secondary
      case 'modern':
      default:
        return theme.colors.text.secondary
    }
  }};
`

export const GlowEffect = styled.div<{
  variant: DisplayVariant
  color?: string
}>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: inherit;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s ease;

  ${({ variant, color }) => {
    const glowColor =
      color ||
      (variant === 'industrial' ? '#ffff00' : variant === 'minimal' ? '#ffffff' : '#00ff88')

    switch (variant) {
      case 'industrial':
        return css`
          background: radial-gradient(circle at center, ${glowColor}08 0%, transparent 60%);
        `
      case 'minimal':
        return css`
          background: radial-gradient(circle at center, ${glowColor}05 0%, transparent 60%);
        `
      case 'modern':
      default:
        return css`
          background: radial-gradient(circle at center, ${glowColor}20 0%, transparent 70%);
        `
    }
  }}

  &.active {
    opacity: 1;
  }
`
