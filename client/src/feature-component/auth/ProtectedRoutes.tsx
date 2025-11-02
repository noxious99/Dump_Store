import React from 'react'
import { useSelector } from 'react-redux'
import { selectUser } from './userSlice'
import { Navigate, Outlet } from 'react-router-dom'

const ProtectedRoutes: React.FC = () => {
    const user = useSelector(selectUser)
    if (user.loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        )
    }
    
    if (!user.token) {
        return <Navigate to="/auth" replace />
    }
    
    return <Outlet />
}
export default ProtectedRoutes