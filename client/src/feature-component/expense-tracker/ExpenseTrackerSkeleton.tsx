import React from 'react'

// Loading placeholder for the expense tracker. Mirrors the mobile stack —
// budget card, recurring strip, then the records list — so the page holds its
// shape while data loads. Each block carries the dashboard's `animate-stagger-in`
// lift so the skeletons fade up in sequence like the rest of the app.
const RecordRowSkeleton: React.FC = () => (
  <div className="flex items-center gap-3 py-3">
    <div className="skeleton w-9 h-9 rounded-lg flex-shrink-0" />
    <div className="flex-1 min-w-0 space-y-1.5">
      <div className="skeleton h-3.5 w-1/3 rounded" />
      <div className="skeleton h-2.5 w-1/4 rounded" />
    </div>
    <div className="skeleton h-4 w-12 rounded flex-shrink-0" />
  </div>
)

const ExpenseTrackerSkeleton: React.FC = () => (
  <div className="space-y-4">
    {/* Budget card */}
    <div className="bg-card border border-border rounded-2xl p-4 animate-stagger-in">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="skeleton w-9 h-9 rounded-xl" />
          <div className="space-y-1.5">
            <div className="skeleton h-3.5 w-24 rounded" />
            <div className="skeleton h-2.5 w-14 rounded" />
          </div>
        </div>
        <div className="skeleton h-5 w-20 rounded-full" />
      </div>
      <div className="skeleton h-7 w-40 rounded mb-3" />
      <div className="skeleton h-2 w-full rounded-full mb-3" />
      <div className="flex gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="skeleton h-7 w-16 rounded-full" />
        ))}
      </div>
    </div>

    {/* Recurring strip */}
    <div className="bg-card border border-border rounded-2xl px-4 py-3 flex items-center justify-between animate-stagger-in">
      <div className="skeleton h-4 w-48 rounded" />
      <div className="skeleton h-4 w-16 rounded" />
    </div>

    {/* Records card */}
    <div className="bg-card border border-border rounded-2xl p-4 animate-stagger-in">
      <div className="flex items-center justify-between mb-3">
        <div className="skeleton h-7 w-32 rounded-lg" />
        <div className="skeleton h-3 w-16 rounded" />
      </div>
      <div className="skeleton h-3 w-20 rounded mb-1" />
      {Array.from({ length: 5 }).map((_, i) => (
        <RecordRowSkeleton key={i} />
      ))}
    </div>
  </div>
)

export default ExpenseTrackerSkeleton
