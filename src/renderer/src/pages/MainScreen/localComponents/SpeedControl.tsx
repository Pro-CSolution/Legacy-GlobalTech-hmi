import { Gauge } from 'lucide-react'
import Card from 'components/Card'
import Panel from 'components/Panel'
import { SliderLabel, RangeInput, AdjustmentButton } from '../MainScreen.styles'
import { PositionProps } from 'styles/mixins'
import {
  CompactSliderWrapper,
  CompactMainRow,
  CompactButtonPair,
  CompactSliderValue,
  SliderRangeWrapper
} from '../MainScreen.styles'

interface SpeedControlProps extends PositionProps {
  speedRef: number
  setSpeedRef: (value: number) => void
}

export const SpeedControl = ({ speedRef, setSpeedRef, ...positionProps }: SpeedControlProps) => {
  return (
    <Panel {...positionProps}>
      <Card title="Speed Adjustment" icon={Gauge} height="100%">
        <CompactSliderWrapper>
          <CompactMainRow>
            {/* Decrease Buttons */}
            <CompactButtonPair>
              <AdjustmentButton onClick={() => setSpeedRef(Math.max(0, speedRef - 1))}>
                -1%
              </AdjustmentButton>
              <AdjustmentButton onClick={() => setSpeedRef(Math.max(0, speedRef - 10))}>
                -10%
              </AdjustmentButton>
            </CompactButtonPair>

            {/* Center Value */}
            <CompactSliderValue>{speedRef}</CompactSliderValue>

            {/* Increase Buttons */}
            <CompactButtonPair>
              <AdjustmentButton onClick={() => setSpeedRef(Math.min(100, speedRef + 10))}>
                +10%
              </AdjustmentButton>
              <AdjustmentButton onClick={() => setSpeedRef(Math.min(100, speedRef + 1))}>
                +1%
              </AdjustmentButton>
            </CompactButtonPair>
          </CompactMainRow>

          <SliderRangeWrapper>
            <SliderLabel>0%</SliderLabel>
            <RangeInput
              type="range"
              min="0"
              max="100"
              value={speedRef}
              onChange={(e) => setSpeedRef(parseInt(e.target.value))}
            />
            <SliderLabel>100%</SliderLabel>
          </SliderRangeWrapper>
        </CompactSliderWrapper>
      </Card>
    </Panel>
  )
}
