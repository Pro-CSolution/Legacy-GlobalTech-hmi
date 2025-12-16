import { Filter, Mail, Plus } from 'lucide-react'
import * as S from '../TrendScreen.styles'

type TimeRangeOption = { label: string; value: number }

type Props = {
  timeRange: number
  timeRanges: TimeRangeOption[]
  onSelectRange: (minutes: number) => void
  selectedCount: number
  isVariablesOpen: boolean
  onToggleVariables: () => void
  isManualOpen: boolean
  onToggleManual: () => void
  isReportOpen: boolean
  onToggleReport: () => void
}

export const TrendToolbar = ({
  timeRange,
  timeRanges,
  onSelectRange,
  selectedCount,
  isVariablesOpen,
  onToggleVariables,
  isManualOpen,
  onToggleManual,
  isReportOpen,
  onToggleReport
}: Props) => {
  return (
    <S.Toolbar>
      <S.ButtonGroup>
        {timeRanges.map((range) => (
          <S.TimeButton
            key={range.value}
            $isActive={timeRange === range.value}
            onClick={() => onSelectRange(range.value)}
          >
            {range.label}
          </S.TimeButton>
        ))}
      </S.ButtonGroup>

      <S.ButtonGroup>
        <S.ActionButton $variant={isVariablesOpen ? 'primary' : undefined} onClick={onToggleVariables}>
          <Filter size={14} />
          <span>VARIABLES ({selectedCount})</span>
        </S.ActionButton>
        <S.ActionButton $variant={isManualOpen ? 'primary' : undefined} onClick={onToggleManual}>
          <Plus size={14} />
          <span>MANUAL VALUE</span>
        </S.ActionButton>
        <S.ActionButton $variant={isReportOpen ? 'primary' : undefined} onClick={onToggleReport}>
          <Mail size={14} />
          <span>SEND REPORT</span>
        </S.ActionButton>
      </S.ButtonGroup>
    </S.Toolbar>
  )
}
