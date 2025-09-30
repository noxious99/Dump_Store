import React, { useState } from 'react'
import { ChevronsUpDown } from "lucide-react"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"

const ExpenseSummary: React.FC = () => {
    const [isSummaryOpen, setIsSummaryOpen] = useState(true)
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
        </>
    )
}

export default ExpenseSummary