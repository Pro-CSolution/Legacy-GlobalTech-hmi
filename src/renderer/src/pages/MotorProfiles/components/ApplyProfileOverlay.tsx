import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { CheckCircle, RefreshCw, XCircle } from 'lucide-react'
import { Profile, ApplyProfileResult } from 'types/profile'
import { applyProfile } from 'services/profileService'
import { useRealtime } from 'hooks/useRealtime'
import { getDriveParameters } from 'services/driveService'

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(17, 25, 39, 0.95);
  z-index: 200;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`

const Container = styled.div`
  width: 800px;
  max-width: 90%;
  background: ${({ theme }) => theme.colors.background.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
`

const Header = styled.div`
  text-align: center;
`

const Title = styled.h2`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.sizes.xxl};
  color: ${({ theme }) => theme.colors.text.primary};
`

const Subtitle = styled.p`
  margin: 8px 0 0;
  color: ${({ theme }) => theme.colors.text.secondary};
`

const ResultsList = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  padding-right: 8px;
`

const ResultRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  min-height: 96px;
  background: ${({ theme }) => theme.colors.background.tertiary};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
`

const ItemInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`

const ItemId = styled.span`
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  color: ${({ theme }) => theme.colors.text.primary};
`

const ItemSub = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`

const ItemMsg = styled.span<{ $error?: boolean }>`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme, $error }) =>
    $error ? theme.colors.status.alarm : theme.colors.text.secondary};
`

const StatusIcon = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 16px;
`

