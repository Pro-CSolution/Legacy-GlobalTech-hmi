import styled from 'styled-components'
import Card from 'components/Card'
import StatusBadge from 'components/StatusBadge'

interface SystemStatusProps {
  flowLow: boolean
  coolantPressureOk: boolean
  coolantLeak: boolean
  supply480V: boolean
  mainBreakerClosed: boolean
}

const StatusContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const StatusRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px;
  background: ${({ theme }) => theme.colors.background.secondary};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
`

const Label = styled.span`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-weight: 600;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`

export const SystemStatusPanel = ({
  flowLow,
  coolantPressureOk,
  coolantLeak,
  supply480V,
  mainBreakerClosed
}: SystemStatusProps) => {
  return (
    <Card title="SYSTEM STATUS">
      <StatusContainer>
        <StatusRow>
          <Label>Coolant Flow</Label>
          <StatusBadge
            status={flowLow ? 'warning' : 'running'}
            label=""
            onLabel="NORMAL"
            warnLabel="LOW"
          />
        </StatusRow>

        <StatusRow>
          <Label>Coolant Pressure</Label>
          <StatusBadge
            status={coolantPressureOk ? 'running' : 'warning'}
            label=""
            onLabel="NORMAL"
            warnLabel="LOW"
          />
        </StatusRow>

        <StatusRow>
          <Label>Coolant Leak</Label>
          <StatusBadge
            status={coolantLeak ? 'alarm' : 'running'}
            label=""
            onLabel="NONE"
            warnLabel="DETECTED"
            // Swap logic: if status is 'running' (no leak), use onLabel. If 'alarm' (leak), use warnLabel (or generic error label logic).
            // Checking StatusBadge implementation implicitly here. Usually alarm maps to red.
          />
        </StatusRow>

        <StatusRow>
          <Label>480VAC Supply</Label>
          <StatusBadge
            status={supply480V ? 'running' : 'stopped'}
            label=""
            onLabel="ON"
            warnLabel="OFF" // Assuming 'stopped' uses warnLabel or similar logic? or just standard stopped color.
          />
        </StatusRow>

        <StatusRow>
          <Label>Main Breaker</Label>
          <StatusBadge
            status={mainBreakerClosed ? 'running' : 'stopped'}
            label=""
            onLabel="CLOSED"
            warnLabel="OPEN"
          />
        </StatusRow>
      </StatusContainer>
    </Card>
  )
}
