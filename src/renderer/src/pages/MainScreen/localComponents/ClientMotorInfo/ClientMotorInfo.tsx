import { useEffect, useMemo, useRef, useState } from 'react'
import Modal from 'react-modal'
import { ClipboardList, Hand } from 'lucide-react'
import Panel from 'components/Panel'
import Card from 'components/Card'
import { VirtualKeyboard } from 'components/VirtualKeyboard'
import { useTheme } from 'styled-components'
import { PositionProps } from 'styles/mixins'
import {
  CardBody,
  InfoGrid,
  InfoItem,
  InfoLabel,
  InfoValue,
  HintText,
  ExtrasList,
  ExtraItem,
  Tag,
  MoreBadge,
  AddButton,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalSection,
  FormGrid,
  Field,
  FieldLabel,
  FieldInput,
  FieldRow,
  SmallButton,
  ModalFooter,
  FooterActions
} from './ClientMotorInfo.styles'

type ExtraField = { label: string; value: string }
type KeyboardMode = 'numeric' | 'alpha'
type KeyboardTarget =
  | { type: 'main'; key: keyof ClientMotorData }
  | { type: 'extra'; index: number; key: 'label' | 'value' }

export interface ClientMotorData {
  customer: string
  model: string
  catalog: string
  hp: string
  rpm: string
  volts: string
  amps: string
  hz: string
  frame: string
  duty: string
  enclosure: string
  tempRise: string
  serviceFactor: string
  efficiency: string
  inverterRating: string
  extras: ExtraField[]
}

const STORAGE_KEY = 'client_motor_info'
const LONG_PRESS_MS = 500
const MAX_EXTRAS = 15
const NUMERIC_FIELDS = new Set<keyof ClientMotorData>([
  'hp',
  'volts',
  'amps',
  'hz',
  'rpm',
  'efficiency',
  'serviceFactor'
])

const DEFAULT_INFO: ClientMotorData = {
  customer: 'MANSON',
  model: 'FA17',
  catalog: 'C125P2FSCR',
  hp: '125',
  rpm: '1785',
  volts: '460',
  amps: '147.0',
  hz: '60',
  frame: '444T',
  duty: 'CONT',
  enclosure: 'TEFC',
  tempRise: '80C',
  serviceFactor: '1.15',
  efficiency: '94.5',
  inverterRating: '20:1 VT / 4:1 CT @ 60Hz',
  extras: [
    { label: 'Second Rating', value: '150 HP @ 50Hz' },
    { label: 'Volts @ 50Hz', value: '380' },
    { label: 'Amps @ 50Hz', value: '177.0' }
  ]
}

const loadStoredInfo = (): ClientMotorData => {
  if (typeof window === 'undefined') return DEFAULT_INFO
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_INFO
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return DEFAULT_INFO
    return {
      ...DEFAULT_INFO,
      ...parsed,
      extras: Array.isArray(parsed.extras)
        ? parsed.extras.slice(0, MAX_EXTRAS)
        : DEFAULT_INFO.extras
    }
  } catch {
    return DEFAULT_INFO
  }
}

