import React, { useEffect, useState } from 'react'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Wallet, UtensilsCrossed, ArrowRight, Target, Loader2Icon } from 'lucide-react'
import { AlertTriangle, } from 'lucide-react'
import axiosInstance from '@/utils/axiosInstance';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

const ExpenseSummaryCard: React.FC = () => {
    const [walletBalance, setWalletBalance] = useState(0)
    const [totalSpend, setTotalSpend] = useState(0)
    const [usedPercent, setUsedPercent] = useState(0)
    const [budget, setBudget] = useState(0)
    const [topSpendCategory, setTopSpendCategory] = useState({
        name: "",
        amount: 0
    })
    const [daysLeft, setDaysLeft] = useState(0)
    const [showAddBudgetDialog, setShowAddBudgetDialog] = useState(false)
    const [newBudgetAmount, setNewBudgetAmount] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const fetchSummary = async () => {
        try {
            const res = await axiosInstance.get("/v1/expenses/dashboard-summary")

            const totalIncomeAmount = res.data?.totalIncome?.amount || 0
            const totalSpendAmount = res.data?.totalSpend?.amount || 0
            const budgetAmount = res.data?.budget?.amount || 0
            const topCategory = res.data?.topCategory[0] || { category: "None", amount: 0 }

            const balance = totalIncomeAmount - totalSpendAmount
            const calculatedUsedPercent = budgetAmount > 0
                ? Math.round((totalSpendAmount / budgetAmount) * 100)
                : 0

            setWalletBalance(balance)
            setTotalSpend(totalSpendAmount)
            setBudget(budgetAmount)
            setTopSpendCategory({
                name: topCategory.category || "None",
                amount: topCategory.amount || 0
            })
            setUsedPercent(calculatedUsedPercent)
        } catch (error) {
            console.error("Error fetching expense summary:", error)
        }
    }

    useEffect(() => {
        const now = new Date()
        const currentDay = now.getDate();
        const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const calculatedDaysLeft = lastDayOfMonth - currentDay;
        setDaysLeft(calculatedDaysLeft)

        fetchSummary()
    }, [])

    const handleNewBudgetSubmit = async (e: any) => {
        e.preventDefault()
        try {
            setIsLoading(true)
            const body = {
                amount: newBudgetAmount
            }
            await axiosInstance.post("/v1/expenses/monthly-budget", body)
            setNewBudgetAmount("")
            await fetchSummary()
        } catch (error) {
            console.log(error)
        } finally {
            setIsLoading(false)
            setShowAddBudgetDialog(false)
        }
    }

    const remainingBudget = budget - totalSpend
    const dailyBudget = daysLeft > 0 ? (remainingBudget / daysLeft).toFixed(2) : "0.00"
    const categoryPercent = totalSpend > 0
        ? Math.floor((topSpendCategory.amount / totalSpend) * 100)
        : 0

    return (
        <>
            <Card className='w-full max-w-none border-border hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-grey-x100/20 h-full flex flex-col'>
                <CardHeader className="pb-3 px-4 sm:px-6">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="p-2 sm:p-2.5 bg-primary/10 rounded-xl flex-shrink-0">
                            <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                        </div>
                        <div className='min-w-0 flex-1'>
                            <CardTitle className="text-base sm:text-lg md:text-xl font-semibold text-foreground truncate leading-tight">
                                Expense Tracker
                            </CardTitle>
                            <CardDescription className={`font-medium text-xs sm:text-sm md:text-base leading-tight ${usedPercent > 90 ? 'text-error' : usedPercent > 70 ? 'text-warning' : 'text-success'
                                }`}>
                                {usedPercent > 90 ? 'Budget Alert!' : usedPercent > 70 ? 'Watch Spending' : 'Everything in Budget!'}
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-2 sm:space-y-3 px-4 sm:px-6 py-1 sm:py-2 flex-1">
                    {/* Wallet Balance */}
                    <div className="py-2 sm:py-3">
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Wallet className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                <span className="font-medium text-xs sm:text-sm">Wallet Balance</span>
                            </div>
                            <span className={`font-bold text-base sm:text-lg md:text-xl ${walletBalance < 0 ? 'text-error' : 'text-success'
                                }`}>
                                ${walletBalance.toFixed(0)}
                            </span>
                        </div>
                    </div>

                    {/* Monthly Budget Progress */}
                    <div className="py-2 sm:py-3 border-b border-border/50">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Target className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                <span className="font-medium text-xs sm:text-sm">Monthly Budget</span>
                            </div>
                            <div className="text-right">
                                <span className="font-bold text-base sm:text-lg md:text-xl text-foreground flex items-end">
                                    ${totalSpend.toFixed(0)}
                                </span>
                                <div className="text-xs text-muted-foreground">
                                    of ${budget.toFixed(0)}
                                </div>
                            </div>
                        </div>

                        {/* Progress Bar Container */}
                        {budget > 0 ? (
                            <div className="bg-muted/30 p-3 rounded-md">
                                <div className="w-full bg-grey-x200 rounded-full h-2 mb-2">
                                    <div
                                        className={`h-2 rounded-full transition-all duration-300 ${usedPercent > 90 ? 'bg-error' : usedPercent > 70 ? 'bg-warning' : 'bg-primary'
                                            }`}
                                        style={{ width: `${Math.min(usedPercent, 100)}%` }}
                                    ></div>
                                </div>
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>{usedPercent}% used</span>
                                    <span>${remainingBudget.toFixed(0)} left</span>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-muted/30 p-2 rounded-md text-center text-xs text-muted-foreground flex flex-col gap-1 justify-center">
                                No budget set
                                <Button
                                    variant="link"
                                    className='text-primary underline underline-offset-2 h-auto p-0 text-xs inline'
                                    onClick={() => setShowAddBudgetDialog(true)}
                                >
                                    Add This Month Budget
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Top Category */}
                    {topSpendCategory.name && topSpendCategory.amount > 0 ? (
                        <div className="py-2 sm:py-3">
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <UtensilsCrossed className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                    <span className="font-medium text-xs sm:text-sm">Top Category</span>
                                </div>
                                <span className="font-bold text-base sm:text-lg text-warning capitalize">
                                    {topSpendCategory.name}
                                </span>
                            </div>
                            <div className="flex justify-end">
                                <div className="text-xs sm:text-sm text-muted-foreground bg-muted/30 px-2 py-1 rounded-md">
                                    ${topSpendCategory.amount.toFixed(0)} ({categoryPercent}%)
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="py-2 sm:py-3 text-center text-xs text-muted-foreground">
                            No spending data yet
                        </div>
                    )}

                    {/* Smart Insights - Mobile Optimized */}
                    {budget > 0 && remainingBudget > 0 && daysLeft > 0 && (
                        <div className="pt-2 sm:pt-3">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs sm:text-sm font-medium text-muted-foreground">Budget Alert</span>
                                <span className={`text-xs sm:text-sm font-medium px-2 py-1 rounded-md ${usedPercent > 90
                                    ? 'text-error bg-error/10'
                                    : usedPercent > 70
                                        ? 'text-warning bg-warning/10'
                                        : 'text-success bg-success/10'
                                    }`}>
                                    {usedPercent > 90 ? 'Critical' : usedPercent > 70 ? 'Watch spending' : 'On track'}
                                </span>
                            </div>
                            <div className={`p-3 rounded-md border ${usedPercent > 90
                                ? 'bg-error/10 border-error/20'
                                : 'bg-warning/10 border-warning/20'
                                }`}>
                                <div className="flex items-start gap-2">
                                    <AlertTriangle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${usedPercent > 90 ? 'text-error' : 'text-warning'
                                        }`} />
                                    <div className="min-w-0 flex-1">
                                        <div className={`text-xs font-medium mb-1 ${usedPercent > 90 ? 'text-error' : 'text-warning'
                                            }`}>
                                            Daily Budget Alert
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            ${dailyBudget} per day for next {daysLeft} day{daysLeft !== 1 ? 's' : ''}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>

                <CardFooter className="pt-3 sm:pt-4 mt-auto px-4 sm:px-6 pb-4 sm:pb-6">
                    <button
                        onClick={() => window.location.href = '/expense-tracker'}
                        className="w-full group flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 active:bg-primary/80 text-primary-foreground px-4 py-3 sm:py-3.5 rounded-lg transition-all duration-200 font-medium shadow-sm hover:shadow-md text-sm sm:text-base touch-manipulation"
                    >
                        <span>Manage Expenses</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200 flex-shrink-0" />
                    </button>
                </CardFooter>
            </Card>


            <Dialog open={showAddBudgetDialog} onOpenChange={setShowAddBudgetDialog}>
                <DialogContent className="sm:max-w-[425px]">
                    <form onSubmit={handleNewBudgetSubmit}>
                        <DialogHeader>
                            <DialogTitle>Set Your Monthly Budget</DialogTitle>
                            <DialogDescription className='text-xs'>
                                Define your spending limit
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 my-4">
                            <div className="grid gap-3">
                                <Input
                                    id="budgetAmount"
                                    type="number"
                                    placeholder="Enter amount, e.g. 5000"
                                    value={newBudgetAmount}
                                    onChange={(e) => setNewBudgetAmount(e.target.value)}
                                />
                            </div>
                        </div>

                        <DialogFooter className='flex flex-col gap-2 mt-4'>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2Icon className="animate-spin mr-2" />
                                        Save as Monthly Budget
                                    </>
                                ) : (
                                    <p>Save as Monthly Budget</p>
                                )}
                            </Button>
                            <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                            </DialogClose>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>

    )
}

export default ExpenseSummaryCard