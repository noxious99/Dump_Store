import React from 'react'
import type { IouData } from '@/types/dashboard'

// TODO: Replace this entire component with real IOU API data once IOU tracker backend is built.
// Expected shape from API:
//   GET /v1/iou/summary → { youOwe: number, owedToYou: number, net: number, people: Person[] }

interface IouSummaryCardProps {
  iouData: IouData
}

const IouSummaryCard: React.FC<IouSummaryCardProps> = ({ iouData }) => {
  const netPositive = iouData.net >= 0

  return (
    // No onClick — IOU tracker page not built yet.
    // TODO: Add cursor-pointer + navigate('/iou-tracker') once the page exists
    <div className="bg-card border border-border rounded-2xl p-4">
      {/* Header — neutral icon, financial value badge only */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-grey-x100 flex items-center justify-center text-sm">
            🤝
          </div>
          <span className="text-sm font-bold text-foreground">IOUs</span>
        </div>
        {/* Net badge uses success/error — this is a financial value, semantic color is correct */}
        <span
          className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
          style={{
            color: netPositive ? 'var(--success)' : 'var(--error)',
            backgroundColor: netPositive ? 'var(--success-x100)' : 'var(--error-x100)',
          }}
        >
          {netPositive ? '+' : '-'}${Math.abs(iouData.net)} net
        </span>
      </div>

      {/* You owe / Owed to you — financial values, success/error is correct here */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-grey-x100 rounded-xl p-2.5 text-center border border-border">
          <p className="text-[8px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">
            You owe
          </p>
          <p className="text-lg font-extrabold text-error">${iouData.youOwe}</p>
        </div>
        <div className="bg-grey-x100 rounded-xl p-2.5 text-center border border-border">
          <p className="text-[8px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">
            Owed to you
          </p>
          <p className="text-lg font-extrabold text-success">${iouData.owedToYou}</p>
        </div>
      </div>

      {/* People chips */}
      <div className="flex flex-wrap gap-1.5">
        {iouData.people.map((person, i) => (
          <div
            key={i}
            className="flex items-center gap-1.5 bg-grey-x100 border border-border rounded-lg px-2 py-1"
          >
            <div className="w-5 h-5 rounded-md bg-grey-x200 flex items-center justify-center text-[9px] font-bold text-muted-foreground flex-shrink-0">
              {person.initial}
            </div>
            <span className="text-[10px] text-muted-foreground">{person.name}</span>
            {/* Amount uses success/error — financial signal */}
            <span
              className="text-[10px] font-bold"
              style={{ color: person.net >= 0 ? 'var(--success)' : 'var(--error)' }}
            >
              {person.net >= 0 ? '+' : ''}{person.net}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default IouSummaryCard
