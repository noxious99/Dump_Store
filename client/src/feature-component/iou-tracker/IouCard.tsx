import React from 'react'
import moment from 'moment'
import { useCurrency } from '@/hooks/useCurrency'
import type { Iou } from '@/types/iou'

interface IouCardProps {
  iou: Iou
  onClick: () => void
}

const statusLabel: Record<string, string> = {
  partial: 'Partial',
  settled: 'Settled',
  cancelled: 'Cancelled',
}

const IouCard: React.FC<IouCardProps> = ({ iou, onClick }) => {
  const { symbol } = useCurrency()
  const lent = iou.type === 'lent'
  const closed = iou.status === 'settled' || iou.status === 'cancelled'

  // lent = they owe you (success), borrowed = you owe them (error)
  const amountColor = closed
    ? 'text-muted-foreground'
    : lent
    ? 'text-success'
    : 'text-error'

  const initial = iou.counterpartyName?.charAt(0).toUpperCase() || '?'

  // Fall back to a local computation if the server omits the virtual, so a
  // missing field can never crash the list render.
  const amountRemaining =
    iou.amountRemaining ?? Math.max(iou.amount - (iou.amountPaid || 0), 0)

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-card border border-border rounded-2xl p-4 hover:border-primary/40 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-grey-x100 flex items-center justify-center text-sm font-bold text-muted-foreground flex-shrink-0">
          {initial}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-foreground truncate">{iou.counterpartyName}</p>
            <span
              className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full whitespace-nowrap"
              style={{
                color: lent ? 'var(--success)' : 'var(--error)',
                backgroundColor: lent ? 'var(--success-x100)' : 'var(--error-x100)',
              }}
            >
              {lent ? 'Lent' : 'Borrowed'}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {statusLabel[iou.status] && (
              <span className="font-semibold">{statusLabel[iou.status]} · </span>
            )}
            {iou.isOverdue && !closed && (
              <span className="text-error font-semibold">Overdue · </span>
            )}
            {iou.expectedPaybackDate
              ? `Due ${moment(iou.expectedPaybackDate).format('MMM D')}`
              : moment(iou.transactionDate).format('MMM D, YYYY')}
          </p>
        </div>

        <div className="text-right flex-shrink-0">
          <p className={`text-base font-extrabold tracking-tight ${amountColor}`}>
            {closed ? '' : lent ? '+' : '-'}
            {symbol}
            {(closed ? iou.amount : amountRemaining).toLocaleString()}
          </p>
          {iou.status === 'partial' && (
            <p className="text-[10px] text-muted-foreground">
              of {symbol}{iou.amount.toLocaleString()}
            </p>
          )}
        </div>
      </div>
    </button>
  )
}

export default IouCard
