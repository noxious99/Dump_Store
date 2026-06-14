import React, { useEffect, useState } from 'react'
import moment from 'moment'
import { Pencil, Trash2, Loader2, CalendarIcon } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { categoryEmojiMap } from '@/utils/constant'
import type { ExpenseRecord, CategoryOption } from '@/types/expenseTracker'
import { useCurrency } from '@/hooks/useCurrency'

interface RecordDetailSheetProps {
  record: ExpenseRecord | null
  open: boolean
  onOpenChange: (open: boolean) => void
  categories: CategoryOption[]
  readOnly?: boolean
  onSave: (
    expenseId: string,
    payload: { amount: number; note: string; categoryId: string; date: string }
  ) => Promise<void> | void
  onDelete: (expenseId: string) => Promise<void> | void
}

type Mode = 'view' | 'edit' | 'confirm-delete'

const fmt = (n: number) => Math.round(n).toLocaleString()
const getEmoji = (name: string) =>
  categoryEmojiMap[name?.toLowerCase()] ?? '🔀'

const RecordDetailSheet: React.FC<RecordDetailSheetProps> = ({
  record,
  open,
  onOpenChange,
  categories,
  readOnly = false,
  onSave,
  onDelete,
}) => {
  const { symbol } = useCurrency()
  const [mode, setMode] = useState<Mode>('view')
  const [isBusy, setIsBusy] = useState(false)
  const [draft, setDraft] = useState({ amount: '', note: '', categoryId: '' })
  const [editDate, setEditDate] = useState<Date | undefined>(undefined)
  const [datePopoverOpen, setDatePopoverOpen] = useState(false)

  // Reset to a clean view whenever a (new) record is shown
  useEffect(() => {
    if (open && record) {
      setMode('view')
      setIsBusy(false)
      setDatePopoverOpen(false)
      setDraft({
        amount: String(record.amount),
        note: record.note || '',
        categoryId: record.category?._id || '',
      })
      setEditDate(new Date(record.date || record.createdAt))
    }
  }, [open, record])

  if (!record) return null

  const when = moment(record.date || record.createdAt)
  const draftAmount = Number(draft.amount)
  const canSave =
    !Number.isNaN(draftAmount) && draftAmount > 0 && draft.categoryId && Boolean(editDate)

  const handleSave = async () => {
    if (!canSave || !editDate) return
    setIsBusy(true)
    try {
      // Keep the original time-of-day and only move the calendar date — the
      // picker gives a local Date, so the day the user taps stays correct
      // across timezones.
      const nextDate = new Date(record.date || record.createdAt)
      nextDate.setFullYear(editDate.getFullYear(), editDate.getMonth(), editDate.getDate())
      const now = new Date()
      if (nextDate > now) nextDate.setTime(now.getTime()) // never land in the future

      await onSave(record._id, {
        amount: draftAmount,
        note: draft.note.trim(),
        categoryId: draft.categoryId,
        date: nextDate.toISOString(),
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
            Expense record
          </SheetTitle>
        </SheetHeader>

        <div className="px-5 pb-6 pt-3">
          {/* ── Identity ──────────────────────────────────────── */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-xl bg-grey-x100 flex items-center justify-center text-xl flex-shrink-0">
              {getEmoji(record.category?.name)}
            </div>
            <div className="min-w-0">
              <p className="text-base font-semibold text-foreground capitalize truncate">
                {record.category?.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {when.format('MMM D, YYYY')} · {when.format('h:mm A')}
              </p>
            </div>
            <p className="ml-auto text-2xl font-extrabold text-error tracking-tight whitespace-nowrap">
              -{symbol}{fmt(record.amount)}
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
                  Category
                </label>
                <Select
                  value={draft.categoryId}
                  onValueChange={(v) =>
                    setDraft((prev) => ({ ...prev, categoryId: v }))
                  }
                >
                  <SelectTrigger className="h-10 text-sm w-full">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem
                        key={c._id}
                        value={c._id}
                        className="capitalize"
                      >
                        {getEmoji(c.name)} {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                  Date
                </label>
                <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="w-full h-10 px-3 text-sm rounded-lg bg-card border border-border hover:border-primary focus:outline-none focus:border-primary text-foreground flex items-center gap-2"
                    >
                      <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                      <span>
                        {editDate
                          ? editDate.toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : 'Pick a date'}
                      </span>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start" sideOffset={8}>
                    <Calendar
                      mode="single"
                      selected={editDate}
                      onSelect={(date) => {
                        if (date) setEditDate(date)
                        setDatePopoverOpen(false)
                      }}
                      disabled={{ after: new Date() }}
                      defaultMonth={editDate || new Date()}
                      classNames={{ root: 'w-[300px]' }}
                    />
                  </PopoverContent>
                </Popover>
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
                This can't be undone.
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

export default RecordDetailSheet
