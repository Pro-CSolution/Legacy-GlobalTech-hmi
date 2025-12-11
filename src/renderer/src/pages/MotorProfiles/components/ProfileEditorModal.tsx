import React, { useState, useEffect, useMemo } from 'react'
import styled from 'styled-components'
import { X, Search, Plus, Trash2, Check, AlertCircle } from 'lucide-react'
import { Profile, ProfileParameter } from 'types/profile'
import { DriveParameter } from 'types/drive'
import { getDriveParameters } from 'services/driveService'
import * as Icons from 'lucide-react'

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
    from { transform: translateX(100%); }
    to { transform: translateX(0); }
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
  border: 2px solid ${({ theme, $selected }) => $selected ? theme.colors.text.primary : 'transparent'};
  cursor: pointer;
  transition: transform 0.1s;

  &:hover {
    transform: scale(1.1);
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
  background: ${({ theme, $selected }) => $selected ? theme.colors.accent.primary + '33' : theme.colors.background.tertiary};
  border: 1px solid ${({ theme, $selected }) => $selected ? theme.colors.accent.primary : theme.colors.borders.primary};
  color: ${({ theme, $selected }) => $selected ? theme.colors.accent.primary : theme.colors.text.secondary};
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
  gap: 8px;
`

const ParamRow = styled.div`
  background: ${({ theme }) => theme.colors.background.tertiary};
  padding: 12px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  display: flex;
  flex-direction: column;
  gap: 8px;
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
`

const ParamHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const ParamTitle = styled.div`
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  color: ${({ theme }) => theme.colors.text.primary};
`

const ParamId = styled.span`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  margin-left: 8px;
`

const ParamControls = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`

const ValueInput = styled(Input)`
  width: 150px;
  padding: 6px 10px;
`

const Select = styled.select`
  background: ${({ theme }) => theme.colors.background.tertiary};
  color: ${({ theme }) => theme.colors.text.primary};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  padding: 6px 10px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  width: 150px;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.accent.primary};
  }
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
  border: 1px solid ${({ theme, $primary }) => $primary ? 'transparent' : theme.colors.borders.primary};
  background: ${({ theme, $primary }) => $primary ? theme.colors.accent.primary : 'transparent'};
  color: ${({ theme, $primary }) => $primary ? theme.colors.text.inverse : theme.colors.text.primary};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  cursor: pointer;
  
  &:hover {
    opacity: 0.9;
    border-color: ${({ theme, $primary }) => $primary ? 'transparent' : theme.colors.text.secondary};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const ErrorText = styled.span`
  color: ${({ theme }) => theme.colors.status.alarm};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  display: flex;
  align-items: center;
  gap: 4px;
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
  '#99F6E4'  // Teal
]

const AVAILABLE_ICONS = [
  'Layers', 'Palette', 'Settings', 'Sliders', 
  'Gauge', 'Sparkles', 'Bolt', 'Atom'
]

