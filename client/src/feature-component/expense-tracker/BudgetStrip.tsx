import React from 'react'
import { FaWallet, FaArrowRight } from 'react-icons/fa6'
import { Plus } from 'lucide-react'

interface BudgetStripProps {
  monthLabel: string
  hasBudget: boolean
  total: number
  spent: number
  daysLeft: number
  allocationCount: number
  unallocated: number
  onOpen: () => void
  historyMode: boolean
}

const fmt = (n: number) => Math.round(n).toLocaleString()
const fmtShort = (n: number) =>
  n >= 1000 ? `${(n / 1000).toFixed(1)}k` : `${Math.round(n)}`

const BudgetStrip: React.FC<BudgetStripProps> = ({
  monthLabel,
  hasBudget,
  total,
  spent,
  daysLeft,
  allocationCount,
  unallocated,
  onOpen,
  historyMode,
}) => {
  // ── Empty state ──────────────────────────────────────────────
  if (!hasBudget) {
    return (
      <button
        onClick={onOpen}
        className="group w-full text-left bg-card border border-border rounded-2xl overflow-hidden active:scale-[0.99] transition-transform"
      >
        <div className="p-4">
          <div className="flex items-center gap-2.5 mb-3">
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
          <p className="text-sm text-muted-foreground">
            {historyMode
              ? 'No budget was set for this month.'
              : 'No budget set for this month.'}
          </p>
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
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              {isAlert ? 'Over by' : 'Left to spend'}
            </p>
            <p className="flex items-baseline gap-1.5 flex-wrap">
              <span
                className="text-3xl font-extrabold tracking-tight leading-tight"
                style={{
                  color: isAlert ? 'var(--error)' : 'var(--foreground)',
                }}
              >
                ${fmt(Math.abs(remaining))}
              </span>
              <span className="text-xs text-muted-foreground">
                of ${fmtShort(total)}
              </span>
            </p>
          </div>

          {daysLeft > 0 && !isAlert && (
            <div className="text-right flex-shrink-0">
              <p className="text-xs font-semibold text-foreground leading-tight">
                ${fmt(dailyLimit)}
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
                ${fmtShort(unallocated)}
              </span>{' '}
              unallocated
            </>
          )}
        </p>
        <span className="flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wider whitespace-nowrap group-active:translate-x-0.5 transition-transform">
          Manage
          <FaArrowRight className="text-[10px]" />
        </span>
      </div>
    </button>
  )
}

export default BudgetStrip
