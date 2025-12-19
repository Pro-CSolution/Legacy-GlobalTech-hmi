import { useEffect, useMemo, useState } from 'react'
import { SlidersHorizontal, X } from 'lucide-react'
import { ModalBase } from 'components/Modal'
import { VirtualKeyboard } from 'components/VirtualKeyboard'
import type { ParameterId } from 'types'
import * as S from './GaugeConfigModal.styles'

export type GaugeVariableOption = {
  id: ParameterId
  label: string
  unit?: string
  group?: string
}

export type GaugeConfigValue = {
  parameterId: ParameterId
  minValue: number
  maxValue: number
}

type KeyboardTarget = 'min' | 'max' | null

type GaugeConfigModalProps = {
  isOpen: boolean
  title?: string
  subtitle?: string
  variables: GaugeVariableOption[]
  initialValue: GaugeConfigValue
  onClose: () => void
  onSave: (next: GaugeConfigValue) => void
}

const formatNumber = (value: number): string => {
  if (!Number.isFinite(value)) return '0'
  return Number.isInteger(value) ? String(value) : String(value)
}

export const GaugeConfigModal = ({
  isOpen,
  title = 'Configure gauge',
  subtitle,
  variables,
  initialValue,
  onClose,
  onSave
}: GaugeConfigModalProps) => {
  const [draft, setDraft] = useState<GaugeConfigValue>(initialValue)
  const [error, setError] = useState<string | null>(null)
  const [keyboard, setKeyboard] = useState<{
    visible: boolean
    target: KeyboardTarget
    label: string
    initialValue: string
  }>({
    visible: false,
    target: null,
    label: '',
    initialValue: ''
  })

  useEffect(() => {
    if (!isOpen) return
    setDraft(initialValue)
    setError(null)
    setKeyboard({ visible: false, target: null, label: '', initialValue: '' })
  }, [isOpen, initialValue])

  const variableGroups = useMemo(() => {
    const map = new Map<string, GaugeVariableOption[]>()
    for (const v of variables) {
      const group = v.group || 'Variables'
      const list = map.get(group) ?? []
      list.push(v)
      map.set(group, list)
    }
    // Sort groups and items for a stable UX
    const entries = Array.from(map.entries()).map(([group, list]) => [
      group,
      list.slice().sort((a, b) => a.label.localeCompare(b.label))
    ]) as Array<[string, GaugeVariableOption[]]>

    entries.sort((a, b) => a[0].localeCompare(b[0]))
    return entries
  }, [variables])

  const openKeyboard = (target: Exclude<KeyboardTarget, null>, label: string, initial: string) => {
    setKeyboard({ visible: true, target, label, initialValue: initial })
  }

  const applyKeyboardValue = (target: Exclude<KeyboardTarget, null>, raw: string) => {
    const trimmed = raw.trim()
    const parsed = trimmed.length ? Number(trimmed) : 0
    if (!Number.isFinite(parsed)) {
      setError('Invalid value. Please enter a number.')
      return
    }
    setDraft((prev) => ({
      ...prev,
      ...(target === 'min' ? { minValue: parsed } : { maxValue: parsed })
    }))
    setKeyboard((prev) => ({ ...prev, visible: false, target: null }))
  }

  const handleSave = () => {
    setError(null)
    if (!draft.parameterId) {
      setError('Please select a variable.')
      return
    }
    if (!Number.isFinite(draft.minValue) || !Number.isFinite(draft.maxValue)) {
      setError('Min and Max must be valid numbers.')
      return
    }
    if (draft.minValue >= draft.maxValue) {
      setError('Min must be lower than Max.')
      return
    }
    onSave(draft)
  }

  return (
    <>
      <ModalBase isOpen={isOpen} onRequestClose={onClose} width={680} ariaLabel={title}>
        <S.Body>
          <S.Header>
            <S.TitleGroup>
              <S.TitleRow>
                <SlidersHorizontal size={18} />
                <S.Title>{title}</S.Title>
              </S.TitleRow>
              {subtitle && <S.Subtitle title={subtitle}>{subtitle}</S.Subtitle>}
            </S.TitleGroup>
            <S.CloseButton onClick={onClose} aria-label="Cerrar">
              <X size={20} />
            </S.CloseButton>
          </S.Header>

          <S.Content>
            <S.Field>
              <S.Label>Variable</S.Label>
              <S.Select
                value={draft.parameterId}
                onChange={(e) => {
                  const next = e.target.value as ParameterId
                  setDraft((prev) => ({ ...prev, parameterId: next }))
                }}
              >
                {variableGroups.map(([group, items]) => (
                  <optgroup key={group} label={group}>
                    {items.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                        {opt.unit ? ` (${opt.unit})` : ''}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </S.Select>
            </S.Field>

            <S.FormGrid>
              <S.Field>
                <S.Label>Min</S.Label>
                <S.FakeInput
                  onClick={() => openKeyboard('min', 'Min', formatNumber(draft.minValue))}
                >
                  {formatNumber(draft.minValue)}
                </S.FakeInput>
              </S.Field>
              <S.Field>
                <S.Label>Max</S.Label>
                <S.FakeInput
                  onClick={() => openKeyboard('max', 'Max', formatNumber(draft.maxValue))}
                >
                  {formatNumber(draft.maxValue)}
                </S.FakeInput>
              </S.Field>
            </S.FormGrid>

            <S.Hint>
              Tip: the HMI will subscribe the selected variable on-demand to keep it live.
            </S.Hint>

            {error && <S.ErrorBanner>{error}</S.ErrorBanner>}
          </S.Content>

          <S.Footer>
            <S.Button onClick={onClose}>Cancel</S.Button>
            <S.Button $primary onClick={handleSave}>
              Save
            </S.Button>
          </S.Footer>
        </S.Body>
      </ModalBase>

      <VirtualKeyboard
        visible={keyboard.visible}
        mode="numeric"
        label={keyboard.label}
        initialValue={keyboard.initialValue}
        onConfirm={(val) => {
          if (!keyboard.target) {
            setKeyboard((prev) => ({ ...prev, visible: false }))
            return
          }
          applyKeyboardValue(keyboard.target, val)
        }}
        onCancel={() => setKeyboard((prev) => ({ ...prev, visible: false, target: null }))}
      />
    </>
  )
}
