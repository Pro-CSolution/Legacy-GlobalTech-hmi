import React from 'react'
import styled from 'styled-components'
import Card from 'components/Card'
import ActionButton from 'components/ActionButton'
import StatusBadge from 'components/StatusBadge'

interface PumpControlProps {
  title: string
  isRunning: boolean
  onStart: () => void
  onStop: () => void
}

const ControlGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: 12px;
`

const StatusContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 12px;
`

export const PumpControl: React.FC<PumpControlProps> = ({ title, isRunning, onStart, onStop }) => {
  return (
    <Card title={title}>
      <StatusContainer>
        <StatusBadge
          status={isRunning ? 'running' : 'stopped'}
          label={isRunning ? 'RUNNING' : 'STOPPED'}
        />
      </StatusContainer>
      <ControlGrid>
        <ActionButton label="START" color="green" onClick={onStart} disabled={isRunning} />
        <ActionButton label="STOP" color="red" onClick={onStop} disabled={!isRunning} />
      </ControlGrid>
    </Card>
  )
}
