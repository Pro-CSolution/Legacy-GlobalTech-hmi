import styled from 'styled-components'
import { ModalBase } from './ModalBase'

type AnnouncementModalProps = {
  isOpen: boolean
  title?: string
  message?: string
  actionLabel?: string
  onClose: () => void
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
  padding: 0 24px 20px 24px;
`

const Button = styled.button`
  padding: 10px 18px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  border: 1px solid transparent;
  background: ${({ theme }) => theme.colors.accent.primary};
  color: ${({ theme }) => theme.colors.text.inverse};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  min-width: 110px;
  cursor: pointer;

  &:hover {
    opacity: 0.9;
  }
`

export const AnnouncementModal = ({
  isOpen,
  title = 'Notice',
  message = '',
  actionLabel = 'OK',
  onClose
}: AnnouncementModalProps) => {
  return (
    <ModalBase isOpen={isOpen} onRequestClose={onClose} width={480} ariaLabel="Announcement dialog">
      <Body>
        <Title>{title}</Title>
        <Message>{message}</Message>
      </Body>
      <Actions>
        <Button onClick={onClose}>{actionLabel}</Button>
      </Actions>
    </ModalBase>
  )
}
