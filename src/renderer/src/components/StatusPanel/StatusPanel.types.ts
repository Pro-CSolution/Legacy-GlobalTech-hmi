export type StatusItemType = 'section' | 'status' | 'numeric'

export interface StatusItem {
  /** Element type */
  type: StatusItemType
  /** Unique identifier */
  id: string
  /** Text to display */
  label: string
  /** Value for status (boolean) or numeric (number) */
  value?: boolean | number
  /** Unit for numeric values */
  unit?: string
  /** Show ??? when value is not available */
  showUnknown?: boolean
  /** Custom LED color (only for type: 'status') */
  ledColor?: string
}

export interface StatusPanelProps {
  /** Panel title */
  title?: string
  /** Array of elements to display */
  items: StatusItem[]
  /** Number of columns for layout */
  columns?: number
  /** Default color for lit LEDs */
  defaultLedColor?: string
  /** Color for unlit LEDs */
  ledOffColor?: string
  /** Absolute panel position */
  position?: {
    left?: string | number
    top?: string | number
    right?: string | number
    bottom?: string | number
  }
  /** Panel dimensions */
  width?: string | number
  height?: string | number
  /** If panel should be responsive */
  responsive?: boolean
  /** Custom background color */
  backgroundColor?: string
  /** Custom border color */
  borderColor?: string
  /** Custom text color */
  textColor?: string
  /** Panel title font size */
  titleFontSize?: number
  /** Section title font size */
  sectionFontSize?: number
  /** Status item font size */
  statusFontSize?: number
  /** Numeric label font size */
  numericLabelFontSize?: number
  /** Numeric value font size */
  numericValueFontSize?: number
  /** Additional CSS class */
  className?: string
  /** Additional styles */
  style?: React.CSSProperties
}

export interface StatusPanelState {
  /** Responsive scale factor */
  scaleFactor: number
  /** If panel is in compact mode */
  isCompact: boolean
}
