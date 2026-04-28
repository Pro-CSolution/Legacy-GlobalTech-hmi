import { useEffect, useState } from 'react'
import { getSystemTimeZoneConfig, type SystemTimeZoneConfig } from 'services'

const REFRESH_INTERVAL_MS = 60_000

export const getCompactTimeZoneLabel = (label: string | null | undefined): string => {
  if (!label) return ''

  const shortCode = /\(([^)]+)\)/.exec(label)?.[1]?.trim()
  if (shortCode) return shortCode

  return label.replace(/\s+Time$/i, '').trim()
}

export const useSystemTimeZone = () => {
  const [config, setConfig] = useState<SystemTimeZoneConfig | null>(null)

  useEffect(() => {
    let cancelled = false

    const loadConfig = async () => {
      try {
        const nextConfig = await getSystemTimeZoneConfig()
        if (!cancelled) {
          setConfig(nextConfig)
        }
      } catch {
        // Keep the last known zone so clock rendering remains stable.
      }
    }

    void loadConfig()

    const intervalId = window.setInterval(() => {
      void loadConfig()
    }, REFRESH_INTERVAL_MS)
    const handleFocus = () => {
      void loadConfig()
    }

    window.addEventListener('focus', handleFocus)

    return () => {
      cancelled = true
      window.clearInterval(intervalId)
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  return {
    config,
    timeZone: config?.currentTimeZoneIanaName ?? undefined,
    timeZoneLabel: config?.currentTimeZoneLabel ?? null,
    compactTimeZoneLabel: getCompactTimeZoneLabel(config?.currentTimeZoneLabel)
  }
}
