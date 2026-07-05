import React, { useEffect, useState } from 'react'
import moment from 'moment'
import { Filter, ChevronRight, X } from 'lucide-react'
import type { DateRange } from 'react-day-picker'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Calendar } from '@/components/ui/calendar'
import { incomeSourceOptions } from '@/utils/constant'
import { CategoryIcon } from '@/components/CategoryIcon'
import type { ExpenseRecord, IncomeRecord } from '@/types/expenseTracker'
import { useCurrency } from '@/hooks/useCurrency'

interface ExpenseRecordsListProps {
  expenseRecords?: ExpenseRecord[]
  incomeRecords?: IncomeRecord[]
  monthDate?: Date
  onSelectRecord?: (record: ExpenseRecord) => void
  onSelectIncome?: (record: IncomeRecord) => void
}

type Moment = ReturnType<typeof moment>

interface DayGroup<T> {
  key: string
  label: string
  date: Moment
  records: T[]
}

interface WeekGroup<T> {
  key: string
  label: string
  isPast: boolean
  total: number
  count: number
  days: DayGroup<T>[]
}

const fmt = (n: number) => Math.round(n).toLocaleString()
const sourceLabel = (source: string) =>
  incomeSourceOptions.find((o) => o.value === source)?.label || source

const groupRecordsByDate = <T extends { date?: string; createdAt: string }>(
  records: T[]
): DayGroup<T>[] => {
  const today = moment().startOf('day')
  const yesterday = moment().subtract(1, 'day').startOf('day')
  const map = new Map<string, DayGroup<T>>()

  for (const r of records) {
    const d = moment(r.date || r.createdAt).startOf('day')
    const key = d.format('YYYY-MM-DD')
    if (!map.has(key)) {
      const label = d.isSame(today)
        ? 'Today'
        : d.isSame(yesterday)
          ? 'Yesterday'
          : d.format('MMM D').toUpperCase()
      map.set(key, { key, label, date: d, records: [] })
    }
    map.get(key)!.records.push(r)
  }
  return Array.from(map.values()).sort(
    (a, b) => b.date.valueOf() - a.date.valueOf()
  )
}

const groupDaysByWeek = <T extends { amount: number }>(
  days: DayGroup<T>[]
): WeekGroup<T>[] => {
  const currentWeekStart = moment().startOf('week')
  const map = new Map<string, DayGroup<T>[]>()

  for (const day of days) {
    const key = day.date.clone().startOf('week').format('YYYY-MM-DD')
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(day)
  }

  return Array.from(map.entries())
    .map(([key, weekDays]) => {
      const weekStart = moment(key, 'YYYY-MM-DD')
      // Records are month-scoped, so clip the label to the viewed month —
      // the first week of July may technically start in late June
      const monthAnchor = weekDays[0].date
      const from = moment.max(weekStart, monthAnchor.clone().startOf('month'))
      const to = moment.min(
        weekStart.clone().endOf('week'),
        monthAnchor.clone().endOf('month')
      )
      const records = weekDays.flatMap((d) => d.records)
      return {
        key,
        label: from.isSame(to, 'day')
          ? from.format('MMM D')
          : `${from.format('MMM D')} – ${to.format('D')}`,
        isPast: weekStart.isBefore(currentWeekStart),
        total: records.reduce((s, r) => s + (r.amount || 0), 0),
        count: records.length,
        days: weekDays,
      }
    })
    .sort((a, b) => b.key.localeCompare(a.key))
}

const filterByRange = <T extends { date?: string; createdAt: string }>(
  records: T[],
  range: DateRange | undefined
): T[] => {
  if (!range?.from) return records
  const from = moment(range.from).startOf('day')
  const to = moment(range.to ?? range.from).endOf('day')
  return records.filter((r) => {
    const d = moment(r.date || r.createdAt)
    return d.isSameOrAfter(from) && d.isSameOrBefore(to)
  })
}

// Within a day, records of the same category collapse into one group.
// Groups keep the order of their category's first appearance.
const groupByCategory = (records: ExpenseRecord[]) => {
  const map = new Map<string, ExpenseRecord[]>()
  for (const r of records) {
    const key = r.category?._id ?? 'unknown'
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(r)
  }
  return Array.from(map.values())
}

