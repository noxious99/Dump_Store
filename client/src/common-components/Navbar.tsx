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
import { MdOutlineSettings } from "react-icons/md";

const Navbar: React.FC = () => {
    const [loggedinState, setLoggedinState] = useState(false)
    const user = useSelector(selectUser)
    const dispatch = useDispatch()
    const navigate = useNavigate()
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
        <nav className="bg-primary h-16 text-heading flex justify-between items-center px-4 lg:px-6">
            {/* Logo */}
            <Link to="/" className="flex items-center">
                <img
                    src={logo}
                    className="h-[34px] sm:h-[38px] lg:h-[42px] w-auto"
                    alt="Tracero"
                />
            </Link>

            {/* Desktop Links */}
            <div className="hidden md:flex gap-3">
                {!loggedinState ? (<>
                    <Button asChild>
                        <Link to="/auth?mode=signin">Sign In</Link>
                    </Button>
                    <Button asChild variant="secondary">
                        <Link to="/auth?mode=signup">Sign Up</Link>
                    </Button>
                </>) : (
                    <UserMenu onLogOut={handleLogout} />
                )}
            </div>

            {/* Mobile Menu */}
            <div className="md:hidden">
                <Sheet>
                    <SheetTrigger asChild>
                        <button aria-label="Open menu">
                            <IoMdMenu className="text-3xl text-background" />
                        </button>
                    </SheetTrigger>
                    <SheetContent side="right" className="p-6">
                        <SheetHeader>
                            <SheetTitle className="text-lg font-semibold">
                                Menu
                            </SheetTitle>
                        </SheetHeader>
                        <div className="flex flex-col gap-4 mt-6">
                            {
                                !loggedinState ? (
                                    <>
                                        <Button asChild className="w-full">
                                            <Link to="/auth?mode=signin">Sign In</Link>
                                        </Button>
                                        <Button asChild variant="secondary" className="w-full">
                                            <Link to="/auth?mode=signup">Sign Up</Link>
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <div className="font-semibold flex flex-col items-center mb-4">
                                            <div className="flex gap-2 items-center mb-1">
                                                <Avatar className="w-[30px] h-[30px]">
                                                    <AvatarImage src={user.avatar} alt="User"  />
                                                    <AvatarFallback>U</AvatarFallback>
                                                    {user.avatar}
                                                </Avatar>
                                                <div>{user.username}</div>
                                            </div>
                                            <div className="text-xs">{user.email}</div>
                                        </div>
                                        <Button variant="secondary" className="w-full">
                                            <FaRegUserCircle/> <Link to="/profile">Profile</Link>
                                        </Button>
                                        <Button variant="secondary" className="w-full">
                                            <MdOutlineSettings/> <Link to="/settings">Settings</Link>
                                        </Button>
                                        <Button variant="secondary" className="w-full" onClick={handleLogout}>
                                            <FiLogOut/> Sign Out
                                        </Button>
                                    </>
                                )
                            }
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </nav>
    );
};

export default Navbar;
