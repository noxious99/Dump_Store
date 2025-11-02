import React from 'react'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { TrendingDown, ArrowRight, } from 'lucide-react'
import { HandCoins, TrendingUp, Users, } from 'lucide-react'
const IouSummaryCard: React.FC = () => {
    return (
        <>
            <Card className='w-full max-w-none border-border hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-grey-x100/20 h-full flex flex-col'>
                <CardHeader className="pb-3 px-4 sm:px-6">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="p-2 sm:p-2.5 bg-accent/10 rounded-xl flex-shrink-0">
                            <HandCoins className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
                        </div>
                        <div className='min-w-0 flex-1'>
                            <CardTitle className="text-base sm:text-lg md:text-xl font-semibold text-foreground truncate leading-tight">
                                IOU Tracker
                            </CardTitle>
                            <CardDescription className="text-success font-medium text-xs sm:text-sm md:text-base leading-tight">
                                Keep Track of Debts!
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-2 sm:space-y-3 px-4 sm:px-6 py-1 sm:py-2 flex-1">
                    {/* Net Status */}
                    <div className="py-3 px-3 sm:px-4 bg-success-x100/50 rounded-lg border border-success/20">
                        <div className="flex items-center justify-between mb-1 sm:mb-0">
                            <div className="flex items-center gap-2 text-success">
                                <HandCoins className="w-4 h-4 flex-shrink-0" />
                                <span className="font-semibold text-xs sm:text-sm">Net Status</span>
                            </div>
                            <span className="font-bold text-base sm:text-lg md:text-xl text-success">+$1,240</span>
                        </div>
                        <div className="text-right">
                            <div className="text-xs text-success/70">You're owed more</div>
                        </div>
                    </div>

                    {/* Others owe me */}
                    <div className="py-2 sm:py-3">
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                <span className="font-medium text-xs sm:text-sm">Others Owe Me</span>
                            </div>
                            <span className="font-bold text-base sm:text-lg md:text-xl text-success">$2,350</span>
                        </div>
                        <div className="flex justify-end">
                            <div className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                4 people
                            </div>
                        </div>
                    </div>

                    {/* I owe others */}
                    <div className="py-2 sm:py-3 border-b border-border/50">
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                <span className="font-medium text-xs sm:text-sm">I Owe Others</span>
                            </div>
                            <span className="font-bold text-base sm:text-lg md:text-xl text-error">$1,110</span>
                        </div>
                        <div className="flex justify-end">
                            <div className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                2 people
                            </div>
                        </div>
                    </div>

                    {/* Status Alerts - Mobile Optimized */}
                    <div className="pt-2 sm:pt-3">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs sm:text-sm font-medium text-muted-foreground">Status Alerts</span>
                            <span className="text-xs sm:text-sm text-error font-medium bg-error/10 px-2 py-1 rounded-md">
                                1 overdue
                            </span>
                        </div>
                        <div className="bg-muted/30 px-3 py-2 rounded-md">
                            <div className="text-xs text-muted-foreground">
                                <span className="font-medium">Next due:</span> Sarah - $450 (Dec 30)
                            </div>
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="pt-3 sm:pt-4 mt-auto px-4 sm:px-6 pb-4 sm:pb-6">
                    <button
                        onClick={() => window.location.href = '/iou-tracker'}
                        className="w-full group flex items-center justify-center gap-2 bg-accent hover:bg-accent/90 active:bg-accent/80 text-accent-foreground px-4 py-3 sm:py-3.5 rounded-lg transition-all duration-200 font-medium shadow-sm hover:shadow-md text-sm sm:text-base touch-manipulation"
                    >
                        <span>Manage IOUs</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200 flex-shrink-0" />
                    </button>
                </CardFooter>
            </Card>
        </>
    )
}

export default IouSummaryCard