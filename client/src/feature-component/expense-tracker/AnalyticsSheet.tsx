import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ReferenceLine,
  XAxis,
  YAxis,
} from 'recharts'
import {
  Loader2,
  Sparkles,
  Gauge,
  Target,
  Repeat,
  PiggyBank,
  TriangleAlert,
  TrendingUp,
  TrendingDown,
  PieChart as PieIcon,
  Calendar,
  ChevronRight,
  ChevronDown,
  BarChart3,
  Download,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ChartContainer, ChartTooltip } from '@/components/ui/chart'
import axiosInstance from '@/utils/axiosInstance'
import { CategoryIcon } from '@/components/CategoryIcon'
import { useCurrency } from '@/hooks/useCurrency'
import { useIsMobile } from '@/hooks/useIsMobile'
import type { AnalyticsData, AnalyticsRange, AnalyticsInsight } from '@/types/expenseTracker'
import moment from 'moment'
import { useExport } from '@/hooks/useExport'
import type { ExportFormat } from '@/types/export'

interface AnalyticsSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  // Lets an actionable insight (e.g. a category over budget) jump to the budget
  onOpenBudget?: () => void
}

const INSIGHT_ICONS: Record<string, LucideIcon> = {
  gauge: Gauge,
  target: Target,
  repeat: Repeat,
  piggy: PiggyBank,
  alert: TriangleAlert,
  'trend-up': TrendingUp,
  'trend-down': TrendingDown,
  pie: PieIcon,
  calendar: Calendar,
}

const TONE_STYLE: Record<string, { color: string; bg: string }> = {
  good: { color: 'var(--success)', bg: 'var(--success-x100)' },
  warn: { color: 'var(--warning)', bg: 'var(--warning-x100)' },
  neutral: { color: 'var(--muted-foreground)', bg: 'var(--grey-x200)' },
}

const RANGES: { value: AnalyticsRange; label: string }[] = [
  { value: 'this-month', label: 'This month' },
  { value: 'last-month', label: 'Last month' },
  { value: '3-months', label: '3 months' },
  { value: '6-months', label: '6 months' },
]

// Resolve a range key to concrete inclusive dates for the export request, so the
// exported file matches exactly the window the user is viewing.
const rangeToDates = (key: AnalyticsRange) => {
  const now = moment()
  switch (key) {
    case 'last-month': {
      const m = now.clone().subtract(1, 'month')
      return { from: m.clone().startOf('month'), to: m.clone().endOf('month'), label: 'Last month' }
    }
    case '3-months':
      return { from: now.clone().subtract(2, 'month').startOf('month'), to: now.clone().endOf('month'), label: 'Last 3 months' }
    case '6-months':
      return { from: now.clone().subtract(5, 'month').startOf('month'), to: now.clone().endOf('month'), label: 'Last 6 months' }
    case 'this-month':
    default:
      return { from: now.clone().startOf('month'), to: now.clone().endOf('month'), label: 'This month' }
  }
}

const DONUT_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
]
const OTHER_COLOR = 'var(--grey-x200)'

const fmtShort = (n: number) =>
  n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : Math.round(n).toLocaleString()

// shadcn ChartContainer requires a config; colours are applied per-element
// so an empty config is fine here.
const EMPTY_CONFIG = {}

