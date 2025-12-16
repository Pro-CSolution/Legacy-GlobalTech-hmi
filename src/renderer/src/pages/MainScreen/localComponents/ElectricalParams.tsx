import { Zap } from 'lucide-react'
import Card from 'components/Card'
import Gauge, { HmiData } from 'components/Gauge'
import Panel from 'components/Panel'
import {
  ElectricalGrid,
  GaugeLabel,
  GaugeTile,
  TrendPlaceholder,
  TrendLabel,
  TrendStatus
} from '../MainScreen.styles'
import { PositionProps } from 'styles/mixins'
import { useMemo } from 'react'
import { useTheme } from 'styled-components'

interface ElectricalParamsProps extends PositionProps {
  electrical: {
    volts: number
    hz: number
    kw: number
    amps: number
    torque: number
  }
  height?: number
}

export const ElectricalParams = ({
  electrical,
  height = 460,
  ...positionProps
}: ElectricalParamsProps) => {
  const theme = useTheme()

  const gaugeCommonProps = useMemo(
    () => ({
      size: { height: 140 },
      backgroundColor: theme.colors.background.secondary,
      degradedColor: theme.colors.background.tertiary,
      fontProperties: {
        textColor: theme.colors.text.primary,
        fontSizeValue: 23,
        fontSizeUnitOfMeasure: 18,
        fontSizeIndicatorNumber: 14
      },
      arrowProperties: {
        color: theme.colors.accent.primary
      }
    }),
    [theme]
  )

  const gauges: Array<{ label: string } & HmiData> = useMemo(
    () => [
      {
        label: 'Line Voltage',
        value: electrical.volts,
        unitOfMeasure: 'VAC',
        minValue: 0,
        maxValue: 600
      },
      {
        label: 'Frequency',
        value: electrical.hz,
        unitOfMeasure: 'Hz',
        minValue: 0,
        maxValue: 120
      },
      {
        label: 'Power',
        value: electrical.kw,
        unitOfMeasure: 'kW',
        minValue: 0,
        maxValue: 700
      },
      {
        label: 'Current',
        value: electrical.amps,
        unitOfMeasure: 'A',
        minValue: 0,
        maxValue: 800
      },
      {
        label: 'Torque',
        value: electrical.torque,
        unitOfMeasure: '%',
        minValue: -50,
        maxValue: 150
      }
    ],
    [electrical]
  )

  return (
    <Panel width={1080} height={height} {...positionProps}>
      <Card title="Electrical Parameters" icon={Zap} height="100%">
        <ElectricalGrid>
          {gauges.map(({ label, ...gaugeProps }) => (
            <GaugeTile key={label}>
              <GaugeLabel>{label}</GaugeLabel>
              <Gauge {...gaugeCommonProps} {...gaugeProps} />
            </GaugeTile>
          ))}
          {/* Master Trend Placeholder */}
          <TrendPlaceholder>
            <TrendLabel>MASTER TREND</TrendLabel>
            <TrendStatus>RECORDING</TrendStatus>
          </TrendPlaceholder>
        </ElectricalGrid>
      </Card>
    </Panel>
  )
}
