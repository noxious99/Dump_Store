import React from 'react'
import { useSelector } from 'react-redux'
import { selectUser } from './userSlice'
import { Navigate } from 'react-router-dom'
import Home from '@/pages/Home-Page'

const HomeRedirect: React.FC = () => {
    const user = useSelector(selectUser)

    // Show loading while checking auth state
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

    // If logged in, redirect to dashboard
    if (user.token) {
        return <Navigate to="/dashboard" replace />
    }

    // If not logged in, show home page
    return <Home />
}

export default HomeRedirect
