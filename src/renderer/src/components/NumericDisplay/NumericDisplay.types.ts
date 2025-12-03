export type DisplayVariant = 'modern' | 'industrial' | 'minimal'

export type LabelPosition = 'top' | 'bottom' | 'left' | 'right'

export type ContentAlignment = 'center' | 'left' | 'right'

export interface InternalSpacing {
  /** Container internal padding */
  padding?: string | number
  /** Spacing between value and unit */
  valueUnitGap?: string | number
  /** Spacing between main content and label */
  labelGap?: string | number
}

export interface ResponsiveConfig {
  /** Minimum width before starting adaptations */
  minWidth?: number
  /** Minimum height before starting adaptations */
  minHeight?: number
  /** Font reduction factor (0.1 - 1.0) */
  fontScaleFactor?: number
  /** Hide label in small spaces */
  hideLabel?: boolean
  /** Use ellipsis for long text */
  useEllipsis?: boolean
}

export interface NumericDisplayProps {
  /** Numeric value to display */
  value?: number
  /** Unit of measure (e.g: "RPM", "°C", "PSI") */
  unit?: string
  /** Display label (e.g: "Turbine", "Exhaust") */
  label?: string
  /** Number of decimals to display */
  decimalPlaces?: number
  /** Component style variant */
  variant?: DisplayVariant
  /** Component width (EXACT) */
  width?: string | number
  /** Component height (EXACT) */
  height?: string | number
  /** Component position */
  position?: {
    left?: string | number
    top?: string | number
    right?: string | number
    bottom?: string | number
  }
  /** Label position */
  labelPosition?: LabelPosition
  /** Content alignment */
  contentAlignment?: ContentAlignment
  /** Internal spacing configuration */
  spacing?: InternalSpacing
  /** Responsive configuration */
  responsiveConfig?: ResponsiveConfig
  /** Value text color */
  valueColor?: string
  /** Unit text color */
  unitColor?: string
  /** Label text color */
  labelColor?: string
  /** Display background color */
  backgroundColor?: string
  /** Border color */
  borderColor?: string
  /** Value font size */
  valueFontSize?: string | number
  /** Unit font size */
  unitFontSize?: string | number
  /** Label font size */
  labelFontSize?: string | number
  /** Font family */
  fontFamily?: string
  /** Text to show when no value (default: "???") */
  placeholderText?: string
  /** If component should be responsive */
  responsive?: boolean
  /** Additional CSS class */
  className?: string
  /** Additional styles */
  style?: React.CSSProperties
}

export interface NumericDisplayState {
  /** Formatted value to display */
  displayValue: string
  /** If the value is valid */
  isValid: boolean
}
