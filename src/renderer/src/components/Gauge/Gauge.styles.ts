import styled from 'styled-components'

// Tipos
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

interface GaugeContainerProps {
  $position?: Position
  $size?: Size
}

// Funciones auxiliares
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

  // If both are defined, use the larger one
  if (width !== undefined && height !== undefined) {
    const widthNum = typeof width === 'number' ? width : parseInt(width.toString())
    const heightNum = typeof height === 'number' ? height : parseInt(height.toString())

    return widthNum > heightNum
      ? `width: ${formatValue(width)};`
      : `height: ${formatValue(height)};`
  }

  // Solo width o height
  if (width !== undefined) return `width: ${formatValue(width)};`
  if (height !== undefined) return `height: ${formatValue(height)};`

  return ''
}

// Componente principal
export const GaugeContainer = styled.div<GaugeContainerProps>`
  color: ${({ theme }) => theme.colors.text.primary};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: start;
  margin: 0 auto;
  line-height: normal;
  aspect-ratio: 100/75.3;

  ${({ $position }) => getPositionStyles($position)}
  ${({ $size }) => getSizeStyles($size)}

  svg {
    left: 0;
  }
`

// Componentes del gauge
export const GaugeWrapper = styled.div`
  position: relative;
  height: var(--container-size);
  width: var(--container-size);
  border: solid black 0px;
  border-radius: 50%;
  background: linear-gradient(
    to bottom,
    ${(props) => props.theme.degradedColor} 25%,
    ${(props) => props.theme.backgroundColor} 70%
  );
  display: flex;
  justify-content: center;
  align-items: center;
`

export const CenterCircle = styled.div`
  position: relative;
  height: 81.86%;
  width: 81.86%;
  border-radius: 50%;
  background: ${(props) => props.theme.backgroundColor};
  display: flex;
  justify-content: center;
  align-items: center;
`

export const CenterRing = styled.div`
  height: 60%;
  width: 60%;
  border-radius: 50%;
  border: solid 1px transparent;
  background:
    linear-gradient(${(props) => props.theme.backgroundColor} 0 0) padding-box,
    linear-gradient(to bottom, white 35%, transparent 70%) border-box;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  z-index: 12;
  position: relative;
  color: ${(props) => props.theme.textColor};

  /* VALUE */
  h4 {
    font-size: ${(props) =>
      props.theme.fontSizeValue ? `${props.theme.fontSizeValue}px` : '25px'};
    font-family: ${({ theme }) => theme.typography.fontFamily};
    margin: 0;
    font-weight: ${({ theme }) => theme.typography.weights.bold};
    color: ${(props) => props.theme.textColor};
  }

  /* UNIT OF MEASURE */
  span {
    position: absolute;
    top: 60%;
    right: 50%;
    transform: translateX(50%);
    font-size: ${(props) =>
      props.theme.fontSizeUnitOfMeasure ? `${props.theme.fontSizeUnitOfMeasure}px` : '17px'};
    color: ${(props) => props.theme.textColor};
  }
`

export const GaugeTicks = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 50%;
`

export const Tick = styled.div<{
  size: string
  $rotation: number
}>`
  position: absolute;
  width: ${({ size }) => (size === 'large' ? '1.6%' : size === 'medium' ? '1.6%' : '0.6%')};
  height: ${({ size }) => (size === 'large' ? '7.5%' : size === 'medium' ? '4.1%' : '4.1%')};
  background-color: ${({ theme }) => theme.colors.text.primary};
  left: calc(50%);
  top: 0;
  transform-origin: 50% calc(var(--container-size) / 2);
  transform: translateX(-50%) rotate(calc(${({ $rotation }) => $rotation}deg));
  z-index: 10;
`

export const AlarmArea = styled.div`
  position: absolute;
  top: 0;
  height: 100%;
  width: 100%;
`

export const Arrow = styled.div<{
  $animationDuration: number
}>`
  z-index: 10;
  position: absolute;
  width: ${(props) => props.theme.arrowWidth || 1.6}%;
  height: 50%;
  background-color: ${(props) => props.theme.arrowColor};
  left: calc(50%);
  box-shadow: ${({ theme }) => theme.shadows.md};
  top: -0.8%;
  transform-origin: 50% 102.5%;
  transition: all ${({ $animationDuration }) => $animationDuration}ms linear;
  transform: rotate(var(--gauge-arrow-deg, 0deg)) translateX(-50%);
`

export const WrapperIndicatorNumber = styled.div`
  position: absolute;
  height: 100%;
  width: 100%;
`

export const IndicatorNumber = styled.span<{ $top: number; $left: number }>`
  z-index: 50;
  position: absolute;
  top: ${({ $top }) => $top}%;
  left: ${({ $left }) => $left}%;
  font-size: ${(props) =>
    props.theme.fontSizeIndicatorNumber ? `${props.theme.fontSizeIndicatorNumber}px` : '15px'};
  transform: translateX(-50%);
  color: ${(props) => props.theme.textColor};
`
