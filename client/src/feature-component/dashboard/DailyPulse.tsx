import React from 'react'
import Ring from './Ring'
import { useCurrency } from '@/hooks/useCurrency'

// Compact money for the tight 52px ring: 9900 → "9.9k", 10000 → "10k",
// 1.2m → "1.2m". Keeps large nets from overflowing the circle.
const fmtCompact = (n: number): string => {
  const abs = Math.abs(n)
  if (abs >= 1_000_000) return `${(abs / 1_000_000).toFixed(1)}m`
  if (abs >= 10_000) return `${Math.round(abs / 1000)}k`
  if (abs >= 1000) return `${(abs / 1000).toFixed(1)}k`
  return abs.toLocaleString()
}

interface DailyPulseProps {
  // Budget — shows daily allowance (different from the monthly card below)
  dailyBudget: number     // budgetLeft / daysLeft — what you can spend per day
  budgetLeft: number      // monthly remaining — shown as subtitle context
  budgetTotal: number
  budgetPct: number       // used to decide ring fill and overspend state
  daysLeft: number
  // Goals — shows aggregate progress (cards below show per-goal breakdown)
  milestoneDone: number
  milestoneTotal: number
  milestonePct: number
  // IOU — shows net (card below shows you-owe / owed-to-you split + people)
  iouNet: number
  iouPending: number
  isLoading: boolean
}

const DailyPulse: React.FC<DailyPulseProps> = ({
  dailyBudget,
  budgetLeft,
  budgetTotal,
  budgetPct,
  daysLeft,
  milestoneDone,
  milestoneTotal,
  milestonePct,
  iouNet,
  iouPending,
  isLoading,
}) => {
  const { symbol } = useCurrency()
  // Color rule: primary always, error ONLY when over budget
  const budgetRingColor = budgetPct >= 100 ? 'var(--error)' : 'var(--primary)'
  const isOverBudget = budgetPct >= 100

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-2xl p-4 mb-3">
        <div className="flex items-center gap-1.5 mb-3.5">
          <div className="w-1.5 h-1.5 rounded-full bg-border" />
          <div className="skeleton h-2.5 w-20 rounded" />
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-grey-x100 rounded-xl p-3 flex flex-col items-center gap-2">
              <div className="skeleton w-[52px] h-[52px] rounded-full" />
              <div className="skeleton h-2.5 w-14 rounded" />
              <div className="skeleton h-3 w-12 rounded" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-4 mb-3">
      {/* Header */}
      <div className="flex items-center gap-1.5 mb-3.5">
        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
          Today's pulse
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">

        {/* ── Daily Budget ──
            Shows: daily allowance (what you can spend today)
            Card below shows: monthly totals and progress bar
        */}
        <div className="bg-grey-x100 rounded-xl p-3 flex flex-col items-center gap-1.5 text-center">
          <Ring pct={budgetPct} size={52} sw={4} strokeColor={budgetRingColor}>
            <span className="text-[10px] font-extrabold text-foreground leading-none">
              {budgetTotal > 0
                ? isOverBudget ? '—' : `${symbol}${dailyBudget}`
                : '—'}
            </span>
          </Ring>
          <div>
            <p className="text-[11px] font-bold text-foreground">Daily limit</p>
            <p className="text-[9px] text-muted-foreground mt-0.5 leading-tight">
              {budgetTotal > 0
                ? isOverBudget
                  ? 'Over budget'
                  : `${symbol}${Math.max(0, budgetLeft).toLocaleString()} left · ${daysLeft}d`
                : 'Budget not set'}
            </p>
          </div>
          {isOverBudget && (
            <span className="text-[9px] font-semibold text-error">Over budget</span>
          )}
        </div>

        {/* ── Goals Aggregate ──
            Shows: overall milestone % across ALL goals
            Card below shows: per-goal rings with individual breakdowns
        */}
        <div className="bg-grey-x100 rounded-xl p-3 flex flex-col items-center gap-1.5 text-center">
          <Ring pct={milestonePct} size={52} sw={4} strokeColor="var(--primary)">
            <span className="text-[10px] font-extrabold text-foreground leading-none">
              {milestoneTotal > 0 ? `${milestonePct}%` : '—'}
            </span>
          </Ring>
          <div>
            <p className="text-[11px] font-bold text-foreground">Progress</p>
            <p className="text-[9px] text-muted-foreground mt-0.5 leading-tight">
              {milestoneTotal > 0
                ? `${milestoneDone} of ${milestoneTotal} done`
                : 'No active goals'}
            </p>
          </div>
        </div>

        {/* ── IOU Net ──
            Shows: net balance at a glance
            Card below shows: you-owe / owed-to-you split + people chips
        */}
        <div className="bg-grey-x100 rounded-xl p-3 flex flex-col items-center gap-1.5 text-center">
          <div className="w-[52px] h-[52px] rounded-full bg-grey-x200 flex flex-col items-center justify-center flex-shrink-0 px-1 overflow-hidden">
            <span
              className="text-xs font-extrabold leading-none"
              style={{ color: iouNet >= 0 ? 'var(--success)' : 'var(--error)' }}
            >
              {iouNet >= 0 ? '+' : '-'}{symbol}{fmtCompact(iouNet)}
            </span>
          </div>
          <div>
            <p className="text-[11px] font-bold text-foreground">IOUs</p>
            <p className="text-[9px] text-muted-foreground mt-0.5 leading-tight">Net balance</p>
          </div>
          {iouPending > 0 && (
            <span className="text-[9px] font-semibold text-muted-foreground">
              {iouPending} pending
            </span>
          )}
        </div>

      </div>
    </div>
  )
}

export default DailyPulse
