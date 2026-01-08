import { apiService } from './index'

const REPORT_SEND_TIMEOUT_MS = 180000

export type TrendReportImageAttachment = {
  filename: string
  mimeType: 'image/png' | 'image/jpeg'
  /** Base64 (without data: prefix) */
  contentBase64: string
}

export type ClientMotorExtraField = {
  label: string
  value: string
}

export type ClientMotorInfo = {
  customer: string
  model: string
  catalog: string
  hp: string
  rpm: string
  volts: string
  amps: string
  hz: string
  frame: string
  duty: string
  enclosure: string
  tempRise: string
  serviceFactor: string
  efficiency: string
  inverterRating: string
  extras: ClientMotorExtraField[]
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
  clientMotorInfo?: ClientMotorInfo
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
  return apiService.post('/reports/trend-email', payload, { timeout: REPORT_SEND_TIMEOUT_MS })
}

export async function sendVideoReportEmail(
  blob: Blob,
  email: string
): Promise<SendTrendReportEmailResponse> {
  const formData = new FormData()
  // Filename is optional here as we set it in the backend if missing,
  // but helpful to provide one with extension.
  formData.append('file', blob, 'recording.webm')
  formData.append('email', email)

  return apiService.post('/reports/trend-email/video', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    timeout: REPORT_SEND_TIMEOUT_MS
  })
}
