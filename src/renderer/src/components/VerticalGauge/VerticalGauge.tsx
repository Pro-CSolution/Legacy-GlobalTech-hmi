import { useEffect, useState, useMemo, type JSX } from 'react'
import type { CSSProperties } from 'react'
import {
  VerticalGaugeContainer,
  ValueDisplay,
  ValueText,
  UnitText,
  GaugeBody,
  ScaleColumn,
  ScaleValue,
  GaugeColumn,
  ThresholdArea,
  ThresholdZone,
  FillBar,
  TickMarks,
  TickMark,
  ThresholdLines,
  ThresholdLine
} from './VerticalGauge.styles'
import type {
  VerticalGaugeProps,
  ThresholdLineData,
  ThresholdZoneData
} from './VerticalGauge.types'

const VerticalGauge = ({
  value = 0,
  minValue = 0,
  maxValue = 100,
  unitOfMeasure,
  endLL,
  endL,
  startH,
  startHH,
  backgroundColor,
  textColor,
  showAlarms = true,
  position,
  size,
  fontProperties,
  onValueChange,
  onAlarm
}: VerticalGaugeProps): JSX.Element => {
  const [fillHeight, setFillHeight] = useState<number>(0)
  const [fillColor, setFillColor] = useState<string>('#10b981') // Use default theme color

  // Calculate scale values (min, 25%, 50%, 75%, max) without decimals
  const scaleValues = useMemo(() => {
    const range = maxValue - minValue
    return [
      Math.round(minValue),
      Math.round(minValue + range * 0.25),
      Math.round(minValue + range * 0.5),
      Math.round(minValue + range * 0.75),
      Math.round(maxValue)
    ]
  }, [minValue, maxValue])

  // Convert value to percentage for fill height
  const valueToPercentage = useMemo(
    () =>
      (val: number): number => {
        if (val <= minValue) return 0
        if (val >= maxValue) return 100
        return ((val - minValue) / (maxValue - minValue)) * 100
      },
    [minValue, maxValue]
  )

  // Convert threshold to percentage
  const thresholdToPercentage = useMemo(
    () =>
      (threshold?: number): number => {
        if (threshold === undefined) return -1
        return valueToPercentage(threshold)
      },
    [valueToPercentage]
  )

  // Calculate threshold percentages
  const thresholds = useMemo(
    () => ({
      endLL: thresholdToPercentage(endLL),
      endL: thresholdToPercentage(endL),
      startH: thresholdToPercentage(startH),
      startHH: thresholdToPercentage(startHH)
    }),
    [endLL, endL, startH, startHH, thresholdToPercentage]
  )

  // Determine fill color based on current value
  const getFillColor = useMemo(
    () =>
      (currentValue: number): string => {
        const percentage = valueToPercentage(currentValue)

        if (endLL !== undefined && percentage <= thresholds.endLL) {
          return '#ef4444' // Rojo para LowLow
        }
        if (endL !== undefined && percentage <= thresholds.endL) {
          return '#f59e0b' // Amarillo para Low
        }
        if (startHH !== undefined && percentage >= thresholds.startHH) {
          return '#ef4444' // Rojo para HighHigh
        }
        if (startH !== undefined && percentage >= thresholds.startH) {
          return '#f59e0b' // Amarillo para High
        }

        return '#10b981' // Verde para normal
      },
    [
      endLL,
      endL,
      startH,
      startHH,
      thresholds.endLL,
      thresholds.endL,
      thresholds.startH,
      thresholds.startHH,
      valueToPercentage
    ]
  )

  // Update fill height and color when value changes
  useEffect(() => {
    const percentage = valueToPercentage(value)
    setFillHeight(percentage)

    const newColor = getFillColor(value)
    setFillColor(newColor)

    // Detect alarms and call callback if exists
    if (onAlarm) {
      if (endLL !== undefined && value <= endLL) {
        onAlarm('LowLow')
      } else if (endL !== undefined && value <= endL) {
        onAlarm('Low')
      } else if (startHH !== undefined && value >= startHH) {
        onAlarm('HighHigh')
      } else if (startH !== undefined && value >= startH) {
        onAlarm('High')
      }
    }

    // Value change callback
    if (onValueChange) {
      onValueChange(value)
    }
  }, [value, endLL, endL, startH, startHH, onAlarm, onValueChange, getFillColor, valueToPercentage])

  // Generate threshold zones to show in background
  const thresholdZones = useMemo(() => {
    const zones: ThresholdZoneData[] = []

    // LowLow zone (red)
    if (thresholds.endLL >= 0) {
      zones.push({
        color: '#ef4444',
        height: thresholds.endLL,
        bottom: 0,
        key: 'lowlow'
      })
    }

    // Low zone (yellow)
    if (thresholds.endL >= 0) {
      const startBottom = thresholds.endLL >= 0 ? thresholds.endLL : 0
      zones.push({
        color: '#f59e0b',
        height: thresholds.endL - startBottom,
        bottom: startBottom,
        key: 'low'
      })
    }

    // High zone (yellow)
    if (thresholds.startH >= 0) {
      const endHeight = thresholds.startHH >= 0 ? thresholds.startHH : 100
      zones.push({
        color: '#f59e0b',
        height: endHeight - thresholds.startH,
        bottom: thresholds.startH,
        key: 'high'
      })
    }

    // HighHigh zone (red)
    if (thresholds.startHH >= 0) {
      zones.push({
        color: '#ef4444',
        height: 100 - thresholds.startHH,
        bottom: thresholds.startHH,
        key: 'highhigh'
      })
    }

    return zones
  }, [thresholds])

  // Generate tick marks for main marks
  const tickMarks = useMemo(
    () =>
      scaleValues.map((_, index) => ({
        bottom: index * 25, // 0%, 25%, 50%, 75%, 100%
        isMain: true,
        key: index
      })),
    [scaleValues]
  )

  // Generate horizontal threshold lines
  const thresholdLines = useMemo(() => {
    const lines: ThresholdLineData[] = []

    // LowLow line (red)
    if (endLL !== undefined && thresholds.endLL >= 0) {
      lines.push({
        bottom: thresholds.endLL,
        color: '#ef4444',
        key: 'lowlow-line'
      })
    }

    // Low line (yellow)
    if (endL !== undefined && thresholds.endL >= 0) {
      lines.push({
        bottom: thresholds.endL,
        color: '#f59e0b',
        key: 'low-line'
      })
    }

    // High line (yellow)
    if (startH !== undefined && thresholds.startH >= 0) {
      lines.push({
        bottom: thresholds.startH,
        color: '#f59e0b',
        key: 'high-line'
      })
    }

    // HighHigh line (red)
    if (startHH !== undefined && thresholds.startHH >= 0) {
      lines.push({
        bottom: thresholds.startHH,
        color: '#ef4444',
        key: 'highhigh-line'
      })
    }

    return lines
  }, [endLL, endL, startH, startHH, thresholds])

  return (
    <VerticalGaugeContainer $position={position} $size={size}>
      {/* Value display at the top */}
      <ValueDisplay backgroundColor={backgroundColor} textColor={textColor}>
        <ValueText fontSize={fontProperties?.fontSizeValue}>
          {value !== undefined ? value.toFixed(1) : 'Error'}
        </ValueText>
        {unitOfMeasure && (
          <UnitText fontSize={fontProperties?.fontSizeUnit}>{unitOfMeasure}</UnitText>
        )}
      </ValueDisplay>

      {/* Main gauge body */}
      <GaugeBody>
        {/* Scale values column */}
        <ScaleColumn>
          {scaleValues
            .slice()
            .reverse()
            .map((scaleValue, index) => (
              <ScaleValue
                key={index}
                textColor={textColor}
                fontSize={fontProperties?.fontSizeScale}
              >
                {scaleValue}
              </ScaleValue>
            ))}
        </ScaleColumn>

        {/* Gauge column */}
        <GaugeColumn>
          {/* Background threshold areas */}
          {showAlarms && (
            <ThresholdArea>
              {thresholdZones.map((zone) => (
                <ThresholdZone
                  key={zone.key}
                  color={zone.color}
                  height={zone.height}
                  bottom={zone.bottom}
                />
              ))}
            </ThresholdArea>
          )}

          {/* Current level bar */}
          <FillBar
            style={
              {
                '--vertical-fill-height': `${fillHeight}%`,
                '--vertical-fill-color': fillColor,
                '--vertical-fill-color-cc': `${fillColor}CC`
              } as CSSProperties
            }
          />

          {/* Horizontal threshold lines */}
          {showAlarms && (
            <ThresholdLines>
              {thresholdLines.map((line) => (
                <ThresholdLine key={line.key} bottom={line.bottom} color={line.color} />
              ))}
            </ThresholdLines>
          )}

          {/* Scale marks */}
          <TickMarks>
            {tickMarks.map((tick) => (
              <TickMark key={tick.key} bottom={tick.bottom} ismain={tick.isMain} />
            ))}
          </TickMarks>
        </GaugeColumn>
      </GaugeBody>
    </VerticalGaugeContainer>
  )
}

export default VerticalGauge
