import React, { useState, useEffect, useMemo } from 'react'
import { Sparkles, RefreshCw } from 'lucide-react'
import moment from 'moment'
import { toast } from 'sonner'
import axiosInstance from '@/utils/axiosInstance'
import DailyPulse from '@/feature-component/dashboard/DailyPulse'
import QuickLog from '@/feature-component/dashboard/QuickLog'
import ExpenseSummaryCard from '@/feature-component/dashboard/ExpenseSummaryCard'
import GoalsSummaryCard from '@/feature-component/dashboard/GoalsSummaryCard'
import IouSummaryCard from '@/feature-component/dashboard/IouSummaryCard'
import FeatureCarousel from '@/feature-component/dashboard/FeatureCarousel'
import RecurringManager from '@/feature-component/expense-tracker/RecurringManager'
import { useIsMobile } from '@/hooks/useIsMobile'
import type { Goal, ExpenseSummary, IouData, DashboardInsight, ActivityStreak } from '@/types/dashboard'
import type { ExpenseRecord, IncomeRecord, RecurringRule } from '@/types/expenseTracker'
import type { Iou } from '@/types/iou'
import { computeQuickChips } from '@/utils/quickChips'
import { buildActivityFeed, type ActivityItem } from '@/utils/activityFeed'
import { categoryEmojiMap } from '@/utils/constant'
import { CategoryIcon } from '@/components/CategoryIcon'
import { getGreeting } from '@/utils/utils-functions'
import { useCurrency } from '@/hooks/useCurrency'

// ─── Constants ───────────────────────────────────────────────────────────────

