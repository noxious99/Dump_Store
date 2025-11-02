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
            <section className="bg-gradient-to-b from-[#C1C2DE] to-[#EEEEEE] flex flex-col-reverse lg:flex-row items-center justify-center gap-16 px-6 lg:px-12 py-20 lg:py-28">
                <div className="w-full lg:w-[540px] flex flex-col gap-6 text-center lg:text-left">
                    <h1 className="text-3xl lg:text-5xl font-bold leading-tight text-gray-900">
                        Master Your Money, <br className="hidden lg:block" /> Achieve Your Dreams
                    </h1>
                    <p className="text-lg lg:text-xl text-gray-600 leading-relaxed">
                        Take control of your money with Tracero — the intuitive platform designed to
                        simplify expense tracking, loan management, and goal achievement.
                    </p>
                    <Button
                        variant="secondary"
                        className="border-0 h-12 w-3/5 lg:w-[240px] self-center lg:self-start rounded-lg text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                        Get Started Now
                    </Button>
                </div>

                <div className="w-[340px] lg:w-[500px] hidden md:block">
                    <div className="relative w-full ">
                        <img
                            src="/images/hero_image.jpg"
                            alt="Hero"
                            className=" w-full h-auto rounded-xl"
                        />
                        <img
                            src="/images/hero_image_3.jpg"
                            alt="Hero Overlay"
                            className="w-[140px] lg:w-[210px] h-auto drop-shadow-2xl rounded-xl absolute bottom-0 left-0 translate-x-[-12%] translate-y-[18%] hover:scale-105 transition-transform duration-300"
                        />
                        <img
                            src="/images/hero_image_2.jpg"
                            alt="Hero Accent"
                            className="w-[120px] lg:w-[160px] h-auto drop-shadow-2xl rounded-xl absolute top-0 right-0 translate-x-[28%] translate-y-[-28%] hover:scale-105 transition-transform duration-300"
                        />
                    </div>
                </div>
            </section>

            {/* FEATURES */}
            <section className="flex flex-col justify-center items-center py-[80px] lg:py-[120px] px-6 bg-gray-50">
                <h2 className="text-3xl lg:text-4xl font-semibold text-center mb-4">
                    Power Your Finances, Reach Your Goals
                </h2>
                <p className="text-gray-600 text-center mb-12 max-w-2xl">
                    Everything you need to manage your financial life effectively
                </p>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
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
