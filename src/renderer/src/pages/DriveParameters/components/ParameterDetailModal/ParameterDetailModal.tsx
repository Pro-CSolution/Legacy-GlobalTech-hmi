import { FC, useEffect, useMemo, useState } from 'react'
import ReactModal from 'react-modal'
import { ShieldAlert, Edit2 } from 'lucide-react'
import { DriveParameter } from 'types/drive'
import VirtualKeyboard from 'components/VirtualKeyboard/VirtualKeyboard'
import {
  ModalContainer,
  ModalHeader,
  ModalTitleGroup,
  ModalTitle,
  ModalSubtitle,
  StatusBadge,
  ModalBody,
  Section,
  FieldGroup,
  Label,
  ValueDisplay,
  LargeValue,
  DescriptionBox,
  AttributeList,
  AttributeTag,
  EditArea,
  OptionArea,
  FakeInput,
  OptionList,
  OptionButton,
  ModalFooter,
  Button
} from './ParameterDetailModal.styles'

interface ParameterDetailModalProps {
  isOpen: boolean
  parameter: DriveParameter | null
  liveValue: unknown
  onClose: () => void
  onSave: (value: number) => Promise<void>
  isSaving: boolean
}

const ATTRIBUTE_DESCRIPTIONS: Record<string, string> = {
  C: 'Confirm edit',
  E: 'Engineer access',
  L: 'List value',
  N: 'Enter to update',
  O: 'Operator access',
  R: 'Read only',
  S: 'Stop required',
  X: 'Excluded from CRC'
}

const formatValue = (value: unknown): string => {
  if (value === null || value === undefined) return '-'
  return String(value)
}

