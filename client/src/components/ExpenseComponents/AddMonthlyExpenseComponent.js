import React, { useEffect, useState } from "react";
import { FaRegWindowClose } from "react-icons/fa";
import { IoMdBackspace } from "react-icons/io";

const AddMonthlyExpenseComponent = ({ addExpense, handlePopupExpenseDialog }) => {
    const [selectedOption, setSelectedOption] = useState("");
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [error, setError] = useState("")
    const [calcValue, setCalcValue] = useState("")
    const [addExpenseData, setAddExpenseData] = useState({
        amount: 0,
        category: "",
        date: new Date().getDate(),
        month: currentMonth + 1,
        year: new Date().getFullYear(),
    });

    const sanitizeInput = (input) => {
        const allowedChars = input.replace(/[^0-9+\-*/().\s]/g, '')
        const cleanVal = allowedChars.replace(/^[+\-*/]+|[+\-*/]+$/g, '');
        // const cleanVal = trailRemoved.replace(/(\+\+|\--|\*\*|\/\/|\+\-|\-\+|\*-|\*+|\-+)+/g, '+')
        return cleanVal
    }

    function evaluateExpression(expression) {
        try {
            const cleanVal = sanitizeInput(expression + "")
            const result = new Function('return ' + cleanVal)();
            return result;
        } catch (error) {
            console.error('Error evaluating expression:', error);
            return null;
        }
    }

    const handleDigitClick = (e, digit) => {
        e.preventDefault()
        if (digit === '=') {
            const result = evaluateExpression(calcValue)
            setCalcValue(result);
        }
        else if (digit === 'bksp') {
            if (calcValue.length === 0) {
                return
            }
            const strVal = calcValue.toString()
            const newValue = strVal.slice(0, -1);
            setCalcValue(newValue);
        }
        else if (digit === '+' || digit === '-') {
            if (calcValue.length === 0) {
                setCalcValue(digit);
            } else {
                const lastChar = calcValue[calcValue.length - 1];
                if (lastChar !== '+' && lastChar !== '-') {
                    setCalcValue(calcValue + digit);
                } else {
                    const newValue = calcValue.slice(0, -1) + digit;
                    setCalcValue(newValue);
                }
            }
        }
        else {
            const newValue = calcValue + digit;
            setCalcValue(newValue);
        }
    }
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const result = await evaluateExpression(calcValue);

        if (result === undefined || result === null) {
            setError("Please enter a valid amount");
            return;
        }
        if (result <= 0) {
            setError("Please enter a value more than 0");
            return;
        } 
        if (addExpenseData.category === "") {
            setError("Please select a category");
            return;
        }
    
        const expenseData = { ...addExpenseData, amount: result };
        addExpense(expenseData);
        setError("");
    };
    
    return (
        <>
            <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center">
                <div className="bg-[#1d1d1d] p-6 rounded-lg shadow-lg w-96">
                    <div className="flex flex-col mb-8">
                        <div className="flex justify-between items-center">
                            <p className="text-xl text-gray-200 font-semibold">Expense Details</p>
                            <FaRegWindowClose className="text-xl" onClick={() => handlePopupExpenseDialog(false)} />
                        </div>
                        <div>
                            {error && <p className="text-md text-red-500 font-semibold">{error}</p>}
                        </div>
                    </div>
                    <form className="flex flex-col gap-3">
                        <div className="flex items-center bg-black text-gray-200 w-[96%] pl-4 rounded h-[46px]">
                            <p>{calcValue.length === 0? '0' : calcValue}</p>
                        </div>
                        <div className="w-full flex gap-2 items-start justify-between text-base">
                            <div className="flex gap-2 w-[75%] flex-wrap">
                                <button onClick={(e) => handleDigitClick(e, '1')} className="text-gray-200 bg-black w-[31%] h-[40px] rounded-md ring-1 ring-red-700">1</button>
                                <button onClick={(e) => handleDigitClick(e, '2')} className="text-gray-200 bg-black w-[31%] h-[40px] rounded-md ring-1 ring-red-700">2</button>
                                <button onClick={(e) => handleDigitClick(e, '3')} className="text-gray-200 bg-black w-[31%] h-[40px] rounded-md ring-1 ring-red-700">3</button>
                                <button onClick={(e) => handleDigitClick(e, '4')} className="text-gray-200 bg-black w-[31%] h-[40px] rounded-md ring-1 ring-red-700">4</button>
                                <button onClick={(e) => handleDigitClick(e, '5')} className="text-gray-200 bg-black w-[31%] h-[40px] rounded-md ring-1 ring-red-700">5</button>
                                <button onClick={(e) => handleDigitClick(e, '6')} className="text-gray-200 bg-black w-[31%] h-[40px] rounded-md ring-1 ring-red-700">6</button>
                                <button onClick={(e) => handleDigitClick(e, '7')} className="text-gray-200 bg-black w-[31%] h-[40px] rounded-md ring-1 ring-red-700">7</button>
                                <button onClick={(e) => handleDigitClick(e, '8')} className="text-gray-200 bg-black w-[31%] h-[40px] rounded-md ring-1 ring-red-700">8</button>
                                <button onClick={(e) => handleDigitClick(e, '9')} className="text-gray-200 bg-black w-[31%] h-[40px] rounded-md ring-1 ring-red-700">9</button>
                                <button onClick={(e) => handleDigitClick(e, '0')} className="text-gray-200 bg-black w-[31%] h-[40px] rounded-md ring-1 ring-red-700">0</button>
                                <button onClick={(e) => handleDigitClick(e, 'bksp')} className="text-2xl text-gray-200 bg-black w-[31%] h-[40px] rounded-md ring-1 ring-red-700 flex justify-center items-center"><IoMdBackspace/></button>
                            </div>
                            <div className="flex gap-2 w-[25%] flex-wrap">
                                <button onClick={(e) => handleDigitClick(e, '+')} className="text-gray-200 bg-black w-[100%] h-[40px] rounded-md ring-1 ring-red-700">+</button>
                                <button onClick={(e) => handleDigitClick(e, '-')} className="text-gray-200 bg-black w-[100%] h-[40px] rounded-md ring-1 ring-red-700">-</button>
                                <button onClick={(e) => handleDigitClick(e, '=')} className="text-gray-200 bg-black w-[100%] h-[40px] rounded-md ring-1 ring-red-700">=</button>
                            </div>
                        </div>
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
                            onClick={handleSubmit}
                            className="px-4 py-2 bg-red-600 text-white rounded mt-3"
                        >
                            Entry Expense
                        </button>
                    </form>
                </div>
            </div>
        </>
    )
}

export default AddMonthlyExpenseComponent