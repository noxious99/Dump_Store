import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Repeat, ChevronRight, Plus, Loader2 } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import axiosInstance from '@/utils/axiosInstance'
import type { TopCategory } from '@/types/dashboard'
import { useCurrency } from '@/hooks/useCurrency'
import { CategoryIcon } from '@/components/CategoryIcon'

interface ExpenseSummaryCardProps {
  totalSpend: number
  budget: number
  budgetPct: number
  topCategories: TopCategory[]
  /** Records this month that logged themselves from recurring rules. */
  autoLoggedCount: number
  /** Opens the recurring-rules manager (owned by the dashboard). */
  onManageRecurring: () => void
  isLoading: boolean
  onBudgetSaved: () => void
}

// One-tap starting points for the budget sheet, bKash-top-up style
const QUICK_AMOUNTS = [10000, 15000, 20000, 25000]

const ExpenseSummaryCard: React.FC<ExpenseSummaryCardProps> = ({
  totalSpend,
  budget,
  budgetPct,
  topCategories,
  autoLoggedCount,
  onManageRecurring,
  isLoading,
  onBudgetSaved,
}) => {
  const { symbol } = useCurrency()
  const [showBudgetDialog, setShowBudgetDialog] = useState(false)
  const [newBudget, setNewBudget] = useState('')
  const [saving, setSaving] = useState(false)

  // For the live "about X a day" preview while typing a budget
  const now = new Date()
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()

  // Status badge: only shows a colored state when there's an actual problem
  const isAlert = budgetPct >= 100
  const isWatch = budgetPct >= 70 && budgetPct < 100
  const statusLabel = isAlert ? 'Over budget' : isWatch ? `${budgetPct}% used` : null

  // Progress bar: primary by default, only red when over budget
  const barColor = isAlert ? 'var(--error)' : 'var(--primary)'

  const handleBudgetSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSaving(true)
      await axiosInstance.post('/v1/expenses/monthly-budget', { amount: newBudget })
      setNewBudget('')
      setShowBudgetDialog(false)
      onBudgetSaved()
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-2xl p-4 h-full">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="skeleton w-9 h-9 rounded-xl" />
            <div className="skeleton h-4 w-20" />
          </div>
          <div className="skeleton h-5 w-16 rounded-full" />
        </div>
        <div className="skeleton h-7 w-32 mb-2.5" />
        <div className="skeleton h-1 w-full rounded mb-3" />
        <div className="flex gap-3 mb-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-3 w-10 rounded" />
          ))}
        </div>
        <div className="skeleton h-px w-full mb-3" />
        <div className="skeleton h-9 w-full rounded-lg" />
      </div>
    )
  }

  return (
    <>
      <div className="bg-card border border-border rounded-2xl p-4 h-full flex flex-col">
        {/* Header — no click, no chevron */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <CategoryIcon name="expense" size={20} />
            </div>
            <span className="text-sm font-bold text-foreground">Expenses</span>
          </div>
          {statusLabel && (
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{
                color: isAlert ? 'var(--error)' : 'var(--warning)',
                backgroundColor: isAlert ? 'var(--error-x100)' : 'var(--warning-x100)',
              }}
            >
              {statusLabel}
            </span>
          )}
        </div>

        {/* Amount */}
        <div className="flex items-baseline gap-1.5 mb-2.5">
          <span className="text-2xl font-extrabold text-foreground tracking-tight">
            {symbol}{totalSpend.toLocaleString()}
          </span>
          <span className="text-sm text-muted-foreground">
            {budget > 0
              ? `/ ${symbol}${budget.toLocaleString()}`
              : 'spent this month'}
          </span>
        </div>

        {/* Progress bar, or the invitation to get one */}
        {budget > 0 ? (
          <div className="h-1 bg-border rounded-full overflow-hidden mb-3">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{ width: `${Math.min(budgetPct, 100)}%`, backgroundColor: barColor }}
            />
          </div>
        ) : (
          <button
            onClick={() => setShowBudgetDialog(true)}
            className="w-full h-9 mb-3 flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-primary/40 text-primary text-xs font-semibold hover:bg-primary/5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Set a monthly budget
          </button>
        )}

        {/* Top categories */}
        {topCategories.length > 0 && (
          <div className="flex items-center gap-3 flex-wrap mb-4">
            {topCategories.map((cat, i) => (
              <div key={i} className="flex items-center gap-1">
                <CategoryIcon name={cat.name} size={16} />
                <span className="text-[10px] text-muted-foreground font-medium">
                  {symbol}{cat.amount >= 1000
                    ? `${(cat.amount / 1000).toFixed(1)}k`
                    : cat.amount.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Recurring automation, surfaced as a quiet win rather than its own
            block — reinforces the spend number ("some of this logged itself")
            and opens the rule manager in place (no page switch). */}
        {autoLoggedCount > 0 && (
          <button
            type="button"
            onClick={onManageRecurring}
            className="flex items-center gap-1.5 mb-4 w-fit text-[11px] text-muted-foreground hover:text-foreground transition-colors"
          >
            <Repeat className="w-3.5 h-3.5 text-secondary flex-shrink-0" />
            <span>
              <span className="font-bold text-foreground">{autoLoggedCount}</span>
              {autoLoggedCount === 1 ? ' entry' : ' entries'} logged automatically this month
            </span>
            <ChevronRight className="w-3.5 h-3.5 flex-shrink-0 opacity-60" />
          </button>
        )}

        {/* Footer — drilling in is the card's one action now; adding lives on
            the dashboard FAB (mobile) / header (desktop). */}
        <div className="pt-3 mt-auto border-t border-border">
          <Link
            to="/expense-tracker"
            className="w-full inline-flex items-center justify-center gap-1.5 h-9 rounded-lg bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/15 transition-colors"
          >
            Open tracker
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Budget sheet — same bottom-sheet pattern as the rest of the app */}
      <Sheet open={showBudgetDialog} onOpenChange={setShowBudgetDialog}>
        <SheetContent
          side="bottom"
          className="rounded-t-2xl p-0 sm:max-w-md sm:mx-auto"
        >
          <SheetHeader className="px-5 pt-5 pb-1 text-left">
            <SheetTitle className="text-base font-extrabold text-foreground">
              Set monthly budget
            </SheetTitle>
            <p className="text-xs text-muted-foreground">
              How much you plan to spend this month. You can change it anytime.
            </p>
          </SheetHeader>
          <form onSubmit={handleBudgetSubmit} className="px-5 pb-6 pt-4 space-y-4">
            {/* The amount is the hero — same big-number language as the cards */}
            <div className="py-2">
              <label className="flex items-baseline justify-center gap-1 cursor-text">
                <span className="text-lg font-bold text-muted-foreground">
                  {symbol}
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  autoFocus
                  maxLength={7}
                  placeholder="0"
                  value={newBudget}
                  onChange={(e) =>
                    setNewBudget(e.target.value.replace(/[^0-9]/g, ''))
                  }
                  style={{ width: `${Math.max(newBudget.length, 1)}ch` }}
                  className="bg-transparent text-3xl font-extrabold text-foreground tracking-tight focus:outline-none placeholder:text-muted-foreground/40 [font-variant-numeric:tabular-nums]"
                />
              </label>
              {/* Live translation while typing; spend context before it */}
              <p className="text-center text-xs text-muted-foreground mt-1.5 h-4">
                {Number(newBudget) > 0
                  ? `about ${symbol}${Math.round(
                      Number(newBudget) / daysInMonth
                    ).toLocaleString()} a day`
                  : totalSpend > 0
                    ? `You've spent ${symbol}${totalSpend.toLocaleString()} this month so far`
                    : ''}
              </p>
            </div>

            <div className="flex justify-center gap-2">
              {QUICK_AMOUNTS.map((amount) => {
                const active = Number(newBudget) === amount
                return (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => setNewBudget(String(amount))}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                      active
                        ? 'bg-primary/10 border-primary/40 text-primary'
                        : 'border-border text-foreground hover:bg-grey-x100'
                    }`}
                  >
                    {symbol}{amount / 1000}k
                  </button>
                )
              })}
            </div>

            <button
              type="submit"
              disabled={saving || !newBudget || Number(newBudget) <= 0}
              className="w-full h-11 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-accent disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saving ? 'Saving...' : 'Save budget'}
            </button>
          </form>
        </SheetContent>
      </Sheet>
    </>
  )
}

export default ExpenseSummaryCard
