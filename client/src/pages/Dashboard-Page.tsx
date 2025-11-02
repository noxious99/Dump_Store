import { selectUser } from '@/feature-component/auth/userSlice'
import React from 'react'
import { useSelector } from 'react-redux'
import { PiHandWaving } from "react-icons/pi";
import moment from "moment"
import DashboardSummaryCard from '@/feature-component/dashboard/DashboardSummaryCard';

const Dashboard_Page: React.FC = () => {
  const user = useSelector(selectUser)
  const customDate = moment(Date.now()).format("dddd, YYYY-MM-DD");
  
  return (
    <div className='min-h-screen bg-background'>
      <div className='container mx-auto px-4 py-6 max-w-7xl'>
        {/* Header Section */}
        <div className='mb-8'>
          <div className='flex flex-col sm:flex-row sm:items-center gap-2'>
            <span className='text-xl sm:text-2xl font-semibold text-foreground'>
              Welcome back,
            </span>
            <span className='flex gap-1 items-center text-xl sm:text-2xl font-semibold text-secondary'>
              {user.name ? user.name : user.username}
              <PiHandWaving className='text-primary text-lg sm:text-xl' />
            </span>
          </div>
          
          <div className='text-sm text-secondary font-medium mb-2'>
            {customDate}
          </div>
          
          <p className='text-sm sm:text-base text-secondary font-medium'>
            Here's a quick summary for you,
          </p>
        </div>

        {/* Cards Section */}
        <div className='w-full'>
          <DashboardSummaryCard/>
        </div>
      </div>
    </div>
  )
}

export default Dashboard_Page