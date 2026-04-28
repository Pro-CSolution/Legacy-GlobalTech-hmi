import {
  createContext,
  useCallback,
  useEffect,
  useRef,
  useState,
  type FC,
  type ReactNode
} from 'react'

export type TopBannerNoticeTone = 'success' | 'error'

export type TopBannerNoticeInput = {
  tone: TopBannerNoticeTone
  message: string
}

export type TopBannerNoticeState = TopBannerNoticeInput & {
  id: number
  visible: boolean
}

export interface TopBannerNoticeContextType {
  notice: TopBannerNoticeState | null
  showNotice: (notice: TopBannerNoticeInput, durationMs?: number) => void
  clearNotice: () => void
}

const NOTICE_FADE_MS = 260
const DEFAULT_NOTICE_DURATION_MS = 4000

const TopBannerNoticeContext = createContext<TopBannerNoticeContextType | null>(null)

export { TopBannerNoticeContext }

export const TopBannerNoticeProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [notice, setNotice] = useState<TopBannerNoticeState | null>(null)
  const noticeIdRef = useRef(0)
  const fadeTimerRef = useRef<number | null>(null)
  const clearTimerRef = useRef<number | null>(null)
  const frameRef = useRef<number | null>(null)

  const clearScheduledTransitions = useCallback(() => {
    if (fadeTimerRef.current !== null) {
      window.clearTimeout(fadeTimerRef.current)
      fadeTimerRef.current = null
    }

    if (clearTimerRef.current !== null) {
      window.clearTimeout(clearTimerRef.current)
      clearTimerRef.current = null
    }

    if (frameRef.current !== null) {
      window.cancelAnimationFrame(frameRef.current)
      frameRef.current = null
    }
  }, [])

  const clearNotice = useCallback(() => {
    clearScheduledTransitions()
    setNotice((current) => {
      if (!current) return null
      return {
        ...current,
        visible: false
      }
    })
    clearTimerRef.current = window.setTimeout(() => {
      setNotice(null)
      clearTimerRef.current = null
    }, NOTICE_FADE_MS)
  }, [clearScheduledTransitions])

  const showNotice = useCallback(
    (nextNotice: TopBannerNoticeInput, durationMs = DEFAULT_NOTICE_DURATION_MS) => {
      if (!nextNotice.message.trim()) {
        return
      }

      clearScheduledTransitions()
      const id = noticeIdRef.current + 1
      noticeIdRef.current = id
      const totalDurationMs = Math.max(durationMs, NOTICE_FADE_MS + 120)

      setNotice({
        id,
        tone: nextNotice.tone,
        message: nextNotice.message,
        visible: false
      })

      frameRef.current = window.requestAnimationFrame(() => {
        setNotice((current) => {
          if (!current || current.id !== id) return current
          return {
            ...current,
            visible: true
          }
        })
        frameRef.current = null
      })

      fadeTimerRef.current = window.setTimeout(() => {
        setNotice((current) => {
          if (!current || current.id !== id) return current
          return {
            ...current,
            visible: false
          }
        })
        fadeTimerRef.current = null
      }, totalDurationMs - NOTICE_FADE_MS)

      clearTimerRef.current = window.setTimeout(() => {
        setNotice((current) => (current?.id === id ? null : current))
        clearTimerRef.current = null
      }, totalDurationMs)
    },
    [clearScheduledTransitions]
  )

  useEffect(() => {
    return () => {
      clearScheduledTransitions()
    }
  }, [clearScheduledTransitions])

  return (
    <TopBannerNoticeContext.Provider value={{ notice, showNotice, clearNotice }}>
      {children}
    </TopBannerNoticeContext.Provider>
  )
}
