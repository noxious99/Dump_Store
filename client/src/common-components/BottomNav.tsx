import React from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Wallet, Target, Handshake } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface NavTab {
    to: string
    label: string
    icon: LucideIcon
}

// Top-level app sections — each tab lands on its own page.
const TABS: NavTab[] = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/expense-tracker', label: 'Expenses', icon: Wallet },
    { to: '/goals-tracker', label: 'Goals', icon: Target },
    { to: '/iou-tracker', label: 'IOU', icon: Handshake },
]

/**
 * Mobile-only bottom tab bar (hidden on md+, where the top navbar handles things).
 * Visibility is decided by the parent — this just renders the bar when mounted.
 */
const BottomNav: React.FC = () => {
    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border">
            <div className="flex items-stretch justify-around h-16 max-w-lg mx-auto">
                {TABS.map(({ to, label, icon: Icon }) => (
                    <NavLink
                        key={to}
                        to={to}
                        className="flex-1 flex flex-col items-center justify-center gap-1 transition-colors"
                    >
                        {({ isActive }) => (
                            <>
                                <Icon
                                    className={`w-[22px] h-[22px] ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
                                    strokeWidth={isActive ? 2.4 : 2}
                                />
                                <span
                                    className={`text-[10px] leading-none ${
                                        isActive
                                            ? 'text-primary font-semibold'
                                            : 'text-muted-foreground font-medium'
                                    }`}
                                >
                                    {label}
                                </span>
                            </>
                        )}
                    </NavLink>
                ))}
            </div>
        </nav>
    )
}

export default BottomNav
