import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import moment from 'moment'
import axiosInstance from '@/utils/axiosInstance'
import DailyPulse from '@/feature-component/dashboard/DailyPulse'
import ExpenseSummaryCard from '@/feature-component/dashboard/ExpenseSummaryCard'
import GoalsSummaryCard from '@/feature-component/dashboard/GoalsSummaryCard'
import IouSummaryCard from '@/feature-component/dashboard/IouSummaryCard'
import type { Goal, ExpenseSummary, RecentExpense, IouData } from '@/types/dashboard'
import { categoryEmojiMap } from '@/utils/constant'
import { getGreeting } from '@/utils/utils-functions'

// ─── Constants ───────────────────────────────────────────────────────────────

// TODO: Replace with real behavioral insights from backend API
const INSIGHTS = [
  {
    text: 'Weekend spending is 2.8× higher than weekdays — consider a weekend budget cap.',
    icon: '⚡',
  },
  {
    text: "You've been logging expenses consistently. That's the habit that matters most.",
    icon: '🔥',
  },
  {
    text: 'Some friends owe you money — a friendly nudge usually works.',
    icon: '🤝',
  },
]

const EMPTY_IOU: IouData = {
  youOwe: 0,
  owedToYou: 0,
  net: 0,
  pendingCount: 0,
  people: [],
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getCategoryEmoji = (name: string) => categoryEmojiMap[name?.toLowerCase()] ?? '🔀'

const processExpenseData = (data: any): ExpenseSummary => ({
  totalSpend: data?.totalSpend?.amount ?? 0,
  budget: data?.budget?.amount ?? 0,
  totalIncome: data?.totalIncome?.amount ?? 0,
  topCategories: (data?.topCategory ?? []).slice(0, 4).map((c: any) => ({
    name: c.name ?? c.category ?? 'Other',
    amount: c.amount ?? 0,
    emoji: getCategoryEmoji(c.name ?? c.category ?? ''),
  })),
})

// ─── Sub-components ───────────────────────────────────────────────────────────

interface RecentExpensesProps {
  expenses: RecentExpense[]
  isLoading: boolean
  onViewAll: () => void
  /** Desktop right-col shows more rows */
  skeletonRows?: number
}

const RecentExpenses: React.FC<RecentExpensesProps> = ({
  expenses, isLoading, onViewAll, skeletonRows = 3,
}) => (
  <div>
    <div className="flex items-center justify-between mb-2">
      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
        Recent Expenses
      </span>
      <button
        onClick={onViewAll}
        className="text-xs text-primary font-semibold hover:underline"
      >
        View all →
      </button>
    </div>

    {isLoading ? (
      <div className="bg-card border border-border rounded-2xl px-4">
        {Array.from({ length: skeletonRows }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 py-3"
            style={{ borderBottom: i < skeletonRows - 1 ? '1px solid var(--border)' : 'none' }}
          >
            <div className="skeleton w-8 h-8 rounded-xl flex-shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="skeleton h-3 w-24 rounded" />
              <div className="skeleton h-2.5 w-16 rounded" />
            </div>
            <div className="skeleton h-4 w-12 rounded" />
          </div>
        ))}
      </div>
    ) : expenses.length === 0 ? (
      <div className="text-center py-6 bg-card border border-border rounded-2xl">
        <p className="text-sm text-muted-foreground">No expenses logged today</p>
      </div>
    ) : (
      <div className="bg-card border border-border rounded-2xl px-4">
        {expenses.map((tx, i) => (
          <div
            key={tx._id}
            className="flex items-center gap-3 py-3"
            style={{
              borderBottom: i < expenses.length - 1 ? '1px solid var(--border)' : 'none',
            }}
          >
            <div className="w-8 h-8 rounded-xl bg-grey-x100 flex items-center justify-center text-sm flex-shrink-0">
              {getCategoryEmoji(tx.category?.name ?? '')}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground capitalize truncate">
                {tx.category?.name ?? 'Uncategorized'}
              </p>
              <p className="text-[10px] text-muted-foreground truncate">
                {tx.note ? `${tx.note} · ` : ''}
                {moment(tx.createdAt).fromNow()}
              </p>
            </div>
            <span className="text-sm font-bold text-error flex-shrink-0">
              -${tx.amount.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    )}
  </div>
)

const SmartInsights: React.FC = () => (
  <div>
    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
      Smart Insights
    </p>
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      {INSIGHTS.map((insight, i) => (
        <div
          key={i}
          className="flex items-start gap-3 px-4 py-3.5"
          style={{
            borderBottom: i < INSIGHTS.length - 1 ? '1px solid var(--border)' : 'none',
          }}
        >
          <span className="text-base flex-shrink-0 mt-0.5">{insight.icon}</span>
          <p className="text-xs text-muted-foreground leading-relaxed">{insight.text}</p>
        </div>
      ))}
    </div>
  </div>
)

// ─── Page ─────────────────────────────────────────────────────────────────────

const Dashboard_Page: React.FC = () => {
  const navigate = useNavigate()

  const [expenseSummary, setExpenseSummary] = useState<ExpenseSummary>({
    totalSpend: 0, budget: 0, totalIncome: 0, topCategories: [],
  })
  const [goals, setGoals] = useState<Goal[]>([])
  const [recentExpenses, setRecentExpenses] = useState<RecentExpense[]>([])
  const [iouData, setIouData] = useState<IouData>(EMPTY_IOU)
  const [isLoading, setIsLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    const fetchAll = async () => {
      setIsLoading(true)
      try {
        const [expRes, goalsRes, recentRes, iouRes] = await Promise.all([
          axiosInstance.get('/v1/expenses/dashboard-summary'),
          axiosInstance.get('/v1/goals').catch(() => ({ data: { goals: [] } })),
          axiosInstance
            .get(`/v1/expenses/details?date=${moment().format('YYYY-MM-DD')}`)
            .catch(() => ({ data: { expenseRecords: [] } })),
          axiosInstance.get('/v1/iou/summary').catch(() => ({ data: EMPTY_IOU })),
        ])
        setExpenseSummary(processExpenseData(expRes.data))
        setGoals(goalsRes.data?.goals ?? [])
        setRecentExpenses((recentRes.data?.expenseRecords ?? []).slice(0, 7))
        setIouData({ ...EMPTY_IOU, ...(iouRes.data ?? {}) })
      } catch (err) {
        console.error('Dashboard fetch error:', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchAll()
  }, [refreshKey])

  // ── Derived values ──────────────────────────────────────────────────────────
  const budgetPct = expenseSummary.budget > 0
    ? Math.min(Math.round((expenseSummary.totalSpend / expenseSummary.budget) * 100), 100)
    : 0
  const budgetLeft = expenseSummary.budget - expenseSummary.totalSpend

  const now = new Date()
  const daysLeft = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() - now.getDate()
  const dailyBudget = daysLeft > 0 && expenseSummary.budget > 0
    ? Math.max(0, Math.round(budgetLeft / daysLeft))
    : 0

  // Aggregate goal progress across active goals.
  // Prefer task-count aggregation when tasks exist; fall back to averaged progress pct.
  const activeGoals = goals.filter((g) => !g.isCompleted)
  const tasksTotal = activeGoals.reduce((s, g) => s + (g.progress?.tasksTotal ?? 0), 0)
  const tasksStarted = activeGoals.reduce((s, g) => s + (g.progress?.tasksStarted ?? 0), 0)
  const avgPct = activeGoals.length > 0
    ? Math.round(
        activeGoals.reduce((s, g) => s + (g.progress?.pct ?? 0), 0) / activeGoals.length
      )
    : 0
  const progressPct = tasksTotal > 0
    ? Math.round((tasksStarted / tasksTotal) * 100)
    : avgPct

  return (
    <div className="min-h-screen bg-background">
      {/*
        Mobile:  max-w-lg centered, single column stack
        Desktop: max-w-5xl, header full-width, content splits into 2 columns
      */}
      <div className="max-w-lg lg:max-w-5xl mx-auto px-4 lg:px-8 py-6 pb-12">

        {/* ── Header — full width on both breakpoints ─────────────── */}
        <header className="flex items-center justify-between mb-6 animate-fade-up">
          <div>
            <p className="text-[11px] font-medium text-muted-foreground/60 uppercase tracking-wider">
              {moment().format('dddd, MMM D')}
            </p>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-foreground tracking-tight mt-0.5 font-heading">
              {getGreeting()}<span className="text-primary">.</span>
            </h1>
          </div>
          {/* TODO: Show streak badge when backend streak data is available */}
        </header>

        {/*
          ── Two-column grid on desktop ─────────────────────────────
          Mobile: single column (grid-cols-1, right col flows below left)
          Desktop lg+: [3fr 2fr] — left = feature cards, right = context panel
        */}
        <div className="lg:grid lg:grid-cols-[3fr_2fr] lg:gap-6 lg:items-start">

          {/* ══ LEFT COLUMN — Feature cards ══════════════════════════ */}
          <div className="space-y-3 animate-stagger-in">

            <DailyPulse
              dailyBudget={dailyBudget}
              budgetLeft={budgetLeft}
              budgetTotal={expenseSummary.budget}
              budgetPct={budgetPct}
              daysLeft={daysLeft}
              milestoneDone={tasksStarted}
              milestoneTotal={tasksTotal}
              milestonePct={progressPct}
              iouNet={iouData.net}
              iouPending={iouData.pendingCount}
              isLoading={isLoading}
            />

            <ExpenseSummaryCard
              totalSpend={expenseSummary.totalSpend}
              budget={expenseSummary.budget}
              budgetPct={budgetPct}
              topCategories={expenseSummary.topCategories}
              isLoading={isLoading}
              onBudgetSaved={() => setRefreshKey((p) => p + 1)}
            />

            <GoalsSummaryCard goals={goals} isLoading={isLoading} />

            <IouSummaryCard iouData={iouData} />

            {/*
              Mobile only: Insights + Recent Expenses appear here, below the cards,
              in the natural document flow. Hidden on desktop (shown in right col instead).
            */}
            <div className="space-y-5 lg:hidden pt-2">
              <SmartInsights />
              <RecentExpenses
                expenses={recentExpenses.slice(0, 4)}
                isLoading={isLoading}
                onViewAll={() => navigate('/expense-tracker')}
                skeletonRows={3}
              />
            </div>

          </div>

          {/* ══ RIGHT COLUMN — Context panel (desktop only) ══════════
              Hidden on mobile via `hidden lg:block`.
              Sticky so it stays in view while scrolling the left column.
              top-24 accounts for the navbar height (~64px) + gap.
          */}
          <div className="hidden lg:flex lg:flex-col lg:gap-5 lg:sticky lg:top-24">

            {/* Balance stat strip — desktop only, gives a quick monetary anchor */}
            <div className="bg-card border border-border rounded-2xl px-5 py-4">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3">
                This month
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] text-muted-foreground mb-0.5">Income</p>
                  <p className="text-xl font-extrabold text-success tracking-tight">
                    ${expenseSummary.totalIncome.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground mb-0.5">Spent</p>
                  <p className="text-xl font-extrabold text-foreground tracking-tight">
                    ${expenseSummary.totalSpend.toLocaleString()}
                  </p>
                </div>
                {expenseSummary.totalIncome > 0 && (
                  <div className="col-span-2 pt-2 border-t border-border">
                    <p className="text-[10px] text-muted-foreground mb-0.5">Balance</p>
                    <p
                      className="text-2xl font-extrabold tracking-tight"
                      style={{
                        color: expenseSummary.totalIncome - expenseSummary.totalSpend >= 0
                          ? 'var(--success)'
                          : 'var(--error)',
                      }}
                    >
                      ${Math.abs(expenseSummary.totalIncome - expenseSummary.totalSpend).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <SmartInsights />

            <RecentExpenses
              expenses={recentExpenses}
              isLoading={isLoading}
              onViewAll={() => navigate('/expense-tracker')}
              skeletonRows={5}
            />

          </div>

        </div>
      </div>
    </div>
  )
}

export default Dashboard_Page
