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
            <div className="bg-grey-x100 flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-11 p-4 lg:p-12">
                <div className="w-[400px] lg:w-[480px] flex flex-col gap-4">
                    <div className="text-3xl text-center lg:text-left lg:text-4xl font-bold px-6 pt-4 lg:px-0 lg:pt-0">Master Your Money, Achieve Your Dreams</div>
                    <div className="text-base text-center px-6 lg:px-0 lg:text-left">Take control of your money with Tracero, the intuitive platform designed to
                        simplify expense tracking, loan management, and goal achievement.
                    </div>
                    <Button variant="secondary" className="border-0 w-3/6 self-center lg:self-start rounded-2xl lg:w-[320px] text-foreground">Get Started Now</Button>
                </div>

                <div className="w-[320px] lg:w-[420px] h-auto pb-6">
                    <img
                        src="/images/home_hero_image.png"
                        alt="Hero"
                        className="w-full h-auto"
                    />
                </div>
            </div>

            <div className="flex flex-col justify-center items-center my-8 lg:my-[60px]">
                <div className="text-3xl font-semibold lg:text-4xl text-center px-6 pb-6 lg:pb-12">Power Your Finances, Reach Your Goals</div>
                <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
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
            </div>

            <div className="bg-grey-x200 flex justify-center items-center py-12 lg:pb-[120px]">
                <div className="flex flex-col justify-center items-center lg:justify-start lg:items-start">
                    <div className="text-3xl lg:text-4xl font-semibold mb-6 lg:mb-12 px-6">Why FinTrack is Your Ideal Financial Partner</div>
                    <div className="flex flex-col gap-4 lg:gap-6 text-sm lg:text-base font-medium lg:px-6">
                        <div className="flex gap-2 items-center">
                            <IoCheckmarkDone className="text-2xl"/>
                            <p>Gain clear insights into your financial health.</p>
                        </div>
                        <div className="flex gap-2 items-center">
                            <IoCheckmarkDone className="text-2xl"/>
                            <p>Understand your expenses at a glance.</p>
                        </div>
                        <div className="flex gap-2 items-center">
                            <IoCheckmarkDone className="text-2xl"/>
                            <p>Turn big dreams into daily, achievable tasks.</p>
                        </div>
                        <div className="flex gap-2 items-center">
                            <IoCheckmarkDone className="text-2xl"/>
                            <p>Easily track your loans and repayments.</p>
                        </div>
                        <div className="flex gap-2 items-center">
                            <IoCheckmarkDone className="text-2xl"/>
                            <p>Know the impact of repayments before committing.</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Home