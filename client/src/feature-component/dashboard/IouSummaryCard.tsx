import React from 'react'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { HandCoins, Clock } from 'lucide-react'

const IouSummaryCard: React.FC = () => {
    return (
        <Card className='bg-card border border-border rounded-xl shadow-sm transition-colors duration-200 h-full flex flex-col'>
            <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 sm:gap-3">
                        <div className="p-2 sm:p-2.5 bg-accent/10 rounded-lg">
                            <HandCoins className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
                        </div>
                        <CardTitle className="text-base sm:text-lg font-semibold text-foreground">
                            IOU Tracker
                        </CardTitle>
                    </div>
                    <span className="text-[10px] sm:text-xs font-medium px-2.5 py-1 rounded-full bg-accent/10 text-accent">
                        Coming Soon
                    </span>
                </div>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col items-center justify-center py-6 sm:py-8 px-4 sm:px-6">
                <div className="p-4 bg-grey-x100 rounded-xl mb-3 sm:mb-4">
                    <Clock className="w-7 h-7 sm:w-8 sm:h-8 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground mb-1">Coming Soon</p>
                <p className="text-xs text-muted-foreground text-center max-w-[200px]">
                    Track who owes you and who you owe — all in one place
                </p>
            </CardContent>
        </Card>
    )
}

export default IouSummaryCard
