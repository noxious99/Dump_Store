import React, { useEffect, useState } from 'react'
import { ChevronsUpDown, Pencil, } from "lucide-react"
import { TiTick } from "react-icons/ti"
import { IoClose } from "react-icons/io5";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Input } from "@/components/ui/input"
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
    DialogFooter,
    DialogHeader
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
import { getDateInfo, getDaysLeftOfCurrentMonth } from '@/utils/utils-functions'
import axiosInstance from '@/utils/axiosInstance'

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

const BudgetSummary: React.FC<{ budgetData?: BudgetDetails, budgetSummary: any, onBudgetUpdate: any, categories: any }> = ({ budgetSummary, onBudgetUpdate, categories }) => {
    const [isBudgetOpen, setIsBudgetOpen] = useState(true)
    const [isAddBudgetMenuOpen, setAddBudgetMenuOpen] = useState(false)
    const [totalAllocated, setTotalAllocated] = useState<number>(0)
    const [editModeActive, setEditModeActive] = useState(null)
    const [updatedAllocationAmount, setUpdatedAllocationAmount] = useState("")
    const [newAllocation, setNewAllocation] = useState({
        categoryId: "",
        amount: 0
    })
    const [newBudgetAmount, setNewBudgetAmount] = useState<string>("")
    const [budgetBreakdownData, setBudgetBreakdownData] = useState<BudgetBreakdownData | null>({
        amount: 0,
        remaining: 0,
        month: "",
        year: "",
        categories: []
    })
    const [showBudgetBreakdownDialog, setShowBudgetBreakdownDialog] = useState(false)
    const [showAddCategory, setShowAddCategory] = useState(false)

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
        console.log(budgetBreakdownData)
        if (budgetBreakdownData) {
            amount = budgetBreakdownData.categories.reduce((acc, item) => acc + item.allocatedAmount || 0, 0)
        }
        setTotalAllocated(amount)
    }
    const handleAddNewAllocation = async () => {
        try {
            const payload = {
                budgetId: budgetSummary.budgetId,
                categoryId: newAllocation.categoryId,
                allocatedAmount: newAllocation.amount
            }
            await axiosInstance.post('/v1/expenses/budget-allocate', payload)
            handleShowBudgetBreakdown()
        } catch (error: any) {
            toast.error(error?.msg)
            console.log("hgdsh: ", error?.msg)
        } finally {
            setNewAllocation((prev) => ({
                ...prev,
                category: "",
                amount: 0,
            }))
            setShowAddCategory(false)
        }
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
    const handleAllocationEditMode = (category: any) => {
        setEditModeActive(category._id);
        setUpdatedAllocationAmount(category.allocatedAmount)
    }
    const saveUpdatedAllocation = async (val: string) => {
        try {
            const category: any = budgetBreakdownData?.categories.find(c => c._id === val )
            const payload = {
                categoryId: category?.categoryId,
                budgetId: category?.budgetId,
                amount: updatedAllocationAmount
            }
            await axiosInstance.patch("/v1/expenses/budget-allocate", payload)
            handleShowBudgetBreakdown()
        } catch (error: any) {
            toast(error?.msg)
        } finally {
            setEditModeActive(null)
            setUpdatedAllocationAmount("")
        }
    }
    useEffect(() => {
        calculateTotalAllocatedAmount()
    }, [budgetBreakdownData])
    const { monthName } = getDateInfo();
    const totalBudgetAmount = budgetBreakdownData?.amount ?? 0;
    return (
        <>
            <Collapsible
                open={isBudgetOpen}
                onOpenChange={setIsBudgetOpen}
                className="w-full max-w-[400px] max-h-[550px]"
            >
                <div className="rounded-lg border border-border bg-card shadow-xs overflow-hidden flex flex-col">
                    <CollapsibleTrigger asChild>
                        <button className="w-full flex items-center justify-between px-5 py-4 bg-grey-x100 dark:bg-card hover:bg-grey-x200 dark:hover:bg-accent/10 transition-colors">
                            <div className="flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground">
                                {monthName} Budget Breakdown
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
                                        <div className="text-sm text-primary">{budgetSummary.allocationCount} DIfferent Category</div>
                                    </div>
                                    {1 > 0 && (
                                        <div className="rounded-lg border bg-muted/10 border-border/20 text-xs">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-xs font-medium text-primary border-primary/30 hover:bg-primary/10 transition"
                                                onClick={() => handleShowBudgetBreakdown()}
                                            >
                                                See Details
                                            </Button>
                                        </div>
                                    )}
                                </div>

                            </div> :
                            <>
                                {
                                    !isAddBudgetMenuOpen ?
                                        <div className='flex flex-col justify-center items-center p-4 text-sm font-medium '>
                                            <div>No budget set for this month</div>
                                            <div>
                                                <Button
                                                    className='text-primary underline-offset-2 underline font-semibold' variant="ghost"
                                                    onClick={() => setAddBudgetMenuOpen(true)}
                                                >
                                                    Add Budget
                                                </Button>
                                            </div>
                                        </div>
                                        :
                                        <div className='flex gap-4 p-6'>
                                            <Input type='number' placeholder="Enter amount more than 0"
                                                value={newBudgetAmount}
                                                onChange={(e) =>
                                                    setNewBudgetAmount(e.target.value)
                                                }
                                                className="flex-1 placeholder:text-gray-400 text-sm" 
                                            />
                                            <Button size="default" onClick={handleAddNewBudget}>Allocate</Button>
                                        </div>
                                }
                            </>
                        }
                    </CollapsibleContent>
                </div>
            </Collapsible>

            <Dialog open={showBudgetBreakdownDialog} onOpenChange={setShowBudgetBreakdownDialog}>
                <DialogContent className="max-w-[400px] md:max-w-[400px] lg:max-w-[500px] rounded">
                    <DialogHeader>
                        <DialogTitle>{budgetBreakdownData?.month}, {budgetBreakdownData?.year}</DialogTitle>
                        <DialogDescription className='text-xs'>
                            Manage your monthly budget allocation
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col gap-4">
                        {/* Budget Summary */}
                        <div className="rounded-lg border border-primary/20 bg-primary-lite px-3 py-2">
                            <div className="flex items-center justify-between mb-2">
                                <div>
                                    <p className="text-xs font-medium text-primary/70 uppercase tracking-wide mb-1">Total Set Budget</p>
                                    <p className="text-base font-bold text-primary">${totalBudgetAmount}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Remaining</p>
                                    <p className="text-sm font-semibold text-foreground">${budgetSummary.remaining}</p>
                                </div>
                            </div>
                            <div className="relative h-2 bg-grey-x100 dark:bg-border/30 rounded-full overflow-hidden">
                                <div
                                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-700"
                                    style={{ width: `${(totalAllocated / totalBudgetAmount) * 100}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Category Allocations */}

                        <div className="flex flex-col gap-2">
                            <p className="text-sm font-semibold text-foreground mb-1">Budget Breakdown</p>
                            {budgetBreakdownData?.categories.map((category: any, index) => {
                                const spentPercentage = category.allocatedAmount > 0
                                    ? (category.spent / category.allocatedAmount) * 100
                                    : 0;
                                const remainingPercentage = 100 - spentPercentage;
                                const percentageOfTotal = totalBudgetAmount > 0
                                    ? (category.allocatedAmount / totalBudgetAmount) * 100
                                    : 0;

                                return (
                                    <div key={category._id || index} className="rounded-lg border border-border bg-card px-3 py-2">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-foreground capitalize">
                                                {category.categoryName}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                {editModeActive === category._id ? (
                                                    <div>
                                                        <input
                                                            type="number"
                                                            placeholder="Enter amount"
                                                            value={updatedAllocationAmount}
                                                            onChange={(e) =>
                                                                setUpdatedAllocationAmount(e.target.value)
                                                            }
                                                            className="px-2 w-[110px] rounded placeholder:text-gray-400 text-sm border border-primary"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="text-right">
                                                        <span className="text-xs text-muted-foreground">
                                                            ${category.spent.toFixed(2)}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground mx-1">/</span>
                                                        <span className="text-sm font-semibold text-foreground">
                                                            ${category.allocatedAmount.toFixed(2)}
                                                        </span>
                                                    </div>
                                                )}
                                                {editModeActive === category._id ? (
                                                    <div className="flex gap-1">
                                                        <button
                                                            className="hover:bg-accent rounded transition-colors"
                                                            onClick={() => saveUpdatedAllocation(category._id)}
                                                        >
                                                            <TiTick className="w-5 h-5 text-success" />
                                                        </button>
                                                        <button
                                                            className="hover:bg-accent rounded transition-colors"
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
                                                )}
                                            </div>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="relative h-2 bg-grey-x100 dark:bg-border/30 rounded-full overflow-hidden">
                                            {/* Spent portion */}
                                            <div
                                                className={`absolute top-0 left-0 h-full rounded-full transition-all duration-700 ${index === 0 ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                                                    index === 1 ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
                                                        'bg-gradient-to-r from-orange-500 to-red-500'
                                                    }`}
                                                style={{ width: `${Math.min(spentPercentage, 100)}%` }}
                                            ></div>

                                            {/* Remaining portion (lighter) */}
                                            {remainingPercentage > 0 && (
                                                <div
                                                    className={`absolute top-0 h-full rounded-full transition-all duration-700 opacity-30 ${index === 0 ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                                                        index === 1 ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
                                                            'bg-gradient-to-r from-orange-500 to-red-500'
                                                        }`}
                                                    style={{
                                                        left: `${spentPercentage}%`,
                                                        width: `${Math.min(remainingPercentage, 100 - spentPercentage)}%`
                                                    }}
                                                ></div>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between mt-1">
                                            <p className="text-xs text-muted-foreground">
                                                {percentageOfTotal.toFixed(1)}% of total budget
                                            </p>
                                            <p className={`text-xs font-medium ${spentPercentage >= 100 ? 'text-red-500' :
                                                spentPercentage >= 80 ? 'text-orange-500' :
                                                    'text-green-500'
                                                }`}>
                                                ${category.remaining.toFixed(2)} left
                                            </p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                        {showAddCategory &&
                            <>
                                <div className="flex items-center gap-2">
                                    <Select
                                        value={newAllocation.categoryId}
                                        onValueChange={(value) =>
                                            setNewAllocation({ ...newAllocation, categoryId: value })
                                        }
                                    >
                                        <SelectTrigger className="text-xs flex-1 border rounded-md bg-white dark:bg-neutral-900 max-w-[40%]">
                                            <SelectValue placeholder="Select a category" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white text-gray-900 dark:bg-neutral-900 dark:text-white rounded-md shadow-md">
                                            {categories.map((option: any) => (
                                                <SelectItem key={option._id} value={option._id} className='capitalize'>
                                                    {categoryEmojiMap[option.name]} {option.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Input
                                        type="number"
                                        placeholder="Enter amount"
                                        value={newAllocation.amount}
                                        onChange={(e) =>
                                            setNewAllocation({ ...newAllocation, amount: Number(e.target.value) })
                                        }
                                        className="flex-1 placeholder:text-gray-400 text-sm"
                                    />
                                    <Button size="default" onClick={handleAddNewAllocation}>Allocate</Button>
                                </div>
                            </>
                        }

                        <div className="rounded-lg border border-dashed border-border bg-muted/30 px-3 py-2 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-foreground mb-1">Unallocated Budget</p>
                                <p className="text-xs text-muted-foreground">${totalBudgetAmount - totalAllocated} remaining as uncategorised</p>
                            </div>
                            <Button variant="outline" size="sm" className="text-xs" onClick={() => setShowAddCategory(true)} disabled={showAddCategory}>
                                Split More
                            </Button>
                        </div>
                    </div>

                    <DialogFooter className="mt-2">
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default BudgetSummary
