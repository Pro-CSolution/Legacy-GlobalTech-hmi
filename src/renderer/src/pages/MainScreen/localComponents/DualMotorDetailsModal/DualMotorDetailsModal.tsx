import { useEffect, useMemo, useState } from 'react'
import Modal from 'react-modal'
import { ClipboardList, Hand } from 'lucide-react'
import { useTheme } from 'styled-components'
import { VirtualKeyboard, type KeyboardMode } from 'components/VirtualKeyboard'
import {
  CLIENT_MOTOR_MAX_EXTRAS,
  loadDualClientMotorInfo,
  saveDualClientMotorInfo,
  type ClientMotorNameplate,
  type DualClientMotorInfo
} from 'utils/clientMotorInfoStorage'
import {
  AddButton,
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
  FooterActions,
  HintText,
  InfoGrid,
  InfoItem,
  InfoLabel,
  InfoValue,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  MoreBadge,
  RemoveButton,
  SmallButton,
  Tag
} from '../ClientMotorInfo/ClientMotorInfo.styles'
import * as S from './DualMotorDetailsModal.styles'

type MotorSlot = keyof DualClientMotorInfo
type PrimaryKey = Exclude<keyof ClientMotorNameplate, 'extras'>
type KeyboardTarget =
  | { motor: MotorSlot; type: 'main'; key: PrimaryKey }
  | { motor: MotorSlot; type: 'extra'; index: number; key: 'label' | 'value' }

const PRIMARY_FIELDS: Array<[string, PrimaryKey]> = [
  ['Customer', 'customer'],
  ['Drive Model', 'driveModel'],
  ['Motor Type', 'motorType'],
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

const MOTOR_TITLES: Record<MotorSlot, string> = {
  drive1: 'Drive 1',
  drive2: 'Drive 2'
}

const cloneDualInfo = (info: DualClientMotorInfo): DualClientMotorInfo => ({
  drive1: {
    ...info.drive1,
    extras: info.drive1.extras.map((item) => ({ ...item }))
  },
  drive2: {
    ...info.drive2,
    extras: info.drive2.extras.map((item) => ({ ...item }))
  }
})

const sanitizeNameplate = (info: ClientMotorNameplate): ClientMotorNameplate => ({
  ...info,
  extras: info.extras
    .map((item) => ({ label: item.label.trim(), value: item.value.trim() }))
    .filter((item) => item.label.length > 0)
    .slice(0, CLIENT_MOTOR_MAX_EXTRAS)
})

interface DualMotorDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  readOnly?: boolean
  visibleMotors?: readonly MotorSlot[]
}

