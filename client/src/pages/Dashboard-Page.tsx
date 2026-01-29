import { selectUser } from '@/feature-component/auth/userSlice'
import React from 'react'
import { useSelector } from 'react-redux'
import { PiHandWaving } from "react-icons/pi";
import moment from "moment"
import DashboardSummaryCard from '@/feature-component/dashboard/DashboardSummaryCard';

const Dashboard_Page: React.FC = () => {
  const user = useSelector(selectUser)
  const customDate = moment(Date.now()).format("dddd, MMMM D, YYYY");

  return (
    <div className='min-h-screen bg-grey-x100'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8'>
        {/* Header Section */}
        <header className='mb-6 sm:mb-8'>
          <div className='flex items-center gap-2 mb-1'>
            <h1 className='text-2xl sm:text-3xl font-bold text-foreground'>
              Welcome back, <span className='text-primary'>{user.name || user.username}</span>
            </h1>
            <PiHandWaving className='text-warning text-2xl sm:text-3xl' />
          </div>

          <p className='text-sm sm:text-base text-muted-foreground'>
            {customDate}
          </p>

          <p className='text-sm sm:text-base text-muted-foreground mt-1'>
            Here's your quick summary for today.
          </p>
        </header>

        {/* Cards Section */}
        <section>
          <DashboardSummaryCard />
        </section>
      </div>
    </div>
  )
}

export default Dashboard_Page