const AnalyticsSheet: React.FC<AnalyticsSheetProps> = ({ open, onOpenChange, onOpenBudget }) => {
  const { symbol, currency } = useCurrency()
  const isMobile = useIsMobile()
  const { exporting, start: startExport } = useExport()
  const [range, setRange] = useState<AnalyticsRange>('this-month')
  const [cache, setCache] = useState<Partial<Record<AnalyticsRange, AnalyticsData>>>({})
  const [loading, setLoading] = useState(false)

  // Scroll affordance for the mobile sheet — the charts sit below the fold and
  // were silently cut off, with nothing signalling there was more to see.
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollDown, setCanScrollDown] = useState(false)
  const updateScrollHint = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const overflow = el.scrollHeight - el.clientHeight
    setCanScrollDown(overflow > 4 && el.scrollTop < overflow - 4)
  }, [])
  const scrollToBottom = () => {
    const el = scrollRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }

  const data = cache[range]

  // Export the currently selected range as CSV/PDF (queued + generated server-side).
  const doExport = (format: ExportFormat) => {
    const { from, to, label } = rangeToDates(range)
    startExport({ format, from: from.toISOString(), to: to.toISOString(), label, currency, symbol })
  }

  // Drop the cache when the sheet closes so reopening after an add/edit/delete
  // shows fresh numbers (the cache otherwise persists stale totals for the
  // session). Toggling ranges within one open session still caches.
  useEffect(() => {
    if (!open) setCache({})
  }, [open])

  useEffect(() => {
    if (!open || cache[range]) return
    let cancelled = false
    setLoading(true)
    axiosInstance
      .get('/v1/expenses/analytics', { params: { range } })
      .then((res) => {
        if (!cancelled) setCache((c) => ({ ...c, [range]: res.data }))
      })
      .catch((err) => console.error('Error fetching analytics:', err))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [open, range, cache])

  // Recompute the scroll hint whenever the body height changes — range switches,
  // data arriving, and async chart renders all change how tall the content is.
  useEffect(() => {
    const el = scrollRef.current
    if (!open || !el) return
    updateScrollHint()
    const inner = el.firstElementChild
    if (!inner || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(updateScrollHint)
    ro.observe(inner)
    return () => ro.disconnect()
  }, [open, data, loading, range, updateScrollHint])

  const money = (n: number) => `${symbol}${Math.round(n).toLocaleString()}`
  const renderInsightText = (text: string) => text.split('¤').join(symbol)

  // Custom tooltip so amounts carry the currency symbol
  const MoneyTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null
    const point = payload[0]?.payload
    return (
      <div className="rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl">
        <p className="font-medium mb-1">{point?.fullLabel}</p>
        {payload.map((p: any) => (
          <div key={p.dataKey} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ background: p.color || p.fill }} />
            <span className="text-muted-foreground capitalize">{p.name || p.dataKey}</span>
            <span className="ml-auto font-mono font-medium text-foreground">
              {symbol}{Number(p.value).toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    )
  }

  // Top 5 categories + an "Other" slice for the rest
  const donutData = (() => {
    if (!data) return []
    const top = data.categories.slice(0, 5)
    const rest = data.categories.slice(5)
    const restTotal = rest.reduce((s, c) => s + c.total, 0)
    const out = top.map((c, i) => ({ name: c.name, total: c.total, pct: c.pct, color: DONUT_COLORS[i] }))
    if (restTotal > 0) out.push({ name: 'Other', total: restTotal, pct: Math.round((restTotal / data.totals.spend) * 100), color: OTHER_COLOR })
    return out
  })()

  const isMonthly = data?.range.granularity === 'month'
  const dailyBudget =
    data && data.range.key === 'this-month' && data.budget > 0 && data.series.length
      ? data.budget / data.series.length
      : 0

  const handleInsightAction = (action?: 'budget') => {
    if (action === 'budget' && onOpenBudget) onOpenBudget()
  }

  const renderInsight = (ins: AnalyticsInsight, hero: boolean) => {
    const Icon = INSIGHT_ICONS[ins.icon] || Sparkles
    const tone = TONE_STYLE[ins.tone] || TONE_STYLE.neutral
    const tappable = ins.action === 'budget' && !!onOpenBudget
    const Wrapper: any = tappable ? 'button' : 'div'
    return (
      <Wrapper
        key={ins.id}
        onClick={tappable ? () => handleInsightAction(ins.action) : undefined}
        className={`w-full text-left flex items-start gap-3 rounded-xl ${
          hero ? 'p-3.5 bg-card border border-border' : 'px-3 py-2.5 bg-grey-x100'
        } ${tappable ? 'hover:bg-grey-x100/70 transition-colors' : ''}`}
      >
        <span
          className="flex items-center justify-center rounded-lg shrink-0"
          style={{ background: tone.bg, width: hero ? 38 : 30, height: hero ? 38 : 30 }}
        >
          <Icon className={hero ? 'w-5 h-5' : 'w-4 h-4'} style={{ color: tone.color }} />
        </span>
        <p className={`flex-1 text-foreground leading-snug ${hero ? 'text-[15px] font-medium' : 'text-sm'}`}>
          {renderInsightText(ins.text)}
        </p>
        {tappable && <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />}
      </Wrapper>
    )
  }

  const body = (
    <div className="space-y-4">
      {/* Range filter */}
      <div className="flex bg-grey-x100 rounded-lg p-1">
        {RANGES.map((r) => (
          <button
            key={r.value}
            onClick={() => setRange(r.value)}
            className={`flex-1 h-8 rounded-md text-xs font-semibold transition-colors ${
              range === r.value
                ? 'bg-card shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Export the selected range — queued + generated server-side, then downloaded */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold text-muted-foreground">Export this range</span>
        <div className="flex items-center gap-1.5">
          {(['csv', 'pdf'] as ExportFormat[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => doExport(f)}
              disabled={exporting !== null}
              className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg bg-grey-x100 text-xs font-semibold text-foreground hover:bg-grey-x200 disabled:opacity-50 transition-colors"
            >
              {exporting === f ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              {f.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {loading && !data ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : !data || (data.totals.spend === 0 && data.totals.income === 0) ? (
        <p className="text-sm text-muted-foreground text-center py-16">
          No activity in this period yet.
        </p>
      ) : (
        <>
          {/* Totals strip */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-grey-x100 rounded-xl p-3">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Spent</p>
              <p className="text-lg font-extrabold text-error tabular-nums">{symbol}{fmtShort(data.totals.spend)}</p>
            </div>
            <div className="bg-grey-x100 rounded-xl p-3">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Earned</p>
              <p className="text-lg font-extrabold text-success tabular-nums">{symbol}{fmtShort(data.totals.income)}</p>
            </div>
            <div className="bg-grey-x100 rounded-xl p-3">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Net</p>
              <p className={`text-lg font-extrabold tabular-nums ${data.totals.balance >= 0 ? 'text-success' : 'text-error'}`}>
                {data.totals.balance >= 0 ? '+' : '-'}{symbol}{fmtShort(Math.abs(data.totals.balance))}
              </p>
            </div>
          </div>

          {/* Insights — hero first, the rest as a compact ranked list */}
          {data.insights.length > 0 && (
            <div className="space-y-2">
              {renderInsight(data.insights[0], true)}
              {data.insights.slice(1).map((ins) => renderInsight(ins, false))}
            </div>
          )}

          {/* Time series */}
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
              {isMonthly ? 'Spend vs income' : 'Daily spending'}
            </p>
            <ChartContainer config={EMPTY_CONFIG} className="aspect-auto h-[180px] w-full">
              <BarChart data={data.series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  fontSize={10}
                  interval={isMonthly ? 0 : Math.max(Math.floor(data.series.length / 6), 0)}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={42}
                  fontSize={10}
                  tickFormatter={(v) => `${symbol}${fmtShort(Number(v))}`}
                />
                <ChartTooltip cursor={{ fill: 'var(--grey-x100)' }} content={<MoneyTooltip />} />
                {dailyBudget > 0 && (
                  <ReferenceLine
                    y={dailyBudget}
                    stroke="var(--muted-foreground)"
                    strokeDasharray="4 4"
                    strokeOpacity={0.6}
                  />
                )}
                <Bar dataKey="spend" name="Spend" fill="var(--error)" radius={[3, 3, 0, 0]} maxBarSize={isMonthly ? 28 : 20} />
                {isMonthly && (
                  <Bar dataKey="income" name="Income" fill="var(--success)" radius={[3, 3, 0, 0]} maxBarSize={28} />
                )}
              </BarChart>
            </ChartContainer>
            {dailyBudget > 0 && (
              <p className="flex items-center justify-end gap-1.5 text-[10px] text-muted-foreground mt-1">
                <span className="inline-block w-4 border-t border-dashed border-muted-foreground/60" />
                daily budget {money(dailyBudget)}
              </p>
            )}
          </div>

          {/* Category donut + ranked list */}
          {donutData.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                By category
              </p>
              <div className="flex items-center gap-4">
                <ChartContainer config={EMPTY_CONFIG} className="aspect-square h-[130px] shrink-0">
                  <PieChart>
                    <ChartTooltip content={<MoneyTooltip />} />
                    <Pie data={donutData} dataKey="total" nameKey="name" innerRadius={38} outerRadius={62} strokeWidth={2} stroke="var(--card)">
                      {donutData.map((d) => (
                        <Cell key={d.name} fill={d.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>
                <div className="flex-1 min-w-0 space-y-1.5">
                  {donutData.map((d) => (
                    <div key={d.name} className="flex items-center gap-2 text-sm">
                      <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: d.color }} />
                      <span className="text-foreground capitalize truncate inline-flex items-center gap-1">
                        {d.name !== 'Other' && <CategoryIcon name={d.name} size={16} />}
                        {d.name}
                      </span>
                      <span className="ml-auto text-muted-foreground tabular-nums shrink-0">{d.pct}%</span>
                      <span className="text-foreground font-medium tabular-nums shrink-0 w-14 text-right">
                        {symbol}{fmtShort(d.total)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )

  const header = (
    <div className="flex items-center gap-2">
      <BarChart3 className="w-4 h-4 text-primary" />
      <span className="text-base font-extrabold text-foreground">Analytics</span>
    </div>
  )

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="rounded-t-2xl h-[96vh] p-0 flex flex-col">
          <SheetHeader className="text-left px-5 pt-5 pb-3 shrink-0">
            <SheetTitle>{header}</SheetTitle>
          </SheetHeader>
          <div className="relative flex-1 min-h-0">
            <div
              ref={scrollRef}
              onScroll={updateScrollHint}
              className="h-full overflow-y-auto px-5 pb-5"
            >
              {body}
            </div>
            {/* Scroll affordance — fade + bouncing chevron while there's more
                below the fold; both fade out once you reach the bottom. */}
            <div
              className={`pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-background to-transparent transition-opacity duration-200 ${
                canScrollDown ? 'opacity-100' : 'opacity-0'
              }`}
              aria-hidden
            />
            <button
              type="button"
              onClick={scrollToBottom}
              aria-label="Scroll to bottom"
              className={`absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center justify-center w-10 h-10 rounded-full bg-foreground/10 transition-opacity duration-200 ${
                canScrollDown ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              <ChevronDown className="w-5 h-5 text-muted-foreground animate-bounce" />
            </button>
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{header}</DialogTitle>
        </DialogHeader>
        {body}
      </DialogContent>
    </Dialog>
  )
}

export default AnalyticsSheet
