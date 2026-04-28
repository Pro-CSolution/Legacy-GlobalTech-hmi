import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, JSX } from 'react'
import {
  GaugeContainer,
  CenterCircle,
  CenterRing,
  GaugeWrapper,
  GaugeTicks,
  Tick,
  AlarmArea as AlarmAreaContainer,
  Arrow,
  IndicatorNumber,
  WrapperIndicatorNumber
} from './Gauge.styles'
import AlarmArea from './AlarmArea'
import { scaleNumber } from './utils'
import { ThemeProvider, type DefaultTheme } from 'styled-components'
import type { HmiData } from './Gauge.types'

const Gauge = ({
  backgroundColor = '#212121',
  maxValue = 100,
  degradedColor = '#005082',
  minValue = 0,
  unitOfMeasure,
  value = 0,
  displayValueText,
  endL,
  endLL,
  startH,
  startHH,
  showAlarms = true,
  arrowProperties,
  fontProperties,
  position,
  size
}: HmiData) => {
  const [ticks, setTicks] = useState<Array<JSX.Element>>([])
  const [indicatorNumbers, setIndicatorNumbers] = useState<Array<number>>([])
  const [scaledNumber, setScaledNumber] = useState(0)
  const [milliseconds, setMilliseconds] = useState(1050)
  const [limitsScaled, setLimitsScaled] = useState({
    endLL: 0,
    endL: 0,
    startH: 0,
    startHH: 0
  })

  const prevValueRef = useRef<number | undefined>(value)
  const containerRef = useRef<HTMLDivElement>(null)

  const totalTicks = 41
  const middleTick = Math.floor(totalTicks / 2)
  const quarterTick = Math.floor(totalTicks / 4)
  const eighthTick = Math.floor(totalTicks / 8)

  useEffect(() => {
    const range = maxValue - minValue
    const quarterIndicator = Math.round(minValue + range / 4)
    const middleIndicator = Math.round(minValue + range / 2)
    const threeQuartersIndicator = Math.round(minValue + (3 * range) / 4)

    setIndicatorNumbers([
      minValue,
      quarterIndicator,
      middleIndicator,
      threeQuartersIndicator,
      maxValue
    ])
  }, [minValue, maxValue])

  useEffect(() => {
    const getTickSize = (index: number): string => {
      let tickSize = 'small'
      if (index % middleTick === 0 || index % quarterTick === 0) {
        tickSize = 'large'
      } else if (index % eighthTick === 0) {
        tickSize = 'medium'
      }
      return tickSize
    }

    const rotationIncrement = 240 / (totalTicks - 1)

    const Ticks = Array.from({ length: totalTicks }).map((_, index) => {
      const tickSize = getTickSize(index)
      return <Tick key={index} $rotation={-120 + rotationIncrement * index} size={tickSize} />
    })
    setTicks(Ticks)
  }, [eighthTick, middleTick, quarterTick, totalTicks])

  useEffect(() => {
    if (value === undefined) return

    const currentValueScaled = scaleNumber(value, minValue, maxValue)
    setScaledNumber(currentValueScaled)

    const difference = prevValueRef.current != undefined ? value - prevValueRef.current : 0
    const range = maxValue - minValue
    const differencePercent = range > 0 ? (Math.abs(difference) / range) * 100 : 0

    if (differencePercent >= 75) {
      setMilliseconds(300)
    } else if (differencePercent >= 50) {
      setMilliseconds(500)
    } else {
      setMilliseconds(1000)
    }

    prevValueRef.current = value
  }, [value, minValue, maxValue])

  useEffect(() => {
    const valueToPercentage = (min: number, max: number, valor?: number): number => {
      if (valor === undefined) return 0
      return ((valor - min) * 100) / (max - min)
    }

    setLimitsScaled({
      endLL: valueToPercentage(minValue, maxValue, endLL),
      endL: valueToPercentage(minValue, maxValue, endL),
      startH: valueToPercentage(minValue, maxValue, startH),
      startHH: valueToPercentage(minValue, maxValue, startHH)
    })
  }, [endLL, endL, startH, startHH, minValue, maxValue])

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const { clientHeight, clientWidth } = containerRef.current

        // Calcular aspect ratio del contenedor padre
        const aspectRatio = clientWidth / clientHeight

        let containerSize = ''

        // Por defecto: usar el ancho del contenedor (para pantallas normales)
        containerSize = `${clientWidth}px`

        // If aspect ratio > 100/75.3 (≈ 1.33): height is very small
        // Usar el alto multiplicado por 1.32 para que se vea completo
        if (aspectRatio > 100 / 75.3) {
          containerSize = `${clientHeight * 1.32}px`
        }

        containerRef.current.style.setProperty('--container-size', containerSize)
      }
    }

    updateSize()
    window.addEventListener('resize', updateSize)

    return () => window.removeEventListener('resize', updateSize)
  }, [])

  const theme: DefaultTheme = {
    colors: {
      background: {
        primary: backgroundColor as string,
        secondary: '#0b1528',
        tertiary: '#101c31',
        overlay: 'rgba(7, 17, 32, 0.82)'
      },
      text: {
        primary: (fontProperties?.textColor as string) || '#eef4ff',
        secondary: '#aab7d1',
        disabled: '#5f7293',
        inverse: '#08111f'
      },
      accent: {
        primary: '#67d6ff',
        secondary: '#48bfff',
        success: '#4bd27b'
      },
      status: {
        running: '#97f2a8',
        stopped: '#ff6a6a',
        warning: '#ffd66b',
        alarm: '#ff6a6a',
        info: '#6aa8ff'
      },
      borders: {
        primary: 'rgba(120, 170, 255, 0.16)',
        secondary: 'rgba(120, 170, 255, 0.1)',
        active: '#67d6ff'
      },
      gradients: {
        card: 'linear-gradient(180deg, rgba(18, 30, 52, 0.96) 0%, rgba(10, 18, 33, 0.96) 100%)',
        active:
          'linear-gradient(180deg, rgba(68, 117, 205, 0.98) 0%, rgba(47, 87, 170, 0.98) 100%)'
      }
    },
    typography: {
      fontFamily: "'Rajdhani', 'Segoe UI', 'Inter', sans-serif",
      bodyFamily: "'Rajdhani', 'Segoe UI', 'Inter', sans-serif",
      displayFamily: "'Rajdhani', 'Segoe UI', 'Inter', sans-serif",
      numericFamily: "'Rajdhani', 'Segoe UI', 'Inter', sans-serif",
      sizes: {
        xs: '12px',
        sm: '14px',
        md: '16px',
        lg: '20px',
        xl: '24px',
        xxl: '32px'
      },
      weights: {
        regular: 400,
        medium: 500,
        bold: 700
      }
    },
    shadows: {
      sm: '0 6px 16px rgba(0, 0, 0, 0.18)',
      md: '0 10px 24px rgba(0, 0, 0, 0.3)',
      lg: '0 18px 42px rgba(0, 0, 0, 0.36)',
      glow: '0 0 18px rgba(72, 191, 255, 0.22)'
    },
    borderRadius: {
      sm: '10px',
      md: '14px',
      lg: '18px',
      full: '9999px'
    },
    backgroundColor,
    degradedColor,
    arrowWidth: arrowProperties?.width ?? 1.6,
    arrowColor: arrowProperties?.color ?? 'white',
    textColor: fontProperties?.textColor ?? 'white',
    fontSizeValue: fontProperties?.fontSizeValue ?? 25,
    fontSizeUnitOfMeasure: fontProperties?.fontSizeUnitOfMeasure ?? 17,
    fontSizeIndicatorNumber: fontProperties?.fontSizeIndicatorNumber ?? 15
  }

  const resolvedDisplayValue =
    displayValueText ?? (value != undefined ? parseFloat(value.toFixed(1)) : 'Error')

  return (
    <GaugeContainer ref={containerRef} $position={position} $size={size}>
      <ThemeProvider theme={theme}>
        <GaugeWrapper>
          <CenterCircle>
            <WrapperIndicatorNumber>
              {indicatorNumbers.map((ele, index) => {
                const positionsArray = [
                  { top: 68, left: 13 },
                  { top: 25, left: 14.5 },
                  { top: 1.5, left: 50 },
                  { top: 25, left: 85.5 },
                  { top: 68, left: 86.5 }
                ]
                const position = positionsArray[index]
                return (
                  <IndicatorNumber $top={position.top} $left={position.left} key={index}>
                    {ele}
                  </IndicatorNumber>
                )
              })}
            </WrapperIndicatorNumber>
            <CenterRing>
              <h4>{resolvedDisplayValue}</h4>
              {(displayValueText !== undefined || value != undefined) && unitOfMeasure && (
                <span>{unitOfMeasure}</span>
              )}
            </CenterRing>
          </CenterCircle>
          <GaugeTicks>{ticks}</GaugeTicks>
          {showAlarms && (
            <AlarmAreaContainer>
              <AlarmArea
                color={'#ff2600'}
                start={0}
                end={limitsScaled.endLL}
                visible={endLL != undefined}
                minValue={minValue}
                maxValue={maxValue}
              />
              <AlarmArea
                color={'#ffe307'}
                start={endLL == undefined ? 0 : limitsScaled.endLL}
                end={limitsScaled.endL}
                visible={
                  endL != undefined &&
                  (limitsScaled.endLL < limitsScaled.endL || endLL == undefined)
                }
                minValue={minValue}
                maxValue={maxValue}
              />
              <AlarmArea
                color={'#ffe307'}
                start={limitsScaled.startH}
                end={startHH == undefined ? 100 : limitsScaled.startHH}
                visible={
                  startH != undefined &&
                  (limitsScaled.startHH > limitsScaled.startH || startHH == undefined) &&
                  limitsScaled.startH >= 0
                }
                minValue={minValue}
                maxValue={maxValue}
              />
              <AlarmArea
                color={'#ff2600'}
                start={limitsScaled.startHH}
                end={100}
                visible={startHH != undefined && limitsScaled.startHH >= 0}
                minValue={minValue}
                maxValue={maxValue}
              />
            </AlarmAreaContainer>
          )}
          <Arrow
            $animationDuration={milliseconds}
            style={
              {
                '--gauge-arrow-deg': `${scaledNumber}deg`
              } as CSSProperties
            }
          />
        </GaugeWrapper>
      </ThemeProvider>
    </GaugeContainer>
  )
}

export default Gauge
