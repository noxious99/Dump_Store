import React, { useState } from 'react'
import type { ExpenseRecord } from '@/types/expenseTracker'
import { categoryEmojiMap } from '@/utils/constant'
import { Trash2, Check, X, Receipt } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import moment from 'moment'

type ExpenseRecords = ExpenseRecord[]

interface ExpenseRecordsListProps {
    expenseRecords?: ExpenseRecords
    onRecordDeleted?: (expenseId: string) => void
}

const groupRecordsByDate = (records: ExpenseRecord[]) => {
    const today = moment().startOf('day')
    const yesterday = moment().subtract(1, 'day').startOf('day')

    const groups: { label: string; records: ExpenseRecord[] }[] = []
    const groupMap = new Map<string, ExpenseRecord[]>()

    records.forEach(record => {
        const recordDate = moment(record.createdAt).startOf('day')
        let label: string

        if (recordDate.isSame(today)) {
            label = 'Today'
        } else if (recordDate.isSame(yesterday)) {
            label = 'Yesterday'
        } else {
            label = recordDate.format('MMM D')
        }

        if (!groupMap.has(label)) {
            groupMap.set(label, [])
        }
        groupMap.get(label)!.push(record)
    })

    groupMap.forEach((records, label) => {
        groups.push({ label, records })
    })

    return groups
}

const ExpenseRecordsList: React.FC<ExpenseRecordsListProps> = ({
    expenseRecords = [],
    onRecordDeleted
}) => {
    const [deletingId, setDeletingId] = useState<string | null>(null)

    const handleDeleteClick = (expenseId: string) => {
        setDeletingId(expenseId)
    }

    const handleConfirmDelete = () => {
        if (deletingId && onRecordDeleted) {
            onRecordDeleted(deletingId)
            setDeletingId(null)
        }
    }

    const handleCancelDelete = () => {
        setDeletingId(null)
    }

    const groupedRecords = groupRecordsByDate(expenseRecords)

    return (
        <Card className="bg-card border border-border rounded-xl shadow-none animate-fade-up">
            <CardHeader className="pb-5 sm:pb-6 px-4 sm:px-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 sm:gap-3">
                        <div className="p-2 bg-error/10 rounded-lg">
                            <Receipt className="w-4 h-4 text-error" />
                        </div>
                        <CardTitle className="text-sm sm:text-base font-semibold text-foreground">
                            Expense Records
                        </CardTitle>
                    </div>
                    <span className='text-xs sm:text-sm font-medium text-muted-foreground'>
                        {expenseRecords.length} {expenseRecords.length === 1 ? 'record' : 'records'}
                    </span>
                </div>
            </CardHeader>

            <CardContent className="px-3 sm:px-6">
                {expenseRecords.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8">
                        <div className="p-3 bg-grey-x100 rounded-xl mb-3">
                            <Receipt className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <p className="text-sm text-muted-foreground">No expenses this month</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {groupedRecords.map(({ label, records }) => (
                            <div key={label}>
                                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 px-2 sm:px-3">
                                    {label}
                                </div>

                                <div className="space-y-0.5">
                                    {records.map((expense) => (
                                        <div
                                            key={expense._id}
                                            className="flex items-center justify-between py-3 px-2 sm:px-3 rounded-lg hover:bg-grey-x100 transition-colors duration-200 min-h-[52px] group"
                                        >
                                            {/* Left: Emoji + Category + Note */}
                                            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                                                <div className="w-9 h-9 rounded-lg bg-error/10 flex items-center justify-center shrink-0">
                                                    <span className="text-lg">
                                                        {categoryEmojiMap[expense.category.name] || "🔀"}
                                                    </span>
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-medium text-foreground capitalize truncate">
                                                        {expense.category.name}
                                                    </p>
                                                    {expense.note && (
                                                        <p className="text-xs text-muted-foreground truncate max-w-[140px] sm:max-w-none">
                                                            {expense.note}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Right: Amount + Time + Delete */}
                                            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                                                <div className="text-right">
                                                    <p className={`text-sm font-semibold text-error tracking-tight transition-opacity ${deletingId === expense._id ? 'opacity-50' : 'opacity-100'}`}>
                                                        -${expense.amount.toLocaleString()}
                                                    </p>
                                                    <p className="text-[10px] sm:text-xs text-muted-foreground">
                                                        {moment(expense.createdAt).format('h:mm A')}
                                                    </p>
                                                </div>

                                                {onRecordDeleted && (
                                                    <div className="sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                                        {deletingId === expense._id ? (
                                                            <div className="flex items-center gap-1">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={handleConfirmDelete}
                                                                    className='h-8 w-8 p-0 hover:bg-error/10 hover:text-error transition-colors'
                                                                >
                                                                    <Check className='w-4 h-4' />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={handleCancelDelete}
                                                                    className='h-8 w-8 p-0 hover:bg-grey-x200 transition-colors'
                                                                >
                                                                    <X className='w-4 h-4' />
                                                                </Button>
                                                            </div>
                                                        ) : (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleDeleteClick(expense._id)}
                                                                className='h-8 w-8 p-0 hover:bg-error/10 hover:text-error transition-colors'
                                                            >
                                                                <Trash2 className='w-4 h-4' />
                                                            </Button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

export default ExpenseRecordsList
