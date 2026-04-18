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
import ExpenseAdder from '@/feature-component/expense-tracker/ExpenseAdder'
import IncomeAdder from '@/feature-component/expense-tracker/IncomeAdder'

import type {
  ExpenseDetails,
  ExpensePayload,
  IncomePayload,
  BudgetAllocation,
  CategoryOption,
} from '@/types/expenseTracker'

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
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false)
  const [isAddIncomeOpen, setIsAddIncomeOpen] = useState(false)
  const [isExpenseAdding, setIsExpenseAdding] = useState(false)
  const [isIncomeAdding, setIsIncomeAdding] = useState(false)
  const [isHistoryMode, setIsHistoryMode] = useState(false)
  const [budgetSheetOpen, setBudgetSheetOpen] = useState(false)

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
      const id = res.data?.monthlyBudget?._id || ''
      await fetchAllocations(id)
    } catch (error) {
      console.error('Error fetching expenses:', error)
    } finally {
      setIsLoading(false)
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

  const handleAddExpense = async (val: ExpensePayload) => {
    setIsExpenseAdding(true)
    try {
      await axiosInstance.post('/v1/expenses', val)
      setIsAddExpenseOpen(false)
      await fetchExpenseDetails()
      toast.success('Expense added')
    } catch (error) {
      console.error('Error adding expense:', error)
      toast.error('Failed to add expense')
    } finally {
      setIsExpenseAdding(false)
    }
  }

  const handleAddIncome = async (val: IncomePayload) => {
    setIsIncomeAdding(true)
    try {
      await axiosInstance.post('/v1/expenses/add-income', val)
      setIsAddIncomeOpen(false)
      await fetchExpenseDetails()
      toast.success('Income added')
    } catch (error) {
      console.error('Error adding income:', error)
      toast.error('Failed to add income')
    } finally {
      setIsIncomeAdding(false)
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
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 lg:px-8 py-6 pb-24 lg:pb-12">
          {/* ── Header ─────────────────────────────────────────── */}
          <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
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
                  onClick={() => setIsAddExpenseOpen(true)}
                  disabled={isLoading || isHistoryMode}
                  className="h-8 px-3 text-sm font-semibold text-foreground bg-grey-x100 hover:bg-grey-x200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  + Expense
                </button>
                <button
                  onClick={() => setIsAddIncomeOpen(true)}
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
            <div className="space-y-4">
              <MonthGlance
                income={income}
                spent={spent}
                topCategories={expenseDetails.topCategory || []}
              />

              {/* Desktop: full inline budget card */}
              <div className="hidden lg:block">
                <BudgetCard {...budgetCardProps} />
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

              <ExpenseRecordsList
                expenseRecords={expenseDetails.expenseRecords}
                onRecordDeleted={
                  isHistoryMode ? undefined : handleDeleteRecord
                }
              />
            </div>
          )}
        </div>

        <MobileFab
          onAddExpense={() => setIsAddExpenseOpen(true)}
          onAddIncome={() => setIsAddIncomeOpen(true)}
          disabled={isHistoryMode}
        />
      </div>

      <ExpenseAdder
        addExpense={handleAddExpense}
        handlePopupExpenseDialog={setIsAddExpenseOpen}
        isOpen={isAddExpenseOpen}
        isLoading={isExpenseAdding}
        categories={categories}
      />
      <IncomeAdder
        addIncome={handleAddIncome}
        handlePopupIncomeDialog={setIsAddIncomeOpen}
        isOpen={isAddIncomeOpen}
        isLoading={isIncomeAdding}
      />
    </>
  )
}

export default ExpenseTracker
