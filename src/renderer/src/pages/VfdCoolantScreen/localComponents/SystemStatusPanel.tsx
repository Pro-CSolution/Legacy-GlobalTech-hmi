import React from 'react'
import styled from 'styled-components'
import Card from 'components/Card'
import StatusBadge from 'components/StatusBadge'

interface SystemStatusProps {
  systemFault: boolean
  flowLow: boolean
}

const StatusRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding: 8px;
  background: ${({ theme }) => theme.colors.background.tertiary};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  
  &:last-child {
    margin-bottom: 0;
  }
`

const Label = styled.span`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-weight: 500;
`

export const SystemStatusPanel: React.FC<SystemStatusProps> = ({ systemFault, flowLow }) => {
  return (
    <Card title="System Status">
      <StatusRow>
        <Label>Coolant System</Label>
        <StatusBadge 
          status={systemFault ? 'alarm' : 'ok'} 
          label={systemFault ? 'FAULT' : 'OK'} 
        />
      </StatusRow>
      <StatusRow>
        <Label>Coolant Flow</Label>
        <StatusBadge 
          status={flowLow ? 'warning' : 'ok'} 
          label={flowLow ? 'LOW' : 'NORMAL'} 
        />
      </StatusRow>
    </Card>
  )
}
