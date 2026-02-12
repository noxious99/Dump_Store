import React, { useEffect, useState } from 'react'
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Wallet, ArrowRight, Target, TrendingUp } from 'lucide-react'
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
import { Link } from 'react-router-dom';

const SkeletonCard = () => (
    <Card className='bg-card border border-border rounded-xl h-full flex flex-col'>
        <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
            <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="skeleton w-9 h-9 sm:w-10 sm:h-10 rounded-lg" />
                <div className="skeleton h-5 w-32" />
            </div>
        </CardHeader>
        <CardContent className="flex-1 space-y-4 px-4 sm:px-6">
            <div className="skeleton h-14 w-full rounded-lg" />
            <div className="space-y-2">
                <div className="flex justify-between">
                    <div className="skeleton h-4 w-20" />
                    <div className="skeleton h-4 w-28" />
                </div>
                <div className="skeleton h-2 w-full rounded-full" />
            </div>
            <div className="skeleton h-10 w-full rounded-lg" />
        </CardContent>
        <CardFooter className="pt-3 px-4 sm:px-6">
            <div className="skeleton h-10 w-full rounded-lg" />
        </CardFooter>
    </Card>
)

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
    const [isSummaryLoading, setIsSummaryLoading] = useState(true)

    const fetchSummary = async () => {
        setIsSummaryLoading(true)
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
                name: topCategory.name || "None",
                amount: topCategory.amount || 0
            })
            setUsedPercent(calculatedUsedPercent)
        } catch (error) {
            console.error("Error fetching expense summary:", error)
        } finally {
            setIsSummaryLoading(false)
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

    const handleNewBudgetSubmit = async (e: React.FormEvent) => {
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
    const dailyBudget = daysLeft > 0 ? (remainingBudget / daysLeft).toFixed(0) : "0"
    const categoryPercent = totalSpend > 0
        ? Math.floor((topSpendCategory.amount / totalSpend) * 100)
        : 0

    const getStatusColor = () => {
        if (usedPercent > 90) return 'error'
        if (usedPercent > 70) return 'warning'
        return 'success'
    }

    const statusColor = getStatusColor()

    if (isSummaryLoading) return <SkeletonCard />

    return (
        <>
            <Card className='bg-card border border-border rounded-xl shadow-sm transition-colors duration-200 h-full flex flex-col'>
                {/* Header */}
                <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5 sm:gap-3">
                            <div className="p-2 sm:p-2.5 bg-primary/10 rounded-lg">
                                <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                            </div>
                            <CardTitle className="text-base sm:text-lg font-semibold text-foreground">
                                Expense Tracker
                            </CardTitle>
                        </div>
                        <span className={`text-[10px] sm:text-xs font-medium px-2.5 py-1 rounded-full bg-${statusColor}/10 text-${statusColor}`}>
                            {usedPercent > 90 ? 'Alert' : usedPercent > 70 ? 'Watch' : 'On Track'}
                        </span>
                    </div>
                </CardHeader>

                {/* Content */}
                <CardContent className="flex-1 space-y-3 sm:space-y-4 px-4 sm:px-6">
                    {/* Wallet Balance */}
                    <div className="flex items-center justify-between py-3 px-3 sm:px-4 bg-grey-x100 rounded-lg">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Wallet className="w-4 h-4" />
                            <span className="text-xs sm:text-sm font-medium">Balance</span>
                        </div>
                        <span className={`text-lg sm:text-xl font-bold tracking-tight ${walletBalance < 0 ? 'text-error' : 'text-foreground'}`}>
                            ${walletBalance.toLocaleString()}
                        </span>
                    </div>

                    {/* Monthly Budget Progress */}
                    <div className="space-y-2.5 sm:space-y-3">
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 text-muted-foreground shrink-0">
                                <Target className="w-4 h-4" />
                                <span className="text-xs sm:text-sm font-medium">Budget</span>
                            </div>
                            <div className="text-right min-w-0">
                                <span className="text-base sm:text-lg font-bold text-foreground tracking-tight">
                                    ${totalSpend.toLocaleString()}
                                </span>
                                <span className="text-xs sm:text-sm text-muted-foreground"> / ${budget.toLocaleString()}</span>
                            </div>
                        </div>

                        {budget > 0 ? (
                            <div className="space-y-2">
                                <div className="w-full bg-grey-x100 rounded-full h-2 overflow-hidden">
                                    <div
                                        className={`h-2 rounded-full transition-all duration-700 ease-out ${usedPercent > 90 ? 'bg-error' : usedPercent > 70 ? 'bg-warning' : 'bg-primary'}`}
                                        style={{ width: `${Math.min(usedPercent, 100)}%` }}
                                    />
                                </div>
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>{usedPercent}% used</span>
                                    <span>${remainingBudget.toLocaleString()} left</span>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-3 bg-grey-x100 rounded-lg">
                                <p className="text-sm text-muted-foreground mb-2">No budget set</p>
                                <Button
                                    variant="link"
                                    className='text-primary h-auto p-0 text-sm font-medium'
                                    onClick={() => setShowAddBudgetDialog(true)}
                                >
                                    Set Monthly Budget
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Top Category */}
                    {topSpendCategory.name && topSpendCategory.amount > 0 && (
                        <div className="flex items-center justify-between py-2.5 sm:py-3 border-t border-border">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <TrendingUp className="w-4 h-4" />
                                <span className="text-xs sm:text-sm font-medium">Top Category</span>
                            </div>
                            <div className="text-right">
                                <span className="text-xs sm:text-sm font-semibold text-foreground capitalize">
                                    {topSpendCategory.name}
                                </span>
                                <p className="text-[10px] sm:text-xs text-muted-foreground">
                                    ${topSpendCategory.amount.toLocaleString()} ({categoryPercent}%)
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Daily Budget Alert */}
                    {budget > 0 && remainingBudget > 0 && daysLeft > 0 && (
                        <div className={`p-2.5 sm:p-3 rounded-lg border ${usedPercent > 90 ? 'bg-error/5 border-error/20' : 'bg-warning/5 border-warning/20'}`}>
                            <p className={`text-[11px] sm:text-xs font-medium ${usedPercent > 90 ? 'text-error' : 'text-warning'}`}>
                                Daily Budget: ${dailyBudget}/day for {daysLeft} days
                            </p>
                        </div>
                    )}
                </CardContent>

                {/* Footer */}
                <CardFooter className="pt-3 sm:pt-4 mt-auto px-4 sm:px-6">
                    <Button asChild className="w-full rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground h-10 sm:h-11 active:scale-[0.98] transition-all duration-200">
                        <Link to="/expense-tracker" className="flex items-center justify-center gap-2">
                            <span className="text-sm">Manage Expenses</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </Button>
                </CardFooter>
            </Card>

            {/* Budget Dialog */}
            <Dialog open={showAddBudgetDialog} onOpenChange={setShowAddBudgetDialog}>
                <DialogContent className="sm:max-w-[400px] rounded-xl">
                    <form onSubmit={handleNewBudgetSubmit}>
                        <DialogHeader>
                            <DialogTitle>Set Monthly Budget</DialogTitle>
                            <DialogDescription>
                                Define your spending limit for this month.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="py-4">
                            <Input
                                type="number"
                                placeholder="Enter amount"
                                value={newBudgetAmount}
                                onChange={(e) => setNewBudgetAmount(e.target.value)}
                                className="h-12 bg-input border-border focus:border-primary rounded-lg"
                            />
                        </div>

                        <DialogFooter className="gap-2">
                            <DialogClose asChild>
                                <Button variant="outline" className="rounded-lg">Cancel</Button>
                            </DialogClose>
                            <Button type="submit" disabled={isLoading} className="rounded-lg bg-primary hover:bg-primary/90">
                                {isLoading ? 'Saving...' : 'Save Budget'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default ExpenseSummaryCard
