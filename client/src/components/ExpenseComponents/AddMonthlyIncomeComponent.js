import { React, useState } from 'react'
import { FaRegWindowClose } from "react-icons/fa";

const AddMonthlyIncomeComponent = ({handlePopupIncomeDialog, addIncome}) => {
    const [selectedOption, setSelectedOption] = useState("");
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [error, setError] = useState("")
    const [addIncomeData, setAddIncomeData] = useState({
        amount: 0,
        source: "",
        date: new Date().getDate(),
        month: currentMonth + 1,
        year: new Date().getFullYear(),
    });
    const handleSubmit = (e) => {
        e.preventDefault()
        if (addIncome.source != "") {
            setError("")
            addIncome(addIncomeData)
        } else {
            setError("please select a source")
        }
    }
    return (
        <>
            <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center">
                <div className="bg-[#1d1d1d] p-6 rounded-lg shadow-lg w-96">
                    <div className="flex flex-col mb-8">
                        <div className="flex justify-between items-center">
                            <p className="text-xl text-gray-200 font-semibold">Income Details</p>
                            <FaRegWindowClose className="text-xl" onClick={() => handlePopupIncomeDialog(false)} />
                        </div>
                        <div>
                            {error && <p className="text-md text-red-500 font-semibold">{error}</p>}
                        </div>
                    </div>
                    <form className="flex flex-col gap-3">
                        <input
                            type="text"
                            placeholder="Enter Amount"
                            className="bg-black text-gray-200 border-0 px-4 py-3 rounded"
                            onChange={(e) => setAddIncomeData({ ...addIncomeData, amount: e.target.value })}
                        />
                        <select
                            id="dropdown"
                            value={addIncomeData.source}
                            onChange={(e) => setAddIncomeData({ ...addIncomeData, source: e.target.value })}
                            className="px-2 py-4 border rounded text-gray-200 bg-black"
                        >
                            <option value="">Select a source</option>
                            <option value="travel">Salary</option>
                            <option value="travel">Investments</option>
                            <option value="travel">Bonus</option>
                            <option value="miscellaneous">Miscellaneous</option>
                        </select>
                        {selectedOption && <p>You selected: {selectedOption}</p>}
                        <button
                            onClick={handleSubmit}
                            className="px-4 py-2 bg-red-600 text-white rounded mt-3"
                        >
                            Entry Income
                        </button>
                    </form>
                </div>
            </div>
        </>
    )
}

export default AddMonthlyIncomeComponent