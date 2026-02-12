import React, { useEffect, useState } from 'react'
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { ArrowRight, Target, Calendar, Flag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import axiosInstance from '@/utils/axiosInstance'
import moment from 'moment'

interface MileStone {
    _id: string
    title: string
    isCompleted: boolean
    completedAt?: string
}

interface Goal {
    _id: string
    title: string
    category: 'longTerm' | 'shortTerm'
    isCompleted: boolean
    targetDate: string
    mileStone: MileStone[]
    createdAt: string
}

const SkeletonCard = () => (
    <Card className='bg-card border border-border rounded-xl h-full flex flex-col'>
        <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
            <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="skeleton w-9 h-9 sm:w-10 sm:h-10 rounded-lg" />
                <div className="skeleton h-5 w-28" />
            </div>
        </CardHeader>
        <CardContent className="flex-1 space-y-4 px-4 sm:px-6">
            <div className="skeleton h-14 w-full rounded-lg" />
            <div className="space-y-2">
                <div className="flex justify-between">
                    <div className="skeleton h-4 w-24" />
                    <div className="skeleton h-4 w-20" />
                </div>
                <div className="skeleton h-4 w-16 ml-auto" />
            </div>
            <div className="skeleton h-10 w-full rounded-lg" />
            <div className="skeleton h-2 w-full rounded-full" />
        </CardContent>
        <CardFooter className="pt-3 px-4 sm:px-6">
            <div className="skeleton h-10 w-full rounded-lg" />
        </CardFooter>
    </Card>
)

const GoalsSummaryCard: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true)
    const [activeGoals, setActiveGoals] = useState(0)
    const [completedGoals, setCompletedGoals] = useState(0)
    const [overallProgress, setOverallProgress] = useState(0)
    const [nextDeadline, setNextDeadline] = useState<{ name: string; date: string; daysLeft: number } | null>(null)
    const [hasGoals, setHasGoals] = useState(false)

    useEffect(() => {
        const fetchGoals = async () => {
            try {
                const res = await axiosInstance.get('/v1/goals')
                const goals: Goal[] = res.data?.goals || []

                if (goals.length === 0) {
                    setHasGoals(false)
                    return
                }

                setHasGoals(true)

                const active = goals.filter(g => !g.isCompleted)
                const completed = goals.filter(g => g.isCompleted)
                setActiveGoals(active.length)
                setCompletedGoals(completed.length)

                const totalMilestones = goals.reduce((sum, g) => sum + (g.mileStone?.length || 0), 0)
                const completedMilestones = goals.reduce((sum, g) =>
                    sum + (g.mileStone?.filter(m => m.isCompleted)?.length || 0), 0)
                const progress = totalMilestones > 0
                    ? Math.round((completedMilestones / totalMilestones) * 100)
                    : (completed.length > 0 ? 100 : 0)
                setOverallProgress(progress)

                const upcomingGoals = active
                    .filter(g => g.targetDate)
                    .sort((a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime())

                if (upcomingGoals.length > 0) {
                    const next = upcomingGoals[0]
                    const daysLeft = moment(next.targetDate).diff(moment(), 'days')
                    setNextDeadline({
                        name: next.title,
                        date: moment(next.targetDate).format('MMM D, YYYY'),
                        daysLeft
                    })
                }
            } catch (error) {
                console.error("Error fetching goals:", error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchGoals()
    }, [])

    const getStatusBadge = () => {
        if (!hasGoals) return null
        if (nextDeadline && nextDeadline.daysLeft < 0) {
            return <span className="text-[10px] sm:text-xs font-medium px-2.5 py-1 rounded-full bg-error/10 text-error">Overdue</span>
        }
        if (nextDeadline && nextDeadline.daysLeft <= 7) {
            return <span className="text-[10px] sm:text-xs font-medium px-2.5 py-1 rounded-full bg-warning/10 text-warning">Due Soon</span>
        }
        return <span className="text-[10px] sm:text-xs font-medium px-2.5 py-1 rounded-full bg-success/10 text-success">On Track</span>
    }

    if (isLoading) return <SkeletonCard />

    return (
        <Card className='bg-card border border-border rounded-xl shadow-sm transition-colors duration-200 h-full flex flex-col'>
            {!hasGoals ? (
                <>
                    <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
                        <div className="flex items-center gap-2.5 sm:gap-3">
                            <div className="p-2 sm:p-2.5 bg-success/10 rounded-lg">
                                <Target className="w-4 h-4 sm:w-5 sm:h-5 text-success" />
                            </div>
                            <CardTitle className="text-base sm:text-lg font-semibold text-foreground">
                                Goal Tracker
                            </CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col items-center justify-center py-6 px-4 sm:px-6">
                        <div className="p-4 bg-grey-x100 rounded-xl mb-4">
                            <Target className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <p className="text-sm font-medium text-foreground mb-1">No goals yet</p>
                        <p className="text-xs text-muted-foreground text-center">Set a goal and start tracking your progress</p>
                    </CardContent>
                    <CardFooter className="pt-3 sm:pt-4 mt-auto px-4 sm:px-6">
                        <Button asChild className="w-full rounded-lg bg-success hover:bg-success/90 text-white h-10 sm:h-11 active:scale-[0.98] transition-all duration-200">
                            <Link to="/goals-tracker" className="flex items-center justify-center gap-2">
                                <span className="text-sm">Create a Goal</span>
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </Button>
                    </CardFooter>
                </>
            ) : (
                <>
                    <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5 sm:gap-3">
                                <div className="p-2 sm:p-2.5 bg-success/10 rounded-lg">
                                    <Target className="w-4 h-4 sm:w-5 sm:h-5 text-success" />
                                </div>
                                <CardTitle className="text-base sm:text-lg font-semibold text-foreground">
                                    Goal Tracker
                                </CardTitle>
                            </div>
                            {getStatusBadge()}
                        </div>
                    </CardHeader>

                    <CardContent className="flex-1 space-y-3 sm:space-y-4 px-4 sm:px-6">
                        {/* Active Goals */}
                        <div className="flex items-center justify-between py-2.5 sm:py-3 px-3 sm:px-4 bg-grey-x100 rounded-lg">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Target className="w-4 h-4" />
                                <span className="text-xs sm:text-sm font-medium">Active Goals</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-lg sm:text-xl font-bold text-success tracking-tight">{activeGoals}</span>
                                {completedGoals > 0 && (
                                    <span className="text-[10px] sm:text-xs text-muted-foreground">({completedGoals} done)</span>
                                )}
                            </div>
                        </div>

                        {/* Next Deadline */}
                        {nextDeadline && (
                            <div className="space-y-1.5 sm:space-y-2">
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2 text-muted-foreground shrink-0">
                                        <Calendar className="w-4 h-4" />
                                        <span className="text-xs sm:text-sm font-medium">Next Deadline</span>
                                    </div>
                                    <span className="text-xs sm:text-sm font-semibold text-foreground truncate max-w-[120px] sm:max-w-[140px]">
                                        {nextDeadline.name}
                                    </span>
                                </div>
                                <div className="flex justify-end items-center gap-1.5 sm:gap-2 flex-wrap">
                                    <span className="text-[10px] sm:text-xs text-muted-foreground bg-grey-x100 px-2 py-0.5 sm:py-1 rounded-md">
                                        {nextDeadline.date}
                                    </span>
                                    <span className={`text-[10px] sm:text-xs font-medium px-2 py-0.5 sm:py-1 rounded-md ${nextDeadline.daysLeft < 0 ? 'bg-error/10 text-error' : nextDeadline.daysLeft <= 7 ? 'bg-warning/10 text-warning' : 'bg-grey-x100 text-muted-foreground'}`}>
                                        {nextDeadline.daysLeft < 0
                                            ? `${Math.abs(nextDeadline.daysLeft)}d overdue`
                                            : nextDeadline.daysLeft === 0
                                                ? 'Due today'
                                                : `${nextDeadline.daysLeft}d left`
                                        }
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Milestones */}
                        <div className="flex items-center justify-between py-2.5 sm:py-3 border-t border-border">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Flag className="w-4 h-4" />
                                <span className="text-xs sm:text-sm font-medium">Milestones</span>
                            </div>
                            <span className="text-xs sm:text-sm font-semibold text-foreground">
                                {overallProgress}% complete
                            </span>
                        </div>

                        {/* Progress Bar */}
                        <div>
                            <div className="w-full bg-grey-x100 rounded-full h-2 overflow-hidden">
                                <div
                                    className="bg-success h-2 rounded-full transition-all duration-700 ease-out"
                                    style={{ width: `${overallProgress}%` }}
                                />
                            </div>
                        </div>
                    </CardContent>

                    <CardFooter className="pt-3 sm:pt-4 mt-auto px-4 sm:px-6">
                        <Button asChild className="w-full rounded-lg bg-success hover:bg-success/90 text-white h-10 sm:h-11 active:scale-[0.98] transition-all duration-200">
                            <Link to="/goals-tracker" className="flex items-center justify-center gap-2">
                                <span className="text-sm">View Goals</span>
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </Button>
                    </CardFooter>
                </>
            )}
        </Card>
    )
}

export default GoalsSummaryCard
