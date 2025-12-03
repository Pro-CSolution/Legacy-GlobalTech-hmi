import type { ReactNode } from 'react'

export type TextVariant =
  | 'title' // Main titles (Main Screen)
  | 'subtitle' // Section subtitles
  | 'label' // Small labels
  | 'value' // Numeric values
  | 'status' // Texto de estado
  | 'button' // Texto de botones
  | 'caption' // Small/descriptive text

export type TextAlignment = 'left' | 'center' | 'right'

export interface TextPosition {
  left?: number
  top?: number
  right?: number
  bottom?: number
}

export interface TextDisplayProps {
  // Texto - children tiene prioridad sobre text
  children?: ReactNode
  text?: string

  // Variante de estilo
  variant?: TextVariant

  // Posicionamiento absoluto
  position: TextPosition

  // Propiedades de estilo opcionales
  color?: string
  fontSize?: number
  fontWeight?: number | string
  alignment?: TextAlignment

  // Propiedades adicionales para extensibilidad futura
  width?: number
  height?: number
  maxWidth?: number
  minWidth?: number

  // Props for numbers (future preparation)
  value?: number
  unit?: string
  decimalPlaces?: number

  // Props for dynamic states (future preparation)
  status?: 'normal' | 'warning' | 'error' | 'success'
  animated?: boolean
  blinking?: boolean

  // Props for line breaks
  multiline?: boolean
  lineHeight?: number

  // Standard props
  className?: string
  id?: string
}
