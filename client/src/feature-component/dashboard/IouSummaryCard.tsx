import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import type { IouData } from '@/types/dashboard'
import { useCurrency } from '@/hooks/useCurrency'
import { CategoryIcon } from '@/components/CategoryIcon'

interface IouSummaryCardProps {
  iouData: IouData
}

const IouSummaryCard: React.FC<IouSummaryCardProps> = ({ iouData }) => {
  const { symbol } = useCurrency()
  const netPositive = iouData.net >= 0

  return (
    <div className="bg-card border border-border rounded-2xl p-4 h-full flex flex-col">
      {/* Header — neutral icon, financial value badge only */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-secondary/10 flex items-center justify-center">
            <CategoryIcon name="iou" size={20} />
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
          {netPositive ? '+' : '-'}{symbol}{Math.abs(iouData.net)} net
        </span>
      </div>

      {/* You owe / Owed to you — financial values, success/error is correct here */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-grey-x100 rounded-xl p-2.5 text-center border border-border">
          <p className="text-[8px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">
            You owe
          </p>
          <p className="text-lg font-extrabold text-error">{symbol}{iouData.youOwe}</p>
        </div>
        <div className="bg-grey-x100 rounded-xl p-2.5 text-center border border-border">
          <p className="text-[8px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">
            Owed to you
          </p>
          <p className="text-lg font-extrabold text-success">{symbol}{iouData.owedToYou}</p>
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

      {/* Footer — drilling in is the card's one action; adding lives on the
          dashboard FAB (mobile) / header (desktop). */}
      <div className="pt-3 mt-auto border-t border-border">
        <Link
          to="/iou-tracker"
          className="w-full inline-flex items-center justify-center gap-1.5 h-9 rounded-lg bg-secondary/10 text-secondary text-xs font-semibold hover:bg-secondary/15 transition-colors"
        >
          Open tracker
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  )
}

export default IouSummaryCard
