import React, { useState } from 'react'
import { ChevronsUpDown } from "lucide-react"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"

import type { ExpenseDetails } from '@/types/expenseTracker'

const BalanceOverview: React.FC<{ expenseData: ExpenseDetails }> = ({ expenseData }) => {
    const [isBalanceOpen, setIsBalanceOpen] = useState(true)

    const totalIncome = expenseData?.totalIncome?.amount ?? 0
    const totalSpend = expenseData?.totalSpend?.amount ?? 0
    const walletBalance = totalIncome - totalSpend

    return (
        <>
            <Collapsible
                open={isBalanceOpen}
                onOpenChange={setIsBalanceOpen}
                className="w-full max-w-[400px] max-h-[380px]"
            >
                <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden flex flex-col">
                    <CollapsibleTrigger asChild>
                        <button className="w-full flex items-center justify-between px-5 py-4 bg-grey-x100 dark:bg-card hover:bg-grey-x200 dark:hover:bg-accent/10 transition-colors">
                            <div className="flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground">
                                Balance Overview
                                <ChevronsUpDown className='w-4 h-4 text-muted-foreground' />
                            </div>
                        </button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <div className="flex flex-col gap-2 p-3">
                            <div className={`rounded-lg px-5 py-2 border ${walletBalance < 50
                                    ? 'bg-warning/10 border-warning/20 dark:bg-warning/10'
                                    : 'bg-success-x100 border-success/20 dark:bg-success/10'
                                }`}>
                                <div className={`text-xs font-medium mb-1 uppercase tracking-wide ${walletBalance < 50
                                        ? 'text-warning/70 dark:text-warning/60'
                                        : 'text-success/70 dark:text-success/60'
                                    }`}>
                                    Wallet Balance
                                </div>
                                <div className={`text-lg font-bold ${walletBalance < 50
                                        ? 'text-warning dark:text-warning'
                                        : 'text-success dark:text-success'
                                    }`}>
                                    ${walletBalance}
                                </div>
                            </div>
                            <div className="rounded-lg bg-error-x100 dark:bg-error/10 px-5 py-2 border border-error/20">
                                <div className="text-xs font-medium text-error/70 dark:text-error/60 mb-1 uppercase tracking-wide">
                                    Total Expense
                                </div>
                                <div className="text-lg font-bold text-error dark:text-error">
                                    ${totalSpend}
                                </div>
                            </div>
                            <div className="rounded-lg bg-primary-lite dark:bg-primary/10 px-5 py-2 border border-primary/20">
                                <div className="text-xs font-medium text-primary/70 dark:text-primary/60 mb-1 uppercase tracking-wide">
                                    Total Income
                                </div>
                                <div className="text-lg font-bold text-primary dark:text-primary">
                                    ${totalIncome}
                                </div>
                            </div>
                        </div>
                    </CollapsibleContent>
                </div>
            </Collapsible>
        </>
    )
}

export default BalanceOverview