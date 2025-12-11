import React, { useState, useMemo } from 'react'
import { Filter, Mail, X, Plus, CheckCircle, AlertTriangle, RefreshCcw, Send } from 'lucide-react'
import { useTheme } from 'styled-components'
import { TrendChart } from '../../components/TrendChart'
import { ScreenLayout } from '../../layouts'
import { useTrendData } from '../../hooks'
import { ParameterAlias, PARAMETER_ALIASES } from '../../types/generated/devices'
import * as S from './TrendScreen.styles'

// --- Configuration ---

const AVAILABLE_VARIABLES = [
  {
    id: PARAMETER_ALIASES.motorVolts,
    label: 'Line Voltage',
    unit: 'VAC',
    color: '#06b6d4',
    category: 'Electrical'
  },
  {
    id: PARAMETER_ALIASES.motorCurrent,
    label: 'Total Current',
    unit: 'A',
    color: '#10b981',
    category: 'Electrical'
  },
  {
    id: PARAMETER_ALIASES.motorPower,
    label: 'Active Power',
    unit: 'kW',
    color: '#8b5cf6',
    category: 'Electrical'
  },
  {
    id: PARAMETER_ALIASES.frequencyFeedback,
    label: 'Frequency',
    unit: 'Hz',
    color: '#f59e0b',
    category: 'Drive'
  },
  {
    id: PARAMETER_ALIASES.torqueDemand,
    label: 'Motor Torque',
    unit: '%',
    color: '#f43f5e',
    category: 'Drive'
  },
  {
    id: PARAMETER_ALIASES.cdcElectronicsTemperature,
    label: 'Winding Temp',
    unit: '°C',
    color: '#3b82f6',
    category: 'Temperature'
  },
  {
    id: PARAMETER_ALIASES.inputBridgeTemperature,
    label: 'Bearing Temp',
    unit: '°C',
    color: '#ec4899',
    category: 'Temperature'
  },
  {
    id: PARAMETER_ALIASES.driveCurrent,
    label: 'Vibration X',
    unit: 'mm/s',
    color: '#d946ef',
    category: 'Mechanical'
  },
  {
    id: PARAMETER_ALIASES.torqueLimitPositive1,
    label: 'Coolant Pressure',
    unit: 'PSI',
    color: '#14b8a6',
    category: 'Process'
  },
  {
    id: PARAMETER_ALIASES.jogSpeed1,
    label: 'Jog Speed 1',
    unit: '',
    color: '#14b8a6',
    category: 'Process'
  }
]

const TIME_RANGES = [
  { label: '1M', value: 1 },
  { label: '5M', value: 5 },
  { label: '15M', value: 15 },
  { label: '30M', value: 30 },
  { label: '1H', value: 60 }
]

