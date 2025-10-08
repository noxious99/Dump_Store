import React from 'react'
import { Button } from "@/components/ui/button"
import FeatureCard from "@/feature-component/home/Feature-Card.tsx";
import { IoCheckmarkDone } from "react-icons/io5";

type FeatureType = "spend" | "goal" | "loan"

interface FeatureCardAttributes {
    iconColor: string;
    lite: string;
    heading: string;
}

const Home: React.FC = () => {
    const featureCardAttributes: Record<FeatureType, FeatureCardAttributes> = {
        spend: {
            lite: 'bg-primary-lite',
            iconColor: 'text-primary',
            heading: 'Expense Tracker'
        },
        loan: {
            lite: 'bg-error-x100',
            iconColor: 'text-error',
            heading: 'IOU Tracker'
        },
        goal: {
            lite: 'bg-success-x100',
            iconColor: 'text-success',
            heading: 'Goal Tracker'
        }
    }
    const features: FeatureType[] = ['spend', 'goal', 'loan']

    return (
        <>
            {/* HERO */}
            <section className="bg-gradient-to-b from-[#C9C7DD] to-[#E7E7E7] flex flex-col-reverse lg:flex-row items-center justify-center gap-10 px-6 lg:px-12 py-[60px] lg:py-[100px]">
                <div className="w-full lg:w-[500px] flex flex-col gap-6 text-center lg:text-left">
                    <h1 className="text-3xl lg:text-5xl font-bold leading-snug">
                        Master Your Money, <br className="hidden lg:block" /> Achieve Your Dreams
                    </h1>
                    <p className="text-base lg:text-lg text-gray-700">
                        Take control of your money with Tracero — the intuitive platform designed to
                        simplify expense tracking, loan management, and goal achievement.
                    </p>
                    <Button
                        variant="secondary"
                        className="border-0 h-12 w-3/6 lg:w-[240px] self-center lg:self-start rounded-lg text-base font-semibold"
                    >
                        Get Started Now
                    </Button>
                </div>

                <div className="w-[320px] lg:w-[480px] h-auto">
                    <div className="relative w-full">
                        <img
                            src="/images/hero_image.jpg"
                            alt="Hero"
                            className="w-[500px] h-auto drop-shadow-lg rounded-lg"
                        />
                        <img
                            src="/images/hero_image_3.png"
                            alt="Hero Overlay"
                            className="w-[200px] h-auto drop-shadow-lg rounded-lg absolute bottom-0 left-0 translate-x-[-10%] translate-y-[20%]"
                        />
                        <img
                            src="/images/hero_image_2.png"
                            alt="Hero Accent"
                            className="w-[180px] h-auto drop-shadow-lg rounded-lg absolute top-0 right-0 translate-x-[30%] translate-y-[-30%]"
                        />
                    </div>
                </div>
            </section>

            {/* FEATURES */}
            <section className="flex flex-col justify-center items-center py-[80px] lg:py-[120px] px-6">
                <h2 className="text-3xl lg:text-4xl font-semibold text-center mb-10">
                    Power Your Finances, Reach Your Goals
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {features.map((feature) => (
                        <FeatureCard
                            key={feature}
                            iconColor={featureCardAttributes[feature].iconColor}
                            iconBg={featureCardAttributes[feature].lite}
                            heading={featureCardAttributes[feature].heading}
                            title={feature}
                        />
                    ))}
                </div>
            </section>

            {/* CHECKLIST */}
            <section className="bg-gradient-to-br from-grey-x100 via-grey-x200 to-grey-x100 flex justify-center items-center py-[80px] lg:py-[120px] px-6">
                <div className="max-w-[720px] flex flex-col items-start backdrop-blur-sm rounded-2xl p-10">
                    <h2 className="text-3xl font-semibold mb-10 text-center lg:text-left relative">
                        Why Tracero is Your Ideal Daily Partner
                        <span className="absolute -bottom-2 left-1/2 lg:left-0 w-20 h-1 bg-success rounded-full transform -translate-x-1/2 lg:translate-x-0"></span>
                    </h2>
                    <ul className="flex flex-col gap-6 text-base font-medium lg:gap-8">
                        {[
                            "Gain clear insights into your financial health.",
                            "Understand your expenses at a glance.",
                            "Turn big dreams into daily, achievable tasks.",
                            "Easily track your loans and repayments.",
                            "Know the impact of repayments before committing."
                        ].map((text, i) => (
                            <li
                                key={i}
                                className="flex items-center gap-3 transition-all duration-300 hover:translate-x-2 hover:text-success"
                            >
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-success-x100 shadow-md">
                                    <IoCheckmarkDone className="text-success text-xl" />
                                </div>
                                <p>{text}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>
        </>
    )
}

export default Home
