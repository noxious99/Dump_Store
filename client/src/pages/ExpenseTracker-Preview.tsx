import React, { useState } from 'react'
import { FaCaretLeft, FaCaretRight, FaWallet, FaArrowRight } from 'react-icons/fa6'
import { Pencil, Check, X, Plus, Trash2 } from 'lucide-react'
import moment from 'moment'
import { categoryEmojiMap } from '@/utils/constant'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

// ─────────────────────────────────────────────────────────────
// DESIGN TOKENS (documented, not imposed by code)
//
// Typography scale — 6 sizes:
//   text-[10px] → micro: uppercase section labels, timestamps
//   text-xs     → meta, captions, small secondary text
//   text-sm     → body, button labels, primary row text
//   text-base   → emphasized body, sheet titles
//   text-2xl    → glance values, secondary hero numbers
//   text-3xl    → page H1
//   text-4xl    → budget hero amount (single intentional exception)
//
// Button scale — 3 sizes:
//   h-7  w-7    → icon buttons (nav, edit, confirm, cancel, delete)
//   h-8  px-3   → compact text actions ("+ Allocate", "+ Expense")
//   h-14 w-14   → mobile FAB
//
// Color budget (strict):
//   --error     → expense amounts, overspent states
//   --success   → income amounts, positive balance, on-pace cue
//   --warning   → budget watch chip (>=70%, <100%)
//   --primary   → interactive: progress bar default, CTA text
//   --grey-x100 → all icon backgrounds
//   everything else neutral
// ─────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────
// DUMMY DATA
// ─────────────────────────────────────────────────────────────

const MONTH_LABEL = 'Apr 2026'
const DAY_OF_MONTH = 18
const DAYS_IN_MONTH = 30

const BUDGET = {
  total: 25000,
  spent: 22230,
  get remaining() { return this.total - this.spent },
  get pct() { return Math.round((this.spent / this.total) * 100) },
  daysLeft: DAYS_IN_MONTH - DAY_OF_MONTH,
}

interface Allocation {
  id: string
  category: string
  allocated: number
  spent: number
}

const INITIAL_ALLOCATIONS: Allocation[] = [
  { id: 'a1', category: 'rent',    allocated: 18500, spent: 0 },
  { id: 'a2', category: 'utility', allocated: 4600,  spent: 3500 },
]

const MONTH_STATS = {
  income: 0,
  spent: 22230,
  get balance() { return this.income - this.spent },
}

const TOP_CATEGORIES = [
  { name: 'groceries', amount: 5390 },
  { name: 'health',    amount: 4140 },
  { name: 'utility',   amount: 3500 },
]

interface RecordItem {
  _id: string
  category: string
  note?: string
  amount: number
  at: string
}

const RECORDS: RecordItem[] = [
  { _id: 'r1', category: 'miscellaneous', amount: 100, at: moment().subtract(1, 'day').hour(22).minute(9).toISOString() },
  { _id: 'r2', category: 'health',        amount: 50,  at: moment().subtract(1, 'day').hour(22).minute(9).toISOString() },
  { _id: 'r3', category: 'groceries',     amount: 80,  at: moment().subtract(1, 'day').hour(22).minute(8).toISOString() },
  { _id: 'r4', category: 'travel',        amount: 90,  at: moment().subtract(1, 'day').hour(22).minute(8).toISOString() },
  { _id: 'r5', category: 'travel',        amount: 300, at: moment().date(16).hour(21).minute(17).toISOString() },
  { _id: 'r6', category: 'food',          amount: 160, note: 'team lunch', at: moment().date(16).hour(21).minute(17).toISOString() },
  { _id: 'r7', category: 'health',        note: 'Hospital', amount: 900, at: moment().date(15).hour(6).minute(0).toISOString() },
  { _id: 'r8', category: 'groceries',     amount: 120, at: moment().date(15).hour(19).minute(30).toISOString() },
]

const RECORDS_COUNT = 44

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

