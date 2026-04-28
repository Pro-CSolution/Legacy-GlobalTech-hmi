import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { X, Search, Plus, Trash2, AlertCircle } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Profile, ProfileParameter } from 'types/profile'
import { DriveParameter } from 'types/drive'
import { getErrorMessage, isAxiosErrorLike } from 'types/errors'
import { getDriveParameters } from 'services/driveService'
import * as Icons from 'lucide-react'
import VirtualKeyboard from 'components/VirtualKeyboard/VirtualKeyboard'

// --- Styled Components ---

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  z-index: 100;
  display: flex;
  justify-content: flex-end;
`

const Panel = styled.div`
  width: 600px;
  background: ${({ theme }) => theme.colors.background.secondary};
  height: 100%;
  border-left: 1px solid ${({ theme }) => theme.colors.borders.primary};
  display: flex;
  flex-direction: column;
  box-shadow: ${({ theme }) => theme.shadows.lg};
  animation: slideIn 0.3s ease-out;

  @keyframes slideIn {
    from {
      transform: translateX(100%);
    }
    to {
      transform: translateX(0);
    }
  }
`

const Header = styled.div`
  padding: 24px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borders.primary};
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const Title = styled.h2`
  margin: 0;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.sizes.xl};
`

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;
  padding: 4px;

  &:hover {
    color: ${({ theme }) => theme.colors.text.primary};
  }
`

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
`

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const Label = styled.label`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
`

const Input = styled.input`
  background: ${({ theme }) => theme.colors.background.tertiary};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  color: ${({ theme }) => theme.colors.text.primary};
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.typography.sizes.md};
  width: 100%;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.accent.primary};
  }
`

const ColorGrid = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`

const ColorOption = styled.button<{ $color: string; $selected: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  border: 2px solid
    ${({ theme, $selected }) => ($selected ? theme.colors.accent.primary : 'transparent')};
  cursor: pointer;
  transition:
    transform 0.12s ease,
    box-shadow 0.12s ease,
    border-color 0.12s ease;
  box-shadow: ${({ theme, $selected }) =>
    $selected
      ? `0 0 0 3px ${theme.colors.accent.primary}33, ${theme.shadows.lg}`
      : theme.shadows.sm};
  transform: ${({ $selected }) => ($selected ? 'scale(1.15)' : 'scale(1)')};

  &:hover {
    transform: ${({ $selected }) => ($selected ? 'scale(1.1)' : 'scale(1.08)')};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accent.primary};
    outline-offset: 3px;
  }
`

const IconGrid = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`

const IconOption = styled.button<{ $selected: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  background: ${({ theme, $selected }) =>
    $selected ? theme.colors.accent.primary + '33' : theme.colors.background.tertiary};
  border: 1px solid
    ${({ theme, $selected }) =>
      $selected ? theme.colors.accent.primary : theme.colors.borders.primary};
  color: ${({ theme, $selected }) =>
    $selected ? theme.colors.accent.primary : theme.colors.text.secondary};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &:hover {
    border-color: ${({ theme }) => theme.colors.accent.primary};
    color: ${({ theme }) => theme.colors.text.primary};
  }
`

const ParamSearchBox = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
`

const SearchResults = styled.div`
  background: ${({ theme }) => theme.colors.background.tertiary};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  max-height: 200px;
  overflow-y: auto;
`

const SearchItem = styled.div`
  padding: 8px 12px;
  cursor: pointer;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borders.secondary};
  display: flex;
  justify-content: space-between;
  align-items: center;

  &:hover {
    background: ${({ theme }) => theme.colors.background.primary};
  }

  &:last-child {
    border-bottom: none;
  }
`

const ParamList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const ReadonlyBadge = styled.span<{ $tone?: 'ro' | 'rw' }>`
  padding: 2px 6px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  border: 1px solid
    ${({ theme, $tone }) =>
      $tone === 'ro' ? theme.colors.status.warning : theme.colors.status.running};
  color: ${({ theme, $tone }) =>
    $tone === 'ro' ? theme.colors.status.warning : theme.colors.status.running};
  background: ${({ theme, $tone }) =>
    $tone === 'ro' ? `${theme.colors.status.warning}10` : `${theme.colors.status.running}10`};
