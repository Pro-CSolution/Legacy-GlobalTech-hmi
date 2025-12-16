import { useRef, useState } from 'react'
import { CheckCircle, ChevronDown, ChevronUp, Filter, Layers, Plus, X } from 'lucide-react'
import { useTheme } from 'styled-components'
import { ManualTrendSeries } from 'services/manualTrendService'
import { ParameterId } from 'types/generated/devices'
import * as S from '../TrendScreen.styles'
import { AVAILABLE_VARIABLES } from '../constants'
import styled from 'styled-components'

type TabType = 'sensors' | 'manual' | 'all'

const SENSOR_CATEGORIES = ['Electrical', 'Drive', 'Temperature', 'Mechanical', 'Process'] as const
const MANUAL_SECTION_KEY = 'Manual Series'

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
`

const ScrollArea = styled.div`
  flex: 1;
  overflow-y: hidden; /* Hidden because we use buttons to scroll */
  padding-right: 4px;
  display: flex;
  flex-direction: column;
  gap: 12px;
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
  gap: 8px;
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
  font-size: 12px;
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
  gap: 8px;
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

type Props = {
  isOpen: boolean
  onClose: () => void
  selectedVarIds: ParameterId[]
  onToggleVar: (id: ParameterId) => void
  selectedManualIds: number[]
  onToggleManualSeries: (id: number) => void
  manualSeries: ManualTrendSeries[]
  onOpenManualPanel: () => void
}

export const VariablesPanel = ({
  isOpen,
  onClose,
  selectedVarIds,
  onToggleVar,
  selectedManualIds,
  onToggleManualSeries,
  manualSeries,
  onOpenManualPanel
}: Props) => {
  const theme = useTheme()
  const [activeTab, setActiveTab] = useState<TabType>('all')
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    const base: Record<string, boolean> = {}
    SENSOR_CATEGORIES.forEach((c) => {
      base[c] = true
    })
    base[MANUAL_SECTION_KEY] = true
    return base
  })

  // Scroll ref
  const scrollRef = useRef<HTMLDivElement>(null)
  const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const selectedSensorsCount = selectedVarIds.length
  const selectedManualCount = selectedManualIds.length
  const selectedTotal = selectedSensorsCount + selectedManualCount

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const startScroll = (direction: 'up' | 'down') => {
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

  const stopScroll = () => {
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current)
      scrollIntervalRef.current = null
    }
  }

  const renderSensorCategories = () => (
    <SectionBlock>
      {SENSOR_CATEGORIES.map((cat) => {
        const vars = AVAILABLE_VARIABLES.filter((v) => v.category === cat)
        if (vars.length === 0) return null
        const isOpenCat = Boolean(openSections[cat])

        return (
          <SectionBlock key={cat}>
            <AccordionHeader onClick={() => toggleSection(cat)}>
              <span>{cat}</span>
              {isOpenCat ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </AccordionHeader>
            <AccordionBody $isOpen={isOpenCat}>
              {vars.map((v) => {
                const isSelected = selectedVarIds.includes(v.id)
                return (
                  <S.VariableButton
                    key={v.id}
                    $isSelected={isSelected}
                    $isDisabled={false}
                    onClick={() => onToggleVar(v.id)}
                  >
                    <S.CheckBox $isSelected={isSelected}>
                      {isSelected && <CheckCircle />}
                    </S.CheckBox>
                    <span style={{ flex: 1, textAlign: 'left' }}>{v.label}</span>
                    <S.ColorDot color={v.color} />
                  </S.VariableButton>
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
          onClick={() => {
            onClose()
            onOpenManualPanel()
          }}
          style={{ padding: '4px 10px' }}
        >
          <Plus size={14} /> Manage
        </S.ActionButton>
      </SectionTitleRow>

      {manualSeries.length === 0 && <EmptyText>No manual series created.</EmptyText>}

      {manualSeries.map((s) => {
        const isSelected = selectedManualIds.includes(s.id)
        return (
          <S.VariableButton
            key={s.id}
            $isSelected={isSelected}
            $isDisabled={false}
            onClick={() => onToggleManualSeries(s.id)}
          >
            <S.CheckBox $isSelected={isSelected}>{isSelected && <CheckCircle />}</S.CheckBox>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                flex: 1,
                justifyContent: 'space-between',
                paddingRight: 4
              }}
            >
              <span>{s.name}</span>
              <S.ColorDot color={s.color} />
            </div>
          </S.VariableButton>
        )
      })}
    </SectionBlock>
  )

  return (
    <S.SidePanel $isOpen={isOpen} $width="300px">
      <S.PanelHeader>
        <h3>
          <Filter size={16} /> Trend Variables
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
        <TabButton $isActive={activeTab === 'sensors'} onClick={() => setActiveTab('sensors')}>
          <Filter size={18} />
          SENSORS
        </TabButton>
        <TabButton $isActive={activeTab === 'manual'} onClick={() => setActiveTab('manual')}>
          <Plus size={18} />
          MANUAL
        </TabButton>
        <TabButton $isActive={activeTab === 'all'} onClick={() => setActiveTab('all')}>
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

        <ScrollButton
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
    </S.SidePanel>
  )
}
