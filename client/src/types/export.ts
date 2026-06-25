// Data export (CSV / PDF). Framework-agnostic types — these transfer directly
// to the future React Native app; only the download step (web Blob vs RN share
// sheet) needs swapping.
export type ExportFormat = 'csv' | 'pdf'

export type ExportStatus = 'queued' | 'processing' | 'ready' | 'failed'

export interface ExportJobStatus {
  jobId: string
  status: ExportStatus
  format: ExportFormat
  filename?: string
  mimeType?: string
  size?: number
  error?: string
}

export interface StartExportParams {
  format: ExportFormat
  /** ISO datetime strings (inclusive range). */
  from: string
  to: string
  label?: string
  currency?: string
  symbol?: string
}