`

const NoticeBanner = styled.div<{ $tone: 'success' | 'error' | 'info' }>`
  margin-top: 4px;
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  border: 1px solid
    ${({ theme, $tone }) => {
      if ($tone === 'success') return theme.colors.status.running
      if ($tone === 'error') return theme.colors.status.alarm
      return theme.colors.accent.primary
    }};
  background: ${({ theme, $tone }) => {
    if ($tone === 'success') return `${theme.colors.status.running}20`
    if ($tone === 'error') return `${theme.colors.status.alarm}20`
    return `${theme.colors.accent.primary}20`
  }};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  display: flex;
  align-items: center;
  gap: 8px;
`

/* --- New Parameter Card Styles --- */

const ParamCard = styled.div`
  background: ${({ theme }) => theme.colors.background.secondary};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.borders.active};
    box-shadow: ${({ theme }) => theme.shadows.md};
  }
`

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`

const ParamInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`

const ParamName = styled.span`
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.sizes.md};
`

const ParamMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

const ParamIdBadge = styled.span`
  font-family: 'Roboto Mono', monospace;
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
  background: ${({ theme }) => theme.colors.background.tertiary};
  padding: 2px 6px;
  border-radius: 4px;
`

const RemoveButton = styled.button`
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.colors.text.secondary};
  padding: 6px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: ${({ theme }) => theme.colors.status.alarm}20;
    color: ${({ theme }) => theme.colors.status.alarm};
  }
`

const InputWrapper = styled.div`
  display: flex;
  align-items: center;
  background: ${({ theme }) => theme.colors.background.primary};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: 0 12px;
  height: 48px;
  transition: all 0.2s;
  position: relative;

  &:focus-within {
    border-color: ${({ theme }) => theme.colors.accent.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.accent.primary}33;
  }
`

const StyledValueInput = styled.input`
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.sizes.lg};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  width: 100%;
  outline: none;
  font-family: 'Roboto Mono', monospace;

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.disabled};
  }
`

const StyledSelect = styled.select`
  background: transparent;
  color: ${({ theme }) => theme.colors.text.primary};
  border: none;
  width: 100%;
  font-size: ${({ theme }) => theme.typography.sizes.md};
  outline: none;
  cursor: pointer;
  appearance: none;
  padding-right: 24px;
  
  option {
    background: ${({ theme }) => theme.colors.background.secondary};
    color: ${({ theme }) => theme.colors.text.primary};
  }
`

const UnitLabel = styled.span`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  white-space: nowrap;
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  background: ${({ theme }) => theme.colors.background.tertiary};
  padding: 2px 6px;
  border-radius: 4px;
  margin-left: 8px;
`

const RangeInfo = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
  padding-left: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
  
  // Truncate logic
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
`

const Footer = styled.div`
  padding: 24px;
  border-top: 1px solid ${({ theme }) => theme.colors.borders.primary};
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`

