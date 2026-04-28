import { useEffect, useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import { SlidersHorizontal, X } from 'lucide-react'
import VirtualKeyboard from 'components/VirtualKeyboard/VirtualKeyboard'
import { useTheme } from 'styled-components'
import styled from 'styled-components'
import * as S from '../TrendScreen.styles'
import { TrendYAxisScaleState } from '../types'

const ModeGroup = styled.div`
  display: flex;
  gap: 8px;
`

const ModeButton = styled.button<{ $isActive: boolean }>`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 44px;
  border: 1px solid
    ${({ $isActive, theme }) =>
      $isActive ? theme.colors.accent.primary : theme.colors.borders.primary};
  border-radius: 8px;
  background: ${({ $isActive, theme }) =>
    $isActive ? theme.colors.accent.primary : theme.colors.background.primary};
  color: ${({ $isActive, theme }) => ($isActive ? '#fff' : theme.colors.text.primary)};
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  cursor: pointer;
  transition:
    background 0.2s,
    border-color 0.2s,
    transform 0.05s;

  &:hover {
    border-color: ${({ theme }) => theme.colors.accent.primary};
  }

  &:active {
    transform: scale(0.99);
  }
`

const Card = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px;
  border-radius: 10px;
  background: ${({ theme }) => theme.colors.background.primary};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
`

const CardLabel = styled.div`
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.text.secondary};
`

const CardValue = styled.div`
  font-size: 18px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.text.primary};
`

const SectionTitle = styled.div`
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.accent.primary};
`

const CopyText = styled.div<{ $tone?: 'default' | 'error' | 'success' }>`
  font-size: 12px;
  line-height: 1.4;
  color: ${({ $tone, theme }) => {
    switch ($tone) {
      case 'error':
        return theme.colors.status.alarm
      case 'success':
        return theme.colors.status.running
      default:
        return theme.colors.text.secondary
    }
  }};
`

const InputGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
`

const Field = styled.label`
  display: flex;
  flex-direction: column;
  gap: 6px;
`

const FieldLabel = styled.span`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.text.secondary};
`

const NumberInput = styled.input`
  width: 100%;
  min-height: 46px;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  background: ${({ theme }) => theme.colors.background.secondary};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 15px;
  outline: none;
  cursor: pointer;

  &:focus {
    border-color: ${({ theme }) => theme.colors.accent.primary};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

const ActionRow = styled.div`
  display: flex;
  gap: 8px;
