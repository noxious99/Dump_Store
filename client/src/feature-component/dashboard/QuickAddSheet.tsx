import React, { useEffect, useRef, useState } from 'react'
import { Wallet, Target, Handshake } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { useIsMobile } from '@/hooks/useIsMobile'
import axiosInstance from '@/utils/axiosInstance'
import ExpenseForm from '@/feature-component/expense-tracker/ExpenseForm'
import IncomeForm from '@/feature-component/expense-tracker/IncomeForm'
import GoalForm from '@/feature-component/goal-tracker/GoalForm'
import IouForm from '@/feature-component/iou-tracker/IouForm'
import type {
  ExpensePayload,
  IncomePayload,
  ExpenseRecord,
} from '@/types/expenseTracker'
import type { GoalPayload } from '@/types/goal'
import type { IouPayload } from '@/types/iou'

export type QuickAddType = 'transaction' | 'goal' | 'iou'
type TxMode = 'expense' | 'income'

interface QuickAddSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Tab to land on when the sheet opens (follows the active dashboard card). */
  initialType?: QuickAddType
  /** Fires after any successful create so the dashboard can refresh. */
  onChanged?: () => void
}

// Each entity owns an identity color — the active tab tints to match, carrying
// the FAB's color into the sheet so the action reads as one connected gesture.
const TABS: { key: QuickAddType; label: string; Icon: LucideIcon; accent: string }[] = [
  { key: 'transaction', label: 'Transaction', Icon: Wallet, accent: 'var(--primary)' },
  { key: 'goal', label: 'Goal', Icon: Target, accent: 'var(--accent)' },
  { key: 'iou', label: 'IOU', Icon: Handshake, accent: 'var(--secondary)' },
]

/**
 * One Add sheet for the whole dashboard. A segmented control switches between
 * Transaction / Goal / IOU; it opens on the tab matching the active card, so
 * the common path is zero extra taps. Owns all three create flows itself
 * (plain axios POSTs) so the dashboard just renders it and listens for changes.
 */
const QuickAddSheet: React.FC<QuickAddSheetProps> = ({
  open,
  onOpenChange,
  initialType = 'transaction',
  onChanged,
}) => {
  const isMobile = useIsMobile()
  const [type, setType] = useState<QuickAddType>(initialType)
  const [txMode, setTxMode] = useState<TxMode>('expense')

  const [categories, setCategories] = useState<{ _id: string; name: string }[]>([])
  const [isExpenseLoading, setIsExpenseLoading] = useState(false)
  const [isIncomeLoading, setIsIncomeLoading] = useState(false)

  // Land on the active card's tab each time the sheet opens, without snapping
  // tabs out from under the user if the prop changes while it's already open.
  const initialRef = useRef(initialType)
  initialRef.current = initialType
  useEffect(() => {
    if (open) {
      setType(initialRef.current)
      setTxMode('expense')
    }
  }, [open])

  // Categories are only needed for the expense form — fetch once, lazily.
  useEffect(() => {
    if (open && categories.length === 0) {
      axiosInstance
        .get('/v1/expenses/category')
        .then((res) => setCategories(res.data))
        .catch(console.error)
    }
  }, [open, categories.length])

  const handleAddExpense = async (
    payload: ExpensePayload
  ): Promise<ExpenseRecord | null> => {
    setIsExpenseLoading(true)
    try {
      const res = await axiosInstance.post('/v1/expenses', payload)
      onChanged?.()
      onOpenChange(false)
      return res.data?._id ? res.data : null
    } catch (err) {
      console.error(err)
      return null
    } finally {
      setIsExpenseLoading(false)
    }
  }

  const handleAddIncome = async (payload: IncomePayload) => {
    setIsIncomeLoading(true)
    try {
      await axiosInstance.post('/v1/expenses/add-income', payload)
      onChanged?.()
      onOpenChange(false)
    } catch (err) {
      console.error(err)
    } finally {
      setIsIncomeLoading(false)
    }
  }

  const handleCreateGoal = async (payload: GoalPayload) => {
    try {
      await axiosInstance.post('/v1/goals', payload)
      toast.success('Goal created')
      onChanged?.()
    } catch (error) {
      console.error('Error creating goal:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create goal')
      throw error
    }
  }

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

  // Top segment — the three entity types. mr-9 keeps it clear of the close (X).
  const segment = (
    <div className="flex gap-1 bg-grey-x100 rounded-lg p-1 mb-3 mr-9">
      {TABS.map(({ key, label, Icon, accent }) => {
        const active = type === key
        return (
          <button
            key={key}
            type="button"
            onClick={() => setType(key)}
            aria-pressed={active}
            className={`flex-1 min-w-0 inline-flex items-center justify-center gap-1.5 h-9 rounded-md text-xs font-semibold transition-colors ${
              active ? 'bg-card shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
            style={active ? { color: accent } : undefined}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span className="truncate">{label}</span>
          </button>
        )
      })}
    </div>
  )

  // Expense vs income lives under the Transaction tab — same toggle the
  // standalone transaction adder uses.
  const txSubSegment = (
    <div className="flex bg-grey-x100 rounded-lg p-1 mb-3">
      {(['expense', 'income'] as TxMode[]).map((m) => (
        <button
          key={m}
          type="button"
          onClick={() => setTxMode(m)}
          aria-pressed={txMode === m}
          className={`flex-1 h-9 rounded-md text-sm font-semibold capitalize transition-colors ${
            txMode === m
              ? 'bg-card shadow-sm text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {m}
        </button>
      ))}
    </div>
  )

  const body =
    type === 'transaction' ? (
      txMode === 'expense' ? (
        <ExpenseForm
          addExpense={handleAddExpense}
          isLoading={isExpenseLoading}
          categories={categories}
        />
      ) : (
        <IncomeForm addIncome={handleAddIncome} isLoading={isIncomeLoading} />
      )
    ) : type === 'goal' ? (
      <GoalForm
        resetKey={open}
        onSubmit={handleCreateGoal}
        onSuccess={() => onOpenChange(false)}
      />
    ) : (
      <IouForm
        resetKey={open}
        onSubmit={handleCreateIou}
        onSuccess={() => onOpenChange(false)}
      />
    )

  if (isMobile) {
    // The transaction form fills a tall sheet (amount pad + category grid, and
    // a fixed height keeps expense/income from jumping). Goal/IOU are short, so
    // their sheet hugs the content instead of leaving dead space below.
    const tall = type === 'transaction'
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          className={`rounded-t-2xl p-5 flex flex-col ${tall ? 'h-[96vh]' : 'max-h-[92vh]'}`}
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Add entry</SheetTitle>
          </SheetHeader>
          {segment}
          {type === 'transaction' && txSubSegment}
          <div className={`overflow-y-auto px-1 -mx-1 ${tall ? 'flex-1 min-h-0' : ''}`}>
            {body}
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[370px] rounded-xl">
        <DialogHeader className="sr-only">
          <DialogTitle>Add entry</DialogTitle>
        </DialogHeader>
        {segment}
        {type === 'transaction' && txSubSegment}
        {body}
      </DialogContent>
    </Dialog>
  )
}

export default QuickAddSheet
