import React, { useState } from 'react'
import { Repeat, Trash2, Loader2 } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import type { RecurringRule } from '@/types/expenseTracker'
import { RECURRING_FREQUENCY_LABELS } from '@/types/expenseTracker'

const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// "Daily" when all days run, otherwise the picked days Mon-first
const frequencyLabel = (rule: RecurringRule): string => {
  if (rule.frequency === 'daily' && rule.daysOfWeek && rule.daysOfWeek.length < 7) {
    const monFirst = [1, 2, 3, 4, 5, 6, 0].filter((d) => rule.daysOfWeek!.includes(d))
    return monFirst.map((d) => DAY_SHORT[d]).join(', ')
  }
  return RECURRING_FREQUENCY_LABELS[rule.frequency] || rule.frequency
}
import { categoryEmojiMap } from '@/utils/constant'
import { useCurrency } from '@/hooks/useCurrency'

type RecurringManagerProps = {
  rules: RecurringRule[]
  monthlyExpenseTotal: number
  onToggleActive: (rule: RecurringRule) => Promise<void>
  onDelete: (rule: RecurringRule) => Promise<void>
  // Controlled open. When provided, the built-in trigger row is hidden and the
  // sheet is driven by the parent (e.g. opened from the dashboard expense card).
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const ruleLabel = (rule: RecurringRule): { emoji: string; name: string } => {
  if (rule.kind === 'expense') {
    const name = rule.categoryId?.name || 'Expense'
    return { emoji: categoryEmojiMap[name?.toLowerCase()] || '🔀', name }
  }
  return { emoji: '💼', name: rule.source || 'Income' }
}

const RecurringManager: React.FC<RecurringManagerProps> = ({
  rules,
  monthlyExpenseTotal,
  onToggleActive,
  onDelete,
  open: controlledOpen,
  onOpenChange,
}) => {
  const { symbol } = useCurrency()
  const isControlled = controlledOpen !== undefined
  const [internalOpen, setInternalOpen] = useState(false)
  const open = isControlled ? controlledOpen : internalOpen
  const setOpen = isControlled ? (onOpenChange ?? (() => {})) : setInternalOpen
  const [busyId, setBusyId] = useState<string | null>(null)

  // Uncontrolled (the tracker strip) hides itself when there's nothing to show.
  // Controlled (dashboard) still renders so its sheet can show an empty state.
  if (rules.length === 0 && !isControlled) return null

  const activeCount = rules.filter((r) => r.isActive).length
  const activeExpenseCount = rules.filter((r) => r.isActive && r.kind === 'expense').length
  // Strip is about recurring spending (the ৳/mo is the expense total); fall
  // back to the generic count if a user only has recurring income rules.
  const recurringLabel = activeExpenseCount > 0
    ? `${activeExpenseCount} recurring ${activeExpenseCount === 1 ? 'expense' : 'expenses'}`
    : `${activeCount} recurring`

  const handleToggle = async (rule: RecurringRule) => {
    setBusyId(rule._id)
    await onToggleActive(rule)
    setBusyId(null)
  }

  const handleDelete = async (rule: RecurringRule) => {
    setBusyId(rule._id)
    await onDelete(rule)
    setBusyId(null)
  }

  return (
    <>
      {/* Quiet trigger row — information first, action at the end. Hidden when
          the sheet is opened from somewhere else (e.g. the dashboard). */}
      {!isControlled && (
        <button
          onClick={() => setOpen(true)}
          className="w-full flex items-center justify-between bg-card border border-border rounded-xl px-4 py-2.5 hover:bg-grey-x100 transition-colors"
        >
          <span className="flex items-center gap-2 text-xs text-muted-foreground">
            <Repeat className="w-3.5 h-3.5" />
            <span>
              {recurringLabel}
              {monthlyExpenseTotal > 0 && (
                <> · {symbol}{monthlyExpenseTotal.toLocaleString()}/mo</>
              )}
            </span>
          </span>
          <span className="text-xs font-semibold text-primary">Manage →</span>
        </button>
      )}

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="bottom"
          className="rounded-t-2xl max-h-[85vh] overflow-y-auto p-5"
        >
          <SheetHeader className="text-left mb-3">
            <SheetTitle className="text-base font-extrabold text-foreground">
              Recurring
            </SheetTitle>
          </SheetHeader>

          {rules.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              No recurring rules yet. Set one up from the expense form's “Repeats” option.
            </p>
          )}

          <div className="divide-y divide-border">
            {rules.map((rule) => {
              const { emoji, name } = ruleLabel(rule)
              const busy = busyId === rule._id
              return (
                <div key={rule._id} className="flex items-center gap-3 py-3">
                  <span className="text-lg leading-none">{emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold capitalize truncate ${rule.isActive ? 'text-foreground' : 'text-muted-foreground line-through'}`}>
                      {name} · {symbol}{rule.amount.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {frequencyLabel(rule)}
                      {rule.isActive
                        ? ` · next ${new Date(rule.nextRunDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                        : ' · paused'}
                      {rule.note && <> · {rule.note}</>}
                    </p>
                  </div>
                  {busy ? (
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  ) : (
                    <div className="flex items-center gap-1">
                      {/* Text label, not an icon — a pause/play glyph reads
                          like a status instead of an action */}
                      <button
                        onClick={() => handleToggle(rule)}
                        className="px-2.5 py-1.5 rounded-md text-xs font-semibold text-muted-foreground hover:bg-grey-x100 hover:text-foreground transition-colors"
                      >
                        {rule.isActive ? 'Pause' : 'Resume'}
                      </button>
                      <button
                        onClick={() => handleDelete(rule)}
                        aria-label="Delete rule"
                        className="p-2 rounded-md text-muted-foreground hover:bg-error/10 hover:text-error transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {rules.length > 0 && (
            <p className="text-[11px] text-muted-foreground mt-3">
              Deleting a rule won't touch the records it already added. A paused
              rule simply picks up again from its next due date.
            </p>
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}

export default RecurringManager