export const DualMotorDetailsModal = ({
  isOpen,
  onClose,
  readOnly = false,
  visibleMotors
}: DualMotorDetailsModalProps) => {
  const theme = useTheme()
  const [draft, setDraft] = useState<DualClientMotorInfo>(() => loadDualClientMotorInfo())
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

  useEffect(() => {
    Modal.setAppElement('#root')
  }, [])

  useEffect(() => {
    if (!isOpen) {
      setKeyboard((prev) => ({ ...prev, visible: false, target: null }))
      return
    }

    setDraft(cloneDualInfo(loadDualClientMotorInfo()))
  }, [isOpen])

  const modalStyles = useMemo(
    () => ({
      overlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.68)',
        backdropFilter: 'blur(6px)',
        zIndex: 160
      },
      content: {
        background: theme.colors.background.secondary,
        border: `1px solid ${theme.colors.borders.primary}`,
        borderRadius: theme.borderRadius.lg,
        padding: 0,
        inset: '6% 4%',
        display: 'flex',
        flexDirection: 'column' as const,
        boxShadow: theme.shadows.lg,
        overflow: 'hidden'
      }
    }),
    [theme]
  )

  const updateMotor = (
    motor: MotorSlot,
    updater: (current: ClientMotorNameplate) => ClientMotorNameplate
  ) => {
    if (readOnly) return

    setDraft((prev) => ({
      ...prev,
      [motor]: updater(prev[motor])
    }))
  }

  const openKeyboard = (target: KeyboardTarget, label: string, initialValue: string) => {
    if (readOnly) return

    setKeyboard({
      visible: true,
      mode: 'alpha',
      label,
      initialValue,
      target
    })
  }

  const handleKeyboardConfirm = (value: string) => {
    if (readOnly) {
      setKeyboard((prev) => ({ ...prev, visible: false, target: null }))
      return
    }

    if (!keyboard.target) {
      setKeyboard((prev) => ({ ...prev, visible: false }))
      return
    }

    const target = keyboard.target
    updateMotor(target.motor, (current) => {
      if (target.type === 'main') {
        return {
          ...current,
          [target.key]: value
        }
      }

      return {
        ...current,
        extras: current.extras.map((item, index) =>
          index === target.index ? { ...item, [target.key]: value } : item
        )
      }
    })

    setKeyboard((prev) => ({ ...prev, visible: false, target: null }))
  }

  const handleKeyboardCancel = () => {
    setKeyboard((prev) => ({ ...prev, visible: false, target: null }))
  }

  const handleAddExtra = (motor: MotorSlot) => {
    if (readOnly) return

    updateMotor(motor, (current) => {
      if (current.extras.length >= CLIENT_MOTOR_MAX_EXTRAS) return current
      return {
        ...current,
        extras: [...current.extras, { label: '', value: '' }]
      }
    })
  }

  const handleRemoveExtra = (motor: MotorSlot, index: number) => {
    if (readOnly) return

    updateMotor(motor, (current) => ({
      ...current,
      extras: current.extras.filter((_, itemIndex) => itemIndex !== index)
    }))
  }

  const handleSave = () => {
    if (readOnly) {
      onClose()
      return
    }

    const next = {
      drive1: sanitizeNameplate(draft.drive1),
      drive2: sanitizeNameplate(draft.drive2)
    }

    saveDualClientMotorInfo(next)
    onClose()
  }

  const motorsToRender =
    visibleMotors && visibleMotors.length > 0
      ? [...visibleMotors]
      : (['drive2', 'drive1'] as MotorSlot[])
  const gridColumns = motorsToRender.length > 1 ? 2 : 1

  const renderMotorColumn = (motor: MotorSlot) => {
    const info = draft[motor]

    return (
      <S.DualMotorDetailsColumn key={motor}>
        <S.DualMotorDetailsCard>
          <S.DualMotorDetailsHeader>
            <S.DualMotorDetailsTitleWrap>
              <ClipboardList size={20} color={theme.colors.accent.primary} />
              <S.DualMotorDetailsTitle>Client & Motor</S.DualMotorDetailsTitle>
            </S.DualMotorDetailsTitleWrap>

            <S.DualMotorDetailsBadge>{MOTOR_TITLES[motor]}</S.DualMotorDetailsBadge>
          </S.DualMotorDetailsHeader>

          <InfoGrid>
            {PRIMARY_FIELDS.map(([label, key]) =>
              readOnly ? (
                <InfoItem key={`${motor}-${key}`}>
                  <InfoLabel>{label}</InfoLabel>
                  <InfoValue>{info[key] || '--'}</InfoValue>
                </InfoItem>
              ) : (
                <S.DualMotorInfoButton
                  key={`${motor}-${key}`}
                  type="button"
                  onClick={() =>
                    openKeyboard(
                      { motor, type: 'main', key },
                      `${MOTOR_TITLES[motor]} - ${label}`,
                      info[key] ? String(info[key]) : ''
                    )
                  }
                >
                  <InfoLabel>{label}</InfoLabel>
                  <InfoValue>{info[key] || '--'}</InfoValue>
                </S.DualMotorInfoButton>
              )
            )}
          </InfoGrid>

          <S.DualMotorCardHint>
            <MoreBadge>
              <HintText>
                <Hand size={14} />
                <Tag>{readOnly ? 'View only' : 'Tap any field to edit'}</Tag>
              </HintText>
            </MoreBadge>
          </S.DualMotorCardHint>
        </S.DualMotorDetailsCard>

        <S.DualMotorDetailsCard>
          <S.DualMotorSectionHeader>
            <S.DualMotorSectionHeading>
              <S.DualMotorSectionTitle>Custom Fields</S.DualMotorSectionTitle>
              <S.DualMotorSectionCaption>
                {readOnly
                  ? 'Saved nameplate notes and operator reference values.'
                  : 'Add extra nameplate notes or operator-specific values.'}
              </S.DualMotorSectionCaption>
            </S.DualMotorSectionHeading>

            <CountBadge>
              {info.extras.length}/{CLIENT_MOTOR_MAX_EXTRAS}
            </CountBadge>

            {readOnly ? null : (
              <AddButton
                type="button"
                onClick={() => handleAddExtra(motor)}
                disabled={info.extras.length >= CLIENT_MOTOR_MAX_EXTRAS}
              >
                Add field
              </AddButton>
            )}
          </S.DualMotorSectionHeader>

          {info.extras.length === 0 ? (
            <EmptyState>
              <EmptyTitle>No custom fields yet</EmptyTitle>
              <EmptyText>Use Add field to save extra details for {MOTOR_TITLES[motor]}.</EmptyText>
            </EmptyState>
          ) : (
            <CustomFieldsList>
              {info.extras.map((item, index) => (
                <CustomFieldCard key={`${motor}-extra-${index}`}>
                  <CustomFieldHeader>
                    <CustomFieldTitle>
                      {MOTOR_TITLES[motor]} custom field {index + 1}
                    </CustomFieldTitle>
                    <CustomFieldActions>
                      <FieldHint>{readOnly ? 'View only' : 'Tap label or value to edit'}</FieldHint>
                      {readOnly ? null : (
                        <RemoveButton type="button" onClick={() => handleRemoveExtra(motor, index)}>
                          Remove
                        </RemoveButton>
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
                        onClick={
                          readOnly
                            ? undefined
                            : () =>
                                openKeyboard(
                                  { motor, type: 'extra', index, key: 'label' },
                                  `${MOTOR_TITLES[motor]} - Label ${index + 1}`,
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
                        onClick={
                          readOnly
                            ? undefined
                            : () =>
                                openKeyboard(
                                  { motor, type: 'extra', index, key: 'value' },
                                  `${MOTOR_TITLES[motor]} - Value ${index + 1}`,
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
        </S.DualMotorDetailsCard>
      </S.DualMotorDetailsColumn>
    )
  }

  return (
    <>
      <Modal
        isOpen={isOpen}
        onRequestClose={onClose}
        shouldCloseOnOverlayClick
        shouldCloseOnEsc
        style={modalStyles}
        contentLabel="Dual motor details"
      >
        <ModalHeader>
          <ModalTitle>
            <ClipboardList size={18} />
            {readOnly ? 'Client & Motor Details' : 'Motor Details'}
          </ModalTitle>

          <SmallButton type="button" onClick={onClose}>
            Close
          </SmallButton>
        </ModalHeader>

        <ModalBody>
          <S.DualMotorDetailsGrid $columns={gridColumns}>
            {motorsToRender.map((motor) => renderMotorColumn(motor))}
          </S.DualMotorDetailsGrid>
        </ModalBody>

        <ModalFooter>
          <FooterActions>
            <SmallButton type="button" onClick={onClose}>
              {readOnly ? 'Close' : 'Cancel'}
            </SmallButton>
            {readOnly ? null : (
              <SmallButton type="button" $primary onClick={handleSave}>
                Save
              </SmallButton>
            )}
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

export default DualMotorDetailsModal
