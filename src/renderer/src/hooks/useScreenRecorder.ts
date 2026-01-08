import { useCallback, useSyncExternalStore } from 'react'

type ScreenRecorderState = {
  isRecording: boolean
  recordedBlob: Blob | null
  elapsedSeconds: number
  maxDurationReached: boolean
}

let state: ScreenRecorderState = {
  isRecording: false,
  recordedBlob: null,
  elapsedSeconds: 0,
  maxDurationReached: false
}

const listeners = new Set<() => void>()

const emitChange = () => {
  listeners.forEach((l) => l())
}

const setState = (partial: Partial<ScreenRecorderState>) => {
  state = { ...state, ...partial }
  emitChange()
}

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

const getSnapshot = () => state

let mediaRecorder: MediaRecorder | null = null
let streamRef: MediaStream | null = null
let chunks: Blob[] = []
let timerInterval: ReturnType<typeof setInterval> | null = null
// Adjusted to leave margin for base64 overhead (≈ +33%) and stay below Resend's limit.
// Based on measurement: 8:59 -> 35.3MiB. Goal: ~28MiB => ~7:08. Rounded to 7:10.
const MAX_DURATION_SECONDS = 7 * 60 + 10 // 7 minutes 10 seconds

const startTimer = () => {
  if (timerInterval) clearInterval(timerInterval)

  // Reset time but keep other state
  setState({ elapsedSeconds: 0, maxDurationReached: false })

  timerInterval = setInterval(() => {
    if (!state.isRecording) {
      stopTimer()
      return
    }

    const newElapsed = state.elapsedSeconds + 1
    if (newElapsed >= MAX_DURATION_SECONDS) {
      stopTimer()
      setState({ elapsedSeconds: newElapsed, maxDurationReached: true })
      stopRecordingImpl()
    } else {
      setState({ elapsedSeconds: newElapsed })
    }
  }, 1000)
}

const stopTimer = () => {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
}

const startRecordingImpl = async () => {
  if (state.isRecording) return

  try {
    const sourceId = await window.api.getScreenSourceId()
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        mandatory: {
          chromeMediaSource: 'desktop',
          chromeMediaSourceId: sourceId,
          minWidth: 1280,
          maxWidth: 1920,
          minHeight: 720,
          maxHeight: 1080,
          minFrameRate: 15,
          maxFrameRate: 15
        }
      } as unknown as MediaTrackConstraints
    })

    // Prefer VP9 for better compression, fallback to standard webm
    let options: MediaRecorderOptions = { mimeType: 'video/webm; codecs=vp9' }
    if (!MediaRecorder.isTypeSupported(options.mimeType || '')) {
      options = { mimeType: 'video/webm' }
    }

    streamRef = stream
    chunks = []

    const mr = new MediaRecorder(stream, {
      ...options,
      // Revert to original target (better quality / fewer artifacts).
      videoBitsPerSecond: 1000000 // 1 Mbps
    })

    mr.ondataavailable = (event) => {
      if (event.data.size > 0) chunks.push(event.data)
    }

    mr.onstop = async () => {
      const blob = new Blob(chunks, { type: 'video/webm' })
      setState({ isRecording: false, recordedBlob: blob })

      // Stop all tracks to release screen resource
      if (streamRef) {
        streamRef.getTracks().forEach((track) => track.stop())
      }

      chunks = []
      streamRef = null
      mediaRecorder = null
    }

    mediaRecorder = mr
    mr.start()
    startTimer()
    setState({ isRecording: true, recordedBlob: null, maxDurationReached: false })
  } catch (error) {
    console.error('Error starting recording:', error)
    setState({ isRecording: false })
  }
}

const stopRecordingImpl = () => {
  stopTimer()
  if (!mediaRecorder || mediaRecorder.state === 'inactive') return
  try {
    mediaRecorder.stop()
  } finally {
    setState({ isRecording: false })
  }
}

const clearRecordingImpl = () => {
  setState({ recordedBlob: null, elapsedSeconds: 0, maxDurationReached: false })
}

const saveRecordingImpl = async (blob: Blob) => {
  const buffer = await blob.arrayBuffer()
  return await window.api.saveVideo(buffer)
}

export const useScreenRecorder = () => {
  const { isRecording, recordedBlob, elapsedSeconds, maxDurationReached } = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getSnapshot
  )

  const startRecording = useCallback(async () => {
    await startRecordingImpl()
  }, [])

  const stopRecording = useCallback(() => {
    stopRecordingImpl()
  }, [])

  const clearRecording = useCallback(() => {
    clearRecordingImpl()
  }, [])

  const saveRecording = useCallback(async (blob: Blob) => {
    return await saveRecordingImpl(blob)
  }, [])

  return {
    isRecording,
    recordedBlob,
    elapsedSeconds,
    maxDurationReached,
    maxDuration: MAX_DURATION_SECONDS,
    startRecording,
    stopRecording,
    clearRecording,
    saveRecording
  }
}
