// Shared domain types for the dashboard feature.
// Component prop interfaces stay co-located with their component files.

export interface GoalProgress {
  pct: number
  tasksTotal: number
  tasksStarted: number
}

export interface Goal {
  _id: string
  title: string
  category?: 'longTerm' | 'shortTerm'
  isCompleted: boolean
  targetDate: string
  completionDate?: string | null
  createdAt?: string
  progress: GoalProgress
}

export interface TopCategory {
  name: string
  amount: number
  emoji: string
}

export interface ExpenseSummary {
  totalSpend: number
  budget: number
  totalIncome: number
  topCategories: TopCategory[]
}

export interface RecentExpense {
  _id: string
  amount: number
  note: string
  createdAt: string
  category: { _id: string; name: string }
}

export interface Person {
  initial: string
  name: string
  net: number // positive = they owe you, negative = you owe them
}

export interface IouData {
  youOwe: number
  owedToYou: number
  net: number
  pendingCount: number
  /** Open IOUs past their expected payback date — drives the dashboard alert dot. */
  overdueCount: number
  people: Person[]
}

export interface DashboardInsight {
  id: string
  /** May contain the ¤ currency token — swap for the user's symbol before display. */
  text: string
  emoji: string
  tone: 'good' | 'warn' | 'neutral'
  domain: 'expense' | 'goals' | 'iou' | 'general'
}

export interface DashboardInsightsResponse {
  insights: DashboardInsight[]
  source: 'ai' | 'fallback'
  cached: boolean
}
