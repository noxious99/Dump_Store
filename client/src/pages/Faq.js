import React from 'react'
import { FaQuestionCircle } from "react-icons/fa";
import { Link } from 'react-router-dom';

const Faq = () => {
    const questionArray = [
        {
            question: '1. What is Dump Store?',
            answer: 'Dump Store is a digital storage solution that allows users to store and organize their images and text notes efficiently. It helps declutter personal storage by providing a centralized platform for managing screenshots, photos, and important text notes.'
        },
        {
            question: '2. How do I get started with Dump Store?',
            answer: 'To get started, simply click on the Get Started button on the home page or visit the Login Page. From there, you can sign up and begin storing your images and text notes.'
        },
        {
            question: '3. Is Dump Store free to use?',
            answer: 'Yes, Dump Store offers a free version with essential storage features. Additional premium features may be introduced in the future.'
        },
        {
            question: '4. Why should I use Dump Store instead of other storage apps?',
            answer: 'Dump Store is designed to be lightweight and user-friendly. It focuses on providing a simple yet efficient way to store and retrieve images and text notes without unnecessary complexity.'
        },
        {
            question: '5. Can I access my stored content from multiple devices?',
            answer: 'Yes! Dump Store is accessible from any device with an internet connection, allowing you to manage your stored images and text notes seamlessly.'
        }
    ]
    return (
        <div className='flex-col justify-center items-center mb-10 md:mb-[80px]'>
            <p className='text-gray-300 text-[60px] md:mt-5 md:mb-5 mb-5 mt-3 self-start px-5 md:px-10'> FAQ </p>
            <div className='md:flex md:flex-wrap md:justify-center md:gap-8 '>
                {questionArray.map((element, index) => (
                    <div key={index} className='bg-[#1D1D1D] px-5 py-4 shadow-lg shadow-red-900/15 mb-5 md:w-[380px] md:rounded-lg'>
                        <div className='flex items-center gap-5  mb-1'>
                            <FaQuestionCircle className='text-red-600 text-2xl mr-2' />
                            <p className='text-gray-200 text-lg'>{element.question}</p>
                        </div>
                        <p className='text-gray-300 text-md'>{element.answer}</p>
                    </div>
                ))}
                <div className='bg-[#1D1D1D] px-5 py-4 shadow-lg shadow-red-900/15 mb-5 md:w-[380px] md:rounded-lg'>
                    <div className='flex items-center gap-5  mb-1'>
                        <FaQuestionCircle className='text-red-600 text-2xl mr-2' />
                        <p className='text-gray-200 text-lg'>6. How do I get started with Dump Store?</p>
                    </div>
                    <p className='text-gray-300 text-md'>To get started, simply click on the Get Started button on the
                        <Link to="/" className='underline text-white mx-1'>home page</Link> or visit the
                        <Link to="/login" className='underline text-white mx-1'>Login page</Link>.
                        From there, you can sign up and begin storing your images and text notes.
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Faq