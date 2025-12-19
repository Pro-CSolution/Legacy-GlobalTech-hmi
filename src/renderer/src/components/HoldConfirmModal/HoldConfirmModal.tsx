import { useMemo, useState } from 'react'
import { useTheme } from 'styled-components'
import { TriangleAlert } from 'lucide-react'
import { ModalBase } from 'components/Modal'
import { HoldButton } from 'components/HoldButton/HoldButton'
import {
  Body,
  HeaderRow,
  TitleGroup,
  Title,
  Message,
  IconWrap,
  Divider,
  Hint,
  Actions,
  CancelButton
} from './HoldConfirmModal.styles'

type HoldConfirmModalProps = {
  isOpen: boolean
  title: string
  message: string
  tone?: 'default' | 'danger'
  holdTimeMs?: number
  holdLabel?: string
  hint?: string
  onCancel: () => void
  onConfirm: () => Promise<void> | void
}

export const HoldConfirmModal = ({
  isOpen,
  title,
  message,
  tone = 'default',
  holdTimeMs = 1400,
  holdLabel = 'HOLD TO CONFIRM',
  hint = 'Hold to confirm the action.',
  onCancel,
  onConfirm
}: HoldConfirmModalProps) => {
  const theme = useTheme()
  const [locked, setLocked] = useState(false)

  const holdColor = useMemo(() => {
    return tone === 'danger' ? theme.colors.status.alarm : theme.colors.accent.primary
  }, [theme.colors.accent.primary, theme.colors.status.alarm, tone])

  const handleHoldComplete = () => {
    if (locked) return
    setLocked(true)
    try {
      void Promise.resolve(onConfirm())
    } finally {
      // no UI feedback; the caller may close the modal immediately
    }
  }

  const handleCancel = () => {
    if (locked) return
    onCancel()
  }

  return (
    <ModalBase isOpen={isOpen} onRequestClose={handleCancel} width={560} ariaLabel={title}>
      <Body>
        <HeaderRow>
          <TitleGroup>
            <Title>{title}</Title>
            <Message>{message}</Message>
          </TitleGroup>
          <IconWrap $tone={tone} aria-hidden>
            <TriangleAlert size={26} />
          </IconWrap>
        </HeaderRow>

        <Divider />

        <Hint $tone={tone}>{hint}</Hint>
      </Body>

      <Actions>
        <CancelButton onClick={handleCancel}>Cancel</CancelButton>
        <HoldButton
          onHoldComplete={handleHoldComplete}
          holdTimeMs={holdTimeMs}
          disabled={locked}
          color={holdColor}
        >
          {holdLabel}
        </HoldButton>
      </Actions>
    </ModalBase>
  )
}
