import React, { useState } from 'react'
import moment from 'moment'
import { Trash2, Pencil, Check, X } from 'lucide-react'
import { categoryEmojiMap } from '@/utils/constant'
import type { ExpenseRecord } from '@/types/expenseTracker'

interface ExpenseRecordsListProps {
  expenseRecords?: ExpenseRecord[]
  onRecordDeleted?: (expenseId: string) => void
  onRecordEdited?: (
    expenseId: string,
    payload: { amount: number; note: string }
  ) => Promise<void> | void
}

const fmt = (n: number) => Math.round(n).toLocaleString()
const getEmoji = (name: string) =>
  categoryEmojiMap[name?.toLowerCase()] ?? '🔀'

const groupRecordsByDate = (records: ExpenseRecord[]) => {
  const today = moment().startOf('day')
  const yesterday = moment().subtract(1, 'day').startOf('day')
  const map = new Map<string, ExpenseRecord[]>()

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
  onRecordDeleted,
  onRecordEdited,
}) => {
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [editId, setEditId] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState({ amount: '', note: '' })
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set())
  const dayGroups = groupRecordsByDate(expenseRecords)

  const toggleExpanded = (key: string) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const startEdit = (r: ExpenseRecord) => {
    setConfirmId(null)
    setEditId(r._id)
    setEditDraft({ amount: String(r.amount), note: r.note || '' })
  }

  const commitEdit = async (r: ExpenseRecord) => {
    const n = Number(editDraft.amount)
    if (onRecordEdited && !Number.isNaN(n) && n > 0) {
      await onRecordEdited(r._id, { amount: n, note: editDraft.note.trim() })
    }
    setEditId(null)
  }

  // Width the action cluster occupies on normal rows; group headers
  // reserve the same footprint so amounts stay right-aligned.
  const actionSlotClass =
    onRecordDeleted && onRecordEdited
      ? 'w-[60px]'
      : onRecordDeleted || onRecordEdited
        ? 'w-7'
        : ''

  const renderRowActions = (r: ExpenseRecord) => {
    if (!onRecordDeleted && !onRecordEdited) return null

    if (editId === r._id) {
      return (
        <div className="flex flex-col items-center gap-1 pr-2">
          <span className="text-[10px] font-extrabold text-foreground uppercase tracking-wider leading-none">
            Update?
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => commitEdit(r)}
              className="w-6 h-6 rounded-md hover:bg-primary/10 text-primary flex items-center justify-center"
              aria-label="Confirm update"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setEditId(null)}
              className="w-6 h-6 rounded-md hover:bg-grey-x200 text-muted-foreground flex items-center justify-center"
              aria-label="Cancel edit"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )
    }

    if (confirmId === r._id) {
      return (
        <div className="flex flex-col items-center gap-1 pr-2">
          <span className="text-[10px] font-extrabold text-foreground uppercase tracking-wider leading-none">
            Delete?
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onRecordDeleted!(r._id)
                setConfirmId(null)
              }}
              className="w-6 h-6 rounded-md hover:bg-error/10 text-error flex items-center justify-center"
              aria-label="Confirm delete"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setConfirmId(null)}
              className="w-6 h-6 rounded-md hover:bg-grey-x200 text-muted-foreground flex items-center justify-center"
              aria-label="Cancel"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )
    }

    return (
      <div className="flex items-center gap-1">
        {onRecordEdited && (
          <button
            onClick={() => startEdit(r)}
            className="w-7 h-7 rounded-md hover:bg-grey-x200 text-muted-foreground flex items-center justify-center"
            aria-label="Edit record"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
        )}
        {onRecordDeleted && (
          <button
            onClick={() => setConfirmId(r._id)}
            className="w-7 h-7 rounded-md hover:bg-grey-x200 text-muted-foreground flex items-center justify-center"
            aria-label="Delete record"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    )
  }

  const renderSingleRow = (r: ExpenseRecord) => {
    const isEditingRow = editId === r._id

    return (
      <div key={r._id} className="group flex items-center gap-3 py-3 px-1">
        <div className="w-9 h-9 rounded-lg bg-grey-x100 flex items-center justify-center text-base flex-shrink-0">
          {getEmoji(r.category?.name)}
        </div>

        {isEditingRow ? (
          <div className="flex-1 min-w-0 flex items-center gap-2">
            <p className="text-sm font-semibold text-foreground capitalize whitespace-nowrap flex-shrink-0">
              {r.category?.name}
            </p>
            <input
              type="text"
              value={editDraft.note}
              onChange={(e) =>
                setEditDraft((prev) => ({ ...prev, note: e.target.value }))
              }
              placeholder="Note"
              className="flex-1 min-w-0 h-8 px-2 text-xs rounded-md bg-card border border-border focus:outline-none focus:border-primary text-foreground"
            />
          </div>
        ) : (
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground capitalize truncate">
              {r.category?.name}
            </p>
            {r.note && (
              <p className="text-xs text-muted-foreground truncate">
                {r.note}
              </p>
            )}
          </div>
        )}

        <div className="flex items-center gap-3 flex-shrink-0">
          {isEditingRow ? (
            <input
              type="number"
              min="0"
              autoFocus
              value={editDraft.amount}
              onChange={(e) =>
                setEditDraft((prev) => ({ ...prev, amount: e.target.value }))
              }
              className="w-20 h-8 px-2 text-sm text-right rounded-md bg-card border border-border focus:outline-none focus:border-primary text-foreground"
            />
          ) : (
            <div className="text-right">
              <p className="text-sm font-bold text-error">-${fmt(r.amount)}</p>
              <p className="text-[10px] text-muted-foreground whitespace-nowrap tabular-nums">
                {moment(r.date || r.createdAt).format('h:mm A')}
              </p>
            </div>
          )}
          {renderRowActions(r)}
        </div>
      </div>
    )
  }

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
          className="w-full flex items-center gap-3 py-3 px-1 text-left"
          aria-expanded={isOpen}
          aria-label={`${first.category?.name}, ${records.length} records, $${fmt(total)} total`}
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

          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="text-right">
              <p className="text-sm font-bold text-error">-${fmt(total)}</p>
              <p className="text-[10px] text-muted-foreground whitespace-nowrap tabular-nums">
                {moment(records[records.length - 1].date || records[records.length - 1].createdAt).format('h:mm A')}
                {' – '}
                {moment(first.date || first.createdAt).format('h:mm A')}
              </p>
            </div>
            {/* Reserve the action-cluster footprint so amounts align with single rows */}
            {actionSlotClass && (
              <div className={actionSlotClass} aria-hidden />
            )}
          </div>
        </button>

        {isOpen && (
          <div className="ml-[34px] pl-3 border-l border-border mb-2">
            {records.map((r) => {
              const isEditingRow = editId === r._id
              return (
                <div
                  key={r._id}
                  className="group flex items-center gap-3 py-2"
                >
                  <div className="flex-1 min-w-0 flex items-baseline gap-2">
                    <p className="text-[10px] text-muted-foreground whitespace-nowrap tabular-nums">
                      {moment(r.date || r.createdAt).format('h:mm A')}
                    </p>
                    {isEditingRow ? (
                      <input
                        type="text"
                        value={editDraft.note}
                        onChange={(e) =>
                          setEditDraft((prev) => ({
                            ...prev,
                            note: e.target.value,
                          }))
                        }
                        placeholder="Note"
                        className="flex-1 min-w-0 h-7 px-2 text-xs rounded-md bg-card border border-border focus:outline-none focus:border-primary text-foreground"
                      />
                    ) : (
                      r.note && (
                        <p className="text-xs text-foreground truncate">
                          {r.note}
                        </p>
                      )
                    )}
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {isEditingRow ? (
                      <input
                        type="number"
                        min="0"
                        autoFocus
                        value={editDraft.amount}
                        onChange={(e) =>
                          setEditDraft((prev) => ({
                            ...prev,
                            amount: e.target.value,
                          }))
                        }
                        className="w-20 h-8 px-2 text-sm text-right rounded-md bg-card border border-border focus:outline-none focus:border-primary text-foreground"
                      />
                    ) : (
                      <p className="text-xs font-bold text-error">
                        -${fmt(r.amount)}
                      </p>
                    )}
                    {renderRowActions(r)}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-4 lg:p-5 lg:flex lg:flex-col lg:min-h-0 lg:flex-1">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
          Expense Records
        </p>
        <span className="text-[10px] text-muted-foreground">
          {expenseRecords.length}{' '}
          {expenseRecords.length === 1 ? 'record' : 'records'}
        </span>
      </div>

      {expenseRecords.length === 0 ? (
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
                    -${fmt(dayTotal)}
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
