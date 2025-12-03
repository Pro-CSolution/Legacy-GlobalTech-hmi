import type { CSSProperties } from 'react'

export interface HmiData {
  backgroundColor?: CSSProperties['backgroundColor']
  maxValue?: number
  minValue?: number
  value?: number
  degradedColor?: CSSProperties['backgroundColor']
  unitOfMeasure?: string
  endLL?: number
  endL?: number
  startH?: number
  startHH?: number
  showAlarms?: boolean
  arrowProperties?: {
    width?: number
    color?: CSSProperties['backgroundColor']
  }
  fontProperties?: {
    textColor?: CSSProperties['color']
    fontSizeValue?: number
    fontSizeUnitOfMeasure?: number
    fontSizeIndicatorNumber?: number
  }
  // Nuevas propiedades para el posicionamiento
  position?: {
    left?: string | number
    top?: string | number
    right?: string | number
    bottom?: string | number
  }
  size?: {
    width?: string | number
    height?: string | number
  }
}
