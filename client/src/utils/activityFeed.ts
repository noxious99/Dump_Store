// Builds the dashboard's unified "Recent Activity" feed by merging events from
// every feature (expenses, income, IOUs, goals) into one chronological list.
//
// Framework-agnostic on purpose (no React/DOM) — pure data in, typed data out —
// so it transfers directly to the future RN app. The UI layer only renders the
// returned ActivityItem[].

import type { ExpenseRecord, IncomeRecord } from '@/types/expenseTracker'
import type { Iou } from '@/types/iou'
import type { Goal } from '@/types/dashboard'
import { categoryEmojiMap } from '@/utils/constant'

export type ActivityKind =
  | 'expense'
  | 'income'
  | 'iou-lent'
  | 'iou-borrowed'
  | 'iou-settled'
  | 'goal-completed'

export interface ActivityItem {
  id: string
  kind: ActivityKind
  title: string
  subtitle?: string
  /** Money magnitude; sign/color comes from `tone`. Omitted for non-money events. */
  amount?: number
  /** Drives amount color: positive = income-green, negative = spend-red, neutral = feature tint. */
  tone: 'positive' | 'negative' | 'neutral'
  emoji: string
  /** ISO timestamp — used for sorting and relative-time display. */
  date: string
}

const categoryEmoji = (name?: string) => categoryEmojiMap[name?.toLowerCase() ?? ''] ?? '🔀'

interface BuildArgs {
  expenses?: ExpenseRecord[]
  incomes?: IncomeRecord[]
  ious?: Iou[]
  goals?: Goal[]
  /** Max items in the returned feed. */
  limit?: number
}

/**
 * Merge every feature's events into one feed, newest first.
 * Each IOU contributes a single row — its settlement if settled, otherwise its
 * creation — so the list never double-counts one debt. Cancelled IOUs and
 * not-yet-completed goals are skipped (they aren't "activity").
 */
export const buildActivityFeed = ({
  expenses = [],
  incomes = [],
  ious = [],
  goals = [],
  limit = 8,
}: BuildArgs): ActivityItem[] => {
  const items: ActivityItem[] = []

  for (const e of expenses) {
    items.push({
      id: `exp-${e._id}`,
      kind: 'expense',
      title: e.category?.name || 'Uncategorized',
      subtitle: e.note || undefined,
      amount: e.amount,
      tone: 'negative',
      emoji: categoryEmoji(e.category?.name),
      date: e.createdAt,
    })
  }

  for (const inc of incomes) {
    items.push({
      id: `inc-${inc._id}`,
      kind: 'income',
      title: inc.source || 'Income',
      subtitle: inc.note || undefined,
      amount: inc.amount,
      tone: 'positive',
      emoji: '💰',
      date: inc.createdAt,
    })
  }

  for (const iou of ious) {
    if (iou.status === 'cancelled') continue
    const settled = iou.status === 'settled'
    items.push({
      id: `iou-${iou._id}`,
      kind: settled ? 'iou-settled' : iou.type === 'lent' ? 'iou-lent' : 'iou-borrowed',
      title: iou.counterpartyName,
      subtitle: settled
        ? iou.type === 'lent'
          ? 'Loan repaid to you'
          : 'You repaid'
        : iou.type === 'lent'
          ? 'You lent'
          : 'You borrowed',
      amount: iou.amount,
      tone: 'neutral',
      emoji: '🤝',
      date: (settled ? iou.updatedAt : iou.createdAt) || iou.createdAt,
    })
  }

  for (const g of goals) {
    if (g.isCompleted && g.completionDate) {
      items.push({
        id: `goal-${g._id}`,
        kind: 'goal-completed',
        title: g.title,
        subtitle: 'Goal completed',
        tone: 'neutral',
        emoji: '🎯',
        date: g.completionDate,
      })
    }
  }

  return items
    .filter((i) => i.date)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit)
}
