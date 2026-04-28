import { useCallback, useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react'
import { CheckCircle, ChevronDown, ChevronUp, Filter, Layers, Plus, X } from 'lucide-react'
import styled from 'styled-components'
import { useTheme } from 'styled-components'
import { useWagoDisplayNameOverrides } from 'hooks'
import { ManualTrendSeries } from 'services/manualTrendService'
import * as S from '../TrendScreen.styles'
import {
  SENSOR_CATEGORIES,
  TREND_AVAILABLE_VARIABLES,
  getTrendVariableLabel,
  type TrendVariableId
} from '../constants'

type TabType = 'sensors' | 'manual' | 'all'
type SeriesColorType = 'sensor' | 'manual'
type PaletteTarget = { type: 'sensor'; id: TrendVariableId } | { type: 'manual'; id: number }

const MANUAL_SECTION_KEY = 'Manual Series'
const COLOR_PICKER_WIDTH = 228
const COLOR_PICKER_HEIGHT = 210
const DRIVE_PARAMETER_ID_PATTERN = /^P\d+\.\d+$/i

const buildCollapsedSectionState = (): Record<string, boolean> => {
  const base: Record<string, boolean> = {}
  SENSOR_CATEGORIES.forEach((category) => {
    base[category] = false
  })
  base[MANUAL_SECTION_KEY] = false
  return base
}

const formatSelectorVariableLabel = (id: TrendVariableId, label: string): string => {
  const parameterId = String(id).trim().toUpperCase()
  if (!DRIVE_PARAMETER_ID_PATTERN.test(parameterId)) return label
  if (label.toUpperCase().startsWith(`${parameterId} `)) return label
  return `${parameterId} ${label}`
}

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

const SummaryCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.background.primary};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
`

const SummaryLabel = styled.div`
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.text.secondary};
`

const SummaryValue = styled.div`
  font-size: 16px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.text.primary};
`

const Badge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.background.tertiary};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  font-size: 10px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.text.secondary};
  text-transform: uppercase;
`

const ContentWrap = styled.div`
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 0;
`

const ScrollArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding-right: 4px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 0;
  overscroll-behavior: contain;
  scrollbar-width: thin;
  scrollbar-gutter: stable;
  scrollbar-color: ${({ theme }) =>
    `${theme.colors.borders.primary} ${theme.colors.background.secondary}`};

  &::-webkit-scrollbar {
    width: 10px;
  }

  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.background.secondary};
    border-radius: ${({ theme }) => theme.borderRadius.sm};
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.borders.primary};
    border-radius: ${({ theme }) => theme.borderRadius.sm};
    border: 1px solid ${({ theme }) => theme.colors.borders.secondary};
  }

  &::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.colors.accent.primary};
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

const SectionBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`

const AccordionHeader = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  background: ${({ theme }) => theme.colors.background.primary};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  border-radius: 8px;
  padding: 10px 12px;
  color: ${({ theme }) => theme.colors.accent.primary};
  font-weight: 800;
  cursor: pointer;
  text-transform: uppercase;
  font-size: 18px;
  transition: background 0.2s;

  &:hover {
    background: ${({ theme }) => theme.colors.background.tertiary};
  }

  &:active {
    transform: scale(0.99);
  }
`

const AccordionBody = styled.div<{ $isOpen: boolean }>`
  display: ${({ $isOpen }) => ($isOpen ? 'flex' : 'none')};
  flex-direction: column;
  gap: 10px;
`

const SectionTitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
`

const SectionTitle = styled.div`
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.accent.primary};
`

const EmptyText = styled.div`
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px dashed ${({ theme }) => theme.colors.borders.primary};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 12px;
`

const SeriesRow = styled.div`
  display: flex;
  align-items: stretch;
  gap: 10px;
`

const SeriesLabel = styled.span`
  flex: 1;
  min-width: 0;
  display: block;
  text-align: left;
  line-height: 1.25;
  white-space: normal;
  overflow-wrap: anywhere;
