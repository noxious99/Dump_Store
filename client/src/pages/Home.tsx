import React from 'react'
import { Button } from "@/components/ui/button"
import FeatureCard from "@/feature-component/home/Feature-Card.tsx";
import { IoCheckmarkDone } from "react-icons/io5";

type FeatureType = "spend" | "loan" | "goal"

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
            heading: 'Money Spendature Tracker'
        },
        loan: {
            lite: 'bg-error-x100',
            iconColor: 'text-error',
            heading: 'Loan & Owe Tracker'
        },
        goal: {
            lite: 'bg-success-x100',
            iconColor: 'text-success',
            heading: 'Goal Tracker'
        }
    }
    const features: FeatureType[] = ['spend', 'loan', 'goal']

    return (
        <>
            {/* HERO */}
            <section className="bg-grey-x100 flex flex-col-reverse lg:flex-row items-center justify-center gap-10 px-6 lg:px-12 py-[60px] lg:py-[100px]">
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
                        className="border-0 h-12 w-3/6 lg:w-[240px] self-center lg:self-start rounded-2xl text-base font-semibold"
                    >
                        Get Started Now
                    </Button>
                </div>

                <div className="w-[320px] lg:w-[460px] h-auto">
                    <img
                        src="/images/home_hero_image.png"
                        alt="Hero"
                        className="w-full h-auto drop-shadow-md"
                    />
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
            <section className="bg-grey-x200 flex justify-center items-center py-[80px] lg:py-[120px] px-6">
                <div className="max-w-[720px] flex flex-col items-start">
                    <h2 className="text-3xl font-semibold mb-10 text-center lg:text-left">
                        Why Tracero is Your Ideal Financial Partner
                    </h2>
                    <ul className="flex flex-col gap-5 text-base font-medium">
                        {[
                            "Gain clear insights into your financial health.",
                            "Understand your expenses at a glance.",
                            "Turn big dreams into daily, achievable tasks.",
                            "Easily track your loans and repayments.",
                            "Know the impact of repayments before committing."
                        ].map((text, i) => (
                            <li key={i} className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-success-x100">
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
