import React, { useState } from 'react'
import { FaRegHandshake } from "react-icons/fa";
import { GiPayMoney } from "react-icons/gi";
import ExpenseDetails from './ExpenseDetails';
import DebtDetails from './DebtDetails';

const ExpenseMain = () => {
  const [showComponent, setShowComponet] = useState(1)
  const handleExpenseOption = (val) => {
    setShowComponet(val)
  }
  return (
    <>
      <div className='w-[100%] mb-12'>
        <span className="flex lg:gap-4 justify-between lg:justify-start lg:items-start">
          <button onClick={() => handleExpenseOption(1)} className={`flex w-[128px] h-[38px] lg:h-[44px] lg:w-[190px] justify-center items-center px-2 py-2 lg:px-4 lg:py-3 ${showComponent == 1 ? 'bg-[#7E2020] ring-1 ring-red-600 bg-opacity-55' : 'bg-black'} text-gray-200 rounded gap-2   hover:bg-[#7E2020] hover:bg-opacity-60 hover:scale-[1.02] `}>
            <GiPayMoney className="text-xl lg:text-2xl" /> <p className='text-xs lg:text-base'>Log Expense</p>
          </button>
          <button onClick={() => handleExpenseOption(2)} className={`flex w-[128px] h-[38px] lg:h-[44px] lg:w-[190px] justify-center items-center px-2 py-2 lg:px-4 lg:py-3 ${showComponent != 1 ? 'bg-[#7E2020] ring-1 ring-red-600 bg-opacity-55' : 'bg-black'} text-gray-200 rounded gap-2   hover:bg-[#7E2020] hover:bg-opacity-60 hover:scale-[1.02] `}>
            <FaRegHandshake className="text-xl lg:text-2xl" /> <p className='text-xs lg:text-base'>Log Debt/Owe</p>
          </button>
        </span>
        <div className='w-[100%] h-[2px] bg-[#6B7274] my-2 lg:my-5'></div>
        {showComponent === 1 ? < ExpenseDetails /> : <DebtDetails />}   
      </div>
    </>
  )
}

export default ExpenseMain