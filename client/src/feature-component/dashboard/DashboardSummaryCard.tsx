import React from 'react'
import ExpenseSummaryCard from './ExpenseSummaryCard'
import GoalsSummaryCard from './GoalsSummaryCard'
import IouSummaryCard from './IouSummaryCard'

const DashboardSummaryCard: React.FC = () => {
    return (
        <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6'>
            <ExpenseSummaryCard />
            <GoalsSummaryCard />
            <IouSummaryCard />
        </div>
    )
}

export default DashboardSummaryCard