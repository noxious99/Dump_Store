import React, { useEffect, useState } from 'react'
import { Loader2, Plus, Handshake } from 'lucide-react'
import { toast } from 'sonner'

import axiosInstance from '@/utils/axiosInstance'
import { useCurrency } from '@/hooks/useCurrency'
import IouCard from '@/feature-component/iou-tracker/IouCard'
import IouFormSheet from '@/feature-component/iou-tracker/IouFormSheet'
import IouDetailSheet from '@/feature-component/iou-tracker/IouDetailSheet'
import type { Iou, IouPayload, IouSummary } from '@/types/iou'

type Filter = 'all' | 'lent' | 'borrowed'

const EMPTY_SUMMARY: IouSummary = {
  youOwe: 0,
  owedToYou: 0,
  net: 0,
  pendingCount: 0,
  people: [],
}

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'lent', label: 'Lent' },
  { value: 'borrowed', label: 'Borrowed' },
]

// Open items first (pending/partial), then settled/cancelled.
const isOpen = (i: Iou) => i.status === 'pending' || i.status === 'partial'

const IouTracker: React.FC = () => {
  const { symbol } = useCurrency()
  const [ious, setIous] = useState<Iou[]>([])
  const [summary, setSummary] = useState<IouSummary>(EMPTY_SUMMARY)
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<Filter>('all')

  const [formOpen, setFormOpen] = useState(false)
  const [editingIou, setEditingIou] = useState<Iou | null>(null)
  const [selectedIouId, setSelectedIouId] = useState<string | null>(null)

  const selectedIou = ious.find((i) => i._id === selectedIouId) ?? null

  const fetchData = async () => {
    try {
      const [listRes, summaryRes] = await Promise.all([
        axiosInstance.get('/v1/iou'),
        axiosInstance.get('/v1/iou/summary').catch(() => ({ data: EMPTY_SUMMARY })),
      ])
      setIous(listRes.data?.ious ?? [])
      setSummary({ ...EMPTY_SUMMARY, ...(summaryRes.data ?? {}) })
    } catch (error) {
      console.error('Error fetching IOUs:', error)
      toast.error('Failed to load IOUs')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSubmitIou = async (payload: IouPayload) => {
    try {
      if (editingIou) {
        await axiosInstance.patch(`/v1/iou/${editingIou._id}`, payload)
        toast.success('IOU updated')
      } else {
        await axiosInstance.post('/v1/iou', payload)
        toast.success('IOU added')
      }
      await fetchData()
    } catch (error: any) {
      console.error('Error saving IOU:', error)
      toast.error(error?.message || 'Failed to save IOU')
      throw error
    }
  }

  const handleSettle = async (paidAmount?: number, paidOn?: string) => {
    if (!selectedIou) return
    try {
      await axiosInstance.post(`/v1/iou/${selectedIou._id}/settle`, { paidAmount, paidOn })
      await fetchData()
      toast.success('Payment recorded')
    } catch (error: any) {
      console.error('Error settling IOU:', error)
      toast.error(error?.message || 'Failed to record payment')
    }
  }

  const handleCancel = async () => {
    if (!selectedIou) return
    try {
      await axiosInstance.post(`/v1/iou/${selectedIou._id}/cancel`)
      setSelectedIouId(null)
      await fetchData()
      toast.success('IOU cancelled')
    } catch (error: any) {
      console.error('Error cancelling IOU:', error)
      toast.error(error?.message || 'Failed to cancel IOU')
    }
  }

  const handleDelete = async () => {
    if (!selectedIou) return
    try {
      await axiosInstance.delete(`/v1/iou/${selectedIou._id}`)
      setSelectedIouId(null)
      await fetchData()
      toast.success('IOU deleted')
    } catch (error) {
      console.error('Error deleting IOU:', error)
      toast.error('Failed to delete IOU')
    }
  }

  const openCreate = () => {
    setEditingIou(null)
    setFormOpen(true)
  }

  const openEdit = () => {
    if (!selectedIou) return
    setEditingIou(selectedIou)
    setSelectedIouId(null)
    setFormOpen(true)
  }

  const filtered = ious
    .filter((i) => (filter === 'all' ? true : i.type === filter))
    .sort((a, b) => Number(isOpen(b)) - Number(isOpen(a)))

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 lg:px-8 py-6">
        {/* ── Header ─────────────────────────────────── */}
        <header className="flex items-center justify-between mb-5">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              IOU Tracker
            </p>
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight mt-0.5 font-heading">
              Who owes who<span className="text-primary">.</span>
            </h1>
          </div>
          <button
            onClick={openCreate}
            className="h-10 px-4 flex items-center gap-1.5 text-sm font-semibold text-primary-foreground bg-primary hover:bg-accent rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            New IOU
          </button>
        </header>

        {/* ── Summary strip ──────────────────────────── */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-card border border-border rounded-2xl px-4 py-3">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
              Owed to you
            </p>
            <p className="text-xl font-extrabold text-success tracking-tight">
              {symbol}{summary.owedToYou.toLocaleString()}
            </p>
          </div>
          <div className="bg-card border border-border rounded-2xl px-4 py-3">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
              You owe
            </p>
            <p className="text-xl font-extrabold text-error tracking-tight">
              {symbol}{summary.youOwe.toLocaleString()}
            </p>
          </div>
        </div>

        {/* ── Filter tabs ────────────────────────────── */}
        <div className="flex items-center gap-1 bg-card border border-border rounded-lg p-1 mb-4 w-fit">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-3.5 py-1.5 rounded-md text-sm font-semibold transition-colors ${
                filter === f.value
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* ── List ───────────────────────────────────── */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading your IOUs...</p>
          </div>
        ) : ious.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <Handshake className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-lg font-bold text-foreground">No IOUs yet</h2>
            <p className="text-sm text-muted-foreground mt-1 mb-5 max-w-xs">
              Track money you've lent or borrowed so nothing slips through the cracks.
            </p>
            <button
              onClick={openCreate}
              className="h-10 px-5 flex items-center gap-1.5 text-sm font-semibold text-primary-foreground bg-primary hover:bg-accent rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add an IOU
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 bg-card border border-border rounded-2xl">
            <p className="text-sm text-muted-foreground">
              No {filter} IOUs
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filtered.map((iou) => (
              <IouCard
                key={iou._id}
                iou={iou}
                onClick={() => setSelectedIouId(iou._id)}
              />
            ))}
          </div>
        )}
      </div>

      <IouFormSheet
        open={formOpen}
        onOpenChange={setFormOpen}
        iou={editingIou}
        onSubmit={handleSubmitIou}
      />

      <IouDetailSheet
        iou={selectedIou}
        open={Boolean(selectedIouId)}
        onOpenChange={(o) => !o && setSelectedIouId(null)}
        onSettle={handleSettle}
        onCancel={handleCancel}
        onEdit={openEdit}
        onDelete={handleDelete}
      />
    </div>
  )
}

export default IouTracker
