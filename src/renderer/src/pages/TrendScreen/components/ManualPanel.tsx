import { useRef, useState } from 'react'
import {
  Plus,
  RefreshCcw,
  Pencil,
  Trash,
  X,
  ChevronUp,
  ChevronDown,
  List,
  History,
  Save
} from 'lucide-react'
import { useTheme } from 'styled-components'
import { ManualTrendPoint, ManualTrendSeries } from 'services/manualTrendService'
import * as S from '../TrendScreen.styles'
import { ManualFormState, ManualMode } from '../types'
import { MANUAL_COLORS } from '../constants'
import VirtualKeyboard from 'components/VirtualKeyboard/VirtualKeyboard'
import { ConfirmModal } from 'components/Modal'
import styled from 'styled-components'

// --- Local Styled Components for Touch Optimization ---

const TabContainer = styled.div`
  display: flex;
  width: 100%;
  margin-bottom: 16px;
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

const LargeInput = styled.input`
  width: 100%;
  padding: 12px 16px;
  font-size: 16px; /* Larger font for readability */
  background: ${({ theme }) => theme.colors.background.primary};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  border-radius: 8px;
  color: ${({ theme }) => theme.colors.text.primary};
  outline: none;
  cursor: pointer; /* Suggests interactivity */

  &:focus {
    border-color: ${({ theme }) => theme.colors.accent.primary};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.disabled};
  }
`

const LargeSelect = styled.select`
  width: 100%;
  padding: 12px 16px;
  font-size: 14px;
  background: ${({ theme }) => theme.colors.background.primary};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  border-radius: 8px;
  color: ${({ theme }) => theme.colors.text.primary};
  outline: none;
  height: 48px; /* Touch target size */
