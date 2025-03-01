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
      <div className='w-[100%]'>
        <span className="flex gap-5 items-start">
          <button onClick={() => handleExpenseOption(1)} className="flex items-center px-4 py-2 bg-black text-gray-200 rounded gap-2   hover:bg-gray-800 hover:scale-[1.02]">
            <GiPayMoney className="text-3xl" /> Log Expense
          </button>
          <button onClick={() => handleExpenseOption(2)} className="flex items-center px-4 py-2 bg-black text-gray-200 rounded gap-2 transition-all duration-300 hover:bg-gray-800 hover:scale-[1.02]">
            <FaRegHandshake className="text-3xl" /> Log Debt/Owe
          </button>
        </span>
        <div className='w-[100%] h-[2px] bg-[#6B7274] my-5'></div>
        {showComponent === 1 ? < ExpenseDetails /> : <DebtDetails />}   
      </div>
    </>
  )
}

export default ExpenseMain