export const ClientMotorInfo = (positionProps: PositionProps) => {
  const theme = useTheme()
  const { width = 380, height = 360, ...panelProps } = positionProps
  const [info, setInfo] = useState<ClientMotorData>(DEFAULT_INFO)
  const [draft, setDraft] = useState<ClientMotorData>(DEFAULT_INFO)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const pressTimer = useRef<number | null>(null)
  const [keyboard, setKeyboard] = useState<{
    visible: boolean
    mode: KeyboardMode
    label: string
    initialValue: string
    target: KeyboardTarget | null
  }>({
    visible: false,
    mode: 'alpha',
    label: '',
    initialValue: '',
    target: null
  })

  const openModal = () => {
    setDraft(info)
    setIsModalOpen(true)
  }

  useEffect(() => {
    Modal.setAppElement('#root')
    const stored = loadStoredInfo()
    setInfo(stored)
    setDraft(stored)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(info))
  }, [info])

  useEffect(() => {
    if (!isModalOpen) {
      setKeyboard((prev) => ({ ...prev, visible: false }))
    }
  }, [isModalOpen])

  const modalStyles = useMemo(
    () => ({
      overlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)',
        zIndex: 110
      },
      content: {
        background: theme.colors.background.secondary,
        border: `1px solid ${theme.colors.borders.primary}`,
        borderRadius: theme.borderRadius.lg,
        padding: 0,
        inset: '10% 15%',
        display: 'flex',
        flexDirection: 'column' as const,
        boxShadow: theme.shadows.lg
      }
    }),
    [theme]
  )

  const startPress = () => {
    if (pressTimer.current) window.clearTimeout(pressTimer.current)
    pressTimer.current = window.setTimeout(() => {
      openModal()
    }, LONG_PRESS_MS)
  }

  const cancelPress = () => {
    if (pressTimer.current) {
      window.clearTimeout(pressTimer.current)
      pressTimer.current = null
    }
  }

  const handleSave = () => {
    const sanitizedExtras = draft.extras
      .map((e) => ({ ...e, label: e.label.trim(), value: e.value.trim() }))
      .filter((e) => e.label.length > 0)
      .slice(0, MAX_EXTRAS)

    setInfo({ ...draft, extras: sanitizedExtras })
    setIsModalOpen(false)
  }

  const handleAddExtra = () => {
    if (draft.extras.length >= MAX_EXTRAS) return
    setDraft((prev) => ({ ...prev, extras: [...prev.extras, { label: '', value: '' }] }))
  }

  const handleRemoveExtra = (idx: number) => {
    setDraft((prev) => ({ ...prev, extras: prev.extras.filter((_, i) => i !== idx) }))
  }

  const openKeyboard = (target: KeyboardTarget, label: string, initialValue: string) => {
    const mode: KeyboardMode =
      target.type === 'main' && NUMERIC_FIELDS.has(target.key) ? 'numeric' : 'alpha'
    setKeyboard({
      visible: true,
      mode,
      label,
      initialValue,
      target
    })
  }

  const handleKeyboardConfirm = (val: string) => {
    if (!keyboard.target) {
      setKeyboard((prev) => ({ ...prev, visible: false }))
      return
    }
    if (keyboard.target.type === 'main') {
      const key = keyboard.target.key
      setDraft((prev) => ({ ...prev, [key]: val }))
    } else {
      const { index, key } = keyboard.target
      setDraft((prev) => ({
        ...prev,
        extras: prev.extras.map((item, i) => (i === index ? { ...item, [key]: val } : item))
      }))
    }
    setKeyboard((prev) => ({ ...prev, visible: false }))
  }

  const handleKeyboardCancel = () => {
    setKeyboard((prev) => ({ ...prev, visible: false }))
  }

  const renderField = (label: string, value: string) => (
    <InfoItem key={label}>
      <InfoLabel>{label}</InfoLabel>
      <InfoValue>{value || '—'}</InfoValue>
    </InfoItem>
  )

  const VISIBLE_FIELDS: Array<[string, Exclude<keyof ClientMotorData, 'extras'>]> = [
    ['Customer', 'customer'],
    ['Model', 'model'],
    ['Catalog', 'catalog'],
    ['HP', 'hp'],
    ['Volts', 'volts'],
    ['Amps', 'amps'],
    ['Hz', 'hz'],
    ['RPM', 'rpm']
  ]

  const totalFields = Object.keys(info).length - 1 + info.extras.length
  const hiddenCount = Math.max(totalFields - VISIBLE_FIELDS.length, 0)

  return (
    <>
      <Panel width={width} height={height} {...panelProps}>
        <Card
          title="Client & Motor"
          icon={ClipboardList}
          // onClick={openModal}
          onMouseDown={startPress}
          onMouseUp={cancelPress}
          onMouseLeave={cancelPress}
          onTouchStart={startPress}
          onTouchEnd={cancelPress}
          onTouchCancel={cancelPress}
        >
          <CardBody>
            <InfoGrid>
              {VISIBLE_FIELDS.map(([label, key]) => renderField(label, info[key] as string))}
            </InfoGrid>

            <MoreBadge>
              <HintText>
                <Hand size={14} />
                <Tag>Hold to edit</Tag> ({hiddenCount}+ more fields)
              </HintText>
            </MoreBadge>
          </CardBody>
        </Card>
      </Panel>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        shouldCloseOnOverlayClick
        shouldCloseOnEsc
        style={modalStyles}
        contentLabel="Edit Client & Motor"
      >
        <ModalHeader>
          <ModalTitle>
            <ClipboardList size={18} />
            Edit Client & Motor
          </ModalTitle>
          <SmallButton onClick={() => setIsModalOpen(false)}>Close</SmallButton>
        </ModalHeader>

        <ModalBody>
          <ModalSection>
            <h4>Primary fields</h4>
            <FormGrid>
              {(
                [
                  ['Customer', 'customer'],
                  ['Model', 'model'],
                  ['Catalog', 'catalog'],
                  ['HP', 'hp'],
                  ['RPM', 'rpm'],
                  ['Volts', 'volts'],
                  ['Amps', 'amps'],
                  ['Hz', 'hz'],
                  ['Frame', 'frame'],
                  ['Duty', 'duty'],
                  ['Enclosure', 'enclosure'],
                  ['Temp Rise', 'tempRise'],
                  ['Service Factor', 'serviceFactor'],
                  ['Efficiency', 'efficiency'],
                  ['Inverter', 'inverterRating']
                ] as Array<[string, Exclude<keyof ClientMotorData, 'extras'>]>
              ).map(([label, key]) => (
                <Field key={key}>
                  <FieldLabel>{label}</FieldLabel>
                  <FieldInput
                    value={draft[key] as string}
                    readOnly
                    onClick={() =>
                      openKeyboard(
                        { type: 'main', key },
                        label,
                        draft[key] ? String(draft[key]) : ''
                      )
                    }
                  />
                </Field>
              ))}
            </FormGrid>
          </ModalSection>

          <ModalSection>
            <FieldRow>
              <h4>
                Custom fields ({draft.extras.length}/{MAX_EXTRAS})
              </h4>
              <AddButton onClick={handleAddExtra} disabled={draft.extras.length >= MAX_EXTRAS}>
                Add field
              </AddButton>
            </FieldRow>

            <ExtrasList $dense>
              {draft.extras.map((item, idx) => (
                <ExtraItem key={`edit-${idx}`}>
                  <FieldLabel>Label</FieldLabel>
                  <FieldInput
                    value={item.label}
                    readOnly
                    onClick={() =>
                      openKeyboard(
                        { type: 'extra', index: idx, key: 'label' },
                        `Label ${idx + 1}`,
                        item.label
                      )
                    }
                  />
                  <FieldLabel>Value</FieldLabel>
                  <FieldInput
                    value={item.value}
                    readOnly
                    onClick={() =>
                      openKeyboard(
                        { type: 'extra', index: idx, key: 'value' },
                        `Value ${idx + 1}`,
                        item.value
                      )
                    }
                  />
                  <SmallButton onClick={() => handleRemoveExtra(idx)}>Remove</SmallButton>
                </ExtraItem>
              ))}
            </ExtrasList>
          </ModalSection>
        </ModalBody>

        <ModalFooter>
          <FooterActions>
            <SmallButton onClick={() => setIsModalOpen(false)}>Cancel</SmallButton>
            <SmallButton $primary onClick={handleSave}>
              Save
            </SmallButton>
          </FooterActions>
        </ModalFooter>
      </Modal>

      <VirtualKeyboard
        visible={keyboard.visible}
        mode={keyboard.mode}
        label={keyboard.label}
        initialValue={keyboard.initialValue}
        onConfirm={handleKeyboardConfirm}
        onCancel={handleKeyboardCancel}
      />
    </>
  )
}

export default ClientMotorInfo
