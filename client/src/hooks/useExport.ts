import { useCallback, useRef, useState } from 'react'
import { toast } from 'sonner'
import axiosInstance from '@/utils/axiosInstance'
import type { ExportFormat, ExportJobStatus, StartExportParams } from '@/types/export'

const POLL_INTERVAL = 1500
const MAX_WAIT_MS = 60000

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

/**
 * Drives an async export: create the job, poll until ready, then download.
 * The server enforces one in-flight export per user; this mirrors that with a
 * busy guard. The download step is the only web-specific bit (Blob → anchor);
 * a React Native build would swap it for the native share sheet.
 */
export function useExport() {
  const [exporting, setExporting] = useState<ExportFormat | null>(null)
  const busyRef = useRef(false)

  const start = useCallback(async (params: StartExportParams) => {
    if (busyRef.current) return
    busyRef.current = true
    setExporting(params.format)
    try {
      const { data } = await axiosInstance.post('/v1/exports', params)
      const jobId: string | undefined = data?.jobId
      if (!jobId) throw new Error('Could not start export')

      const deadline = Date.now() + MAX_WAIT_MS
      let job: ExportJobStatus | null = null
      while (Date.now() < deadline) {
        await sleep(POLL_INTERVAL)
        const res = await axiosInstance.get(`/v1/exports/${jobId}`)
        job = res.data as ExportJobStatus
        if (job.status === 'ready' || job.status === 'failed') break
      }

      if (!job || job.status !== 'ready') {
        throw new Error(job?.error || 'Export timed out — try a smaller range')
      }

      // Download the bytes and hand them to the browser.
      const dl = await axiosInstance.get(`/v1/exports/${jobId}/download`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(dl.data as Blob)
      const a = document.createElement('a')
      a.href = url
      a.download = job.filename || `tracero-export.${params.format}`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)

      toast.success(`${params.format.toUpperCase()} exported`)
    } catch (err) {
      console.error('Export failed:', err)
      const msg =
        (err as { response?: { data?: { msg?: string } } })?.response?.data?.msg ||
        (err as Error)?.message ||
        'Export failed'
      toast.error(msg)
    } finally {
      busyRef.current = false
      setExporting(null)
    }
  }, [])

  return { exporting, start }
}
