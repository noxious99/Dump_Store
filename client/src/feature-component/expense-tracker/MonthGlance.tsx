import React from 'react'
import { categoryEmojiMap } from '@/utils/constant'
import type { TopCategoryItem } from '@/types/expenseTracker'

interface MonthGlanceProps {
  income: number
  spent: number
  topCategories: TopCategoryItem[]
}

const fmt = (n: number) => n.toLocaleString()
const fmtShort = (n: number) =>
  n >= 1000 ? `${(n / 1000).toFixed(1)}k` : `${n}`
const getEmoji = (name: string) => categoryEmojiMap[name?.toLowerCase()] ?? '🔀'

const MonthGlance: React.FC<MonthGlanceProps> = ({ income, spent, topCategories }) => {
  const balance = income - spent
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
            style={{ color: income > 0 ? 'var(--success)' : 'var(--foreground)' }}
          >
            ${fmt(income)}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground mb-1">Spent</p>
          <p className="text-2xl font-extrabold text-foreground tracking-tight">
            ${fmt(spent)}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground mb-1">Balance</p>
          <p className="text-2xl font-extrabold tracking-tight" style={{ color: balanceColor }}>
            {balance < 0 ? '-' : ''}${fmt(Math.abs(balance))}
          </p>
        </div>
      </div>

      {topCategories.length > 0 && (
        <div className="pt-3 border-t border-border">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
            Top categories
          </p>
          <div className="flex flex-wrap gap-2">
            {topCategories.slice(0, 3).map((c) => (
              <div
                key={c.categoryId}
                className="flex items-center gap-1.5 bg-grey-x100 border border-border rounded-lg px-2.5 py-1"
              >
                <span className="text-sm">{getEmoji(c.name)}</span>
                <span className="text-xs font-semibold text-foreground capitalize">{c.name}</span>
                <span className="text-xs text-muted-foreground">${fmtShort(c.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default MonthGlance
