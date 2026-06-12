import React, { useState } from 'react'
import moment from 'moment'
import { categoryEmojiMap, incomeSourceOptions, incomeSourceEmojiMap } from '@/utils/constant'
import type { ExpenseRecord, IncomeRecord } from '@/types/expenseTracker'
import { useCurrency } from '@/hooks/useCurrency'

interface ExpenseRecordsListProps {
  expenseRecords?: ExpenseRecord[]
  incomeRecords?: IncomeRecord[]
  onSelectRecord?: (record: ExpenseRecord) => void
  onSelectIncome?: (record: IncomeRecord) => void
}

const fmt = (n: number) => Math.round(n).toLocaleString()
const getEmoji = (name: string) =>
  categoryEmojiMap[name?.toLowerCase()] ?? '🔀'
const sourceLabel = (source: string) =>
  incomeSourceOptions.find((o) => o.value === source)?.label || source

const groupRecordsByDate = <T extends { date?: string; createdAt: string }>(
  records: T[]
) => {
  const today = moment().startOf('day')
  const yesterday = moment().subtract(1, 'day').startOf('day')
  const map = new Map<string, T[]>()

  for (const r of records) {
    const d = moment(r.date || r.createdAt).startOf('day')
    const label = d.isSame(today)
      ? 'Today'
      : d.isSame(yesterday)
        ? 'Yesterday'
        : d.format('MMM D').toUpperCase()
    if (!map.has(label)) map.set(label, [])
    map.get(label)!.push(r)
  }
  return Array.from(map.entries()).map(([label, records]) => ({
    label,
    records,
  }))
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
  onSelectRecord,
  onSelectIncome,
}) => {
  const { symbol } = useCurrency()
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set())
  const [tab, setTab] = useState<'expense' | 'income'>('expense')
  const dayGroups = groupRecordsByDate(expenseRecords)
  const incomeDayGroups = groupRecordsByDate(incomeRecords)

  const toggleExpanded = (key: string) => {
    setExpandedKeys((prev) => {
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
      <div className="w-9 h-9 rounded-lg bg-grey-x100 flex items-center justify-center text-base flex-shrink-0">
        {getEmoji(r.category?.name)}
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
          <div className="relative w-9 h-9 rounded-lg bg-grey-x100 flex items-center justify-center text-base flex-shrink-0">
            {getEmoji(first.category?.name)}
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
      <div className="w-9 h-9 rounded-lg bg-grey-x100 flex items-center justify-center text-base flex-shrink-0">
        {incomeSourceEmojiMap[r.source] || '💼'}
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

  const activeCount = tab === 'expense' ? expenseRecords.length : incomeRecords.length

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
        <span className="text-[10px] text-muted-foreground">
          {activeCount} {activeCount === 1 ? 'record' : 'records'}
        </span>
      </div>

      {tab === 'income' ? (
        incomeRecords.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">
              No income this month
            </p>
          </div>
        ) : (
          <div className="space-y-4 lg:flex-1 lg:min-h-0 lg:overflow-y-auto [scrollbar-width:thin] lg:pr-1">
            {incomeDayGroups.map(({ label, records }) => {
              const dayTotal = records.reduce((s, r) => s + (r.amount || 0), 0)
              return (
                <div key={label}>
                  <div className="flex items-center justify-between bg-grey-x100 rounded-lg px-2.5 py-1.5 mb-1">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      {label}
                    </p>
                    <span className="text-xs font-bold text-success">
                      +{symbol}{fmt(dayTotal)}
                    </span>
                  </div>
                  <div className="divide-y divide-border">
                    {records.map(renderIncomeRow)}
                  </div>
                </div>
              )
            })}
          </div>
        )
      ) : expenseRecords.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">
            No expenses this month
          </p>
        </div>
      ) : (
        <div className="space-y-4 lg:flex-1 lg:min-h-0 lg:overflow-y-auto [scrollbar-width:thin] lg:pr-1">
          {dayGroups.map(({ label, records }) => {
            const categoryGroups = groupByCategory(records)
            const dayTotal = records.reduce((s, r) => s + (r.amount || 0), 0)

            return (
              <div key={label}>
                <div className="flex items-center justify-between bg-grey-x100 rounded-lg px-2.5 py-1.5 mb-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    {label}
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
                          `${label}-${group[0].category?._id ?? 'unknown'}`
                        )
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default ExpenseRecordsList
