import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import axiosInstance from '@/utils/axiosInstance'
import type { TopCategory } from '@/types/dashboard'
import type { ExpensePayload, ExpenseRecord, IncomePayload } from '@/types/expenseTracker'
import TransactionAdder, {
  type TransactionMode,
} from '@/feature-component/expense-tracker/TransactionAdder'
import { useCurrency } from '@/hooks/useCurrency'

interface ExpenseSummaryCardProps {
  totalSpend: number
  budget: number
  budgetPct: number
  topCategories: TopCategory[]
  isLoading: boolean
  onBudgetSaved: () => void
}

const ExpenseSummaryCard: React.FC<ExpenseSummaryCardProps> = ({
  totalSpend,
  budget,
  budgetPct,
  topCategories,
  isLoading,
  onBudgetSaved,
}) => {
  const { symbol } = useCurrency()
  const [showBudgetDialog, setShowBudgetDialog] = useState(false)
  const [newBudget, setNewBudget] = useState('')
  const [saving, setSaving] = useState(false)

  const [adderMode, setAdderMode] = useState<TransactionMode | null>(null)
  const [isExpenseLoading, setIsExpenseLoading] = useState(false)
  const [isIncomeLoading, setIsIncomeLoading] = useState(false)
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>([])

  useEffect(() => {
    axiosInstance.get('/v1/expenses/category')
      .then((res) => setCategories(res.data))
      .catch(console.error)
  }, [])

  const handleAddExpense = async (payload: ExpensePayload): Promise<ExpenseRecord | null> => {
    setIsExpenseLoading(true)
    try {
      const res = await axiosInstance.post('/v1/expenses', payload)
      setAdderMode(null)
      onBudgetSaved() // refresh dashboard
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
      setAdderMode(null)
      onBudgetSaved() // refresh dashboard
    } catch (err) {
      console.error(err)
    } finally {
      setIsIncomeLoading(false)
    }
  }

  // Status badge: only shows a colored state when there's an actual problem
  const isAlert = budgetPct >= 100
  const isWatch = budgetPct >= 70 && budgetPct < 100
  const statusLabel = isAlert ? 'Over budget' : isWatch ? `${budgetPct}% used` : null

  // Progress bar: primary by default, only red when over budget
  const barColor = isAlert ? 'var(--error)' : 'var(--primary)'

  const handleBudgetSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSaving(true)
      await axiosInstance.post('/v1/expenses/monthly-budget', { amount: newBudget })
      setNewBudget('')
      setShowBudgetDialog(false)
      onBudgetSaved()
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="skeleton w-7 h-7 rounded-lg" />
            <div className="skeleton h-4 w-20" />
          </div>
          <div className="skeleton h-5 w-16 rounded-full" />
        </div>
        <div className="skeleton h-7 w-32 mb-2.5" />
        <div className="skeleton h-1 w-full rounded mb-3" />
        <div className="flex gap-3 mb-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-3 w-10 rounded" />
          ))}
        </div>
        <div className="skeleton h-px w-full mb-3" />
        <div className="flex gap-2">
          <div className="skeleton h-9 flex-1 rounded-lg" />
          <div className="skeleton h-9 w-24 rounded-lg" />
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-card border border-border rounded-2xl p-4">
        {/* Header — no click, no chevron */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-grey-x100 flex items-center justify-center text-sm">
              💳
            </div>
            <span className="text-sm font-bold text-foreground">Expenses</span>
          </div>
          {statusLabel && (
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{
                color: isAlert ? 'var(--error)' : 'var(--warning)',
                backgroundColor: isAlert ? 'var(--error-x100)' : 'var(--warning-x100)',
              }}
            >
              {statusLabel}
            </span>
          )}
        </div>

        {/* Amount */}
        <div className="flex items-baseline gap-1.5 mb-2.5">
          <span className="text-2xl font-extrabold text-foreground tracking-tight">
            {symbol}{totalSpend.toLocaleString()}
          </span>
          {budget > 0 ? (
            <span className="text-sm text-muted-foreground">/ {symbol}{budget.toLocaleString()}</span>
          ) : (
            <button
              onClick={() => setShowBudgetDialog(true)}
              className="text-xs text-primary font-semibold hover:underline"
            >
              Set budget
            </button>
          )}
        </div>

        {/* Progress bar */}
        {budget > 0 && (
          <div className="h-1 bg-border rounded-full overflow-hidden mb-3">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{ width: `${Math.min(budgetPct, 100)}%`, backgroundColor: barColor }}
            />
          </div>
        )}

        {/* Top categories */}
        {topCategories.length > 0 && (
          <div className="flex items-center gap-3 flex-wrap mb-4">
            {topCategories.map((cat, i) => (
              <div key={i} className="flex items-center gap-1">
                <span className="text-xs">{cat.emoji}</span>
                <span className="text-[10px] text-muted-foreground font-medium">
                  {symbol}{cat.amount >= 1000
                    ? `${(cat.amount / 1000).toFixed(1)}k`
                    : cat.amount.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Action row — one entry button (the dashboard is built for quick
            logging). Expense vs income is a single tab-tap away inside the
            adder, so two separate buttons just split one action in two. */}
        <div className="flex items-center gap-2 pt-3 border-t border-border">
          <button
            onClick={() => setAdderMode('expense')}
            className="flex-1 inline-flex items-center justify-center gap-1.5 h-9 rounded-lg bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/15 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add transaction
          </button>
          <Link
            to="/expense-tracker"
            className="text-xs font-semibold text-primary hover:underline px-3 py-2 whitespace-nowrap"
          >
            Open tracker →
          </Link>
        </div>
      </div>

      <TransactionAdder
        openMode={adderMode}
        onClose={() => setAdderMode(null)}
        addExpense={handleAddExpense}
        addIncome={handleAddIncome}
        isExpenseLoading={isExpenseLoading}
        isIncomeLoading={isIncomeLoading}
        categories={categories}
      />

      {/* Budget Dialog */}
      <Dialog open={showBudgetDialog} onOpenChange={setShowBudgetDialog}>
        <DialogContent className="sm:max-w-[400px] rounded-xl">
          <form onSubmit={handleBudgetSubmit}>
            <DialogHeader>
              <DialogTitle>Set Monthly Budget</DialogTitle>
              <DialogDescription>Define your spending limit for this month.</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Input
                type="number"
                placeholder="Enter amount"
                value={newBudget}
                onChange={(e) => setNewBudget(e.target.value)}
                className="h-12 bg-input border-border focus:border-primary rounded-lg"
              />
            </div>
            <DialogFooter className="gap-2">
              <DialogClose asChild>
                <Button variant="outline" className="rounded-lg">Cancel</Button>
              </DialogClose>
              <Button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-primary hover:bg-primary/90"
              >
                {saving ? 'Saving...' : 'Save Budget'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default ExpenseSummaryCard
