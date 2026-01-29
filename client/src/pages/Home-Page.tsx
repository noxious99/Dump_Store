import React from 'react'
import { Button } from "@/components/ui/button"
import FeatureCard from "@/feature-component/home/Feature-Card.tsx";
import { IoCheckmarkDone } from "react-icons/io5";
import { Link } from "react-router-dom";
import { FiArrowRight, FiUserPlus, FiSettings, FiTrendingUp } from "react-icons/fi";

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
    const features: FeatureType[] = ['goal', 'spend', 'loan']

    const benefits = [
        "Track both income and expenses to understand your spending.",
        "Set any goal — fitness, learning, career — and break it into tasks.",
        "Build streaks and hit milestones to stay motivated.",
        "Never forget who owes you or who you owe.",
        "Simple, intuitive interface that fits into your daily routine."
    ]

    return (
        <main>
            {/* HERO SECTION */}
            <section
                className="relative bg-gradient-to-br from-primary/5 via-background to-secondary/5 overflow-hidden"
                aria-labelledby="hero-heading"
            >
                {/* Background decorative elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/10 rounded-full blur-3xl" />
                </div>

                <div className="relative max-w-7xl mx-auto px-6 lg:px-12 py-16 lg:py-24">
                    <div className="flex flex-col-reverse lg:flex-row items-center justify-between gap-12 lg:gap-16">
                        {/* Hero Content */}
                        <div className="w-full lg:w-1/2 flex flex-col gap-6 text-center lg:text-left">
                            <span className="inline-flex items-center self-center lg:self-start px-4 py-1.5 rounded-full text-sm font-medium bg-primary/10 text-primary">
                                Your Life Management Companion
                            </span>
                            <h1
                                id="hero-heading"
                                className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight text-foreground"
                            >
                                Track, Achieve,{' '}
                                <span className="text-primary">Manage Your Life</span>
                            </h1>
                            <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-xl">
                                Tracero helps you stay on top of your finances, crush your goals with daily tasks and streaks,
                                and keep track of money you've lent or borrowed — all in one place.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                <Button
                                    asChild
                                    size="lg"
                                    className="h-12 px-8 rounded-xl text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                                >
                                    <Link to="/auth?mode=signup">
                                        Get Started Free
                                        <FiArrowRight className="ml-2" />
                                    </Link>
                                </Button>
                                <Button
                                    asChild
                                    variant="outline"
                                    size="lg"
                                    className="h-12 px-8 rounded-xl text-base font-semibold border-2 hover:bg-primary/5 transition-all duration-300"
                                >
                                    <Link to="/auth?mode=signin">
                                        Sign In
                                    </Link>
                                </Button>
                            </div>
                        </div>

                        {/* Hero Images */}
                        <div className="w-full lg:w-1/2 hidden md:flex justify-center lg:justify-end">
                            <div className="relative w-[340px] lg:w-[480px]">
                                <img
                                    src="/images/hero_image.jpg"
                                    alt="Tracero dashboard showing expense tracking"
                                    className="w-full h-auto rounded-2xl shadow-2xl"
                                    loading="eager"
                                />
                                <img
                                    src="/images/hero_image_3.jpg"
                                    alt="Financial goals progress"
                                    className="w-[120px] lg:w-[180px] h-auto rounded-xl shadow-xl absolute bottom-0 left-0 -translate-x-4 translate-y-8 hover:scale-105 transition-transform duration-300 border-4 border-background"
                                    loading="eager"
                                />
                                <img
                                    src="/images/hero_image_2.jpg"
                                    alt="Expense categories overview"
                                    className="w-[100px] lg:w-[140px] h-auto rounded-xl shadow-xl absolute top-0 right-0 translate-x-4 -translate-y-4 hover:scale-105 transition-transform duration-300 border-4 border-background"
                                    loading="eager"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FEATURES SECTION */}
            <section
                className="bg-grey-x100 py-20 lg:py-28 px-6"
                aria-labelledby="features-heading"
            >
                <div className="max-w-7xl mx-auto">
                    <header className="text-center mb-16">
                        <h2
                            id="features-heading"
                            className="text-3xl lg:text-4xl font-bold text-foreground mb-4"
                        >
                            Three Tools, <span className="text-primary">One Platform</span>
                        </h2>
                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                            Everything you need to manage your money, achieve your goals, and track IOUs
                        </p>
                    </header>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10 justify-items-center">
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
            </section>

            {/* HOW IT WORKS SECTION */}
            <section
                className="bg-background py-20 lg:py-28 px-6"
                aria-labelledby="how-it-works-heading"
            >
                <div className="max-w-6xl mx-auto">
                    <header className="text-center mb-16">
                        <h2
                            id="how-it-works-heading"
                            className="text-3xl lg:text-4xl font-bold text-foreground mb-4"
                        >
                            Get Started in <span className="text-secondary">3 Simple Steps</span>
                        </h2>
                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                            No complicated setup. Just sign up and start tracking.
                        </p>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 lg:gap-12">
                        {/* Step 1 */}
                        <div className="relative flex flex-col items-center text-center group pt-4 md:pt-0">
                            <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-secondary/50 to-secondary/10" />
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:-top-4 md:right-4 w-8 h-8 md:w-10 md:h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                                <span className="text-secondary font-bold text-xs md:text-sm">01</span>
                            </div>
                            <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-secondary/10 flex items-center justify-center mb-5 md:mb-6 group-hover:bg-secondary/20 group-hover:scale-105 transition-all duration-300">
                                <FiUserPlus className="text-3xl md:text-4xl text-secondary" />
                            </div>
                            <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2 md:mb-3">Create Your Account</h3>
                            <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-xs">
                                Sign up for free in seconds. No credit card required.
                            </p>
                        </div>

                        {/* Step 2 */}
                        <div className="relative flex flex-col items-center text-center group pt-4 md:pt-0">
                            <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-secondary/50 to-secondary/10" />
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:-top-4 md:right-4 w-8 h-8 md:w-10 md:h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                                <span className="text-secondary font-bold text-xs md:text-sm">02</span>
                            </div>
                            <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-secondary/10 flex items-center justify-center mb-5 md:mb-6 group-hover:bg-secondary/20 group-hover:scale-105 transition-all duration-300">
                                <FiSettings className="text-3xl md:text-4xl text-secondary" />
                            </div>
                            <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2 md:mb-3">Set Up Your Trackers</h3>
                            <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-xs">
                                Add your goals, start logging expenses, or create IOUs — your choice.
                            </p>
                        </div>

                        {/* Step 3 */}
                        <div className="relative flex flex-col items-center text-center group pt-4 md:pt-0">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:-top-4 md:right-4 w-8 h-8 md:w-10 md:h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                                <span className="text-secondary font-bold text-xs md:text-sm">03</span>
                            </div>
                            <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-secondary/10 flex items-center justify-center mb-5 md:mb-6 group-hover:bg-secondary/20 group-hover:scale-105 transition-all duration-300">
                                <FiTrendingUp className="text-3xl md:text-4xl text-secondary" />
                            </div>
                            <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2 md:mb-3">Stay Consistent</h3>
                            <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-xs">
                                Check in daily, build streaks, and watch your progress grow.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* BENEFITS SECTION */}
            <section
                className="relative bg-gradient-to-br from-primary/5 via-grey-x100 to-secondary/5 py-20 lg:py-28 px-6 overflow-hidden"
                aria-labelledby="benefits-heading"
            >
                {/* Decorative background */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-success/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-primary/10 rounded-full blur-3xl" />
                </div>

                <div className="relative max-w-4xl mx-auto">
                    <div className="bg-card rounded-2xl md:rounded-3xl p-6 sm:p-8 lg:p-12 shadow-lg border border-border/50">
                        <header className="mb-6 sm:mb-10">
                            <h2
                                id="benefits-heading"
                                className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground text-center lg:text-left"
                            >
                                Why People{' '}
                                <span className="text-success">Love Tracero</span>
                            </h2>
                            <div className="w-20 h-1 bg-success rounded-full mt-4 mx-auto lg:mx-0" />
                        </header>
                        <ul className="grid gap-5 lg:gap-6" role="list">
                            {benefits.map((text, i) => (
                                <li
                                    key={i}
                                    className="flex items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-background/50 hover:bg-success/5 transition-all duration-300 group"
                                >
                                    <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-success/10 flex items-center justify-center group-hover:bg-success/20 transition-colors duration-300">
                                        <IoCheckmarkDone className="text-success text-lg sm:text-xl" aria-hidden="true" />
                                    </div>
                                    <p className="text-sm sm:text-base text-foreground font-medium group-hover:text-success transition-colors duration-300">
                                        {text}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            {/* CTA SECTION */}
            <section
                className="bg-gradient-to-r from-primary to-accent py-16 lg:py-20 px-6"
                aria-labelledby="cta-heading"
            >
                <div className="max-w-4xl mx-auto text-center">
                    <h2
                        id="cta-heading"
                        className="text-3xl lg:text-4xl font-bold text-primary-foreground mb-4"
                    >
                        Ready to Take Control?
                    </h2>
                    <p className="text-primary-foreground/80 text-lg mb-8 max-w-2xl mx-auto">
                        Join users who are tracking their finances, crushing their goals, and staying on top of IOUs.
                        Start your journey today.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                            asChild
                            size="lg"
                            variant="secondary"
                            className="h-12 px-8 rounded-xl text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                            <Link to="/auth?mode=signup">
                                Create Free Account
                                <FiArrowRight className="ml-2" />
                            </Link>
                        </Button>
                        <Button
                            asChild
                            size="lg"
                            variant="outline"
                            className="h-12 px-8 rounded-xl text-base font-semibold bg-transparent border-2 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 transition-all duration-300"
                        >
                            <Link to="#features-heading">
                                Learn More
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>
        </main>
    )
}

export default Home
