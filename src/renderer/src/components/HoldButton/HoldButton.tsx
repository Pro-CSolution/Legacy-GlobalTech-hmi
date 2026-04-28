import { useState, useRef, useEffect, ReactNode, type TouchEvent as ReactTouchEvent } from 'react'
import styled from 'styled-components'
import { isSingleTouchContact, MULTI_TOUCH_CANCEL_EVENT } from 'utils/touch'

interface HoldButtonProps {
  onHoldComplete: () => void
  label?: string
  holdTimeMs?: number
  disabled?: boolean
  color?: string
  children?: ReactNode
}

const ButtonContainer = styled.button<{ $disabled?: boolean; $color?: string }>`
  position: relative;
  overflow: hidden;
  padding: 12px 24px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme, $color }) => $color || theme.colors.accent.primary};
  border: none;
  color: ${({ theme }) => theme.colors.text.inverse};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  font-size: ${({ theme }) => theme.typography.sizes.lg};
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  opacity: ${({ $disabled }) => ($disabled ? 0.5 : 1)};
  user-select: none;
  -webkit-user-select: none;
  touch-action: none;
  outline: none;
  transition: transform 0.1s;

  &:active {
    transform: ${({ $disabled }) => ($disabled ? 'none' : 'scale(0.98)')};
  }
`

const RadialOverlay = styled.div<{ $progress: number }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.32);
  transform-origin: left;
  transform: scaleX(${({ $progress }) => $progress / 100});
  transition: transform 0.04s linear;
`

const ProgressBar = styled.div<{ $progress: number; $color?: string }>`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 6px;
  background: ${({ theme }) => `${theme.colors.text.inverse}a0`};
  overflow: hidden;
  border-radius: 0 0 ${({ theme }) => theme.borderRadius.md} ${({ theme }) => theme.borderRadius.md};

  &::after {
    content: '';
    display: block;
    height: 100%;
    width: ${({ $progress }) => $progress}%;
    background: ${({ theme, $color }) => $color || theme.colors.text.inverse};
    transition: width 0.04s linear;
  }
`

export const HoldButton = ({
  onHoldComplete,
  label = 'HOLD TO APPLY',
  holdTimeMs = 1000,
  disabled = false,
  color,
  children
}: HoldButtonProps) => {
  const [progress, setProgress] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(0)

  const stop = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setProgress(0)
  }

  const start = (e: React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>) => {
    if (disabled) return
    if (e.type === 'mousedown' && 'button' in e && e.button !== 0) return

    e.preventDefault() // Prevent ghost clicks on touch

    startTimeRef.current = Date.now()
    setProgress(0)

    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current
      const p = Math.min(100, (elapsed / holdTimeMs) * 100)
      setProgress(p)

      if (p >= 100) {
        stop()
        onHoldComplete()
      }
    }, 16) // ~60fps
  }

  // Cleanup on unmount
  useEffect(() => {
    if (typeof window === 'undefined') {
      return () => stop()
    }

    const handleMultiTouchCancel = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      setProgress(0)
    }

    window.addEventListener(MULTI_TOUCH_CANCEL_EVENT, handleMultiTouchCancel)

    return () => {
      window.removeEventListener(MULTI_TOUCH_CANCEL_EVENT, handleMultiTouchCancel)
      handleMultiTouchCancel()
    }
  }, [])

  const handleTouchStart = (event: ReactTouchEvent<HTMLButtonElement>) => {
    if (!isSingleTouchContact(event.nativeEvent)) {
      stop()
      return
    }

    start(event)
  }

  return (
    <ButtonContainer
      $disabled={disabled}
      $color={color}
      onMouseDown={start}
      onMouseUp={stop}
      onMouseLeave={stop}
      onTouchStart={handleTouchStart}
      onTouchEnd={stop}
    >
      <RadialOverlay $progress={progress} />
      <ProgressBar $progress={progress} $color={color} />
      <div style={{ position: 'relative', zIndex: 1 }}>{children || label}</div>
    </ButtonContainer>
  )
}
