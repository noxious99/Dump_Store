import React, { useEffect, useState } from "react";
import logo from "../assets/tracero_logo.png";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { useDispatch, useSelector } from "react-redux";
import { logout, selectUser } from "@/feature-component/auth/userSlice";
import UserMenu from "./UserMenu";
import { IoMdMenu } from "react-icons/io";
import { FiLogOut } from "react-icons/fi";
import { FaRegUserCircle } from "react-icons/fa";
import { RiDashboardFill } from "react-icons/ri";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

const Navbar: React.FC = () => {
    const [loggedinState, setLoggedinState] = useState(false)
    const [isOpen, setIsOpen] = useState(false);
    const user = useSelector(selectUser)
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { resolvedTheme, toggleTheme } = useTheme()

    useEffect(() => {
        if (user.token) {
            setLoggedinState(true)
        } else {
            setLoggedinState(false)
        }
    }, [user])

    const handleLogout = async () => {
        await dispatch(logout())
        navigate("/")
    }

    return (
        <nav className="bg-gradient-to-r from-primary to-accent h-[68px] flex justify-between items-center px-4 lg:px-8 shadow-md">
            {/* Logo - Always links to home page */}
            <Link to="/home" className="flex items-center group">
                <img
                    src={logo}
                    className="h-[34px] sm:h-[38px] lg:h-[42px] w-auto transition-transform duration-200 group-hover:scale-105"
                    alt="Tracero"
                />
            </Link>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-3">
                <button
                    onClick={toggleTheme}
                    aria-label="Toggle theme"
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                    {resolvedTheme === 'dark' ? (
                        <Sun className="w-5 h-5 text-primary-foreground" />
                    ) : (
                        <Moon className="w-5 h-5 text-primary-foreground" />
                    )}
                </button>
                {!loggedinState ? (
                    <>
                        <Button
                            asChild
                            variant="ghost"
                            className="text-primary-foreground/90 hover:text-primary-foreground hover:bg-white/10 font-medium"
                        >
                            <Link to="/auth?mode=signin">Sign In</Link>
                        </Button>
                        <Button
                            asChild
                            className="bg-white text-primary hover:bg-white/90 font-semibold shadow-sm"
                        >
                            <Link to="/auth?mode=signup">Get Started</Link>
                        </Button>
                    </>
                ) : (
                    <UserMenu onLogOut={handleLogout} />
                )}
            </div>

            {/* Mobile Menu */}
            <div className="md:hidden">
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                    <SheetTrigger asChild>
                        <button
                            aria-label="Open menu"
                            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                        >
                            <IoMdMenu className="text-2xl text-primary-foreground" />
                        </button>
                    </SheetTrigger>
                    <SheetContent side="right" className="p-6 bg-background border-l border-border">
                        <SheetHeader>
                            <SheetTitle className="text-xl font-semibold text-foreground">
                                Menu
                            </SheetTitle>
                        </SheetHeader>
                        <div className="flex flex-col gap-3 mt-8">
                            {!loggedinState ? (
                                <>
                                    <Button
                                        asChild
                                        className="w-full h-12 font-semibold"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <Link to="/auth?mode=signin">Sign In</Link>
                                    </Button>
                                    <Button
                                        asChild
                                        variant="outline"
                                        className="w-full h-12 font-semibold border-2"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <Link to="/auth?mode=signup">Sign Up</Link>
                                    </Button>
                                </>
                            ) : (
                                <>
                                    {/* User Info */}
                                    <div className="flex flex-col items-center py-6 mb-4 border-b border-border">
                                        <Avatar className="w-16 h-16 mb-3 ring-2 ring-primary/20">
                                            <AvatarImage src={user.avatar} alt="User" />
                                            <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
                                                {user.username?.charAt(0).toUpperCase() || 'U'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="text-lg font-semibold text-foreground">{user.username}</div>
                                        <div className="text-sm text-muted-foreground">{user.email}</div>
                                    </div>

                                    {/* Menu Items */}
                                    <Button
                                        asChild
                                        variant="ghost"
                                        className="w-full h-12 justify-start gap-3 text-foreground hover:bg-primary/5 hover:text-primary"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <Link to="/dashboard">
                                            <RiDashboardFill className="text-lg" />
                                            Dashboard
                                        </Link>
                                    </Button>
                                    <Button
                                        asChild
                                        variant="ghost"
                                        className="w-full h-12 justify-start gap-3 text-foreground hover:bg-primary/5 hover:text-primary"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <Link to="/profile">
                                            <FaRegUserCircle className="text-lg" />
                                            Profile
                                        </Link>
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        className="w-full h-12 justify-start gap-3 text-foreground hover:bg-primary/5 hover:text-primary"
                                        onClick={toggleTheme}
                                    >
                                        {resolvedTheme === 'dark' ? (
                                            <Sun className="w-[18px] h-[18px]" />
                                        ) : (
                                            <Moon className="w-[18px] h-[18px]" />
                                        )}
                                        {resolvedTheme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                                    </Button>
                                    <div className="border-t border-border my-2" />
                                    <Button
                                        variant="ghost"
                                        className="w-full h-12 justify-start gap-3 text-error hover:bg-error/5 hover:text-error"
                                        onClick={handleLogout}
                                    >
                                        <FiLogOut className="text-lg" />
                                        Sign Out
                                    </Button>
                                </>
                            )}
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </nav>
    );
};

export default Navbar;
