import React from 'react'
import { User, Camera } from 'lucide-react'
import { Card } from '@/components/ui/card'

interface ProfileHeaderProps {
    userData: {
        name: string
        username: string
        avatar: string
        created_at: string
    }
    onAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ userData, onAvatarChange }) => {
    console.log(userData)
    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A'
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        })
    }

    return (
        <Card className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
            {/* Gradient Banner */}
            <div className="h-24 sm:h-32 bg-gradient-to-r from-primary via-accent to-secondary" />

            {/* Avatar & User Info */}
            <div className="px-4 sm:px-6 pb-6">
                <div className="flex flex-col items-center -mt-12 sm:-mt-16">
                    {/* Avatar */}
                    <div className="relative">
                        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-card bg-muted flex items-center justify-center overflow-hidden">
                            {userData.avatar ? (
                                <img
                                    src={userData.avatar}
                                    alt="Avatar"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <User className="w-10 h-10 sm:w-14 sm:h-14 text-muted-foreground" />
                            )}
                        </div>
                        <label
                            htmlFor="avatar-upload"
                            className="absolute bottom-1 right-1 p-2 bg-primary text-primary-foreground rounded-full shadow-lg cursor-pointer hover:bg-accent transition-colors"
                        >
                            <Camera className="w-4 h-4" />
                            <input
                                id="avatar-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={onAvatarChange}
                            />
                        </label>
                    </div>

                    {/* User Details */}
                    <h2 className="mt-4 text-xl sm:text-2xl font-bold text-foreground">
                        {userData.name || 'Add your name'}
                    </h2>
                    <p className="text-sm text-muted-foreground">@{userData.username}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                        Member since {formatDate(userData.created_at)}
                    </p>
                </div>
            </div>
        </Card>
    )
}

export default ProfileHeader
