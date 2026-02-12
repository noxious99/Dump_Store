import { selectUser } from '@/feature-component/auth/userSlice'
import React from 'react'
import { useSelector } from 'react-redux'
import { PiHandWaving } from "react-icons/pi";
import moment from "moment"
import { Link } from 'react-router-dom'
import { Plus, Wallet, Target } from 'lucide-react'
import DashboardSummaryCard from '@/feature-component/dashboard/DashboardSummaryCard';
import RecentActivity from '@/feature-component/dashboard/RecentActivity';
import WeeklySummary from '@/feature-component/dashboard/WeeklySummary';

const Dashboard_Page: React.FC = () => {
  const user = useSelector(selectUser)
  const customDate = moment(Date.now()).format("dddd, MMMM D, YYYY");

  return (
    <div className='min-h-screen bg-grey-x100 relative'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8'>
        {/* Header */}
        <header className='mb-6 sm:mb-8 animate-fade-up'>
          <div className='flex items-center gap-2 mb-1'>
            <h1 className='text-2xl sm:text-3xl font-bold text-foreground tracking-tight'>
              Welcome back, <span className='text-gradient'>{user.name || user.username}</span>
            </h1>
            <PiHandWaving className='text-warning text-2xl sm:text-3xl' />
          </div>
          <p className='text-sm sm:text-base text-muted-foreground'>
            {customDate}
          </p>
        </header>

        {/* Quick Actions */}
        <section className='mb-5 sm:mb-8 animate-fade-up'>
          <div className='grid grid-cols-3 gap-2 sm:gap-3'>
            {/* Expense + Income grouped */}
            <div className="col-span-2 flex bg-card border border-border rounded-xl overflow-hidden">
              <Link
                to="/expense-tracker"
                className="group flex-1 flex items-center justify-center gap-2 sm:gap-2.5 px-2.5 sm:px-4 py-3 sm:py-3.5 hover:bg-grey-x100 active:scale-[0.98] transition-all duration-200"
              >
                <div className="p-1.5 sm:p-2 bg-error/10 rounded-lg shrink-0">
                  <Plus className="w-4 h-4 text-error" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-foreground hidden min-[360px]:inline">Expense</span>
              </Link>
              <div className="w-px bg-border my-2.5" />
              <Link
                to="/expense-tracker"
                className="group flex-1 flex items-center justify-center gap-2 sm:gap-2.5 px-2.5 sm:px-4 py-3 sm:py-3.5 hover:bg-grey-x100 active:scale-[0.98] transition-all duration-200"
              >
                <div className="p-1.5 sm:p-2 bg-success/10 rounded-lg shrink-0">
                  <Wallet className="w-4 h-4 text-success" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-foreground hidden min-[360px]:inline">Income</span>
              </Link>
            </div>

            {/* Goal separate */}
            <Link
              to="/goals-tracker"
              className="group col-span-1 flex items-center justify-center gap-2 sm:gap-2.5 py-3 sm:py-3.5 bg-card border border-border rounded-xl hover:bg-grey-x100 active:scale-[0.98] transition-all duration-200"
            >
              <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg shrink-0">
                <Target className="w-4 h-4 text-primary" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-foreground hidden min-[360px]:inline">Goal</span>
            </Link>
          </div>
        </section>

        {/* Summary Cards */}
        <section className='mb-5 sm:mb-8'>
          <DashboardSummaryCard />
        </section>

        {/* Recent Activity + Weekly Recap */}
        <section className='pb-6 sm:pb-0'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6'>
            <div className="animate-stagger-in" style={{ animationDelay: '320ms' }}>
              <RecentActivity />
            </div>
            <div className="animate-stagger-in" style={{ animationDelay: '400ms' }}>
              <WeeklySummary />
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Dashboard_Page
