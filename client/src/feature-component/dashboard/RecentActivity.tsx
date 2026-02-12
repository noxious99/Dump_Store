import React, { useEffect, useState } from 'react'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Activity, ArrowRight, Receipt } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import axiosInstance from '@/utils/axiosInstance'
import moment from 'moment'

interface ExpenseRecord {
    _id: string
    amount: number
    note: string
    createdAt: string
    category: {
        _id: string
        name: string
    }
}

const SkeletonRows = () => (
    <div className="space-y-1">
        {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center justify-between py-3 px-2 sm:px-3">
                <div className="flex items-center gap-2.5 sm:gap-3">
                    <div className="skeleton w-9 h-9 rounded-lg" />
                    <div className="space-y-1.5">
                        <div className="skeleton h-3.5 w-20" />
                        <div className="skeleton h-3 w-28" />
                    </div>
                </div>
                <div className="space-y-1.5 flex flex-col items-end">
                    <div className="skeleton h-3.5 w-14" />
                    <div className="skeleton h-3 w-10" />
                </div>
            </div>
        ))}
    </div>
)

const RecentActivity: React.FC = () => {
    const [records, setRecords] = useState<ExpenseRecord[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchRecent = async () => {
            try {
                const today = moment().format('YYYY-MM-DD')
                const res = await axiosInstance.get(`/v1/expenses/details?date=${today}`)
                const expenses: ExpenseRecord[] = res.data?.expenseRecords || []
                setRecords(expenses.slice(0, 5))
            } catch (error) {
                console.error("Error fetching recent activity:", error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchRecent()
    }, [])

    return (
        <Card className="bg-card border border-border rounded-xl shadow-none">
            <CardHeader className="pb-2 sm:pb-3 px-4 sm:px-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 sm:gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Activity className="w-4 h-4 text-primary" />
                        </div>
                        <CardTitle className="text-sm sm:text-base font-semibold text-foreground">
                            Recent Activity
                        </CardTitle>
                    </div>
                    <Button asChild variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground h-8 px-2 rounded-lg">
                        <Link to="/expense-tracker" className="flex items-center gap-1">
                            View all
                            <ArrowRight className="w-3 h-3" />
                        </Link>
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="px-3 sm:px-6">
                {isLoading ? (
                    <SkeletonRows />
                ) : records.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8">
                        <div className="p-3 bg-grey-x100 rounded-xl mb-3">
                            <Receipt className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <p className="text-sm text-muted-foreground">No expenses this month</p>
                    </div>
                ) : (
                    <div className="space-y-0.5">
                        {records.map((record) => (
                            <div
                                key={record._id}
                                className="flex items-center justify-between py-3 px-2 sm:px-3 rounded-lg hover:bg-grey-x100 transition-colors duration-200 min-h-[52px]"
                            >
                                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                                    <div className="w-9 h-9 rounded-lg bg-error/10 flex items-center justify-center shrink-0">
                                        <span className="text-xs font-semibold text-error">
                                            {record.category?.name?.charAt(0)?.toUpperCase() || '?'}
                                        </span>
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-foreground capitalize truncate">
                                            {record.category?.name || 'Uncategorized'}
                                        </p>
                                        {record.note && (
                                            <p className="text-xs text-muted-foreground truncate max-w-[140px] sm:max-w-none">
                                                {record.note}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right shrink-0 ml-2 sm:ml-3">
                                    <p className="text-sm font-semibold text-error tracking-tight">
                                        -${record.amount.toLocaleString()}
                                    </p>
                                    <p className="text-[10px] sm:text-xs text-muted-foreground">
                                        {moment(record.createdAt).fromNow()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

export default RecentActivity
