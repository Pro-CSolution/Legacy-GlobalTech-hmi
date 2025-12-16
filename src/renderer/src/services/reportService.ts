import { apiService } from './index'

export type TrendReportImageAttachment = {
  filename: string
  mimeType: 'image/png' | 'image/jpeg'
  /** Base64 (sin prefijo data:) */
  contentBase64: string
}

export type TrendReportSensorSeries = {
  kind: 'sensor'
  parameterId: string
  label: string
  unit?: string | null
}

export type TrendReportManualSeries = {
  kind: 'manual'
  seriesId: number
  label: string
  unit?: string | null
}

export type TrendReportSeries = TrendReportSensorSeries | TrendReportManualSeries

export type SendTrendReportEmailRequest = {
  recipients: string[]
  /** If true, sends recipients as BCC to hide addresses */
  privateMode?: boolean
  subject?: string
  note?: string
  timeRange: {
    start: string
    end: string
  }
  series: TrendReportSeries[]
  images: TrendReportImageAttachment[]
}

export type SendTrendReportEmailResponse = {
  status: 'sent'
  id?: string
  recipients: string[]
  attachments: number
}

export async function sendTrendReportEmail(
  payload: SendTrendReportEmailRequest
): Promise<SendTrendReportEmailResponse> {
  return apiService.post('/reports/trend-email', payload)
}