const TrendScreen: React.FC = () => {
  const theme = useTheme()

  // State
  const [selectedVarIds, setSelectedVarIds] = useState<ParameterAlias[]>([
    PARAMETER_ALIASES.motorVolts,
    PARAMETER_ALIASES.motorCurrent,
    PARAMETER_ALIASES.frequencyFeedback
  ])
  const [timeRange, setTimeRange] = useState<number>(60) // Minutes
  const [isConfigOpen, setIsConfigOpen] = useState(false)
  const [isReportOpen, setIsReportOpen] = useState(false)

  // Report State
  const [emailList, setEmailList] = useState<string[]>(['admin@plant.com'])
  const [newEmail, setNewEmail] = useState('')
  const [isSending, setIsSending] = useState(false)

  // Live data from backend
  const { datasets, xDomain } = useTrendData('drive_avid', selectedVarIds, {
    windowMinutes: timeRange
  })

  // Handlers
  const handleToggleVar = (id: string): void => {
    if (selectedVarIds.includes(id)) {
      setSelectedVarIds((prev) => prev.filter((v) => v !== id))
    } else {
      if (selectedVarIds.length < 5) {
        setSelectedVarIds((prev) => [...prev, id])
      }
    }
  }

  const handleAddEmail = (): void => {
    if (newEmail && newEmail.includes('@')) {
      setEmailList([...emailList, newEmail])
      setNewEmail('')
    }
  }

  const handleSendReport = (): void => {
    setIsSending(true)
    setTimeout(() => {
      setIsSending(false)
      setIsReportOpen(false)
    }, 2000)
  }

  // Legend Values (Current)
  const currentValues = useMemo(() => {
    return datasets.map((ds) => ({
      id: ds.label || ds.parameterId,
      label: ds.label || ds.parameterId,
      color: ds.borderColor,
      value: ds.data.length > 0 ? ds.data[ds.data.length - 1].y : 0,
      unit: AVAILABLE_VARIABLES.find((v) => v.id === ds.parameterId)?.unit
    }))
  }, [datasets])

  return (
    <ScreenLayout>
      <S.ScreenContainer>
        {/* Toolbar */}
        <S.Toolbar>
          <S.ButtonGroup>
            {TIME_RANGES.map((range) => (
              <S.TimeButton
                key={range.value}
                $isActive={timeRange === range.value}
                onClick={() => setTimeRange(range.value)}
              >
                {range.label}
              </S.TimeButton>
            ))}
          </S.ButtonGroup>

          <S.ButtonGroup>
            <S.ActionButton onClick={() => setIsConfigOpen(true)}>
              <Filter size={14} />
              <span>VARIABLES ({selectedVarIds.length}/5)</span>
            </S.ActionButton>
            <S.ActionButton
              $variant={isReportOpen ? 'primary' : undefined}
              onClick={() => setIsReportOpen(!isReportOpen)}
            >
              <Mail size={14} />
              <span>SEND REPORT</span>
            </S.ActionButton>
          </S.ButtonGroup>
        </S.Toolbar>

        {/* Main Content */}
        <S.ContentArea>
          <S.ChartSection $isShrunk={isReportOpen}>
            <TrendChart
              datasets={datasets}
              timeWindow={timeRange}
              showLegend={false}
              showTitle={false}
              responsive={true}
              maintainAspectRatio={false}
              gridColor={theme.colors.borders.primary}
              height={'97%'}
              width={'98%'}
              scales={{
                x: {
                  min: xDomain?.min,
                  max: xDomain?.max,
                  ticks: {
                    callback: (val: unknown): string => {
                      const date = new Date((val as number) * 1000)
                      return date.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })
                    }
                  }
                }
              }}
            />

            {/* Floating Legend */}
            <S.LegendBox>
              <S.CategoryTitle>Current Values</S.CategoryTitle>
              {currentValues.map((val, idx) => (
                <S.LegendItem key={idx}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <S.ColorDot color={val.color!} />
                    <span style={{ color: theme.colors.text.secondary }}>{val.label}</span>
                  </div>
                  <div style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                    {val.value.toFixed(1)}{' '}
                    <span style={{ fontSize: '10px', color: theme.colors.text.secondary }}>
                      {' '}
                      {val.unit}
                    </span>
                  </div>
                </S.LegendItem>
              ))}
            </S.LegendBox>
          </S.ChartSection>

          {/* Report Panel */}
          <S.ReportPanel $isOpen={isReportOpen}>
            <S.PanelHeader>
              <h3>
                <Mail size={16} /> Automatic Report
              </h3>
              <button
                onClick={() => setIsReportOpen(false)}
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

            <div
              style={{ fontSize: '12px', color: theme.colors.text.secondary, lineHeight: '1.4' }}
            >
              Generate Excel report (.xlsx) with snapshot of current trend.
            </div>

            <S.CategoryTitle>Recipients</S.CategoryTitle>
            <S.EmailList>
              {emailList.map((email, idx) => (
                <S.EmailItem key={idx}>
                  <span>{email}</span>
                  {idx > 0 && (
                    <button onClick={() => setEmailList((l) => l.filter((e) => e !== email))}>
                      <X size={12} />
                    </button>
                  )}
                  {idx === 0 && (
                    <span
                      style={{
                        fontSize: '9px',
                        padding: '2px 4px',
                        border: `1px solid ${theme.colors.borders.primary}`,
                        borderRadius: '2px'
                      }}
                    >
                      FIXED
                    </span>
                  )}
                </S.EmailItem>
              ))}
            </S.EmailList>

            <S.InputGroup>
              <input
                type="email"
                placeholder="new@email.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddEmail()}
              />
              <S.ActionButton onClick={handleAddEmail}>
                <Plus size={16} />
              </S.ActionButton>
            </S.InputGroup>

            <S.ActionButton
              $variant="success"
              style={{ marginTop: 'auto', justifyContent: 'center', padding: '12px' }}
              onClick={handleSendReport}
              disabled={isSending}
            >
              {isSending ? (
                <>
                  <RefreshCcw size={16} className="animate-spin" />
                  <span>SENDING...</span>
                </>
              ) : (
                <>
                  <Send size={16} />
                  <span>SEND REPORT</span>
                </>
              )}
            </S.ActionButton>
          </S.ReportPanel>
        </S.ContentArea>

        {/* Variables Modal */}
        {isConfigOpen && (
          <S.ModalOverlay onClick={() => setIsConfigOpen(false)}>
            <S.ModalContent onClick={(e) => e.stopPropagation()}>
              <S.ModalHeader>
                <h3>
                  <Filter size={18} /> Select Trend Variables
                </h3>
                <button
                  onClick={() => setIsConfigOpen(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: theme.colors.text.secondary
                  }}
                >
                  <X size={20} />
                </button>
              </S.ModalHeader>

              <S.ModalBody>
                <div
                  style={{
                    marginBottom: '16px',
                    padding: '8px',
                    backgroundColor: `${theme.colors.status.warning}20`,
                    border: `1px solid ${theme.colors.status.warning}50`,
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    fontSize: '12px',
                    color: theme.colors.status.warning
                  }}
                >
                  <AlertTriangle size={14} />
                  <span>
                    Current Selection: <strong>{selectedVarIds.length}</strong> / 5 max variables
                  </span>
                </div>

                <S.CategoryGrid>
                  {['Electrical', 'Drive', 'Temperature', 'Mechanical', 'Process'].map((cat) => {
                    const vars = AVAILABLE_VARIABLES.filter((v) => v.category === cat)
                    if (vars.length === 0) return null

                    return (
                      <S.CategoryCard key={cat}>
                        <S.CategoryTitle>{cat}</S.CategoryTitle>
                        {vars.map((v) => {
                          const isSelected = selectedVarIds.includes(v.id)
                          const isDisabled = !isSelected && selectedVarIds.length >= 5

                          return (
                            <S.VariableButton
                              key={v.id}
                              isSelected={isSelected}
                              isDisabled={isDisabled}
                              onClick={() => handleToggleVar(v.id)}
                              disabled={isDisabled}
                            >
                              <S.CheckBox isSelected={isSelected}>
                                {isSelected && <CheckCircle />}
                              </S.CheckBox>
                              <span>{v.label}</span>
                              <S.ColorDot color={v.color} />
                            </S.VariableButton>
                          )
                        })}
                      </S.CategoryCard>
                    )
                  })}
                </S.CategoryGrid>
              </S.ModalBody>

              <S.ModalFooter>
                <S.ActionButton $variant="primary" onClick={() => setIsConfigOpen(false)}>
                  APPLY CHANGES
                </S.ActionButton>
              </S.ModalFooter>
            </S.ModalContent>
          </S.ModalOverlay>
        )}
      </S.ScreenContainer>
    </ScreenLayout>
  )
}

export default TrendScreen