const Button = styled.button<{ $primary?: boolean }>`
  padding: 12px 24px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid
    ${({ theme, $primary }) => ($primary ? 'transparent' : theme.colors.borders.primary)};
  background: ${({ theme, $primary }) => ($primary ? theme.colors.accent.primary : 'transparent')};
  color: ${({ theme, $primary }) =>
    $primary ? theme.colors.text.inverse : theme.colors.text.primary};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

interface ApplyProfileOverlayProps {
  profile: Profile
  onClose: () => void
  onCancel?: () => void
}

type VerificationStatus = 'pending' | 'writing' | 'verifying' | 'success' | 'error'

interface ItemState {
  id: string // device:param
  device_id: string
  parameter_id: string
  target_value: string | number | boolean
  status: VerificationStatus
  message?: string
  apiStatus?: ApplyProfileResult['status']
  startedAt?: number
}

export const ApplyProfileOverlay: React.FC<ApplyProfileOverlayProps> = ({
  profile,
  onClose,
  onCancel
}) => {
  const [items, setItems] = useState<ItemState[]>([])
  const [isRunning, setIsRunning] = useState(true)
  const [runToken, setRunToken] = useState(0) // used to trigger re-run on retry
  const { devicesData, subscribeDevice, unsubscribeDevice } = useRealtime()
  const devicesDataRef = useRef(devicesData)
  const [paramMeta, setParamMeta] = useState<Record<string, { name?: string }>>({})
  const initRef = useRef<number | null>(null)
  const subRef = useRef<number | null>(null)
  const itemsRef = useRef<ItemState[]>([])

  // Keep latest realtime snapshot in a ref so verification timers don't get reset by frequent updates.
  useEffect(() => {
    devicesDataRef.current = devicesData
  }, [devicesData])

  // Helper to update state and ref synchronously to avoid stale closures in async/intervals
  const setItemsSync = (updater: (prev: ItemState[]) => ItemState[]) => {
    setItems((prev) => {
      const next = updater(prev)
      itemsRef.current = next
      return next
    })
  }

  // Initialize items
  useEffect(() => {
    if (initRef.current === profile.id) return
    initRef.current = profile.id
    const initial = profile.parameters.map((p) => ({
      id: `${p.device_id}:${p.parameter_id}`,
      device_id: p.device_id,
      parameter_id: p.parameter_id,
      target_value: p.value,
      status: 'pending' as VerificationStatus,
      message: 'Waiting to start...'
    }))
    itemsRef.current = initial
    setItems(initial)
  }, [profile])

  // Load parameter metadata (name) for display
  useEffect(() => {
    const loadMeta = async () => {
      const unique = Array.from(new Set(items.map((i) => `${i.device_id}:${i.parameter_id}`)))
      const promises = unique.map(async (key) => {
        const [device_id, parameter_id] = key.split(':')
        try {
          const resp = await getDriveParameters({
            deviceId: device_id,
            search: parameter_id,
            pageSize: 1
          })
          const found = resp.items?.[0]
          if (found) {
            return [key, { name: found.name }]
          }
        } catch (err) {
          // fetch failed
        }
        return [key, {}]
      })
      const entries = await Promise.all(promises)
      setParamMeta((prev) => {
        const next = { ...prev }
        entries.forEach(([k, v]) => {
          next[k as string] = v as { name?: string }
        })
        return next
      })
    }
    if (items.length) {
      void loadMeta()
    }
  }, [items])

  // Subscribe to devices
  useEffect(() => {
    if (subRef.current === profile.id) return
    subRef.current = profile.id
    const devices = new Set(profile.parameters.map((p) => p.device_id))
    devices.forEach((d) => subscribeDevice(d))
    return () => {
      devices.forEach((d) => unsubscribeDevice(d))
    }
  }, [profile, subscribeDevice, unsubscribeDevice])

  // Trigger Application
  useEffect(() => {
    let mounted = true

    const run = async () => {
      const pending = itemsRef.current.filter((i) => i.status === 'pending')
      if (!pending.length) {
        return
      }

      // Mark pending as writing
      setItemsSync((prev) =>
        prev.map((p) =>
          p.status === 'pending' ? { ...p, status: 'writing', message: 'Sending command...' } : p
        )
      )

      try {
        // Note: The API applies ALL items in the profile currently.
        const resp = await applyProfile(profile.id)

        if (mounted) {
          setItemsSync((prev) =>
            prev.map((p) => {
              // Only update if it was writing (meaning it was pending)
              if (p.status !== 'writing') return p

              const res = resp.results.find(
                (r) => r.device_id === p.device_id && r.parameter_id === p.parameter_id
              )

              if (res?.status === 'error') {
                return {
                  ...p,
                  status: 'error',
                  apiStatus: res.status,
                  message: res.message || 'Write failed'
                }
              }
              return {
                ...p,
                status: 'verifying',
                apiStatus: res?.status || 'success',
                message: 'Verifying value...',
                startedAt: Date.now()
              }
            })
          )
        }
      } catch (err) {
        /* swallow API error here; UI will show Network/API Error */
        if (mounted) {
          setItemsSync((prev) =>
            prev.map((p) =>
              p.status === 'writing' ? { ...p, status: 'error', message: 'Network/API Error' } : p
            )
          )
          setIsRunning(false)
        }
      }
    }

    const pendingCount = itemsRef.current.filter((i) => i.status === 'pending').length

    if (isRunning && items.length > 0 && pendingCount > 0) {
      run()
    }

    return () => {
      mounted = false
    }
  }, [profile.id, isRunning, runToken, items.length])

  // Verification Logic (Realtime)
  useEffect(() => {
    if (!isRunning) return

    const interval = setInterval(() => {
      // Use ref to get latest state inside interval
      const currentItems = itemsRef.current
      let changes = false

      const nextItems = currentItems.map((item) => {
        if (item.status !== 'verifying') {
          return item
        }

        // Check realtime
        const deviceData = devicesDataRef.current[item.device_id]
        const nowTs = Date.now()

        if (!deviceData) {
          // Fallback: if no realtime within 4s, assume success if API was success
          if (item.startedAt && nowTs - item.startedAt > 4000 && item.apiStatus !== 'error') {
            changes = true
            return {
              ...item,
              status: 'success' as VerificationStatus,
              message: 'Assumed success (no realtime update)'
            }
          }
          return item // Wait for data
        }

        const actual = deviceData[item.parameter_id]

        // Loose equality check
        if (actual == item.target_value) {
          changes = true
          return { ...item, status: 'success' as VerificationStatus, message: 'Verified' }
        }

        // If realtime arrived but value mismatched for >4s, mark error
        if (item.startedAt && nowTs - item.startedAt > 4000) {
          changes = true
          return {
            ...item,
            status: 'error' as VerificationStatus,
            message: `Mismatch: Got ${actual}`
          }
        }

        return item
      })

      if (changes) {
        setItemsSync(() => nextItems)
      }

      // Check if we should stop running (no more writing/verifying/pending)
      // Recalculate active based on nextItems
      const stillActive = nextItems.some(
        (i) => i.status === 'writing' || i.status === 'verifying' || i.status === 'pending'
      )

      if (!stillActive && isRunning) {
        setIsRunning(false)
      }
    }, 500)

    return () => {
      clearInterval(interval)
    }
  }, [isRunning, profile.id])

  const handleRetry = async () => {
    // Reset only errored items to pending and trigger re-run
    setItemsSync((prev) =>
      prev.map((p) => {
        if (p.status === 'error') {
          return {
            ...p,
            status: 'pending',
            apiStatus: undefined,
            message: 'Retrying...',
            startedAt: undefined
          }
        }
        return p
      })
    )
    setIsRunning(true)
    setRunToken((x) => x + 1)
  }

  const completed = !isRunning
  const successCount = items.filter((i) => i.status === 'success').length
  const errorCount = items.filter((i) => i.status === 'error').length

  const handleCancel = () => {
    setIsRunning(false)
    onCancel?.()
  }

  return (
    <Overlay>
      <Container>
        <Header>
          <Title>Applying Profile: {profile.name}</Title>
          <Subtitle>
            {completed
              ? `Completed. Success: ${successCount}, Errors: ${errorCount}`
              : 'Writing parameters to devices...'}
          </Subtitle>
        </Header>

        <ResultsList>
          {items.map((item) => (
            <ResultRow key={item.id}>
              <ItemInfo>
                <ItemId>{paramMeta[item.id]?.name || item.parameter_id}</ItemId>
                <ItemSub>ID: {item.parameter_id}</ItemSub>
                <ItemSub>Value: {String(item.target_value)}</ItemSub>
                <ItemMsg $error={item.status === 'error'}>{item.message}</ItemMsg>
              </ItemInfo>
              <StatusIcon>
                {item.status === 'success' && <CheckCircle color="#10b981" />}
                {item.status === 'error' && <XCircle color="#ef4444" />}
                {(item.status === 'writing' || item.status === 'verifying') && (
                  <RefreshCw className="spin" size={20} />
                )}
                {item.status === 'pending' && <span style={{ color: '#64748b' }}>-</span>}
              </StatusIcon>
            </ResultRow>
          ))}
        </ResultsList>

        <Actions>
          {!completed && <Button onClick={handleCancel}>Cancel</Button>}
          {completed && errorCount > 0 && (
            <Button onClick={handleRetry} style={{ borderColor: '#f59e0b', color: '#f59e0b' }}>
              <RefreshCw size={18} /> Retry Failed
            </Button>
          )}
          <Button $primary onClick={onClose} disabled={!completed}>
            {completed ? 'Close' : 'Processing...'}
          </Button>
        </Actions>
      </Container>
    </Overlay>
  )
}
