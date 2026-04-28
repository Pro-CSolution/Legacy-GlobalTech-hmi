import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { CircleDot, Circle } from 'lucide-react'
import { ModalBase } from 'components/Modal'
import { getMotorScopeLabel, type MotorScope } from 'utils/motorDeviceMapping'

const Body = styled.div`
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const Title = styled.h2`
  margin: 0;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.sizes.xl};
`

const Message = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.sizes.md};
  line-height: 1.5;
`

const Options = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
`

const MotorOption = styled.button<{ $selected: boolean }>`
  border: 1px solid
    ${({ theme, $selected }) =>
      $selected ? theme.colors.accent.primary : theme.colors.borders.primary};
  background: ${({ theme, $selected }) =>
    $selected ? `${theme.colors.accent.primary}1a` : theme.colors.background.tertiary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: 18px 16px;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text.primary};
  display: flex;
  align-items: flex-start;
  gap: 12px;
  text-align: left;
  transition:
    border-color 0.15s ease,
    transform 0.15s ease,
    box-shadow 0.15s ease;

  &:hover {
    transform: translateY(-2px);
    border-color: ${({ theme }) => theme.colors.accent.primary};
    box-shadow: ${({ theme }) => theme.shadows.md};
  }
`

const OptionText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`

const OptionTitle = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.lg};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
`

const OptionSubtitle = styled.span`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
`

const Footer = styled.div`
  padding: 0 28px 28px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`

const ActionButton = styled.button<{ $primary?: boolean }>`
  padding: 10px 18px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  border: 1px solid
    ${({ theme, $primary }) => ($primary ? 'transparent' : theme.colors.borders.primary)};
  background: ${({ theme, $primary }) => ($primary ? theme.colors.accent.primary : 'transparent')};
  color: ${({ theme, $primary }) =>
    $primary ? theme.colors.text.inverse : theme.colors.text.primary};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  cursor: pointer;

  &:hover {
    opacity: 0.92;
  }
`

type ProfileApplyTargetModalProps = {
  isOpen: boolean
  profileName: string
  initialMotorScope: MotorScope
  isDualMotorMode: boolean
  onCancel: () => void
  onConfirm: (motorScope: MotorScope) => void
}

export const ProfileApplyTargetModal = ({
  isOpen,
  profileName,
  initialMotorScope,
  isDualMotorMode,
  onCancel,
  onConfirm
}: ProfileApplyTargetModalProps) => {
  const [selectedMotorScope, setSelectedMotorScope] = useState<MotorScope>(initialMotorScope)

  useEffect(() => {
    if (!isOpen) return
    setSelectedMotorScope(initialMotorScope)
  }, [initialMotorScope, isOpen])

  return (
    <ModalBase isOpen={isOpen} onRequestClose={onCancel} width={560} ariaLabel="Select target motor">
      <Body>
        <Header>
          <Title>Select Target Motor</Title>
          <Message>
            Apply <strong>{profileName}</strong> to the drive for the motor you choose below.
            {isDualMotorMode
              ? ' This does not apply to both motors automatically.'
              : ' You can still target either motor from here.'}
          </Message>
        </Header>

        <Options>
          {([1, 2] as const).map((scope) => {
            const selected = selectedMotorScope === scope
            const Icon = selected ? CircleDot : Circle

            return (
              <MotorOption
                key={scope}
                type="button"
                $selected={selected}
                onClick={() => setSelectedMotorScope(scope)}
              >
                <Icon size={22} />
                <OptionText>
                  <OptionTitle>{getMotorScopeLabel(scope)}</OptionTitle>
                  <OptionSubtitle>Write this profile to the selected drive.</OptionSubtitle>
                </OptionText>
              </MotorOption>
            )
          })}
        </Options>
      </Body>

      <Footer>
        <ActionButton type="button" onClick={onCancel}>
          Cancel
        </ActionButton>
        <ActionButton type="button" $primary onClick={() => onConfirm(selectedMotorScope)}>
          Apply Profile
        </ActionButton>
      </Footer>
    </ModalBase>
  )
}
