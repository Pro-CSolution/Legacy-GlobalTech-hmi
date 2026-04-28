import { useState } from 'react'
import {
  Activity,
  CalendarRange,
  Filter,
  Mail,
  Play,
  Plus,
  SlidersHorizontal,
  Square,
  X
} from 'lucide-react'
import * as S from '../TrendScreen.styles'
import type { TrendCustomRange, TrendRangeMode } from '../types'

type TimeRangeOption = { label: string; value: number }

type Props = {
  timeRange: number
  rangeMode: TrendRangeMode
  timeRanges: TimeRangeOption[]
  onSelectRange: (minutes: number) => void
  customRange: TrendCustomRange
  customRangeError: string | null
  activeRangeSummary: string | null
  canApplyCustomRange: boolean
  maxRangeDateTime: string
  onChangeRangeStart: (value: string) => void
  onChangeRangeEnd: (value: string) => void
  onApplyCustomRange: () => void
  onClearCustomRange: () => void
  selectedCount: number
  isVariablesOpen: boolean
  onToggleVariables: () => void
  isManualOpen: boolean
  onToggleManual: () => void
  manualDisabled?: boolean
  isScaleOpen: boolean
  onToggleScale: () => void
  isCurrentValuesOpen: boolean
  onToggleCurrentValues: () => void
  isReportOpen: boolean
  onToggleReport: () => void
  reportDisabled?: boolean
  isRecording: boolean
  onToggleRecording: () => void
  recordingDisabled?: boolean
}

