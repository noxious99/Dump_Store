import React, { useState } from 'react'
import type { ExpenseRecord } from '@/types/expenseTracker';
import { categoryEmojiMap } from '@/utils/constant';
import { Trash2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

type ExpenseRecords = ExpenseRecord[]

interface ExpenseRecordsListProps {
    expenseRecords?: ExpenseRecords;
    onRecordDeleted?: (expenseId: string) => void
}

const ExpenseRecordsList: React.FC<ExpenseRecordsListProps> = ({ expenseRecords = [], onRecordDeleted }) => {
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleDeleteClick = (expenseId: string) => {
        setDeletingId(expenseId);
    };

    const handleConfirmDelete = () => {
        if (deletingId && onRecordDeleted) {
            onRecordDeleted(deletingId);
            setDeletingId(null);
        }
    };

    const handleCancelDelete = () => {
        setDeletingId(null);
    };
    return (
        <div>
            {expenseRecords.length > 0 ? (
                <div className='space-y-2'>
                    {expenseRecords.map((expense: ExpenseRecord) => (
                        <div className='rounded-lg border border-border bg-card p-4 hover:shadow-md transition-shadow' key={expense._id}>
                            <div className='flex items-center justify-between'>
                                <div className='flex items-center gap-3'>
                                    <div className='w-10 h-10 rounded-full bg-chart-1/10 flex items-center justify-center'>
                                        <span className='text-xl'>
                                            {categoryEmojiMap[expense.category.name] || "🔀"}
                                        </span>
                                    </div>
                                    <div className='flex flex-col gap-2'>
                                        <div className='font-semibold text-foreground capitalize'>{expense.category.name}</div>
                                        <div className='text-xs text-muted-foreground font-medium'>{expense.note || 'No note'} • {new Date(expense.createdAt).toLocaleDateString()}</div>
                                    </div>
                                </div>
                                <div className='flex flex-col items-end gap-1'>
                                    <div className='flex items-center gap-2'>
                                        {deletingId === expense._id &&
                                            <div className='text-xs mr-2 font-medium'>
                                                Delete this?
                                            </div>
                                        }
                                        <div className={`font-bold text-error transition-opacity ${deletingId === expense._id ? 'opacity-50' : 'opacity-100'}`}>
                                            -${expense.amount}
                                        </div>
                                    </div>

                                    {onRecordDeleted && (
                                        <div className='flex items-center gap-2'>
                                            {deletingId === expense._id ? (
                                                <>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={handleConfirmDelete}
                                                        className='h-8 px-3 hover:bg-error/10 hover:text-error border hover:border-error transition-colors duration-200'
                                                    >
                                                        <Check className='w-4 h-4' />
                                                        Yes
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={handleCancelDelete}
                                                        className='h-8 px-3 hover:bg-primary transition-all duration-200'
                                                    >
                                                        <X className='w-4 h-4' />
                                                    </Button>
                                                </>
                                            ) : (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDeleteClick(expense._id)}
                                                    className='h-8 hover:bg-error/10 hover:text-error'
                                                >
                                                    <Trash2 className='w-4 h-4' />
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className='py-8 text-center text-sm font-medium text-muted-foreground'>
                    No expenses recorded this month
                </div>
            )}
        </div>
    )
}

export default ExpenseRecordsList