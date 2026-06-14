import React from 'react'
import moment from 'moment'
import { CheckCircle2 } from 'lucide-react'
import Ring from '@/feature-component/dashboard/Ring'
import type { Goal } from '@/types/goal'

interface GoalCardProps {
  goal: Goal
  onClick: () => void
}

const categoryLabel: Record<string, string> = {
  longTerm: 'Long term',
  shortTerm: 'Short term',
}

const GoalCard: React.FC<GoalCardProps> = ({ goal, onClick }) => {
  const pct = goal.progress?.pct ?? 0
  const { tasksTotal, tasksStarted } = goal.progress ?? { tasksTotal: 0, tasksStarted: 0 }
  const done = goal.isCompleted

  const target = moment(goal.targetDate)
  const daysLeft = target.startOf('day').diff(moment().startOf('day'), 'days')
  const overdue = !done && daysLeft < 0

  // Ring: success when complete, error when overdue, primary otherwise
  const ringColor = done
    ? 'var(--success)'
    : overdue
    ? 'var(--error)'
    : 'var(--primary)'

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-card border border-border rounded-2xl p-4 hover:border-primary/40 transition-colors"
    >
      <div className="flex items-start gap-3">
        <Ring pct={done ? 100 : pct} size={48} sw={4} strokeColor={ringColor}>
          {done ? (
            <CheckCircle2 className="w-5 h-5 text-success" />
          ) : (
            <span className="text-[10px] font-extrabold text-foreground">{pct}%</span>
          )}
        </Ring>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-bold text-foreground truncate flex-1">{goal.title}</h3>
            {goal.category && (
              <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-grey-x100 text-muted-foreground whitespace-nowrap">
                {categoryLabel[goal.category] ?? goal.category}
              </span>
            )}
          </div>

          <p className="text-[11px] text-muted-foreground">
            {done ? (
              <span className="text-success font-semibold">Completed</span>
            ) : overdue ? (
              <span className="text-error font-semibold">Overdue · {target.format('MMM D')}</span>
            ) : (
              <>Due {target.format('MMM D, YYYY')} · {daysLeft === 0 ? 'today' : `${daysLeft}d left`}</>
            )}
          </p>

          <p className="text-[11px] text-muted-foreground mt-0.5">
            {tasksTotal > 0
              ? `${tasksStarted}/${tasksTotal} tasks started`
              : 'No tasks yet'}
          </p>
        </div>
      </div>
    </button>
  )
}

export default GoalCard
