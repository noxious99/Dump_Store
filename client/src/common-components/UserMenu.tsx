import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useSelector } from 'react-redux'
import { selectUser } from '@/feature-component/auth/userSlice'
import { FiLogOut } from "react-icons/fi"
import { FaRegUserCircle } from "react-icons/fa"
import { MdOutlineSettings } from "react-icons/md"

interface UserMenuProps {
    onLogOut: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({
    onLogOut,
}) => {
    const user = useSelector(selectUser)

    const getInitials = (name: string, email: string) => {
        if (name) {
            return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        }
        return email ? email[0].toUpperCase() : 'U'
    }


    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Avatar className="cursor-pointer hover:ring-2 hover:ring-secondary focus:ring-secondary transition-all duration-200">
                    <AvatarImage
                        src={user?.avatar}
                        alt={`${user?.username || 'User'} avatar`}
                    />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {getInitials(user?.username || '', user?.email || '')}
                    </AvatarFallback>
                </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="w-56 text-foreground bg-background backdrop-blur-sm border shadow-lg"
                align="end"
                sideOffset={8}
            >
                <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                        <span className="font-medium text-sm truncate">
                            {user?.username || 'Anonymous User'}
                        </span>
                        <span className="text-xs text-muted-foreground truncate">
                            {user?.email || 'No email provided'}
                        </span>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuItem
                    className="cursor-pointer focus:bg-secondary"
                >
                    <FaRegUserCircle className="mr-3 h-4 w-4" />
                    <span>Profile</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                    className="cursor-pointer focus:bg-secondary"
                >
                    <MdOutlineSettings className="mr-3 h-4 w-4" />
                    <span>Settings</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                    className="cursor-pointer text-error focus:text-error focus:bg-error/10"
                    onClick={onLogOut}
                >
                    <FiLogOut className="mr-3 h-4 w-4" />
                    <span>Sign Out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default UserMenu