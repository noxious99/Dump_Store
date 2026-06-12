import React, { useEffect, useState } from 'react'
import { FaCaretLeft, FaCaretRight } from 'react-icons/fa6'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import axiosInstance from '@/utils/axiosInstance'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

import MonthGlance from '@/feature-component/expense-tracker/MonthGlance'
import BudgetCard from '@/feature-component/expense-tracker/BudgetCard'
import BudgetStrip from '@/feature-component/expense-tracker/BudgetStrip'
import MobileFab from '@/feature-component/expense-tracker/MobileFab'
import ExpenseRecordsList from '@/feature-component/expense-tracker/ExpenseRecordsList'
import RecordDetailSheet from '@/feature-component/expense-tracker/RecordDetailSheet'
import IncomeDetailSheet from '@/feature-component/expense-tracker/IncomeDetailSheet'
import TransactionAdder, {
  type TransactionMode,
} from '@/feature-component/expense-tracker/TransactionAdder'
import RecurringManager from '@/feature-component/expense-tracker/RecurringManager'
import {
  promptKey,
  wasPromptShown,
  markPromptShown,
} from '@/utils/recurringPrompt'

import type {
  ExpenseDetails,
  ExpensePayload,
  IncomePayload,
  BudgetAllocation,
  CategoryOption,
  ExpenseRecord,
  IncomeRecord,
  RecurringRule,
  RecurringRulePayload,
} from '@/types/expenseTracker'
import { useCurrency } from '@/hooks/useCurrency'

const formatMonthLabel = (d: Date) =>
  d.toLocaleString('default', { month: 'short', year: 'numeric' })

const formatDateParam = (d: Date) => d.toLocaleDateString('en-CA')

const monthBoundaryInfo = (selected: Date) => {
  const now = new Date()
  const sameMonth =
    now.getFullYear() === selected.getFullYear() &&
    now.getMonth() === selected.getMonth()

  const daysInMonth = new Date(
    selected.getFullYear(),
    selected.getMonth() + 1,
    0
  ).getDate()

  const dayOfMonth = sameMonth ? now.getDate() : daysInMonth
  const daysLeft = sameMonth ? Math.max(daysInMonth - now.getDate(), 0) : 0
  return { dayOfMonth, daysInMonth, daysLeft }
}