const EMPTY_IOU: IouData = {
  youOwe: 0,
  owedToYou: 0,
  net: 0,
  pendingCount: 0,
  overdueCount: 0,
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

interface RecentActivityProps {
  items: ActivityItem[]
  isLoading: boolean
  /** Desktop right-col shows more rows */
  skeletonRows?: number
}

// Amount color + sign prefix per tone. Income is green (+), expenses red (-),
// IOU movements stay neutral teal with no sign (they aren't budget spend).
const TONE: Record<ActivityItem['tone'], { className: string; sign: string }> = {
  positive: { className: 'text-success', sign: '+' },
  negative: { className: 'text-error', sign: '-' },
  neutral: { className: 'text-secondary', sign: '' },
}

const RecentActivity: React.FC<RecentActivityProps> = ({
  items, isLoading, skeletonRows = 3,
}) => {
  const { symbol } = useCurrency()
  return (
  <div>
    <div className="flex items-center mb-2">
      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
        Recent Activity
      </span>
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
    ) : items.length === 0 ? (
      <div className="text-center py-6 bg-card border border-border rounded-2xl">
        <p className="text-sm text-muted-foreground">No activity yet</p>
      </div>
    ) : (
      <div className="bg-card border border-border rounded-2xl px-4">
        {items.map((item, i) => {
          const tone = TONE[item.tone]
          return (
            <div
              key={item.id}
              className="flex items-center gap-3 py-3"
              style={{
                borderBottom: i < items.length - 1 ? '1px solid var(--border)' : 'none',
              }}
            >
              <div className="w-8 h-8 rounded-xl bg-grey-x100 flex items-center justify-center flex-shrink-0">
                {item.kind === 'expense' ? (
                  <CategoryIcon name={item.title} size={20} />
                ) : item.kind === 'income' ? (
                  <CategoryIcon name={item.title} size={20} fallback="salary" />
                ) : item.kind === 'goal-completed' ? (
                  <CategoryIcon name="goal" size={20} />
                ) : (
                  <CategoryIcon name="iou" size={20} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground capitalize truncate">
                  {item.title}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {item.subtitle ? `${item.subtitle} · ` : ''}
                  {moment(item.date).fromNow()}
                </p>
              </div>
              {item.amount != null && (
                <span className={`text-sm font-bold flex-shrink-0 ${tone.className}`}>
                  {tone.sign}{symbol}{item.amount.toLocaleString()}
                </span>
              )}
            </div>
          )
        })}
      </div>
    )}
  </div>
  )
}

interface SmartInsightsProps {
  insights: DashboardInsight[]
  isLoading: boolean
  isRefreshing: boolean
  onRefresh: () => void
  /** Currency symbol swapped in for the ¤ token used in insight text. */
  symbol: string
  /** 'ai' shows a subtle AI badge; 'fallback' stays unmarked. */
  source?: 'ai' | 'fallback' | null
  highlight?: boolean
}

const SmartInsights: React.FC<SmartInsightsProps> = ({
  insights, isLoading, isRefreshing, onRefresh, symbol, source = null, highlight = false,
}) => {
  const render = (text: string) => text.split('¤').join(symbol)
  const skeletonRows = 3

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          Smart Insights
          {source === 'ai' && !isLoading && (
            <span className="text-[9px] font-bold text-primary bg-primary/10 rounded-full px-1.5 py-0.5 tracking-normal normal-case">
              AI
            </span>
          )}
        </p>
        <button
          onClick={onRefresh}
          disabled={isLoading || isRefreshing}
          aria-label="Refresh insights"
          className="text-muted-foreground hover:text-primary transition-colors disabled:opacity-50 p-1 -m-1"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div
        className={`bg-card border rounded-2xl overflow-hidden transition-colors duration-500 ${
          highlight ? 'border-primary/60 animate-glow' : 'border-border'
        }`}
      >
        {isLoading ? (
          Array.from({ length: skeletonRows }).map((_, i) => (
            <div
              key={i}
              className="flex items-start gap-3 px-4 py-3.5"
              style={{ borderBottom: i < skeletonRows - 1 ? '1px solid var(--border)' : 'none' }}
            >
              <div className="skeleton w-5 h-5 rounded-md flex-shrink-0" />
              <div className="flex-1 space-y-1.5 pt-0.5">
                <div className="skeleton h-2.5 w-full rounded" />
                <div className="skeleton h-2.5 w-2/3 rounded" />
              </div>
            </div>
          ))
        ) : insights.length === 0 ? (
          <div className="text-center py-6 px-4">
            <p className="text-sm text-muted-foreground">No insights yet — log some activity to get started.</p>
          </div>
        ) : (
          insights.map((insight, i) => (
            <div
              key={insight.id}
              className="flex items-start gap-3 px-4 py-3.5"
              style={{ borderBottom: i < insights.length - 1 ? '1px solid var(--border)' : 'none' }}
            >
              <span className="text-base flex-shrink-0 mt-0.5">{insight.emoji}</span>
              <p className="text-xs text-muted-foreground leading-relaxed">{render(insight.text)}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const Dashboard_Page: React.FC = () => {
  const { symbol } = useCurrency()
  // Below lg, the three feature cards become a swipeable carousel instead of a
  // tall stack; desktop keeps the equal stacked cards. Branching here (rather
  // than CSS show/hide) mounts the cards once, so their internal fetches don't
  // double-fire.
  const isMobile = useIsMobile()

  const [expenseSummary, setExpenseSummary] = useState<ExpenseSummary>({
    totalSpend: 0, budget: 0, totalIncome: 0, topCategories: [],
  })
  const [goals, setGoals] = useState<Goal[]>([])
  // Full current-month records: feed the activity list and the quick-log chips.
  const [monthExpenses, setMonthExpenses] = useState<ExpenseRecord[]>([])
  const [monthIncome, setMonthIncome] = useState<IncomeRecord[]>([])
  // IOU records (for activity-feed events) — the summary lacks per-IOU timestamps.
  const [ious, setIous] = useState<Iou[]>([])
  const [iouData, setIouData] = useState<IouData>(EMPTY_IOU)
  const [streak, setStreak] = useState<ActivityStreak>({ current: 0, longest: 0, loggedToday: false })
  // Streak UI is temporarily commented out (see header). State + fetch stay wired
  // so restoring it is just uncommenting the badge below.
  void streak
  const [recurringRules, setRecurringRules] = useState<RecurringRule[]>([])
  const [recurringSheetOpen, setRecurringSheetOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)
  const [highlightInsights, setHighlightInsights] = useState(false)

  const [insights, setInsights] = useState<DashboardInsight[]>([])
  const [insightsSource, setInsightsSource] = useState<'ai' | 'fallback' | null>(null)
  const [insightsLoading, setInsightsLoading] = useState(true)
  const [insightsRefreshing, setInsightsRefreshing] = useState(false)

  // Scroll to Smart Insights and briefly pulse a ring so the eye lands on it.
  const goToInsights = () => {
    const el = document.getElementById('smart-insights')
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setHighlightInsights(true)
    window.setTimeout(() => setHighlightInsights(false), 1400)
  }

  // Insights come from the AI endpoint (Gemini-generated, server-cached). They
  // load independently so a slower AI call never blocks the summary cards.
  // `refresh` forces a server-side regeneration instead of serving the cache.
  const fetchInsights = async (refresh = false) => {
    if (refresh) setInsightsRefreshing(true)
    else setInsightsLoading(true)
    try {
      const res = await axiosInstance.get('/v1/insights/dashboard', {
        params: refresh ? { refresh: true } : {},
      })
      setInsights(res.data?.insights ?? [])
      setInsightsSource(res.data?.source ?? null)
    } catch (err) {
      console.error('Insights fetch error:', err)
      setInsights([])
    } finally {
      setInsightsLoading(false)
      setInsightsRefreshing(false)
    }
  }

  const loadRecurring = async () => {
    try {
      const res = await axiosInstance.get('/v1/expenses/recurring')
      setRecurringRules(res.data?.rules ?? [])
    } catch (err) {
      console.error('Recurring fetch error:', err)
    }
  }

  // Pause/resume and delete mirror the expense tracker's behavior so a rule
  // managed from the dashboard behaves identically. Records already logged
  // are never touched.
  const handleToggleRecurring = async (rule: RecurringRule) => {
    try {
      await axiosInstance.patch(`/v1/expenses/recurring/${rule._id}`, { isActive: !rule.isActive })
      toast.success(rule.isActive ? 'Paused' : 'Back on, starting next due date')
      await loadRecurring()
    } catch (err) {
      console.error('Error updating recurring rule:', err)
      toast.error('Failed to update rule')
    }
  }

  const handleDeleteRecurring = async (rule: RecurringRule) => {
    try {
      await axiosInstance.delete(`/v1/expenses/recurring/${rule._id}`)
      toast.success('Rule deleted. Your past records are safe')
      await loadRecurring()
    } catch (err) {
      console.error('Error deleting recurring rule:', err)
      toast.error('Failed to delete rule')
    }
  }

  useEffect(() => {
    fetchInsights()
  }, [])

  useEffect(() => {
    const fetchAll = async () => {
      setIsLoading(true)
      try {
        const [expRes, goalsRes, recentRes, iouRes, iouListRes, streakRes] = await Promise.all([
          axiosInstance.get('/v1/expenses/dashboard-summary'),
          axiosInstance.get('/v1/goals').catch(() => ({ data: { goals: [] } })),
          axiosInstance
            .get(`/v1/expenses/details?date=${moment().format('YYYY-MM-DD')}`)
            .catch(() => ({ data: { expenseRecords: [], incomeRecords: [] } })),
          axiosInstance.get('/v1/iou/summary').catch(() => ({ data: EMPTY_IOU })),
          axiosInstance.get('/v1/iou').catch(() => ({ data: { ious: [] } })),
          axiosInstance.get('/v1/streak').catch(() => ({ data: null })),
          loadRecurring(), // sets recurring state itself; result unused here
        ])
        const records: ExpenseRecord[] = recentRes.data?.expenseRecords ?? []
        setExpenseSummary(processExpenseData(expRes.data))
        setGoals(goalsRes.data?.goals ?? [])
        setMonthExpenses(records)
        setMonthIncome(recentRes.data?.incomeRecords ?? [])
        setIous(iouListRes.data?.ious ?? [])
        setIouData({ ...EMPTY_IOU, ...(iouRes.data ?? {}) })
        if (streakRes.data) setStreak(streakRes.data)
      } catch (err) {
        console.error('Dashboard fetch error:', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchAll()
  }, [refreshKey])

  // ── Derived values ──────────────────────────────────────────────────────────
  const quickChips = useMemo(() => computeQuickChips(monthExpenses), [monthExpenses])

  // Unified cross-feature feed: expenses, income, IOU events, goal completions,
  // newest first. Built in a framework-agnostic util so it ports to RN as-is.
  const activity = useMemo<ActivityItem[]>(
    () => buildActivityFeed({ expenses: monthExpenses, incomes: monthIncome, ious, goals, limit: 8 }),
    [monthExpenses, monthIncome, ious, goals]
  )

  // How many of this month's records logged themselves from recurring rules —
  // the "you didn't have to do this" signal, surfaced inside the expense card.
  const autoLoggedCount = useMemo(
    () => monthExpenses.filter((r) => !!r.recurringRuleId).length,
    [monthExpenses]
  )

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

  // Attention signals drive the carousel tab dots — shown only when a feature
  // genuinely needs the user (Action-Dots principle: no dot = nothing wrong).
  // Expenses: over budget. Goals: an active goal past its target date.
  // IOU: an open IOU past its expected payback date (overdueCount from summary).
  const expenseAttention = expenseSummary.budget > 0 && budgetPct >= 100
  const goalsAttention = activeGoals.some(
    (g) => g.targetDate && new Date(g.targetDate).getTime() < now.getTime()
  )
  const iouAttention = iouData.overdueCount > 0

  // Built once; rendered either inside the mobile carousel or the desktop
  // stack (never both — see isMobile), so no duplicate mounts/fetches.
  const expenseCard = (
    <ExpenseSummaryCard
      totalSpend={expenseSummary.totalSpend}
      budget={expenseSummary.budget}
      budgetPct={budgetPct}
      topCategories={expenseSummary.topCategories}
      autoLoggedCount={autoLoggedCount}
      onManageRecurring={() => setRecurringSheetOpen(true)}
      isLoading={isLoading}
      onBudgetSaved={() => setRefreshKey((p) => p + 1)}
    />
  )
  const goalsCard = (
    <GoalsSummaryCard
      goals={goals}
      isLoading={isLoading}
      onChanged={() => setRefreshKey((p) => p + 1)}
    />
  )
  const iouCard = (
    <IouSummaryCard
      iouData={iouData}
      onChanged={() => setRefreshKey((p) => p + 1)}
    />
  )

  return (
    <div className="min-h-screen bg-background">
      {/*
        Mobile:  max-w-lg centered, single column stack
        Desktop: max-w-5xl, header full-width, content splits into 2 columns
      */}
      <div className="max-w-lg lg:max-w-5xl mx-auto px-4 lg:px-8 pt-4 pb-12">

        {/* ── Header — full width on both breakpoints ─────────────── */}
        <header className="flex items-center justify-between mb-4 animate-fade-up">
          <div>
            <p className="text-[11px] font-medium text-muted-foreground/60 uppercase tracking-wider">
              {moment().format('dddd, MMM D')}
            </p>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-foreground tracking-tight mt-0.5 font-heading">
              {getGreeting()}<span className="text-primary">.</span>
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Activity streak — consecutive days the user showed up (any
                feature). Shown on both breakpoints; hidden until there's a run.
                Temporarily hidden. */}
            {/* {streak.current > 0 && (
              <div
                className="inline-flex items-center gap-1 h-9 px-3 rounded-full bg-warning/10 text-warning text-xs font-bold"
                title={streak.longest > streak.current ? `Best: ${streak.longest} days` : undefined}
              >
                <span className="text-sm leading-none">🔥</span>
                {streak.current} day
              </div>
            )} */}

            {/* Mobile only: eye-catching jump to Smart Insights (which otherwise
                sit at the bottom of the stack). Desktop shows them in the sticky
                right panel, so no jump is needed there. */}
            <button
              onClick={goToInsights}
              aria-label="Jump to Smart Insights"
              className="lg:hidden relative inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground text-xs font-bold shadow-lg shadow-primary/30 active:scale-95 transition-transform"
            >
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-secondary" />
              </span>
              <Sparkles className="w-3.5 h-3.5" />
              Insights
            </button>
          </div>
        </header>

        {/*
          ── Two-column grid on desktop ─────────────────────────────
          Mobile: single column (grid-cols-1, right col flows below left)
          Desktop lg+: [3fr 2fr] — left = feature cards, right = context panel
        */}
        <div className="lg:grid lg:grid-cols-[3fr_2fr] lg:gap-6 lg:items-start">

          {/* ══ LEFT COLUMN — Feature cards ══════════════════════════ */}
          <div className="space-y-3 animate-stagger-in">

            {/* One-tap re-logging of frequent expenses — top of the stack so a
                forgetful user can log before anything else competes for attention. */}
            <QuickLog chips={quickChips} onLogged={() => setRefreshKey((p) => p + 1)} />

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

            {/* Below lg: swipeable carousel (one card at a time, equal turn,
                tab dots for triage). lg+: the equal stacked cards, unchanged. */}
            {isMobile ? (
              <FeatureCarousel
                slides={[
                  { key: 'expenses', label: 'Expenses', icon: 'expense', accent: 'var(--primary)', attention: expenseAttention, node: expenseCard },
                  { key: 'goals', label: 'Goals', icon: 'goal', accent: 'var(--accent)', attention: goalsAttention, node: goalsCard },
                  { key: 'iou', label: 'IOUs', icon: 'iou', accent: 'var(--secondary)', attention: iouAttention, node: iouCard },
                ]}
              />
            ) : (
              <>
                {expenseCard}
                {goalsCard}
                {iouCard}
              </>
            )}

            {/* Headless: trigger lives in the expense card; this only renders the
                bottom sheet so recurring rules are managed in place. */}
            <RecurringManager
              rules={recurringRules}
              monthlyExpenseTotal={0}
              onToggleActive={handleToggleRecurring}
              onDelete={handleDeleteRecurring}
              open={recurringSheetOpen}
              onOpenChange={setRecurringSheetOpen}
            />

            {/*
              Mobile only: Insights + Recent Expenses appear here, below the cards,
              in the natural document flow. Hidden on desktop (shown in right col instead).
            */}
            <div className="space-y-5 lg:hidden pt-2">
              <div id="smart-insights" className="scroll-mt-20">
                <SmartInsights
                  insights={insights}
                  isLoading={insightsLoading}
                  isRefreshing={insightsRefreshing}
                  onRefresh={() => fetchInsights(true)}
                  symbol={symbol}
                  source={insightsSource}
                  highlight={highlightInsights}
                />
              </div>
              <RecentActivity
                items={activity.slice(0, 4)}
                isLoading={isLoading}
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
                    {symbol}{expenseSummary.totalIncome.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground mb-0.5">Spent</p>
                  <p className="text-xl font-extrabold text-foreground tracking-tight">
                    {symbol}{expenseSummary.totalSpend.toLocaleString()}
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
                      {symbol}{Math.abs(expenseSummary.totalIncome - expenseSummary.totalSpend).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <SmartInsights
              insights={insights}
              isLoading={insightsLoading}
              isRefreshing={insightsRefreshing}
              onRefresh={() => fetchInsights(true)}
              symbol={symbol}
              source={insightsSource}
            />

            <RecentActivity
              items={activity}
              isLoading={isLoading}
              skeletonRows={5}
            />

          </div>

        </div>
      </div>
    </div>
  )
}

export default Dashboard_Page
