import type { CSSProperties } from 'react'

export interface ThresholdLineData {
  bottom: number
  color: string
  key: string
}

export interface ThresholdZoneData {
  color: string
  height: number
  bottom: number
  key: string
}

export interface VerticalGaugeProps {
  // Main values
  value?: number
  minValue?: number
  maxValue?: number
  unitOfMeasure?: string

  // Alarm thresholds
  endLL?: number // Low Low
  endL?: number // Low
  startH?: number // High
  startHH?: number // High High

  // Visual customization
  backgroundColor?: CSSProperties['backgroundColor']
  textColor?: CSSProperties['color']
  showAlarms?: boolean

  // Positioning properties (Gauge compatibility)
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

  // Font properties
  fontProperties?: {
    textColor?: CSSProperties['color']
    fontSizeValue?: number
    fontSizeUnit?: number
    fontSizeScale?: number
  }

  // Callbacks
  onValueChange?: (value: number) => void
  onAlarm?: (type: string) => void
}
