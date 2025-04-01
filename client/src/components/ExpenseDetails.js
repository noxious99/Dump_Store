import React, { useEffect, useState } from "react";
import AddMonthlyExpenseComponent from "./ExpenseComponents/AddMonthlyExpenseComponent";
import AddMonthlyIncomeComponent from "./ExpenseComponents/AddMonthlyIncomeComponent";
import axiosInstance from "../utils/axiosInstance";
import { months } from "../utils/constants";
import { MdOutlineWorkHistory, MdMoneyOff } from "react-icons/md";
import { GiReceiveMoney } from "react-icons/gi";
import { GoTriangleLeft, GoTriangleRight } from "react-icons/go";

const ExpenseDetails = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [balance, setBalance] = useState(0);
  const [expense, setExpense] = useState(0);
  const [income, setIncome] = useState(0);
  const [showPopupExpense, setShowPopupExpense] = useState(false);
  const [showPopupIncome, setShowPopupIncome] = useState(false);
  const [expanseList, setExpenseList] = useState([]);


  useEffect(() => {
    const getMonthlyExpenseSummary = async () => {
      try {
        const res = await axiosInstance.get(`api/expense/getexpense/monthly/${currentMonth + 1}/${new Date().getFullYear()}`);
        if (res.status == 200) {
          setExpenseList(res.data);
        }
      } catch (error) {
        console.log(error.err)
      }
    }
    const getMonthlySummary = async () => {
      try {
        const res = await axiosInstance.get(`api/expense/getsummary/monthly/${currentMonth + 1}/${new Date().getFullYear()}`);
        if (res.status == 200) {

          if (res.data.totalIncome !== undefined) {
            setIncome(res.data.totalIncome)
          }
          else {
            setIncome(0)
          }
          if (res.data.totalExpense !== undefined) {
            setExpense(res.data.totalExpense)
          } else {
            setExpense(0)
          }
          setBalance(res.data.balance)
        }
      } catch (error) {
        console.log(error.err)
      }
    }
    getMonthlySummary()
    getMonthlyExpenseSummary();
  }, [currentMonth]);

  const handlePopupExpenseDialog = (val) => {
    setShowPopupExpense(val)
  }
  const handlePopupIncomeDialog = (val) => {
    setShowPopupIncome(val)
  }
  const addExpense = async (addExpenseData) => {
    const body = addExpenseData;
    try {
      const res = await axiosInstance.post("/api/expense/addexpense", body);
      if (res.status === 201) {
        const updatedExpenseList = [res.data, ...expanseList];
        setExpenseList(updatedExpenseList);
        // let totalExpense = updatedExpenseList.reduce((acc, curr) => acc + curr.amount, 0);
        setExpense(expense + res.data.amount);
        setBalance(balance - res.data.amount)
      }
    } catch (error) {
      console.log(error.err);
    } finally {
      setShowPopupExpense(false);
    }
  }

  const addIncome = async (addIncomeData) => {
    const body = addIncomeData;
    try {
      const res = await axiosInstance.post("/api/expense/addincome", body);
      if (res.status === 201) {
        setIncome(income + res.data.amount)
        setBalance(balance + res.data.amount)
      }
    } catch (error) {
      console.log(error.err);
    } finally {
      setShowPopupIncome(false);
    }
  }

  console.log("hello : ", expense)

  const handleNextMonth = () => {
    setCurrentMonth((prev) => (prev + 1) % 12);
  };
  const handlePrevMonth = () => {
    setCurrentMonth((prev) => (prev - 1 + 12) % 12);
  };

  return (
    <>
      <div className="flex flex-col lg:flex-row gap-1 lg:gap-3 lg:justify-between text-lg lg:items-center">

        <span className="flex gap-4 lg:items-center justify-between lg:mr-4">
          <span className="flex w-[104px] h-[22px] lg:h-[28px] lg:w-[135px] items-center justify-center gap-1 lg:gap-2 px-3 py-2 lg:px-4 lg:py-2 bg-red-700 rounded bg-opacity-30 hover:bg-opacity-60 hover:ring-1 active:ring-1 ring-red-500">
            <MdMoneyOff className="text-xl lg:text-2xl" />
            <button className="text-xs lg:text-base" onClick={() => setShowPopupExpense(true)}> Add Expense </button>
          </span>
          <span className="flex w-[104px] h-[22px] lg:h-[28px] lg:w-[135px] justify-center items-center gap-1 lg:gap-2 px-3 py-2 lg:px-4 lg:py-2 bg-green-600 rounded bg-opacity-40 hover:bg-opacity-60 hover:ring-1 ring-green-500">
            <GiReceiveMoney className="text-xl lg:text-2xl" />
            <button className="text-xs lg:text-base" onClick={() => setShowPopupIncome(true)}> Add Income </button>
          </span>
        </span>


        <span className="flex flex-col lg:flex-row lg:gap-3 lg:items-center lg:ml-4">
          <div className="flex items-center rounded-lg gap-3 justify-between lg:mr-4 mb-1 mt-1 lg:mb-0 lg:mt-0">
            <button onClick={handlePrevMonth} className="text-3xl lg:text-2xl p-1 rounded-full">
              <GoTriangleLeft />
            </button>
            <div className="text-lg font-semibold">
              <span>{months[currentMonth]}</span>
            </div>
            <button onClick={handleNextMonth} className="text-3xl lg:text-2xl p-1 rounded-full">
              <GoTriangleRight />
            </button>
          </div>

          <span className="flex gap-2 items-center justify-evenly">
            <MdOutlineWorkHistory className="text-4xl lg:text-4xl" />
            <span className="flex flex-col lg:flex-row gap-1 text-sm lg:text-lg lg:items-center">Expense: <p className="text-red-400 text-base lg:text-xl font-semibold"> {expense} </p></span>
            <span className="flex flex-col lg:flex-row gap-1 text-sm lg:text-lg lg:items-center">Income: <p className="text-green-400 text-base lg:text-xl font-semibold"> {income} </p></span>
            <span className="flex flex-col lg:flex-row gap-1 text-sm lg:text-lg lg:items-center">Balance: <p className={`${balance > 0 ? 'text-green-400' : 'text-red-400'} text-base lg:text-xl font-semibold`}> {balance} </p></span>
          </span>
        </span>
      </div>

      <div className="w-[100%] h-[1px] bg-[#6B7274] my-2 lg:my-5"></div>

      {expanseList && expanseList.length > 0 ? (
        <div className="flex flex-col gap-2">
          {expanseList.map((expense, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-black px-4 py-2 rounded-lg shadow-md border border-gray-800 text-gray-200 text-base"
            >
              <div className="flex items-center gap-3">
                <span className="flex flex-col items-center bg-gray-800 px-2 py-1 rounded text-gray-300 font-medium text-sm">
                  <span>{months[currentMonth].slice(0, 3)}</span>
                  <span>{expense.date}</span>
                </span>
                <span className="capitalize text-gray-300">{expense.hasOwnProperty("category") ? expense.category : expense.source}</span>
              </div>

              <span className={`${expense.hasOwnProperty("category") ? 'text-red-400' : 'text-green-400'} text-lg font-semibold`}>
                ৳{expense.amount}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-400 text-center mt-5">No expenses recorded this month.</p>
      )}

      {showPopupExpense && (
        <AddMonthlyExpenseComponent addExpense={addExpense} handlePopupExpenseDialog={handlePopupExpenseDialog} />
      )}
      {showPopupIncome && (
        <AddMonthlyIncomeComponent addIncome={addIncome} handlePopupIncomeDialog={handlePopupIncomeDialog} />
      )}

    </>
  );
};

export default ExpenseDetails;