interface ProfileEditorModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (profile: Partial<Profile>) => Promise<void>
  initialProfile?: Profile | null
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
  const [isSearching, setIsSearching] = useState(false)
  const [saving, setSaving] = useState(false)
  
  // Cache parameter metadata to show names/ranges/options in the list
  const [paramMeta, setParamMeta] = useState<Record<string, DriveParameter>>({})

  useEffect(() => {
    if (initialProfile) {
      setName(initialProfile.name)
      setColor(initialProfile.color)
      setIcon(initialProfile.icon)
      setParams([...initialProfile.parameters])
      
      // We would ideally fetch metadata for existing params here to show proper names/options
      // For now, we'll rely on what we have or fetch if needed
    } else {
      setName('')
      setColor(PASTEL_COLORS[0])
      setIcon(AVAILABLE_ICONS[0])
      setParams([])
    }
  }, [initialProfile, isOpen])

  // Search Parameters
  useEffect(() => {
    const doSearch = async () => {
      if (!search || search.length < 2) {
        setSearchResults([])
        return
      }
      setIsSearching(true)
      try {
        const res = await getDriveParameters({ search, pageSize: 20 })
        setSearchResults(res.items)
      } catch (err) {
        console.error('Search failed', err)
      } finally {
        setIsSearching(false)
      }
    }
    
    const timeout = setTimeout(doSearch, 500)
    return () => clearTimeout(timeout)
  }, [search])

  const addParam = (p: DriveParameter) => {
    // Check duplicate
    if (params.some(exist => exist.parameter_id === p.id && exist.device_id === 'drive_avid')) {
      alert('Parameter already exists in profile')
      return
    }

    setParams(prev => [...prev, {
      device_id: 'drive_avid', // Hardcoded for now, but extensible
      parameter_id: p.id,
      value: p.default || 0
    }])
    
    setParamMeta(prev => ({ ...prev, [p.id]: p }))
    setSearch('')
    setSearchResults([])
  }

  const updateParamValue = (index: number, val: string | number) => {
    const newParams = [...params]
    newParams[index].value = val
    setParams(newParams)
  }

  const removeParam = (index: number) => {
    setParams(prev => prev.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    if (!name) return
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
      alert('Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <Overlay onClick={onClose}>
      <Panel onClick={e => e.stopPropagation()}>
        <Header>
          <Title>{initialProfile ? 'Edit Profile' : 'New Profile'}</Title>
          <CloseButton onClick={onClose}><X size={24} /></CloseButton>
        </Header>

        <Content>
          <Section>
            <Label>Profile Name</Label>
            <Input 
              value={name} 
              onChange={e => setName(e.target.value)} 
              placeholder="e.g., Production Mode A"
            />
          </Section>

          <Section>
            <Label>Color Code</Label>
            <ColorGrid>
              {PASTEL_COLORS.map(c => (
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
              {AVAILABLE_ICONS.map(ic => {
                const IconComp = (Icons as any)[ic]
                return (
                  <IconOption 
                    key={ic} 
                    $selected={icon === ic} 
                    onClick={() => setIcon(ic)}
                  >
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
                onChange={e => setSearch(e.target.value)}
                placeholder="Search parameter ID or Name..." 
              />
              <div style={{ display: 'flex', alignItems: 'center', color: '#94a3b8' }}>
                <Search size={20} />
              </div>
            </ParamSearchBox>
            
            {searchResults.length > 0 && (
              <SearchResults>
                {searchResults.map(p => (
                  <SearchItem key={p.id} onClick={() => addParam(p)}>
                    <span>{p.name} <span style={{opacity: 0.6}}>({p.id})</span></span>
                    <Plus size={16} />
                  </SearchItem>
                ))}
              </SearchResults>
            )}

            <ParamList>
              {params.map((p, idx) => {
                const meta = paramMeta[p.parameter_id] || { id: p.parameter_id }
                const isEnum = meta.options && meta.options.length > 0
                
                return (
                  <ParamRow key={`${p.device_id}-${p.parameter_id}`}>
                    <ParamHeader>
                      <ParamTitle>{meta.name || p.parameter_id}<ParamId>({p.parameter_id})</ParamId></ParamTitle>
                      <CloseButton onClick={() => removeParam(idx)}><Trash2 size={16} color="#ef4444" /></CloseButton>
                    </ParamHeader>
                    
                    <ParamControls>
                      <Label>Value:</Label>
                      {isEnum ? (
                        <Select 
                          value={String(p.value)} 
                          onChange={e => updateParamValue(idx, Number(e.target.value))}
                        >
                          {meta.options?.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </Select>
                      ) : (
                        <ValueInput 
                          type="number" 
                          value={String(p.value)} 
                          onChange={e => updateParamValue(idx, e.target.value)}
                        />
                      )}
                      {meta.unit && <span style={{color: '#94a3b8', fontSize: '14px'}}>{meta.unit}</span>}
                    </ParamControls>
                    {meta.range_text && <Label style={{fontSize: '11px'}}>Range: {meta.range_text}</Label>}
                  </ParamRow>
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
          <Button onClick={onClose} disabled={saving}>Cancel</Button>
          <Button $primary onClick={handleSave} disabled={saving || !name}>
            {saving ? 'Saving...' : 'Save Profile'}
          </Button>
        </Footer>
      </Panel>
    </Overlay>
  )
}

