import React, { useState } from 'react'
import { ChevronsUpDown } from "lucide-react"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"

import type { ExpenseDetails } from '@/types/expenseTracker'

const ExpenseSummary: React.FC<{ expenseData: ExpenseDetails }> = ({ expenseData }) => {
    const [isSummaryOpen, setIsSummaryOpen] = useState(true)

    const makeRoundNumber = (val: number): number => {
        return Math.floor(val)
    }

    const getGradientColors = (index: number): string => {
        const gradients = [
            'from-chart-1 to-warning',
            'from-secondary to-chart-2',
            'from-chart-3 to-chart-5',
            'from-chart-4 to-success',
            'from-primary to-chart-1',
            'from-chart-2 to-accent',
        ]
        return gradients[index % gradients.length]
    }

    const totalSpendAmount = expenseData?.totalSpend?.amount ?? 1

    return (
        <>
            <Collapsible
                open={isSummaryOpen}
                onOpenChange={setIsSummaryOpen}
                className="flex-1"
            >
                <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden flex flex-col">
                    <CollapsibleTrigger asChild>
                        <button className="w-full flex items-center justify-between px-5 py-4 bg-grey-x100 dark:bg-card hover:bg-grey-x200 dark:hover:bg-accent/10 transition-colors">
                            <div className="flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground">
                                Expense Summary
                                <ChevronsUpDown className='w-4 h-4 text-muted-foreground' />
                            </div>
                        </button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className='py-1'>
                        {expenseData?.topCategory?.length ? (
                            expenseData.topCategory.map((expense, index) => (
                                <div className="flex flex-col px-5 py-3 gap-5" key={expense.category}>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="font-semibold text-foreground capitalize">{expense.category}</span>
                                            <span className="text-sm font-medium text-muted-foreground">${expense.amount}</span>
                                        </div>
                                        <div className="relative h-3 bg-grey-x100 dark:bg-border/30 rounded-full overflow-hidden">
                                            <div
                                                className={`absolute top-0 left-0 h-full bg-gradient-to-r ${getGradientColors(index)} rounded-full transition-all duration-700 ease-out shadow-sm`}
                                                style={{ width: `${makeRoundNumber((expense.amount / totalSpendAmount) * 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-4 text-center text-sm text-muted-foreground">
                                No expenses recorded this month
                            </div>
                        )}
                    </CollapsibleContent>
                </div>
            </Collapsible>
        </>
    )
}

export default ExpenseSummary