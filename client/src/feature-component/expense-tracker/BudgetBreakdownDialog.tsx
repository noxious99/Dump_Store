import React, { useState } from 'react'
import { Pencil } from "lucide-react"
import { TiTick } from "react-icons/ti"
import { IoClose } from "react-icons/io5"
import { Input } from "@/components/ui/input"
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
    DialogHeader,
} from '@/components/ui/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { categoryEmojiMap } from '@/utils/constant'
import axiosInstance from '@/utils/axiosInstance'

interface Category {
    _id: string
    allocatedAmount: number
}

interface BudgetBreakdownData {
    amount: number
    remaining: number
    month: string
    year: string
    categories: Category[]
}

interface BudgetBreakdownDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    budgetBreakdownData: BudgetBreakdownData | null
    totalAllocated: number
    budgetSummary: any
    categories: any
    historyMode: boolean
    onDataRefresh: () => void
}

const GRADIENT_CLASSES = [
    'bg-gradient-to-r from-chart-2 to-info',
    'bg-gradient-to-r from-chart-3 to-chart-5',
    'bg-gradient-to-r from-chart-1 to-warning',
    'bg-gradient-to-r from-chart-4 to-success',
]

const BudgetBreakdownDialog: React.FC<BudgetBreakdownDialogProps> = ({
    open,
    onOpenChange,
    budgetBreakdownData,
    totalAllocated,
    budgetSummary,
    categories,
    historyMode,
    onDataRefresh,
}) => {
    const [editModeActive, setEditModeActive] = useState<string | null>(null)
    const [updatedAllocationAmount, setUpdatedAllocationAmount] = useState("")
    const [showAddCategory, setShowAddCategory] = useState(false)
    const [newAllocation, setNewAllocation] = useState({ categoryId: "", amount: "" })

    const totalBudgetAmount = budgetBreakdownData?.amount ?? 0

    const handleAllocationEditMode = (category: any) => {
        setEditModeActive(category._id)
        setUpdatedAllocationAmount(category.allocatedAmount)
    }

    const saveUpdatedAllocation = async (val: string) => {
        try {
            const category: any = budgetBreakdownData?.categories.find((c: any) => c._id === val)
            const payload = {
                categoryId: category?.categoryId,
                budgetId: category?.budgetId,
                amount: updatedAllocationAmount
            }
            await axiosInstance.patch("/v1/expenses/budget-allocate", payload)
            onDataRefresh()
        } catch (error: any) {
            toast(error?.msg)
        } finally {
            setEditModeActive(null)
            setUpdatedAllocationAmount("")
        }
    }

    const handleAddNewAllocation = async () => {
        try {
            const payload = {
                budgetId: budgetSummary.budgetId,
                categoryId: newAllocation.categoryId,
                allocatedAmount: newAllocation.amount
            }
            await axiosInstance.post('/v1/expenses/budget-allocate', payload)
            onDataRefresh()
        } catch (error: any) {
            toast.error(error?.msg)
        } finally {
            setNewAllocation({ categoryId: "", amount: "" })
            setShowAddCategory(false)
        }
    }

    const getGradientClass = (index: number) => GRADIENT_CLASSES[index % GRADIENT_CLASSES.length]

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[95vw] sm:max-w-[440px] lg:max-w-[500px] rounded-xl sm:rounded-xl p-0 gap-0 flex flex-col max-h-[85vh]">

                {/* Fixed Header */}
                <div className="px-5 pt-5 pb-4 shrink-0">
                    <DialogHeader>
                        <DialogTitle className="text-base font-semibold">
                            {budgetBreakdownData?.month}, {budgetBreakdownData?.year}
                        </DialogTitle>
                        <DialogDescription className="text-xs">
                            Manage your monthly budget allocation
                        </DialogDescription>
                    </DialogHeader>

                    {/* Budget Summary Card */}
                    <div className="rounded-lg border border-primary/20 bg-primary-lite px-3 py-2.5 mt-3">
                        <div className="flex items-center justify-between mb-2">
                            <div>
                                <p className="text-xs font-medium text-primary/70 uppercase tracking-wide mb-0.5">Total Budget</p>
                                <p className="text-base font-bold text-primary">${totalBudgetAmount}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-0.5">Remaining</p>
                                <p className="text-sm font-semibold text-foreground">${budgetSummary.remaining}</p>
                            </div>
                        </div>
                        <div className="relative h-2 bg-grey-x100 dark:bg-border/30 rounded-full overflow-hidden">
                            <div
                                className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-700"
                                style={{ width: `${totalBudgetAmount > 0 ? Math.min((totalAllocated / totalBudgetAmount) * 100, 100) : 0}%` }}
                            />
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1">
                            ${totalAllocated} of ${totalBudgetAmount} allocated
                        </p>
                    </div>
                </div>

                {/* Section Label - fixed between header and scroll */}
                <div className="px-5 pt-3 pb-2 border-t border-border shrink-0">
                    <p className="text-sm font-semibold text-foreground">Budget Breakdown</p>
                </div>

                {/* Scrollable Allocation List */}
                <div className="flex-1 overflow-y-auto px-5 min-h-0">
                    <div className="flex flex-col gap-2 pb-2">
                        {budgetBreakdownData?.categories.map((category: any, index: number) => {
                            const spentPercentage = category.allocatedAmount > 0
                                ? (category.spent / category.allocatedAmount) * 100
                                : 0
                            const remainingPercentage = 100 - spentPercentage
                            const percentageOfTotal = totalBudgetAmount > 0
                                ? (category.allocatedAmount / totalBudgetAmount) * 100
                                : 0

                            return (
                                <div key={category._id || index} className="rounded-lg border border-border bg-card px-3 py-2">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-foreground capitalize flex items-center gap-1.5">
                                            <span className="text-base">{categoryEmojiMap[category.categoryName] || "🔀"}</span>
                                            {category.categoryName}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            {editModeActive === category._id ? (
                                                <input
                                                    type="number"
                                                    placeholder="Amount"
                                                    value={updatedAllocationAmount}
                                                    onChange={(e) => setUpdatedAllocationAmount(e.target.value)}
                                                    className="px-2 py-1 w-[100px] rounded-md placeholder:text-muted-foreground text-sm border border-primary bg-transparent focus:outline-none focus:ring-1 focus:ring-primary"
                                                />
                                            ) : (
                                                <div className="text-right">
                                                    <span className="text-xs text-muted-foreground">${category.spent.toFixed(2)}</span>
                                                    <span className="text-xs text-muted-foreground mx-1">/</span>
                                                    <span className="text-sm font-semibold text-foreground">${category.allocatedAmount.toFixed(2)}</span>
                                                </div>
                                            )}
                                            {!historyMode && (
                                                editModeActive === category._id ? (
                                                    <div className="flex gap-1">
                                                        <button
                                                            className="p-0.5 hover:bg-success/10 rounded transition-colors"
                                                            onClick={() => saveUpdatedAllocation(category._id)}
                                                        >
                                                            <TiTick className="w-5 h-5 text-success" />
                                                        </button>
                                                        <button
                                                            className="p-0.5 hover:bg-error/10 rounded transition-colors"
                                                            onClick={() => setEditModeActive(null)}
                                                        >
                                                            <IoClose className="w-5 h-5 text-error" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        className="p-1 hover:bg-accent rounded transition-colors"
                                                        onClick={() => handleAllocationEditMode(category)}
                                                    >
                                                        <Pencil className="w-3 h-3 text-muted-foreground" />
                                                    </button>
                                                )
                                            )}
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="relative h-2 bg-grey-x100 dark:bg-border/30 rounded-full overflow-hidden">
                                        <div
                                            className={`absolute top-0 left-0 h-full rounded-full transition-all duration-700 ${getGradientClass(index)}`}
                                            style={{ width: `${Math.min(spentPercentage, 100)}%` }}
                                        />
                                        {remainingPercentage > 0 && (
                                            <div
                                                className={`absolute top-0 h-full rounded-full transition-all duration-700 opacity-30 ${getGradientClass(index)}`}
                                                style={{
                                                    left: `${spentPercentage}%`,
                                                    width: `${Math.min(remainingPercentage, 100 - spentPercentage)}%`
                                                }}
                                            />
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between mt-1">
                                        <p className="text-xs text-muted-foreground">{percentageOfTotal.toFixed(1)}% of total</p>
                                        <p className={`text-xs font-medium ${spentPercentage >= 100 ? 'text-error' :
                                            spentPercentage >= 80 ? 'text-warning' :
                                                'text-success'
                                            }`}>
                                            ${category.remaining.toFixed(2)} left
                                        </p>
                                    </div>
                                </div>
                            )
                        })}

                        {(!budgetBreakdownData?.categories || budgetBreakdownData.categories.length === 0) && (
                            <div className="flex flex-col items-center justify-center py-8">
                                <p className="text-sm text-muted-foreground">No allocations yet. Split your budget into categories.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Fixed Footer */}
                <div className="px-5 pb-5 pt-3 border-t border-border shrink-0 space-y-3">
                    {showAddCategory && (
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                            <Select
                                value={newAllocation.categoryId}
                                onValueChange={(value) => setNewAllocation({ ...newAllocation, categoryId: value })}
                            >
                                <SelectTrigger className="text-xs flex-1 border border-border rounded-lg bg-muted">
                                    <SelectValue placeholder="Category" />
                                </SelectTrigger>
                                <SelectContent className="bg-card text-foreground border-border rounded-lg shadow-lg">
                                    {categories.map((option: any) => (
                                        <SelectItem key={option._id} value={option._id} className="capitalize">
                                            {categoryEmojiMap[option.name]} {option.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <div className="flex items-center gap-2">
                                <Input
                                    type="number"
                                    placeholder="Amount"
                                    value={newAllocation.amount}
                                    onChange={(e) => setNewAllocation({ ...newAllocation, amount: e.target.value })}
                                    className="flex-1 placeholder:text-muted-foreground text-sm"
                                />
                                <Button size="sm" onClick={handleAddNewAllocation} disabled={historyMode}>Add</Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 shrink-0 hover:bg-error/10 hover:text-error"
                                    onClick={() => { setShowAddCategory(false); setNewAllocation({ categoryId: "", amount: "" }) }}
                                >
                                    <IoClose className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    )}

                    <div className="rounded-lg border border-dashed border-border bg-muted/30 px-3 py-2.5 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-foreground">Unallocated</p>
                            <p className="text-xs text-muted-foreground">${totalBudgetAmount - totalAllocated} remaining</p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={() => setShowAddCategory(true)}
                            disabled={showAddCategory || historyMode}
                        >
                            Split More
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default BudgetBreakdownDialog
