import { Activity, X } from 'lucide-react'
import { useTheme } from 'styled-components'
import styled from 'styled-components'
import * as S from '../TrendScreen.styles'
import { CurrentValueItem } from '../types'

const PanelBody = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 12px;
  min-height: 0;
`

const ValuesList = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 8px;
  min-height: 0;
  overflow-y: auto;
  padding-right: 4px;
`

const ValueCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
  border-radius: 10px;
  background: ${({ theme }) => theme.colors.background.primary};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
`

const ValueHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

const LabelText = styled.div`
  flex: 1;
  font-size: 13px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
`

const ManualTag = styled.span`
  padding: 2px 6px;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.text.secondary};
`

const ValueRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: 8px;
`

const ValueText = styled.div`
  font-family: monospace;
  font-size: 22px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.text.primary};
`

const UnitText = styled.span`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.text.secondary};
`

const EmptyState = styled.div`
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: 20px;
  border-radius: 10px;
  border: 1px dashed ${({ theme }) => theme.colors.borders.primary};
  background: ${({ theme }) => theme.colors.background.primary};
  text-align: center;
  font-size: 13px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.text.secondary};
`

type Props = {
  isOpen: boolean
  onClose: () => void
  values: CurrentValueItem[]
  valuesByMotor?: Record<1 | 2, CurrentValueItem[]>
  isDualMotorMode?: boolean
}

const DualValuesStack = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 14px;
  min-height: 0;
  overflow-y: auto;
  padding-right: 4px;
`

const MotorValuesSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
  border-radius: 14px;
  background:
    linear-gradient(
      180deg,
      ${({ theme }) => theme.colors.background.secondary}D9 0%,
      ${({ theme }) => theme.colors.background.primary}F0 100%
    );
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03);
`

const MotorValuesHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding-bottom: 10px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borders.primary};
`

const MotorValuesTitle = styled.div`
  color: ${({ theme }) => theme.colors.text.primary};
  font-family: ${({ theme }) => theme.typography.displayFamily};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  letter-spacing: 0.08em;
  text-transform: uppercase;
`

const MotorValuesMeta = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 11px;
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  letter-spacing: 0.08em;
  text-transform: uppercase;
  white-space: nowrap;
`

const SectionValuesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

export const CurrentValuesPanel = ({
  isOpen,
  onClose,
  values,
  valuesByMotor,
  isDualMotorMode = false
}: Props) => {
  const theme = useTheme()
  const motorOneValues = valuesByMotor?.[1] ?? values
  const motorTwoValues = valuesByMotor?.[2] ?? values

  const renderValueCards = (items: CurrentValueItem[], idPrefix?: string) =>
    items.map((value) => (
      <ValueCard key={idPrefix ? `${idPrefix}-${value.id}` : value.id}>
        <ValueHeader>
          <S.ColorDot color={value.color ?? theme.colors.accent.primary} />
          <LabelText>{value.label}</LabelText>
          {value.isManual && <ManualTag>Manual</ManualTag>}
        </ValueHeader>

        <ValueRow>
          <ValueText>{value.value.toFixed(1)}</ValueText>
          {value.unit ? <UnitText>{value.unit}</UnitText> : null}
        </ValueRow>
      </ValueCard>
    ))

  return (
    <S.SidePanel $isOpen={isOpen}>
      <S.PanelHeader>
        <h3>
          <Activity size={16} /> Current Values
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

      <PanelBody>
        {values.length === 0 ? (
          <EmptyState>
            Select at least one variable or manual series to see its current value here.
          </EmptyState>
        ) : isDualMotorMode ? (
          <DualValuesStack>
            <MotorValuesSection>
              <MotorValuesHeader>
                <MotorValuesTitle>Motor #1 Values</MotorValuesTitle>
                <MotorValuesMeta>
                  {motorOneValues.length > 0
                    ? `${motorOneValues.length} series selected`
                    : 'No series selected'}
                </MotorValuesMeta>
              </MotorValuesHeader>
              <SectionValuesList>{renderValueCards(motorOneValues, 'motor-1')}</SectionValuesList>
            </MotorValuesSection>

            <MotorValuesSection>
              <MotorValuesHeader>
                <MotorValuesTitle>Motor #2 Values</MotorValuesTitle>
                <MotorValuesMeta>
                  {motorTwoValues.length > 0
                    ? `${motorTwoValues.length} series selected`
                    : 'No series selected'}
                </MotorValuesMeta>
              </MotorValuesHeader>
              <SectionValuesList>{renderValueCards(motorTwoValues, 'motor-2')}</SectionValuesList>
            </MotorValuesSection>
          </DualValuesStack>
        ) : (
          <>
            <S.CategoryTitle style={{ marginBottom: 0 }}>Values</S.CategoryTitle>
            <ValuesList>{renderValueCards(values)}</ValuesList>
          </>
        )}
      </PanelBody>
    </S.SidePanel>
  )
}
