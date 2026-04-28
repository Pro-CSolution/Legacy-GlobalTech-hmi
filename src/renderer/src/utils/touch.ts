export const MULTI_TOUCH_CANCEL_EVENT = 'hmi:multi-touch-cancel'

type TouchContactSnapshot = {
  touches: { length: number }
  changedTouches: { length: number }
}

export const hasMultipleTouchContacts = (event: TouchContactSnapshot): boolean =>
  event.touches.length > 1 || event.changedTouches.length > 1

export const isSingleTouchContact = (event: TouchContactSnapshot): boolean =>
  event.touches.length === 1 && event.changedTouches.length === 1

export const dispatchMultiTouchCancel = (): void => {
  if (typeof window === 'undefined') return

  window.dispatchEvent(new Event(MULTI_TOUCH_CANCEL_EVENT))
}
