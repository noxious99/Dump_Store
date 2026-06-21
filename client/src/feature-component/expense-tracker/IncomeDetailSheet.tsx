import React, { useEffect, useState } from 'react'
import moment from 'moment'
import { Pencil, Trash2, Loader2 } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { incomeSourceOptions } from '@/utils/constant'
import { CategoryIcon } from '@/components/CategoryIcon'
import type { IncomeRecord } from '@/types/expenseTracker'
import { useCurrency } from '@/hooks/useCurrency'

interface IncomeDetailSheetProps {
  record: IncomeRecord | null
  open: boolean
  onOpenChange: (open: boolean) => void
  readOnly?: boolean
  onSave: (
    incomeId: string,
    payload: { amount: number; source: string; note: string }
  ) => Promise<void> | void
  onDelete: (incomeId: string) => Promise<void> | void
}

type Mode = 'view' | 'edit' | 'confirm-delete'

const fmt = (n: number) => Math.round(n).toLocaleString()
const sourceLabel = (source: string) =>
  incomeSourceOptions.find((o) => o.value === source)?.label || source

const IncomeDetailSheet: React.FC<IncomeDetailSheetProps> = ({
  record,
  open,
  onOpenChange,
  readOnly = false,
  onSave,
  onDelete,
}) => {
  const { symbol } = useCurrency()
  const [mode, setMode] = useState<Mode>('view')
  const [isBusy, setIsBusy] = useState(false)
  const [draft, setDraft] = useState({ amount: '', source: '', note: '' })

  // Reset to a clean view whenever a (new) record is shown
  useEffect(() => {
    if (open && record) {
      setMode('view')
      setIsBusy(false)
      setDraft({
        amount: String(record.amount),
        source: record.source,
        note: record.note || '',
      })
    }
  }, [open, record])

  if (!record) return null

  const when = moment(record.createdAt)
  const draftAmount = Number(draft.amount)
  const canSave = !Number.isNaN(draftAmount) && draftAmount > 0 && draft.source

  const handleSave = async () => {
    if (!canSave) return
    setIsBusy(true)
    try {
      await onSave(record._id, {
        amount: draftAmount,
        source: draft.source,
        note: draft.note.trim(),
      })
      onOpenChange(false)
    } finally {
      setIsBusy(false)
    }
  }

  const handleDelete = async () => {
    setIsBusy(true)
    try {
      await onDelete(record._id)
      onOpenChange(false)
    } finally {
      setIsBusy(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-2xl max-h-[88vh] overflow-y-auto p-0 sm:max-w-md sm:mx-auto"
      >
        <SheetHeader className="px-5 pt-5 pb-0 text-left">
          <SheetTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Income record
          </SheetTitle>
        </SheetHeader>

        <div className="px-5 pb-6 pt-3">
          {/* ── Identity ──────────────────────────────────────── */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-xl bg-grey-x100 flex items-center justify-center flex-shrink-0">
              <CategoryIcon name={record.source} size={20} fallback="salary" />
            </div>
            <div className="min-w-0">
              <p className="text-base font-semibold text-foreground capitalize truncate">
                {sourceLabel(record.source)}
                {record.recurringRuleId && (
                  <span className="ml-1.5 text-[10px] text-muted-foreground font-normal" title="Recurring">↻</span>
                )}
              </p>
              <p className="text-xs text-muted-foreground">
                {when.format('MMM D, YYYY')} · {when.format('h:mm A')}
              </p>
            </div>
            <p className="ml-auto text-2xl font-extrabold text-success tracking-tight whitespace-nowrap">
              +{symbol}{fmt(record.amount)}
            </p>
          </div>

          {mode === 'view' && (
            <>
              {record.note && (
                <div className="bg-grey-x100 rounded-lg px-3 py-2.5 mb-4">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">
                    Note
                  </p>
                  <p className="text-sm text-foreground">{record.note}</p>
                </div>
              )}

              {!readOnly && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setMode('edit')}
                    className="flex-1 h-10 rounded-lg border border-border text-sm font-semibold text-foreground hover:bg-grey-x100 flex items-center justify-center gap-2"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={() => setMode('confirm-delete')}
                    className="flex-1 h-10 rounded-lg border border-error/30 text-sm font-semibold text-error hover:bg-error/5 flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>
              )}
            </>
          )}

          {mode === 'edit' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Source
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {incomeSourceOptions.map((option) => {
                    const selected = draft.source === option.value
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() =>
                          setDraft((prev) => ({ ...prev, source: option.value }))
                        }
                        aria-pressed={selected}
                        className={`flex flex-col items-center gap-0.5 py-2 px-1 rounded-lg transition-colors ${
                          selected
                            ? 'bg-primary/5 ring-2 ring-primary'
                            : 'bg-grey-x100 hover:bg-grey-x200'
                        }`}
                      >
                        <CategoryIcon name={option.value} size={20} fallback="salary" />
                        <span className="text-[10px] font-medium truncate w-full text-center text-foreground">
                          {option.label}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Amount
                </label>
                <input
                  type="number"
                  min="0"
                  autoFocus
                  value={draft.amount}
                  onChange={(e) =>
                    setDraft((prev) => ({ ...prev, amount: e.target.value }))
                  }
                  className="w-full h-10 px-3 text-sm rounded-lg bg-card border border-border focus:outline-none focus:border-primary text-foreground"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Note
                </label>
                <input
                  type="text"
                  value={draft.note}
                  onChange={(e) =>
                    setDraft((prev) => ({ ...prev, note: e.target.value }))
                  }
                  placeholder="Optional note"
                  className="w-full h-10 px-3 text-sm rounded-lg bg-card border border-border focus:outline-none focus:border-primary text-foreground"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => setMode('view')}
                  disabled={isBusy}
                  className="flex-1 h-10 rounded-lg border border-border text-sm font-semibold text-foreground hover:bg-grey-x100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isBusy || !canSave}
                  className="flex-1 h-10 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-accent disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isBusy && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save
                </button>
              </div>
            </div>
          )}

          {mode === 'confirm-delete' && (
            <div className="bg-error/5 border border-error/20 rounded-lg p-4">
              <p className="text-sm font-semibold text-foreground mb-1">
                Delete this record?
              </p>
              <p className="text-xs text-muted-foreground mb-3">
                This can't be undone, and your month's income total will change.
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setMode('view')}
                  disabled={isBusy}
                  className="flex-1 h-9 rounded-lg border border-border text-sm font-semibold text-foreground hover:bg-grey-x100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isBusy}
                  className="flex-1 h-9 rounded-lg bg-error text-white text-sm font-semibold hover:bg-error/90 flex items-center justify-center gap-2"
                >
                  {isBusy && <Loader2 className="w-4 h-4 animate-spin" />}
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

export default IncomeDetailSheet
