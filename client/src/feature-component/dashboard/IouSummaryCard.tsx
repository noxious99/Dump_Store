import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import axiosInstance from '@/utils/axiosInstance'
import IouFormSheet from '@/feature-component/iou-tracker/IouFormSheet'
import type { IouData } from '@/types/dashboard'
import type { IouPayload } from '@/types/iou'
import { useCurrency } from '@/hooks/useCurrency'

interface IouSummaryCardProps {
  iouData: IouData
  /** Called after an IOU is created so the dashboard can refresh. */
  onChanged?: () => void
}

const IouSummaryCard: React.FC<IouSummaryCardProps> = ({ iouData, onChanged }) => {
  const { symbol } = useCurrency()
  const netPositive = iouData.net >= 0
  const [formOpen, setFormOpen] = useState(false)

  // Quick-create from the dashboard. Rethrow keeps the form open on failure,
  // matching the tracker page's behaviour.
  const handleCreateIou = async (payload: IouPayload) => {
    try {
      await axiosInstance.post('/v1/iou', payload)
      toast.success('IOU added')
      onChanged?.()
    } catch (error) {
      console.error('Error creating IOU:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to add IOU')
      throw error
    }
  }

  return (
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

      {/* Action row — uniform add button + tracker link, matching the other cards */}
      <div className="flex items-center gap-2 pt-3 mt-3 border-t border-border">
        <button
          onClick={() => setFormOpen(true)}
          className="flex-1 inline-flex items-center justify-center gap-1.5 h-9 rounded-lg bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/15 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add IOU
        </button>
        <Link
          to="/iou-tracker"
          className="text-xs font-semibold text-primary hover:underline px-3 py-2 whitespace-nowrap"
        >
          Open tracker →
        </Link>
      </div>

      <IouFormSheet open={formOpen} onOpenChange={setFormOpen} onSubmit={handleCreateIou} />
    </div>
  )
}

export default IouSummaryCard
