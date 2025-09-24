import React, { useEffect, useState } from "react";
import logo from "../assets/tracero_logo.png";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { IoMdMenu } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { logout, selectUser } from "@/feature-component/auth/userSlice";

const Navbar: React.FC = () => {
    const [loggedinState, setLoggedinState] = useState(false)
    const user = useSelector(selectUser)
    const dispatch = useDispatch()
    useEffect(() => {
        if (user.token) {
            setLoggedinState(true)
        } else {
            setLoggedinState(false)
        }
    }, [user])
    const handleLogout = () => {
        dispatch(logout())
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
                    <Button onClick={handleLogout} variant="secondary">
                        Sign Out
                    </Button>
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
                                    <Button variant="secondary" className="w-full" onClick={handleLogout}>
                                        Sign Out
                                    </Button>
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
