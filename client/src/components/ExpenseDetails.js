import { React, useState } from 'react'
import { MdOutlineWorkHistory } from "react-icons/md";
import { MdMoneyOff } from "react-icons/md";
import { GiReceiveMoney } from "react-icons/gi";

const ExpenseDetails = () => {
  const [balance, setBalance] = useState(0)
  const [expense, setExpense] = useState(0)
  const [income, setIncome] = useState(0)
  return (
    <>
      <div className='flex justify-between text-lg items-center'>
        <span className='flex gap-3 items-center mr-4'>
          <span className='flex items-center gap-2 px-4 py-2 bg-red-700 rounded'>
            <MdMoneyOff className='text-2xl' /><button> Add Expense </button>
          </span>
          <span className='flex items-center gap-2 px-4 py-2 bg-green-700 rounded'>
            <GiReceiveMoney className='text-2xl' /><button> Add Income </button>
          </span>
        </span>
        <span className='flex gap-3 items-center ml-4'>
          <MdOutlineWorkHistory className='text-4xl' />
          <span className='flex gap-1'>Expense: <p> {balance} </p></span>
          <span className='flex gap-1'>Income: <p> {expense} </p>  </span>
          <span className='flex gap-1'>Balance: <p> {income} </p></span>
        </span>
      </div>
      <div className='w-[100%] h-[2px] bg-[#6B7274] my-5'></div>
    </>
  )
}

export default ExpenseDetails