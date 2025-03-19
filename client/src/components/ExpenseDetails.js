import React, { useEffect, useState } from "react";
import { MdOutlineWorkHistory, MdMoneyOff } from "react-icons/md";
import { GiReceiveMoney } from "react-icons/gi";
import { GoTriangleLeft, GoTriangleRight } from "react-icons/go";
import { FaRegWindowClose } from "react-icons/fa";
import axiosInstance from "../utils/axiosInstance";
import { months } from "../utils/constants";

const ExpenseDetails = () => {
  const [selectedOption, setSelectedOption] = useState("");
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [balance, setBalance] = useState(0);
  const [expense, setExpense] = useState(0);
  const [income, setIncome] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [expanseList, setExpenseList] = useState([]);
  const [addExpenseData, setAddExpenseData] = useState({
    amount: 0,
    category: "",
    date: new Date().getDate(),
    month: currentMonth + 1,
    year: new Date().getFullYear(),
  });


  useEffect(() => {
    const getMonthlySummary = async () => {
      try {
        const res = await axiosInstance.get(`api/expense/getexpense/monthly/${currentMonth + 1}/${new Date().getFullYear()}`);
        if (res.status == 200) {
          setExpenseList(res.data);
          let totalExpense = res.data.reduce((acc, curr) => acc + curr.amount, 0);
          setExpense(totalExpense);
        }
      } catch (error) {
        console.log(error.err)
      }
    }
    getMonthlySummary();
  }, [currentMonth]);

  const addExpense = async (e) => {
    e.preventDefault();
    const body = addExpenseData;
    try {
      const res = await axiosInstance.post("/api/expense/addexpense", body);
      if (res.status === 201) {
        const updatedExpenseList = [res.data, ...expanseList];
        setExpenseList(updatedExpenseList);
        let totalExpense = updatedExpenseList.reduce((acc, curr) => acc + curr.amount, 0);
        setExpense(totalExpense);
      }
    } catch (error) {
      console.log(error.err);
    } finally {
      setShowPopup(false);
    }
  }

  const handleNextMonth = () => {
    setCurrentMonth((prev) => (prev + 1) % 12);
  };
  const handlePrevMonth = () => {
    setCurrentMonth((prev) => (prev - 1 + 12) % 12);
  };

  return (
    <>
      <div className="flex justify-between text-lg items-center">

        <span className="flex gap-3 items-center mr-4">
          <span className="flex items-center gap-2 px-4 py-2 bg-red-700 rounded">
            <MdMoneyOff className="text-2xl" />
            <button onClick={() => setShowPopup(true)}> Add Expense </button>
          </span>
          <span className="flex items-center gap-2 px-4 py-2 bg-green-700 rounded">
            <GiReceiveMoney className="text-2xl" />
            <button> Add Income </button>
          </span>
        </span>

        <span className="flex gap-3 items-center ml-4">
          <div className="flex items-center rounded-lg gap-3 justify-between mr-4">
            <button onClick={handlePrevMonth} className="text-2xl p-1 rounded-full">
              <GoTriangleLeft />
            </button>
            <div className="text-lg font-semibold">
              <span>{months[currentMonth]}</span>
            </div>
            <button onClick={handleNextMonth} className="text-2xl p-1 rounded-full">
              <GoTriangleRight />
            </button>
          </div>

          <MdOutlineWorkHistory className="text-4xl" />
          <span className="flex gap-1">Expense: <p className="text-red-400 text-xl font-semibold"> ৳ {expense} </p></span>
          <span className="flex gap-1">Income: <p> {income} </p></span>
          <span className="flex gap-1">Balance: <p> {balance} </p></span>
        </span>
      </div>

      <div className="w-[100%] h-[1px] bg-[#6B7274] my-5"></div>

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
                <span className="capitalize text-gray-300">{expense.category}</span>
              </div>

              <span className="text-green-400 text-lg font-semibold">
                ৳{expense.amount}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-400 text-center mt-5">No expenses recorded this month.</p>
      )}

      {showPopup && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center">
          <div className="bg-[#1d1d1d] p-6 rounded-lg shadow-lg w-96">
            <div className="flex justify-between items-center mb-8">
              <p className="text-xl text-gray-200 font-semibold">Expense Details</p>
              <FaRegWindowClose className="text-xl" onClick={() => setShowPopup(false)} />
            </div>
            <form className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Enter Amount"
                className="bg-black text-gray-200 border-0 px-4 py-3 rounded"
                onChange={(e) => setAddExpenseData({ ...addExpenseData, amount: e.target.value })}
              />
              <select
                id="dropdown"
                value={addExpenseData.category}
                onChange={(e) => setAddExpenseData({ ...addExpenseData, category: e.target.value })}
                className="px-2 py-4 border rounded text-gray-200 bg-black"
              >
                <option value="">Select a category</option>
                <option value="travel">Travel</option>
                <option value="food">Food</option>
                <option value="rent">Rent</option>
                <option value="utility">Utility</option>
                <option value="groceries">Groceries</option>
                <option value="entertainment">Entertainment</option>
                <option value="subscriptions">Subscriptions</option>
                <option value="phone bill">Internet & Mobile</option>
                <option value="clothing">Clothing</option>
                <option value="health">Health</option>
                <option value="miscellaneous">Miscellaneous</option>
              </select>
              {selectedOption && <p>You selected: {selectedOption}</p>}
              <button
                onClick={addExpense}
                className="px-4 py-2 bg-red-600 text-white rounded mt-3"
              >
                Entry Expense
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ExpenseDetails;
