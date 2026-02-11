import React, { useEffect, useState } from 'react'
import { User, Shield, Settings, Loader2 } from 'lucide-react'
import axiosInstance from '@/utils/axiosInstance'
import { toast } from 'sonner'

import ProfileHeader from '@/feature-component/profile/ProfileHeader'
import PersonalInfoTab from '@/feature-component/profile/PersonalInfoTab'
import SecurityTab from '@/feature-component/profile/SecurityTab'
import PreferencesTab from '@/feature-component/profile/PreferencesTab'

type TabId = 'personal' | 'security' | 'preferences'

const Profile: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabId>('personal')
    const [isLoading, setIsLoading] = useState(true)
    const [userData, setUserData] = useState({
        username: '',
        email: '',
        name: '',
        avatar: '',
        created_at: ''
    })

    const fetchProfileInfo = async () => {
        setIsLoading(true)
        try {
            const res = await axiosInstance.get('/v1/user/profile')
            setUserData({
                username: res.data.userInfo.username || '',
                name: res.data.userInfo.name || '',
                email: res.data.userInfo.email || '',
                avatar: res.data.userInfo.avatar || '',
                created_at: res.data.userInfo.created_at || ''
            })
        } catch (error) {
            console.error('Failed to fetch profile:', error)
            toast.error('Failed to load profile')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchProfileInfo()
    }, [])

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const formData = new FormData()
        formData.append('avatar', file)

        try {
            await axiosInstance.post('/v1/user/avatar', formData)
            toast.success('Avatar updated')
            fetchProfileInfo()
        } catch (error) {
            toast.error('Failed to upload avatar')
        }
    }

    const tabs = [
        { id: 'personal' as TabId, label: 'Personal Info', shortLabel: 'Personal', icon: User },
        { id: 'security' as TabId, label: 'Security', shortLabel: 'Security', icon: Shield },
        { id: 'preferences' as TabId, label: 'Preferences', shortLabel: 'Settings', icon: Settings }
    ]

    // Loading State
    if (isLoading) {
        return (
            <div className="min-h-screen bg-grey-x100 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    <p className="text-muted-foreground font-medium">Loading profile...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-grey-x100">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

                {/* Profile Header */}
                <ProfileHeader
                    userData={userData}
                    onAvatarChange={handleAvatarChange}
                />

                {/* Tab Navigation */}
                <div className="mt-6">
                    <div className="flex border-b border-border bg-card rounded-t-xl overflow-hidden">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 sm:py-4 border-b-2 transition-colors font-medium text-sm sm:text-base ${
                                    activeTab === tab.id
                                        ? 'border-primary text-primary bg-primary/5'
                                        : 'border-transparent text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                <tab.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                                <span className="hidden sm:inline">{tab.label}</span>
                                <span className="sm:hidden">{tab.shortLabel}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Content */}
                {activeTab === 'personal' && (
                    <PersonalInfoTab
                        userData={userData}
                        onUpdate={fetchProfileInfo}
                    />
                )}

                {activeTab === 'security' && <SecurityTab />}

                {activeTab === 'preferences' && <PreferencesTab />}
            </div>
        </div>
    )
}

export default Profile
