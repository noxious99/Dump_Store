import { Button } from '@/components/ui/button'
import { FaCaretLeft } from "react-icons/fa6";
import { FaCaretRight } from "react-icons/fa6";
import React, { useState } from 'react'
import { ChevronsUpDown } from "lucide-react"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"

const ExpenseTracker: React.FC = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const handleMonthChange = (direction: "left" | "right") => {
        setCurrentDate(prevDate => {
            const newMonth = direction === "right" ? prevDate.getMonth() + 1 : prevDate.getMonth() - 1;
            return new Date(prevDate.getFullYear(), newMonth);
        });
    };
    const formattedMonth = currentDate.toLocaleString("default", { month: "short", year: "numeric" });

    const [isBalanceOpen, setIsBalanceOpen] = useState(true)
    const [isSummaryOpen, setIsSummaryOpen] = useState(true)

    return (
        <>
            <div className='p-4 md:p-6 flex flex-col items-center max-w-7xl mx-auto'>
                <div className='text-2xl font-semibold mb-6 text-foreground'>Expense Tracker</div>

                <div className='flex justify-between items-center w-full mb-4 md:mb-6'>
                    <div className='flex items-center gap-3'>
                        <button
                            onClick={() => handleMonthChange("left")}
                            className='p-2 hover:bg-primary-lite dark:hover:bg-primary/20 rounded-lg transition-colors'
                        >
                            <FaCaretLeft className='text-primary text-xl' />
                        </button>
                        <div className='px-4 py-2 bg-card border border-border rounded-lg font-medium text-foreground min-w-[120px] text-center'>
                            {formattedMonth}
                        </div>
                        <button
                            onClick={() => handleMonthChange("right")}
                            className='p-2 hover:bg-primary-lite dark:hover:bg-primary/20 rounded-lg transition-colors'
                        >
                            <FaCaretRight className='text-primary text-xl' />
                        </button>
                    </div>
                    <div className='flex flex-col md:flex-row items-center gap-3'>
                        <Button className='bg-success hover:bg-success/90 text-white font-medium shadow-sm'>
                            Add to Wallet
                        </Button>
                        <Button className='bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-sm'>
                            Add Expense
                        </Button>
                    </div>
                </div>

                <div className='flex flex-col md:flex-row gap-4 w-full mb-6'>
                    {/* Balance Overview */}
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
                                    <div className="rounded-lg bg-success-x100 dark:bg-success/10 px-5 py-2 border border-success/20">
                                        <div className="text-xs font-medium text-success/70 dark:text-success/60 mb-1 uppercase tracking-wide">
                                            Wallet Balance
                                        </div>
                                        <div className="text-lg font-bold text-success dark:text-success">
                                            $1,200
                                        </div>
                                    </div>
                                    <div className="rounded-lg bg-error-x100 dark:bg-error/10 px-5 py-2 border border-error/20">
                                        <div className="text-xs font-medium text-error/70 dark:text-error/60 mb-1 uppercase tracking-wide">
                                            Total Expense
                                        </div>
                                        <div className="text-lg font-bold text-error dark:text-error">
                                            $1,200
                                        </div>
                                    </div>
                                    <div className="rounded-lg bg-primary-lite dark:bg-primary/10 px-5 py-2 border border-primary/20">
                                        <div className="text-xs font-medium text-primary/70 dark:text-primary/60 mb-1 uppercase tracking-wide">
                                            Net Balance
                                        </div>
                                        <div className="text-lg font-bold text-primary dark:text-primary">
                                            $0
                                        </div>
                                    </div>
                                </div>
                            </CollapsibleContent>
                        </div>
                    </Collapsible>

                    {/* Expense Summary */}
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
                            <CollapsibleContent>
                                <div className="flex flex-col p-5 gap-5">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="font-semibold text-foreground">Food</span>
                                            <span className="text-sm font-medium text-muted-foreground">$1,200</span>
                                        </div>
                                        <div className="relative h-3 bg-grey-x100 dark:bg-border/30 rounded-full overflow-hidden">
                                            <div
                                                className="absolute top-0 left-0 h-full bg-gradient-to-r from-chart-1 to-warning rounded-full transition-all duration-700 ease-out shadow-sm"
                                                style={{ width: `50%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="font-semibold text-foreground">Cloth</span>
                                            <span className="text-sm font-medium text-muted-foreground">$1,200</span>
                                        </div>
                                        <div className="relative h-3 bg-grey-x100 dark:bg-border/30 rounded-full overflow-hidden">
                                            <div
                                                className="absolute top-0 left-0 h-full bg-gradient-to-r from-secondary to-chart-2 rounded-full transition-all duration-700 ease-out shadow-sm"
                                                style={{ width: `20%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="font-semibold text-foreground">Others</span>
                                            <span className="text-sm font-medium text-muted-foreground">$1,200</span>
                                        </div>
                                        <div className="relative h-3 bg-grey-x100 dark:bg-border/30 rounded-full overflow-hidden">
                                            <div
                                                className="absolute top-0 left-0 h-full bg-gradient-to-r from-chart-3 to-chart-5 rounded-full transition-all duration-700 ease-out shadow-sm"
                                                style={{ width: `30%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </CollapsibleContent>
                        </div>
                    </Collapsible>
                </div>
                {/* Expense List Section */}
                <div className='w-full'>
                    <div className='flex items-center justify-between mb-4'>
                        <h3 className='text-lg font-semibold text-foreground'>Recent Expenses</h3>
                        <span className='text-sm text-muted-foreground'>5 transactions</span>
                    </div>

                    <div className='space-y-2'>
                        {/* Expense Item Example */}
                        <div className='rounded-lg border border-border bg-card p-4 hover:shadow-md transition-shadow'>
                            <div className='flex items-center justify-between'>
                                <div className='flex items-center gap-3'>
                                    <div className='w-10 h-10 rounded-full bg-chart-1/10 flex items-center justify-center'>
                                        <span className='text-chart-1 font-semibold'>🍔</span>
                                    </div>
                                    <div>
                                        <div className='font-semibold text-foreground'>Lunch at Restaurant</div>
                                        <div className='text-xs text-muted-foreground'>Food • Sep 30, 2025</div>
                                    </div>
                                </div>
                                <div className='text-right'>
                                    <div className='font-bold text-error'>-$45.50</div>
                                </div>
                            </div>
                        </div>

                        {/* More expense items will be added here */}
                        <div className='rounded-lg border border-border bg-card p-4 hover:shadow-md transition-shadow'>
                            <div className='flex items-center justify-between'>
                                <div className='flex items-center gap-3'>
                                    <div className='w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center'>
                                        <span className='text-secondary font-semibold'>👕</span>
                                    </div>
                                    <div>
                                        <div className='font-semibold text-foreground'>New T-Shirt</div>
                                        <div className='text-xs text-muted-foreground'>Cloth • Sep 29, 2025</div>
                                    </div>
                                </div>
                                <div className='text-right'>
                                    <div className='font-bold text-error'>-$28.00</div>
                                </div>
                            </div>
                        </div>

                        <div className='rounded-lg border border-border bg-card p-4 hover:shadow-md transition-shadow'>
                            <div className='flex items-center justify-between'>
                                <div className='flex items-center gap-3'>
                                    <div className='w-10 h-10 rounded-full bg-chart-3/10 flex items-center justify-center'>
                                        <span className='text-chart-3 font-semibold'>🎮</span>
                                    </div>
                                    <div>
                                        <div className='font-semibold text-foreground'>Gaming Subscription</div>
                                        <div className='text-xs text-muted-foreground'>Others • Sep 28, 2025</div>
                                    </div>
                                </div>
                                <div className='text-right'>
                                    <div className='font-bold text-error'>-$15.99</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </>
    )
}

export default ExpenseTracker