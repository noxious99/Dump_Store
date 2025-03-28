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
        <span className="flex gap-5 justify-between lg:justify-start lg:items-start">
          <button onClick={() => handleExpenseOption(1)} className={`flex items-center px-3 py-3 lg:px-4 lg:py-2 ${showComponent == 1 ? 'bg-gray-800' : 'bg-black'} text-gray-200 rounded gap-2   hover:bg-gray-800 hover:scale-[1.02] `}>
            <GiPayMoney className="text-xl lg:text-3xl" /> <p className='text-sm lg:text-lg'>Log Expense</p>
          </button>
          <button onClick={() => handleExpenseOption(2)} className={`flex items-center px-3 py-3 lg:px-4 lg:py-2 ${showComponent != 1 ? 'bg-gray-800' : 'bg-black'} text-gray-200 rounded gap-2   hover:bg-gray-800 hover:scale-[1.02] `}>
            <FaRegHandshake className="text-xl lg:text-3xl" /> <p className='text-sm lg:text-lg'>Log Debt/Owe</p>
          </button>
        </span>
        <div className='w-[100%] h-[2px] bg-[#6B7274] my-5'></div>
        {showComponent === 1 ? < ExpenseDetails /> : <DebtDetails />}   
      </div>
    </>
  )
}

export default ExpenseMain