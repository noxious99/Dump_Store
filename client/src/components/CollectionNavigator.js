import React from 'react';
import { TbCoinTaka } from "react-icons/tb";
import { GrNotes } from "react-icons/gr";
import { GiStairsGoal } from "react-icons/gi";
import { Link, useLocation } from 'react-router-dom';

const CollectionNavigator = () => {
    const location = useLocation();

    return (
        <div className='flex flex-col gap-8 w-80 h-[95%] items-center my-10' style={{ border: 'solid #6B7274', borderWidth: '0px 2px 0px 0px' }}>
            <p className='text-gray-300 text-xl mb-5 underline underline-offset-8'>My Collection</p>

            <Link to="./expense" className="w-[70%]">
                <button className={`flex flex-col px-4 py-4 rounded w-full font-semibold text-lg items-center gap-2 hover:bg-red-600 hover:text-gray-100 transition-all duration-300 ease-in-out hover:scale-[1.01]
                    ${location.pathname === "/collection/expense" ? "bg-red-600 text-gray-100" : "bg-red-900 text-gray-200"}`}>
                    <TbCoinTaka className="text-3xl" /> <p>Expenses</p>
                </button>
            </Link>

            <Link to="./notes" className="w-[70%]">
                <button className={`flex flex-col px-4 py-4 rounded w-full font-semibold text-lg items-center gap-2 hover:bg-red-600 hover:text-gray-100 transition-all duration-300 ease-in-out hover:scale-[1.01]
                    ${location.pathname === "/collection/notes" ? "bg-red-600 text-gray-100" : "bg-red-900 text-gray-200"}`}>
                    <GrNotes className="text-3xl" /> <p>Keep Notes</p>
                </button>
            </Link>

            <Link to="./goals" className="w-[70%]">
                <button className={`flex flex-col px-4 py-4 rounded w-full font-semibold text-lg items-center gap-2 hover:bg-red-600 hover:text-gray-100 transition-all duration-300 ease-in-out hover:scale-[1.01]
                    ${location.pathname === "/collection/goals" ? "bg-red-600 text-gray-100" : "bg-red-900 text-gray-200"}`}>
                    <GiStairsGoal className="text-3xl" /> <p>Goal Tracker</p>
                </button>
            </Link>
        </div>
    );
}

export default CollectionNavigator;
