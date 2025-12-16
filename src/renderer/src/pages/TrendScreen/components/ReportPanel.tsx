import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Mail,
  Plus,
  RefreshCcw,
  Send,
  X,
  Users,
  FileText,
  Settings,
  ChevronUp,
  ChevronDown,
  Check
} from 'lucide-react'
import { useTheme } from 'styled-components'
import VirtualKeyboard from 'components/VirtualKeyboard/VirtualKeyboard'
import styled from 'styled-components'
import * as S from '../TrendScreen.styles'

type TabType = 'recipients' | 'content' | 'options'

const TabContainer = styled.div`
  display: flex;
  width: 100%;
  background: ${({ theme }) => theme.colors.background.primary};
  border-radius: 8px;
  padding: 4px;
  gap: 4px;
`

const TabButton = styled.button<{ $isActive: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 12px 4px;
  background: ${({ $isActive, theme }) =>
    $isActive ? theme.colors.accent.primary : 'transparent'};
  color: ${({ $isActive, theme }) => ($isActive ? '#fff' : theme.colors.text.secondary)};
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 10px;
  font-weight: bold;
  transition: all 0.2s;

  &:hover {
    background: ${({ $isActive, theme }) =>
      $isActive ? theme.colors.accent.primary : theme.colors.background.tertiary};
  }
`

const LargeInput = styled.input<{ $invalid?: boolean }>`
  width: 100%;
  padding: 12px 16px;
  font-size: 14px;
  background: ${({ theme }) => theme.colors.background.primary};
  border: 2px solid
    ${({ $invalid, theme }) =>
      $invalid ? theme.colors.status.alarm : theme.colors.borders.primary};
  border-radius: 8px;
  color: ${({ theme }) => theme.colors.text.primary};
  outline: none;
  cursor: pointer;

  &:focus {
    border-color: ${({ theme }) => theme.colors.accent.primary};
  }
`

const ScrollButton = styled.button`
  width: 100%;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.background.tertiary};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  border-radius: 6px;
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;

  &:active {
    background: ${({ theme }) => theme.colors.accent.primary}40;
  }
`

const FooterRow = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`

const PaginationInfo = styled.div`
  flex: 1;
  text-align: center;
  font-size: 11px;
  color: ${({ theme }) => theme.colors.text.secondary};
`

const EmailItem = styled.div`
  background: ${({ theme }) => theme.colors.background.primary};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  border-radius: 8px;
  padding: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.primary};
`

const RemoveButton = styled.button`
  min-height: 36px;
  padding: 0 8px;
  background: transparent;
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  border-radius: 6px;
  color: ${({ theme }) => theme.colors.status.alarm};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  transition: all 0.2s;

  &:hover {
    background: ${({ theme }) => theme.colors.status.alarm}20;
  }

  &:active {
    transform: scale(0.95);
  }
`

type Props = {
  isOpen: boolean
  onClose: () => void
  emailList: string[]
  newEmail: string
  onChangeNewEmail: (value: string) => void
  onAddEmail: () => void
  onSendReport: () => Promise<boolean> | void
  isSending: boolean
  onRemoveEmail: (email: string) => void
  isNewEmailValid: boolean
  emailError: string | null
  subject: string
  onChangeSubject: (value: string) => void
  note: string
  onChangeNote: (value: string) => void
  privateMode: boolean
  onTogglePrivateMode: () => void
}

