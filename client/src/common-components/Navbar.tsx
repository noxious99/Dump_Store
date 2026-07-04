import React, { useEffect, useState } from "react";
import logo from "../assets/tracero_logo.png";
import { Link, useLocation, useNavigate } from "react-router-dom";
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

// Homepage section anchors (h2 ids get scroll-margin for the sticky nav)
const HOME_LINKS = [
    { label: "What's inside", href: '#toolkit-heading' },
    { label: 'How it works', href: '#how-it-works-heading' },
    { label: 'In practice', href: '#day-heading' },
]

const Navbar: React.FC = () => {
    const [loggedinState, setLoggedinState] = useState(false)
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false)
    const user = useSelector(selectUser)
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { pathname } = useLocation()
    const { resolvedTheme, toggleTheme } = useTheme()

    const isHome = pathname === '/home' || pathname === '/'

    useEffect(() => {
        if (user.token) {
            setLoggedinState(true)
        } else {
            setLoggedinState(false)
        }
    }, [user])

    // Transparent over the hero, glass once the page scrolls
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8)
        onScroll()
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    const handleLogout = async () => {
        await dispatch(logout())
        navigate("/")
    }

    return (
        <nav
            className={`sticky top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300 ${
                scrolled
                    ? 'bg-background/70 backdrop-blur-md border-b border-border/60'
                    : 'bg-transparent border-b border-transparent'
            }`}
        >
            <div className="max-w-7xl mx-auto h-14 md:h-16 flex justify-between items-center px-4 sm:px-6 lg:px-12">
            <div className="flex items-center">
                {/* Logo - Always links to home page. Gradient-recolored from the white
                    logo PNG via CSS mask, using the brand from-primary→to-accent flow
                    (theme-aware via CSS vars). */}
                <Link to="/home" className="flex items-center gap-2.5 group">
                    <div
                        role="img"
                        aria-label="Tracero"
                        className="h-[24px] sm:h-[30px] lg:h-[34px] transition-transform duration-200 group-hover:scale-105 bg-gradient-to-r from-primary to-accent"
                        style={{
                            aspectRatio: "558 / 502",
                            WebkitMaskImage: `url(${logo})`,
                            maskImage: `url(${logo})`,
                            WebkitMaskRepeat: "no-repeat",
                            maskRepeat: "no-repeat",
                            WebkitMaskPosition: "center",
                            maskPosition: "center",
                            WebkitMaskSize: "contain",
                            maskSize: "contain",
                        }}
                    />
                    <span
                        className="text-base sm:text-lg font-extrabold tracking-tight text-foreground"
                        style={{ fontFamily: 'var(--font-heading)' }}
                    >
                        Tracero
                    </span>
                </Link>

                {/* Homepage section anchors */}
                {isHome && (
                    <div className="hidden md:flex items-center gap-6 ml-10">
                        {HOME_LINKS.map((link) => (
                            <a
                                key={link.href}
                                href={link.href}
                                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {link.label}
                            </a>
                        ))}
                    </div>
                )}
            </div>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-3">
                <button
                    onClick={toggleTheme}
                    aria-label="Toggle theme"
                    className="p-2 rounded-lg hover:bg-foreground/10 transition-colors"
                >
                    {resolvedTheme === 'dark' ? (
                        <Sun className="w-5 h-5 text-foreground" />
                    ) : (
                        <Moon className="w-5 h-5 text-foreground" />
                    )}
                </button>
                {!loggedinState ? (
                    <>
                        <Button
                            asChild
                            variant="ghost"
                            className="text-foreground/90 hover:text-foreground hover:bg-foreground/10 font-medium"
                        >
                            <Link to="/auth?mode=signin">Sign in</Link>
                        </Button>
                        <Button
                            asChild
                            className="font-semibold shadow-sm rounded-xl"
                        >
                            <Link to="/auth?mode=signup">Get started</Link>
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
                            className="p-2 rounded-lg hover:bg-foreground/10 transition-colors"
                        >
                            <IoMdMenu className="text-2xl text-foreground" />
                        </button>
                    </SheetTrigger>
                    <SheetContent side="right" className="p-6 bg-background border-l border-border">
                        <SheetHeader>
                            <SheetTitle className="text-xl font-semibold text-foreground">
                                Menu
                            </SheetTitle>
                        </SheetHeader>
                        <div className="flex flex-col gap-3 mt-8">
                            {isHome && (
                                <div className="flex flex-col gap-1 mb-2 pb-4 border-b border-border">
                                    {HOME_LINKS.map((link) => (
                                        <a
                                            key={link.href}
                                            href={link.href}
                                            onClick={() => setIsOpen(false)}
                                            className="py-2 text-base font-medium text-foreground/90 hover:text-primary transition-colors"
                                        >
                                            {link.label}
                                        </a>
                                    ))}
                                </div>
                            )}
                            {!loggedinState ? (
                                <>
                                    <Button
                                        asChild
                                        className="w-full h-12 font-semibold"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <Link to="/auth?mode=signin">Sign in</Link>
                                    </Button>
                                    <Button
                                        asChild
                                        variant="outline"
                                        className="w-full h-12 font-semibold border-2"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <Link to="/auth?mode=signup">Sign up</Link>
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
            </div>
        </nav>
    );
};

export default Navbar;
