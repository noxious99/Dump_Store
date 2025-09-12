import React from 'react'
import { TbBrandFacebook } from "react-icons/tb";
import { FiLinkedin } from "react-icons/fi";
import { FaXTwitter } from "react-icons/fa6";
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
    return (
        <>
            <div className='bg-primary text-primary-foreground h-[180px] w-full flex flex-col gap-6 justify-center items-center px-6 lg:px-16'>
                <div className='flex gap-6 lg:self-end lg:my-6'>
                    <Link to="#">
                        Report a Bug
                    </Link>
                    <Link to="#">
                        FAQ
                    </Link>
                    <Link to="#">
                        Contact Us
                    </Link>
                </div>
                <div className='flex flex-col gap-6'>
                    <div className='h-[2px] bg-background hidden lg:flex'></div>
                    <div className='flex flex-col gap-6 items-center lg:flex-row lg:justify-between lg:w-[70vw] lg:mb-6'>
                        <div>
                            © 2025 Tracero. All rights reserved.
                        </div>
                        <div className='flex gap-6 text-xl'>
                            <TbBrandFacebook />
                            <FiLinkedin />
                            <FaXTwitter />
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Footer