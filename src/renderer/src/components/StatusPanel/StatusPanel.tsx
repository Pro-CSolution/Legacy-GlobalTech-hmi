import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Container,
  Title,
  ItemsContainer,
  ItemsGrid,
  SectionTitle,
  StatusItem,
  LEDIndicator,
  StatusText,
  NumericLabel,
  NumericValue,
  FullWidthItem
} from './StatusPanel.styles'
import type {
  StatusPanelProps,
  StatusItem as StatusItemType,
  StatusPanelState
} from './StatusPanel.types'

/**
 * StatusPanel - Flexible component for displaying control states and numeric values
 *
 * Can display:
 * - Section titles
 * - States with LED indicators (boolean)
 * - Numeric values with units
 *
 * Is fully responsive and reusable for different contexts.
 */
const StatusPanel: React.FC<StatusPanelProps> = ({
  title,
  items = [],
  columns = 2,
  defaultLedColor,
  ledOffColor,
  position,
  width = 400,
  height,
  responsive = true,
  backgroundColor,
  borderColor,
  textColor,
  titleFontSize,
  sectionFontSize,
  statusFontSize,
  numericLabelFontSize,
  numericValueFontSize,
  className,
  style
}) => {
  const [panelState, setPanelState] = useState<StatusPanelState>({
    scaleFactor: 1,
    isCompact: false
  })

  // Calculate responsive scaling
  const calculateResponsiveScaling = useCallback(() => {
    if (!responsive) return

    const containerWidth = typeof width === 'number' ? width : 400
    const containerHeight = typeof height === 'number' ? height : 300

    // Thresholds for compact mode
    const minWidth = 300
    const minHeight = 200

    const isCompact = containerWidth < minWidth || containerHeight < minHeight
    const scaleFactor = isCompact
      ? Math.min(containerWidth / minWidth, containerHeight / minHeight)
      : 1

    setPanelState({
      scaleFactor: Math.max(0.7, scaleFactor), // Minimum 70% scale
      isCompact
    })
  }, [width, height, responsive])

  useEffect(() => {
    calculateResponsiveScaling()
  }, [calculateResponsiveScaling])

  // Validate and format numeric value
  const formatNumericValue = useCallback(
    (value: number | undefined, unit: string = '', showUnknown: boolean = false): string => {
      if (value === undefined || value === null || isNaN(value) || !isFinite(value)) {
        return showUnknown ? '?????????' : '---'
      }

      // Format number with thousand separators if necessary
      const formattedValue =
        Math.abs(value) >= 1000 ? value.toLocaleString('en-US') : value.toString()

      return unit ? `${formattedValue} ${unit}` : formattedValue
    },
    []
  )

  // Render individual item
  const renderItem = useCallback(
    (item: StatusItemType, index: number) => {
      const key = `${item.type}-${item.id}-${index}`

      switch (item.type) {
        case 'section':
          return (
            <SectionTitle
              key={key}
              $scaleFactor={panelState.scaleFactor}
              $columns={columns}
              $fontSize={sectionFontSize}
            >
              {item.label}
            </SectionTitle>
          )

        case 'status': {
          const isOn = Boolean(item.value)
          const ledColor = item.ledColor || defaultLedColor

          return (
            <StatusItem key={key} $scaleFactor={panelState.scaleFactor}>
              <LEDIndicator
                $isOn={isOn}
                $color={ledColor || '#10b981'}
                $offColor={ledOffColor || '#334155'}
              />
              <StatusText
                $scaleFactor={panelState.scaleFactor}
                $textColor={textColor}
                $fontSize={statusFontSize}
              >
                {item.label}
              </StatusText>
            </StatusItem>
          )
        }

        case 'numeric': {
          const numericValue = typeof item.value === 'number' ? item.value : undefined
          const formattedValue = formatNumericValue(numericValue, item.unit, item.showUnknown)
          const showUnknown = item.showUnknown && numericValue === undefined

          return (
            <FullWidthItem key={key} $scaleFactor={panelState.scaleFactor} $columns={columns}>
              <NumericLabel
                $scaleFactor={panelState.scaleFactor}
                $textColor={textColor}
                $fontSize={numericLabelFontSize}
              >
                {item.label}
              </NumericLabel>
              <NumericValue
                $scaleFactor={panelState.scaleFactor}
                $textColor={textColor}
                $showUnknown={showUnknown}
                $fontSize={numericValueFontSize}
              >
                {formattedValue}
              </NumericValue>
            </FullWidthItem>
          )
        }

        default:
          console.warn(`StatusPanel: Unknown item type: ${item.type}`)
          return null
      }
    },
    [
      panelState.scaleFactor,
      columns,
      defaultLedColor,
      ledOffColor,
      textColor,
      formatNumericValue,
      sectionFontSize,
      statusFontSize,
      numericLabelFontSize,
      numericValueFontSize
    ]
  )

  // Memoize rendered items for optimization
  const renderedItems = useMemo(() => {
    return items.map((item, index) => renderItem(item, index))
  }, [items, renderItem])

  return (
    <Container
      $width={width}
      $height={height}
      $position={position}
      $backgroundColor={backgroundColor}
      $borderColor={borderColor}
      className={className}
      style={style}
      role="region"
      aria-label={title || 'Status panel'}
    >
      {title && (
        <Title
          $scaleFactor={panelState.scaleFactor}
          $textColor={textColor}
          $fontSize={titleFontSize}
        >
          {title}
        </Title>
      )}

      {items.length > 0 && (
        <ItemsContainer $scaleFactor={panelState.scaleFactor}>
          <ItemsGrid $columns={columns} $scaleFactor={panelState.scaleFactor}>
            {renderedItems}
          </ItemsGrid>
        </ItemsContainer>
      )}
    </Container>
  )
}

export default StatusPanel
