import React from 'react'
import CollectionNavigator from '../components/CollectionNavigator'
import { Link, Outlet } from 'react-router-dom'


const MyCollection = () => {
    return (
        <>
            <div className='flex gap-10'>
                <div className='h-[100vh]'>
                    <CollectionNavigator />
                </div>
                <div className='w-full flex justify-center mt-10 text-gray-200 text-md mx-10'>
                    <Outlet />
                </div>
            </div>
        </>
    )
}

export default MyCollection