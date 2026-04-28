import { useEffect, useState } from 'react'
import { Clock3, X } from 'lucide-react'
import { ModalBase } from 'components/Modal'
import { useCurrentTime } from 'hooks'
import { getSystemTimeZoneConfig, updateSystemTimeZone, type SystemTimeZoneConfig } from 'services'
import * as S from './TimeZoneModal.styles'

type TimeZoneModalProps = {
  isOpen: boolean
  onClose: () => void
  onSaved?: (config: SystemTimeZoneConfig) => void
}

const getErrorMessage = (error: unknown, fallback: string): string => {
  const maybeAxios = error as {
    message?: string
    response?: { status?: number; data?: { detail?: unknown } }
  }

  const detail = maybeAxios.response?.data?.detail
  const message =
    typeof detail === 'string'
      ? detail
      : typeof maybeAxios.message === 'string'
        ? maybeAxios.message
        : fallback

  return maybeAxios.response?.status ? `HTTP ${maybeAxios.response.status} - ${message}` : message
}

const formatZoneTime = (date: Date, timeZone: string): string => {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone
  })
}

const formatZoneDate = (date: Date, timeZone: string): string => {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone
  })
}

export const TimeZoneModal = ({ isOpen, onClose, onSaved }: TimeZoneModalProps) => {
  const [timeZoneConfig, setTimeZoneConfig] = useState<SystemTimeZoneConfig | null>(null)
  const [selectedTimeZoneId, setSelectedTimeZoneId] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const currentTime = useCurrentTime()

  useEffect(() => {
    if (!isOpen) {
      setError(null)
      return
    }

    let cancelled = false

    setLoading(true)
    setSaving(false)
    setError(null)

    void getSystemTimeZoneConfig()
      .then((config) => {
        if (cancelled) return

        setTimeZoneConfig(config)
        setSelectedTimeZoneId(
          config.currentTimeZoneSupported
            ? config.currentTimeZoneId
            : (config.supportedTimeZones[0]?.id ?? '')
        )

        if (!config.currentTimeZoneSupported && config.currentTimeZoneId) {
          setError(
            `Current system zone "${config.currentTimeZoneId}" is outside the supported list. Select one of the four U.S. zones and save it.`
          )
        }
      })
      .catch((fetchError: unknown) => {
        if (cancelled) return

        setTimeZoneConfig(null)
        setSelectedTimeZoneId('')
        setError(getErrorMessage(fetchError, 'Failed to load the current system time zone.'))
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [isOpen])

  const handleClose = () => {
    if (saving) return
    onClose()
  }

  const selectedTimeZone =
    timeZoneConfig?.supportedTimeZones.find((zone) => zone.id === selectedTimeZoneId) ?? null
  const currentTimeZoneId = timeZoneConfig?.currentTimeZoneId ?? ''
  const currentTimeZoneSupported = timeZoneConfig?.currentTimeZoneSupported ?? false

  const canSave =
    Boolean(selectedTimeZone) &&
    timeZoneConfig !== null &&
    !loading &&
    !saving &&
    (!currentTimeZoneSupported || selectedTimeZoneId !== currentTimeZoneId)

  const handleSave = () => {
    if (!selectedTimeZone) {
      setError('Select one of the supported U.S. time zones before saving.')
      return
    }

    setSaving(true)
    setError(null)

    void updateSystemTimeZone(selectedTimeZone.id)
      .then((config) => {
        setTimeZoneConfig(config)
        setSelectedTimeZoneId(config.currentTimeZoneId)
        onSaved?.(config)
        onClose()
      })
      .catch((saveError: unknown) => {
        setError(getErrorMessage(saveError, 'Failed to update the system time zone.'))
      })
      .finally(() => {
        setSaving(false)
      })
  }

  return (
    <ModalBase
      isOpen={isOpen}
      onRequestClose={handleClose}
      width={760}
      ariaLabel="Time zone configuration"
    >
      <S.Body>
        <S.Header>
          <S.TitleGroup>
            <S.TitleRow>
              <Clock3 size={18} />
              <S.Title>Time Zone</S.Title>
            </S.TitleRow>
            <S.Subtitle>
              Change the system hour by selecting one of the four supported U.S. time zones.
            </S.Subtitle>
          </S.TitleGroup>
          <S.CloseButton onClick={handleClose} aria-label="Close" disabled={saving}>
            <X size={20} />
          </S.CloseButton>
        </S.Header>

        <S.Content>
          {loading ? (
            <S.EmptyState>Loading time zone configuration...</S.EmptyState>
          ) : !timeZoneConfig ? (
            <S.StatusBanner $tone="error">
              Time zone configuration is currently unavailable.
            </S.StatusBanner>
          ) : (
            <>
              <S.SummaryGrid>
                <S.SummaryCard>
                  <S.SummaryLabel>System Time</S.SummaryLabel>
                  <S.SummaryValue>
                    {currentTime.toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                      hour12: false
                    })}
                  </S.SummaryValue>
                  <S.SummaryMeta>
                    {currentTime.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </S.SummaryMeta>
                </S.SummaryCard>

                <S.SummaryCard>
                  <S.SummaryLabel>Current Zone</S.SummaryLabel>
                  <S.SummaryValue>{timeZoneConfig.currentTimeZoneLabel}</S.SummaryValue>
                  <S.SummaryMeta>{timeZoneConfig.currentTimeZoneId}</S.SummaryMeta>
                </S.SummaryCard>
              </S.SummaryGrid>

              <S.OptionsGrid>
                {timeZoneConfig.supportedTimeZones.map((zone) => (
                  <S.OptionButton
                    key={zone.id}
                    type="button"
                    $selected={zone.id === selectedTimeZoneId}
                    onClick={() => {
                      setSelectedTimeZoneId(zone.id)
                      if (error && !error.includes('outside the supported list')) {
                        setError(null)
                      }
                    }}
                    disabled={saving}
                  >
                    <S.OptionLabel>{zone.label}</S.OptionLabel>
                    <S.OptionTime>{formatZoneTime(currentTime, zone.ianaName)}</S.OptionTime>
                    <S.OptionMeta>{formatZoneDate(currentTime, zone.ianaName)}</S.OptionMeta>
                  </S.OptionButton>
                ))}
              </S.OptionsGrid>

              <S.Hint>
                Only the four U.S. time zones are available here. Manual hour editing stays
                disabled.
              </S.Hint>
            </>
          )}

          {error && <S.StatusBanner $tone="error">{error}</S.StatusBanner>}
        </S.Content>

        <S.Footer>
          <S.Button onClick={handleClose} disabled={saving}>
            Cancel
          </S.Button>
          <S.Button $primary onClick={handleSave} disabled={!canSave}>
            {saving ? 'Saving...' : 'Save'}
          </S.Button>
        </S.Footer>
      </S.Body>
    </ModalBase>
  )
}
