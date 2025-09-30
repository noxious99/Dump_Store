import React, { useEffect, useState } from 'react'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Wallet, UtensilsCrossed, ArrowRight, Target } from 'lucide-react'
import { AlertTriangle, } from 'lucide-react'
import axiosInstance from '@/utils/axiosInstance';

let daysLeft = 0
const now = new Date()
const currentDay = now.getDate();
const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
daysLeft = lastDayOfMonth - currentDay;

const ExpenseSummaryCard: React.FC = () => {
    const [walletBalance, setWalletBalance] = useState(0)
    const [totalSpend, setTotalSpend] = useState(0)
    const [usedPercent, setUsedPercent] = useState(0)
    const [budget, setBudget] = useState(0)
    const [topSpendCategory, setTopSpendCategory] = useState({
        name: "",
        amount: 0
    })

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                let res = await axiosInstance.get("/v1/expenses/dashboard-summary")
                let balance = res.data["totalIncome"].amount - res.data["totalSpend"].amount
                let totalSpend = res.data["totalSpend"].amount
                let budget = res.data["budget"].amount
                let topCategory = res.data["topCategory"]
                let usedPercent = Math.round((totalSpend / budget) * 100);
                setWalletBalance(balance)
                setTotalSpend(totalSpend)
                setBudget(budget)
                setTopSpendCategory({ name: topCategory.category, amount: topCategory.amount })
                setUsedPercent(usedPercent)
            } catch (error) {
                console.log(error)
            }
        }
        fetchSummary()
    }, [])


    return (
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
                        <CardDescription className="text-success font-medium text-xs sm:text-sm md:text-base leading-tight">
                            Everything in Budget!
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
                        <span className="font-bold text-base sm:text-lg md:text-xl text-success">{walletBalance}</span>
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
                            <span className="font-bold text-base sm:text-lg md:text-xl text-foreground">${totalSpend}</span>
                            <div className="text-xs text-muted-foreground">${budget}</div>
                        </div>
                    </div>

                    {/* Progress Bar Container */}
                    <div className="bg-muted/30 p-3 rounded-md">
                        <div className="w-full bg-grey-x200 rounded-full h-2 mb-2">
                            <div
                                className="bg-primary h-2 rounded-full transition-all duration-300"
                                style={{ width: `${usedPercent}%` }}
                            ></div>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{usedPercent}% used</span>
                            <span>${budget - totalSpend} left</span>
                        </div>
                    </div>
                </div>

                {/* Top Category */}
                <div className="py-2 sm:py-3">
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <UtensilsCrossed className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                            <span className="font-medium text-xs sm:text-sm">Top Category</span>
                        </div>
                        <span className="font-bold text-base sm:text-lg text-warning">{topSpendCategory.name}</span>
                    </div>
                    <div className="flex justify-end">
                        <div className="text-xs sm:text-sm text-muted-foreground bg-muted/30 px-2 py-1 rounded-md">
                            ${topSpendCategory.amount} ({Math.floor((topSpendCategory.amount / totalSpend) * 100)}%)
                        </div>
                    </div>
                </div>

                {/* Smart Insights - Mobile Optimized */}
                <div className="pt-2 sm:pt-3">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs sm:text-sm font-medium text-muted-foreground">Budget Alert</span>
                        <span className="text-xs sm:text-sm text-warning font-medium bg-warning/10 px-2 py-1 rounded-md">
                            Watch spending
                        </span>
                    </div>
                    <div className="bg-warning/10 p-3 rounded-md border border-warning/20">
                        <div className="flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                                <div className="text-xs font-medium text-warning mb-1">Daily Budget Alert</div>
                                <div className="text-xs text-muted-foreground">
                                    ${(budget - totalSpend)/daysLeft} per day for next {daysLeft} days
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
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
    )
}

export default ExpenseSummaryCard