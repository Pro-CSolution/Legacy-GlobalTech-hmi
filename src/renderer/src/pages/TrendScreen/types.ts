export type ManualMode = 'new' | 'existing'

export type TrendYAxisScaleMode = 'auto' | 'manual'
export type TrendRangeMode = 'relative' | 'absolute'

export type TrendCustomRange = {
  start: string
  end: string
}

export type TrendYAxisScaleState = {
  mode: TrendYAxisScaleMode
  min: string
  max: string
}

export type ManualFormState = {
  seriesId?: number
  name: string
  unit: string
  color: string
  value: string
  time: string
  note: string
  createdBy: string
  pointId?: number
}

export type CurrentValueItem = {
  id: string
  label: string
  color?: string
  value: number
  unit?: string | null
  isManual?: boolean
}
