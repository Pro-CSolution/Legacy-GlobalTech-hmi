import {
  type ChangeEvent,
  type KeyboardEvent,
  type PointerEvent,
  useState,
  useRef,
  useEffect
} from 'react'
import { Gauge } from 'lucide-react'
import Card from 'components/Card'
import Panel from 'components/Panel'
import { ConfirmModal } from 'components/Modal/ConfirmModal'
import { useAccessMode } from 'hooks'
import { MULTI_TOUCH_CANCEL_EVENT } from 'utils/touch'
import { SliderLabel, RangeInput, AdjustmentButton } from '../MainScreen.styles'
import { PositionProps } from 'styles/mixins'
import {
  CompactSliderWrapper,
  CompactMainRow,
  CompactButtonPair,
  CompactSliderValue,
  SliderRangeWrapper
} from '../MainScreen.styles'
import { MAX_SPEED_REFERENCE } from '../speedReference'

interface SpeedControlProps extends PositionProps {
  speedRef: number
  setSpeedRef: (value: number) => void
  speedReferenceSourceValue?: unknown
  isEthernetMode?: boolean
}

const ETHERNET_REFERENCE_SOURCE_VALUE = 21

export const SpeedControl = ({
  speedRef,
  setSpeedRef,
  speedReferenceSourceValue,
  isEthernetMode = false,
  ...positionProps
}: SpeedControlProps) => {
  const { isViewOnly } = useAccessMode()
  const [isSpeedWarningOpen, setIsSpeedWarningOpen] = useState(false)

  // Local state for immediate UI feedback and to prevent flickering/jumping
  const [localSpeed, setLocalSpeed] = useState(speedRef)
  const pendingSpeedRef = useRef(speedRef)

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
      pendingSpeedRef.current = speedRef
      setLocalSpeed(speedRef)
    }
  }, [localSpeed, speedRef])

  useEffect(() => {
    return () => {
      if (interactionTimeout.current) {
        clearTimeout(interactionTimeout.current)
      }
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleMultiTouchCancel = () => {
      if (!isDragging.current) {
        return
      }

      isDragging.current = false
      pendingSpeedRef.current = speedRef
      setLocalSpeed(speedRef)

      if (interactionTimeout.current) {
        clearTimeout(interactionTimeout.current)
      }

      interactionTimeout.current = setTimeout(() => {
        isInteracting.current = false
      }, 1000)
    }

    window.addEventListener(MULTI_TOUCH_CANCEL_EVENT, handleMultiTouchCancel)

    return () => {
      window.removeEventListener(MULTI_TOUCH_CANCEL_EVENT, handleMultiTouchCancel)
    }
  }, [speedRef])

  const updateLocalSpeed = (value: number) => {
    pendingSpeedRef.current = value
    setLocalSpeed(value)
  }

  const scheduleInteractionReset = () => {
    if (interactionTimeout.current) {
      clearTimeout(interactionTimeout.current)
    }

    interactionTimeout.current = setTimeout(() => {
      isInteracting.current = false
    }, 1000)
  }

  const beginSliderInteraction = () => {
    isDragging.current = true
    isInteracting.current = true

    if (interactionTimeout.current) {
      clearTimeout(interactionTimeout.current)
    }
  }

  const commitSpeedChange = (value: number) => {
    if (isViewOnly) {
      return
    }

    if (!isEthernetMode || Number(speedReferenceSourceValue) !== ETHERNET_REFERENCE_SOURCE_VALUE) {
      setIsSpeedWarningOpen(true)
      return
    }

    // Mark as interacting to prevent immediate overwrite from backend
    isInteracting.current = true
    const nextValue = Math.max(0, Math.min(MAX_SPEED_REFERENCE, value))

    // Optimistic update
    updateLocalSpeed(nextValue)
    setSpeedRef(nextValue)
    scheduleInteractionReset()
  }

  const handleSliderChange = (event: ChangeEvent<HTMLInputElement>) => {
    event.stopPropagation()

    if (isViewOnly) {
      return
    }

    if (!isEthernetMode || Number(speedReferenceSourceValue) !== ETHERNET_REFERENCE_SOURCE_VALUE) {
      setIsSpeedWarningOpen(true)
      return
    }

    isInteracting.current = true
    updateLocalSpeed(parseInt(event.target.value, 10))
  }

  const finishSliderInteraction = (shouldCommit = true) => {
    if (!isDragging.current) {
      return
    }

    isDragging.current = false

    if (!shouldCommit) {
      updateLocalSpeed(speedRef)
      scheduleInteractionReset()
      return
    }

    if (Math.abs(pendingSpeedRef.current - speedRef) < 0.1) {
      scheduleInteractionReset()
      return
    }

    commitSpeedChange(pendingSpeedRef.current)
  }

  const handleSliderPointerDown = (event: PointerEvent<HTMLInputElement>) => {
    if (isViewOnly || !isEthernetMode) {
      return
    }

    event.stopPropagation()
    beginSliderInteraction()
    event.currentTarget.setPointerCapture?.(event.pointerId)
  }

  const handleSliderPointerUp = (event: PointerEvent<HTMLInputElement>) => {
    event.stopPropagation()

    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }

    finishSliderInteraction(true)
  }

  const handleSliderPointerCancel = (event: PointerEvent<HTMLInputElement>) => {
    event.stopPropagation()
    finishSliderInteraction(false)
  }

  const handleSliderLostPointerCapture = () => {
    finishSliderInteraction(true)
  }

  const handleSliderKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    event.stopPropagation()
    isInteracting.current = true
  }

  const handleSliderKeyUp = (event: KeyboardEvent<HTMLInputElement>) => {
    event.stopPropagation()
    finishSliderInteraction(true)
  }

  // Calculate if we are waiting for the backend to catch up
  // We use a small tolerance for floating point comparisons if needed, though integers are likely here
  const isSyncing = Math.abs(speedRef - localSpeed) > 0.1 && !isDragging.current
  const controlsDisabled = isViewOnly || !isEthernetMode
  const speedValueText = localSpeed.toFixed(0)

  return (
    <>
      <Panel {...positionProps}>
        <Card title="Speed Adjustment" icon={Gauge} height="100%">
          <CompactSliderWrapper>
            {isViewOnly ? (
              <CompactSliderValue $isSyncing={isSyncing}>
                {speedValueText}
              </CompactSliderValue>
            ) : (
              <>
                <CompactMainRow>
                  <CompactButtonPair>
                    <AdjustmentButton
                      disabled={controlsDisabled}
                      onClick={() => commitSpeedChange(Math.max(0, localSpeed - 1))}
                    >
                      -1%
                    </AdjustmentButton>
                    <AdjustmentButton
                      disabled={controlsDisabled}
                      onClick={() => commitSpeedChange(Math.max(0, localSpeed - 10))}
                    >
                      -10%
                    </AdjustmentButton>
                  </CompactButtonPair>

                  <CompactSliderValue $isSyncing={isSyncing}>
                    {speedValueText}
                  </CompactSliderValue>

                  <CompactButtonPair>
                    <AdjustmentButton
                      disabled={controlsDisabled}
                      onClick={() =>
                        commitSpeedChange(Math.min(MAX_SPEED_REFERENCE, localSpeed + 10))
                      }
                    >
                      +10%
                    </AdjustmentButton>
                    <AdjustmentButton
                      disabled={controlsDisabled}
                      onClick={() =>
                        commitSpeedChange(Math.min(MAX_SPEED_REFERENCE, localSpeed + 1))
                      }
                    >
                      +1%
                    </AdjustmentButton>
                  </CompactButtonPair>
                </CompactMainRow>

                <SliderRangeWrapper>
                  <SliderLabel>0%</SliderLabel>
                  <RangeInput
                    type="range"
                    min="0"
                    max={MAX_SPEED_REFERENCE}
                    value={localSpeed ?? 0}
                    disabled={controlsDisabled}
                    onPointerDown={handleSliderPointerDown}
                    onPointerUp={handleSliderPointerUp}
                    onPointerCancel={handleSliderPointerCancel}
                    onLostPointerCapture={handleSliderLostPointerCapture}
                    onChange={handleSliderChange}
                    onKeyDown={handleSliderKeyDown}
                    onKeyUp={handleSliderKeyUp}
                    onBlur={() => finishSliderInteraction(true)}
                    onClick={(event) => event.stopPropagation()}
                  />
                  <SliderLabel>{MAX_SPEED_REFERENCE}%</SliderLabel>
                </SliderRangeWrapper>
              </>
            )}
          </CompactSliderWrapper>
        </Card>
      </Panel>

      <ConfirmModal
        isOpen={isSpeedWarningOpen}
        title="Control Desde PLC"
        message="En Keypad Control la referencia de velocidad debe venir del PLC. El ajuste desde el HMI solo queda habilitado en ConView Control."
        confirmLabel="Entendido"
        cancelLabel="Cerrar"
        onConfirm={() => setIsSpeedWarningOpen(false)}
        onCancel={() => setIsSpeedWarningOpen(false)}
        tone="danger"
      />
    </>
  )
}
