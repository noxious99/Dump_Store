import React, { useEffect, useState } from 'react'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { CalendarDays, TrendingDown, TrendingUp, Flag, Receipt } from 'lucide-react'
import axiosInstance from '@/utils/axiosInstance'
import moment from 'moment'

interface ExpenseRecord {
    _id: string
    amount: number
    createdAt: string
}

interface MileStone {
    isCompleted: boolean
    completedAt?: string
}

interface Goal {
    mileStone: MileStone[]
}

const SkeletonGrid = () => (
    <div className="grid grid-cols-2 gap-2 sm:gap-3">
        {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-2.5 sm:p-3 bg-grey-x100 rounded-lg">
                <div className="skeleton h-3 w-12 mb-2" />
                <div className="skeleton h-6 w-16 mb-1" />
                <div className="skeleton h-3 w-14" />
            </div>
        ))}
    </div>
)

const WeeklySummary: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true)
    const [weeklySpent, setWeeklySpent] = useState(0)
    const [weeklyExpenseCount, setWeeklyExpenseCount] = useState(0)
    const [budgetPace, setBudgetPace] = useState<{ amount: number; isUnder: boolean } | null>(null)
    const [milestonesThisWeek, setMilestonesThisWeek] = useState(0)

    useEffect(() => {
        const fetchWeeklyData = async () => {
            try {
                const weekStart = moment().startOf('isoWeek')
                const weekEnd = moment().endOf('isoWeek')
                const today = moment().format('YYYY-MM-DD')

                const [expenseRes, goalsRes] = await Promise.all([
                    axiosInstance.get(`/v1/expenses/details?date=${today}`),
                    axiosInstance.get('/v1/goals').catch(() => ({ data: { goals: [] } }))
                ])

                const allExpenses: ExpenseRecord[] = expenseRes.data?.expenseRecords || []
                const thisWeekExpenses = allExpenses.filter(e =>
                    moment(e.createdAt).isBetween(weekStart, weekEnd, undefined, '[]')
                )
                const totalSpent = thisWeekExpenses.reduce((sum, e) => sum + e.amount, 0)
                setWeeklySpent(totalSpent)
                setWeeklyExpenseCount(thisWeekExpenses.length)

                const budget = expenseRes.data?.monthlyBudget?.amount || expenseRes.data?.budget?.amount || 0
                if (budget > 0) {
                    const daysInMonth = moment().daysInMonth()
                    const dayOfMonth = moment().date()
                    const totalMonthSpent = expenseRes.data?.totalSpend?.amount || 0
                    const expectedPace = (budget / daysInMonth) * dayOfMonth
                    const diff = expectedPace - totalMonthSpent
                    setBudgetPace({
                        amount: Math.abs(Math.round(diff)),
                        isUnder: diff >= 0
                    })
                }

                const goals: Goal[] = goalsRes.data?.goals || []
                let weekMilestones = 0
                goals.forEach(goal => {
                    goal.mileStone?.forEach(ms => {
                        if (ms.isCompleted && ms.completedAt &&
                            moment(ms.completedAt).isBetween(weekStart, weekEnd, undefined, '[]')) {
                            weekMilestones++
                        }
                    })
                })
                setMilestonesThisWeek(weekMilestones)

            } catch (error) {
                console.error("Error fetching weekly summary:", error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchWeeklyData()
    }, [])

    const weekLabel = `${moment().startOf('isoWeek').format('MMM D')} - ${moment().endOf('isoWeek').format('MMM D')}`

    return (
        <Card className="bg-card border border-border rounded-xl shadow-none">
            <CardHeader className="pb-2 sm:pb-3 px-4 sm:px-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 sm:gap-3">
                        <div className="p-2 bg-secondary/10 rounded-lg">
                            <CalendarDays className="w-4 h-4 text-secondary" />
                        </div>
                        <CardTitle className="text-sm sm:text-base font-semibold text-foreground">
                            Weekly Recap
                        </CardTitle>
                    </div>
                    <span className="text-[10px] sm:text-xs text-muted-foreground bg-grey-x100 px-2 py-1 rounded-md">{weekLabel}</span>
                </div>
            </CardHeader>

            <CardContent className="px-3 sm:px-6">
                {isLoading ? (
                    <SkeletonGrid />
                ) : (
                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                        {/* Spent This Week */}
                        <div className="p-2.5 sm:p-3 bg-grey-x100 rounded-lg hover:bg-grey-x200/50 transition-colors duration-200">
                            <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                                <TrendingDown className="w-3.5 h-3.5 text-error" />
                                <span className="text-[10px] sm:text-xs text-muted-foreground font-medium">Spent</span>
                            </div>
                            <p className="text-base sm:text-lg font-bold text-foreground tracking-tight">${weeklySpent.toLocaleString()}</p>
                        </div>

                        {/* Budget Pace */}
                        <div className="p-2.5 sm:p-3 bg-grey-x100 rounded-lg hover:bg-grey-x200/50 transition-colors duration-200">
                            <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                                {budgetPace?.isUnder ? (
                                    <TrendingUp className="w-3.5 h-3.5 text-success" />
                                ) : (
                                    <TrendingDown className="w-3.5 h-3.5 text-error" />
                                )}
                                <span className="text-[10px] sm:text-xs text-muted-foreground font-medium">Budget</span>
                            </div>
                            {budgetPace ? (
                                <>
                                    <p className={`text-base sm:text-lg font-bold tracking-tight ${budgetPace.isUnder ? 'text-success' : 'text-error'}`}>
                                        {budgetPace.isUnder ? '-' : '+'}${budgetPace.amount.toLocaleString()}
                                    </p>
                                    <p className={`text-[10px] sm:text-xs ${budgetPace.isUnder ? 'text-success/80' : 'text-error/80'}`}>
                                        {budgetPace.isUnder ? 'under pace' : 'over pace'}
                                    </p>
                                </>
                            ) : (
                                <p className="text-xs sm:text-sm text-muted-foreground">No budget</p>
                            )}
                        </div>

                        {/* Milestones */}
                        <div className="p-2.5 sm:p-3 bg-grey-x100 rounded-lg hover:bg-grey-x200/50 transition-colors duration-200">
                            <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                                <Flag className="w-3.5 h-3.5 text-success" />
                                <span className="text-[10px] sm:text-xs text-muted-foreground font-medium">Milestones</span>
                            </div>
                            <p className="text-base sm:text-lg font-bold text-foreground tracking-tight">{milestonesThisWeek}</p>
                            <p className="text-[10px] sm:text-xs text-muted-foreground">completed</p>
                        </div>

                        {/* Expenses Logged */}
                        <div className="p-2.5 sm:p-3 bg-grey-x100 rounded-lg hover:bg-grey-x200/50 transition-colors duration-200">
                            <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                                <Receipt className="w-3.5 h-3.5 text-primary" />
                                <span className="text-[10px] sm:text-xs text-muted-foreground font-medium">Expenses</span>
                            </div>
                            <p className="text-base sm:text-lg font-bold text-foreground tracking-tight">{weeklyExpenseCount}</p>
                            <p className="text-[10px] sm:text-xs text-muted-foreground">logged</p>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

export default WeeklySummary
