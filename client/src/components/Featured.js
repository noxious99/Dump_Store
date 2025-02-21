import React from 'react'
import { MdFeaturedPlayList } from "react-icons/md";

const Featured = () => {
    return (
        <>
            <div className="flex items-center justify-center gap-5 h-[60px] text-center text-xl text-gray-300" style={{ backgroundColor: 'rgb(0,0,0,0.5)' }}>
            <MdFeaturedPlayList className='text-2xl'/>
                 <p> Featured </p>
            </div>
            <div className='flex justify-center py-5 text-gray-300'>
                Coming Soon
            </div>
        </>
    )
}

export default Featured