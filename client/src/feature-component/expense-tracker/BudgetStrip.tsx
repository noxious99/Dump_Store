import React from 'react'
import { FaWallet, FaArrowRight } from 'react-icons/fa6'
import { Plus } from 'lucide-react'
import { useCurrency } from '@/hooks/useCurrency'
import { categoryEmojiMap } from '@/utils/constant'
import type { TopCategoryItem } from '@/types/expenseTracker'

interface BudgetStripProps {
  monthLabel: string
  hasBudget: boolean
  total: number
  spent: number
  income: number
  topCategories: TopCategoryItem[]
  daysLeft: number
  allocationCount: number
  unallocated: number
  onOpen: () => void
  historyMode: boolean
}

const fmt = (n: number) => Math.round(n).toLocaleString()
const fmtShort = (n: number) =>
  n >= 1000 ? `${(n / 1000).toFixed(1)}k` : `${Math.round(n)}`
const getEmoji = (name: string) => categoryEmojiMap[name?.toLowerCase()] ?? '🔀'

const BudgetStrip: React.FC<BudgetStripProps> = ({
  monthLabel,
  hasBudget,
  total,
  spent,
  income,
  topCategories,
  daysLeft,
  allocationCount,
  unallocated,
  onOpen,
  historyMode,
}) => {
  const { symbol } = useCurrency()

  const categoryPills = topCategories.length > 0 && (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {topCategories.slice(0, 3).map((c) => (
        <span
          key={c.categoryId}
          className="flex items-center gap-1 bg-grey-x100 border border-border rounded-md px-2 py-0.5 text-[11px]"
        >
          <span>{getEmoji(c.name)}</span>
          <span className="text-muted-foreground">{symbol}{fmtShort(c.amount)}</span>
        </span>
      ))}
    </div>
  )

  // Secondary stats for the budgeted state (the budget hero leads, but Spent
  // and Income still read as proper figures). Balance is omitted when income
  // isn't tracked — it would just be a misleading -Spent.
  const statLine = (
    <div className="mt-3 flex items-center gap-10">
      <div>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Spent</p>
        <p className="text-base font-bold text-foreground tracking-tight">
          {symbol}{fmt(spent)}
        </p>
      </div>
      <div>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Income</p>
        <p
          className="text-base font-bold tracking-tight"
          style={{ color: income > 0 ? 'var(--success)' : 'var(--foreground)' }}
        >
          {symbol}{fmt(income)}
        </p>
      </div>
    </div>
  )
  // ── Empty state ──────────────────────────────────────────────
  if (!hasBudget) {
    return (
      <button
        onClick={onOpen}
        className="group w-full text-left bg-card border border-border rounded-2xl overflow-hidden active:scale-[0.99] transition-transform"
      >
        <div className="p-4">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-primary-lite flex items-center justify-center flex-shrink-0">
                <FaWallet className="text-primary text-base" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-foreground leading-tight truncate">
                  Monthly Budget
                </p>
                <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">
                  {monthLabel}
                </p>
              </div>
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap bg-grey-x100 text-muted-foreground">
              Not set
            </span>
          </div>
          {/* No budget yet — Spent is the headline number here */}
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Spent
              </p>
              <p className="text-2xl font-extrabold text-foreground tracking-tight">
                {symbol}{fmt(spent)}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Income
              </p>
              <p
                className="text-base font-semibold"
                style={{ color: income > 0 ? 'var(--success)' : 'var(--foreground)' }}
              >
                {symbol}{fmt(income)}
              </p>
            </div>
          </div>
          {categoryPills}
        </div>
        {!historyMode && (
          <div className="flex items-center justify-between gap-2 px-4 py-3 border-t border-border bg-grey-x100">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Plus className="w-3.5 h-3.5" />
              Set monthly budget
            </span>
            <span className="flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wider whitespace-nowrap group-active:translate-x-0.5 transition-transform">
              Set up
              <FaArrowRight className="text-[10px]" />
            </span>
          </div>
        )}
      </button>
    )
  }

  // ── Populated state ─────────────────────────────────────────
  const remaining = total - spent
  const pct = total > 0 ? Math.round((spent / total) * 100) : 0
  const isAlert = pct >= 100
  const isWatch = pct >= 70 && pct < 100
  const statusLabel = isAlert
    ? 'Over budget'
    : isWatch
      ? `${pct}% used`
      : 'On track'
  const statusColor = isAlert
    ? { color: 'var(--error)', backgroundColor: 'var(--error-x100)' }
    : isWatch
      ? { color: 'var(--warning)', backgroundColor: 'var(--warning-x100)' }
      : { color: 'var(--success)', backgroundColor: 'var(--success-x100)' }

  const barColor = isAlert ? 'var(--error)' : 'var(--primary)'
  const dailyLimit =
    daysLeft > 0 ? Math.max(0, Math.round(remaining / daysLeft)) : 0

  return (
    <button
      onClick={onOpen}
      className="group w-full text-left bg-card border border-border rounded-2xl overflow-hidden active:scale-[0.99] transition-transform"
    >
      <div className="p-4">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-primary-lite flex items-center justify-center flex-shrink-0">
              <FaWallet className="text-primary text-base" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-foreground leading-tight truncate">
                Monthly Budget
              </p>
              <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">
                {monthLabel}
              </p>
            </div>
          </div>

          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap"
            style={statusColor}
          >
            {statusLabel}
          </span>
        </div>

        <div className="flex items-end justify-between gap-3 mb-2">
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
              {isAlert ? 'Over budget by' : 'Left to spend'}
            </p>
            <p className="flex items-baseline gap-1.5 flex-wrap">
              <span
                className="text-xl font-extrabold tracking-tight leading-tight"
                style={{
                  color: isAlert ? 'var(--error)' : 'var(--foreground)',
                }}
              >
                {symbol}{fmt(Math.abs(remaining))}
              </span>
              <span className="text-xs text-muted-foreground">
                of {symbol}{fmtShort(total)}
              </span>
            </p>
          </div>

          {daysLeft > 0 && !isAlert && (
            <div className="text-right flex-shrink-0">
              <p className="text-xs font-semibold text-foreground leading-tight">
                {symbol}{fmt(dailyLimit)}
                <span className="font-normal text-muted-foreground">/day</span>
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {daysLeft} {daysLeft === 1 ? 'day' : 'days'} left
              </p>
            </div>
          )}
        </div>

        <div className="h-1.5 bg-border rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${Math.min(pct, 100)}%`,
              backgroundColor: barColor,
            }}
          />
        </div>

        {statLine}
        {categoryPills}
      </div>

      <div className="flex items-center justify-between gap-2 px-4 py-3 border-t border-border bg-grey-x100">
        <p className="text-xs text-muted-foreground truncate">
          <span className="font-semibold text-foreground">
            {allocationCount}
          </span>{' '}
          {allocationCount === 1 ? 'allocation' : 'allocations'}
          {unallocated > 0 && (
            <>
              {' · '}
              <span className="font-semibold text-foreground">
                {symbol}{fmtShort(unallocated)}
              </span>{' '}
              unallocated
            </>
          )}
        </p>
        <span className="flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wider whitespace-nowrap group-active:translate-x-0.5 transition-transform">
          Manage budget
          <FaArrowRight className="text-[10px]" />
        </span>
      </div>
    </button>
  )
}

export default BudgetStrip