export const TrendToolbar = ({
  timeRange,
  rangeMode,
  timeRanges,
  onSelectRange,
  customRange,
  customRangeError,
  activeRangeSummary,
  canApplyCustomRange,
  maxRangeDateTime,
  onChangeRangeStart,
  onChangeRangeEnd,
  onApplyCustomRange,
  onClearCustomRange,
  selectedCount,
  isVariablesOpen,
  onToggleVariables,
  isManualOpen,
  onToggleManual,
  manualDisabled = false,
  isScaleOpen,
  onToggleScale,
  isCurrentValuesOpen,
  onToggleCurrentValues,
  isReportOpen,
  onToggleReport,
  reportDisabled = false,
  isRecording,
  onToggleRecording,
  recordingDisabled = false
}: Props) => {
  const [isRangeOpen, setIsRangeOpen] = useState(false)

  const handleApplyRange = (): void => {
    onApplyCustomRange()
    setIsRangeOpen(false)
  }

  const handleUsePreset = (): void => {
    onClearCustomRange()
    setIsRangeOpen(false)
  }

  return (
    <>
      <S.Toolbar>
        <S.ToolbarMain>
          <S.ButtonGroup>
            {timeRanges.map((range) => (
              <S.TimeButton
                key={range.value}
                $isActive={rangeMode === 'relative' && timeRange === range.value}
                onClick={() => onSelectRange(range.value)}
              >
                {range.label}
              </S.TimeButton>
            ))}
          </S.ButtonGroup>

          <S.RangeTriggerButton
            $isActive={rangeMode === 'absolute'}
            onClick={() => setIsRangeOpen(true)}
          >
            <CalendarRange size={16} />
            <span>Select Range</span>
          </S.RangeTriggerButton>

          {rangeMode === 'absolute' && activeRangeSummary && (
            <S.RangeSummaryChip>{activeRangeSummary}</S.RangeSummaryChip>
          )}
        </S.ToolbarMain>

        <S.ToolbarActions>
          <S.ActionButton
            $variant={isVariablesOpen ? 'primary' : undefined}
            onClick={onToggleVariables}
          >
            <Filter size={14} />
            <span>VARIABLES ({selectedCount})</span>
          </S.ActionButton>
          <S.ActionButton
            $variant={isManualOpen ? 'primary' : undefined}
            onClick={onToggleManual}
            disabled={manualDisabled}
          >
            <Plus size={14} />
            <span>MANUAL VALUE</span>
          </S.ActionButton>
          <S.ActionButton $variant={isScaleOpen ? 'primary' : undefined} onClick={onToggleScale}>
            <SlidersHorizontal size={14} />
            <span>Y SCALE</span>
          </S.ActionButton>
          <S.ActionButton
            $variant={isCurrentValuesOpen ? 'primary' : undefined}
            onClick={onToggleCurrentValues}
          >
            <Activity size={14} />
            <span>CURRENT VALUES</span>
          </S.ActionButton>
          <S.ActionButton
            $variant={isRecording ? 'danger' : 'success'}
            onClick={onToggleRecording}
            disabled={recordingDisabled}
          >
            {isRecording ? <Square size={14} /> : <Play size={14} />}
            <span>{isRecording ? 'STOP RECORDING DATA' : 'START RECORDING DATA'}</span>
          </S.ActionButton>
          <S.ActionButton
            $variant={isReportOpen ? 'primary' : undefined}
            onClick={onToggleReport}
            disabled={reportDisabled}
          >
            <Mail size={14} />
            <span>SEND REPORT</span>
          </S.ActionButton>
        </S.ToolbarActions>
      </S.Toolbar>

      {isRangeOpen && (
        <S.ModalOverlay onClick={() => setIsRangeOpen(false)}>
          <S.RangeDialog onClick={(event) => event.stopPropagation()}>
            <S.RangeDialogHeader>
              <div>
                <S.RangeDialogTitle>Select Range</S.RangeDialogTitle>
                <S.RangeDialogSubtitle>
                  Touch-friendly custom range up to 2 months.
                </S.RangeDialogSubtitle>
              </div>

              <S.RangeDialogClose
                onClick={() => setIsRangeOpen(false)}
                aria-label="Close range popup"
              >
                <X size={16} />
              </S.RangeDialogClose>
            </S.RangeDialogHeader>

            <S.RangeDialogBody>
              <S.RangeMetaRow>
                <S.RangeBadge $active={rangeMode === 'absolute'}>
                  {rangeMode === 'absolute' ? 'Custom range active' : 'Using preset window'}
                </S.RangeBadge>
                <S.RangeMetaText>Maximum: 2 months</S.RangeMetaText>
              </S.RangeMetaRow>

              <S.RangeInputStack>
                <S.RangeInputGroup>
                  <S.RangeLabel>From</S.RangeLabel>
                  <S.RangeInput
                    type="datetime-local"
                    step={60}
                    value={customRange.start}
                    max={maxRangeDateTime}
                    onChange={(event) => onChangeRangeStart(event.target.value)}
                  />
                </S.RangeInputGroup>

                <S.RangeInputGroup>
                  <S.RangeLabel>To</S.RangeLabel>
                  <S.RangeInput
                    type="datetime-local"
                    step={60}
                    value={customRange.end}
                    min={customRange.start || undefined}
                    max={maxRangeDateTime}
                    onChange={(event) => onChangeRangeEnd(event.target.value)}
                  />
                </S.RangeInputGroup>
              </S.RangeInputStack>

              <S.RangeHint $tone={customRangeError ? 'error' : 'default'}>
                {customRangeError ??
                  activeRangeSummary ??
                  'Pick the historical slice you want to inspect.'}
              </S.RangeHint>
            </S.RangeDialogBody>

            <S.RangeDialogFooter>
              {rangeMode === 'absolute' && (
                <S.RangeActionButton onClick={handleUsePreset}>USE PRESET</S.RangeActionButton>
              )}
              <S.RangeActionButton onClick={() => setIsRangeOpen(false)}>CLOSE</S.RangeActionButton>
              <S.RangeActionButton
                $variant="primary"
                disabled={!canApplyCustomRange}
                onClick={handleApplyRange}
              >
                APPLY
              </S.RangeActionButton>
            </S.RangeDialogFooter>
          </S.RangeDialog>
        </S.ModalOverlay>
      )}
    </>
  )
}
