import styled from 'styled-components'

// Auxiliary types
interface Position {
  left?: string | number
  top?: string | number
  right?: string | number
  bottom?: string | number
}

interface Size {
  width?: string | number
  height?: string | number
}

interface ContainerProps {
  $position?: Position
  $size?: Size
}

// Auxiliary functions for positioning
const formatValue = (value: string | number): string => {
  return typeof value === 'number' ? `${value}px` : value
}

const getPositionStyles = (position?: Position): string => {
  if (!position) return ''

  const styles = ['position: absolute;']

  if (position.left !== undefined) styles.push(`left: ${formatValue(position.left)};`)
  if (position.top !== undefined) styles.push(`top: ${formatValue(position.top)};`)
  if (position.right !== undefined) styles.push(`right: ${formatValue(position.right)};`)
  if (position.bottom !== undefined) styles.push(`bottom: ${formatValue(position.bottom)};`)

  return styles.join('\n')
}

const getSizeStyles = (size?: Size): string => {
  if (!size) return ''

  const { width, height } = size

  // If both are defined, use the larger one to maintain proportion
  if (width !== undefined && height !== undefined) {
    const widthNum = typeof width === 'number' ? width : parseInt(width.toString())
    const heightNum = typeof height === 'number' ? height : parseInt(height.toString())

    return widthNum > heightNum
      ? `width: ${formatValue(width)};`
      : `height: ${formatValue(height)};`
  }

  if (width !== undefined) return `width: ${formatValue(width)};`
  if (height !== undefined) return `height: ${formatValue(height)};`

  return ''
}

// Main container
export const VerticalGaugeContainer = styled.div<ContainerProps>`
  display: flex;
  flex-direction: column;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  aspect-ratio: 2/5;
  width: 120px; /* Ancho base por defecto */

  ${({ $position }) => getPositionStyles($position)}
  ${({ $size }) => getSizeStyles($size)}
`

// Value display at the top
export const ValueDisplay = styled.div<{
  backgroundColor?: string
  textColor?: string
}>`
  background-color: ${({ backgroundColor, theme }) =>
    backgroundColor || theme.colors.background.primary};
  color: ${({ textColor, theme }) => textColor || theme.colors.text.primary};
  border: 2px solid ${({ theme }) => theme.colors.borders.primary};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  padding: 8px 4px;
  text-align: center;
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 40px;
  justify-content: center;
`

export const ValueText = styled.span<{ fontSize?: number }>`
  font-size: ${({ fontSize }) => fontSize || 1.2}rem;
  line-height: 1;
`

export const UnitText = styled.span<{ fontSize?: number }>`
  font-size: ${({ fontSize }) => fontSize || 0.8}rem;
  margin-top: 2px;
  opacity: 0.8;
`

// Main gauge container
export const GaugeBody = styled.div`
  display: flex;
  flex: 1;
  border: 2px solid ${({ theme }) => theme.colors.borders.primary};
  border-top: none;
  background-color: ${({ theme }) => theme.colors.background.secondary};
  border-radius: 0 0 ${({ theme }) => theme.borderRadius.sm} ${({ theme }) => theme.borderRadius.sm};
`

// Values column (left side)
export const ScaleColumn = styled.div`
  width: 45%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 8px 4px;
  background-color: ${({ theme }) => theme.colors.background.tertiary};
  position: relative;
`

export const ScaleValue = styled.div<{
  textColor?: string
  fontSize?: number
}>`
  color: ${({ textColor, theme }) => textColor || theme.colors.text.secondary};
  font-size: ${({ fontSize }) => fontSize || 0.75}rem;
  text-align: center;
  border: 1px dashed ${({ theme }) => theme.colors.borders.secondary};
  padding: 2px;
  background-color: ${({ theme }) => theme.colors.background.primary};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  line-height: 1.2;
`

// Gauge column (right side)
export const GaugeColumn = styled.div`
  width: 55%;
  position: relative;
  background-color: ${({ theme }) => theme.colors.background.primary};
  border: 1px inset ${({ theme }) => theme.colors.borders.primary};
  margin: 4px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  overflow: hidden;
`

// Background threshold area
export const ThresholdArea = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
`

export const ThresholdZone = styled.div<{
  color: string
  height: number
  bottom: number
}>`
  position: absolute;
  width: 100%;
  background-color: ${({ color }) => color};
  height: ${({ height }) => height}%;
  bottom: ${({ bottom }) => bottom}%;
  opacity: 0.3;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
`

// Current level bar
export const FillBar = styled.div<{
  fillHeight: number
  fillColor: string
}>`
  position: absolute;
  width: 100%;
  height: ${({ fillHeight }) => fillHeight}%;
  bottom: 0;
  background: linear-gradient(
    to top,
    ${({ fillColor }) => fillColor} 0%,
    ${({ fillColor }) => fillColor}CC 100%
  );
  transition:
    height 0.5s ease-in-out,
    background 0.3s ease;
  border-radius: 1px 1px 0 0;
  box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.3);
`

// Scale marks on the gauge
export const TickMarks = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 2;
`

export const TickMark = styled.div<{
  bottom: number
  isMain?: boolean
}>`
  position: absolute;
  width: ${({ isMain }) => (isMain ? '40%' : '20%')};
  height: 2px;
  background-color: ${({ theme }) => theme.colors.text.primary};
  left: 0;
  bottom: ${({ bottom }) => bottom}%;
  opacity: ${({ isMain }) => (isMain ? 1 : 0.6)};
`

// Horizontal threshold lines that cross the entire bar
export const ThresholdLines = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 3;
`

export const ThresholdLine = styled.div<{
  bottom: number
  color: string
}>`
  position: absolute;
  width: 100%;
  height: 2px;
  background-color: ${({ color }) => color};
  bottom: ${({ bottom }) => bottom}%;
  left: 0;
  border-radius: 1px;
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
`
