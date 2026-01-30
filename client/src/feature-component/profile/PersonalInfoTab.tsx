import React, { useState } from 'react'
import { User, AtSign, Mail, Save, Calendar, Target, Wallet, HandCoins, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import axiosInstance from '@/utils/axiosInstance'
import { toast } from 'sonner'

interface PersonalInfoTabProps {
    userData: {
        name: string
        username: string
        email: string
        created_at: string
    }
    onUpdate: () => void
}

const PersonalInfoTab: React.FC<PersonalInfoTabProps> = ({ userData: initialData, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [formData, setFormData] = useState({
        name: initialData.name,
        username: initialData.username,
        email: initialData.email
    })

    // Placeholder stats - replace with actual API data
    const stats = {
        goals_count: 5,
        expenses_count: 47,
        ious_count: 8
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSave = async () => {
        setIsSaving(true)
        try {
            await axiosInstance.put('/v1/user/profile', formData)
            toast.success('Profile updated successfully')
            setIsEditing(false)
            onUpdate()
        } catch (error) {
            toast.error('Failed to update profile')
        } finally {
            setIsSaving(false)
        }
    }

    const handleCancel = () => {
        setFormData({
            name: initialData.name,
            username: initialData.username,
            email: initialData.email
        })
        setIsEditing(false)
    }

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A'
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            year: 'numeric'
        })
    }

    return (
        <div className="space-y-4">
            {/* Personal Info Form */}
            <Card className="bg-card rounded-b-xl rounded-t-none border border-t-0 border-border shadow-sm">
                <CardContent className="p-4 sm:p-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                        <div>
                            <h3 className="text-lg sm:text-xl font-semibold text-foreground">Personal Information</h3>
                            <p className="text-sm text-muted-foreground">Update your personal details</p>
                        </div>
                        {!isEditing ? (
                            <Button
                                onClick={() => setIsEditing(true)}
                                className="w-full sm:w-auto bg-primary hover:bg-accent text-primary-foreground"
                            >
                                Edit Profile
                            </Button>
                        ) : (
                            <div className="flex gap-2 w-full sm:w-auto">
                                <Button
                                    variant="outline"
                                    onClick={handleCancel}
                                    className="flex-1 sm:flex-none"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="flex-1 sm:flex-none bg-success hover:bg-success/90 text-white"
                                >
                                    {isSaving ? (
                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    ) : (
                                        <Save className="w-4 h-4 mr-2" />
                                    )}
                                    Save
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Form Fields */}
                    <div className="space-y-4">
                        {/* Full Name */}
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                                Full Name
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <Input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    placeholder="Enter your full name"
                                    className="h-12 pl-10 bg-muted border-border focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:bg-grey-x100 disabled:cursor-not-allowed disabled:opacity-70"
                                />
                            </div>
                        </div>

                        {/* Username */}
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                                Username
                            </label>
                            <div className="relative">
                                <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <Input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    placeholder="your_username"
                                    className="h-12 pl-10 bg-muted border-border focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:bg-grey-x100 disabled:cursor-not-allowed disabled:opacity-70"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <Input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    placeholder="your@email.com"
                                    className="h-12 pl-10 bg-muted border-border focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:bg-grey-x100 disabled:cursor-not-allowed disabled:opacity-70"
                                />
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">We'll never share your email</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Account Stats */}
            <Card className="bg-card rounded-xl border border-border shadow-sm">
                <CardContent className="p-4 sm:p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Account Overview</h3>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-muted rounded-lg p-4">
                            <div className="w-8 h-8 p-1.5 rounded-lg bg-primary/10 text-primary mb-2">
                                <Calendar className="w-full h-full" />
                            </div>
                            <p className="text-xl sm:text-2xl font-bold text-foreground">
                                {formatDate(initialData.created_at)}
                            </p>
                            <p className="text-xs sm:text-sm text-muted-foreground">Member Since</p>
                        </div>
                        <div className="bg-muted rounded-lg p-4">
                            <div className="w-8 h-8 p-1.5 rounded-lg bg-success/10 text-success mb-2">
                                <Target className="w-full h-full" />
                            </div>
                            <p className="text-xl sm:text-2xl font-bold text-foreground">{stats.goals_count}</p>
                            <p className="text-xs sm:text-sm text-muted-foreground">Goals Created</p>
                        </div>
                        <div className="bg-muted rounded-lg p-4">
                            <div className="w-8 h-8 p-1.5 rounded-lg bg-primary/10 text-primary mb-2">
                                <Wallet className="w-full h-full" />
                            </div>
                            <p className="text-xl sm:text-2xl font-bold text-foreground">{stats.expenses_count}</p>
                            <p className="text-xs sm:text-sm text-muted-foreground">Expenses Logged</p>
                        </div>
                        <div className="bg-muted rounded-lg p-4">
                            <div className="w-8 h-8 p-1.5 rounded-lg bg-accent/10 text-accent mb-2">
                                <HandCoins className="w-full h-full" />
                            </div>
                            <p className="text-xl sm:text-2xl font-bold text-foreground">{stats.ious_count}</p>
                            <p className="text-xs sm:text-sm text-muted-foreground">IOUs Tracked</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default PersonalInfoTab
