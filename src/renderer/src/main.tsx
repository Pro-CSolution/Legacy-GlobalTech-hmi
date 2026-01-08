import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

const logToMain = (level: 'INFO' | 'WARN' | 'ERROR', message: string, meta?: unknown) => {
  try {
    window.api?.log?.(level, message, meta)
  } catch {
    // ignore
  }
}

// Capture renderer runtime errors to the main-process log file (useful in production without DevTools)
window.addEventListener('error', (event) => {
  logToMain('ERROR', 'window.error', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    stack: (event.error as Error | undefined)?.stack
  })
})

window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason
  logToMain('ERROR', 'window.unhandledrejection', {
    reason:
      reason instanceof Error
        ? { name: reason.name, message: reason.message, stack: reason.stack }
        : typeof reason === 'string'
          ? reason
          : String(reason)
  })
})

// Help pinpoint styled-components class explosion (a common source of renderer OOM)
const originalWarn = console.warn.bind(console)
console.warn = (...args: unknown[]) => {
  originalWarn(...args)
  try {
    const first = args[0]
    if (typeof first === 'string' && first.includes('Over 200 classes were generated')) {
      const stack = new Error('styled-components warning').stack
      originalWarn('styled-components warning stack:', stack)
      logToMain('WARN', first, { stack })
    }
  } catch {
    // ignore
  }
}

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <App />
  </StrictMode>
)
