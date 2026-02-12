import React, { useEffect, useState } from 'react'
import { ChevronsUpDown } from "lucide-react"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Input } from "@/components/ui/input"
import { Button } from '@/components/ui/button'

import { getDaysLeftOfCurrentMonth } from '@/utils/utils-functions'
import axiosInstance from '@/utils/axiosInstance'
import BudgetBreakdownDialog from './BudgetBreakdownDialog'

interface Allocation {
    categoryId: string
    category: string
    allocatedAmount: number
}

interface BudgetDetails {
    totalBudget: number
    totalAllocated: number
    daysLeft: number
    allocations: Allocation[]
}

interface Category {
    _id: string,
    allocatedAmount: number;
}
interface BudgetBreakdownData {
    amount: number,
    remaining: number,
    month: string,
    year: string,
    categories: Category[]
}
const daysLeft = getDaysLeftOfCurrentMonth()

const BudgetSummary: React.FC<{ budgetData?: BudgetDetails, budgetSummary: any, onBudgetUpdate: any, categories: any, historyMode: boolean }> =
    ({ budgetSummary, onBudgetUpdate, categories, historyMode }) => {
        const [isBudgetOpen, setIsBudgetOpen] = useState(true)
        const [isAddBudgetMenuOpen, setAddBudgetMenuOpen] = useState(false)
        const [totalAllocated, setTotalAllocated] = useState<number>(0)
        const [newBudgetAmount, setNewBudgetAmount] = useState<string>("")
        const [budgetBreakdownData, setBudgetBreakdownData] = useState<BudgetBreakdownData | null>({
            amount: 0,
            remaining: 0,
            month: "",
            year: "",
            categories: []
        })
        const [showBudgetBreakdownDialog, setShowBudgetBreakdownDialog] = useState(false)

        const dailyBudget = budgetSummary.remaining > 0 ? (budgetSummary.remaining / daysLeft).toFixed(2) : "0.00"

        const handleAddNewBudget = async () => {
            try {
                const amount = Number(newBudgetAmount);
                if (amount <= 0) {
                    return;
                }
                const payload = {
                    amount: newBudgetAmount
                }
                const res = await axiosInstance.post("/v1/expenses/monthly-budget", payload)
                onBudgetUpdate(res.data.newBudget)
            } catch (error) {
                console.log(error)
            }
        }

        const calculateTotalAllocatedAmount = () => {
            let amount = 0
            if (budgetBreakdownData) {
                amount = budgetBreakdownData.categories.reduce((acc, item) => acc + item.allocatedAmount || 0, 0)
            }
            setTotalAllocated(amount)
        }

        const handleShowBudgetBreakdown = async () => {
            const budgetId = budgetSummary.budgetId
            try {
                const res = await axiosInstance.get("/v1/expenses/budget-allocate", {
                    params: {
                        budgetId: budgetId
                    }
                })
                if (res.data) {
                    setBudgetBreakdownData((prev) => ({
                        ...prev,
                        amount: res.data.amount,
                        remaining: (prev?.amount ?? 0) - budgetSummary.totalExpense,
                        categories: res.data.categories,
                        month: res.data.month,
                        year: res.data.year,
                    }))
                    calculateTotalAllocatedAmount()
                }
            } catch (error) {
                console.log(error)
            } finally {
                setShowBudgetBreakdownDialog(true)
            }
        }

        useEffect(() => {
            calculateTotalAllocatedAmount()
        }, [budgetBreakdownData])

        return (
            <>
                <Collapsible
                    open={isBudgetOpen}
                    onOpenChange={setIsBudgetOpen}
                    className="w-full h-full"
                >
                    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden flex flex-col">
                        <CollapsibleTrigger asChild>
                            <button className="w-full flex items-center justify-between px-5 py-4 bg-grey-x100 dark:bg-card hover:bg-grey-x200 dark:hover:bg-accent/10 transition-colors">
                                <div className="flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground">
                                    Budget Breakdown
                                    <ChevronsUpDown className='w-4 h-4 text-muted-foreground' />
                                </div>
                            </button>
                        </CollapsibleTrigger>

                        <CollapsibleContent>
                            {budgetSummary.amount ?
                                <div className="flex flex-col gap-1 p-3">
                                    {/* Summary Cards */}
                                    <div className="rounded-lg px-4 h-[60px] mb-1 border bg-warning/5 border-warning/30 flex items-center justify-between">
                                        <div>
                                            <div className="text-xs font-medium text-warning mb-1 uppercase tracking-wide">Budget Allocated</div>
                                            <div className="text-base font-bold text-warning">${budgetSummary.amount}</div>
                                        </div>
                                        <div className="rounded-lg border bg-muted/10 border-border/20 text-xs">
                                            <div className="font-medium mb-1 tracking-wide">Daily Limit ({daysLeft} days)</div>
                                            <div className="font-semibold text-foreground">${dailyBudget} / day</div>
                                        </div>

                                    </div>
                                    <div className="rounded-lg px-4 h-[60px] flex flex-col justify-center mb-1 border bg-error-x100 border-error/30 text-error">
                                        <div>
                                            <div className="text-xs font-medium mb-1 uppercase tracking-wide">Remaining</div>
                                            <div className="text-base font-semibold">${budgetSummary.remaining}</div>
                                        </div>
                                    </div>
                                    <div className="rounded-lg px-4 h-[60px] flex items-center justify-between border bg-primary-lite border-primary/20">
                                        <div>
                                            <div className="text-xs font-medium text-primary/70 mb-1 uppercase tracking-wide">Allocated to</div>
                                            <div className="text-sm text-primary">{budgetSummary.allocationCount} {budgetSummary.allocationCount === 1 ? 'Category' : 'Categories'}</div>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs font-medium text-primary border-primary/30 hover:bg-primary/10 transition"
                                            onClick={() => handleShowBudgetBreakdown()}
                                        >
                                            {budgetSummary.allocationCount > 0 ? 'See Details' : 'Allocate'}
                                        </Button>
                                    </div>

                                </div> :
                                <>
                                    {
                                        !isAddBudgetMenuOpen ?
                                            <div className='flex flex-col justify-center items-center p-4 text-sm font-medium '>
                                                <div>No budget set for this month</div>
                                                {!historyMode && <div>
                                                    <Button
                                                        className='text-primary underline-offset-2 underline font-semibold' variant="ghost"
                                                        onClick={() => setAddBudgetMenuOpen(true)}
                                                    >
                                                        Add Budget
                                                    </Button>
                                                </div>}
                                            </div>
                                            :
                                            <div className='flex gap-4 p-6'>
                                                <Input type='number' placeholder="Enter amount more than 0"
                                                    value={newBudgetAmount}
                                                    onChange={(e) =>
                                                        setNewBudgetAmount(e.target.value)
                                                    }
                                                    className="flex-1 placeholder:text-muted-foreground text-sm"
                                                />
                                                <Button size="default" onClick={handleAddNewBudget}>Allocate</Button>
                                            </div>
                                    }
                                </>
                            }
                        </CollapsibleContent>
                    </div>
                </Collapsible>

                <BudgetBreakdownDialog
                    open={showBudgetBreakdownDialog}
                    onOpenChange={setShowBudgetBreakdownDialog}
                    budgetBreakdownData={budgetBreakdownData}
                    totalAllocated={totalAllocated}
                    budgetSummary={budgetSummary}
                    categories={categories}
                    historyMode={historyMode}
                    onDataRefresh={handleShowBudgetBreakdown}
                />
            </>
        )
    }

export default BudgetSummary
