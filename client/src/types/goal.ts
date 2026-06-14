// Domain types for the Goal Tracker feature.
// Framework-agnostic — these transfer directly to the future RN app.

export type GoalCategory = 'longTerm' | 'shortTerm'
export type TaskType = 'Daily' | 'Weekly' | 'Monthly'

export interface GoalProgress {
  pct: number
  tasksTotal: number
  tasksStarted: number
}

export interface Task {
  _id: string
  title: string
  goalId: string
  type: TaskType
  startDate: string
  repeatUntil: string
  completedDates: string[]
}

export interface Goal {
  _id: string
  title: string
  category?: GoalCategory
  isCompleted: boolean
  targetDate: string
  completionDate?: string | null
  createdAt?: string
  progress: GoalProgress
  tasks: Task[]
}

export interface GoalPayload {
  title: string
  category?: GoalCategory
  targetDate: string
}

export interface TaskPayload {
  title: string
  type: TaskType
  startDate: string
  repeatUntil: string
}
