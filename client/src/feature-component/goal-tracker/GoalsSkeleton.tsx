import React from 'react'

// Loading placeholder for the goals list. Mirrors the GoalCard grid (progress
// ring + title/meta lines) so the page holds its shape while data loads,
// matching the dashboard's shimmer-skeleton approach.
const GoalCardSkeleton: React.FC = () => (
  <div className="bg-card border border-border rounded-2xl p-4 animate-stagger-in">
    <div className="flex items-start gap-3">
      <div className="skeleton w-12 h-12 rounded-full flex-shrink-0" />
      <div className="flex-1 min-w-0 space-y-2 pt-0.5">
        <div className="skeleton h-4 w-2/3 rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />
        <div className="skeleton h-3 w-1/3 rounded" />
      </div>
    </div>
  </div>
)

const GoalsSkeleton: React.FC = () => (
  <div className="space-y-6">
    <section>
      <div className="skeleton h-3 w-24 rounded mb-2.5" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <GoalCardSkeleton key={i} />
        ))}
      </div>
    </section>
  </div>
)

export default GoalsSkeleton
