import React from 'react'
import { useSelector } from 'react-redux'
import { selectUser } from './userSlice'
import { Navigate, Outlet } from 'react-router-dom'

const ProtectedRoutes: React.FC = () => {
    const user = useSelector(selectUser)
    if (!user.token) {
        return <Navigate to="/auth" />
    } else {
        return <Outlet/>
    }
}
export default ProtectedRoutes