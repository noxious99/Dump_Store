import React, { useState } from 'react'
import { Pencil, Check, X, Plus } from 'lucide-react'
import { categoryEmojiMap } from '@/utils/constant'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { BudgetAllocation, CategoryOption } from '@/types/expenseTracker'

interface BudgetCardProps {
  budgetId: string
  total: number
  spent: number
  daysLeft: number
  dayOfMonth: number
  daysInMonth: number
  allocations: BudgetAllocation[]
  categories: CategoryOption[]
  historyMode: boolean
  embedded?: boolean
  onCreateBudget: (amount: number) => Promise<void> | void
  onUpdateBudgetTotal: (amount: number) => Promise<void> | void
  onUpdateAllocation: (
    allocation: BudgetAllocation,
    nextAmount: number
  ) => Promise<void> | void
  onAddAllocation: (categoryId: string, amount: number) => Promise<void> | void
}

const fmt = (n: number) => Math.round(n).toLocaleString()
const getEmoji = (name: string) =>
  categoryEmojiMap[name?.toLowerCase()] ?? '🔀'

const BudgetCard: React.FC<BudgetCardProps> = ({
  budgetId,
  total,
  spent,
  daysLeft,
  dayOfMonth,
  daysInMonth,
  allocations,
  categories,
  historyMode,
  embedded = false,
  onCreateBudget,
  onUpdateBudgetTotal,
  onUpdateAllocation,
  onAddAllocation,
}) => {
  const [editingTotal, setEditingTotal] = useState(false)
  const [totalDraft, setTotalDraft] = useState('')
  const [editingAllocId, setEditingAllocId] = useState<string | null>(null)
  const [allocDraft, setAllocDraft] = useState('')
  const [isAllocating, setIsAllocating] = useState(false)
  const [newAlloc, setNewAlloc] = useState({ categoryId: '', amount: '' })
  const [budgetDraft, setBudgetDraft] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)

  const chrome = embedded ? '' : 'bg-card border border-border rounded-2xl p-5 lg:p-6'

  // ── Empty state: no budget for this month ──────────────────
  if (!budgetId) {
    return (
      <div className={chrome}>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-grey-x100 flex items-center justify-center text-sm">
            💳
          </div>
          <span className="text-[10px] font-bold text-foreground uppercase tracking-wider">
            Monthly Budget
          </span>
        </div>

        {historyMode ? (
          <p className="text-sm text-muted-foreground">
            No budget was set for this month.
          </p>
        ) : !showCreateForm ? (
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              No budget set for this month.
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="h-8 px-3 text-sm font-semibold text-primary hover:bg-primary/5 rounded-md whitespace-nowrap"
            >
              + Set budget
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              autoFocus
              placeholder="Amount"
              value={budgetDraft}
              onChange={(e) => setBudgetDraft(e.target.value)}
              className="flex-1 h-8 px-3 text-sm rounded-md bg-card border border-border focus:outline-none focus:border-primary text-foreground"
            />
            <button
              onClick={async () => {
                const n = Number(budgetDraft)
                if (!Number.isNaN(n) && n > 0) {
                  await onCreateBudget(n)
                  setBudgetDraft('')
                  setShowCreateForm(false)
                }
              }}
              className="w-7 h-7 rounded-md hover:bg-primary/10 text-primary flex items-center justify-center"
              aria-label="Save budget"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                setBudgetDraft('')
                setShowCreateForm(false)
              }}
              className="w-7 h-7 rounded-md hover:bg-grey-x200 text-muted-foreground flex items-center justify-center"
              aria-label="Cancel"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    )
  }

  // ── Populated state ────────────────────────────────────────
  const remaining = total - spent
  const pct = total > 0 ? Math.round((spent / total) * 100) : 0
  const isAlert = pct >= 100
  const isWatch = pct >= 70 && pct < 100
  const statusLabel = isAlert ? 'Over budget' : isWatch ? `${pct}% used` : null
  const barColor = isAlert ? 'var(--error)' : 'var(--primary)'

  const totalAllocated = allocations.reduce(
    (s, a) => s + (a.allocatedAmount || 0),
    0
  )
  const unallocated = Math.max(total - totalAllocated, 0)
  const dailyLimit =
    daysLeft > 0 ? Math.max(0, Math.round(remaining / daysLeft)) : 0

  const pacePct =
    daysInMonth > 0 ? Math.round((dayOfMonth / daysInMonth) * 100) : 0
  const showPaceTick = !isAlert && pacePct > 0 && pacePct < 100
  let paceLabel: string | null = null
  let paceColor = 'var(--muted-foreground)'
  if (showPaceTick) {
    const diff = pct - pacePct
    if (diff > 5) {
      paceLabel = 'Spending ahead of pace'
      paceColor = 'var(--warning)'
    } else if (diff < -5) {
      paceLabel = 'Under pace'
      paceColor = 'var(--success)'
    } else {
      paceLabel = 'On pace'
      paceColor = 'var(--success)'
    }
  }

  const startEditTotal = () => {
    setEditingTotal(true)
    setTotalDraft(String(total))
  }
  const commitTotal = async () => {
    const n = Number(totalDraft)
    if (!Number.isNaN(n) && n > 0) await onUpdateBudgetTotal(n)
    setEditingTotal(false)
  }

  const startEditAlloc = (a: BudgetAllocation) => {
    setEditingAllocId(a._id)
    setAllocDraft(String(a.allocatedAmount))
  }
  const commitAlloc = async (a: BudgetAllocation) => {
    const n = Number(allocDraft)
    if (!Number.isNaN(n) && n >= 0) await onUpdateAllocation(a, n)
    setEditingAllocId(null)
  }

  const commitNewAlloc = async () => {
    const n = Number(newAlloc.amount)
    if (!newAlloc.categoryId || Number.isNaN(n) || n <= 0) return
    await onAddAllocation(newAlloc.categoryId, n)
    setNewAlloc({ categoryId: '', amount: '' })
    setIsAllocating(false)
  }

  const allocatedCategoryIds = new Set(allocations.map((a) => a.categoryId))
  const unallocatedCategories = categories.filter(
    (c) => !allocatedCategoryIds.has(c._id)
  )

  return (
    <div className={chrome}>
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-grey-x100 flex items-center justify-center text-sm">
            💳
          </div>
          <span className="text-[10px] font-bold text-foreground uppercase tracking-wider">
            Monthly Budget
          </span>
        </div>
        {statusLabel && (
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={{
              color: isAlert ? 'var(--error)' : 'var(--warning)',
              backgroundColor: isAlert
                ? 'var(--error-x100)'
                : 'var(--warning-x100)',
            }}
          >
            {statusLabel}
          </span>
        )}
      </div>

      {/* ── Hero ───────────────────────────────────────────────── */}
      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
        {isAlert ? 'Over budget by' : 'Left to spend'}
      </p>
      <div className="flex items-baseline gap-2 mb-1 flex-wrap">
        <span
          className="text-4xl font-extrabold tracking-tight"
          style={{ color: isAlert ? 'var(--error)' : 'var(--foreground)' }}
        >
          ${fmt(Math.abs(remaining))}
        </span>
        {editingTotal ? (
          <div className="flex items-center gap-1">
            <span className="text-base text-muted-foreground">of $</span>
            <input
              type="number"
              min="0"
              autoFocus
              value={totalDraft}
              onChange={(e) => setTotalDraft(e.target.value)}
              className="w-24 h-7 px-2 text-sm rounded-md bg-card border border-border focus:outline-none focus:border-primary text-foreground"
            />
            <button
              onClick={commitTotal}
              className="w-7 h-7 rounded-md hover:bg-primary/10 text-primary flex items-center justify-center"
              aria-label="Save"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setEditingTotal(false)}
              className="w-7 h-7 rounded-md hover:bg-grey-x200 text-muted-foreground flex items-center justify-center"
              aria-label="Cancel"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <span className="text-base text-muted-foreground">
              of ${fmt(total)}
            </span>
            {!historyMode && (
              <button
                onClick={startEditTotal}
                className="w-7 h-7 rounded-md hover:bg-grey-x100 text-muted-foreground flex items-center justify-center"
                aria-label="Edit budget total"
              >
                <Pencil className="w-3 h-3" />
              </button>
            )}
          </div>
        )}
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        {daysLeft > 0 ? (
          <>
            ~
            <span className="text-foreground font-semibold">
              ${fmt(dailyLimit)}
            </span>
            /day for {daysLeft} more {daysLeft === 1 ? 'day' : 'days'}
          </>
        ) : (
          <>Last day of the month</>
        )}
      </p>

      {/* ── Progress bar ───────────────────────────────────────── */}
      <div className="relative h-2 bg-border rounded-full overflow-hidden mb-2">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${Math.min(pct, 100)}%`,
            backgroundColor: barColor,
          }}
        />
        {showPaceTick && (
          <div
            className="absolute top-0 bottom-0 w-px bg-foreground/40"
            style={{ left: `${pacePct}%` }}
            aria-hidden
          />
        )}
      </div>
      <div className="flex items-center justify-between text-[10px] mb-6 gap-2 flex-wrap">
        <span className="text-muted-foreground">
          <span className="text-foreground font-semibold">${fmt(spent)}</span>{' '}
          spent · {pct}%
        </span>
        {paceLabel && (
          <span
            className="font-semibold uppercase tracking-wider"
            style={{ color: paceColor }}
          >
            ● {paceLabel}
          </span>
        )}
      </div>

      {/* ── Allocations ────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-1">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
          Allocations
        </p>
        <span className="text-[10px] text-muted-foreground">
          ${fmt(totalAllocated)} of ${fmt(total)} allocated
        </span>
      </div>

      {allocations.length === 0 ? (
        <div className="py-6 text-center text-xs text-muted-foreground">
          No allocations yet. Split your budget into categories.
        </div>
      ) : (
        <div className="divide-y divide-border">
          {allocations.map((a) => {
            const pctUsed =
              a.allocatedAmount > 0
                ? Math.min(
                    Math.round((a.spent / a.allocatedAmount) * 100),
                    100
                  )
                : 0
            const overLimit = a.spent > a.allocatedAmount
            const isEditing = editingAllocId === a._id

            return (
              <div
                key={a._id}
                className="group flex items-center gap-3 py-3"
              >
                <div className="w-9 h-9 rounded-lg bg-grey-x100 flex items-center justify-center text-base flex-shrink-0">
                  {getEmoji(a.categoryName)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <p className="text-sm font-semibold text-foreground capitalize truncate">
                      {a.categoryName}
                    </p>

                    {isEditing ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min="0"
                          value={allocDraft}
                          onChange={(e) => setAllocDraft(e.target.value)}
                          autoFocus
                          className="w-20 h-7 px-2 text-xs rounded-md bg-card border border-border focus:outline-none focus:border-primary text-foreground"
                        />
                        <button
                          onClick={() => commitAlloc(a)}
                          className="w-7 h-7 rounded-md hover:bg-primary/10 text-primary flex items-center justify-center"
                          aria-label="Save"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingAllocId(null)}
                          className="w-7 h-7 rounded-md hover:bg-grey-x200 text-muted-foreground flex items-center justify-center"
                          aria-label="Cancel"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                          <span
                            className={
                              overLimit
                                ? 'text-error font-semibold'
                                : 'text-foreground font-semibold'
                            }
                          >
                            ${fmt(a.spent)}
                          </span>
                          {' / '}${fmt(a.allocatedAmount)}
                        </span>
                        {!historyMode && (
                          <button
                            onClick={() => startEditAlloc(a)}
                            className="w-7 h-7 rounded-md hover:bg-grey-x100 text-muted-foreground md:opacity-0 md:group-hover:opacity-100 transition-opacity flex items-center justify-center"
                            aria-label="Edit allocation"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="h-1 bg-border rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${pctUsed}%`,
                        backgroundColor: overLimit
                          ? 'var(--error)'
                          : 'var(--primary)',
                      }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Unallocated footer ─────────────────────────────────── */}
      <div className="mt-3 pt-3 border-t border-dashed border-border">
        {isAllocating ? (
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <Select
              value={newAlloc.categoryId}
              onValueChange={(v) =>
                setNewAlloc((prev) => ({ ...prev, categoryId: v }))
              }
            >
              <SelectTrigger className="h-8 text-xs flex-1">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {unallocatedCategories.length === 0 ? (
                  <div className="px-2 py-1.5 text-xs text-muted-foreground">
                    All categories allocated
                  </div>
                ) : (
                  unallocatedCategories.map((c) => (
                    <SelectItem
                      key={c._id}
                      value={c._id}
                      className="capitalize"
                    >
                      {getEmoji(c.name)} {c.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min="0"
                placeholder="$"
                value={newAlloc.amount}
                onChange={(e) =>
                  setNewAlloc((prev) => ({ ...prev, amount: e.target.value }))
                }
                className="w-20 h-8 px-2 text-xs rounded-md bg-card border border-border focus:outline-none focus:border-primary text-foreground"
              />
              <button
                onClick={commitNewAlloc}
                className="w-7 h-7 rounded-md hover:bg-primary/10 text-primary flex items-center justify-center"
                aria-label="Save"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  setIsAllocating(false)
                  setNewAlloc({ categoryId: '', amount: '' })
                }}
                className="w-7 h-7 rounded-md hover:bg-grey-x200 text-muted-foreground flex items-center justify-center"
                aria-label="Cancel"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Plus className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              <p className="text-sm truncate">
                <span className="font-semibold text-foreground">
                  ${fmt(unallocated)}
                </span>
                <span className="text-muted-foreground"> unallocated</span>
              </p>
            </div>
            {!historyMode && (
              <button
                onClick={() => setIsAllocating(true)}
                className="h-8 px-3 text-sm font-semibold text-primary hover:bg-primary/5 rounded-md whitespace-nowrap"
              >
                + Allocate
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default BudgetCard
