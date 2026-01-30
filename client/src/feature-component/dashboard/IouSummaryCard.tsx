import React from 'react'
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { TrendingDown, ArrowRight, TrendingUp, Users, HandCoins, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'

const IouSummaryCard: React.FC = () => {
    // Placeholder data - replace with actual data fetching
    const netStatus = 1240
    const othersOweMe = 2350
    const iOweOthers = 1110
    const peopleOwingMe = 4
    const peopleIOwe = 2
    const overdueCount = 1
    const nextDue = {
        name: "Sarah",
        amount: 450,
        date: "Dec 30"
    }

    const isPositive = netStatus >= 0

    return (
        <Card className='bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 h-full flex flex-col'>
            {/* Header */}
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-accent/10 rounded-lg">
                            <HandCoins className="w-5 h-5 text-accent" />
                        </div>
                        <CardTitle className="text-lg font-semibold text-foreground">
                            IOU Tracker
                        </CardTitle>
                    </div>
                    {overdueCount > 0 ? (
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-error/10 text-error">
                            {overdueCount} Overdue
                        </span>
                    ) : (
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-success/10 text-success">
                            All Clear
                        </span>
                    )}
                </div>
            </CardHeader>

            {/* Content */}
            <CardContent className="flex-1 space-y-4">
                {/* Net Status */}
                <div className={`flex items-center justify-between py-3 px-4 rounded-lg ${isPositive ? 'bg-success/5 border border-success/20' : 'bg-error/5 border border-error/20'}`}>
                    <div className={`flex items-center gap-2 ${isPositive ? 'text-success' : 'text-error'}`}>
                        <HandCoins className="w-4 h-4" />
                        <span className="text-sm font-medium">Net Status</span>
                    </div>
                    <div className="text-right">
                        <span className={`text-xl font-bold ${isPositive ? 'text-success' : 'text-error'}`}>
                            {isPositive ? '+' : '-'}${Math.abs(netStatus).toLocaleString()}
                        </span>
                        <p className={`text-xs ${isPositive ? 'text-success/70' : 'text-error/70'}`}>
                            {isPositive ? "You're owed more" : "You owe more"}
                        </p>
                    </div>
                </div>

                {/* Others Owe Me */}
                <div className="flex items-center justify-between py-3 border-b border-border">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-sm font-medium">Others Owe Me</span>
                    </div>
                    <div className="text-right">
                        <span className="text-lg font-bold text-success">
                            ${othersOweMe.toLocaleString()}
                        </span>
                        <p className="text-xs text-muted-foreground flex items-center justify-end gap-1">
                            <Users className="w-3 h-3" />
                            {peopleOwingMe} people
                        </p>
                    </div>
                </div>

                {/* I Owe Others */}
                <div className="flex items-center justify-between py-3 border-b border-border">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <TrendingDown className="w-4 h-4" />
                        <span className="text-sm font-medium">I Owe Others</span>
                    </div>
                    <div className="text-right">
                        <span className="text-lg font-bold text-error">
                            ${iOweOthers.toLocaleString()}
                        </span>
                        <p className="text-xs text-muted-foreground flex items-center justify-end gap-1">
                            <Users className="w-3 h-3" />
                            {peopleIOwe} people
                        </p>
                    </div>
                </div>

                {/* Next Due Alert */}
                {nextDue && (
                    <div className="p-3 rounded-lg bg-warning/5 border border-warning/20">
                        <div className="flex items-center gap-2 mb-1">
                            <AlertCircle className="w-4 h-4 text-warning" />
                            <span className="text-xs font-medium text-warning">Next Due</span>
                        </div>
                        <p className="text-sm text-foreground">
                            {nextDue.name} - <span className="font-semibold">${nextDue.amount}</span>
                            <span className="text-muted-foreground ml-1">({nextDue.date})</span>
                        </p>
                    </div>
                )}
            </CardContent>

            {/* Footer */}
            <CardFooter className="pt-4 mt-auto">
                <Button asChild className="w-full bg-accent hover:bg-accent/90 text-white">
                    <Link to="/iou-tracker" className="flex items-center justify-center gap-2">
                        <span>Manage IOUs</span>
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    )
}

export default IouSummaryCard
