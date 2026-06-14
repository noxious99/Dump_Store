import React, { useEffect, useState } from 'react'
import moment from 'moment'
import { Pencil, Trash2, Loader2, HandCoins, Ban } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { useCurrency } from '@/hooks/useCurrency'
import type { Iou } from '@/types/iou'

interface IouDetailSheetProps {
  iou: Iou | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSettle: (paidAmount?: number, paidOn?: string) => Promise<void> | void
  onCancel: () => Promise<void> | void
  onEdit: () => void
  onDelete: () => Promise<void> | void
}

type Mode = 'view' | 'settle' | 'confirm-cancel' | 'confirm-delete'

const statusText: Record<string, string> = {
  pending: 'Pending',
  partial: 'Partially paid',
  settled: 'Settled',
  cancelled: 'Cancelled',
}

const IouDetailSheet: React.FC<IouDetailSheetProps> = ({
  iou,
  open,
  onOpenChange,
  onSettle,
  onCancel,
  onEdit,
  onDelete,
}) => {
  const { symbol } = useCurrency()
  const [mode, setMode] = useState<Mode>('view')
  const [busy, setBusy] = useState(false)
  const [payAmount, setPayAmount] = useState('')
  const [payOn, setPayOn] = useState('')

  useEffect(() => {
    if (open && iou) {
      setMode('view')
      setBusy(false)
      setPayAmount(String(iou.amountRemaining))
      setPayOn(moment().format('YYYY-MM-DD'))
    }
  }, [open, iou])

  if (!iou) return null

  const lent = iou.type === 'lent'
  const open_ = iou.status === 'pending' || iou.status === 'partial'
  const paidPct =
    iou.amount > 0 ? Math.min(Math.round((iou.amountPaid / iou.amount) * 100), 100) : 0

  const handleSettle = async () => {
    const amt = Number(payAmount)
    setBusy(true)
    try {
      // Empty/full amount settles in full; a partial value records that much.
      const partial = !Number.isNaN(amt) && amt > 0 && amt < iou.amountRemaining
      await onSettle(partial ? amt : undefined, payOn || undefined)
      setMode('view')
    } finally {
      setBusy(false)
    }
  }

  const runAndClose = async (fn: () => Promise<void> | void) => {
    setBusy(true)
    try {
      await fn()
      onOpenChange(false)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-2xl max-h-[90vh] overflow-y-auto p-0 sm:max-w-md sm:mx-auto"
      >
        <SheetHeader className="px-5 pt-5 pb-0 text-left">
          <SheetTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            {lent ? 'You lent' : 'You borrowed'}
          </SheetTitle>
        </SheetHeader>

        <div className="px-5 pb-6 pt-2">
          {/* ── Identity + amount ──────────────────────── */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-xl bg-grey-x100 flex items-center justify-center text-base font-bold text-muted-foreground flex-shrink-0">
              {iou.counterpartyName?.charAt(0).toUpperCase() || '?'}
            </div>
            <div className="min-w-0">
              <p className="text-base font-semibold text-foreground truncate">
                {iou.counterpartyName}
              </p>
              <p className="text-xs text-muted-foreground">
                {statusText[iou.status]}
                {iou.counterpartyPhone ? ` · ${iou.counterpartyPhone}` : ''}
              </p>
            </div>
            <p
              className="ml-auto text-2xl font-extrabold tracking-tight whitespace-nowrap"
              style={{ color: lent ? 'var(--success)' : 'var(--error)' }}
            >
              {symbol}{iou.amount.toLocaleString()}
            </p>
          </div>

          {/* ── Paid progress ──────────────────────────── */}
          {iou.amountPaid > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
                <span>Paid {symbol}{iou.amountPaid.toLocaleString()}</span>
                <span>{symbol}{iou.amountRemaining.toLocaleString()} left</span>
              </div>
              <div className="h-1.5 bg-border rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-success transition-all duration-500"
                  style={{ width: `${paidPct}%` }}
                />
              </div>
            </div>
          )}

          {/* ── Meta ───────────────────────────────────── */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="bg-grey-x100 rounded-lg px-3 py-2">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">
                Date
              </p>
              <p className="text-sm text-foreground">
                {moment(iou.transactionDate).format('MMM D, YYYY')}
              </p>
            </div>
            <div className="bg-grey-x100 rounded-lg px-3 py-2">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">
                Payback by
              </p>
              <p className={`text-sm ${iou.isOverdue && open_ ? 'text-error font-semibold' : 'text-foreground'}`}>
                {iou.expectedPaybackDate
                  ? moment(iou.expectedPaybackDate).format('MMM D, YYYY')
                  : '—'}
              </p>
            </div>
          </div>

          {iou.note && (
            <div className="bg-grey-x100 rounded-lg px-3 py-2.5 mb-4">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">
                Note
              </p>
              <p className="text-sm text-foreground">{iou.note}</p>
            </div>
          )}

          {/* ── View actions ───────────────────────────── */}
          {mode === 'view' && (
            <div className="space-y-2">
              {open_ && (
                <button
                  onClick={() => setMode('settle')}
                  className="w-full h-11 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-accent flex items-center justify-center gap-2"
                >
                  <HandCoins className="w-4 h-4" />
                  Record payment
                </button>
              )}
              <div className="flex items-center gap-2">
                <button
                  onClick={onEdit}
                  className="flex-1 h-10 rounded-lg border border-border text-sm font-semibold text-foreground hover:bg-grey-x100 flex items-center justify-center gap-2"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Edit
                </button>
                {open_ && (
                  <button
                    onClick={() => setMode('confirm-cancel')}
                    className="flex-1 h-10 rounded-lg border border-border text-sm font-semibold text-foreground hover:bg-grey-x100 flex items-center justify-center gap-2"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    Cancel
                  </button>
                )}
                <button
                  onClick={() => setMode('confirm-delete')}
                  className="flex-1 h-10 rounded-lg border border-error/30 text-sm font-semibold text-error hover:bg-error/5 flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            </div>
          )}

          {/* ── Settle form ────────────────────────────── */}
          {mode === 'settle' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Amount received ({symbol})
                </label>
                <input
                  type="number"
                  min="0"
                  max={iou.amountRemaining}
                  autoFocus
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full h-10 px-3 text-sm rounded-lg bg-card border border-border focus:outline-none focus:border-primary text-foreground"
                />
                <p className="text-[10px] text-muted-foreground mt-1">
                  {symbol}{iou.amountRemaining.toLocaleString()} outstanding. Leave the full
                  amount to settle completely.
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Paid on
                </label>
                <input
                  type="date"
                  value={payOn}
                  onChange={(e) => setPayOn(e.target.value)}
                  className="w-full h-10 px-3 text-sm rounded-lg bg-card border border-border focus:outline-none focus:border-primary text-foreground"
                />
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => setMode('view')}
                  disabled={busy}
                  className="flex-1 h-10 rounded-lg border border-border text-sm font-semibold text-foreground hover:bg-grey-x100"
                >
                  Back
                </button>
                <button
                  onClick={handleSettle}
                  disabled={busy}
                  className="flex-1 h-10 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-accent disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {busy && <Loader2 className="w-4 h-4 animate-spin" />}
                  Record
                </button>
              </div>
            </div>
          )}

          {/* ── Confirm cancel ─────────────────────────── */}
          {mode === 'confirm-cancel' && (
            <div className="bg-grey-x100 border border-border rounded-lg p-4">
              <p className="text-sm font-semibold text-foreground mb-1">Cancel this IOU?</p>
              <p className="text-xs text-muted-foreground mb-3">
                Marks it as written off without deleting the record. You can't settle it
                afterward.
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setMode('view')}
                  disabled={busy}
                  className="flex-1 h-9 rounded-lg border border-border text-sm font-semibold text-foreground hover:bg-card"
                >
                  Keep it
                </button>
                <button
                  onClick={() => runAndClose(onCancel)}
                  disabled={busy}
                  className="flex-1 h-9 rounded-lg bg-foreground text-background text-sm font-semibold hover:opacity-90 flex items-center justify-center gap-2"
                >
                  {busy && <Loader2 className="w-4 h-4 animate-spin" />}
                  Cancel IOU
                </button>
              </div>
            </div>
          )}

          {/* ── Confirm delete ─────────────────────────── */}
          {mode === 'confirm-delete' && (
            <div className="bg-error/5 border border-error/20 rounded-lg p-4">
              <p className="text-sm font-semibold text-foreground mb-1">Delete this IOU?</p>
              <p className="text-xs text-muted-foreground mb-3">
                This permanently removes the record. This can't be undone.
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setMode('view')}
                  disabled={busy}
                  className="flex-1 h-9 rounded-lg border border-border text-sm font-semibold text-foreground hover:bg-grey-x100"
                >
                  Cancel
                </button>
                <button
                  onClick={() => runAndClose(onDelete)}
                  disabled={busy}
                  className="flex-1 h-9 rounded-lg bg-error text-white text-sm font-semibold hover:bg-error/90 flex items-center justify-center gap-2"
                >
                  {busy && <Loader2 className="w-4 h-4 animate-spin" />}
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default IouDetailSheet
