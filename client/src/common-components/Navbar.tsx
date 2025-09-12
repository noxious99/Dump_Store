import React from 'react'
import logo from "../assets/tracero_logo.png"
import {Link} from "react-router-dom"
import {Button} from "@/components/ui/button.tsx";
import {Sheet, SheetContent, SheetDescription, SheetTrigger} from "@/components/ui/sheet"
import { IoMdMenu } from "react-icons/io";

const Navbar: React.FC = () => {
    return (
        <>
            <div className='bg-primary h-16 text-heading flex justify-between items-center px-4 lg:px-6'>
                <Link to="/">
                    <img
                        src={logo}
                        className="h-[36px] lg:h-[42px] w-auto lg:ml-4"
                        alt="tracero"
                    />
                </Link>
                <div className="hidden md:flex gap-2 ">
                    <Button className="border-0">Sign In</Button>
                    <Button variant="secondary" className="border-0">Sign Up</Button>
                </div>

                <div className="md:hidden">
                    <Sheet>
                        <SheetTrigger asChild>
                                <IoMdMenu className="text-2xl text-background"/>
                        </SheetTrigger>
                        <SheetContent side="right">
                                <SheetDescription className="flex flex-col gap-6 p-6">
                                    <Button className="w-full">Sign In</Button>
                                    <Button variant="secondary" className="w-full">Sign Up</Button>
                                </SheetDescription>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </>
    )
}

export default Navbar