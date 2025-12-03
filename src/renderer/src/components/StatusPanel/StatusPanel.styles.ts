import styled, { css } from 'styled-components'

interface ContainerProps {
  $width?: string | number
  $height?: string | number
  $position?: {
    left?: string | number
    top?: string | number
    right?: string | number
    bottom?: string | number
  }
  $backgroundColor?: string
  $borderColor?: string
}

interface ItemsGridProps {
  $columns: number
  $scaleFactor: number
}

interface LEDProps {
  $isOn: boolean
  $color: string
  $offColor: string
}

interface NumericValueProps {
  $scaleFactor: number
}

// Utilities
const formatValue = (value: string | number): string => {
  return typeof value === 'number' ? `${value}px` : value || 'auto'
}

const getPositionStyles = (position?: ContainerProps['$position']): string => {
  if (!position) return ''

  return `
    ${position.left !== undefined ? `left: ${formatValue(position.left)};` : ''}
    ${position.top !== undefined ? `top: ${formatValue(position.top)};` : ''}
    ${position.right !== undefined ? `right: ${formatValue(position.right)};` : ''}
    ${position.bottom !== undefined ? `bottom: ${formatValue(position.bottom)};` : ''}
  `
}

// Main container component
export const Container = styled.div<ContainerProps>`
  position: absolute;
  display: flex;
  flex-direction: column;

  /* Dimensions */
  width: ${({ $width }) => formatValue($width || 400)};
  height: ${({ $height }) => formatValue($height || 'auto')};

  /* Positioning */
  ${({ $position }) => getPositionStyles($position)}

  /* Visual styles */
  background: ${({ $backgroundColor, theme }) =>
    $backgroundColor || theme.colors.background.tertiary};
  border: 2px solid ${({ $borderColor, theme }) => $borderColor || theme.colors.borders.primary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  overflow: hidden;

  /* Z-index for overlay */
  z-index: 10;
`

// Panel title
export const Title = styled.div<{ $textColor?: string; $scaleFactor: number; $fontSize?: number }>`
  background: ${({ theme }) => theme.colors.accent.primary};
  color: ${({ $textColor, theme }) => $textColor || theme.colors.text.primary};
  padding: ${({ $scaleFactor }) => $scaleFactor * 12}px ${({ $scaleFactor }) => $scaleFactor * 16}px;
  font-size: ${({ $scaleFactor, $fontSize }) =>
    $fontSize ? `${$fontSize}px` : `${$scaleFactor * 16}px`};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 1px;
  border-bottom: 2px solid ${({ theme }) => theme.colors.borders.primary};
  font-family: ${({ theme }) => theme.typography.fontFamily};
`

// Items container
export const ItemsContainer = styled.div<{ $scaleFactor: number }>`
  padding: ${({ $scaleFactor }) => $scaleFactor * 8}px;
  flex: 1;
  overflow: hidden;
`

// Items grid
export const ItemsGrid = styled.div<ItemsGridProps>`
  display: grid;
  grid-template-columns: repeat(${({ $columns }) => $columns}, 1fr);
  gap: ${({ $scaleFactor }) => $scaleFactor * 4}px;
  width: 100%;
`

// Section title
export const SectionTitle = styled.div<{
  $scaleFactor: number
  $columns: number
  $fontSize?: number
}>`
  grid-column: 1 / -1;
  background: ${({ theme }) => theme.colors.background.secondary};
  color: ${({ theme }) => theme.colors.text.primary};
  padding: ${({ $scaleFactor }) => $scaleFactor * 6}px ${({ $scaleFactor }) => $scaleFactor * 8}px;
  font-size: ${({ $scaleFactor, $fontSize }) =>
    $fontSize ? `${$fontSize}px` : `${$scaleFactor * 12}px`};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  margin-top: ${({ $scaleFactor }) => $scaleFactor * 4}px;
  font-family: ${({ theme }) => theme.typography.fontFamily};

  &:first-child {
    margin-top: 0;
  }
`

