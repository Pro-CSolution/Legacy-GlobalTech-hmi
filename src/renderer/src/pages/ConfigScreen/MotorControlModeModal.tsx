import { useEffect, useState } from 'react'
import { LayoutGrid, X } from 'lucide-react'
import { ModalBase } from 'components/Modal'
import { getMotorControlModeLabel, type MotorControlMode } from 'hooks'
import { getMotorScopeLabel, type MotorScope } from 'utils/motorDeviceMapping'
import * as S from './MotorControlModeModal.styles'

type MotorControlModeModalProps = {
  isOpen: boolean
  currentMode: MotorControlMode
  currentSingleMotorScope: MotorScope
  onClose: () => void
  onSave: (mode: MotorControlMode, singleMotorScope: MotorScope) => void
}

const MODE_OPTIONS: Array<{
  id: MotorControlMode
  eyebrow: string
  description: string
}> = [
  {
    id: 'single',
    eyebrow: 'Single Drive Layout',
    description: 'Show the standard interface for monitoring and controlling 1 motor.'
  },
  {
    id: 'dual',
    eyebrow: 'Dual Drive Layout',
    description: 'Show the interface prepared for monitoring and controlling 2 motors.'
  }
]

const SINGLE_MOTOR_SCOPE_ORDER: MotorScope[] = [2, 1]

export const MotorControlModeModal = ({
  isOpen,
  currentMode,
  currentSingleMotorScope,
  onClose,
  onSave
}: MotorControlModeModalProps) => {
  const [selectedMode, setSelectedMode] = useState<MotorControlMode>(currentMode)
  const [selectedSingleMotorScope, setSelectedSingleMotorScope] =
    useState<MotorScope>(currentSingleMotorScope)

  useEffect(() => {
    if (!isOpen) return
    setSelectedMode(currentMode)
    setSelectedSingleMotorScope(currentSingleMotorScope)
  }, [currentMode, currentSingleMotorScope, isOpen])

  const canSave =
    selectedMode !== currentMode ||
    (selectedMode === 'single' && selectedSingleMotorScope !== currentSingleMotorScope)

  return (
    <ModalBase
      isOpen={isOpen}
      onRequestClose={onClose}
      width={700}
      ariaLabel="Motor control mode configuration"
    >
      <S.Body>
        <S.Header>
          <S.TitleGroup>
            <S.TitleRow>
              <LayoutGrid size={18} />
              <S.Title>Motor Control Mode</S.Title>
            </S.TitleRow>
            <S.Subtitle>
              Select the interface layout for operating with 1 motor or 2 motors.
            </S.Subtitle>
          </S.TitleGroup>
          <S.CloseButton onClick={onClose} aria-label="Close">
            <X size={20} />
          </S.CloseButton>
        </S.Header>

        <S.Content>
          <S.OptionsGrid>
            {MODE_OPTIONS.map((option) => (
              <S.OptionButton
                key={option.id}
                type="button"
                $selected={option.id === selectedMode}
                onClick={() => setSelectedMode(option.id)}
              >
                <S.OptionEyebrow>{option.eyebrow}</S.OptionEyebrow>
                <S.OptionLabel>{getMotorControlModeLabel(option.id)}</S.OptionLabel>
                <S.OptionMeta>{option.description}</S.OptionMeta>
              </S.OptionButton>
            ))}
          </S.OptionsGrid>

          {selectedMode === 'single' ? (
            <S.SingleSelectionFlow>
              <S.SelectionFlowHeader>
                <S.SelectionFlowLabel>Single Motor Path</S.SelectionFlowLabel>
                <S.SelectionFlowHint>
                  Pick which motor the 1 Motor layout should follow. The highlighted path shows the
                  current monitoring target.
                </S.SelectionFlowHint>
              </S.SelectionFlowHeader>

              <S.SelectionOptionsGrid>
                {SINGLE_MOTOR_SCOPE_ORDER.map((scope) => (
                  <S.SelectionOptionButton
                    key={scope}
                    type="button"
                    $selected={scope === selectedSingleMotorScope}
                    onClick={() => setSelectedSingleMotorScope(scope)}
                  >
                    <S.SelectionOptionHeader>
                      <S.OptionEyebrow>Single Motor Selection</S.OptionEyebrow>
                      {scope === selectedSingleMotorScope ? (
                        <S.SelectionStateBadge>Active Path</S.SelectionStateBadge>
                      ) : null}
                    </S.SelectionOptionHeader>
                    <S.OptionLabel>{getMotorScopeLabel(scope)}</S.OptionLabel>
                    <S.OptionMeta>
                      Show the drive, PLC/WAGO, and live values for {getMotorScopeLabel(scope)}.
                    </S.OptionMeta>
                  </S.SelectionOptionButton>
                ))}
              </S.SelectionOptionsGrid>
            </S.SingleSelectionFlow>
          ) : null}

          <S.Hint>
            When you choose 1 Motor mode, the HMI also saves which motor should be monitored so the
            user does not need to keep changing IP addresses.
          </S.Hint>
        </S.Content>

        <S.Footer>
          <S.Button onClick={onClose}>Cancel</S.Button>
          <S.Button
            $primary
            onClick={() => onSave(selectedMode, selectedSingleMotorScope)}
            disabled={!canSave}
          >
            Save
          </S.Button>
        </S.Footer>
      </S.Body>
    </ModalBase>
  )
}
