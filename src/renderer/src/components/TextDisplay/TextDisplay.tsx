import type { TextDisplayProps } from './TextDisplay.types'
import { StyledTextDisplay } from './TextDisplay.styles'

const TextDisplay = ({
  children,
  text,
  variant = 'label',
  position,
  color,
  fontSize,
  fontWeight,
  alignment = 'left',
  width,
  height,
  maxWidth,
  minWidth,
  value,
  unit,
  decimalPlaces,
  status,
  multiline = false,
  lineHeight,
  className,
  id,
  ...restProps
}: TextDisplayProps) => {
  // Function to format numbers (future preparation)
  const formatNumber = (num: number, decimals?: number): string => {
    if (decimals !== undefined) {
      return num.toFixed(decimals)
    }
    return num.toString()
  }

  // Determine the content to show
  // Priority: children > value+unit > text
  const getDisplayContent = () => {
    if (children) {
      return children
    }

    if (value !== undefined) {
      const formattedValue = formatNumber(value, decimalPlaces)
      return unit ? `${formattedValue} ${unit}` : formattedValue
    }

    return text || ''
  }

  const displayContent = getDisplayContent()

  return (
    <StyledTextDisplay
      $position={position}
      $variant={variant}
      $customColor={color}
      $customFontSize={fontSize}
      $customFontWeight={fontWeight}
      $alignment={alignment}
      $width={width}
      $height={height}
      $maxWidth={maxWidth}
      $minWidth={minWidth}
      $status={status}
      $multiline={multiline}
      $customLineHeight={lineHeight}
      className={className}
      id={id}
      {...restProps}
    >
      {displayContent}
    </StyledTextDisplay>
  )
}

export default TextDisplay
