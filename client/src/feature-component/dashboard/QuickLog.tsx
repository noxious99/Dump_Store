import React, { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import axiosInstance from '@/utils/axiosInstance'
import { categoryEmojiMap } from '@/utils/constant'
import { useCurrency } from '@/hooks/useCurrency'
import { recordCategoryUse } from '@/utils/categoryUsage'
import type { QuickChip } from '@/utils/quickChips'

interface QuickLogProps {
  /** Frequent (category, amount, note) combos — see computeQuickChips. */
  chips: QuickChip[]
  /** Called after a log/undo so the dashboard can refetch its summary. */
  onLogged: () => void
}

/**
 * One-tap re-logging of the user's most frequent expenses, surfaced at the top
 * of the dashboard. The whole point is to kill logging friction: a tap on a
 * chip records the expense outright (with an Undo escape hatch) — no form, no
 * navigation. Renders nothing until there are repeated combos to offer.
 */
const QuickLog: React.FC<QuickLogProps> = ({ chips, onLogged }) => {
  const { symbol } = useCurrency()
  const [savingKey, setSavingKey] = useState<string | null>(null)

  if (chips.length === 0) return null

  const handleUndo = async (id: string) => {
    try {
      await axiosInstance.delete(`/v1/expenses/${id}`)
      onLogged()
      toast.success('Expense removed')
    } catch (err) {
      console.error('Quick-log undo error:', err)
      toast.error('Failed to undo')
    }
  }

  const handleLog = async (chip: QuickChip) => {
    if (savingKey) return
    setSavingKey(chip.key)
    try {
      const res = await axiosInstance.post('/v1/expenses', {
        amount: chip.amount,
        categoryId: chip.categoryId,
        note: chip.note,
      })
      const created = res.data?._id ? res.data : null
      recordCategoryUse(chip.categoryId)
      onLogged()
      if (created) {
        toast.success(`Logged ${symbol}${chip.amount.toLocaleString()}`, {
          action: { label: 'Undo', onClick: () => void handleUndo(created._id) },
        })
      }
    } catch (err) {
      console.error('Quick-log error:', err)
      toast.error('Failed to log expense')
    } finally {
      setSavingKey(null)
    }
  }

  return (
    <div className="animate-fade-up">
      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
        Quick log
      </p>
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {chips.map((chip) => (
          <button
            key={chip.key}
            type="button"
            onClick={() => handleLog(chip)}
            disabled={savingKey !== null}
            className="shrink-0 inline-flex items-center gap-1.5 h-10 px-3.5 rounded-full bg-card border border-border hover:border-primary/50 hover:bg-primary/5 transition-colors disabled:opacity-60 active:scale-95"
          >
            {savingKey === chip.key ? (
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            ) : (
              <span className="text-base leading-none">
                {categoryEmojiMap[chip.categoryName?.toLowerCase()] || '🔀'}
              </span>
            )}
            <span className="text-sm font-bold text-foreground">
              {symbol}{chip.amount.toLocaleString()}
            </span>
            {chip.note && (
              <span className="text-xs text-muted-foreground max-w-[80px] truncate">
                {chip.note}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

export default QuickLog