const Button = styled.button<{ $primary?: boolean }>`
  padding: 10px 20px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  border: 1px solid
    ${({ theme, $primary }) => ($primary ? 'transparent' : theme.colors.borders.primary)};
  background: ${({ theme, $primary }) => ($primary ? theme.colors.accent.primary : 'transparent')};
  color: ${({ theme, $primary }) =>
    $primary ? theme.colors.text.inverse : theme.colors.text.primary};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  cursor: pointer;

  &:hover {
    opacity: 0.9;
    border-color: ${({ theme, $primary }) =>
      $primary ? 'transparent' : theme.colors.text.secondary};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

// --- Constants & Helpers ---

const PASTEL_COLORS = [
  '#A7F3D0', // Mint
  '#BAE6FD', // Sky
  '#DDD6FE', // Violet
  '#FDE68A', // Amber
  '#FECACA', // Red
  '#E9D5FF', // Purple
  '#BFDBFE', // Blue
  '#99F6E4' // Teal
]

const AVAILABLE_ICONS = [
  'Layers',
  'Palette',
  'Settings',
  'Sliders',
  'Gauge',
  'Sparkles',
  'Bolt',
  'Atom'
]

type KeyboardTarget =
  | { field: 'name' }
  | { field: 'search' }
  | { field: 'paramValue'; index: number }
  | null

interface ProfileEditorModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (profile: Partial<Profile>) => Promise<void>
  initialProfile?: Profile | null
}

const getProfileSaveErrorMessage = (error: unknown): string => {
  if (isAxiosErrorLike(error)) {
    const data = error.response?.data

    if (typeof data === 'string' && data.trim()) {
      return data
    }

    if (data && typeof data === 'object') {
      const detail = (data as Record<string, unknown>).detail
      if (typeof detail === 'string' && detail.trim()) {
        return detail
      }

      if (Array.isArray(detail)) {
        const messages = detail
          .map((item) => {
            if (!item || typeof item !== 'object') return null
            const msg = (item as Record<string, unknown>).msg
            return typeof msg === 'string' ? msg : null
          })
          .filter((msg): msg is string => Boolean(msg))

        if (messages.length > 0) {
          return messages.join('\n')
        }
      }
    }
  }

  return getErrorMessage(error, 'Failed to save profile')
}

export const ProfileEditorModal: React.FC<ProfileEditorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialProfile
}) => {
  const [name, setName] = useState('')
  const [color, setColor] = useState(PASTEL_COLORS[0])
  const [icon, setIcon] = useState(AVAILABLE_ICONS[0])
  const [params, setParams] = useState<ProfileParameter[]>([])

  const [search, setSearch] = useState('')
  const [searchResults, setSearchResults] = useState<DriveParameter[]>([])
  const [saving, setSaving] = useState(false)
  const savingRef = useRef(false)
  const [keyboardVisible, setKeyboardVisible] = useState(false)
  const [keyboardTarget, setKeyboardTarget] = useState<KeyboardTarget>(null)
  const [keyboardMode, setKeyboardMode] = useState<'alpha' | 'numeric'>('alpha')
  const [notice, setNotice] = useState<{
    tone: 'success' | 'error' | 'info'
    message: string
  } | null>(null)

  useEffect(() => {
    if (!notice) return undefined
    const timer = setTimeout(() => setNotice(null), 4000)
    return () => clearTimeout(timer)
  }, [notice])

  // Cache parameter metadata to show names/ranges/options in the list
  const [paramMeta, setParamMeta] = useState<Record<string, DriveParameter>>({})

  useEffect(() => {
    if (initialProfile) {
      setName(initialProfile.name)
      setColor(initialProfile.color)
      setIcon(initialProfile.icon)
      setParams(initialProfile.parameters.map((p) => ({ ...p })))

      const fetchMetadata = async () => {
        const uniqueIds = Array.from(new Set(initialProfile.parameters.map((p) => p.parameter_id)))
        if (uniqueIds.length === 0) return

        try {
          const promises = uniqueIds.map((id) => getDriveParameters({ search: id, pageSize: 1 }))
          const results = await Promise.all(promises)
          const newMeta: Record<string, DriveParameter> = {}

          results.forEach((res, index) => {
            if (res.items && res.items.length > 0) {
              const targetId = uniqueIds[index]
              const found = res.items.find((item) => item.id === targetId) || res.items[0]
              if (found) {
                newMeta[found.id] = found
              }
            }
          })
          setParamMeta((prev) => ({ ...prev, ...newMeta }))
        } catch (error) {
          console.error('Error fetching parameter metadata', error)
        }
      }

      fetchMetadata()
    } else {
      setName('')
      setColor(PASTEL_COLORS[0])
      setIcon(AVAILABLE_ICONS[0])
      setParams([])
    }
    setKeyboardVisible(false)
    setKeyboardTarget(null)
    setNotice(null)
  }, [initialProfile, isOpen])

  useEffect(() => {
    const doSearch = async () => {
      if (!search || search.length < 2) {
        setSearchResults([])
        return
      }
      try {
        const res = await getDriveParameters({ search, pageSize: 20 })
        setSearchResults(res.items)
      } catch (err) {
        console.error('Search failed', err)
      }
    }

    const timeout = setTimeout(doSearch, 500)
    return () => clearTimeout(timeout)
  }, [search])

  const addParam = (p: DriveParameter) => {
    if (p.attributes?.includes('R')) {
      setNotice({ tone: 'error', message: 'Parameter is read-only and cannot be added.' })
      return
    }
    if (params.some((exist) => exist.parameter_id === p.id && exist.device_id === 'drive_avid')) {
      setNotice({ tone: 'info', message: 'Parameter already exists in this profile.' })
      return
    }

    setParams((prev) => [
      ...prev,
      {
        device_id: 'drive_avid',
        parameter_id: p.id,
        value: p.default || 0
      }
    ])

    setParamMeta((prev) => ({ ...prev, [p.id]: p }))
    setSearch('')
    setSearchResults([])
    setNotice({ tone: 'success', message: 'Parameter added to profile.' })
  }

  const updateParamValue = (index: number, val: string | number) => {
    setParams((prev) => prev.map((p, i) => (i === index ? { ...p, value: val } : p)))
  }

  const removeParam = (index: number) => {
    setParams((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    if (!name) return
    if (savingRef.current) return
    savingRef.current = true
    setSaving(true)
    try {
      await onSave({
        name,
        color,
        icon,
        parameters: params
      })
      onClose()
    } catch (err) {
      console.error('Save profile failed', err)
      const message = getProfileSaveErrorMessage(err)
      setNotice({ tone: 'error', message })
      alert(message)
    } finally {
      setSaving(false)
      savingRef.current = false
    }
  }

  const openKeyboard = (target: KeyboardTarget, mode: 'alpha' | 'numeric' = 'alpha') => {
    setKeyboardTarget(target)
    setKeyboardMode(mode)
    setKeyboardVisible(true)
  }

  const handleKeyboardConfirm = (val: string) => {
    if (!keyboardTarget) return
    if (keyboardTarget.field === 'name') {
      setName(val)
    } else if (keyboardTarget.field === 'search') {
      setSearch(val)
    } else if (keyboardTarget.field === 'paramValue') {
      updateParamValue(keyboardTarget.index, val)
    }
    setKeyboardVisible(false)
  }

  if (!isOpen) return null

  return (
    <Overlay onClick={onClose}>
      <Panel onClick={(e) => e.stopPropagation()}>
        <Header>
          <Title>{initialProfile ? 'Edit Profile' : 'New Profile'}</Title>
          <CloseButton onClick={onClose}>
            <X size={24} />
          </CloseButton>
        </Header>

        <Content>
          <Section>
            <Label>Profile Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Production Mode A"
              onFocus={() => openKeyboard({ field: 'name' })}
              onClick={() => openKeyboard({ field: 'name' })}
            />
          </Section>

          <Section>
            <Label>Color Code</Label>
            <ColorGrid>
              {PASTEL_COLORS.map((c) => (
                <ColorOption
                  key={c}
                  $color={c}
                  $selected={color === c}
                  onClick={() => setColor(c)}
                />
              ))}
            </ColorGrid>
          </Section>

          <Section>
            <Label>Icon</Label>
            <IconGrid>
              {AVAILABLE_ICONS.map((ic) => {
                const IconComp =
                  (Icons as unknown as Record<string, LucideIcon>)[ic] || Icons.HelpCircle
                return (
                  <IconOption key={ic} $selected={icon === ic} onClick={() => setIcon(ic)}>
                    {IconComp ? <IconComp size={20} /> : <Icons.HelpCircle size={20} />}
                  </IconOption>
                )
              })}
            </IconGrid>
          </Section>

          <Section>
            <Label>Parameters</Label>
            <ParamSearchBox>
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search parameter ID or Name..."
                onFocus={() => openKeyboard({ field: 'search' })}
                onClick={() => openKeyboard({ field: 'search' })}
              />
              <div style={{ display: 'flex', alignItems: 'center', color: '#94a3b8' }}>
                <Search size={20} />
              </div>
            </ParamSearchBox>

            {notice && (
              <NoticeBanner $tone={notice.tone}>
                <span>{notice.message}</span>
              </NoticeBanner>
            )}

            {searchResults.length > 0 && (
              <SearchResults>
                {searchResults.map((p) => {
                  const readOnly = p.attributes?.includes('R')
                  return (
                    <SearchItem key={p.id} onClick={() => addParam(p)}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {p.name} <span style={{ opacity: 0.6 }}>({p.id})</span>
                        <ReadonlyBadge $tone={readOnly ? 'ro' : 'rw'}>
                          {readOnly ? 'RO' : 'RW'}
                        </ReadonlyBadge>
                      </span>
                      <Plus size={16} />
                    </SearchItem>
                  )
                })}
              </SearchResults>
            )}

            <ParamList>
              {params.map((p, idx) => {
                const meta = paramMeta[p.parameter_id] || { id: p.parameter_id }
                const isEnum = meta.options && meta.options.length > 0
                const displayName =
                  meta.name ||
                  (p as unknown as { name?: string }).name ||
                  p.parameter_id ||
                  meta.id ||
                  'Parameter'
                const displayId =
                  meta.id || p.parameter_id || (p as unknown as { id?: string }).id || '—'

                return (
                  <ParamCard key={p.id ?? `${p.device_id}-${p.parameter_id}-${idx}`}>
                    <CardHeader>
                      <ParamInfo>
                        <ParamName>{displayName}</ParamName>
                        <ParamMeta>
                          <ParamIdBadge>{displayId}</ParamIdBadge>
                          <ReadonlyBadge $tone={meta.attributes?.includes('R') ? 'ro' : 'rw'}>
                            {meta.attributes?.includes('R') ? 'RO' : 'RW'}
                          </ReadonlyBadge>
                        </ParamMeta>
                      </ParamInfo>
                      
                      <RemoveButton
                        onClick={(e) => {
                          e.stopPropagation()
                          removeParam(idx)
                        }}
                        title="Remove parameter"
                      >
                        <Trash2 size={18} />
                      </RemoveButton>
                    </CardHeader>

                    <InputWrapper onClick={!isEnum ? () => openKeyboard({ field: 'paramValue', index: idx }, 'numeric') : undefined}>
                      {isEnum ? (
                         <StyledSelect
                            value={String(p.value)}
                            onChange={(e) => updateParamValue(idx, Number(e.target.value))}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {meta.options?.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </StyledSelect>
                      ) : (
                        <StyledValueInput
                          type="number"
                          value={String(p.value)}
                          onChange={(e) => updateParamValue(idx, e.target.value)}
                          onFocus={() =>
                            openKeyboard({ field: 'paramValue', index: idx }, 'numeric')
                          }
                          placeholder="0.00"
                        />
                      )}
                      
                      {meta.unit && !isEnum && <UnitLabel>{meta.unit}</UnitLabel>}
                    </InputWrapper>

                    {!isEnum && meta.range_text && (
                       <RangeInfo title={meta.range_text}>
                          <AlertCircle size={12} />
                          <span>Range: {meta.range_text}</span>
                       </RangeInfo>
                    )}
                  </ParamCard>
                )
              })}
              {params.length === 0 && (
                <div style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
                  No parameters added yet. Search to add.
                </div>
              )}
            </ParamList>
          </Section>
        </Content>

        <Footer>
          <Button onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button $primary onClick={handleSave} disabled={saving || !name}>
            {saving ? 'Saving...' : 'Save Profile'}
          </Button>
        </Footer>

        <VirtualKeyboard
          visible={keyboardVisible}
          mode={keyboardMode}
          initialValue={
            keyboardTarget?.field === 'search'
              ? search
              : keyboardTarget?.field === 'paramValue'
                ? String(params[keyboardTarget.index]?.value ?? '')
                : name
          }
          label={
            keyboardTarget?.field === 'search'
              ? 'Search parameter'
              : keyboardTarget?.field === 'paramValue'
                ? 'Edit value'
                : 'Profile name'
          }
          onConfirm={handleKeyboardConfirm}
          onCancel={() => setKeyboardVisible(false)}
        />
      </Panel>
    </Overlay>
  )
}
