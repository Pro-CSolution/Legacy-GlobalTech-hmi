import React from 'react'
import { Activity } from 'lucide-react'
import Card from 'components/Card'
import StatusBadge from 'components/StatusBadge'
import Panel from 'components/Panel'
import { StatusList, WarningGroup } from '../MainScreen.styles'
import { PositionProps } from 'styles/mixins'

interface SystemStatusProps extends PositionProps {
  controlState: {
    mode: string
    breaker: string
    vfdCoolant: string
    blower: string
    motorTempWarn: string
    motorTempHigh: string
  }
}

export const SystemStatus: React.FC<SystemStatusProps> = ({ controlState, ...positionProps }) => {
  return (
    <Panel width={380} height={850} {...positionProps}>
      <Card title="System Status" icon={Activity}>
        <StatusList>
          <StatusBadge
            label="Control Mode"
            status={controlState.mode}
            onLabel="LOCAL"
            offLabel="REMOTE"
          />
          <StatusBadge
            label="Main Breaker"
            status={controlState.breaker}
            onLabel="CLOSED"
            offLabel="OPEN"
          />
          <StatusBadge
            label="VFD Coolant"
            status={controlState.vfdCoolant}
            onLabel="OK"
            faultLabel="FAULT"
          />
          <StatusBadge
            label="Motor Blower"
            status={controlState.blower}
            onLabel="RUNNING"
            offLabel="STOPPED"
          />

          <WarningGroup>
            <StatusBadge
              label="Temp Warning"
              status={controlState.motorTempWarn}
              onLabel="WARN"
              offLabel="NORMAL"
              type="warning"
            />
            <StatusBadge
              label="High Temp Alarm"
              status={controlState.motorTempHigh}
              onLabel="HIGH"
              offLabel="NORMAL"
              faultLabel="CRITICAL"
            />
          </WarningGroup>
        </StatusList>
      </Card>
    </Panel>
  )
}
