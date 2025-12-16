import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import {
  DisplayContainer,
  ContentWrapper,
  ValueContainer,
  UnitText,
  LabelText,
  PlaceholderText,
  GlowEffect
} from './NumericDisplay.styles'
import type {
  NumericDisplayProps,
  NumericDisplayState,
  InternalSpacing,
  ResponsiveConfig
} from './NumericDisplay.types'

const NumericDisplay = ({
  value,
  unit = '',
  label = '',
  decimalPlaces = 0,
  variant = 'modern',
  width = 200,
  height = 120,
  position,
  labelPosition = 'bottom',
  contentAlignment = 'center',
  spacing,
  responsiveConfig,
  valueColor,
  unitColor,
  labelColor,
  backgroundColor,
  borderColor,
  valueFontSize = 32,
  unitFontSize = 18,
  labelFontSize = 14,
  fontFamily,
  placeholderText = '???',
  responsive = true,
  className,
  style
}: NumericDisplayProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [state, setState] = useState<NumericDisplayState>({
    displayValue: placeholderText,
    isValid: false
  })

  const [isGlowing, setIsGlowing] = useState(false)
  const [responsiveState, setResponsiveState] = useState({
    scaleFactor: 1,
    shouldHideLabel: false,
    shouldUseEllipsis: false
  })

  // Default responsive configuration
  const defaultResponsiveConfig = useMemo(
    (): ResponsiveConfig => ({
      minWidth: 120,
      minHeight: 60,
      fontScaleFactor: 0.7,
      hideLabel: true,
      useEllipsis: true,
      ...responsiveConfig
    }),
    [responsiveConfig]
  )

  // Default spacing according to variant
  const defaultSpacing = useMemo(
    (): InternalSpacing => ({
      padding: variant === 'industrial' ? 12 : variant === 'minimal' ? 8 : 16,
      valueUnitGap: variant === 'industrial' ? 8 : 6,
      labelGap: variant === 'industrial' ? 6 : 8,
      ...spacing
    }),
    [variant, spacing]
  )

  // Function to validate if the value is a valid number
  const isValidNumber = (val: unknown): val is number => {
    return typeof val === 'number' && !isNaN(val) && isFinite(val)
  }

  // Function to format the number with decimals
  const formatNumber = useCallback(
    (val: number, decimals: number): string => {
      if (!isValidNumber(val)) return placeholderText

      const formatted = val.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      })

      return formatted
    },
    [placeholderText]
  )

  // Memoize the formatted value
  const formattedValue = useMemo(() => {
    if (!isValidNumber(value)) {
      return placeholderText
    }
    return formatNumber(value, decimalPlaces)
  }, [value, decimalPlaces, placeholderText, formatNumber])

  // Calculate numeric dimensions
  const numericWidth = typeof width === 'number' ? width : parseInt(width as string) || 200
  const numericHeight = typeof height === 'number' ? height : parseInt(height as string) || 120

  // Function to calculate responsive scaling
  const calculateResponsiveScaling = useCallback(() => {
    if (!responsive) {
      setResponsiveState({
        scaleFactor: 1,
        shouldHideLabel: false,
        shouldUseEllipsis: false
      })
      return
    }

    const isSmallWidth = numericWidth < defaultResponsiveConfig.minWidth!
    const isSmallHeight = numericHeight < defaultResponsiveConfig.minHeight!
    const isVerySmallHeight = numericHeight < 40
    const isSmall = isSmallWidth || isSmallHeight

    let scaleFactor = 1
    if (isSmall) {
      const widthRatio = numericWidth / defaultResponsiveConfig.minWidth!
      const heightRatio = numericHeight / defaultResponsiveConfig.minHeight!
      const baseRatio = Math.min(widthRatio, heightRatio)
      scaleFactor = Math.max(baseRatio * defaultResponsiveConfig.fontScaleFactor!, 0.3)
    }

    setResponsiveState({
      scaleFactor,
      shouldHideLabel: isVerySmallHeight && defaultResponsiveConfig.hideLabel!,
      shouldUseEllipsis: isSmall && defaultResponsiveConfig.useEllipsis!
    })
  }, [responsive, numericWidth, numericHeight, defaultResponsiveConfig])

  // Effect to calculate responsive when dimensions change
  useEffect(() => {
    calculateResponsiveScaling()
  }, [calculateResponsiveScaling])

  // Effect to update state when value changes
  useEffect(() => {
    const isValid = isValidNumber(value)

    setState({
      displayValue: isValid ? formattedValue : placeholderText,
      isValid
    })

    // Glow effect when there is a valid value
    if (isValid && variant !== 'minimal') {
      setIsGlowing(true)
      const timer = setTimeout(() => setIsGlowing(false), 1000)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [value, formattedValue, placeholderText, variant])

  // Function to generate placeholder with correct length
  const generatePlaceholder = (): string => {
    if (!isValidNumber(value)) {
      let baseLength = 3
      if (numericWidth > 150) baseLength = 6
      if (numericWidth > 200) baseLength = 8

      return '?'.repeat(baseLength)
    }
    return placeholderText
  }

  // Determine if label should be shown
  const shouldShowLabel = label && !responsiveState.shouldHideLabel

  return (
    <DisplayContainer
      ref={containerRef}
      variant={variant}
      width={width}
      height={height}
      position={position}
      backgroundColor={backgroundColor}
      borderColor={borderColor}
      spacing={defaultSpacing}
      contentAlignment={contentAlignment}
      labelPosition={labelPosition}
      className={className}
      style={style}
    >
      <GlowEffect variant={variant} color={valueColor} className={isGlowing ? 'active' : ''} />

      <ContentWrapper
        labelPosition={labelPosition}
        spacing={defaultSpacing}
        isSmall={responsiveState.scaleFactor < 1}
      >
        <ValueContainer
          variant={variant}
          valueColor={valueColor}
          valueFontSize={valueFontSize}
          fontFamily={fontFamily}
          spacing={defaultSpacing}
          useEllipsis={responsiveState.shouldUseEllipsis}
          scaleFactor={responsiveState.scaleFactor}
        >
          {state.isValid ? (
            <>
              <span>{state.displayValue}</span>
              {unit && (
                <UnitText
                  variant={variant}
                  unitColor={unitColor}
                  unitFontSize={unitFontSize}
                  scaleFactor={responsiveState.scaleFactor}
                >
                  {unit}
                </UnitText>
              )}
            </>
          ) : (
            <>
              <PlaceholderText variant={variant}>{generatePlaceholder()}</PlaceholderText>
              {unit && (
                <UnitText
                  variant={variant}
                  unitColor={unitColor}
                  unitFontSize={unitFontSize}
                  scaleFactor={responsiveState.scaleFactor}
                >
                  {unit}
                </UnitText>
              )}
            </>
          )}
        </ValueContainer>

        {shouldShowLabel && (
          <LabelText
            variant={variant}
            labelColor={labelColor}
            labelFontSize={labelFontSize}
            scaleFactor={responsiveState.scaleFactor}
            isHidden={responsiveState.shouldHideLabel}
          >
            {label}
          </LabelText>
        )}
      </ContentWrapper>
    </DisplayContainer>
  )
}

export default NumericDisplay