const ExpenseTracker: React.FC = () => {
  const { symbol } = useCurrency()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [expenseDetails, setExpenseDetails] = useState<ExpenseDetails>({
    expenseRecords: [],
    totalSpend: { amount: 0 },
    totalIncome: { amount: 0 },
    topCategory: [],
    monthlyBudget: {
      _id: '',
      amount: 0,
      alertThreshold: 0,
      allocationCount: 0,
    },
  })
  const [allocations, setAllocations] = useState<BudgetAllocation[]>([])
  const [categories, setCategories] = useState<CategoryOption[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [adderMode, setAdderMode] = useState<TransactionMode | null>(null)
  const [isExpenseAdding, setIsExpenseAdding] = useState(false)
  const [isIncomeAdding, setIsIncomeAdding] = useState(false)
  const [isHistoryMode, setIsHistoryMode] = useState(false)
  const [budgetSheetOpen, setBudgetSheetOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<ExpenseRecord | null>(
    null
  )
  const [recordSheetOpen, setRecordSheetOpen] = useState(false)
  const [selectedIncome, setSelectedIncome] = useState<IncomeRecord | null>(null)
  const [incomeSheetOpen, setIncomeSheetOpen] = useState(false)
  const [recurringRules, setRecurringRules] = useState<RecurringRule[]>([])
  const [recurringMonthlyTotal, setRecurringMonthlyTotal] = useState(0)

  const monthLabel = formatMonthLabel(currentDate)
  const { dayOfMonth, daysInMonth, daysLeft } = monthBoundaryInfo(currentDate)

  const income = expenseDetails.totalIncome?.amount || 0
  const spent = expenseDetails.totalSpend?.amount || 0
  const budgetId = expenseDetails.monthlyBudget?._id || ''
  const budgetTotal = expenseDetails.monthlyBudget?.amount || 0

  const totalAllocated = allocations.reduce(
    (s, a) => s + (a.allocatedAmount || 0),
    0
  )
  const unallocated = Math.max(budgetTotal - totalAllocated, 0)

  const fetchAllocations = async (id: string) => {
    if (!id) {
      setAllocations([])
      return
    }
    try {
      const res = await axiosInstance.get('/v1/expenses/budget-allocate', {
        params: { budgetId: id },
      })
      setAllocations(res.data?.categories || [])
    } catch (error) {
      console.error('Error fetching allocations:', error)
      setAllocations([])
    }
  }

  const fetchExpenseDetails = async () => {
    setIsLoading(true)
    try {
      const res = await axiosInstance.get('/v1/expenses/details', {
        params: { date: formatDateParam(currentDate) },
      })
      setExpenseDetails(res.data)
      // Lazy materialization may have just created due recurring records
      const recurring = res.data?.recurring
      if (recurring?.materialized > 0) {
        toast.info(
          recurring.materialized === 1
            ? 'Added 1 recurring record for you'
            : `Added ${recurring.materialized} recurring records for you` +
              (recurring.skipped > 0 ? ` (skipped ${recurring.skipped} older)` : '')
        )
      }
      const id = res.data?.monthlyBudget?._id || ''
      await fetchAllocations(id)
    } catch (error) {
      console.error('Error fetching expenses:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchRecurringRules = async () => {
    try {
      const res = await axiosInstance.get('/v1/expenses/recurring')
      setRecurringRules(res.data?.rules || [])
      setRecurringMonthlyTotal(res.data?.monthlyExpenseTotal || 0)
    } catch (error) {
      console.error('Error fetching recurring rules:', error)
    }
  }

  const handleCreateRecurringRule = async (payload: RecurringRulePayload) => {
    try {
      await axiosInstance.post('/v1/expenses/recurring', payload)
      let phrase = 'every month'
      if (payload.frequency === 'weekly') phrase = 'every week'
      if (payload.frequency === 'weekdays') phrase = 'every weekday'
      if (payload.frequency === 'daily') {
        const days = payload.daysOfWeek
        if (days && days.length < 7) {
          const names = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
          const monFirst = [1, 2, 3, 4, 5, 6, 0].filter((d) => days.includes(d))
          phrase = `every ${monFirst.map((d) => names[d]).join(', ')}`
        } else {
          phrase = 'every day'
        }
      }
      toast.success(`Done, this will repeat ${phrase}`)
      await fetchRecurringRules()
    } catch (error: any) {
      console.error('Error creating recurring rule:', error)
      toast.error(error?.response?.data?.msg || 'Failed to set up recurring')
    }
  }

  const handleToggleRecurringRule = async (rule: RecurringRule) => {
    try {
      await axiosInstance.patch(`/v1/expenses/recurring/${rule._id}`, {
        isActive: !rule.isActive,
      })
      toast.success(rule.isActive ? 'Paused' : 'Back on, starting next due date')
      await fetchRecurringRules()
    } catch (error) {
      console.error('Error updating recurring rule:', error)
      toast.error('Failed to update rule')
    }
  }

  const handleDeleteRecurringRule = async (rule: RecurringRule) => {
    try {
      await axiosInstance.delete(`/v1/expenses/recurring/${rule._id}`)
      toast.success('Rule deleted. Your past records are safe')
      await fetchRecurringRules()
    } catch (error) {
      console.error('Error deleting recurring rule:', error)
      toast.error('Failed to delete rule')
    }
  }

  const fetchCategories = async () => {
    try {
      const res = await axiosInstance.get('/v1/expenses/category')
      setCategories(res.data || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleMonthChange = (direction: 'left' | 'right') => {
    setCurrentDate((prev) => {
      const offset = direction === 'right' ? 1 : -1
      return new Date(prev.getFullYear(), prev.getMonth() + offset)
    })
  }

  const handleUndoExpense = async (expenseId: string) => {
    try {
      await axiosInstance.delete(`/v1/expenses/${expenseId}`)
      await fetchExpenseDetails()
      toast.success('Expense removed')
    } catch (error) {
      console.error('Error undoing expense:', error)
      toast.error('Failed to undo')
    }
  }

  const handleAddExpense = async (
    val: ExpensePayload,
    opts?: { undoable?: boolean; skipRecurringPrompt?: boolean }
  ): Promise<ExpenseRecord | null> => {
    setIsExpenseAdding(true)
    try {
      const res = await axiosInstance.post('/v1/expenses', val)
      const created: ExpenseRecord | null = res.data?._id ? res.data : null
      setAdderMode(null)
      await fetchExpenseDetails()
      if (opts?.undoable && created) {
        toast.success(`Logged ${symbol}${created.amount.toLocaleString()}`, {
          action: {
            label: 'Undo',
            onClick: () => void handleUndoExpense(created._id),
          },
        })
      } else {
        toast.success('Expense added')
      }
      // Server saw a similar expense last month. Each (category, amount)
      // pair prompts at most once per month, and never when the user just
      // created a rule themselves via the repeat toggle.
      if (
        created?.recurringSuggestion &&
        created.category?._id &&
        !opts?.skipRecurringPrompt
      ) {
        const key = promptKey(created.category._id, created.amount)
        if (!wasPromptShown(key)) {
          markPromptShown(key)
          toast(`You logged this last month too. Want it added automatically every month?`, {
            duration: 8000,
            action: {
              label: 'Yes',
              onClick: () =>
                void handleCreateRecurringRule({
                  kind: 'expense',
                  amount: created.amount,
                  categoryId: created.category._id,
                  note: created.note,
                  frequency: 'monthly',
                }),
            },
          })
        }
      }
      return created
    } catch (error) {
      console.error('Error adding expense:', error)
      toast.error('Failed to add expense')
      return null
    } finally {
      setIsExpenseAdding(false)
    }
  }

  const handleAddIncome = async (val: IncomePayload): Promise<boolean> => {
    setIsIncomeAdding(true)
    try {
      await axiosInstance.post('/v1/expenses/add-income', val)
      setAdderMode(null)
      await fetchExpenseDetails()
      toast.success('Income added')
      return true
    } catch (error) {
      console.error('Error adding income:', error)
      toast.error('Failed to add income')
      return false
    } finally {
      setIsIncomeAdding(false)
    }
  }

  const handleSaveRecord = async (
    expenseId: string,
    payload: { amount: number; note: string; categoryId: string }
  ) => {
    try {
      await axiosInstance.patch(`/v1/expenses/${expenseId}`, payload)
      await fetchExpenseDetails()
      toast.success('Record updated')
    } catch (error: any) {
      console.error('Error updating expense:', error)
      toast.error(error?.msg || 'Failed to update record')
    }
  }

  const handleSaveIncome = async (
    incomeId: string,
    payload: { amount: number; source: string; note: string }
  ) => {
    try {
      await axiosInstance.patch(`/v1/expenses/income/${incomeId}`, payload)
      await fetchExpenseDetails()
      toast.success('Income updated')
    } catch (error: any) {
      console.error('Error updating income:', error)
      toast.error(error?.response?.data?.msg || 'Failed to update income')
    }
  }

  const handleDeleteIncome = async (incomeId: string) => {
    try {
      await axiosInstance.delete(`/v1/expenses/income/${incomeId}`)
      await fetchExpenseDetails()
      toast.success('Income record deleted')
    } catch (error) {
      console.error('Error deleting income:', error)
      toast.error('Failed to delete income record')
    }
  }

  const handleDeleteRecord = async (expenseId: string) => {
    try {
      await axiosInstance.delete(`/v1/expenses/${expenseId}`)
      await fetchExpenseDetails()
      toast.success('Record deleted')
    } catch (error) {
      console.error('Error deleting expense:', error)
      toast.error('Failed to delete record')
    }
  }

  const handleCreateBudget = async (amount: number) => {
    try {
      await axiosInstance.post('/v1/expenses/monthly-budget', { amount })
      await fetchExpenseDetails()
      toast.success('Budget created')
    } catch (error: any) {
      console.error('Error creating budget:', error)
      toast.error(error?.response?.data?.msg || 'Failed to create budget')
    }
  }

  const handleUpdateBudgetTotal = async (amount: number) => {
    try {
      await axiosInstance.patch('/v1/expenses/monthly-budget', {
        budgetId,
        amount,
      })
      await fetchExpenseDetails()
      toast.success('Budget updated')
    } catch (error: any) {
      console.error('Error updating budget:', error)
      toast.error(error?.response?.data?.msg || 'Failed to update budget')
    }
  }

  const handleUpdateAllocation = async (
    allocation: BudgetAllocation,
    amount: number
  ) => {
    try {
      await axiosInstance.patch('/v1/expenses/budget-allocate', {
        budgetId: allocation.budgetId,
        categoryId: allocation.categoryId,
        amount,
      })
      await fetchAllocations(budgetId)
      toast.success('Allocation updated')
    } catch (error: any) {
      console.error('Error updating allocation:', error)
      toast.error(error?.response?.data?.msg || 'Failed to update allocation')
    }
  }

  const handleAddAllocation = async (
    categoryId: string,
    allocatedAmount: number
  ) => {
    try {
      await axiosInstance.post('/v1/expenses/budget-allocate', {
        budgetId,
        categoryId,
        allocatedAmount,
      })
      await fetchExpenseDetails()
      toast.success('Allocation added')
    } catch (error: any) {
      console.error('Error adding allocation:', error)
      toast.error(error?.response?.data?.msg || 'Failed to add allocation')
    }
  }

  useEffect(() => {
    fetchCategories()
    fetchRecurringRules()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const now = new Date()
    const sameMonth =
      now.getFullYear() === currentDate.getFullYear() &&
      now.getMonth() === currentDate.getMonth()
    setIsHistoryMode(!sameMonth)
    fetchExpenseDetails()
  }, [currentDate])

  const budgetCardProps = {
    budgetId,
    total: budgetTotal,
    spent,
    daysLeft,
    dayOfMonth,
    daysInMonth,
    allocations,
    categories,
    historyMode: isHistoryMode,
    onCreateBudget: handleCreateBudget,
    onUpdateBudgetTotal: handleUpdateBudgetTotal,
    onUpdateAllocation: handleUpdateAllocation,
    onAddAllocation: handleAddAllocation,
  }

  return (
    <>
      {/* Navbar above is 68px tall and in normal flow */}
      {/* Navbar above is 68px tall and in normal flow — a smaller offset
          makes the page taller than the viewport and brings back the
          whole-page scrollbar */}
      <div className="min-h-screen bg-background lg:h-[calc(100vh-68px)] lg:min-h-0 lg:overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 lg:px-8 py-6 pb-24 lg:pb-8 lg:h-full lg:flex lg:flex-col">
          {/* ── Header ─────────────────────────────────────────── */}
          <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6 lg:mb-4">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Expense Tracker
              </p>
              <h1 className="text-2xl font-extrabold text-foreground tracking-tight mt-0.5 font-heading">
                Manage your spending
                <span className="text-primary">.</span>
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-card border border-border rounded-lg p-1">
                <button
                  onClick={() => handleMonthChange('left')}
                  disabled={isLoading}
                  className="w-7 h-7 rounded-md hover:bg-grey-x100 text-muted-foreground flex items-center justify-center disabled:opacity-50"
                  aria-label="Previous month"
                >
                  <FaCaretLeft className="text-sm" />
                </button>
                <span className="px-2 text-sm font-semibold text-foreground min-w-[75px] text-center">
                  {monthLabel}
                </span>
                <button
                  onClick={() => handleMonthChange('right')}
                  disabled={isLoading}
                  className="w-7 h-7 rounded-md hover:bg-grey-x100 text-muted-foreground flex items-center justify-center disabled:opacity-50"
                  aria-label="Next month"
                >
                  <FaCaretRight className="text-sm" />
                </button>
              </div>

              <div className="hidden lg:flex items-center gap-2">
                <button
                  onClick={() => setAdderMode('expense')}
                  disabled={isLoading || isHistoryMode}
                  className="h-8 px-3 text-sm font-semibold text-foreground bg-grey-x100 hover:bg-grey-x200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  + Expense
                </button>
                <button
                  onClick={() => setAdderMode('income')}
                  disabled={isLoading || isHistoryMode}
                  className="h-8 px-3 text-sm font-semibold text-foreground bg-grey-x100 hover:bg-grey-x200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  + Income
                </button>
              </div>
            </div>
          </header>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Loading your records...
              </p>
            </div>
          ) : (
            <div className="space-y-4 lg:space-y-0 lg:grid lg:grid-cols-12 lg:gap-5 lg:flex-1 lg:min-h-0">
              {/* Left column on desktop: glance + budget (no column scrollbar;
                  the budget card shrinks to fit and its allocation list
                  scrolls internally) */}
              <div className="space-y-4 lg:space-y-3 lg:col-span-7 lg:min-h-0 lg:flex lg:flex-col">
                <MonthGlance
                  income={income}
                  spent={spent}
                  topCategories={expenseDetails.topCategory || []}
                />

                {/* Desktop: full inline budget card, stretches to fill the column */}
                <div className="hidden lg:flex lg:flex-col lg:min-h-0 lg:flex-1">
                  <BudgetCard {...budgetCardProps} />
                  <div className="mt-3">
                    <RecurringManager
                      rules={recurringRules}
                      monthlyExpenseTotal={recurringMonthlyTotal}
                      onToggleActive={handleToggleRecurringRule}
                      onDelete={handleDeleteRecurringRule}
                    />
                  </div>
                </div>

                {/* Mobile: compact strip → bottom sheet */}
                <div className="lg:hidden">
                  <BudgetStrip
                    monthLabel={monthLabel}
                    hasBudget={Boolean(budgetId)}
                    total={budgetTotal}
                    spent={spent}
                    daysLeft={daysLeft}
                    allocationCount={allocations.length}
                    unallocated={unallocated}
                    onOpen={() => setBudgetSheetOpen(true)}
                    historyMode={isHistoryMode}
                  />
                  <div className="mt-3">
                    <RecurringManager
                      rules={recurringRules}
                      monthlyExpenseTotal={recurringMonthlyTotal}
                      onToggleActive={handleToggleRecurringRule}
                      onDelete={handleDeleteRecurringRule}
                    />
                  </div>
                  <Sheet
                    open={budgetSheetOpen}
                    onOpenChange={setBudgetSheetOpen}
                  >
                    <SheetContent
                      side="bottom"
                      className="rounded-t-2xl max-h-[88vh] overflow-y-auto p-0"
                    >
                      <SheetHeader className="px-5 pt-5 pb-3 text-left">
                        <SheetTitle className="text-base font-extrabold text-foreground">
                          Budget · {monthLabel}
                        </SheetTitle>
                      </SheetHeader>
                      <div className="px-5 pb-6">
                        <BudgetCard {...budgetCardProps} embedded />
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
              </div>

              {/* Right column on desktop: records card fills the column and
                  scrolls its list internally */}
              <div className="lg:col-span-5 lg:min-h-0 lg:flex lg:flex-col">
                <ExpenseRecordsList
                  expenseRecords={expenseDetails.expenseRecords}
                  incomeRecords={expenseDetails.incomeRecords}
                  onSelectRecord={(record) => {
                    setSelectedRecord(record)
                    setRecordSheetOpen(true)
                  }}
                  onSelectIncome={(record) => {
                    setSelectedIncome(record)
                    setIncomeSheetOpen(true)
                  }}
                />
              </div>
            </div>
          )}
        </div>

        <MobileFab
          onAdd={() => setAdderMode('expense')}
          disabled={isHistoryMode}
        />
      </div>

      <TransactionAdder
        openMode={adderMode}
        onClose={() => setAdderMode(null)}
        addExpense={handleAddExpense}
        addIncome={handleAddIncome}
        isExpenseLoading={isExpenseAdding}
        isIncomeLoading={isIncomeAdding}
        categories={categories}
        expenseRecords={expenseDetails.expenseRecords || []}
        onCreateRecurringRule={handleCreateRecurringRule}
      />
      <RecordDetailSheet
        record={selectedRecord}
        open={recordSheetOpen}
        onOpenChange={setRecordSheetOpen}
        categories={categories}
        readOnly={isHistoryMode}
        onSave={handleSaveRecord}
        onDelete={handleDeleteRecord}
      />
      <IncomeDetailSheet
        record={selectedIncome}
        open={incomeSheetOpen}
        onOpenChange={setIncomeSheetOpen}
        readOnly={isHistoryMode}
        onSave={handleSaveIncome}
        onDelete={handleDeleteIncome}
      />
    </>
  )
}

export default ExpenseTracker
