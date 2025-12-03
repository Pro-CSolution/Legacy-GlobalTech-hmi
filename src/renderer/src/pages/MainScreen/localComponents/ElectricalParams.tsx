import React from 'react'
import { Zap } from 'lucide-react'
import Card from 'components/Card'
import DigitalDisplay from 'components/DigitalDisplay'
import Panel from 'components/Panel'
import { ElectricalGrid, TrendPlaceholder, TrendLabel, TrendStatus } from '../MainScreen.styles'
import { PositionProps } from 'styles/mixins'

interface ElectricalParamsProps extends PositionProps {
  electrical: {
    volts: number
    hz: number
    kw: number
    amps: number
    torque: number
  }
}

export const ElectricalParams: React.FC<ElectricalParamsProps> = ({
  electrical,
  ...positionProps
}) => {
  return (
    <Panel width={1080} height={280} {...positionProps}>
      <Card title="Electrical Parameters" icon={Zap} height="100%">
        <ElectricalGrid>
          <DigitalDisplay label="Line Voltage" value={electrical.volts} unit="VAC" />
          <DigitalDisplay label="Frequency" value={electrical.hz} unit="Hz" />
          <DigitalDisplay label="Power" value={electrical.kw} unit="kW" />
          <DigitalDisplay label="Current" value={electrical.amps} unit="A" />
          <DigitalDisplay label="Torque" value={electrical.torque} unit="%" />
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