// Individual item (status or numeric)
export const StatusItem = styled.div<{ $scaleFactor: number }>`
  display: flex;
  align-items: center;
  gap: ${({ $scaleFactor }) => $scaleFactor * 6}px;
  padding: ${({ $scaleFactor }) => $scaleFactor * 4}px ${({ $scaleFactor }) => $scaleFactor * 6}px;
  background: ${({ theme }) => theme.colors.background.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  min-height: ${({ $scaleFactor }) => $scaleFactor * 24}px;

  &:hover {
    background: ${({ theme }) => theme.colors.background.tertiary};
  }
`

// LED Indicator
export const LEDIndicator = styled.div<LEDProps>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${({ $isOn, $color, $offColor }) => ($isOn ? $color : $offColor)};
  border: 2px solid ${({ $isOn, $color, theme }) => ($isOn ? $color : theme.colors.borders.primary)};
  box-shadow: ${({ $isOn, $color }) =>
    $isOn ? `0 0 8px ${$color}40, inset 0 0 4px ${$color}60` : 'none'};
  transition: all 0.3s ease;
  flex-shrink: 0;

  /* Glow effect when turned on */
  ${({ $isOn }) =>
    $isOn &&
    css`
      &::after {
        content: '';
        position: absolute;
        width: 6px;
        height: 6px;
        background: white;
        border-radius: 50%;
        top: 2px;
        left: 2px;
        opacity: 0.8;
      }
    `}

  position: relative;
`

// Status item text
export const StatusText = styled.span<{
  $scaleFactor: number
  $textColor?: string
  $fontSize?: number
}>`
  color: ${({ $textColor, theme }) => $textColor || theme.colors.text.primary};
  font-size: ${({ $scaleFactor, $fontSize }) =>
    $fontSize ? `${$fontSize}px` : `${$scaleFactor * 12}px`};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  flex: 1;
  line-height: 1.1;
  font-family: ${({ theme }) => theme.typography.fontFamily};
`

// Numeric value container
export const NumericContainer = styled.div<{ $scaleFactor: number }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: ${({ $scaleFactor }) => $scaleFactor * 4}px ${({ $scaleFactor }) => $scaleFactor * 8}px;
  background: ${({ theme }) => theme.colors.background.primary};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  min-height: ${({ $scaleFactor }) => $scaleFactor * 28}px;
`

// Numeric value label
export const NumericLabel = styled.span<{
  $scaleFactor: number
  $textColor?: string
  $fontSize?: number
}>`
  color: ${({ $textColor, theme }) => $textColor || theme.colors.text.secondary};
  font-size: ${({ $scaleFactor, $fontSize }) =>
    $fontSize ? `${$fontSize}px` : `${$scaleFactor * 9}px`};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  flex: 1;
  font-family: ${({ theme }) => theme.typography.fontFamily};
`

// Numeric value
export const NumericValue = styled.span<
  NumericValueProps & { $textColor?: string; $showUnknown?: boolean; $fontSize?: number }
>`
  color: ${({ $textColor, $showUnknown, theme }) =>
    $showUnknown ? theme.colors.status.warning : $textColor || theme.colors.text.primary};
  font-size: ${({ $scaleFactor, $fontSize }) =>
    $fontSize ? `${$fontSize}px` : `${$scaleFactor * 11}px`};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  letter-spacing: 0.5px;
  text-align: right;
  min-width: ${({ $scaleFactor }) => $scaleFactor * 50}px;

  ${({ $showUnknown }) =>
    $showUnknown &&
    css`
      animation: blink 1.5s infinite;

      @keyframes blink {
        0%,
        50% {
          opacity: 1;
        }
        51%,
        100% {
          opacity: 0.5;
        }
      }
    `}
`

// Full width item (for 1 column grid)
export const FullWidthItem = styled.div<{ $scaleFactor: number; $columns: number }>`
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ $scaleFactor }) => $scaleFactor * 6}px ${({ $scaleFactor }) => $scaleFactor * 8}px;
  background: ${({ theme }) => theme.colors.background.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  min-height: ${({ $scaleFactor }) => $scaleFactor * 28}px;

  &:hover {
    background: ${({ theme }) => theme.colors.background.tertiary};
  }
`
