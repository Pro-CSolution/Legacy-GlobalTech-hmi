import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Network, X } from 'lucide-react'
import { ModalBase } from 'components/Modal'
import { VirtualKeyboard, type KeyboardMode } from 'components/VirtualKeyboard'
import { type MotorControlMode } from 'hooks'
import {
  getDeviceNetworkConfigs,
  updateDeviceNetworkConfig,
  type DeviceNetworkConfig
} from 'services'
import { getMotorScopeForDeviceId, getMotorScopeLabel, type MotorScope } from 'utils/motorDeviceMapping'
import * as S from './DeviceConfigModal.styles'

type DeviceConfigModalProps = {
  isOpen: boolean
  motorControlMode: MotorControlMode
  onClose: () => void
  onSaved?: (device: DeviceNetworkConfig) => void
}

type DraftState = {
  host: string
  port: string
  name: string
}

type KeyboardTarget = 'host' | 'port' | 'name' | null

type KeyboardState = {
  visible: boolean
  target: KeyboardTarget
  label: string
  initialValue: string
  mode: KeyboardMode
}

const EMPTY_DRAFT: DraftState = {
  host: '',
  port: '',
  name: ''
}

const CLOSED_KEYBOARD: KeyboardState = {
  visible: false,
  target: null,
  label: '',
  initialValue: '',
  mode: 'alpha'
}

const buildDraft = (device: DeviceNetworkConfig): DraftState => ({
  host: device.host,
  port: String(device.port),
  name: device.name
})

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

  return maybeAxios.response?.status ? `HTTP ${maybeAxios.response.status} · ${message}` : message
}

