import React from 'react'
import styled from 'styled-components'
import Card from 'components/Card'

interface SensorsPanelProps {
  pressureLow: boolean
  tempOk: boolean
  leakDetected: boolean
}

const IndicatorGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
`

const IndicatorBox = styled.div<{ status: 'ok' | 'warning' | 'alarm' }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12px 4px;
  background: ${({ theme, status }) => {
    if (status === 'alarm') return `${theme.colors.status.alarm}20`
    if (status === 'warning') return `${theme.colors.status.warning}20`
    return `${theme.colors.status.running}20`
  }};
  border: 1px solid
    ${({ theme, status }) => {
      if (status === 'alarm') return theme.colors.status.alarm
      if (status === 'warning') return theme.colors.status.warning
      return theme.colors.status.running
    }};
  border-radius: ${({ theme }) => theme.borderRadius.md};
`

const ValueText = styled.span<{ status: 'ok' | 'warning' | 'alarm' }>`
  font-weight: bold;
  font-size: ${({ theme }) => theme.typography.sizes.lg};
  color: ${({ theme, status }) => {
    if (status === 'alarm') return theme.colors.status.alarm
    if (status === 'warning') return theme.colors.status.warning
    return theme.colors.status.running
  }};
`

const LabelText = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
  text-align: center;
  margin-top: 4px;
`

export const SensorsPanel: React.FC<SensorsPanelProps> = ({
  pressureLow,
  tempOk,
  leakDetected
}) => {
  return (
    <Card title="Sensor Indicators">
      <IndicatorGrid>
        <IndicatorBox status={pressureLow ? 'alarm' : 'ok'}>
          <ValueText status={pressureLow ? 'alarm' : 'ok'}>{pressureLow ? 'LOW' : 'OK'}</ValueText>
          <LabelText>PRESSURE</LabelText>
        </IndicatorBox>

        <IndicatorBox status={tempOk ? 'ok' : 'warning'}>
          <ValueText status={tempOk ? 'ok' : 'warning'}>{tempOk ? 'OK' : 'HIGH'}</ValueText>
          <LabelText>TEMP</LabelText>
        </IndicatorBox>

        <IndicatorBox status={leakDetected ? 'alarm' : 'ok'}>
          <ValueText status={leakDetected ? 'alarm' : 'ok'}>
            {leakDetected ? 'LEAK' : 'OK'}
          </ValueText>
          <LabelText>LEAK</LabelText>
        </IndicatorBox>
      </IndicatorGrid>
    </Card>
  )
}
