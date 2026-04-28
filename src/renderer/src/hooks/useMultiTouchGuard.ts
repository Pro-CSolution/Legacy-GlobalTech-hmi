import { useEffect } from 'react'
import { dispatchMultiTouchCancel, hasMultipleTouchContacts } from 'utils/touch'

const MOUSE_SUPPRESSION_MS = 400

const nowMs = (): number =>
  typeof performance !== 'undefined' && typeof performance.now === 'function'
    ? performance.now()
    : Date.now()

const suppressEvent = (event: Event): void => {
  if (event.cancelable) {
    event.preventDefault()
  }

  event.stopPropagation()
  event.stopImmediatePropagation()
}

export const useMultiTouchGuard = (): void => {
  useEffect(() => {
    if (typeof window === 'undefined') return

    const activeTouchPointers = new Set<number>()
    let multiTouchBlocked = false
    let suppressMouseUntil = -Infinity

    const beginBlockedSequence = (event: Event) => {
      if (!multiTouchBlocked) {
        multiTouchBlocked = true
        dispatchMultiTouchCancel()
      }

      suppressMouseUntil = nowMs() + MOUSE_SUPPRESSION_MS
      suppressEvent(event)
    }

    const resetBlockedSequence = () => {
      multiTouchBlocked = false
      activeTouchPointers.clear()
    }

    const handleTouchStartOrMove = (event: TouchEvent) => {
      if (hasMultipleTouchContacts(event)) {
        beginBlockedSequence(event)
        return
      }

      if (multiTouchBlocked) {
        beginBlockedSequence(event)
      }
    }

    const handleTouchEndOrCancel = (event: TouchEvent) => {
      if (multiTouchBlocked) {
        suppressEvent(event)
      }

      if (event.touches.length === 0) {
        resetBlockedSequence()
      }
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (event.pointerType !== 'touch') return

      activeTouchPointers.add(event.pointerId)

      if (multiTouchBlocked || activeTouchPointers.size > 1) {
        beginBlockedSequence(event)
      }
    }

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType !== 'touch') return

      if (multiTouchBlocked || activeTouchPointers.size > 1) {
        beginBlockedSequence(event)
      }
    }

    const handlePointerEnd = (event: PointerEvent) => {
      if (event.pointerType !== 'touch') return

      activeTouchPointers.delete(event.pointerId)

      if (multiTouchBlocked) {
        suppressEvent(event)
      }

      if (activeTouchPointers.size === 0) {
        resetBlockedSequence()
      }
    }

    const handleCompatMouseEvent = (event: MouseEvent) => {
      if (nowMs() < suppressMouseUntil) {
        suppressEvent(event)
      }
    }

    const handleBlur = () => {
      resetBlockedSequence()
    }

    const listenerOptions: AddEventListenerOptions = { capture: true, passive: false }
    const compatMouseOptions: AddEventListenerOptions = { capture: true }

    window.addEventListener('touchstart', handleTouchStartOrMove, listenerOptions)
    window.addEventListener('touchmove', handleTouchStartOrMove, listenerOptions)
    window.addEventListener('touchend', handleTouchEndOrCancel, listenerOptions)
    window.addEventListener('touchcancel', handleTouchEndOrCancel, listenerOptions)

    window.addEventListener('pointerdown', handlePointerDown, listenerOptions)
    window.addEventListener('pointermove', handlePointerMove, listenerOptions)
    window.addEventListener('pointerup', handlePointerEnd, listenerOptions)
    window.addEventListener('pointercancel', handlePointerEnd, listenerOptions)

    window.addEventListener('mousedown', handleCompatMouseEvent, compatMouseOptions)
    window.addEventListener('mouseup', handleCompatMouseEvent, compatMouseOptions)
    window.addEventListener('click', handleCompatMouseEvent, compatMouseOptions)
    window.addEventListener('blur', handleBlur)

    return () => {
      resetBlockedSequence()
      window.removeEventListener('touchstart', handleTouchStartOrMove, listenerOptions)
      window.removeEventListener('touchmove', handleTouchStartOrMove, listenerOptions)
      window.removeEventListener('touchend', handleTouchEndOrCancel, listenerOptions)
      window.removeEventListener('touchcancel', handleTouchEndOrCancel, listenerOptions)

      window.removeEventListener('pointerdown', handlePointerDown, listenerOptions)
      window.removeEventListener('pointermove', handlePointerMove, listenerOptions)
      window.removeEventListener('pointerup', handlePointerEnd, listenerOptions)
      window.removeEventListener('pointercancel', handlePointerEnd, listenerOptions)

      window.removeEventListener('mousedown', handleCompatMouseEvent, compatMouseOptions)
      window.removeEventListener('mouseup', handleCompatMouseEvent, compatMouseOptions)
      window.removeEventListener('click', handleCompatMouseEvent, compatMouseOptions)
      window.removeEventListener('blur', handleBlur)
    }
  }, [])
}
