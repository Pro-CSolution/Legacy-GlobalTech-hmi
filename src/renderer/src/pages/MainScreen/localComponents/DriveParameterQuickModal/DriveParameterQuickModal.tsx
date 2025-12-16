import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Search, ChevronUp, ChevronDown } from 'lucide-react'
import { DeviceId } from 'types'
import { DriveParameter } from 'types/drive'
import { getDriveParameters } from 'services/driveService'
import { ModalBase } from 'components/Modal/ModalBase'
import VirtualKeyboard from 'components/VirtualKeyboard/VirtualKeyboard'
import {
  Wrapper,
  Header,
  Title,
  Subtitle,
  SearchRow,
  SearchInput,
  ResultsList,
  ResultItem,
  ParamName,
  ParamId,
  HintText,
  EmptyState,
  FooterRow,
  CloseButton,
  StatusText,
  LoadingIcon,
  ScrollControls,
  ScrollButton
} from './DriveParameterQuickModal.styles'

interface DriveParameterQuickModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (parameter: DriveParameter) => void
  deviceId?: DeviceId
}

const PAGE_SIZE = 8
const DEBOUNCE_MS = 280

export const DriveParameterQuickModal: React.FC<DriveParameterQuickModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  deviceId = 'drive_avid' as DeviceId
}) => {
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<DriveParameter[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [keyboardVisible, setKeyboardVisible] = useState(false)
  const resultsRef = useRef<HTMLDivElement>(null)
  const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!isOpen) {
      setSearch('')
      setResults([])
      setError(null)
      setKeyboardVisible(false)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return undefined
    const query = search.trim()
    if (!query) {
      setResults([])
      setError(null)
      return undefined
    }

    setLoading(true)
    const handle = setTimeout(async () => {
      try {
        const resp = await getDriveParameters({
          deviceId,
          search: query,
          page: 1,
          pageSize: PAGE_SIZE
        })
        setResults(resp.items)
        setError(null)
      } catch (err) {
        console.error('Failed to load parameters', err)
        setError('Failed to load parameters')
        setResults([])
      } finally {
        setLoading(false)
      }
    }, DEBOUNCE_MS)

    return () => clearTimeout(handle)
  }, [deviceId, isOpen, search])

  const showEmpty = useMemo(
    () => !loading && search.trim() && results.length === 0 && !error,
    [loading, search, results, error]
  )

  const startScroll = (direction: 'up' | 'down') => {
    if (scrollIntervalRef.current) return

    const step = direction === 'up' ? -28 : 28
    const scroll = () => {
      if (resultsRef.current) {
        resultsRef.current.scrollBy({ top: step, behavior: 'auto' })
      }
    }

    scroll()
    scrollIntervalRef.current = setInterval(scroll, 30)
  }

  const stopScroll = () => {
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current)
      scrollIntervalRef.current = null
    }
  }

  return (
    <ModalBase
      isOpen={isOpen}
      onRequestClose={onClose}
      ariaLabel="Quick parameter search"
      width={640}
    >
      <Wrapper>
        <Header>
          <div>
            <Title>Search parameter</Title>
            <Subtitle>Enter ID or name and select to edit</Subtitle>
          </div>
          {error && <StatusText $tone="error">{error}</StatusText>}
        </Header>

        <SearchRow>
          <Search size={18} />
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="e.g. 5.12 or Speed reference"
            autoFocus
            onFocus={() => setKeyboardVisible(true)}
            onClick={() => setKeyboardVisible(true)}
          />
          {loading && <LoadingIcon size={18} />}
        </SearchRow>

        <ResultsList ref={resultsRef}>
          {results.map((param) => (
            <ResultItem key={param.id} onClick={() => onSelect(param)}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <ParamName title={param.name || param.id}>{param.name || 'Unnamed'}</ParamName>
                <ParamId>{param.id}</ParamId>
              </div>
              <HintText>Select</HintText>
            </ResultItem>
          ))}

          {showEmpty && <EmptyState>No results found</EmptyState>}
          {!search.trim() && <EmptyState>Start typing to see suggestions</EmptyState>}
        </ResultsList>

        <ScrollControls>
          <ScrollButton
            onMouseDown={() => startScroll('up')}
            onMouseUp={stopScroll}
            onMouseLeave={stopScroll}
            onTouchStart={() => startScroll('up')}
            onTouchEnd={stopScroll}
          >
            <ChevronUp size={20} />
          </ScrollButton>
          <ScrollButton
            onMouseDown={() => startScroll('down')}
            onMouseUp={stopScroll}
            onMouseLeave={stopScroll}
            onTouchStart={() => startScroll('down')}
            onTouchEnd={stopScroll}
          >
            <ChevronDown size={20} />
          </ScrollButton>
        </ScrollControls>

        <FooterRow>
          <HintText>ID/Name + value only; respects permissions and ranges.</HintText>
          <CloseButton onClick={onClose}>Close</CloseButton>
        </FooterRow>
      </Wrapper>

      <VirtualKeyboard
        visible={keyboardVisible}
        mode="alpha"
        initialValue={search}
        label="Search parameter"
        onConfirm={(val) => {
          setSearch(val)
          setKeyboardVisible(false)
        }}
        onCancel={() => setKeyboardVisible(false)}
      />
    </ModalBase>
  )
}

export default DriveParameterQuickModal
