import { useSyncExternalStore } from 'react'

export type ReportSendKind = 'video' | 'trend'
export type ReportSendState = {
  status: 'idle' | 'sending' | 'success' | 'error'
  kind: ReportSendKind | null
  message: string | null
}

let state: ReportSendState = {
  status: 'idle',
  kind: null,
  message: null
}

const listeners = new Set<() => void>()
let autoClearTimer: ReturnType<typeof setTimeout> | null = null

const emitChange = () => {
  listeners.forEach((l) => l())
}

const setState = (partial: Partial<ReportSendState>) => {
  state = { ...state, ...partial }
  emitChange()
}

const clearAuto = () => {
  if (autoClearTimer) {
    clearTimeout(autoClearTimer)
    autoClearTimer = null
  }
}

const scheduleAutoClear = () => {
  clearAuto()
  autoClearTimer = setTimeout(() => {
    setState({ status: 'idle', kind: null, message: null })
  }, 6000)
}

export const reportSendManager = {
  start(kind: ReportSendKind) {
    clearAuto()
    setState({ status: 'sending', kind, message: null })
  },
  success(message: string) {
    setState({ status: 'success', message })
    scheduleAutoClear()
  },
  error(message: string) {
    setState({ status: 'error', message })
    scheduleAutoClear()
  },
  reset() {
    clearAuto()
    setState({ status: 'idle', kind: null, message: null })
  }
}

export async function runReportSend<T>(kind: ReportSendKind, fn: () => Promise<T>): Promise<T> {
  reportSendManager.start(kind)
  try {
    const res = await fn()
    reportSendManager.success(
      kind === 'video' ? 'Video queued for sending' : 'Report queued for sending'
    )
    return res
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error sending'
    reportSendManager.error(msg)
    throw err
  }
}

export const useReportSendStatus = () => {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    () => state,
    () => state
  )
}
