import { Dataset } from 'components/TrendChart/TrendChart.types'
import { ManualTrendSeries } from './manualTrendService'

export type TrendReportPayload = {
  generatedAt: string
  datasets: Dataset[]
  manualSeries: ManualTrendSeries[]
}

export const buildTrendReportPayload = (
  datasets: Dataset[],
  manualSeries: ManualTrendSeries[]
): TrendReportPayload => ({
  generatedAt: new Date().toISOString(),
  datasets,
  manualSeries
})
