import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import styled from 'styled-components'
import { X, Send, Trash2 } from 'lucide-react'
import { sendVideoReportEmail } from 'services/reportService'
import axios from 'axios'
import { runReportSend } from 'hooks/useReportSendStatus'
import { VirtualKeyboard } from 'components/VirtualKeyboard'

// Styles
const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
`

const ModalContainer = styled.div`
  background: ${({ theme }) => theme.colors.background.secondary};
  width: 600px;
  max-width: 90%;
  border-radius: 12px;
  box-shadow: ${({ theme }) => theme.shadows.lg};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  display: flex;
  flex-direction: column;
  overflow: hidden;
`

const Header = styled.div`
  padding: 16px 24px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borders.primary};
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: ${({ theme }) => theme.colors.background.tertiary};

  h2 {
    margin: 0;
    font-size: 1.1rem;
    color: ${({ theme }) => theme.colors.text.primary};
  }
`

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: ${({ theme }) => theme.colors.text.primary};
  }
`

const Content = styled.div`
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`

const VideoPreview = styled.video`
  width: 100%;
  border-radius: 8px;
  background: #000;
  max-height: 300px;
`

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  label {
    font-size: 0.9rem;
    color: ${({ theme }) => theme.colors.text.secondary};
  }

  input {
    background: ${({ theme }) => theme.colors.background.primary};
    border: 1px solid ${({ theme }) => theme.colors.borders.primary};
    padding: 10px 12px;
    border-radius: 6px;
    color: ${({ theme }) => theme.colors.text.primary};
    font-size: 0.95rem;

    &:focus {
      outline: none;
      border-color: ${({ theme }) => theme.colors.accent.primary};
    }
  }
`

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 8px;
`

const Button = styled.button<{ $variant?: 'primary' | 'danger' | 'secondary' }>`
  padding: 10px 20px;
  border-radius: 6px;
  border: none;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.95rem;

  ${({ theme, $variant }) => {
    switch ($variant) {
      case 'primary':
        return `
          background: ${theme.colors.accent.primary};
          color: #000;
          &:hover { filter: brightness(1.1); }
          &:disabled { opacity: 0.6; cursor: not-allowed; }
        `
      case 'danger':
        return `
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.2);
          &:hover { background: rgba(239, 68, 68, 0.2); }
        `
      default:
        return `
          background: transparent;
          color: ${theme.colors.text.secondary};
          &:hover { color: ${theme.colors.text.primary}; }
        `
    }
  }}
`

const StatusMessage = styled.div<{ $type?: 'success' | 'error' }>`
  padding: 12px;
  border-radius: 6px;
  font-size: 0.9rem;
  background: ${({ $type }) =>
    $type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)'};
  color: ${({ $type }) => ($type === 'error' ? '#ef4444' : '#10b981')};
  border: 1px solid
    ${({ $type }) => ($type === 'error' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)')};
`

interface VideoReportModalProps {
  isOpen: boolean
  onClose: () => void
  videoBlob: Blob | null
  onDiscard: () => void
  autoStopped?: boolean
}

export const VideoReportModal: React.FC<VideoReportModalProps> = ({
  isOpen,
  onClose,
  videoBlob,
  onDiscard,
  autoStopped = false
}) => {
  const [email, setEmail] = useState('')
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [isSending, setIsSending] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false)

  useEffect(() => {
    if (autoStopped && isOpen) {
      setStatus({
        type: 'success', // Using success style (green) or maybe warning style if available?
        // Reusing existing styles, let's keep it informative.
        msg: 'Recording stopped automatically (max 7:10 reached).'
      })
    } else if (isOpen && !autoStopped) {
      // Reset status when opening normally
      setStatus(null)
    }
  }, [isOpen, autoStopped])

  useEffect(() => {
    if (!isOpen) setIsKeyboardOpen(false)
  }, [isOpen])

  useEffect(() => {
    if (videoBlob) {
      const url = URL.createObjectURL(videoBlob)
      setVideoUrl(url)
      return () => URL.revokeObjectURL(url)
    }
    return undefined
  }, [videoBlob])

  if (!isOpen || !videoBlob) return null

  const handleSend = async () => {
    if (!email) {
      setStatus({ type: 'error', msg: 'Please enter a valid email address.' })
      return
    }

    // UX: we don't leave the modal open while sending.
    onClose()
    setIsSending(true)
    setStatus(null)

    runReportSend('video', async () => {
      return await sendVideoReportEmail(videoBlob, email)
    })
      .then(() => {
        onDiscard() // clear only if it started OK (and responded)
      })
      .catch((error) => {
        console.error(error)
        // Keep the blob for possible retry (reopen modal) if it fails.
        if (axios.isAxiosError(error) && error.response?.status === 413) {
          const detail =
            typeof error.response?.data?.detail === 'string'
              ? error.response.data.detail
              : 'Video too large to send via email (attachment limit).'
          setStatus({ type: 'error', msg: detail })
        } else {
          setStatus({ type: 'error', msg: 'Failed to send recording. Please try again.' })
        }
      })
      .finally(() => {
        setIsSending(false)
      })
  }

  return createPortal(
    <Overlay>
      <ModalContainer>
        <Header>
          <h2>Send Screen Recording</h2>
          <CloseButton onClick={onClose} aria-label="Close">
            <X size={20} />
          </CloseButton>
        </Header>

        <Content>
          {videoUrl && <VideoPreview controls src={videoUrl} />}

          <FormGroup>
            <label>Recipient Email</label>
            <input
              type="email"
              placeholder="support@globaltech.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setIsKeyboardOpen(true)}
              onClick={() => setIsKeyboardOpen(true)}
              disabled={isSending}
            />
          </FormGroup>

          {status && <StatusMessage $type={status.type}>{status.msg}</StatusMessage>}

          <ButtonGroup>
            <Button $variant="danger" onClick={onDiscard} disabled={isSending}>
              <Trash2 size={18} />
              Discard
            </Button>
            <Button $variant="secondary" onClick={onClose} disabled={isSending}>
              Cancel
            </Button>
            <Button $variant="primary" onClick={handleSend} disabled={isSending}>
              {isSending ? 'Sending...' : 'Send Recording'}
              {!isSending && <Send size={18} />}
            </Button>
          </ButtonGroup>
        </Content>
      </ModalContainer>

      <VirtualKeyboard
        visible={isKeyboardOpen}
        mode="text"
        label="Recipient Email"
        initialValue={email}
        onConfirm={(value) => {
          setEmail(value)
          setIsKeyboardOpen(false)
        }}
        onCancel={() => setIsKeyboardOpen(false)}
      />
    </Overlay>,
    document.body
  )
}
