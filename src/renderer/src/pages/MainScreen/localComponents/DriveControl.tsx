import React from 'react'
import { Settings, Play, Square, RefreshCcw, AlertOctagon } from 'lucide-react'
import Card from 'components/Card'
import ActionButton from 'components/ActionButton'
import Panel from 'components/Panel'
import {
  DriveStatusBox,
  DriveStatusRow,
  DriveLabel,
  DriveState,
  DriveFaultBox,
  DriveControls,
  EmergencyStopContainer
} from '../MainScreen.styles'
import { PositionProps } from 'styles/mixins'

interface DriveControlProps extends PositionProps {
  controlState: {
    driveRunning: boolean
    driveFault: boolean
  }
  setControlState: React.Dispatch<
    React.SetStateAction<{
      mode: string
      breaker: string
      driveRunning: boolean
      driveFault: boolean
      vfdCoolant: string
      blower: string
      motorTempWarn: string
      motorTempHigh: string
    }>
  >
}

export const DriveControl: React.FC<DriveControlProps> = ({
  controlState,
  setControlState,
  ...positionProps
}) => {
  return (
    <Panel {...positionProps}>
      <Card title="Drive Commands" icon={Settings} titleColor="#06b6d4">
        <DriveStatusBox>
          <DriveStatusRow>
            <DriveLabel>STATE:</DriveLabel>
            <DriveState active={controlState.driveRunning}>
              {controlState.driveRunning ? 'RUNNING' : 'STOPPED'}
            </DriveState>
          </DriveStatusRow>
          {controlState.driveFault && <DriveFaultBox>DRIVE FAULT!</DriveFaultBox>}
        </DriveStatusBox>

        <DriveControls>
          <ActionButton
            label="START DRIVE"
            color="green"
            icon={Play}
            active={controlState.driveRunning}
            onClick={() =>
              setControlState((p) => ({ ...p, driveRunning: true, driveFault: false }))
            }
          />

          <ActionButton
            label="STOP DRIVE"
            color="red"
            icon={Square}
            onClick={() => setControlState((p) => ({ ...p, driveRunning: false }))}
          />

          <div style={{ height: '16px' }} />

          <ActionButton
            label="RESET FAULTS"
            color="slate"
            icon={RefreshCcw}
            onClick={() =>
              setControlState((p) => ({ ...p, driveFault: false, motorTempHigh: 'ok' }))
            }
          />
        </DriveControls>

        <EmergencyStopContainer>
          <ActionButton label="EMERGENCY STOP" color="red" icon={AlertOctagon} />
        </EmergencyStopContainer>
      </Card>
    </Panel>
  )
}