export const ParameterDetailModal: FC<ParameterDetailModalProps> = ({
  isOpen,
  parameter,
  liveValue,
  onClose,
  onSave,
  isSaving
}) => {
  const [editValue, setEditValue] = useState<string>('')
  const [keyboardVisible, setKeyboardVisible] = useState(false)
  const [keyboardMode, setKeyboardMode] = useState<'numeric' | 'alpha'>('numeric')
  const [writeError, setWriteError] = useState<string | null>(null)

  // Reset state cuando cambia el parámetro (solo una vez por apertura)
  useEffect(() => {
    if (isOpen && parameter) {
      const initial =
        liveValue !== undefined && liveValue !== null
          ? String(liveValue)
          : parameter.default !== undefined && parameter.default !== null
            ? String(parameter.default)
            : ''
      setEditValue(initial)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, parameter?.id])

  const isReadOnly = !!parameter?.attributes?.some((attr) => attr === 'R')
  const parsedOptions = useMemo(() => {
    if (!parameter) return []
    if (parameter.options && parameter.options.length) return parameter.options
    const text = parameter.range_text
    if (!text) return []
    const parts = text
      .split(/[,;]+/)
      .map((p) => p.trim())
      .filter(Boolean)
    const options = parts
      .map((p) => {
        const [val, ...rest] = p.split('=')
        const label = rest.join('=').trim()
        const num = Number(val?.trim())
        if (Number.isNaN(num) || !label) return null
        return { value: num, label }
      })
      .filter(Boolean) as { value: number; label: string }[]
    return options
  }, [parameter])
  const hasOptions = parsedOptions.length > 0

  if (!parameter) return null

  const handleSaveClick = () => {
    if (isReadOnly) return
    setWriteError(null)

    const targetValue = Number(editValue)

    if (!Number.isNaN(targetValue)) {
      onSave(targetValue).catch((err: unknown) => {
        const message = (err as Error)?.message || 'Failed to write parameter'
        setWriteError(message)
      })
    }
  }

  const handleInputClick = () => {
    if (isReadOnly) return
    setKeyboardMode('numeric') // Mostly numeric for drive params, could infer from type if available
    setKeyboardVisible(true)
  }

  const handleKeyboardConfirm = (val: string) => {
    setEditValue(val)
    setKeyboardVisible(false)
  }

  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onClose}
      ariaHideApp={false}
      style={{
        overlay: {
          backgroundColor: 'rgba(15, 23, 42, 0.8)',
          zIndex: 200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        },
        content: {
          background: '#0b1324',
          border: '1px solid #1f2937',
          borderRadius: 12,
          position: 'relative',
          inset: 'auto',
          width: '800px',
          maxWidth: '90vw',
          maxHeight: '90vh',
          padding: '24px',
          overflow: 'auto'
        }
      }}
    >
      <ModalContainer>
        <ModalHeader>
          <ModalTitleGroup>
            <ModalTitle>{parameter.name || 'Unnamed Parameter'}</ModalTitle>
            <ModalSubtitle>
              {parameter.id} · Menu {parameter.menu}
            </ModalSubtitle>
          </ModalTitleGroup>
          <StatusBadge $tone={isReadOnly ? 'warning' : 'success'}>
            {isReadOnly ? <ShieldAlert size={18} /> : <Edit2 size={18} />}
            {isReadOnly ? 'Read Only' : 'Editable'}
          </StatusBadge>
        </ModalHeader>

        <ModalBody>
          <Section>
            <FieldGroup>
              <Label>Current Value</Label>
              <LargeValue>
                {formatValue(liveValue)}{' '}
                <span style={{ fontSize: '1.5rem', color: '#94a3b8' }}>{parameter.unit}</span>
              </LargeValue>
            </FieldGroup>

            <FieldGroup>
              <Label>Description</Label>
              <DescriptionBox>
                {parameter.description || 'No description available.'}
              </DescriptionBox>
            </FieldGroup>

            <FieldGroup>
              <Label>Attributes</Label>
              <AttributeList>
                {parameter.attributes?.map((attr) => (
                  <AttributeTag key={attr} title={ATTRIBUTE_DESCRIPTIONS[attr]}>
                    {attr} {ATTRIBUTE_DESCRIPTIONS[attr] ? `· ${ATTRIBUTE_DESCRIPTIONS[attr]}` : ''}
                  </AttributeTag>
                ))}
                {(!parameter.attributes || parameter.attributes.length === 0) && (
                  <span style={{ color: '#64748b' }}>None</span>
                )}
              </AttributeList>
            </FieldGroup>
          </Section>

          <Section>
            <FieldGroup>
              <Label>Parameter Details</Label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <Label>Default</Label>
                  <ValueDisplay>{formatValue(parameter.default)}</ValueDisplay>
                </div>
                <div>
                  <Label>Modbus Address</Label>
                  <ValueDisplay>{parameter.modbus_address || '-'}</ValueDisplay>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <Label>Range / Options</Label>
                  <ValueDisplay>
                    {parameter.range_numeric
                      ? `${parameter.range_numeric.min} to ${parameter.range_numeric.max}`
                      : parameter.range_text || '-'}
                  </ValueDisplay>
                </div>
              </div>
            </FieldGroup>

            {!isReadOnly && !hasOptions && (
              <EditArea>
                <Label style={{ marginBottom: '8px', display: 'block' }}>Set New Value</Label>
                <FakeInput onClick={handleInputClick}>{editValue || 'Enter value...'}</FakeInput>
                {parameter.range_numeric && (
                  <div style={{ marginTop: '8px', fontSize: '12px', color: '#64748b' }}>
                    Min: {parameter.range_numeric.min} | Max: {parameter.range_numeric.max}
                  </div>
                )}
              </EditArea>
            )}
          </Section>
        </ModalBody>

        {hasOptions && !isReadOnly && (
          <OptionArea>
            <Label style={{ marginBottom: 8, display: 'block' }}>Set New Value</Label>
            <OptionList>
              {parsedOptions.map((opt) => (
                <OptionButton
                  key={opt.value}
                  $active={String(opt.value) === editValue}
                  onClick={() => setEditValue(String(opt.value))}
                >
                  <div style={{ fontWeight: 600 }}>{opt.label}</div>
                  <div style={{ color: '#94a3b8', fontSize: 12 }}>Code: {opt.value}</div>
                </OptionButton>
              ))}
            </OptionList>
            {parameter.range_numeric && (
              <div style={{ marginTop: '6px', fontSize: '12px', color: '#94a3b8' }}>
                Min: {parameter.range_numeric.min} | Max: {parameter.range_numeric.max}
              </div>
            )}
          </OptionArea>
        )}

        {writeError && <div style={{ color: '#f87171', fontSize: 14 }}>{writeError}</div>}

        <ModalFooter>
          <Button $variant="secondary" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          {!isReadOnly && (
            <Button $variant="primary" onClick={handleSaveClick} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          )}
        </ModalFooter>
      </ModalContainer>

      <VirtualKeyboard
        visible={keyboardVisible}
        mode={keyboardMode}
        initialValue={editValue}
        onConfirm={handleKeyboardConfirm}
        onCancel={() => setKeyboardVisible(false)}
        label={`Edit ${parameter.name}`}
      />
    </ReactModal>
  )
}
