import React, { useState, useRef, useEffect } from 'react'
import styled from 'styled-components'

interface HoldButtonProps {
  onHoldComplete: () => void
  label?: string
  holdTimeMs?: number
  disabled?: boolean
  color?: string
  children?: React.ReactNode
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
  background: rgba(255, 255, 255, 0.2);
  transform-origin: left;
  transform: scaleX(${({ $progress }) => $progress / 100});
  transition: transform 0.05s linear;
`

export const HoldButton: React.FC<HoldButtonProps> = ({
  onHoldComplete,
  label = 'HOLD TO APPLY',
  holdTimeMs = 1000,
  disabled = false,
  color,
  children
}) => {
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
    return () => stop()
  }, [])

  return (
    <ButtonContainer
      $disabled={disabled}
      $color={color}
      onMouseDown={start}
      onMouseUp={stop}
      onMouseLeave={stop}
      onTouchStart={start}
      onTouchEnd={stop}
    >
      <RadialOverlay $progress={progress} />
      <div style={{ position: 'relative', zIndex: 1 }}>{children || label}</div>
    </ButtonContainer>
  )
}
