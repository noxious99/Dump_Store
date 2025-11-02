import React from 'react'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { ArrowRight, AlertCircle, Target, Calendar, } from 'lucide-react'

const GoalsSummaryCard: React.FC = () => {
    return (
        <Card className='w-full max-w-none border-border hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-grey-x100/20 h-full flex flex-col'>
            <CardHeader className="pb-3 px-4 sm:px-6">
                <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-2 sm:p-2.5 bg-secondary/10 rounded-xl flex-shrink-0">
                        <Target className="w-5 h-5 sm:w-6 sm:h-6 text-secondary" />
                    </div>
                    <div className='min-w-0 flex-1'>
                        <CardTitle className="text-base sm:text-lg md:text-xl font-semibold text-foreground truncate leading-tight">
                            Goals Tracker
                        </CardTitle>
                        <CardDescription className="text-success font-medium text-xs sm:text-sm md:text-base leading-tight">
                            Stay On Track!
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-2 sm:space-y-3 px-4 sm:px-6 py-1 sm:py-2 flex-1">
                {/* Active Goals */}
                <div className="py-2 sm:py-3">
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Target className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                            <span className="font-medium text-xs sm:text-sm">Active Goals</span>
                        </div>
                        <span className="font-bold text-base sm:text-lg md:text-xl text-secondary">3</span>
                    </div>
                </div>

                {/* Next Deadline */}
                <div className="py-2 sm:py-3 border-b border-border/50">
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                            <span className="font-medium text-xs sm:text-sm">Next Deadline</span>
                        </div>
                        <div className="text-right">
                            <div className="font-bold text-sm sm:text-base md:text-lg text-foreground">Learn React</div>
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <div className="text-xs sm:text-sm text-muted-foreground bg-muted/30 px-2 py-1 rounded-md">
                            Dec 15, 2025
                        </div>
                    </div>
                </div>

                {/* Pending Tasks */}
                <div className="py-2 sm:py-3">
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                            <span className="font-medium text-xs sm:text-sm">Tasks Today</span>
                        </div>
                        <span className="font-bold text-base sm:text-lg md:text-xl text-warning">3</span>
                    </div>
                    <div className="flex justify-end">
                        <div className="text-xs sm:text-sm text-muted-foreground">
                            of 5 total
                        </div>
                    </div>
                </div>

                {/* Progress Section - Mobile Optimized */}
                <div className="pt-2 sm:pt-3">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs sm:text-sm font-medium text-muted-foreground">Overall Progress</span>
                        <span className="text-xs sm:text-sm font-bold text-secondary bg-secondary/10 px-2 py-1 rounded-md">
                            67%
                        </span>
                    </div>
                    <div className="bg-muted/30 p-3 rounded-md">
                        <div className="w-full bg-grey-x200 rounded-full h-2 mb-1">
                            <div className="bg-secondary h-2 rounded-full transition-all duration-300" style={{ width: '67%' }}></div>
                        </div>
                        <div className="text-xs text-muted-foreground text-center">
                            You're doing great! Keep it up!
                        </div>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="pt-3 sm:pt-4 mt-auto px-4 sm:px-6 pb-4 sm:pb-6">
                <button
                    onClick={() => window.location.href = '/goals-tracker'}
                    className="w-full group flex items-center justify-center gap-2 bg-secondary hover:bg-secondary/90 active:bg-secondary/80 text-secondary-foreground px-4 py-3 sm:py-3.5 rounded-lg transition-all duration-200 font-medium shadow-sm hover:shadow-md text-sm sm:text-base touch-manipulation"
                >
                    <span>View Goals</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200 flex-shrink-0" />
                </button>
            </CardFooter>
        </Card>
    )
}

export default GoalsSummaryCard