const ExpenseRecordsList: React.FC<ExpenseRecordsListProps> = ({
  expenseRecords = [],
  incomeRecords = [],
  monthDate,
  onSelectRecord,
  onSelectIncome,
}) => {
  const { symbol } = useCurrency()
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set())
  // Weeks the user has flipped away from their default state (XOR)
  const [toggledWeeks, setToggledWeeks] = useState<Set<string>>(new Set())
  const [tab, setTab] = useState<'expense' | 'income'>('expense')
  const [dateFilter, setDateFilter] = useState<DateRange | undefined>(undefined)
  const [filterSheetOpen, setFilterSheetOpen] = useState(false)
  // The sheet edits a draft; the list only changes when it's applied
  const [draftRange, setDraftRange] = useState<DateRange | undefined>(undefined)

  const viewMonth = monthDate ?? new Date()
  const monthStart = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1)
  const monthEnd = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0)
  const monthKey = `${viewMonth.getFullYear()}-${viewMonth.getMonth()}`

  // The filter and fold state belong to the viewed month
  useEffect(() => {
    setDateFilter(undefined)
    setFilterSheetOpen(false)
    setToggledWeeks(new Set())
    setExpandedKeys(new Set())
  }, [monthKey])

  // Opening the sheet starts the draft from whatever is applied
  useEffect(() => {
    if (filterSheetOpen) setDraftRange(dateFilter)
  }, [filterSheetOpen, dateFilter])

  const isFiltering = Boolean(dateFilter?.from)

  const visibleExpenses = filterByRange(expenseRecords, dateFilter)
  const visibleIncome = filterByRange(incomeRecords, dateFilter)
  const expenseDayGroups = groupRecordsByDate(visibleExpenses)
  const incomeDayGroups = groupRecordsByDate(visibleIncome)
  const expenseWeeks = groupDaysByWeek(expenseDayGroups)

  // Weeks sort newest-first, so current/future days always sit above the
  // folded block. An active date filter shows its matches flat instead.
  const liveDays = isFiltering
    ? expenseDayGroups
    : expenseWeeks.filter((w) => !w.isPast).flatMap((w) => w.days)
  const pastWeeks = isFiltering ? [] : expenseWeeks.filter((w) => w.isPast)

  // If the current week has no records yet, the latest previous week opens
  // by default so the list is never just folded rows. Past months keep
  // every week folded — they open as a week summary.
  const now = new Date()
  const viewingCurrentMonth =
    viewMonth.getFullYear() === now.getFullYear() &&
    viewMonth.getMonth() === now.getMonth()
  const defaultOpenWeekKey =
    viewingCurrentMonth && liveDays.length === 0 ? pastWeeks[0]?.key : undefined

  const isWeekOpen = (key: string) => {
    const openByDefault = key === defaultOpenWeekKey
    return toggledWeeks.has(key) ? !openByDefault : openByDefault
  }

  // One-tap shortcuts; only meaningful when viewing the current month
  const presets = (() => {
    if (!viewingCurrentMonth) return [] as { label: string; range: DateRange }[]
    const today = moment().startOf('day')
    const list: { label: string; range: DateRange }[] = [
      { label: 'Today', range: { from: today.toDate(), to: today.toDate() } },
    ]
    const yesterday = today.clone().subtract(1, 'day')
    if (!yesterday.isBefore(moment(monthStart))) {
      list.push({
        label: 'Yesterday',
        range: { from: yesterday.toDate(), to: yesterday.toDate() },
      })
    }
    const last7 = moment.max(today.clone().subtract(6, 'day'), moment(monthStart))
    if (!last7.isSame(today, 'day')) {
      list.push({
        label: 'Last 7 days',
        range: { from: last7.toDate(), to: today.toDate() },
      })
    }
    return list
  })()

  const sameDay = (a?: Date, b?: Date) =>
    Boolean(a && b && moment(a).isSame(b, 'day'))
  const isPresetActive = (r: DateRange) =>
    sameDay(draftRange?.from, r.from) &&
    sameDay(draftRange?.to ?? draftRange?.from, r.to)

  // Which endpoint the next calendar tap fills — the From/To slots mirror it
  const nextEndpoint: 'from' | 'to' =
    draftRange?.from && !draftRange?.to ? 'to' : 'from'

  const draftCount =
    tab === 'expense'
      ? filterByRange(expenseRecords, draftRange).length
      : filterByRange(incomeRecords, draftRange).length

  const applyDraft = () => {
    setDateFilter(draftRange?.from ? draftRange : undefined)
    setFilterSheetOpen(false)
  }

  const filterLabel = (() => {
    if (!dateFilter?.from) return ''
    const from = moment(dateFilter.from)
    const to = dateFilter.to ? moment(dateFilter.to) : null
    return !to || to.isSame(from, 'day')
      ? from.format('MMM D')
      : `${from.format('MMM D')} – ${to.format('D')}`
  })()

  const toggleExpanded = (key: string) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const toggleWeek = (key: string) => {
    setToggledWeeks((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const renderSingleRow = (r: ExpenseRecord) => (
    <button
      key={r._id}
      onClick={() => onSelectRecord?.(r)}
      className="w-full flex items-center gap-3 py-3 px-1 text-left rounded-lg hover:bg-grey-x100/60 transition-colors"
    >
      <div className="w-9 h-9 rounded-lg bg-grey-x100 flex items-center justify-center flex-shrink-0">
        <CategoryIcon name={r.category?.name} size={20} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground capitalize truncate">
          {r.category?.name}
          {r.recurringRuleId && (
            <span className="ml-1.5 text-[10px] text-muted-foreground font-normal" title="Recurring">↻</span>
          )}
        </p>
        {r.note && (
          <p className="text-xs text-muted-foreground truncate">{r.note}</p>
        )}
      </div>

      <div className="text-right flex-shrink-0">
        <p className="text-sm font-bold text-error">-{symbol}{fmt(r.amount)}</p>
        <p className="text-[10px] text-muted-foreground whitespace-nowrap tabular-nums">
          {moment(r.date || r.createdAt).format('h:mm A')}
        </p>
      </div>
    </button>
  )

  const renderCategoryGroup = (
    records: ExpenseRecord[],
    groupKey: string
  ) => {
    const first = records[0]
    const total = records.reduce((s, r) => s + (r.amount || 0), 0)
    const isOpen = expandedKeys.has(groupKey)

    return (
      <div key={groupKey}>
        <button
          onClick={() => toggleExpanded(groupKey)}
          className="w-full flex items-center gap-3 py-3 px-1 text-left rounded-lg hover:bg-grey-x100/60 transition-colors"
          aria-expanded={isOpen}
          aria-label={`${first.category?.name}, ${records.length} records, ${symbol}${fmt(total)} total`}
        >
          <div className="relative w-9 h-9 rounded-lg bg-grey-x100 flex items-center justify-center flex-shrink-0">
            <CategoryIcon name={first.category?.name} size={20} />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center">
              {records.length}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground capitalize truncate">
              {first.category?.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {records.length} records{isOpen ? '' : ' · tap to view'}
            </p>
          </div>

          <div className="text-right flex-shrink-0">
            <p className="text-sm font-bold text-error">-{symbol}{fmt(total)}</p>
            <p className="text-[10px] text-muted-foreground whitespace-nowrap tabular-nums">
              {moment(records[records.length - 1].date || records[records.length - 1].createdAt).format('h:mm A')}
              {' – '}
              {moment(first.date || first.createdAt).format('h:mm A')}
            </p>
          </div>
        </button>

        {isOpen && (
          <div className="ml-[34px] pl-1 border-l border-border mb-2">
            {records.map((r) => (
              <button
                key={r._id}
                onClick={() => onSelectRecord?.(r)}
                className="w-full flex items-center gap-3 py-2 px-2 text-left rounded-lg hover:bg-grey-x100/60 transition-colors"
              >
                <div className="flex-1 min-w-0 flex items-baseline gap-2">
                  <p className="text-[10px] text-muted-foreground whitespace-nowrap tabular-nums">
                    {moment(r.date || r.createdAt).format('h:mm A')}
                  </p>
                  {r.note && (
                    <p className="text-xs text-foreground truncate">
                      {r.note}
                    </p>
                  )}
                  {r.recurringRuleId && (
                    <span className="text-[10px] text-muted-foreground" title="Recurring">↻</span>
                  )}
                </div>
                <p className="text-xs font-bold text-error flex-shrink-0">
                  -{symbol}{fmt(r.amount)}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  const renderIncomeRow = (r: IncomeRecord) => (
    <button
      key={r._id}
      onClick={() => onSelectIncome?.(r)}
      className="w-full flex items-center gap-3 py-3 px-1 text-left rounded-lg hover:bg-grey-x100/60 transition-colors"
    >
      <div className="w-9 h-9 rounded-lg bg-grey-x100 flex items-center justify-center flex-shrink-0">
        <CategoryIcon name={r.source} size={20} fallback="salary" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground capitalize truncate">
          {sourceLabel(r.source)}
          {r.recurringRuleId && (
            <span className="ml-1.5 text-[10px] text-muted-foreground font-normal" title="Recurring">↻</span>
          )}
        </p>
        {r.note && (
          <p className="text-xs text-muted-foreground truncate">{r.note}</p>
        )}
      </div>

      <div className="text-right flex-shrink-0">
        <p className="text-sm font-bold text-success">+{symbol}{fmt(r.amount)}</p>
        <p className="text-[10px] text-muted-foreground whitespace-nowrap tabular-nums">
          {moment(r.createdAt).format('h:mm A')}
        </p>
      </div>
    </button>
  )

  const renderExpenseDay = (day: DayGroup<ExpenseRecord>) => {
    const categoryGroups = groupByCategory(day.records)
    const dayTotal = day.records.reduce((s, r) => s + (r.amount || 0), 0)

    return (
      <div key={day.key}>
        <div className="flex items-center justify-between bg-grey-x100 rounded-lg px-2.5 py-1.5 mb-1">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            {day.label}
          </p>
          <span className="text-xs font-bold text-foreground">
            -{symbol}{fmt(dayTotal)}
          </span>
        </div>

        <div className="divide-y divide-border">
          {categoryGroups.map((group) =>
            group.length === 1
              ? renderSingleRow(group[0])
              : renderCategoryGroup(
                  group,
                  `${day.key}-${group[0].category?._id ?? 'unknown'}`
                )
          )}
        </div>
      </div>
    )
  }

  const renderIncomeDay = (day: DayGroup<IncomeRecord>) => {
    const dayTotal = day.records.reduce((s, r) => s + (r.amount || 0), 0)
    return (
      <div key={day.key}>
        <div className="flex items-center justify-between bg-grey-x100 rounded-lg px-2.5 py-1.5 mb-1">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            {day.label}
          </p>
          <span className="text-xs font-bold text-success">
            +{symbol}{fmt(dayTotal)}
          </span>
        </div>
        <div className="divide-y divide-border">
          {day.records.map(renderIncomeRow)}
        </div>
      </div>
    )
  }

  const renderPastWeek = (week: WeekGroup<ExpenseRecord>) => {
    const isOpen = isWeekOpen(week.key)
    return (
      <div key={week.key}>
        <button
          onClick={() => toggleWeek(week.key)}
          aria-expanded={isOpen}
          aria-label={`Week of ${week.label}, ${week.count} records, ${symbol}${fmt(week.total)} total`}
          className="w-full flex items-center gap-1.5 bg-grey-x100 hover:bg-grey-x200 rounded-lg px-2.5 py-2 text-left transition-colors"
        >
          <ChevronRight
            className={`w-3.5 h-3.5 text-muted-foreground flex-shrink-0 transition-transform ${isOpen ? 'rotate-90' : ''}`}
          />
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
            {week.label}
          </span>
          <span className="text-[10px] text-muted-foreground truncate">
            · {week.count} {week.count === 1 ? 'record' : 'records'}
          </span>
          <span className="ml-auto pl-2 text-xs font-bold text-foreground flex-shrink-0">
            -{symbol}{fmt(week.total)}
          </span>
        </button>

        {isOpen && (
          <div className="mt-2 mb-2 space-y-4">
            {week.days.map(renderExpenseDay)}
          </div>
        )}
      </div>
    )
  }

  const activeCount = tab === 'expense' ? visibleExpenses.length : visibleIncome.length

  return (
    <div className="bg-card border border-border rounded-2xl p-4 lg:p-5 lg:flex lg:flex-col lg:min-h-0 lg:flex-1">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setTab('expense')}
            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md transition-colors ${
              tab === 'expense'
                ? 'bg-grey-x100 text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Expenses
          </button>
          <button
            onClick={() => setTab('income')}
            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md transition-colors ${
              tab === 'income'
                ? 'bg-grey-x100 text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Income
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          {isFiltering ? (
            // One pill, two actions: the body reopens the sheet to edit,
            // the ✕ clears. Replaces the record count while active.
            <div className="flex items-center rounded-md bg-primary/10 text-primary">
              <button
                onClick={() => setFilterSheetOpen(true)}
                aria-label="Edit date filter"
                className="flex items-center gap-1 pl-2 pr-1 py-1 text-[10px] font-bold whitespace-nowrap"
              >
                <Filter className="w-3 h-3" />
                {filterLabel}
              </button>
              <button
                onClick={() => setDateFilter(undefined)}
                aria-label="Clear date filter"
                className="pl-0.5 pr-1.5 py-1"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <>
              <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                {activeCount} {activeCount === 1 ? 'record' : 'records'}
              </span>
              <button
                onClick={() => setFilterSheetOpen(true)}
                className="flex items-center gap-1 px-2 py-1 rounded-md border border-border text-[10px] font-bold text-muted-foreground hover:text-foreground hover:bg-grey-x100 transition-colors"
              >
                <Filter className="w-3 h-3" />
                Filter
              </button>
            </>
          )}
        </div>
      </div>

      <Sheet open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
        <SheetContent
          side="bottom"
          className="rounded-t-2xl max-h-[92vh] overflow-y-auto p-0 sm:max-w-md sm:mx-auto"
        >
          <SheetHeader className="px-5 pt-5 pb-1 text-left">
            <SheetTitle className="text-base font-extrabold text-foreground">
              Filter by date
            </SheetTitle>
            <p className="text-xs text-muted-foreground">
              Pick a day on the calendar, or tap a second day to filter a range.
            </p>
          </SheetHeader>

          <div className="px-5 pb-6 pt-3 space-y-3">
            {presets.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {presets.map((p) => {
                  const active = isPresetActive(p.range)
                  return (
                    <button
                      key={p.label}
                      onClick={() => setDraftRange(p.range)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                        active
                          ? 'bg-primary/10 border-primary/40 text-primary'
                          : 'border-border text-foreground hover:bg-grey-x100'
                      }`}
                    >
                      {p.label}
                    </button>
                  )
                })}
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <div
                className={`rounded-lg border px-3 py-2 transition-colors ${
                  nextEndpoint === 'from' ? 'border-primary' : 'border-border'
                }`}
              >
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  From
                </p>
                <p
                  className={`text-sm font-semibold ${
                    draftRange?.from ? 'text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  {draftRange?.from
                    ? moment(draftRange.from).format('MMM D')
                    : 'Pick a day'}
                </p>
              </div>
              <div
                className={`rounded-lg border px-3 py-2 transition-colors ${
                  nextEndpoint === 'to' ? 'border-primary' : 'border-border'
                }`}
              >
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  To
                </p>
                <p
                  className={`text-sm font-semibold ${
                    draftRange?.to ? 'text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  {draftRange?.to
                    ? moment(draftRange.to).format('MMM D')
                    : draftRange?.from
                      ? 'Same day'
                      : 'Optional'}
                </p>
              </div>
            </div>

            <div className="flex justify-center">
              <Calendar
                mode="range"
                selected={draftRange}
                onSelect={setDraftRange}
                defaultMonth={monthStart}
                startMonth={monthStart}
                endMonth={monthStart}
                disabled={[{ before: monthStart }, { after: monthEnd }]}
                showOutsideDays={false}
                classNames={{ root: 'w-[300px]' }}
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setDraftRange(undefined)}
                className="h-10 px-4 rounded-lg border border-border text-sm font-semibold text-foreground hover:bg-grey-x100 transition-colors"
              >
                Clear
              </button>
              <button
                onClick={applyDraft}
                className="flex-1 h-10 rounded-lg bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-colors"
              >
                {draftRange?.from
                  ? `Show ${draftCount} ${draftCount === 1 ? 'record' : 'records'}`
                  : 'Show all records'}
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {tab === 'income' ? (
        visibleIncome.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">
              {isFiltering ? 'No income on these dates' : 'No income this month'}
            </p>
          </div>
        ) : (
          <div className="space-y-4 lg:flex-1 lg:min-h-0 lg:overflow-y-auto [scrollbar-width:thin] lg:pr-1">
            {incomeDayGroups.map(renderIncomeDay)}
          </div>
        )
      ) : visibleExpenses.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">
            {isFiltering ? 'No expenses on these dates' : 'No expenses this month'}
          </p>
        </div>
      ) : (
        <div className="space-y-4 lg:flex-1 lg:min-h-0 lg:overflow-y-auto [scrollbar-width:thin] lg:pr-1">
          {liveDays.map(renderExpenseDay)}
          {pastWeeks.length > 0 && (
            <div className="space-y-2">{pastWeeks.map(renderPastWeek)}</div>
          )}
        </div>
      )}
    </div>
  )
}

export default ExpenseRecordsList
