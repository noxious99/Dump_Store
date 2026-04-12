// Shared domain types for the dashboard feature.
// Component prop interfaces stay co-located with their component files.

export interface MileStone {
  isCompleted: boolean
  completedAt?: string
}

export interface Goal {
  _id: string
  title: string
  isCompleted: boolean
  targetDate: string
  mileStone: MileStone[]
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
  people: Person[]
}