export const DeviceConfigModal = ({
  isOpen,
  motorControlMode,
  onClose,
  onSaved
}: DeviceConfigModalProps) => {
  const [devices, setDevices] = useState<DeviceNetworkConfig[]>([])
  const [selectedMotorScope, setSelectedMotorScope] = useState<MotorScope>(1)
  const [selectedDeviceId, setSelectedDeviceId] = useState('')
  const [draft, setDraft] = useState<DraftState>(EMPTY_DRAFT)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [keyboard, setKeyboard] = useState<KeyboardState>(CLOSED_KEYBOARD)
  const selectedDeviceIdsRef = useRef<Record<MotorScope, string>>({ 1: '', 2: '' })
  const isDualMotorMode = motorControlMode === 'dual'
  const activeMotorScope: MotorScope = isDualMotorMode ? selectedMotorScope : 1
  const activeMotorLabel = getMotorScopeLabel(activeMotorScope)

  const getDevicesForScope = useCallback(
    (scope: MotorScope, sourceDevices: DeviceNetworkConfig[]): DeviceNetworkConfig[] => {
      if (!isDualMotorMode) {
        return sourceDevices.filter((device) => getMotorScopeForDeviceId(device.id) !== 2)
      }

      return sourceDevices.filter((device) => getMotorScopeForDeviceId(device.id) === scope)
    },
    [isDualMotorMode]
  )

  const syncScopeSelection = useCallback(
    (scope: MotorScope, sourceDevices: DeviceNetworkConfig[]) => {
      const scopedDevices = getDevicesForScope(scope, sourceDevices)

      if (scopedDevices.length === 0) {
        selectedDeviceIdsRef.current[scope] = ''
        setSelectedDeviceId('')
        setDraft(EMPTY_DRAFT)
        return
      }

      const preferredDeviceId = selectedDeviceIdsRef.current[scope]
      const selected =
        scopedDevices.find((device) => device.id === preferredDeviceId) ?? scopedDevices[0]

      selectedDeviceIdsRef.current[scope] = selected.id
      setSelectedDeviceId(selected.id)
      setDraft(buildDraft(selected))
    },
    [getDevicesForScope]
  )

  const availableDevices = useMemo(
    () => getDevicesForScope(activeMotorScope, devices),
    [activeMotorScope, devices, getDevicesForScope]
  )

  useEffect(() => {
    if (!isOpen) {
      setKeyboard(CLOSED_KEYBOARD)
      setSelectedMotorScope(1)
      return
    }

    let cancelled = false

    setLoading(true)
    setSaving(false)
    setError(null)
    setKeyboard(CLOSED_KEYBOARD)
    setSelectedMotorScope(1)

    void getDeviceNetworkConfigs()
      .then((result) => {
        if (cancelled) return

        const nextDevices = result
          .slice()
          .sort((a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id))

        setDevices(nextDevices)

        if (nextDevices.length === 0) {
          setSelectedDeviceId('')
          selectedDeviceIdsRef.current = { 1: '', 2: '' }
          setDraft(EMPTY_DRAFT)
          return
        }

        syncScopeSelection(1, nextDevices)
      })
      .catch((fetchError: unknown) => {
        if (cancelled) return

        setDevices([])
        setSelectedDeviceId('')
        selectedDeviceIdsRef.current = { 1: '', 2: '' }
        setDraft(EMPTY_DRAFT)
        setError(getErrorMessage(fetchError, 'Failed to load device configuration.'))
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [isOpen, syncScopeSelection])

  const handleClose = () => {
    if (saving) return
    setKeyboard(CLOSED_KEYBOARD)
    onClose()
  }

  const handleDeviceChange = (nextDeviceId: string) => {
    setSelectedDeviceId(nextDeviceId)
    selectedDeviceIdsRef.current[activeMotorScope] = nextDeviceId
    setError(null)

    const device = availableDevices.find((item) => item.id === nextDeviceId)
    if (!device) {
      setDraft(EMPTY_DRAFT)
      return
    }

    setDraft(buildDraft(device))
  }

  const handleMotorScopeChange = (nextScope: MotorScope) => {
    if (!isDualMotorMode || nextScope === selectedMotorScope) return

    setSelectedMotorScope(nextScope)
    setKeyboard(CLOSED_KEYBOARD)
    setError(null)
    syncScopeSelection(nextScope, devices)
  }

  const openKeyboard = (target: Exclude<KeyboardTarget, null>) => {
    const fieldMap: Record<Exclude<KeyboardTarget, null>, { label: string; mode: KeyboardMode }> = {
      host: { label: 'IP or host', mode: 'alpha' },
      port: { label: 'Port', mode: 'numeric' },
      name: { label: 'Device name', mode: 'alpha' }
    }

    const currentValue =
      target === 'host' ? draft.host : target === 'port' ? draft.port : draft.name

    setKeyboard({
      visible: true,
      target,
      label: fieldMap[target].label,
      initialValue: currentValue,
      mode: fieldMap[target].mode
    })
  }

  const applyKeyboardValue = (target: Exclude<KeyboardTarget, null>, value: string) => {
    setDraft((prev) => ({
      ...prev,
      [target]: value
    }))
    setKeyboard(CLOSED_KEYBOARD)
    setError(null)
  }

  const handleSave = () => {
    const selectedDevice = availableDevices.find((device) => device.id === selectedDeviceId)

    if (!selectedDevice) {
      setError('Please select a device first.')
      return
    }

    const host = draft.host.trim()
    const name = draft.name.trim()
    const port = Number(draft.port.trim())

    if (!host) {
      setError('IP or host is required.')
      return
    }

    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      setError('Port must be an integer between 1 and 65535.')
      return
    }

    if (!name) {
      setError('Device name is required.')
      return
    }

    setSaving(true)
    setError(null)

    void updateDeviceNetworkConfig(selectedDeviceId, { host, port, name })
      .then((updatedDevice) => {
        setDevices((prev) =>
          prev.map((device) => (device.id === updatedDevice.id ? updatedDevice : device))
        )
        selectedDeviceIdsRef.current[activeMotorScope] = updatedDevice.id
        setDraft(buildDraft(updatedDevice))
        setKeyboard(CLOSED_KEYBOARD)
        onSaved?.(updatedDevice)
        onClose()
      })
      .catch((saveError: unknown) => {
        setError(getErrorMessage(saveError, 'Failed to update device configuration.'))
      })
      .finally(() => {
        setSaving(false)
      })
  }

  const hasDevices = availableDevices.length > 0
  const hasAnyDevices = devices.length > 0

  return (
    <>
      <ModalBase
        isOpen={isOpen}
        onRequestClose={handleClose}
        width={720}
        ariaLabel="Device network configuration"
      >
        <S.Body>
          <S.Header>
            <S.TitleGroup>
              <S.TitleRow>
                <Network size={18} />
                <S.Title>Device Network Configuration</S.Title>
              </S.TitleRow>
              <S.Subtitle>
                {isDualMotorMode
                  ? `Edit the IP, port and display name stored in the backend devices.yaml for ${activeMotorLabel}.`
                  : 'Edit the IP, port and display name stored in the backend devices.yaml.'}
              </S.Subtitle>
            </S.TitleGroup>
            <S.CloseButton onClick={handleClose} aria-label="Close" disabled={saving}>
              <X size={20} />
            </S.CloseButton>
          </S.Header>

          <S.Content>
            {isDualMotorMode ? (
              <S.MotorSelectorSection>
                <S.MotorSelectorLabel>Communication Scope</S.MotorSelectorLabel>
                <S.MotorSelector>
                  <S.MotorSelectorButton
                    type="button"
                    $active={selectedMotorScope === 1}
                    onClick={() => handleMotorScopeChange(1)}
                    disabled={saving}
                  >
                    Motor #1
                  </S.MotorSelectorButton>
                  <S.MotorSelectorButton
                    type="button"
                    $active={selectedMotorScope === 2}
                    onClick={() => handleMotorScopeChange(2)}
                    disabled={saving}
                  >
                    Motor #2
                  </S.MotorSelectorButton>
                </S.MotorSelector>
              </S.MotorSelectorSection>
            ) : null}

            {loading ? (
              <S.EmptyState>Loading device configuration...</S.EmptyState>
            ) : !hasAnyDevices ? (
              <S.StatusBanner>No configured devices were found.</S.StatusBanner>
            ) : !hasDevices ? (
              <S.StatusBanner>
                No backend device entries were found for {activeMotorLabel}.
              </S.StatusBanner>
            ) : (
              <>
                <S.Field>
                  <S.Label>{isDualMotorMode ? `${activeMotorLabel} Device` : 'Device'}</S.Label>
                  <S.Select
                    value={selectedDeviceId}
                    onChange={(event) => handleDeviceChange(event.target.value)}
                    disabled={saving}
                  >
                    {availableDevices.map((device) => (
                      <option key={device.id} value={device.id}>
                        {device.name} ({device.id})
                      </option>
                    ))}
                  </S.Select>
                </S.Field>

                <S.MetaCard>
                  <S.MetaLabel>Device ID</S.MetaLabel>
                  <S.MetaValue>{selectedDeviceId}</S.MetaValue>
                </S.MetaCard>

                <S.FieldGrid>
                  <S.Field>
                    <S.Label>IP / Host</S.Label>
                    <S.FakeInput onClick={() => openKeyboard('host')} disabled={saving}>
                      {draft.host || 'Tap to edit'}
                    </S.FakeInput>
                  </S.Field>

                  <S.Field>
                    <S.Label>Port</S.Label>
                    <S.FakeInput onClick={() => openKeyboard('port')} disabled={saving}>
                      {draft.port || 'Tap to edit'}
                    </S.FakeInput>
                  </S.Field>
                </S.FieldGrid>

                <S.Field>
                  <S.Label>Display Name</S.Label>
                  <S.FakeInput onClick={() => openKeyboard('name')} disabled={saving}>
                    {draft.name || 'Tap to edit'}
                  </S.FakeInput>
                </S.Field>

                <S.Hint>
                  Tip: changes are saved to devices.yaml and the runtime connection is refreshed
                  immediately for the selected device
                  {isDualMotorMode ? ` in ${activeMotorLabel}.` : '.'}
                </S.Hint>
              </>
            )}

            {error && <S.StatusBanner $tone="error">{error}</S.StatusBanner>}
          </S.Content>

          <S.Footer>
            <S.Button onClick={handleClose} disabled={saving}>
              Cancel
            </S.Button>
            <S.Button $primary onClick={handleSave} disabled={loading || saving || !hasDevices}>
              {saving ? 'Saving...' : 'Save'}
            </S.Button>
          </S.Footer>
        </S.Body>
      </ModalBase>

      <VirtualKeyboard
        visible={keyboard.visible}
        mode={keyboard.mode}
        label={keyboard.label}
        initialValue={keyboard.initialValue}
        onConfirm={(value) => {
          if (!keyboard.target) {
            setKeyboard(CLOSED_KEYBOARD)
            return
          }
          applyKeyboardValue(keyboard.target, value)
        }}
        onCancel={() => setKeyboard(CLOSED_KEYBOARD)}
      />
    </>
  )
}