const getEmoji = (name: string) => categoryEmojiMap[name?.toLowerCase()] ?? '🔀'
const fmt = (n: number) => n.toLocaleString()
const fmtShort = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : `${n}`)

const groupByDateLabel = (records: RecordItem[]) => {
  const today = moment().startOf('day')
  const yesterday = moment().subtract(1, 'day').startOf('day')
  const map = new Map<string, RecordItem[]>()
  for (const r of records) {
    const d = moment(r.at).startOf('day')
    const label =
      d.isSame(today) ? 'Today'
      : d.isSame(yesterday) ? 'Yesterday'
      : d.format('MMM D').toUpperCase()
    if (!map.has(label)) map.set(label, [])
    map.get(label)!.push(r)
  }
  return Array.from(map.entries()).map(([label, records]) => ({ label, records }))
}

// ─────────────────────────────────────────────────────────────
// Month at a glance — merged card (values + top categories)
// ─────────────────────────────────────────────────────────────

const MonthGlance: React.FC = () => {
  const balance = MONTH_STATS.balance
  const balanceColor = balance >= 0 ? 'var(--success)' : 'var(--error)'

  return (
    <div className="bg-card border border-border rounded-2xl p-4 lg:p-5">
      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3">
        Month at a glance
      </p>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div>
          <p className="text-[10px] text-muted-foreground mb-1">Income</p>
          <p
            className="text-2xl font-extrabold tracking-tight"
            style={{ color: MONTH_STATS.income > 0 ? 'var(--success)' : 'var(--foreground)' }}
          >
            ${fmt(MONTH_STATS.income)}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground mb-1">Spent</p>
          <p className="text-2xl font-extrabold text-foreground tracking-tight">
            ${fmt(MONTH_STATS.spent)}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground mb-1">Balance</p>
          <p
            className="text-2xl font-extrabold tracking-tight"
            style={{ color: balanceColor }}
          >
            {balance < 0 ? '-' : ''}${fmt(Math.abs(balance))}
          </p>
        </div>
      </div>

      <div className="pt-3 border-t border-border">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
          Top categories
        </p>
        <div className="flex flex-wrap gap-2">
          {TOP_CATEGORIES.map((c) => (
            <div
              key={c.name}
              className="flex items-center gap-1.5 bg-grey-x100 border border-border rounded-lg px-2.5 py-1"
            >
              <span className="text-sm">{getEmoji(c.name)}</span>
              <span className="text-xs font-semibold text-foreground capitalize">{c.name}</span>
              <span className="text-xs text-muted-foreground">${fmtShort(c.amount)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Budget card (hero) — fintech vibe
//   - "Left to spend" leads (the actionable number)
//   - Progress bar with pace marker + on/over/under-pace caption
//   - Allocations as a divider-list (transaction-statement feel)
//   - Unallocated treated as a soft footer with inline "+ Allocate"
//   - `embedded` drops outer chrome for use inside the sheet
// ─────────────────────────────────────────────────────────────

interface BudgetCardProps {
  total: number
  spent: number
  remaining: number
  pct: number
  daysLeft: number
  allocations: Allocation[]
  onUpdateAllocation: (id: string, nextAmount: number) => void
  embedded?: boolean
}

const BudgetCard: React.FC<BudgetCardProps> = ({
  total, spent, remaining, pct, daysLeft, allocations, onUpdateAllocation, embedded = false,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState<string>('')
  const [isAllocating, setIsAllocating] = useState(false)

  const isAlert = pct >= 100
  const isWatch = pct >= 70 && pct < 100
  const statusLabel = isAlert ? 'Over budget' : isWatch ? `${pct}% used` : null
  const barColor = isAlert ? 'var(--error)' : 'var(--primary)'

  const totalAllocated = allocations.reduce((s, a) => s + a.allocated, 0)
  const unallocated = Math.max(total - totalAllocated, 0)
  const dailyLimit = daysLeft > 0 ? Math.max(0, Math.round(remaining / daysLeft)) : 0

  // Pace: % of month elapsed by today. Compared to spend pct to read state.
  const pacePct = Math.round((DAY_OF_MONTH / DAYS_IN_MONTH) * 100)
  const showPaceTick = !isAlert && pacePct > 0 && pacePct < 100
  let paceLabel: string | null = null
  let paceColor = 'var(--muted-foreground)'
  if (showPaceTick) {
    const diff = pct - pacePct
    if (diff > 5)      { paceLabel = 'Spending ahead of pace'; paceColor = 'var(--warning)' }
    else if (diff < -5){ paceLabel = 'Under pace';            paceColor = 'var(--success)' }
    else               { paceLabel = 'On pace';               paceColor = 'var(--success)' }
  }

  const startEdit = (a: Allocation) => {
    setEditingId(a.id)
    setDraft(String(a.allocated))
  }
  const commit = (id: string) => {
    const n = Number(draft)
    if (!Number.isNaN(n) && n >= 0) onUpdateAllocation(id, n)
    setEditingId(null)
  }

  const chrome = embedded ? '' : 'bg-card border border-border rounded-2xl p-5 lg:p-6'

  return (
    <div className={chrome}>
      {/* ── Header ──────────────────────────────────────────────── */}
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
              backgroundColor: isAlert ? 'var(--error-x100)' : 'var(--warning-x100)',
            }}
          >
            {statusLabel}
          </span>
        )}
      </div>

      {/* ── Hero: "Left to spend" leads ─────────────────────────── */}
      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
        {isAlert ? 'Over budget by' : 'Left to spend'}
      </p>
      <div className="flex items-baseline gap-2 mb-1">
        <span
          className="text-4xl font-extrabold tracking-tight"
          style={{ color: isAlert ? 'var(--error)' : 'var(--foreground)' }}
        >
          ${fmt(Math.abs(remaining))}
        </span>
        <span className="text-base text-muted-foreground">of ${fmt(total)}</span>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        {daysLeft > 0
          ? <>~<span className="text-foreground font-semibold">${fmt(dailyLimit)}</span>/day for {daysLeft} more {daysLeft === 1 ? 'day' : 'days'}</>
          : <>Last day of the month</>}
      </p>

      {/* ── Progress bar with pace marker ───────────────────────── */}
      <div className="relative h-2 bg-border rounded-full overflow-hidden mb-2">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: barColor }}
        />
        {showPaceTick && (
          <div
            className="absolute top-0 bottom-0 w-px bg-foreground/40"
            style={{ left: `${pacePct}%` }}
            aria-hidden
          />
        )}
      </div>
      <div className="flex items-center justify-between text-[10px] mb-6">
        <span className="text-muted-foreground">
          <span className="text-foreground font-semibold">${fmt(spent)}</span> spent · {pct}%
        </span>
        {paceLabel && (
          <span className="font-semibold uppercase tracking-wider" style={{ color: paceColor }}>
            ● {paceLabel}
          </span>
        )}
      </div>

      {/* ── Allocations — divider list, statement vibe ──────────── */}
      <div className="flex items-center justify-between mb-1">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
          Allocations
        </p>
        <span className="text-[10px] text-muted-foreground">
          ${fmt(totalAllocated)} of ${fmt(total)} allocated
        </span>
      </div>

      <div className="divide-y divide-border">
        {allocations.map((a) => {
          const pctUsed = a.allocated > 0 ? Math.min(Math.round((a.spent / a.allocated) * 100), 100) : 0
          const overLimit = a.spent > a.allocated
          const isEditing = editingId === a.id

          return (
            <div key={a.id} className="group flex items-center gap-3 py-3">
              <div className="w-9 h-9 rounded-lg bg-grey-x100 flex items-center justify-center text-base flex-shrink-0">
                {getEmoji(a.category)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <p className="text-sm font-semibold text-foreground capitalize truncate">
                    {a.category}
                  </p>

                  {isEditing ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        autoFocus
                        className="w-20 h-7 px-2 text-xs rounded-md bg-card border border-border focus:outline-none focus:border-primary text-foreground"
                      />
                      <button
                        onClick={() => commit(a.id)}
                        className="w-7 h-7 rounded-md hover:bg-primary/10 text-primary flex items-center justify-center"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="w-7 h-7 rounded-md hover:bg-grey-x200 text-muted-foreground flex items-center justify-center"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                        <span className={overLimit ? 'text-error font-semibold' : 'text-foreground font-semibold'}>
                          ${fmt(a.spent)}
                        </span>
                        {' / '}${fmt(a.allocated)}
                      </span>
                      <button
                        onClick={() => startEdit(a)}
                        className="w-7 h-7 rounded-md hover:bg-grey-x100 text-muted-foreground md:opacity-0 md:group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="h-1 bg-border rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${pctUsed}%`,
                      backgroundColor: overLimit ? 'var(--error)' : 'var(--primary)',
                    }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Unallocated footer ──────────────────────────────────── */}
      <div className="mt-3 pt-3 border-t border-dashed border-border flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Plus className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
          <p className="text-sm truncate">
            <span className="font-semibold text-foreground">${fmt(unallocated)}</span>
            <span className="text-muted-foreground"> unallocated</span>
          </p>
        </div>
        {isAllocating ? (
          <div className="flex items-center gap-1">
            <input
              type="text"
              placeholder="Category"
              className="w-20 h-7 px-2 text-xs rounded-md bg-card border border-border focus:outline-none focus:border-primary text-foreground"
            />
            <input
              type="number"
              placeholder="$"
              className="w-16 h-7 px-2 text-xs rounded-md bg-card border border-border focus:outline-none focus:border-primary text-foreground"
            />
            <button
              onClick={() => setIsAllocating(false)}
              className="w-7 h-7 rounded-md hover:bg-primary/10 text-primary flex items-center justify-center"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsAllocating(false)}
              className="w-7 h-7 rounded-md hover:bg-grey-x200 text-muted-foreground flex items-center justify-center"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsAllocating(true)}
            className="h-8 px-3 text-sm font-semibold text-primary hover:bg-primary/5 rounded-md whitespace-nowrap"
          >
            + Allocate
          </button>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// BudgetStrip — mobile compact, opens bottom sheet
// ─────────────────────────────────────────────────────────────

interface BudgetStripProps {
  monthLabel: string
  total: number
  remaining: number
  pct: number
  daysLeft: number
  allocationCount: number
  unallocated: number
  onOpen: () => void
}

const BudgetStrip: React.FC<BudgetStripProps> = ({
  monthLabel, total, remaining, pct, daysLeft, allocationCount, unallocated, onOpen,
}) => {
  const isAlert = pct >= 100
  const isWatch = pct >= 70 && pct < 100
  const statusLabel = isAlert ? 'Over budget' : isWatch ? `${pct}% used` : 'On track'
  const statusColor = isAlert
    ? { color: 'var(--error)', backgroundColor: 'var(--error-x100)' }
    : isWatch
      ? { color: 'var(--warning)', backgroundColor: 'var(--warning-x100)' }
      : { color: 'var(--success)', backgroundColor: 'var(--success-x100)' }

  const barColor = isAlert ? 'var(--error)' : 'var(--primary)'
  const dailyLimit = daysLeft > 0 ? Math.max(0, Math.round(remaining / daysLeft)) : 0

  return (
    <button
      onClick={onOpen}
      className="group w-full text-left bg-card border border-border rounded-2xl overflow-hidden active:scale-[0.99] transition-transform"
    >
      <div className="p-4">
        {/* ── Header: branded icon + title/month + status pill ───── */}
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

        {/* ── Hero: Left to spend + daily/days meta ─────────────── */}
        <div className="flex items-end justify-between gap-3 mb-2">
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              {isAlert ? 'Over by' : 'Left to spend'}
            </p>
            <p className="flex items-baseline gap-1.5">
              <span
                className="text-3xl font-extrabold tracking-tight leading-tight"
                style={{ color: isAlert ? 'var(--error)' : 'var(--foreground)' }}
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
                ${fmt(dailyLimit)}<span className="font-normal text-muted-foreground">/day</span>
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {daysLeft} {daysLeft === 1 ? 'day' : 'days'} left
              </p>
            </div>
          )}
        </div>

        {/* ── Progress ─────────────────────────────────────────── */}
        <div className="h-1.5 bg-border rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: barColor }}
          />
        </div>
      </div>

      {/* ── Footer action zone: preview content + explicit CTA ─── */}
      <div className="flex items-center justify-between gap-2 px-4 py-3 border-t border-border bg-grey-x100">
        <p className="text-xs text-muted-foreground truncate">
          <span className="font-semibold text-foreground">{allocationCount}</span>{' '}
          {allocationCount === 1 ? 'allocation' : 'allocations'}
          {unallocated > 0 && (
            <> · <span className="font-semibold text-foreground">${fmtShort(unallocated)}</span> unallocated</>
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

// ─────────────────────────────────────────────────────────────
// Records list — bottom-most, full width
// ─────────────────────────────────────────────────────────────

const RecordsList: React.FC<{
  records: RecordItem[]
  total: number
  onDelete: (id: string) => void
}> = ({ records, total, onDelete }) => {
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const groups = groupByDateLabel(records)

  return (
    <div className="bg-card border border-border rounded-2xl p-4 lg:p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
          Expense Records
        </p>
        <span className="text-[10px] text-muted-foreground">
          {total} {total === 1 ? 'record' : 'records'}
        </span>
      </div>

      {records.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">No expenses this month</p>
        </div>
      ) : (
        <div className="space-y-4">
          {groups.map(({ label, records }) => (
            <div key={label}>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 px-1">
                {label}
              </p>
              <div>
                {records.map((r, i) => {
                  const isConfirming = confirmId === r._id
                  return (
                    <div
                      key={r._id}
                      className="group flex items-center gap-3 py-3 px-1"
                      style={{
                        borderBottom: i < records.length - 1 ? '1px solid var(--border)' : 'none',
                      }}
                    >
                      <div className="w-9 h-9 rounded-lg bg-grey-x100 flex items-center justify-center text-base flex-shrink-0">
                        {getEmoji(r.category)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground capitalize truncate">
                          {r.category}
                        </p>
                        {r.note && (
                          <p className="text-xs text-muted-foreground truncate">{r.note}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="text-right">
                          <p className="text-sm font-bold text-error">-${fmt(r.amount)}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {moment(r.at).format('h:mm A')}
                          </p>
                        </div>

                        {isConfirming ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => { onDelete(r._id); setConfirmId(null) }}
                              className="w-7 h-7 rounded-md hover:bg-error/10 text-error flex items-center justify-center"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setConfirmId(null)}
                              className="w-7 h-7 rounded-md hover:bg-grey-x200 text-muted-foreground flex items-center justify-center"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmId(r._id)}
                            className="w-7 h-7 rounded-md hover:bg-grey-x200 text-muted-foreground md:opacity-0 md:group-hover:opacity-100 transition-opacity flex items-center justify-center"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// MobileFab — + expense / + income, mobile only
// ─────────────────────────────────────────────────────────────

const MobileFab: React.FC = () => {
  const [open, setOpen] = useState(false)
  return (
    <div className="lg:hidden fixed bottom-5 right-5 z-40 flex flex-col items-end gap-2">
      {open && (
        <>
          <button className="h-8 px-3 text-sm font-semibold text-foreground bg-card border border-border rounded-full shadow-md">
            + Income
          </button>
          <button className="h-8 px-3 text-sm font-semibold text-foreground bg-card border border-border rounded-full shadow-md">
            + Expense
          </button>
        </>
      )}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center transition-transform"
        style={{ transform: open ? 'rotate(45deg)' : 'rotate(0)' }}
        aria-label="Add"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Page shell — single column. Records bottom. Budget = strip→sheet on mobile
// ─────────────────────────────────────────────────────────────

const ExpenseTrackerPreview: React.FC = () => {
  const [allocations, setAllocations] = useState(INITIAL_ALLOCATIONS)
  const [records, setRecords] = useState(RECORDS)
  const [sheetOpen, setSheetOpen] = useState(false)

  const onUpdateAllocation = (id: string, nextAmount: number) => {
    setAllocations(prev => prev.map(a => a.id === id ? { ...a, allocated: nextAmount } : a))
  }
  const onDelete = (id: string) => setRecords(prev => prev.filter(r => r._id !== id))

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 lg:px-8 py-6 pb-24 lg:pb-12">

        {/* ── Header ─────────────────────────────────────────────── */}
        <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Expense Tracker
            </p>
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight mt-0.5 font-heading">
              Manage your spending<span className="text-primary">.</span>
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-card border border-border rounded-lg p-1">
              <button className="w-7 h-7 rounded-md hover:bg-grey-x100 text-muted-foreground flex items-center justify-center">
                <FaCaretLeft className="text-sm" />
              </button>
              <span className="px-2 text-sm font-semibold text-foreground min-w-[75px] text-center">
                {MONTH_LABEL}
              </span>
              <button className="w-7 h-7 rounded-md hover:bg-grey-x100 text-muted-foreground flex items-center justify-center">
                <FaCaretRight className="text-sm" />
              </button>
            </div>

            {/* Desktop-only actions (mobile uses FAB) */}
            <div className="hidden lg:flex items-center gap-2">
              <button className="h-8 px-3 text-sm font-semibold text-foreground bg-grey-x100 hover:bg-grey-x200 rounded-lg transition-colors">
                + Expense
              </button>
              <button className="h-8 px-3 text-sm font-semibold text-foreground bg-grey-x100 hover:bg-grey-x200 rounded-lg transition-colors">
                + Income
              </button>
            </div>
          </div>
        </header>

        {/* ── Stack: glance → budget → records ───────────────────── */}
        <div className="space-y-4">
          <MonthGlance />

          {/* Desktop: full budget card inline */}
          <div className="hidden lg:block">
            <BudgetCard
              total={BUDGET.total}
              spent={BUDGET.spent}
              remaining={BUDGET.remaining}
              pct={BUDGET.pct}
              daysLeft={BUDGET.daysLeft}
              allocations={allocations}
              onUpdateAllocation={onUpdateAllocation}
            />
          </div>

          {/* Mobile: compact strip → bottom sheet */}
          <div className="lg:hidden">
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <div>
                  <BudgetStrip
                    monthLabel={MONTH_LABEL}
                    total={BUDGET.total}
                    remaining={BUDGET.remaining}
                    pct={BUDGET.pct}
                    daysLeft={BUDGET.daysLeft}
                    allocationCount={allocations.length}
                    unallocated={Math.max(BUDGET.total - allocations.reduce((s, a) => s + a.allocated, 0), 0)}
                    onOpen={() => setSheetOpen(true)}
                  />
                </div>
              </SheetTrigger>
              <SheetContent
                side="bottom"
                className="rounded-t-2xl max-h-[88vh] overflow-y-auto p-0"
              >
                <SheetHeader className="px-5 pt-5 pb-3 text-left">
                  <SheetTitle className="text-base font-extrabold text-foreground">
                    Budget · {MONTH_LABEL}
                  </SheetTitle>
                </SheetHeader>
                <div className="px-5 pb-6">
                  <BudgetCard
                    total={BUDGET.total}
                    spent={BUDGET.spent}
                    remaining={BUDGET.remaining}
                    pct={BUDGET.pct}
                    daysLeft={BUDGET.daysLeft}
                    allocations={allocations}
                    onUpdateAllocation={onUpdateAllocation}
                    embedded
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <RecordsList
            records={records}
            total={RECORDS_COUNT}
            onDelete={onDelete}
          />
        </div>
      </div>

      <MobileFab />
    </div>
  )
}

export default ExpenseTrackerPreview
