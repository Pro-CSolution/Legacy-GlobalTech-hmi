import React from 'react'
import { Gauge } from 'lucide-react'
import Card from '../../../components/Card'
import Panel from '../../../components/Panel'
import {
  SliderWrapper,
  SliderContainer,
  SliderHeader,
  SliderLabel,
  SliderValue,
  RangeInput,
  ButtonGroup,
  AdjustmentButton
} from '../MainScreen.styles'
import { PositionProps } from 'styles/mixins'

interface SpeedControlProps extends PositionProps {
  speedRef: number
  setSpeedRef: (value: number) => void
}

export const SpeedControl: React.FC<SpeedControlProps> = ({
  speedRef,
  setSpeedRef,
  ...positionProps
}) => {
  return (
    <Panel {...positionProps}>
      <Card title="Speed Adjustment" icon={Gauge} height="100%">
        <SliderWrapper>
          <SliderContainer>
            <SliderHeader>
              <SliderLabel>0%</SliderLabel>
              <SliderValue>{speedRef}</SliderValue>
              <SliderLabel>100%</SliderLabel>
            </SliderHeader>

            <RangeInput
              type="range"
              min="0"
              max="100"
              value={speedRef}
              onChange={(e) => setSpeedRef(parseInt(e.target.value))}
            />

            <ButtonGroup>
              <AdjustmentButton onClick={() => setSpeedRef(Math.max(0, speedRef - 1))}>
                -1%
              </AdjustmentButton>
              <AdjustmentButton onClick={() => setSpeedRef(Math.max(0, speedRef - 10))}>
                -10%
              </AdjustmentButton>
              <AdjustmentButton onClick={() => setSpeedRef(Math.min(100, speedRef + 10))}>
                +10%
              </AdjustmentButton>
              <AdjustmentButton onClick={() => setSpeedRef(Math.min(100, speedRef + 1))}>
                +1%
              </AdjustmentButton>
            </ButtonGroup>
          </SliderContainer>
        </SliderWrapper>
      </Card>
    </Panel>
  )
}
