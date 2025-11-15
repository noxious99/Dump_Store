import React, { useEffect, useState } from 'react';
import { User, Mail, Lock, Camera, Save, Eye, EyeOff } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import axiosInstance from '@/utils/axiosInstance';

const Profile: React.FC = () => {
    const [activeTab, setActiveTab] = useState('personal');
    const [showPassword, setShowPassword] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isProfileInfoFetchLoading, setIsProfileInfoFetchLoading] = useState(false)

    const [userData, setUserData] = useState({
        username: '',
        email: '',
        name: '',
        avatar: '',
        created_at: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const fetchProfileInfo = async () => {
        setIsProfileInfoFetchLoading(true)
        try {
            const res = await axiosInstance.get("/v1/user/profile")
            console.log("res: ", res)
            setUserData((prev) => ({
                ...prev,
                username: res.data.username,
                name: res.data.name,
                email: res.data.email,
                avatar: res.data.avatar,
                created_at: res.data.created_at || res.data.createdAt
            }))
        } catch (error) {
            console.log(error)
        } finally {
            setIsProfileInfoFetchLoading(false)
        }
    }

    useEffect(() => {
        fetchProfileInfo()
    }, [])

    const handleInputChange = (e: any) => {
        const { name, value } = e.target;
        setUserData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        console.log('Saving profile data:', userData);
        setIsEditing(false);
    };

    const handleAvatarChange = (e: any) => {
        console.log(e)
    };

    // Loading State
    if (isProfileInfoFetchLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 text-primary animate-spin" />
                    <p className="text-muted-foreground font-medium">Loading profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-6xl mx-auto">
                {/* Mobile-optimized Header */}
                <div className="bg-card border-b border-border p-4 sm:p-6">
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">Profile Settings</h1>
                    <p className="text-sm text-muted-foreground">Manage your account settings</p>
                </div>

                {/* Mobile Avatar Section */}
                <div className="bg-card border-b border-border p-6">
                    <div className="flex flex-col items-center">
                        <div className="relative mb-4">
                            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-primary-lite flex items-center justify-center overflow-hidden">
                                {userData.avatar ? (
                                    <img src={userData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-12 h-12 sm:w-14 sm:h-14 text-primary" />
                                )}
                            </div>
                            <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-accent transition-colors shadow-lg">
                                <Camera className="w-4 h-4" />
                                <input
                                    id="avatar-upload"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleAvatarChange}
                                />
                            </label>
                        </div>
                        <h3 className="font-semibold text-lg text-foreground">
                            {userData.name || "Share your name"}
                        </h3>
                        <p className="text-sm text-gray-600">@{userData.username}</p>
                    </div>
                </div>

                {/* Mobile Tab Navigation */}
                <div className="bg-card border-b border-border">
                    <nav className="flex">
                        <button
                            onClick={() => setActiveTab('personal')}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 transition-colors border-b-2 ${activeTab === 'personal'
                                    ? 'border-primary text-primary bg-primary-lite/30'
                                    : 'border-transparent text-muted-foreground'
                                }`}
                        >
                            <User className="w-5 h-5" />
                            <span className="font-medium text-sm sm:text-base">Personal</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('security')}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 transition-colors border-b-2 ${activeTab === 'security'
                                    ? 'border-primary text-primary bg-primary-lite/30'
                                    : 'border-transparent text-muted-foreground'
                                }`}
                        >
                            <Lock className="w-5 h-5" />
                            <span className="font-medium text-sm sm:text-base">Security</span>
                        </button>
                    </nav>
                </div>

                {/* Main Content */}
                <div className="p-4 sm:p-6">
                    <div className="bg-card">
                        {activeTab === 'personal' && (
                            <div>
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                                    <h2 className="text-lg sm:text-xl font-semibold text-foreground">Personal Information</h2>
                                    {!isEditing ? (
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="w-full sm:w-auto px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-accent transition-colors font-medium text-sm"
                                        >
                                            Edit Profile
                                        </button>
                                    ) : (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setIsEditing(false)}
                                                className="flex-1 sm:flex-none px-4 py-2.5 bg-grey-x200 text-foreground rounded-lg hover:bg-grey-x100 transition-colors font-medium text-sm"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleSave}
                                                className="flex-1 sm:flex-none px-4 py-2.5 bg-success text-white rounded-lg hover:opacity-90 transition-opacity font-medium flex items-center justify-center gap-2 text-sm"
                                            >
                                                <Save className="w-4 h-4" />
                                                Save
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-5">
                                    {/* Username */}
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">
                                            Username
                                        </label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-input" />
                                            <input
                                                type="text"
                                                name="username"
                                                value={userData.username}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                                className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent disabled:opacity-60 disabled:cursor-not-allowed text-foreground text-base"
                                            />
                                        </div>
                                    </div>

                                    {/* Full Name */}
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">
                                            Full Name
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={userData.name}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                            className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent disabled:opacity-60 disabled:cursor-not-allowed text-foreground text-base"
                                            placeholder="Enter your full name"
                                        />
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">
                                            Email Address
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-input" />
                                            <input
                                                type="email"
                                                name="email"
                                                value={userData.email}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                                className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent disabled:opacity-60 disabled:cursor-not-allowed text-foreground text-base"
                                            />
                                        </div>
                                    </div>

                                    {/* Account Info */}
                                    <div className="pt-6 border-t border-border">
                                        <h3 className="text-sm font-medium text-foreground mb-4">Account Information</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div className="bg-grey-x100 rounded-lg p-4">
                                                <p className="text-xs sm:text-sm text-muted-foreground mb-1">Member Since</p>
                                                <p className="font-medium text-foreground text-sm sm:text-base">
                                                    {new Date(userData.created_at).toLocaleDateString('en-US', {
                                                        month: 'long',
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    })}
                                                </p>
                                            </div>
                                            <div className="bg-grey-x100 rounded-lg p-4">
                                                <p className="text-xs sm:text-sm text-muted-foreground mb-1">Last Updated</p>
                                                <p className="font-medium text-foreground text-sm sm:text-base">Today</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div>
                                <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-6">Security Settings</h2>

                                <div className="space-y-5">
                                    {/* Current Password */}
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">
                                            Current Password
                                        </label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-input" />
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                name="currentPassword"
                                                value={userData.currentPassword}
                                                onChange={handleInputChange}
                                                className="w-full pl-10 pr-12 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent text-foreground text-base"
                                                placeholder="Enter current password"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-input hover:text-foreground p-1"
                                            >
                                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* New Password */}
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">
                                            New Password
                                        </label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-input" />
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                name="newPassword"
                                                value={userData.newPassword}
                                                onChange={handleInputChange}
                                                className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent text-foreground text-base"
                                                placeholder="Enter new password"
                                            />
                                        </div>
                                    </div>

                                    {/* Confirm Password */}
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">
                                            Confirm New Password
                                        </label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-input" />
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                name="confirmPassword"
                                                value={userData.confirmPassword}
                                                onChange={handleInputChange}
                                                className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent text-foreground text-base"
                                                placeholder="Confirm new password"
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <button className="w-full sm:w-auto px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-accent transition-colors font-medium">
                                            Update Password
                                        </button>
                                    </div>

                                    {/* Additional Security Info */}
                                    <div className="pt-6 border-t border-border">
                                        <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
                                            <h4 className="font-medium text-foreground mb-2 text-sm sm:text-base">Password Requirements</h4>
                                            <ul className="text-xs sm:text-sm text-muted-foreground space-y-1">
                                                <li>• At least 8 characters long</li>
                                                <li>• Contains at least one uppercase letter</li>
                                                {/* <li>• Contains at least one number</li>
                                                    <li>• Contains at least one special character</li> */}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Profile