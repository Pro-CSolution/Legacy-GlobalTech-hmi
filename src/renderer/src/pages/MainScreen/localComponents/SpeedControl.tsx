import { useState, useRef, useEffect } from 'react'
import { Gauge } from 'lucide-react'
import Card from 'components/Card'
import Panel from 'components/Panel'
import { ConfirmModal } from 'components/Modal/ConfirmModal'
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
  speedReferenceSourceValue?: unknown
}

export const SpeedControl = ({
  speedRef,
  setSpeedRef,
  speedReferenceSourceValue,
  ...positionProps
}: SpeedControlProps) => {
  const [isSpeedWarningOpen, setIsSpeedWarningOpen] = useState(false)

  // Local state for immediate UI feedback and to prevent flickering/jumping
  const [localSpeed, setLocalSpeed] = useState(speedRef)

  // Ref to track if the user is currently interacting with the slider or buttons
  const isDragging = useRef(false)
  const isInteracting = useRef(false)
  const interactionTimeout = useRef<NodeJS.Timeout | null>(null)

  // Sync local state with prop only when not interacting
  useEffect(() => {
    // If the values match, we can consider interaction finished/synced
    if (Math.abs(speedRef - localSpeed) < 0.1) {
      // Optional: could clear isInteracting here early, but timeout is safer for noise
    }

    if (!isDragging.current && !isInteracting.current) {
      setLocalSpeed(speedRef)
    }
  }, [speedRef])

  const handleSpeedChange = (value: number) => {
    // Convert to number and check against 17
    // If undefined/null, we assume it's not set correctly or not communicating, so safe to warn?
    // Or maybe check if p501 is loaded first?
    // Assuming if communication is up, p501 should be there.
    if (Number(speedReferenceSourceValue) !== 17) {
      setIsSpeedWarningOpen(true)
      return
    }

    // Mark as interacting to prevent immediate overwrite from backend
    isInteracting.current = true
    if (interactionTimeout.current) {
      clearTimeout(interactionTimeout.current)
    }
    // Release interaction lock after 1 second of inactivity
    interactionTimeout.current = setTimeout(() => {
      isInteracting.current = false
    }, 1000)

    // Optimistic update
    setLocalSpeed(value)
    setSpeedRef(value)
  }

  // Calculate if we are waiting for the backend to catch up
  // We use a small tolerance for floating point comparisons if needed, though integers are likely here
  const isSyncing = Math.abs(speedRef - localSpeed) > 0.1 && !isDragging.current

  return (
    <>
      <Panel {...positionProps}>
        <Card title="Speed Adjustment" icon={Gauge} height="100%">
          <CompactSliderWrapper>
            <CompactMainRow>
              {/* Decrease Buttons */}
              <CompactButtonPair>
                <AdjustmentButton onClick={() => handleSpeedChange(Math.max(0, localSpeed - 1))}>
                  -1%
                </AdjustmentButton>
                <AdjustmentButton onClick={() => handleSpeedChange(Math.max(0, localSpeed - 10))}>
                  -10%
                </AdjustmentButton>
              </CompactButtonPair>

              {/* Center Value */}
              <CompactSliderValue $isSyncing={isSyncing}>
                {localSpeed?.toFixed(2)}
              </CompactSliderValue>

              {/* Increase Buttons */}
              <CompactButtonPair>
                <AdjustmentButton onClick={() => handleSpeedChange(Math.min(100, localSpeed + 10))}>
                  +10%
                </AdjustmentButton>
                <AdjustmentButton onClick={() => handleSpeedChange(Math.min(100, localSpeed + 1))}>
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
                value={localSpeed ?? 0}
                onMouseDown={() => {
                  isDragging.current = true
                }}
                onTouchStart={() => {
                  isDragging.current = true
                }}
                onMouseUp={() => {
                  isDragging.current = false
                }}
                onTouchEnd={() => {
                  isDragging.current = false
                }}
                onChange={(e) => handleSpeedChange(parseInt(e.target.value))}
              />
              <SliderLabel>100%</SliderLabel>
            </SliderRangeWrapper>
          </CompactSliderWrapper>
        </Card>
      </Panel>

      <ConfirmModal
        isOpen={isSpeedWarningOpen}
        title="Incorrect Control Mode"
        message="To control speed from the HMI, the drive parameter P5.01 must be configured to '17 (Summing Node A)'. Please make this change manually using the drive's keypad."
        confirmLabel="Understood"
        cancelLabel="Close"
        onConfirm={() => setIsSpeedWarningOpen(false)}
        onCancel={() => setIsSpeedWarningOpen(false)}
        tone="danger"
      />
    </>
  )
}
