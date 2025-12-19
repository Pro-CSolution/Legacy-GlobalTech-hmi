import { LucideIcon } from 'lucide-react'
import Card from 'components/Card'
import Panel from 'components/Panel'
import VerticalGauge from 'components/VerticalGauge'
import { Grid, GaugeTile, GaugeLabel } from './TemperaturePanel.styles'
import { PositionProps } from 'styles/mixins'

export interface TemperatureData {
  label: string
  value: number
  minValue?: number
  maxValue?: number
  unitOfMeasure?: string
}

interface TemperaturePanelProps extends PositionProps {
  title: string
  icon: LucideIcon
  data: TemperatureData[]
  columns?: number
  height?: number
  width?: number
}

export const TemperaturePanel = ({
  title,
  icon,
  data,
  columns = 3,
  height = 460,
  width,
  ...positionProps
}: TemperaturePanelProps) => {
  // Default gauge props that can be overridden by data items
  const defaultGaugeProps = {
    minValue: 0,
    maxValue: 200,
    unitOfMeasure: 'DEG F',
    size: { width: 80, height: 220 } // Adjusted size for card
  }

  return (
    <Panel width={width} height={height} {...positionProps}>
      <Card title={title} icon={icon} height="100%">
        <Grid columns={columns}>
          {data.map((item) => (
            <GaugeTile key={item.label}>
              <GaugeLabel>{item.label}</GaugeLabel>
              <VerticalGauge
                {...defaultGaugeProps}
                {...item}
                // Override size to fit container if needed, or let component handle it
                size={{ width: 60, height: 265 }}
              />
            </GaugeTile>
          ))}
        </Grid>
      </Card>
    </Panel>
  )
}
