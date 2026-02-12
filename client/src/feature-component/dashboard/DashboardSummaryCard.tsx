import React from 'react'
import ExpenseSummaryCard from './ExpenseSummaryCard'
import GoalsSummaryCard from './GoalsSummaryCard'
import IouSummaryCard from './IouSummaryCard'

const DashboardSummaryCard: React.FC = () => {
    return (
        <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 lg:gap-6'>
            <div className="animate-stagger-in">
                <ExpenseSummaryCard />
            </div>
            <div className="animate-stagger-in">
                <GoalsSummaryCard />
            </div>
            <div className="animate-stagger-in md:col-span-2 xl:col-span-1">
                <IouSummaryCard />
            </div>
        </div>
    )
}

export default DashboardSummaryCard