`

const TouchButton = styled.button<{ $variant?: 'primary' | 'danger' | 'outline' }>`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 48px; /* Minimum touch target */
  padding: 0 16px;
  border-radius: 8px;
  font-weight: bold;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;

  /* Variant Styles */
  background: ${({ $variant, theme }) => {
    switch ($variant) {
      case 'primary':
        return theme.colors.accent.primary
      case 'danger':
        return theme.colors.status.alarm
      default:
        return 'transparent'
    }
  }};

  border: ${({ $variant, theme }) =>
    $variant === 'outline' ? `2px solid ${theme.colors.borders.primary}` : 'none'};

  color: ${({ $variant, theme }) => ($variant === 'outline' ? theme.colors.text.primary : '#fff')};

  &:active {
    transform: scale(0.98);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
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

const ColorButton = styled.button<{ $color: string; $isSelected: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  border: ${({ $isSelected, theme }) =>
    $isSelected ? `3px solid ${theme.colors.text.primary}` : '2px solid transparent'};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  transition: transform 0.2s;

  &:active {
    transform: scale(0.9);
  }
`

// --- Main Component ---

type Props = {
  isOpen: boolean
  onClose: () => void
  manualSeries: ManualTrendSeries[]
  selectedManualIds: number[]
  onToggleManualSeries: (id: number) => void
  manualMode: ManualMode
  onChangeManualMode: (mode: ManualMode) => void
  manualForm: ManualFormState
  onChangeManualForm: (updater: (prev: ManualFormState) => ManualFormState) => void
  onSubmit: () => void
  onResetForm: () => void
  isSubmitting: boolean
  manualPoints: ManualTrendPoint[]
  manualPointsSeriesId: number | null
  onChangeManualPointsSeriesId: (id: number) => void
  onReloadPoints: (id: number) => void
  onEditPoint: (point: ManualTrendPoint) => void
  onDeletePoint: (id: number) => void
  onEditSeries: (series: ManualTrendSeries) => void
  onDeleteSeries: (id: number) => void
}

type TabType = 'capture' | 'recent' | 'series'

export const ManualPanel = ({
  isOpen,
  onClose,
  manualSeries,
  selectedManualIds,
  onToggleManualSeries,
  manualMode,
  onChangeManualMode,
  manualForm,
  onChangeManualForm,
  onSubmit,
  onResetForm,
  isSubmitting,
  manualPoints,
  manualPointsSeriesId,
  onChangeManualPointsSeriesId,
  onReloadPoints,
  onEditPoint,
  onDeletePoint,
  onEditSeries,
  onDeleteSeries
}: Props) => {
  const theme = useTheme()
  const [activeTab, setActiveTab] = useState<TabType>('capture')
  const [seriesToDelete, setSeriesToDelete] = useState<ManualTrendSeries | null>(null)

  // Virtual Keyboard State
  const [kbVisible, setKbVisible] = useState(false)
  const [kbMode, setKbMode] = useState<'numeric' | 'alpha'>('alpha')
  const [kbInitial, setKbInitial] = useState('')
  const [kbField, setKbField] = useState<keyof ManualFormState | null>(null)

  // Scrolling Refs
  const recentListRef = useRef<HTMLDivElement>(null)
  const seriesListRef = useRef<HTMLDivElement>(null)
  const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const handleOpenKeyboard = (field: keyof ManualFormState, mode: 'numeric' | 'alpha') => {
    setKbField(field)
    setKbInitial(String(manualForm[field] || ''))
    setKbMode(mode)
    setKbVisible(true)
  }

  const handleKeyboardConfirm = (val: string) => {
    if (kbField) {
      onChangeManualForm((prev) => ({ ...prev, [kbField]: val }))
    }
    setKbVisible(false)
  }

  const handleDeleteSeriesConfirm = () => {
    if (seriesToDelete) {
      onDeleteSeries(seriesToDelete.id)
      setSeriesToDelete(null)
    }
  }

  const startScroll = (ref: React.RefObject<HTMLDivElement | null>, direction: 'up' | 'down') => {
    if (scrollIntervalRef.current) return

    const step = direction === 'up' ? -50 : 50
    const scroll = () => {
      if (ref.current) {
        ref.current.scrollBy({ top: step, behavior: 'auto' })
      }
    }

    scroll()
    scrollIntervalRef.current = setInterval(scroll, 50)
  }

  const stopScroll = () => {
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current)
      scrollIntervalRef.current = null
    }
  }

  const renderCaptureTab = () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        height: '100%',
        overflowY: 'auto'
      }}
    >
      {/* Mode Selection */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <TouchButton
          $variant={manualMode === 'existing' ? 'primary' : 'outline'}
          onClick={() => onChangeManualMode('existing')}
          style={{ fontSize: '12px' }}
        >
          Use Existing
        </TouchButton>
        <TouchButton
          $variant={manualMode === 'new' ? 'primary' : 'outline'}
          onClick={() => onChangeManualMode('new')}
          style={{ fontSize: '12px' }}
        >
          {manualForm.seriesId && manualMode === 'new' ? 'Update Series' : 'New Series'}
        </TouchButton>
      </div>

      {manualMode === 'existing' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '16px', color: theme.colors.text.secondary }}>
            Select Series
          </label>
          <LargeSelect
            value={manualForm.seriesId ?? ''}
            onChange={(e) =>
              onChangeManualForm((prev) => ({
                ...prev,
                seriesId: Number(e.target.value) || undefined
              }))
            }
          >
            <option value="">-- Choose Series --</option>
            {manualSeries.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} {s.unit ? `(${s.unit})` : ''}
              </option>
            ))}
          </LargeSelect>
        </div>
      ) : (
        /* New/Edit Series Form */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <LargeInput
            readOnly
            placeholder="Series Name"
            value={manualForm.name || ''}
            onClick={() => handleOpenKeyboard('name', 'alpha')}
          />
          <LargeInput
            readOnly
            placeholder="Unit (e.g. kg, bar)"
            value={manualForm.unit || ''}
            onClick={() => handleOpenKeyboard('unit', 'alpha')}
          />
          <div
            style={{
              display: 'flex',
              gap: '8px',
              flexWrap: 'wrap',
              justifyContent: 'center',
              padding: '8px 0'
            }}
          >
            {MANUAL_COLORS.map((c) => (
              <ColorButton
                key={c}
                $color={c}
                $isSelected={manualForm.color === c}
                onClick={() => onChangeManualForm((prev) => ({ ...prev, color: c }))}
              />
            ))}
          </div>
        </div>
      )}

      <div style={{ height: '1px', background: theme.colors.borders.primary, margin: '8px 0' }} />

      {/* Value Capture Form */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <LargeInput
            readOnly
            type="text"
            placeholder="Value"
            value={manualForm.value || ''}
            onClick={() => handleOpenKeyboard('value', 'numeric')}
            style={{ flex: 1, textAlign: 'center', fontSize: '20px', fontWeight: 'bold' }}
          />
        </div>

        {/* Native Date Picker is usually decent on mobile, but let's make it tall */}
        <LargeInput
          type="datetime-local"
          value={manualForm.time}
          step={1}
          onChange={(e) => onChangeManualForm((prev) => ({ ...prev, time: e.target.value }))}
        />

        <LargeInput
          readOnly
          placeholder="Note (optional)"
          value={manualForm.note || ''}
          onClick={() => handleOpenKeyboard('note', 'alpha')}
        />

        <LargeInput
          readOnly
          placeholder="Recorded by (optional)"
          value={manualForm.createdBy || ''}
          onClick={() => handleOpenKeyboard('createdBy', 'alpha')}
        />
      </div>

      <div style={{ marginTop: 'auto', display: 'flex', gap: '12px', paddingTop: '16px' }}>
        <TouchButton
          $variant="primary"
          onClick={onSubmit}
          disabled={isSubmitting || (!manualForm.value && !manualForm.pointId)}
        >
          {isSubmitting ? <RefreshCcw className="animate-spin" /> : <Save />}
          {manualForm.pointId ? 'UPDATE' : 'SAVE'}
        </TouchButton>
        <TouchButton
          $variant="outline"
          onClick={onResetForm}
          disabled={isSubmitting}
          style={{ flex: 0.4 }}
        >
          <RefreshCcw />
        </TouchButton>
      </div>
    </div>
  )

  const renderRecentTab = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        <LargeSelect
          value={manualPointsSeriesId ?? ''}
          onChange={(e) => onChangeManualPointsSeriesId(Number(e.target.value))}
        >
          {manualSeries.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </LargeSelect>
        <TouchButton
          $variant="outline"
          style={{ flex: 0, minWidth: '48px', padding: 0 }}
          onClick={() => manualPointsSeriesId && onReloadPoints(manualPointsSeriesId)}
        >
          <RefreshCcw size={20} />
        </TouchButton>
      </div>

      <ScrollButton
        onMouseDown={() => startScroll(recentListRef, 'up')}
        onMouseUp={stopScroll}
        onMouseLeave={stopScroll}
        onTouchStart={() => startScroll(recentListRef, 'up')}
        onTouchEnd={stopScroll}
        style={{ marginBottom: '8px' }}
      >
        <ChevronUp />
      </ScrollButton>

      <div
        ref={recentListRef}
        style={{
          flex: 1,
          overflowY: 'hidden' /* Hidden because we use buttons */,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}
      >
        {manualPoints.length === 0 && (
          <div style={{ padding: '20px', textAlign: 'center', color: theme.colors.text.secondary }}>
            No points found.
          </div>
        )}
        {manualPoints.map((p) => (
          <div
            key={p.id}
            style={{
              background: theme.colors.background.primary,
              border: `1px solid ${theme.colors.borders.primary}`,
              borderRadius: '8px',
              padding: '12px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{p.value}</div>
              <div style={{ fontSize: '12px', color: theme.colors.text.secondary }}>
                {new Date(p.time).toLocaleString()}
              </div>
              {p.note && (
                <div style={{ fontSize: '12px', fontStyle: 'italic' }}>&quot;{p.note}&quot;</div>
              )}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <TouchButton
                $variant="outline"
                style={{ minHeight: '36px', padding: '0 8px' }}
                onClick={() => {
                  onEditPoint(p)
                  setActiveTab('capture')
                }}
              >
                <Pencil size={16} />
              </TouchButton>
              <TouchButton
                $variant="danger"
                style={{ minHeight: '36px', padding: '0 8px' }}
                onClick={() => onDeletePoint(p.id)}
              >
                <Trash size={16} />
              </TouchButton>
            </div>
          </div>
        ))}
      </div>

      <ScrollButton
        onMouseDown={() => startScroll(recentListRef, 'down')}
        onMouseUp={stopScroll}
        onMouseLeave={stopScroll}
        onTouchStart={() => startScroll(recentListRef, 'down')}
        onTouchEnd={stopScroll}
        style={{ marginTop: '8px' }}
      >
        <ChevronDown />
      </ScrollButton>
    </div>
  )

  const renderSeriesTab = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <S.CategoryTitle>Manage Series</S.CategoryTitle>

      <ScrollButton
        onMouseDown={() => startScroll(seriesListRef, 'up')}
        onMouseUp={stopScroll}
        onMouseLeave={stopScroll}
        onTouchStart={() => startScroll(seriesListRef, 'up')}
        onTouchEnd={stopScroll}
        style={{ marginBottom: '8px' }}
      >
        <ChevronUp />
      </ScrollButton>

      <div
        ref={seriesListRef}
        style={{
          flex: 1,
          overflowY: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}
      >
        {manualSeries.map((s) => (
          <div
            key={s.id}
            style={{
              background: theme.colors.background.primary,
              border: `1px solid ${theme.colors.borders.primary}`,
              borderRadius: '8px',
              padding: '12px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <S.ColorDot color={s.color} style={{ width: 16, height: 16 }} />
              <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{s.name}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px' }}>
                <input
                  type="checkbox"
                  checked={selectedManualIds.includes(s.id)}
                  onChange={() => onToggleManualSeries(s.id)}
                  style={{ transform: 'scale(1.5)' }}
                />
                <span style={{ fontSize: '12px' }}>Show</span>
              </label>

              <TouchButton
                $variant="outline"
                style={{ minHeight: '36px', padding: '0 8px' }}
                onClick={() => {
                  onEditSeries(s)
                  setActiveTab('capture')
                }}
              >
                <Pencil size={16} />
              </TouchButton>

              <TouchButton
                $variant="danger"
                style={{ minHeight: '36px', padding: '0 8px' }}
                onClick={() => setSeriesToDelete(s)}
              >
                <Trash size={16} />
              </TouchButton>
            </div>
          </div>
        ))}
      </div>

      <ScrollButton
        onMouseDown={() => startScroll(seriesListRef, 'down')}
        onMouseUp={stopScroll}
        onMouseLeave={stopScroll}
        onTouchStart={() => startScroll(seriesListRef, 'down')}
        onTouchEnd={stopScroll}
        style={{ marginTop: '8px' }}
      >
        <ChevronDown />
      </ScrollButton>
    </div>
  )

  return (
    <S.SidePanel $isOpen={isOpen} style={{ width: '300px', paddingBottom: '10px' }}>
      {' '}
      {/* Widen the panel slightly for touch */}
      <S.PanelHeader>
        <h3>
          <Plus size={16} /> Manual Input
        </h3>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px', // larger touch target
            color: theme.colors.text.secondary
          }}
        >
          <X size={24} />
        </button>
      </S.PanelHeader>
      <TabContainer>
        <TabButton $isActive={activeTab === 'capture'} onClick={() => setActiveTab('capture')}>
          <Plus size={20} />
          CAPTURE
        </TabButton>
        <TabButton $isActive={activeTab === 'recent'} onClick={() => setActiveTab('recent')}>
          <History size={20} />
          RECENT
        </TabButton>
        <TabButton $isActive={activeTab === 'series'} onClick={() => setActiveTab('series')}>
          <List size={20} />
          MANAGE
        </TabButton>
      </TabContainer>
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        {activeTab === 'capture' && renderCaptureTab()}
        {activeTab === 'recent' && renderRecentTab()}
        {activeTab === 'series' && renderSeriesTab()}
      </div>
      <VirtualKeyboard
        visible={kbVisible}
        mode={kbMode}
        initialValue={kbInitial}
        label={kbField ? `Enter ${kbField}` : 'Input'}
        onConfirm={handleKeyboardConfirm}
        onCancel={() => setKbVisible(false)}
      />
      <ConfirmModal
        isOpen={!!seriesToDelete}
        title="Delete series"
        message={
          seriesToDelete
            ? `Are you sure you want to delete the series "${seriesToDelete.name}" and all its points?`
            : ''
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        tone="danger"
        onConfirm={handleDeleteSeriesConfirm}
        onCancel={() => setSeriesToDelete(null)}
      />
    </S.SidePanel>
  )
}
