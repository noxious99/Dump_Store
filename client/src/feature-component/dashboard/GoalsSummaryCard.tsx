import React from 'react'
import { Link } from 'react-router-dom'
import Ring from './Ring'
import type { Goal } from '@/types/dashboard'

interface GoalsSummaryCardProps {
  goals: Goal[]
  isLoading: boolean
}

const GoalsSummaryCard: React.FC<GoalsSummaryCardProps> = ({ goals, isLoading }) => {
  const activeGoals = goals.filter((g) => !g.isCompleted)
  const displayGoals = activeGoals.slice(0, 2)

  const getGoalPct = (goal: Goal) => {
    if (!goal.mileStone || goal.mileStone.length === 0) return 0
    const done = goal.mileStone.filter((m) => m.isCompleted).length
    return Math.round((done / goal.mileStone.length) * 100)
  }

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <div className="skeleton w-7 h-7 rounded-lg" />
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
        <div className="flex gap-2">
          <div className="skeleton h-8 flex-1 rounded-lg" />
          <div className="skeleton h-8 w-20 rounded-lg" />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-4">
      {/* Header — no click, no chevron */}
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-grey-x100 flex items-center justify-center text-sm">
            🎯
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
            const pct = getGoalPct(goal)
            const done = goal.mileStone?.filter((m) => m.isCompleted).length ?? 0
            const total = goal.mileStone?.length ?? 0
            const allDone = pct === 100
            // Ring: primary always, success only on full completion (semantic)
            const ringColor = allDone ? 'var(--success)' : 'var(--primary)'

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
                      {allDone ? '✓' : `${done}/${total}`}
                    </span>
                  </Ring>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Milestones</p>
                    <p
                      className="text-[10px] font-semibold"
                      style={{ color: allDone ? 'var(--success)' : 'var(--foreground)' }}
                    >
                      {allDone
                        ? 'All done!'
                        : total === 0
                        ? 'None set'
                        : `${total - done} left`}
                    </p>
                  </div>
                </div>
                {/* Streak dots removed — no real streak data yet.
                    TODO: Add per-goal streak history from backend and re-enable */}
              </div>
            )
          })}
        </div>
      )}

      {/* Action row — contextual actions live here */}
      <div className="flex items-center gap-2 pt-3 border-t border-border">
        <Link
          to="/goals-tracker"
          className="flex-1 text-center text-xs font-semibold text-muted-foreground bg-grey-x100 hover:bg-grey-x200 rounded-lg py-2 transition-colors"
        >
          + New Goal
        </Link>
        <Link
          to="/goals-tracker"
          className="text-xs font-semibold text-primary hover:underline px-3 py-2 whitespace-nowrap"
        >
          View all →
        </Link>
      </div>
    </div>
  )
}

export default GoalsSummaryCard
