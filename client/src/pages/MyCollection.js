import React, { useEffect, useState } from 'react'
import CollectionNavigator from '../components/CollectionNavigator'
import { Link, Outlet, Navigate, useLocation  } from 'react-router-dom'
import { TbCoinTaka } from "react-icons/tb";
import { GrNotes } from "react-icons/gr";
import { GiStairsGoal } from "react-icons/gi";


const MyCollection = () => {
    const location = useLocation();
    const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 820)
    useEffect(() => {
        const handleResize = () => {
            setIsLargeScreen(window.innerWidth >= 820)
        }
        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    }, [])
    return (
        <>
            <div className='flex flex-col max-w-[96vw] lg:flex-row gap-0 lg:gap-10'>
                {!isLargeScreen && <div className='relative top-0 flex justify-center gap-6 mt-4'>
                    <Link to="./expense"> <button className={`flex w-[65px] flex-col gap-1 items-center text-gray-200 text-[9px] ${location.pathname === "/collection/expense" ? "bg-red-600 text-gray-100" : "bg-red-900 text-gray-200"} rounded-sm py-1`}>
                        <TbCoinTaka className='text-base' /> Expenses
                    </button> </Link>
                    <Link to="./notes"> <button className={`flex w-[65px] flex-col gap-1 items-center text-gray-200 text-[9px] ${location.pathname === "/collection/notes" ? "bg-red-600 text-gray-100" : "bg-red-900 text-gray-200"} rounded-sm py-1`}>
                        <GrNotes className='text-base' /> Keep Notes
                    </button> </Link>
                    <Link to="./goals"> <button className={`flex w-[65px] flex-col gap-1 items-center text-gray-200 text-[9px] ${location.pathname === "/collection/goals" ? "bg-red-600 text-gray-100" : "bg-red-900 text-gray-200"} rounded-sm py-1`}>
                        <GiStairsGoal className='text-base' /> Goal Tracker
                    </button> </Link>
                </div>}
                {isLargeScreen && <div className='h-[100vh]'>
                    <CollectionNavigator />
                </div>
                }
                <div className='w-full flex justify-center text-gray-200 text-md mx-2 mt-4 lg:mt-10 lg:mx-10'>
                    <Outlet />
                </div>
            </div>
        </>
    )
}

const MyCollectionWrapper = () => <Navigate to='/collection/expense' replace />

export { MyCollection, MyCollectionWrapper };