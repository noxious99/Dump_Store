import React, { useEffect, useMemo, useState } from 'react'
import { Plus, Handshake, Search, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

import axiosInstance from '@/utils/axiosInstance'
import { useCurrency } from '@/hooks/useCurrency'
import IouCard from '@/feature-component/iou-tracker/IouCard'
import IouListSkeleton from '@/feature-component/iou-tracker/IouListSkeleton'
import IouFormSheet from '@/feature-component/iou-tracker/IouFormSheet'
import IouDetailSheet from '@/feature-component/iou-tracker/IouDetailSheet'
import type { Iou, IouPayload, IouSummary } from '@/types/iou'

type Filter = 'all' | 'lent' | 'borrowed' | 'settled'

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
  { value: 'settled', label: 'Settled' },
]

// Open = still owed (pending/partial); closed = settled/cancelled.
const isOpen = (i: Iou) => i.status === 'pending' || i.status === 'partial'

// Show the search field only once the list is long enough to need it.
const SEARCH_THRESHOLD = 6

const time = (d?: string) => (d ? new Date(d).getTime() : 0)

// Active items: overdue first, then soonest payback date, then most recent.
const sortActive = (a: Iou, b: Iou) => {
  if (Boolean(a.isOverdue) !== Boolean(b.isOverdue)) return a.isOverdue ? -1 : 1
  const ad = a.expectedPaybackDate ? time(a.expectedPaybackDate) : Infinity
  const bd = b.expectedPaybackDate ? time(b.expectedPaybackDate) : Infinity
  if (ad !== bd) return ad - bd
  return time(b.transactionDate) - time(a.transactionDate)
}

const IouTracker: React.FC = () => {
  const { symbol } = useCurrency()
  const [ious, setIous] = useState<Iou[]>([])
  const [summary, setSummary] = useState<IouSummary>(EMPTY_SUMMARY)
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<Filter>('all')
  const [query, setQuery] = useState('')

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
    } catch (error) {
      console.error('Error saving IOU:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to save IOU')
      throw error
    }
  }

  const handleSettle = async (paidAmount?: number, paidOn?: string, recordCashFlow?: boolean) => {
    if (!selectedIou) return
    try {
      const res = await axiosInstance.post(`/v1/iou/${selectedIou._id}/settle`, {
        paidAmount, paidOn, recordCashFlow,
      })
      await fetchData()
      const kind = res.data?.cashFlow?.kind
      toast.success(
        kind === 'income'
          ? 'Payment recorded · added to income'
          : kind === 'expense'
            ? 'Payment recorded · logged as expense'
            : 'Payment recorded'
      )
    } catch (error) {
      console.error('Error settling IOU:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to record payment')
    }
  }

  const handleCancel = async () => {
    if (!selectedIou) return
    try {
      await axiosInstance.post(`/v1/iou/${selectedIou._id}/cancel`)
      setSelectedIouId(null)
      await fetchData()
      toast.success('IOU cancelled')
    } catch (error) {
      console.error('Error cancelling IOU:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to cancel IOU')
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

  const overdueCount = useMemo(() => ious.filter((i) => i.isOverdue).length, [ious])

  // Direction + search filter, then split into Active / Settled sections.
  const { active, settled, matchCount } = useMemo(() => {
    const q = query.trim().toLowerCase()
    const matched = ious.filter((i) => {
      if ((filter === 'lent' || filter === 'borrowed') && i.type !== filter) return false
      if (filter === 'settled' && isOpen(i)) return false
      if (q && !i.counterpartyName?.toLowerCase().includes(q)) return false
      return true
    })
    return {
      active: matched.filter(isOpen).sort(sortActive),
      settled: matched
        .filter((i) => !isOpen(i))
        .sort((a, b) => time(b.transactionDate) - time(a.transactionDate)),
      matchCount: matched.length,
    }
  }, [ious, filter, query])

  const net = summary.owedToYou - summary.youOwe

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 lg:px-8 py-4 pb-24 lg:pb-8">
        {/* ── Header ─────────────────────────────────── */}
        <header className="flex items-end justify-between gap-4 mb-6">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              IOU Tracker
            </p>
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight mt-0.5 font-heading">
              Who owes who<span className="text-primary">.</span>
            </h1>
          </div>
          {/* Desktop: inline button. Mobile: the FAB below. */}
          <button
            onClick={openCreate}
            className="hidden lg:flex h-10 px-4 items-center gap-1.5 text-sm font-semibold text-primary-foreground bg-primary hover:bg-accent rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            New IOU
          </button>
        </header>

        {/* ── Overview ───────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3 mb-3">
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

        {/* Net + counts — quiet summary line under the two stat cards. */}
        {ious.length > 0 && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-5 text-xs text-muted-foreground">
            <span>
              Net{' '}
              <span
                className="font-bold"
                style={{ color: net >= 0 ? 'var(--success)' : 'var(--error)' }}
              >
                {net >= 0 ? '+' : '-'}{symbol}{Math.abs(net).toLocaleString()}
              </span>
            </span>
            <span>·</span>
            <span>{summary.pendingCount} pending</span>
            {overdueCount > 0 && (
              <>
                <span>·</span>
                <span className="font-semibold text-error">{overdueCount} overdue</span>
              </>
            )}
          </div>
        )}

        {/* ── Controls: filter + search ──────────────── */}
        {ious.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
            <div className="flex bg-grey-x100 rounded-lg p-1 w-full sm:w-auto">
              {FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value)}
                  className={`flex-1 sm:flex-none sm:px-4 h-8 rounded-md text-sm font-semibold transition-colors ${
                    filter === f.value
                      ? 'bg-card shadow-sm text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {ious.length > SEARCH_THRESHOLD && (
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by name"
                  className="w-full h-9 pl-9 pr-3 rounded-lg bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            )}
          </div>
        )}

        {/* ── List ───────────────────────────────────── */}
        {isLoading ? (
          <IouListSkeleton />
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
        ) : matchCount === 0 ? (
          <div className="text-center py-12 bg-card border border-border rounded-2xl">
            <p className="text-sm text-muted-foreground">
              {query ? `No matches for “${query}”` : `No ${filter} IOUs`}
            </p>
          </div>
        ) : (
          <div>
            {active.length > 0 && (
              <section className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  <h2 className="text-sm font-bold text-foreground">Active</h2>
                  <span className="text-[11px] font-semibold text-muted-foreground bg-grey-x100 rounded-full px-2 py-0.5">
                    {active.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {active.map((iou) => (
                    <IouCard key={iou._id} iou={iou} onClick={() => setSelectedIouId(iou._id)} />
                  ))}
                </div>
              </section>
            )}

            {settled.length > 0 && (
              <section className={active.length > 0 ? 'border-t border-border pt-6' : ''}>
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <h2 className="text-sm font-bold text-foreground">Settled</h2>
                  <span className="text-[11px] font-semibold text-muted-foreground bg-grey-x100 rounded-full px-2 py-0.5">
                    {settled.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {settled.map((iou) => (
                    <IouCard key={iou._id} iou={iou} onClick={() => setSelectedIouId(iou._id)} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>

      {/* Mobile FAB — mirrors the expense tracker's add affordance. */}
      <button
        onClick={openCreate}
        className="lg:hidden fixed bottom-20 right-5 z-40 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center active:scale-95 transition-transform"
        aria-label="New IOU"
      >
        <Plus className="w-6 h-6" />
      </button>

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
