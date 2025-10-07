import React from 'react'
import ExpenseSummaryCard from './ExpenseSummaryCard'
import GoalsSummaryCard from './GoalsSummaryCard'
import IouSummaryCard from './IouSummaryCard'

const DashboardSummaryCard: React.FC = () => {
    return (
        <>
            <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8 auto-rows-fr'>
                <div className='w-full'>
                    <ExpenseSummaryCard />
                </div>
                <div className='w-full'>
                    <GoalsSummaryCard />
                </div>
                <div className='w-full xl:col-span-1 lg:col-span-2'>
                    <IouSummaryCard />
                </div>
            </div>
        </>
    )
}

export default DashboardSummaryCard