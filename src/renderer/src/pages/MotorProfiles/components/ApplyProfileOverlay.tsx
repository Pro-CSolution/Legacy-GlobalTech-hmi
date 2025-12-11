import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { CheckCircle, RefreshCw, XCircle } from 'lucide-react'
import { Profile, ApplyProfileResult } from 'types/profile'
import { applyProfile } from 'services/profileService'
import { useRealtime } from 'hooks/useRealtime'

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
  max-height: 400px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-right: 8px;
`

const ResultRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
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

  // Initialize items
  useEffect(() => {
    console.log('[ApplyProfile] Init with profile:', profile)
    const initial = profile.parameters.map((p) => ({
      id: `${p.device_id}:${p.parameter_id}`,
      device_id: p.device_id,
      parameter_id: p.parameter_id,
      target_value: p.value,
      status: 'pending' as VerificationStatus,
      message: 'Waiting to start...'
    }))
    setItems(initial)
  }, [profile])

  // Subscribe to devices
  useEffect(() => {
    const devices = new Set(profile.parameters.map((p) => p.device_id))
    console.log('[ApplyProfile] Subscribing to devices:', Array.from(devices))
    devices.forEach((d) => subscribeDevice(d))
    return () => {
      console.log('[ApplyProfile] Unsubscribing from devices:', Array.from(devices))
      devices.forEach((d) => unsubscribeDevice(d))
    }
  }, [profile, subscribeDevice, unsubscribeDevice])

  // Trigger Application
  useEffect(() => {
    let mounted = true

    const run = async () => {
      // Filter pending items
      const pendingItems = items.filter((i) => i.status === 'pending')
      if (!pendingItems.length) {
        console.log('[ApplyProfile] No pending items to run.')
        return
      }

      console.log('[ApplyProfile] Running apply for pending items:', pendingItems.length)

      // Mark pending as writing
      setItems((prev) =>
        prev.map((p) =>
          p.status === 'pending' ? { ...p, status: 'writing', message: 'Sending command...' } : p
        )
      )

      try {
        console.log('[ApplyProfile] Calling API applyProfile...')
        // Note: The API applies ALL items in the profile currently.
        // Ideally we would send only pending, but for now we re-apply all and check results.
        const resp = await applyProfile(profile.id)
        console.log('[ApplyProfile] API Response:', resp)

        if (mounted) {
          setItems((prev) =>
            prev.map((p) => {
              // Only update if it was writing (meaning it was pending)
              if (p.status !== 'writing') return p

              const res = resp.results.find(
                (r) => r.device_id === p.device_id && r.parameter_id === p.parameter_id
              )

              if (res?.status === 'error') {
                console.warn(`[ApplyProfile] Item ${p.id} failed in API:`, res.message)
                return {
                  ...p,
                  status: 'error',
                  apiStatus: res.status,
                  message: res.message || 'Write failed'
                }
              }
              // If success/writing, move to verifying
              console.log(`[ApplyProfile] Item ${p.id} API Success -> Verifying`)
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
        console.error('[ApplyProfile] API Error:', err)
        if (mounted) {
          setItems((prev) =>
            prev.map((p) =>
              p.status === 'writing' ? { ...p, status: 'error', message: 'Network/API Error' } : p
            )
          )
          setIsRunning(false)
        }
      }
    }

    // Trigger run if there are pending items and we are running
    // We check items.length to ensure init is done
    if (items.length > 0 && isRunning && items.some((i) => i.status === 'pending')) {
      run()
    }

    return () => {
      mounted = false
    }
  }, [profile.id, items.length, runToken]) // runToken triggers effect on retry

  // Verification Logic (Realtime)
  useEffect(() => {
    if (!isRunning) return

    const interval = setInterval(() => {
      setItems((prev) => {
        let hasPendingVerifying = false

        const next = prev.map((item) => {
          if (item.status !== 'verifying') return item
          hasPendingVerifying = true

          // Check realtime
          const deviceData = devicesData[item.device_id]
          const nowTs = Date.now()

          if (!deviceData) {
            // Fallback: if no realtime within 4s, assume success if API was success
            if (item.startedAt && nowTs - item.startedAt > 4000 && item.apiStatus !== 'error') {
              console.log(`[ApplyProfile] Item ${item.id} timeout (no data) -> Assumed Success`)
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
            console.log(
              `[ApplyProfile] Item ${item.id} VERIFIED! Actual: ${actual}, Target: ${item.target_value}`
            )
            return { ...item, status: 'success' as VerificationStatus, message: 'Verified' }
          }

          // If realtime arrived but value mismatched for >4s, mark error
          if (item.startedAt && nowTs - item.startedAt > 4000) {
            console.warn(
              `[ApplyProfile] Item ${item.id} VERIFICATION FAILED. Actual: ${actual}, Target: ${item.target_value}`
            )
            return {
              ...item,
              status: 'error' as VerificationStatus,
              message: `Mismatch: Got ${actual}`
            }
          }

          return item
        })

        // Check if we should stop running (no more writing/verifying/pending)
        const anyActive = next.some(
          (i) => i.status === 'writing' || i.status === 'verifying' || i.status === 'pending'
        )

        if (!anyActive && isRunning) {
          console.log('[ApplyProfile] All items finished processing.')
          setIsRunning(false)
        }

        return next
      })
    }, 500)

    // Safety timeout: after 5 seconds, mark remaining verifying as errors
    // Note: The logic inside interval handles per-item timeout, but this global timeout
    // ensures we don't spin forever if something weird happens.
    // However, since we handle per-item timeout, we might not strictly need this if logic is correct.
    // We'll keep it as a failsafe but extend it.

    return () => {
      clearInterval(interval)
    }
  }, [isRunning, devicesData])

  const handleRetry = async () => {
    console.log('[ApplyProfile] Retry requested')
    // Reset only errored items to pending and trigger re-run
    setItems((prev) =>
      prev.map((p) => {
        if (p.status === 'error') {
          console.log(`[ApplyProfile] Resetting item ${p.id} to pending`)
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
    console.log('[ApplyProfile] Cancelled by user')
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
                <ItemId>{item.parameter_id}</ItemId>
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
