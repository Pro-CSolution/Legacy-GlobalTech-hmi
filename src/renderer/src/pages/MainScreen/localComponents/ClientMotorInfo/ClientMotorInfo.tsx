import { type TouchEvent as ReactTouchEvent, useEffect, useMemo, useRef, useState } from 'react'
import Modal from 'react-modal'
import { ClipboardList, Hand } from 'lucide-react'
import Panel from 'components/Panel'
import Card from 'components/Card'
import { VirtualKeyboard } from 'components/VirtualKeyboard'
import { useAccessMode } from 'hooks'
import { useTheme } from 'styled-components'
import { PositionProps } from 'styles/mixins'
import {
  CLIENT_MOTOR_MAX_EXTRAS,
  DEFAULT_CLIENT_MOTOR_INFO,
  loadClientMotorInfo,
  saveClientMotorInfo,
  type ClientMotorNameplate
} from 'utils/clientMotorInfoStorage'
import { isSingleTouchContact, MULTI_TOUCH_CANCEL_EVENT } from 'utils/touch'
import {
  AddButton,
  CardBody,
  CompactFieldGrid,
  CountBadge,
  CustomFieldActions,
  CustomFieldCard,
  CustomFieldHeader,
  CustomFieldTitle,
  CustomFieldsList,
  EmptyState,
  EmptyText,
  EmptyTitle,
  Field,
  FieldHint,
  FieldInput,
  FieldLabel,
  FieldRow,
  FooterActions,
  FormGrid,
  HintText,
  InfoGrid,
  InfoItem,
  InfoLabel,
  InfoValue,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalSection,
  ModalTitle,
  MoreBadge,
  RemoveButton,
  SectionCaption,
  SectionHeading,
  SmallButton,
  Tag
} from './ClientMotorInfo.styles'

type KeyboardMode = 'numeric' | 'alpha'
type KeyboardTarget =
  | { type: 'main'; key: keyof ClientMotorData }
  | { type: 'extra'; index: number; key: 'label' | 'value' }

export type ClientMotorData = ClientMotorNameplate

const LONG_PRESS_MS = 500
const MAX_VISIBLE_FIELDS = 12
const NUMERIC_FIELDS = new Set<keyof ClientMotorData>()

const DEFAULT_INFO: ClientMotorData = DEFAULT_CLIENT_MOTOR_INFO

const PRIMARY_FIELDS: Array<[string, Exclude<keyof ClientMotorData, 'extras'>]> = [
  ['Customer', 'customer'],
  ['Drive Model', 'driveModel'],
  ['Model No.', 'model'],
  ['Serial No.', 'catalog'],
  ['Catalog No.', 'hp'],
  ['Ambient Air Max', 'frame'],
  ['Phase', 'duty'],
  ['Rated AC Volts', 'enclosure'],
  ['Rated Amps AC', 'tempRise'],
  ['Rated Power Factor', 'serviceFactor'],
  ['Rated RPM / Hz', 'efficiency'],
  ['Horse Power', 'inverterRating'],
  ['Connection', 'connection'],
  ['Max Operating RPM/Hz', 'maxOperating']
]

