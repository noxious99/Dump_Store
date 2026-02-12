import React from 'react'
import { TbBrandFacebook } from "react-icons/tb";
import { FiLinkedin, FiGithub } from "react-icons/fi";
import { FaXTwitter } from "react-icons/fa6";
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className='bg-grey dark:bg-sidebar'>
            <div className='max-w-7xl mx-auto px-6 lg:px-8 py-12'>
                {/* Top Section */}
                <div className='flex flex-col lg:flex-row lg:justify-between lg:items-start gap-8 mb-8'>
                    {/* Brand */}
                    <div className='flex flex-col gap-3'>
                        <Link to="/home" className='text-xl font-bold text-white dark:text-foreground hover:text-primary transition-colors'>
                            Tracero
                        </Link>
                        <p className='text-grey-x200 dark:text-muted-foreground text-sm max-w-xs'>
                            Your all-in-one companion for tracking expenses, achieving goals, and managing IOUs.
                        </p>
                    </div>

                    {/* Links */}
                    <div className='flex flex-wrap gap-8 lg:gap-16'>
                        {/* Product */}
                        <div className='flex flex-col gap-3'>
                            <h4 className='text-sm font-semibold text-white dark:text-foreground uppercase tracking-wider'>Product</h4>
                            <div className='flex flex-col gap-2'>
                                <Link to="#" className='text-grey-x200 dark:text-muted-foreground hover:text-white dark:hover:text-foreground text-sm transition-colors'>
                                    Features
                                </Link>
                                <Link to="#" className='text-grey-x200 dark:text-muted-foreground hover:text-white dark:hover:text-foreground text-sm transition-colors'>
                                    Pricing
                                </Link>
                                <Link to="#" className='text-grey-x200 dark:text-muted-foreground hover:text-white dark:hover:text-foreground text-sm transition-colors'>
                                    FAQ
                                </Link>
                            </div>
                        </div>

                        {/* Support */}
                        <div className='flex flex-col gap-3'>
                            <h4 className='text-sm font-semibold text-white dark:text-foreground uppercase tracking-wider'>Support</h4>
                            <div className='flex flex-col gap-2'>
                                <Link to="#" className='text-grey-x200 dark:text-muted-foreground hover:text-white dark:hover:text-foreground text-sm transition-colors'>
                                    Report a Bug
                                </Link>
                                <Link to="#" className='text-grey-x200 dark:text-muted-foreground hover:text-white dark:hover:text-foreground text-sm transition-colors'>
                                    Contact Us
                                </Link>
                                <Link to="#" className='text-grey-x200 dark:text-muted-foreground hover:text-white dark:hover:text-foreground text-sm transition-colors'>
                                    Help Center
                                </Link>
                            </div>
                        </div>

                        {/* Legal */}
                        <div className='flex flex-col gap-3'>
                            <h4 className='text-sm font-semibold text-white dark:text-foreground uppercase tracking-wider'>Legal</h4>
                            <div className='flex flex-col gap-2'>
                                <Link to="#" className='text-grey-x200 dark:text-muted-foreground hover:text-white dark:hover:text-foreground text-sm transition-colors'>
                                    Privacy Policy
                                </Link>
                                <Link to="#" className='text-grey-x200 dark:text-muted-foreground hover:text-white dark:hover:text-foreground text-sm transition-colors'>
                                    Terms of Service
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className='h-px bg-grey-x300/20 dark:bg-border mb-8' />

                {/* Bottom Section */}
                <div className='flex flex-col sm:flex-row justify-between items-center gap-4'>
                    <p className='text-grey-x200 dark:text-muted-foreground text-sm'>
                        © {currentYear} Tracero. All rights reserved.
                    </p>

                    {/* Social Links */}
                    <div className='flex gap-4'>
                        <a
                            href="#"
                            className='w-9 h-9 rounded-full bg-grey-x300/10 dark:bg-border/20 flex items-center justify-center text-grey-x200 dark:text-muted-foreground hover:bg-primary hover:text-white transition-all duration-200'
                            aria-label="Facebook"
                        >
                            <TbBrandFacebook className='text-lg' />
                        </a>
                        <a
                            href="#"
                            className='w-9 h-9 rounded-full bg-grey-x300/10 dark:bg-border/20 flex items-center justify-center text-grey-x200 dark:text-muted-foreground hover:bg-primary hover:text-white transition-all duration-200'
                            aria-label="Twitter"
                        >
                            <FaXTwitter className='text-lg' />
                        </a>
                        <a
                            href="#"
                            className='w-9 h-9 rounded-full bg-grey-x300/10 dark:bg-border/20 flex items-center justify-center text-grey-x200 dark:text-muted-foreground hover:bg-primary hover:text-white transition-all duration-200'
                            aria-label="LinkedIn"
                        >
                            <FiLinkedin className='text-lg' />
                        </a>
                        <a
                            href="#"
                            className='w-9 h-9 rounded-full bg-grey-x300/10 dark:bg-border/20 flex items-center justify-center text-grey-x200 dark:text-muted-foreground hover:bg-primary hover:text-white transition-all duration-200'
                            aria-label="GitHub"
                        >
                            <FiGithub className='text-lg' />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer
