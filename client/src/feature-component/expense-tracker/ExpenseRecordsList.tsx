import React, { useState } from 'react'
import moment from 'moment'
import { Trash2, Check, X } from 'lucide-react'
import { categoryEmojiMap } from '@/utils/constant'
import type { ExpenseRecord } from '@/types/expenseTracker'

interface ExpenseRecordsListProps {
  expenseRecords?: ExpenseRecord[]
  onRecordDeleted?: (expenseId: string) => void
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

const ExpenseRecordsList: React.FC<ExpenseRecordsListProps> = ({
  expenseRecords = [],
  onRecordDeleted,
}) => {
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const groups = groupRecordsByDate(expenseRecords)

  return (
    <div className="bg-card border border-border rounded-2xl p-4 lg:p-5">
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
                        borderBottom:
                          i < records.length - 1
                            ? '1px solid var(--border)'
                            : 'none',
                      }}
                    >
                      <div className="w-9 h-9 rounded-lg bg-grey-x100 flex items-center justify-center text-base flex-shrink-0">
                        {getEmoji(r.category?.name)}
                      </div>

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

                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="text-right">
                          <p className="text-sm font-bold text-error">
                            -${fmt(r.amount)}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {moment(r.date || r.createdAt).format('h:mm A')}
                          </p>
                        </div>

                        {onRecordDeleted &&
                          (isConfirming ? (
                            <div className="flex flex-col items-center gap-1">
                              <span className="text-[10px] font-extrabold text-foreground uppercase tracking-wider leading-none">
                                Delete?
                              </span>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => {
                                    onRecordDeleted(r._id)
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
                          ) : (
                            <button
                              onClick={() => setConfirmId(r._id)}
                              className="w-7 h-7 rounded-md hover:bg-grey-x200 text-muted-foreground md:opacity-0 md:group-hover:opacity-100 transition-opacity flex items-center justify-center"
                              aria-label="Delete record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          ))}
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

export default ExpenseRecordsList
