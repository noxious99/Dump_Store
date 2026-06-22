import React from 'react'

// Loading placeholder for the IOU list. Mirrors the IouCard grid (avatar +
// name/meta + amount) so the page holds its shape while data loads, matching
// the dashboard's shimmer-skeleton approach.
const IouCardSkeleton: React.FC = () => (
  <div className="bg-card border border-border rounded-2xl p-4 animate-stagger-in">
    <div className="flex items-center gap-3">
      <div className="skeleton w-10 h-10 rounded-xl flex-shrink-0" />
      <div className="flex-1 min-w-0 space-y-2">
        <div className="skeleton h-4 w-1/2 rounded" />
        <div className="skeleton h-3 w-2/3 rounded" />
      </div>
      <div className="skeleton h-5 w-14 rounded flex-shrink-0" />
    </div>
  </div>
)

const IouListSkeleton: React.FC = () => (
  <section>
    <div className="flex items-center gap-2 mb-3">
      <span className="skeleton w-2 h-2 rounded-full" />
      <div className="skeleton h-4 w-16 rounded" />
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <IouCardSkeleton key={i} />
      ))}
    </div>
  </section>
)

export default IouListSkeleton