`

type Props = {
  isOpen: boolean
  onClose: () => void
  yAxisScale: TrendYAxisScaleState
  onChangeYAxisScale: Dispatch<SetStateAction<TrendYAxisScaleState>>
  resolvedYAxisScale: { min: number; max: number } | null
  error: string | null
  readOnly?: boolean
}

const formatScaleValue = (value: number): string => {
  return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/\.?0+$/, '')
}

export const ScalePanel = ({
  isOpen,
  onClose,
  yAxisScale,
  onChangeYAxisScale,
  resolvedYAxisScale,
  error,
  readOnly = false
}: Props) => {
  const theme = useTheme()
  const isManual = yAxisScale.mode === 'manual'
  const [kbVisible, setKbVisible] = useState(false)
  const [kbField, setKbField] = useState<'min' | 'max' | null>(null)
  const [kbInitial, setKbInitial] = useState('')

  useEffect(() => {
    if (isOpen) return
    setKbVisible(false)
    setKbField(null)
    setKbInitial('')
  }, [isOpen])

  const openKeyboard = (field: 'min' | 'max') => {
    if (readOnly || !isManual) return

    setKbField(field)
    setKbInitial(yAxisScale[field])
    setKbVisible(true)
  }

  const handleKeyboardConfirm = (value: string) => {
    if (!kbField) return

    onChangeYAxisScale((prev) => ({
      ...prev,
      [kbField]: value
    }))
    setKbVisible(false)
    setKbField(null)
    setKbInitial('')
  }

  return (
    <S.SidePanel $isOpen={isOpen}>
      <S.PanelHeader>
        <h3>
          <SlidersHorizontal size={16} /> Trend Scale
        </h3>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: theme.colors.text.secondary
          }}
        >
          <X size={16} />
        </button>
      </S.PanelHeader>

      <Card>
        <CardLabel>Current mode</CardLabel>
        <CardValue>{isManual ? 'Manual Y axis' : 'Automatic Y axis'}</CardValue>
        <CopyText>
          {resolvedYAxisScale
            ? `Active range: ${formatScaleValue(resolvedYAxisScale.min)} to ${formatScaleValue(
                resolvedYAxisScale.max
              )}`
            : 'The chart adjusts the Y axis using the visible trend data.'}
        </CopyText>
      </Card>

      <ModeGroup>
        <ModeButton
          $isActive={!isManual}
          disabled={readOnly}
          onClick={() => onChangeYAxisScale((prev) => ({ ...prev, mode: 'auto' }))}
        >
          Automatic
        </ModeButton>
        <ModeButton
          $isActive={isManual}
          disabled={readOnly}
          onClick={() => onChangeYAxisScale((prev) => ({ ...prev, mode: 'manual' }))}
        >
          Manual
        </ModeButton>
      </ModeGroup>

      <Card style={{ gap: 14 }}>
        <SectionTitle>Manual limits</SectionTitle>
        <CopyText>
          {readOnly
            ? 'Y scale is shown for review only in view mode.'
            : 'Enter a minimum and maximum to lock the chart Y axis. Changes are applied live once both values are valid.'}
        </CopyText>

        <InputGrid>
          <Field>
            <FieldLabel>Minimum</FieldLabel>
            <NumberInput
              type="text"
              inputMode="decimal"
              readOnly
              placeholder="e.g. 0"
              disabled={readOnly || !isManual}
              value={yAxisScale.min}
              onClick={() => openKeyboard('min')}
            />
          </Field>

          <Field>
            <FieldLabel>Maximum</FieldLabel>
            <NumberInput
              type="text"
              inputMode="decimal"
              readOnly
              placeholder="e.g. 100"
              disabled={readOnly || !isManual}
              value={yAxisScale.max}
              onClick={() => openKeyboard('max')}
            />
          </Field>
        </InputGrid>

        {error ? (
          <CopyText $tone="error">{error}</CopyText>
        ) : resolvedYAxisScale ? (
          <CopyText $tone="success">
            Manual scale active from {formatScaleValue(resolvedYAxisScale.min)} to{' '}
            {formatScaleValue(resolvedYAxisScale.max)}.
          </CopyText>
        ) : isManual ? (
          <CopyText>Complete both limits to switch from automatic to manual scaling.</CopyText>
        ) : (
          <CopyText>Automatic mode keeps the Y axis fitted to the current visible values.</CopyText>
        )}
      </Card>

      <ActionRow>
        <S.ActionButton
          onClick={() => onChangeYAxisScale((prev) => ({ ...prev, mode: 'auto' }))}
          $variant={!isManual ? 'primary' : undefined}
          disabled={readOnly}
          style={{ flex: 1, justifyContent: 'center' }}
        >
          Use Auto
        </S.ActionButton>
        <S.ActionButton
          onClick={() =>
            onChangeYAxisScale((prev) => ({
              ...prev,
              min: '',
              max: ''
            }))
          }
          disabled={readOnly || (!yAxisScale.min && !yAxisScale.max)}
          style={{ flex: 1, justifyContent: 'center' }}
        >
          Clear Limits
        </S.ActionButton>
      </ActionRow>

      <VirtualKeyboard
        visible={kbVisible}
        mode="numeric"
        label={kbField === 'max' ? 'Y-axis maximum' : 'Y-axis minimum'}
        initialValue={kbInitial}
        onConfirm={handleKeyboardConfirm}
        onCancel={() => {
          setKbVisible(false)
          setKbField(null)
          setKbInitial('')
        }}
      />
    </S.SidePanel>
  )
}
