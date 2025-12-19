import styled from 'styled-components'
import { ModalBase } from './ModalBase'

type ConfirmModalProps = {
  isOpen: boolean
  title?: string
  message?: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
  tone?: 'default' | 'danger'
}

const Body = styled.div`
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  color: ${({ theme }) => theme.colors.text.primary};
`

const Title = styled.h3`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.sizes.xl};
  color: ${({ theme }) => theme.colors.text.primary};
`

const Message = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.sizes.md};
`

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 0 24px 20px 24px;
`

const Button = styled.button<{ $primary?: boolean; $danger?: boolean }>`
  padding: 10px 18px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  border: 1px solid
    ${({ theme, $primary, $danger }) =>
      $primary
        ? 'transparent'
        : $danger
          ? theme.colors.status.alarm
          : theme.colors.borders.primary};
  background: ${({ theme, $primary, $danger }) =>
    $primary ? ($danger ? theme.colors.status.alarm : theme.colors.accent.primary) : 'transparent'};
  color: ${({ theme, $primary, $danger }) =>
    $primary
      ? theme.colors.text.inverse
      : $danger
        ? theme.colors.status.alarm
        : theme.colors.text.primary};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  cursor: pointer;
  min-width: 110px;

  &:hover {
    opacity: 0.9;
  }
`

export const ConfirmModal = ({
  isOpen,
  title = 'Confirmation',
  message = 'Are you sure?',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  tone = 'default'
}: ConfirmModalProps) => {
  return (
    <ModalBase isOpen={isOpen} onRequestClose={onCancel} width={460} ariaLabel="Confirm dialog">
      <Body>
        <Title>{title}</Title>
        <Message>{message}</Message>
      </Body>
      <Actions>
        <Button onClick={onCancel}>{cancelLabel}</Button>
        <Button $primary $danger={tone === 'danger'} onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </Actions>
    </ModalBase>
  )
}