export const ClientMotorInfo = (positionProps: PositionProps) => {
  const theme = useTheme()
  const { isViewOnly } = useAccessMode()
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
    if (isViewOnly) return
    setDraft(info)
    setIsModalOpen(true)
  }

  useEffect(() => {
    Modal.setAppElement('#root')
    const stored = loadClientMotorInfo()
    setInfo(stored)
    setDraft(stored)
  }, [])

  useEffect(() => {
    saveClientMotorInfo(info)
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
    if (isViewOnly) return
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

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleMultiTouchCancel = () => {
      if (pressTimer.current) {
        window.clearTimeout(pressTimer.current)
        pressTimer.current = null
      }
    }

    window.addEventListener(MULTI_TOUCH_CANCEL_EVENT, handleMultiTouchCancel)

    return () => {
      window.removeEventListener(MULTI_TOUCH_CANCEL_EVENT, handleMultiTouchCancel)
      handleMultiTouchCancel()
    }
  }, [])

  const handleCardTouchStart = (event: ReactTouchEvent<HTMLDivElement>) => {
    if (!isSingleTouchContact(event.nativeEvent)) {
      cancelPress()
      return
    }

    startPress()
  }

  const handleSave = () => {
    if (isViewOnly) {
      setIsModalOpen(false)
      return
    }

    const sanitizedExtras = draft.extras
      .map((item) => ({ ...item, label: item.label.trim(), value: item.value.trim() }))
      .filter((item) => item.label.length > 0)
      .slice(0, CLIENT_MOTOR_MAX_EXTRAS)

    setInfo({ ...draft, extras: sanitizedExtras })
    setIsModalOpen(false)
  }

  const handleAddExtra = () => {
    if (isViewOnly || draft.extras.length >= CLIENT_MOTOR_MAX_EXTRAS) return
    setDraft((prev) => ({ ...prev, extras: [...prev.extras, { label: '', value: '' }] }))
  }

  const handleRemoveExtra = (index: number) => {
    if (isViewOnly) return
    setDraft((prev) => ({ ...prev, extras: prev.extras.filter((_, itemIndex) => itemIndex !== index) }))
  }

  const openKeyboard = (target: KeyboardTarget, label: string, initialValue: string) => {
    if (isViewOnly) return
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

  const handleKeyboardConfirm = (value: string) => {
    if (isViewOnly) {
      setKeyboard((prev) => ({ ...prev, visible: false }))
      return
    }

    if (!keyboard.target) {
      setKeyboard((prev) => ({ ...prev, visible: false }))
      return
    }

    if (keyboard.target.type === 'main') {
      const key = keyboard.target.key
      setDraft((prev) => ({ ...prev, [key]: value }))
    } else {
      const { index, key } = keyboard.target
      setDraft((prev) => ({
        ...prev,
        extras: prev.extras.map((item, itemIndex) =>
          itemIndex === index ? { ...item, [key]: value } : item
        )
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
      <InfoValue>{value || '--'}</InfoValue>
    </InfoItem>
  )

  const visibleFields = PRIMARY_FIELDS.slice(0, MAX_VISIBLE_FIELDS)
  const hiddenCount = Math.max(PRIMARY_FIELDS.length - visibleFields.length, 0)

  return (
    <>
      <Panel width={width} height={height} {...panelProps}>
        <Card
          title="Client & Motor"
          icon={ClipboardList}
          onMouseDown={startPress}
          onMouseUp={cancelPress}
          onMouseLeave={cancelPress}
          onTouchStart={handleCardTouchStart}
          onTouchEnd={cancelPress}
          onTouchCancel={cancelPress}
        >
          <CardBody>
            <InfoGrid>
              {visibleFields.map(([label, key]) => renderField(label, info[key] as string))}
            </InfoGrid>

            <MoreBadge>
              <HintText>
                <Hand size={14} />
                <Tag>{isViewOnly ? 'View only' : 'Hold to edit'}</Tag>
                {hiddenCount > 0 ? ` (${hiddenCount}+ more fields)` : ' values'}
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
        contentLabel={isViewOnly ? 'Client & Motor details' : 'Edit Client & Motor'}
      >
        <ModalHeader>
          <ModalTitle>
            <ClipboardList size={18} />
            {isViewOnly ? 'Client & Motor Details' : 'Edit Client & Motor'}
          </ModalTitle>
          <SmallButton onClick={() => setIsModalOpen(false)}>Close</SmallButton>
        </ModalHeader>

        <ModalBody>
          <ModalSection>
            <h4>Primary fields</h4>
            <FormGrid>
              {PRIMARY_FIELDS.map(([label, key]) => (
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
              <SectionHeading>
                <h4>Custom fields</h4>
                <SectionCaption>
                  {isViewOnly
                    ? 'Saved nameplate notes and operator reference values.'
                    : 'Add operator notes or extra nameplate values. Tap a field to edit it.'}
                </SectionCaption>
              </SectionHeading>
              <CountBadge>
                {draft.extras.length}/{CLIENT_MOTOR_MAX_EXTRAS}
              </CountBadge>
              {isViewOnly ? null : (
                <AddButton
                  onClick={handleAddExtra}
                  disabled={draft.extras.length >= CLIENT_MOTOR_MAX_EXTRAS}
                >
                  Add field
                </AddButton>
              )}
            </FieldRow>

            {draft.extras.length === 0 ? (
              <EmptyState>
                <EmptyTitle>No custom fields yet</EmptyTitle>
                <EmptyText>
                  Use Add field to save extra values that are not part of the main nameplate list.
                </EmptyText>
              </EmptyState>
            ) : (
              <CustomFieldsList>
                {draft.extras.map((item, index) => (
                  <CustomFieldCard key={`edit-${index}`}>
                    <CustomFieldHeader>
                      <CustomFieldTitle>Custom field {index + 1}</CustomFieldTitle>
                      <CustomFieldActions>
                        <FieldHint>{isViewOnly ? 'View only' : 'Tap label or value to edit'}</FieldHint>
                        {isViewOnly ? null : (
                          <RemoveButton onClick={() => handleRemoveExtra(index)}>Remove</RemoveButton>
                        )}
                      </CustomFieldActions>
                    </CustomFieldHeader>

                    <CompactFieldGrid>
                      <Field>
                        <FieldLabel>Label</FieldLabel>
                        <FieldInput
                          value={item.label}
                          readOnly
                          placeholder="Field name"
                          onClick={() =>
                            openKeyboard(
                              { type: 'extra', index, key: 'label' },
                              `Label ${index + 1}`,
                              item.label
                            )
                          }
                        />
                      </Field>

                      <Field>
                        <FieldLabel>Value</FieldLabel>
                        <FieldInput
                          value={item.value}
                          readOnly
                          placeholder="Field value"
                          onClick={() =>
                            openKeyboard(
                              { type: 'extra', index, key: 'value' },
                              `Value ${index + 1}`,
                              item.value
                            )
                          }
                        />
                      </Field>
                    </CompactFieldGrid>
                  </CustomFieldCard>
                ))}
              </CustomFieldsList>
            )}
          </ModalSection>
        </ModalBody>

        <ModalFooter>
          <FooterActions>
            <SmallButton onClick={() => setIsModalOpen(false)}>
              {isViewOnly ? 'Close' : 'Cancel'}
            </SmallButton>
            {isViewOnly ? null : <SmallButton $primary onClick={handleSave}>Save</SmallButton>}
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
