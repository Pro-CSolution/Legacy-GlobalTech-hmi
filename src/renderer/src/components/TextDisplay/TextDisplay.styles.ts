import styled from 'styled-components'
import type { TextDisplayProps, TextVariant } from './TextDisplay.types'

// Predefined variant configurations using the theme
const getVariantStyles = (variant: TextVariant, theme: any) => {
  const variants = {
    title: {
      fontSize: theme.typography.sizes.xxl,
      fontWeight: theme.typography.weights.bold,
      color: theme.colors.text.primary,
      lineHeight: '1.2',
      letterSpacing: '0.5px',
      fontFamily: theme.typography.fontFamily,
      textTransform: undefined
    },
    subtitle: {
      fontSize: theme.typography.sizes.xl,
      fontWeight: theme.typography.weights.medium,
      color: theme.colors.text.primary,
      lineHeight: '1.3',
      letterSpacing: '0.3px',
      fontFamily: theme.typography.fontFamily,
      textTransform: undefined
    },
    label: {
      fontSize: theme.typography.sizes.sm,
      fontWeight: theme.typography.weights.medium,
      color: theme.colors.text.secondary,
      lineHeight: '1.4',
      letterSpacing: '0.2px',
      fontFamily: theme.typography.fontFamily,
      textTransform: undefined
    },
    value: {
      fontSize: theme.typography.sizes.lg,
      fontWeight: theme.typography.weights.bold,
      color: theme.colors.text.primary,
      lineHeight: '1.1',
      letterSpacing: '0.1px',
      fontFamily: 'monospace', // For numeric values
      textTransform: undefined
    },
    status: {
      fontSize: theme.typography.sizes.md,
      fontWeight: theme.typography.weights.medium,
      color: theme.colors.text.primary,
      lineHeight: '1.3',
      letterSpacing: '0.1px',
      fontFamily: theme.typography.fontFamily,
      textTransform: undefined
    },
    button: {
      fontSize: theme.typography.sizes.md,
      fontWeight: theme.typography.weights.bold,
      color: theme.colors.text.primary,
      lineHeight: '1.2',
      letterSpacing: '0.2px',
      fontFamily: theme.typography.fontFamily,
      textTransform: 'uppercase' as const
    },
    caption: {
      fontSize: theme.typography.sizes.xs,
      fontWeight: theme.typography.weights.regular,
      color: theme.colors.text.secondary,
      lineHeight: '1.4',
      letterSpacing: '0.1px',
      fontFamily: theme.typography.fontFamily,
      textTransform: undefined
    }
  }
  return variants[variant]
}

// Function to get status color
const getStatusColor = (status: string | undefined, theme: any) => {
  switch (status) {
    case 'warning':
      return theme.colors.status.warning
    case 'error':
      return theme.colors.status.stopped
    case 'success':
      return theme.colors.status.running
    default:
      return undefined
  }
}

export const StyledTextDisplay = styled.div<{
  $position: TextDisplayProps['position']
  $variant: TextVariant
  $customColor?: string
  $customFontSize?: number
  $customFontWeight?: number | string
  $alignment?: string
  $width?: number
  $height?: number
  $maxWidth?: number
  $minWidth?: number
  $status?: string
  $multiline?: boolean
  $customLineHeight?: number
}>`
  position: absolute;

  /* Positioning */
  ${({ $position }) => $position?.left !== undefined && `left: ${$position.left}px;`}
  ${({ $position }) => $position?.top !== undefined && `top: ${$position.top}px;`}
  ${({ $position }) => $position?.right !== undefined && `right: ${$position.right}px;`}
  ${({ $position }) => $position?.bottom !== undefined && `bottom: ${$position.bottom}px;`}

  /* Dimensions */
  ${({ $width }) => $width && `width: ${$width}px;`}
  ${({ $height }) => $height && `height: ${$height}px;`}
  ${({ $maxWidth }) => $maxWidth && `max-width: ${$maxWidth}px;`}
  ${({ $minWidth }) => $minWidth && `min-width: ${$minWidth}px;`}

  /* Variant styles */
  ${({ $variant, theme }) => {
    const styles = getVariantStyles($variant, theme)
    return `
      font-size: ${styles.fontSize};
      font-weight: ${styles.fontWeight};
      color: ${styles.color};
      line-height: ${styles.lineHeight};
      letter-spacing: ${styles.letterSpacing};
      font-family: ${styles.fontFamily};
      ${styles.textTransform ? `text-transform: ${styles.textTransform};` : ''}
    `
  }}

  /* Override with custom props */
  ${({ $customColor, $status, theme }) => {
    const statusColor = getStatusColor($status, theme)
    const finalColor = statusColor || $customColor
    return finalColor ? `color: ${finalColor} !important;` : ''
  }}
  ${({ $customFontSize }) => $customFontSize && `font-size: ${$customFontSize}px !important;`}
  ${({ $customFontWeight }) => $customFontWeight && `font-weight: ${$customFontWeight} !important;`}

  /* Alignment */
  text-align: ${({ $alignment }) => $alignment || 'left'};

  /* Base properties for text */
  margin: 0;
  padding: 0;
  white-space: ${({ $multiline }) => ($multiline ? 'normal' : 'nowrap')};
  overflow: ${({ $multiline }) => ($multiline ? 'visible' : 'hidden')};
  text-overflow: ${({ $multiline }) => ($multiline ? 'clip' : 'ellipsis')};
  user-select: none;
  pointer-events: none;
  z-index: 10;

  /* Custom line height for multiline */
  ${({ $multiline, $customLineHeight }) =>
    $multiline && $customLineHeight && `line-height: ${$customLineHeight} !important;`}

  /* Preparation for future animations */
  transition: all 0.2s ease-in-out;

  /* Anti-aliasing for better readability */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
`