`

const ColorTriggerButton = styled.button<{
  $isDisabled: boolean
  $isOpen: boolean
}>`
  width: 40px;
  min-width: 40px;
  padding: 0;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid
    ${({ theme, $isOpen }) =>
      $isOpen ? theme.colors.accent.primary : theme.colors.borders.primary};
  background: ${({ theme, $isOpen }) =>
    $isOpen ? `${theme.colors.accent.primary}18` : theme.colors.background.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ${({ $isDisabled }) => ($isDisabled ? 'not-allowed' : 'pointer')};
  opacity: ${({ $isDisabled }) => ($isDisabled ? 0.45 : 1)};
  transition:
    border-color 0.2s,
    background 0.2s,
    transform 0.05s;

  &:hover {
    border-color: ${({ theme, $isDisabled }) =>
      $isDisabled ? theme.colors.borders.primary : theme.colors.accent.primary};
  }

  &:active {
    transform: ${({ $isDisabled }) => ($isDisabled ? 'none' : 'scale(0.98)')};
  }
`

const ColorPreview = styled.span<{ $color: string }>`
  display: block;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  box-shadow:
    0 0 0 2px rgba(255, 255, 255, 0.08),
    inset 0 0 0 1px rgba(0, 0, 0, 0.25);
`

const PalettePopover = styled.div`
  position: absolute;
  width: ${COLOR_PICKER_WIDTH}px;
  padding: 12px;
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.background.secondary};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  z-index: 35;
`

const PaletteHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: 10px;
`

const PaletteTitle = styled.div`
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.text.primary};
`

const PaletteSubtitle = styled.div`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.text.secondary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const PaletteGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 8px;
`

const PaletteColorButton = styled.button<{
  $color: string
  $isActive: boolean
}>`
  width: 100%;
  aspect-ratio: 1;
  border-radius: 10px;
  border: 2px solid
    ${({ theme, $isActive }) =>
      $isActive ? theme.colors.text.primary : theme.colors.borders.primary};
  background: ${({ $color }) => $color};
  cursor: pointer;
  box-shadow: ${({ $isActive }) =>
    $isActive ? '0 0 0 2px rgba(255, 255, 255, 0.1)' : 'inset 0 0 0 1px rgba(0, 0, 0, 0.15)'};
`

const DefaultColorButton = styled.button<{ $isActive: boolean }>`
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 9px 10px;
  border-radius: 10px;
  border: 1px solid
    ${({ theme, $isActive }) =>
      $isActive ? theme.colors.accent.primary : theme.colors.borders.primary};
  background: ${({ theme, $isActive }) =>
    $isActive ? `${theme.colors.accent.primary}18` : theme.colors.background.primary};
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
`

const DefaultSwatch = styled.span<{ $color: string }>`
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.1),
    inset 0 0 0 1px rgba(0, 0, 0, 0.2);
`

type Props = {
  isOpen: boolean
  onClose: () => void
  selectedVarIds: TrendVariableId[]
  onToggleVar: (id: TrendVariableId) => void
  trendColorPalette: readonly string[]
  getEffectiveSensorColor: (id: TrendVariableId) => string
  onSetSeriesColor: (type: SeriesColorType, id: string | number, color: string) => void
  onClearSeriesColor: (type: SeriesColorType, id: string | number) => void
  selectedManualIds: number[]
  onToggleManualSeries: (id: number) => void
  getEffectiveManualColor: (id: number) => string
  manualSeries: ManualTrendSeries[]
  onOpenManualPanel: () => void
  sensorSelectionDisabled?: boolean
  manualSelectionDisabled?: boolean
  colorEditingDisabled?: boolean
  manualManageDisabled?: boolean
}

