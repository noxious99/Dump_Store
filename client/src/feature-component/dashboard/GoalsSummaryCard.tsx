import React from 'react'
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { ArrowRight, Target, Calendar, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'

const GoalsSummaryCard: React.FC = () => {
    // Placeholder data - replace with actual data fetching
    const activeGoals = 3
    const tasksToday = 3
    const totalTasks = 5
    const overallProgress = 67
    const nextDeadline = {
        name: "Learn React",
        date: "Dec 15, 2025"
    }

    return (
        <Card className='bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 h-full flex flex-col'>
            {/* Header */}
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-success/10 rounded-lg">
                            <Target className="w-5 h-5 text-success" />
                        </div>
                        <CardTitle className="text-lg font-semibold text-foreground">
                            Goal Tracker
                        </CardTitle>
                    </div>
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-success/10 text-success">
                        On Track
                    </span>
                </div>
            </CardHeader>

            {/* Content */}
            <CardContent className="flex-1 space-y-4">
                {/* Active Goals */}
                <div className="flex items-center justify-between py-3 px-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Target className="w-4 h-4" />
                        <span className="text-sm font-medium">Active Goals</span>
                    </div>
                    <span className="text-xl font-bold text-success">
                        {activeGoals}
                    </span>
                </div>

                {/* Next Deadline */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            <span className="text-sm font-medium">Next Deadline</span>
                        </div>
                        <span className="text-sm font-semibold text-foreground">
                            {nextDeadline.name}
                        </span>
                    </div>
                    <div className="flex justify-end">
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                            {nextDeadline.date}
                        </span>
                    </div>
                </div>

                {/* Tasks Today */}
                <div className="flex items-center justify-between py-3 border-t border-border">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="text-sm font-medium">Tasks Today</span>
                    </div>
                    <div className="text-right">
                        <span className="text-lg font-bold text-warning">{tasksToday}</span>
                        <span className="text-sm text-muted-foreground"> / {totalTasks}</span>
                    </div>
                </div>

                {/* Overall Progress */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">Overall Progress</span>
                        <span className="text-sm font-bold text-success bg-success/10 px-2 py-1 rounded">
                            {overallProgress}%
                        </span>
                    </div>
                    <div className="space-y-2">
                        <div className="w-full bg-grey-x200 rounded-full h-2">
                            <div
                                className="bg-success h-2 rounded-full transition-all duration-300"
                                style={{ width: `${overallProgress}%` }}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground text-center">
                            Keep it up! You're doing great.
                        </p>
                    </div>
                </div>
            </CardContent>

            {/* Footer */}
            <CardFooter className="pt-4 mt-auto">
                <Button asChild className="w-full bg-success hover:bg-success/90 text-white">
                    <Link to="/goals-tracker" className="flex items-center justify-center gap-2">
                        <span>View Goals</span>
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    )
}

export default GoalsSummaryCard