export const ReportPanel = ({
  isOpen,
  onClose,
  emailList,
  newEmail,
  onChangeNewEmail,
  onAddEmail,
  onSendReport,
  isSending,
  onRemoveEmail,
  isNewEmailValid,
  emailError,
  subject,
  onChangeSubject,
  note,
  onChangeNote,
  privateMode,
  onTogglePrivateMode
}: Props) => {
  const theme = useTheme()
  const [activeTab, setActiveTab] = useState<TabType>('recipients')
  const [isSuccess, setIsSuccess] = useState(false)

  // Virtual Keyboard
  const [kbVisible, setKbVisible] = useState(false)
  const [kbField, setKbField] = useState<'newEmail' | 'subject' | 'note' | null>(null)
  const [kbInitial, setKbInitial] = useState('')

  // Scrolling + pagination
  const listRef = useRef<HTMLDivElement>(null)
  const PAGE_SIZE = 6
  const [page, setPage] = useState(0)

  useEffect(() => {
    if (!isOpen) {
      setKbVisible(false)
      setKbField(null)
    }
  }, [isOpen])

  const trimmedNewEmail = useMemo(() => newEmail.trim(), [newEmail])
  const showInvalid = useMemo(() => {
    if (emailError) return true
    if (!trimmedNewEmail) return false
    return !isNewEmailValid
  }, [emailError, isNewEmailValid, trimmedNewEmail])

  const canAdd = useMemo(
    () => Boolean(trimmedNewEmail) && isNewEmailValid,
    [trimmedNewEmail, isNewEmailValid]
  )

  const maxPage = useMemo(
    () => Math.max(Math.ceil(emailList.length / PAGE_SIZE) - 1, 0),
    [emailList.length]
  )
  const pagedEmails = useMemo(() => {
    const start = page * PAGE_SIZE
    return emailList.slice(start, start + PAGE_SIZE)
  }, [emailList, page])

  useEffect(() => {
    if (page > maxPage) setPage(maxPage)
  }, [maxPage, page])

  const openKeyboard = (field: 'newEmail' | 'subject' | 'note') => {
    setKbField(field)
    setKbInitial(field === 'newEmail' ? newEmail : field === 'subject' ? subject : note)
    setKbVisible(true)
  }

  const handleKbConfirm = (value: string) => {
    if (kbField === 'newEmail') onChangeNewEmail(value)
    if (kbField === 'subject') onChangeSubject(value)
    if (kbField === 'note') onChangeNote(value)
    setKbVisible(false)
    setKbField(null)
  }

  const handleSend = async () => {
    const success = await onSendReport()
    if (success === true) {
      setIsSuccess(true)
      setTimeout(() => {
        setIsSuccess(false)
        onClose()
      }, 2000)
    }
  }

  const scrollList = (direction: 'up' | 'down') => {
    const step = direction === 'up' ? -60 : 60
    listRef.current?.scrollBy({ top: step, behavior: 'auto' })
  }

  return (
    <S.SidePanel $isOpen={isOpen}>
      <S.PanelHeader>
        <h3>
          <Mail size={16} /> Automatic Report
        </h3>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: theme.colors.text.secondary
          }}
        >
          <X size={16} />
        </button>
      </S.PanelHeader>

      <TabContainer>
        <TabButton
          $isActive={activeTab === 'recipients'}
          onClick={() => setActiveTab('recipients')}
        >
          <Users size={18} />
          RECIPIENTS
        </TabButton>
        <TabButton $isActive={activeTab === 'content'} onClick={() => setActiveTab('content')}>
          <FileText size={18} />
          CONTENT
        </TabButton>
        <TabButton $isActive={activeTab === 'options'} onClick={() => setActiveTab('options')}>
          <Settings size={18} />
          OPTIONS
        </TabButton>
      </TabContainer>

      {activeTab === 'recipients' && (
        <>
          <div style={{ fontSize: '16px', color: theme.colors.text.secondary, lineHeight: '1.4' }}>
            Add recipients for this report. Use the arrows to scroll the list.
          </div>

          <S.CategoryTitle>Recipients</S.CategoryTitle>

          <ScrollButton onClick={() => scrollList('up')}>
            <ChevronUp size={18} />
          </ScrollButton>

          <S.EmailList ref={listRef}>
            {pagedEmails.map((email) => (
              <EmailItem key={email}>
                <span>{email}</span>
                <RemoveButton onClick={() => onRemoveEmail(email)}>
                  <X size={16} />
                </RemoveButton>
              </EmailItem>
            ))}
          </S.EmailList>

          <ScrollButton onClick={() => scrollList('down')}>
            <ChevronDown size={18} />
          </ScrollButton>

          <FooterRow>
            <S.ActionButton onClick={() => setPage((p) => Math.max(p - 1, 0))} disabled={page <= 0}>
              PREV
            </S.ActionButton>
            <PaginationInfo>
              Page {page + 1} / {maxPage + 1}
            </PaginationInfo>
            <S.ActionButton
              onClick={() => setPage((p) => Math.min(p + 1, maxPage))}
              disabled={page >= maxPage}
            >
              NEXT
            </S.ActionButton>
          </FooterRow>

          <S.CategoryTitle>Add</S.CategoryTitle>
          <div style={{ display: 'flex', gap: '8px' }}>
            <LargeInput
              type="text"
              placeholder="new@email.com"
              value={newEmail}
              readOnly
              $invalid={showInvalid}
              onClick={() => openKeyboard('newEmail')}
            />
            <S.ActionButton onClick={onAddEmail} disabled={!canAdd} style={{ minWidth: 56 }}>
              <Plus size={16} />
            </S.ActionButton>
          </div>

          {showInvalid && (
            <div style={{ fontSize: '11px', color: theme.colors.status.alarm }}>
              {emailError || 'Email inválido'}
            </div>
          )}
        </>
      )}

      {activeTab === 'content' && (
        <>
          <div style={{ fontSize: '16px', color: theme.colors.text.secondary, lineHeight: '1.4' }}>
            Configure the email subject and an optional note.
          </div>

          <S.CategoryTitle>Subject</S.CategoryTitle>
          <LargeInput
            type="text"
            placeholder="GlobalTech Trend Report"
            value={subject}
            readOnly
            onClick={() => openKeyboard('subject')}
          />

          <S.CategoryTitle>Note</S.CategoryTitle>
          <LargeInput
            type="text"
            placeholder="Optional note shown in the email body"
            value={note}
            readOnly
            onClick={() => openKeyboard('note')}
          />
        </>
      )}

      {activeTab === 'options' && (
        <>
          <div style={{ fontSize: '16px', color: theme.colors.text.secondary, lineHeight: '1.4' }}>
            Delivery options for this report.
          </div>

          <S.CategoryTitle>Private mode</S.CategoryTitle>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 10,
              padding: 12,
              border: `1px solid ${theme.colors.borders.primary}`,
              borderRadius: 8,
              background: theme.colors.background.primary
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: theme.colors.text.primary }}>
                Private mode (BCC)
              </div>
              <div style={{ fontSize: 11, color: theme.colors.text.secondary, lineHeight: 1.3 }}>
                Sends recipients as BCC so they don’t see each other’s email addresses.
              </div>
            </div>
            <S.ActionButton
              $variant={privateMode ? 'success' : 'secondary'}
              onClick={onTogglePrivateMode}
              style={{ minWidth: 90, justifyContent: 'center' }}
            >
              {privateMode ? 'ON' : 'OFF'}
            </S.ActionButton>
          </div>
        </>
      )}

      <S.ActionButton
        $variant="success"
        style={{
          marginTop: 'auto',
          justifyContent: 'center',
          padding: '12px',
          background: isSuccess ? theme.colors.status.running : undefined
        }}
        onClick={handleSend}
        disabled={isSending || isSuccess}
      >
        {isSending ? (
          <>
            <RefreshCcw size={16} className="animate-spin" />
            <span>SENDING...</span>
          </>
        ) : isSuccess ? (
          <>
            <Check size={16} />
            <span>SENT SUCCESSFULLY</span>
          </>
        ) : (
          <>
            <Send size={16} />
            <span>SEND REPORT</span>
          </>
        )}
      </S.ActionButton>

      <VirtualKeyboard
        visible={kbVisible}
        mode="alpha"
        initialValue={kbInitial}
        label={
          kbField === 'subject'
            ? 'Email subject'
            : kbField === 'note'
              ? 'Email note'
              : 'Recipient email'
        }
        onConfirm={handleKbConfirm}
        onCancel={() => {
          setKbVisible(false)
          setKbField(null)
        }}
      />
    </S.SidePanel>
  )
}
