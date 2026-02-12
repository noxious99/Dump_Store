import React, { useState } from 'react'
import { Sun, Moon, Monitor, Bell, DollarSign, Download, Trash2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import axiosInstance from '@/utils/axiosInstance'
import { toast } from 'sonner'
import { useTheme } from '@/hooks/useTheme'

const PreferencesTab: React.FC = () => {
    const { theme, setTheme } = useTheme()
    const [preferences, setPreferences] = useState({
        currency: 'USD',
        notifications: true
    })

    const handleDeleteAccount = async () => {
        try {
            await axiosInstance.delete('/v1/user/account')
            toast.success('Account deleted')
            window.location.href = '/'
        } catch (error) {
            toast.error('Failed to delete account')
        }
    }

    const getThemeIcon = () => {
        switch (theme) {
            case 'dark': return <Moon className="w-5 h-5 text-primary" />
            case 'light': return <Sun className="w-5 h-5 text-primary" />
            default: return <Monitor className="w-5 h-5 text-primary" />
        }
    }

    return (
        <div className="space-y-4">
            {/* Preferences Card */}
            <Card className="bg-card rounded-b-xl rounded-t-none border border-t-0 border-border shadow-sm">
                <CardContent className="p-4 sm:p-6">
                    <div className="mb-6">
                        <h3 className="text-lg sm:text-xl font-semibold text-foreground">Preferences</h3>
                        <p className="text-sm text-muted-foreground">Customize your experience</p>
                    </div>

                    <div className="divide-y divide-border">
                        {/* Theme Setting */}
                        <div className="flex items-center justify-between py-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    {getThemeIcon()}
                                </div>
                                <div>
                                    <p className="font-medium text-foreground">Theme</p>
                                    <p className="text-sm text-muted-foreground">Choose your preferred theme</p>
                                </div>
                            </div>
                            <Select
                                value={theme}
                                onValueChange={(value: 'light' | 'dark' | 'system') => setTheme(value)}
                            >
                                <SelectTrigger className="w-32 bg-muted border-border">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="light">Light</SelectItem>
                                    <SelectItem value="dark">Dark</SelectItem>
                                    <SelectItem value="system">System</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Currency Setting */}
                        <div className="flex items-center justify-between py-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-success/10 rounded-lg">
                                    <DollarSign className="w-5 h-5 text-success" />
                                </div>
                                <div>
                                    <p className="font-medium text-foreground">Currency</p>
                                    <p className="text-sm text-muted-foreground">Default currency for expenses</p>
                                </div>
                            </div>
                            <Select
                                value={preferences.currency}
                                onValueChange={(value) => setPreferences(p => ({ ...p, currency: value }))}
                            >
                                <SelectTrigger className="w-32 bg-muted border-border">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="USD">USD ($)</SelectItem>
                                    <SelectItem value="EUR">EUR (€)</SelectItem>
                                    <SelectItem value="GBP">GBP (£)</SelectItem>
                                    <SelectItem value="INR">INR (₹)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Notifications Setting */}
                        <div className="flex items-center justify-between py-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-accent/10 rounded-lg">
                                    <Bell className="w-5 h-5 text-accent" />
                                </div>
                                <div>
                                    <p className="font-medium text-foreground">Email Notifications</p>
                                    <p className="text-sm text-muted-foreground">Receive updates and reminders</p>
                                </div>
                            </div>
                            <Switch
                                checked={preferences.notifications}
                                onCheckedChange={(checked: boolean) => setPreferences(p => ({ ...p, notifications: checked }))}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="bg-card rounded-xl border border-error/20 shadow-sm">
                <CardContent className="p-4 sm:p-6">
                    <div className="mb-6">
                        <h3 className="text-lg sm:text-xl font-semibold text-error">Danger Zone</h3>
                        <p className="text-sm text-muted-foreground">Irreversible actions</p>
                    </div>

                    <div className="space-y-3">
                        {/* Export Data */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border border-border rounded-lg">
                            <div>
                                <p className="font-medium text-foreground">Export Data</p>
                                <p className="text-sm text-muted-foreground">Download all your data</p>
                            </div>
                            <Button variant="outline" className="w-full sm:w-auto border-border hover:bg-muted">
                                <Download className="w-4 h-4 mr-2" />
                                Export
                            </Button>
                        </div>

                        {/* Delete Account */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border border-error/20 rounded-lg bg-error/5">
                            <div>
                                <p className="font-medium text-foreground">Delete Account</p>
                                <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
                            </div>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="outline" className="w-full sm:w-auto border-error text-error hover:bg-error/5">
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Delete
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete your account
                                            and remove all your data from our servers.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={handleDeleteAccount}
                                            className="bg-error hover:bg-error/90"
                                        >
                                            Delete Account
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default PreferencesTab
