import React from 'react'
import styled from 'styled-components'
import Card from 'components/Card'
import StatusBadge from 'components/StatusBadge'

interface PumpControlProps {
  title: string
  isRunning: boolean
}

const StatusContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 0;
`

export const PumpControl: React.FC<PumpControlProps> = ({ title, isRunning }) => {
  return (
    <Card title={title}>
      <StatusContainer>
        <StatusBadge
          status={isRunning ? 'running' : 'stopped'}
          label={isRunning ? 'RUNNING' : 'STOPPED'}
        />
      </StatusContainer>
    </Card>
  )
}