export const VariablesPanel = ({
  isOpen,
  onClose,
  selectedVarIds,
  onToggleVar,
  trendColorPalette,
  getEffectiveSensorColor,
  onSetSeriesColor,
  onClearSeriesColor,
  selectedManualIds,
  onToggleManualSeries,
  getEffectiveManualColor,
  manualSeries,
  onOpenManualPanel,
  sensorSelectionDisabled = false,
  manualSelectionDisabled = false,
  colorEditingDisabled = false,
  manualManageDisabled = false,
}: Props) => {
  const theme = useTheme()
  const displayNameOverrides = useWagoDisplayNameOverrides()
  const [activeTab, setActiveTab] = useState<TabType>('all')
  const [paletteTarget, setPaletteTarget] = useState<PaletteTarget | null>(null)
  const [palettePosition, setPalettePosition] = useState<{ top: number; left: number } | null>(null)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(
    buildCollapsedSectionState
  )

  const panelRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const paletteRef = useRef<HTMLDivElement>(null)
  const triggerRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const scrollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const selectedSensorsCount = selectedVarIds.length
  const selectedManualCount = selectedManualIds.length
  const selectedTotal = selectedSensorsCount + selectedManualCount
  const activePaletteKey = paletteTarget
    ? `${paletteTarget.type}:${String(paletteTarget.id)}`
    : null

  const closePalette = useCallback(() => {
    setPaletteTarget(null)
    setPalettePosition(null)
  }, [])

  useEffect(() => {
    if (!isOpen) return
    setOpenSections(buildCollapsedSectionState())
  }, [isOpen])

  const setTriggerRef = (key: string) => (node: HTMLButtonElement | null) => {
    if (node) {
      triggerRefs.current[key] = node
      return
    }

    delete triggerRefs.current[key]
  }

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const startScroll = (direction: 'up' | 'down') => {
    closePalette()
    if (scrollIntervalRef.current) return

    const step = direction === 'up' ? -50 : 50
    const scroll = () => {
      if (scrollRef.current) {
        scrollRef.current.scrollBy({ top: step, behavior: 'auto' })
      }
    }

    scroll()
    scrollIntervalRef.current = setInterval(scroll, 50)
  }

  const stopScroll = useCallback(() => {
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current)
      scrollIntervalRef.current = null
    }
  }, [])

  const openPalette = (target: PaletteTarget, event: ReactMouseEvent<HTMLButtonElement>): void => {
    event.stopPropagation()

    const targetKey = `${target.type}:${String(target.id)}`
    if (activePaletteKey === targetKey) {
      closePalette()
      return
    }

    const panelRect = panelRef.current?.getBoundingClientRect()
    const triggerRect = event.currentTarget.getBoundingClientRect()
    if (!panelRect) return

    const preferredLeft = triggerRect.right - panelRect.left - COLOR_PICKER_WIDTH
    const minLeft = 16
    const maxLeft = Math.max(minLeft, panelRect.width - COLOR_PICKER_WIDTH - 16)
    const left = Math.min(Math.max(preferredLeft, minLeft), maxLeft)

    const preferredTop = triggerRect.bottom - panelRect.top + 8
    const fallbackTop = triggerRect.top - panelRect.top - COLOR_PICKER_HEIGHT - 8
    const maxTop = Math.max(16, panelRect.height - COLOR_PICKER_HEIGHT - 16)
    const top = preferredTop <= maxTop ? preferredTop : Math.max(16, Math.min(fallbackTop, maxTop))

    setPaletteTarget(target)
    setPalettePosition({ top, left })
  }

  useEffect(() => {
    closePalette()
  }, [activeTab, isOpen, closePalette])

  useEffect(() => {
    if (!paletteTarget) return

    const stillSelected =
      paletteTarget.type === 'sensor'
        ? selectedVarIds.includes(paletteTarget.id)
        : selectedManualIds.includes(paletteTarget.id)

    if (!stillSelected) {
      closePalette()
    }
  }, [paletteTarget, selectedVarIds, selectedManualIds, closePalette])

  useEffect(() => {
    if (!activePaletteKey) return

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null
      const trigger = triggerRefs.current[activePaletteKey]

      if (
        target &&
        (paletteRef.current?.contains(target) === true || trigger?.contains(target) === true)
      ) {
        return
      }

      closePalette()
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closePalette()
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('touchstart', handlePointerDown)
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('touchstart', handlePointerDown)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [activePaletteKey, closePalette])

  useEffect(
    () => () => {
      stopScroll()
    },
    [stopScroll]
  )

  const applySeriesColor = (target: PaletteTarget, color: string, baseColor: string): void => {
    if (color === baseColor) {
      onClearSeriesColor(target.type, target.id)
    } else {
      onSetSeriesColor(target.type, target.id, color)
    }
    closePalette()
  }

  const renderPalette = () => {
    if (!paletteTarget || !palettePosition) return null

    const variable =
      paletteTarget.type === 'sensor'
        ? TREND_AVAILABLE_VARIABLES.find((item) => item.id === paletteTarget.id)
        : null
    const manual =
      paletteTarget.type === 'manual'
        ? manualSeries.find((item) => item.id === paletteTarget.id)
        : null

    const label =
      paletteTarget.type === 'sensor' && variable
        ? getTrendVariableLabel(variable.id, displayNameOverrides)
        : manual?.name
    const baseColor = variable?.color ?? manual?.color
    const currentColor =
      paletteTarget.type === 'sensor'
        ? getEffectiveSensorColor(paletteTarget.id)
        : getEffectiveManualColor(paletteTarget.id)

    if (!label || !baseColor) return null

    return (
      <PalettePopover
        ref={paletteRef}
        style={{ top: palettePosition.top, left: palettePosition.left }}
      >
        <PaletteHeader>
          <PaletteTitle>Series Color</PaletteTitle>
          <PaletteSubtitle>{label}</PaletteSubtitle>
        </PaletteHeader>

        <PaletteGrid>
          {trendColorPalette.map((color) => (
            <PaletteColorButton
              key={color}
              type="button"
              $color={color}
              $isActive={currentColor === color}
              onClick={() => applySeriesColor(paletteTarget, color, baseColor)}
              title={color}
            />
          ))}

          <DefaultColorButton
            type="button"
            $isActive={currentColor === baseColor}
            onClick={() => {
              onClearSeriesColor(paletteTarget.type, paletteTarget.id)
              closePalette()
            }}
          >
            <span>Default</span>
            <DefaultSwatch $color={baseColor} />
          </DefaultColorButton>
        </PaletteGrid>
      </PalettePopover>
    )
  }

  const renderSensorCategories = () => (
    <SectionBlock>
      {SENSOR_CATEGORIES.map((category) => {
        const variables = TREND_AVAILABLE_VARIABLES.filter(
          (variable) => variable.category === category
        )
        if (variables.length === 0) return null
        const isOpenSection = Boolean(openSections[category])

        return (
          <SectionBlock key={category}>
            <AccordionHeader type="button" onClick={() => toggleSection(category)}>
              <span>{category}</span>
              {isOpenSection ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </AccordionHeader>

            <AccordionBody $isOpen={isOpenSection}>
              {variables.map((variable) => {
                const isSelected = selectedVarIds.includes(variable.id)
                const effectiveColor = getEffectiveSensorColor(variable.id)
                const rowKey = `sensor:${variable.id}`
                const selectorLabel = formatSelectorVariableLabel(
                  variable.id,
                  getTrendVariableLabel(variable.id, displayNameOverrides)
                )

                return (
                  <SeriesRow key={variable.id}>
                    <S.VariableButton
                      type="button"
                      $isSelected={isSelected}
                      $isDisabled={sensorSelectionDisabled}
                      title={selectorLabel}
                      onClick={() => {
                        if (sensorSelectionDisabled) return
                        closePalette()
                        onToggleVar(variable.id)
                      }}
                      style={{ marginBottom: 0, flex: 1, minWidth: 0 }}
                    >
                      <S.CheckBox $isSelected={isSelected}>
                        {isSelected && <CheckCircle />}
                      </S.CheckBox>
                      <SeriesLabel>{selectorLabel}</SeriesLabel>
                    </S.VariableButton>

                    <ColorTriggerButton
                      ref={setTriggerRef(rowKey)}
                      type="button"
                      $isDisabled={colorEditingDisabled || !isSelected}
                      $isOpen={activePaletteKey === rowKey}
                      disabled={colorEditingDisabled || !isSelected}
                      onClick={(event) =>
                        !colorEditingDisabled && isSelected
                          ? openPalette({ type: 'sensor', id: variable.id }, event)
                          : undefined
                      }
                      title={
                        colorEditingDisabled
                          ? 'Series color changes are disabled in view mode'
                          : isSelected
                            ? 'Change series color'
                            : 'Select this series to enable color selection'
                      }
                    >
                      <ColorPreview $color={effectiveColor} />
                    </ColorTriggerButton>
                  </SeriesRow>
                )
              })}
            </AccordionBody>
          </SectionBlock>
        )
      })}
    </SectionBlock>
  )

  const renderManualSeries = () => (
    <SectionBlock>
      <SectionTitleRow>
        <SectionTitle>Manual Series</SectionTitle>
        <S.ActionButton
          type="button"
          onClick={() => {
            if (manualManageDisabled) return
            closePalette()
            onClose()
            onOpenManualPanel()
          }}
          disabled={manualManageDisabled}
          style={{ padding: '4px 10px' }}
        >
          <Plus size={14} /> Manage
        </S.ActionButton>
      </SectionTitleRow>

      {manualSeries.length === 0 && <EmptyText>No manual series created.</EmptyText>}

      {manualSeries.map((series) => {
        const isSelected = selectedManualIds.includes(series.id)
        const effectiveColor = getEffectiveManualColor(series.id)
        const rowKey = `manual:${series.id}`

        return (
          <SeriesRow key={series.id}>
            <S.VariableButton
              type="button"
              $isSelected={isSelected}
              $isDisabled={manualSelectionDisabled}
              title={series.name}
              onClick={() => {
                if (manualSelectionDisabled) return
                closePalette()
                onToggleManualSeries(series.id)
              }}
              style={{ marginBottom: 0, flex: 1, minWidth: 0 }}
            >
              <S.CheckBox $isSelected={isSelected}>{isSelected && <CheckCircle />}</S.CheckBox>
              <SeriesLabel>{series.name}</SeriesLabel>
            </S.VariableButton>

            <ColorTriggerButton
              ref={setTriggerRef(rowKey)}
              type="button"
              $isDisabled={colorEditingDisabled || !isSelected}
              $isOpen={activePaletteKey === rowKey}
              disabled={colorEditingDisabled || !isSelected}
              onClick={(event) =>
                !colorEditingDisabled && isSelected
                  ? openPalette({ type: 'manual', id: series.id }, event)
                  : undefined
              }
              title={
                colorEditingDisabled
                  ? 'Series color changes are disabled in view mode'
                  : isSelected
                    ? 'Change series color'
                    : 'Select this series to enable color selection'
              }
            >
              <ColorPreview $color={effectiveColor} />
            </ColorTriggerButton>
          </SeriesRow>
        )
      })}
    </SectionBlock>
  )

  return (
    <S.SidePanel ref={panelRef} $isOpen={isOpen} $width="304px">
      <S.PanelHeader>
        <h3>
          <Filter size={16} /> Trend Variables
        </h3>
        <button
          type="button"
          onClick={() => {
            closePalette()
            onClose()
          }}
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
          type="button"
          $isActive={activeTab === 'sensors'}
          onClick={() => setActiveTab('sensors')}
        >
          <Filter size={18} />
          SENSORS
        </TabButton>
        <TabButton
          type="button"
          $isActive={activeTab === 'manual'}
          onClick={() => setActiveTab('manual')}
        >
          <Plus size={18} />
          MANUAL
        </TabButton>
        <TabButton
          type="button"
          $isActive={activeTab === 'all'}
          onClick={() => setActiveTab('all')}
        >
          <Layers size={18} />
          ALL
        </TabButton>
      </TabContainer>

      <ContentWrap>
        <SummaryCard>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <SummaryLabel>Selected</SummaryLabel>
            <SummaryValue>{selectedTotal}</SummaryValue>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <Badge>Sensor {selectedSensorsCount}</Badge>
            <Badge>Manual {selectedManualCount}</Badge>
          </div>
        </SummaryCard>

        {sensorSelectionDisabled || manualSelectionDisabled || colorEditingDisabled ? (
          <EmptyText>
            View mode can choose live sensor variables to monitor, but manual series and color
            changes stay disabled.
          </EmptyText>
        ) : null}

        <ScrollButton
          type="button"
          onMouseDown={() => startScroll('up')}
          onMouseUp={stopScroll}
          onMouseLeave={stopScroll}
          onTouchStart={() => startScroll('up')}
          onTouchEnd={stopScroll}
          style={{ marginBottom: '8px' }}
        >
          <ChevronUp />
        </ScrollButton>

        <ScrollArea ref={scrollRef}>
          {activeTab === 'sensors' && renderSensorCategories()}
          {activeTab === 'manual' && renderManualSeries()}
          {activeTab === 'all' && (
            <>
              {renderSensorCategories()}
              {renderManualSeries()}
            </>
          )}
        </ScrollArea>

        <ScrollButton
          type="button"
          onMouseDown={() => startScroll('down')}
          onMouseUp={stopScroll}
          onMouseLeave={stopScroll}
          onTouchStart={() => startScroll('down')}
          onTouchEnd={stopScroll}
          style={{ marginTop: '8px' }}
        >
          <ChevronDown />
        </ScrollButton>
      </ContentWrap>

      {renderPalette()}
    </S.SidePanel>
  )
}
