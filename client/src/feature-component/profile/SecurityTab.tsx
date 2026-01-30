import React, { useState } from 'react'
import { Lock, Eye, EyeOff, Loader2, Check } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import axiosInstance from '@/utils/axiosInstance'
import { toast } from 'sonner'

const SecurityTab: React.FC = () => {
    const [showPassword, setShowPassword] = useState(false)
    const [isUpdating, setIsUpdating] = useState(false)
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setPasswordData(prev => ({ ...prev, [name]: value }))
    }

    const handleUpdatePassword = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('Passwords do not match')
            return
        }
        if (passwordData.newPassword.length < 8) {
            toast.error('Password must be at least 8 characters')
            return
        }

        setIsUpdating(true)
        try {
            await axiosInstance.put('/v1/user/password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            })
            toast.success('Password updated successfully')
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
        } catch (error) {
            toast.error('Failed to update password')
        } finally {
            setIsUpdating(false)
        }
    }

    const isValidLength = passwordData.newPassword.length >= 8
    const hasNumber = /[0-9]/.test(passwordData.newPassword)
    const hasUppercase = /[A-Z]/.test(passwordData.newPassword)
    const passwordsMatch = passwordData.newPassword === passwordData.confirmPassword && passwordData.confirmPassword !== ''
    const canSubmit = passwordData.currentPassword && passwordData.newPassword && passwordData.confirmPassword && passwordsMatch

    return (
        <Card className="bg-card rounded-b-xl rounded-t-none border border-t-0 border-border shadow-sm">
            <CardContent className="p-4 sm:p-6">
                <div className="mb-6">
                    <h3 className="text-lg sm:text-xl font-semibold text-foreground">Security Settings</h3>
                    <p className="text-sm text-muted-foreground">Manage your password and security options</p>
                </div>

                <div className="space-y-4">
                    {/* Current Password */}
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                            Current Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <Input
                                type={showPassword ? 'text' : 'password'}
                                name="currentPassword"
                                value={passwordData.currentPassword}
                                onChange={handleChange}
                                placeholder="Enter current password"
                                className="h-12 pl-10 pr-12 bg-muted border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
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
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <Input
                                type={showPassword ? 'text' : 'password'}
                                name="newPassword"
                                value={passwordData.newPassword}
                                onChange={handleChange}
                                placeholder="Enter new password"
                                className="h-12 pl-10 bg-muted border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                            Confirm New Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <Input
                                type={showPassword ? 'text' : 'password'}
                                name="confirmPassword"
                                value={passwordData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Confirm new password"
                                className="h-12 pl-10 bg-muted border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                        {passwordData.confirmPassword && !passwordsMatch && (
                            <p className="text-xs text-error mt-1">Passwords do not match</p>
                        )}
                        {passwordsMatch && (
                            <p className="text-xs text-success mt-1 flex items-center gap-1">
                                <Check className="w-3 h-3" /> Passwords match
                            </p>
                        )}
                    </div>

                    <Button
                        onClick={handleUpdatePassword}
                        disabled={isUpdating || !canSubmit}
                        className="w-full sm:w-auto bg-primary hover:bg-accent text-primary-foreground"
                    >
                        {isUpdating && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                        Update Password
                    </Button>

                    {/* Password Requirements */}
                    <div className="mt-6 bg-warning/5 border border-warning/20 rounded-lg p-4">
                        <h4 className="font-medium text-foreground mb-2 text-sm sm:text-base">Password Requirements</h4>
                        <ul className="text-xs sm:text-sm text-muted-foreground space-y-1">
                            <li className={`flex items-center gap-2 ${isValidLength ? 'text-success' : ''}`}>
                                {isValidLength ? <Check className="w-3 h-3" /> : <span>•</span>}
                                At least 8 characters long
                            </li>
                            <li className={`flex items-center gap-2 ${hasNumber ? 'text-success' : ''}`}>
                                {hasNumber ? <Check className="w-3 h-3" /> : <span>•</span>}
                                Contains at least one number
                            </li>
                            <li className={`flex items-center gap-2 ${hasUppercase ? 'text-success' : ''}`}>
                                {hasUppercase ? <Check className="w-3 h-3" /> : <span>•</span>}
                                Contains at least one uppercase letter
                            </li>
                        </ul>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default SecurityTab
