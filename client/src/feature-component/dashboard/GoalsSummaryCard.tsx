import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import Ring from './Ring'
import type { Goal } from '@/types/dashboard'
import { CategoryIcon } from '@/components/CategoryIcon'

interface GoalsSummaryCardProps {
  goals: Goal[]
  isLoading: boolean
}

const GoalsSummaryCard: React.FC<GoalsSummaryCardProps> = ({ goals, isLoading }) => {
  const activeGoals = goals.filter((g) => !g.isCompleted)
  const displayGoals = activeGoals.slice(0, 2)

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-2xl p-4 h-full">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <div className="skeleton w-9 h-9 rounded-xl" />
            <div className="skeleton h-4 w-14" />
          </div>
          <div className="skeleton h-4 w-14 rounded-full" />
        </div>
        <div className="grid grid-cols-2 gap-2.5 mb-4">
          {[1, 2].map((i) => (
            <div key={i} className="skeleton h-24 rounded-xl" />
          ))}
        </div>
        <div className="skeleton h-px w-full mb-3" />
        <div className="skeleton h-9 w-full rounded-lg" />
      </div>
    )
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-4 h-full flex flex-col">
      {/* Header — no click, no chevron */}
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
            <CategoryIcon name="goal" size={20} />
          </div>
          <span className="text-sm font-bold text-foreground">Goals</span>
        </div>
        <span className="text-[10px] font-medium text-muted-foreground">
          {activeGoals.length} active
        </span>
      </div>

      {/* Goal mini-cards */}
      {displayGoals.length === 0 ? (
        <div className="text-center py-6 bg-grey-x100 rounded-xl mb-4">
          <p className="text-sm text-muted-foreground font-medium">No active goals</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Create one below</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2.5 mb-4">
          {displayGoals.map((goal) => {
            const pct = goal.progress?.pct ?? 0
            const tasksTotal = goal.progress?.tasksTotal ?? 0
            const tasksStarted = goal.progress?.tasksStarted ?? 0
            const allDone = pct >= 100
            // Ring: accent (Goals' identity color), success only on full completion
            const ringColor = allDone ? 'var(--success)' : 'var(--accent)'

            return (
              <div
                key={goal._id}
                className="bg-grey-x100 rounded-xl p-3 border border-border"
              >
                {/* Goal title */}
                <p className="text-[11px] font-bold text-foreground truncate leading-tight mb-2.5">
                  {goal.title}
                </p>

                {/* Ring + status */}
                <div className="flex items-center gap-2">
                  <Ring pct={pct} size={36} sw={3} strokeColor={ringColor}>
                    <span className="text-[8px] font-extrabold text-foreground">
                      {allDone ? '✓' : `${pct}%`}
                    </span>
                  </Ring>
                  <div>
                    <p className="text-[10px] text-muted-foreground">
                      {tasksTotal > 0 ? 'Tasks' : 'Progress'}
                    </p>
                    <p
                      className="text-[10px] font-semibold"
                      style={{ color: allDone ? 'var(--success)' : 'var(--foreground)' }}
                    >
                      {allDone
                        ? 'Completed!'
                        : tasksTotal > 0
                        ? `${tasksStarted}/${tasksTotal} started`
                        : 'On track'}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Footer — drilling in is the card's one action; adding lives on the
          dashboard FAB (mobile) / header (desktop). */}
      <div className="pt-3 mt-auto border-t border-border">
        <Link
          to="/goals-tracker"
          className="w-full inline-flex items-center justify-center gap-1.5 h-9 rounded-lg bg-accent/10 text-accent text-xs font-semibold hover:bg-accent/15 transition-colors"
        >
          Open tracker
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  )
}

export default GoalsSummaryCard
