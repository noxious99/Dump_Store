import React, { useEffect, useState } from 'react'
import CollectionNavigator from '../components/CollectionNavigator'
import { Link, Outlet, Navigate } from 'react-router-dom'


const MyCollection = () => {
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
            <div className='flex gap-0 lg:gap-10'>
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