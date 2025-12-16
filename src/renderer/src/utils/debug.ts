export const HMI_DEBUG_STORAGE_KEY = 'hmi_debug'

const nowMs = (): number =>
  typeof performance !== 'undefined' && typeof performance.now === 'function'
    ? performance.now()
    : Date.now()

const parseNamespaces = (raw: string): string[] =>
  raw
    .split(/[,\s]+/g)
    .map((s) => s.trim())
    .filter(Boolean)

const readDebugRaw = (): string | null => {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage.getItem(HMI_DEBUG_STORAGE_KEY)
  } catch {
    return null
  }
}

/**
 * Enable by setting localStorage:
 *   localStorage.setItem('hmi_debug', 'trend')                 // enables trend.* namespaces
 *   localStorage.setItem('hmi_debug', 'trend.tooltip')         // enables tooltip-specific logs
 *   localStorage.setItem('hmi_debug', 'trend,scale')           // enables trend.* and scale.*
 *   localStorage.setItem('hmi_debug', '*')                     // enables everything
 */
export const isDebugEnabled = (namespace: string): boolean => {
  const raw = readDebugRaw()
  if (!raw) return false

  const tokens = parseNamespaces(raw)
  if (!tokens.length) return false

  for (const token of tokens) {
    if (token === '*') return true
    if (token === namespace) return true
    // Allow prefix enabling: "trend" enables "trend.*"
    if (namespace.startsWith(`${token}.`)) return true
    // Allow wildcard prefix: "trend*" enables "trend..." (including trend, trend.x, etc)
    if (token.endsWith('*')) {
      const prefix = token.slice(0, -1)
      if (prefix && namespace.startsWith(prefix)) return true
    }
  }

  return false
}

export const debugLog = (namespace: string, ...args: unknown[]): void => {
  if (!isDebugEnabled(namespace)) return

  console.debug(`[${namespace}]`, ...args)
}

export const debugWarn = (namespace: string, ...args: unknown[]): void => {
  if (!isDebugEnabled(namespace)) return

  console.warn(`[${namespace}]`, ...args)
}

export const debugError = (namespace: string, ...args: unknown[]): void => {
  if (!isDebugEnabled(namespace)) return

  console.error(`[${namespace}]`, ...args)
}

export const createThrottle = (intervalMs: number): (() => boolean) => {
  let last = -Infinity
  return () => {
    const t = nowMs()
    if (t - last < intervalMs) return false
    last = t
    return true
  }
}

export const createKeyedThrottle = (intervalMs: number): ((key: string) => boolean) => {
  const lastByKey = new Map<string, number>()
  return (key: string) => {
    const t = nowMs()
    const last = lastByKey.get(key) ?? -Infinity
    if (t - last < intervalMs) return false
    lastByKey.set(key, t)
    return true
  }
}
