import React from 'react'
import { Check, Plus, Flame, ArrowRight } from 'lucide-react'
import { CategoryIcon } from '@/components/CategoryIcon'
import Reveal from './Reveal'

/* Each step card demos itself with a tiny piece of product UI instead of an
   abstract icon — same "the product is the art" idea as the hero collage.
   The mocks play a little story on reveal: the email types itself, the IOU
   chip joins the picked trackers, today's streak cell fills in. */

interface StepCardProps {
    index: number
    title: string
    body: string
    wash: string
    children: React.ReactNode
}

const StepCard: React.FC<StepCardProps> = ({ index, title, body, wash, children }) => (
    <Reveal delay={index * 130} className="h-full">
        {/* dark: one step lighter than the panel so cards sit on it, not in it */}
        <div
            className={`h-full bg-card dark:bg-grey-x200/40 border border-border rounded-2xl p-5 sm:p-6 flex flex-col bg-gradient-to-br ${wash}`}
        >
            <span
                className="text-gradient text-4xl sm:text-5xl font-extrabold tracking-tight leading-none select-none mb-5"
                aria-hidden="true"
            >
                0{index + 1}
            </span>
            <div className="step-pop mb-6 min-h-[96px] flex flex-col justify-center" aria-hidden="true">
                {children}
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-foreground mt-auto mb-1.5">{title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
        </div>
    </Reveal>
)

/* ---------- the three mocks ---------- */

const SignupMock: React.FC = () => (
    <div className="flex items-center gap-0.5 bg-grey-x100 border border-border rounded-xl pl-3.5 pr-2 py-2">
        <span className="type-in text-xs text-muted-foreground font-medium">you@email.com</span>
        <span className="w-px h-3.5 bg-primary animate-pulse-soft flex-shrink-0" />
        <span className="ml-auto text-[11px] font-bold bg-primary text-primary-foreground rounded-lg px-3 py-2 whitespace-nowrap">
            Sign up
        </span>
    </div>
)

const PickTrackersMock: React.FC = () => (
    <div className="flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-lg border border-primary/40 bg-primary/10 px-2.5 py-2 text-[11px] font-semibold text-foreground">
            <CategoryIcon name="expense" size={16} />
            Expenses
            <Check className="w-3 h-3 text-primary" strokeWidth={3} />
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-lg border border-accent/40 bg-accent/10 px-2.5 py-2 text-[11px] font-semibold text-foreground">
            <CategoryIcon name="goal" size={16} />
            Goals
            <Check className="w-3 h-3 text-accent" strokeWidth={3} />
        </span>
        {/* IOUs joins the party a beat later — "add the rest anytime" */}
        <span className="relative inline-flex">
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-grey-x300 px-2.5 py-2 text-[11px] font-semibold text-muted-foreground">
                <CategoryIcon name="iou" size={16} />
                IOUs
                <Plus className="w-3 h-3" strokeWidth={3} />
            </span>
            <span
                className="join-in absolute inset-0 inline-flex items-center gap-1.5 rounded-lg border border-secondary/40 px-2.5 py-2 text-[11px] font-semibold text-foreground [--join-delay:1.7s]"
                style={{ backgroundColor: 'color-mix(in srgb, var(--secondary) 12%, var(--card))' }}
            >
                <CategoryIcon name="iou" size={16} />
                IOUs
                <Check className="w-3 h-3 text-secondary" strokeWidth={3} />
            </span>
        </span>
    </div>
)

const StreakMock: React.FC = () => (
    <div>
        <div className="flex gap-1.5 mb-2.5">
            {Array.from({ length: 7 }, (_, i) => {
                const filled = i < 5
                const isToday = i === 5
                return (
                    <span
                        key={i}
                        className={`relative streak-cell w-8 h-8 rounded-lg flex items-center justify-center ${
                            filled
                                ? 'bg-gradient-to-br from-primary to-accent'
                                : 'bg-grey-x100 border border-grey-x300/50'
                        }`}
                        style={{ transitionDelay: `${350 + i * 80}ms` }}
                    >
                        {filled && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                        {/* today's check-in lands while you watch */}
                        {isToday && (
                            <span className="join-in absolute inset-0 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center [--join-delay:2s]">
                                <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                            </span>
                        )}
                    </span>
                )
            })}
        </div>
        <div className="flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-warning" />
            <span className="text-[11px] font-bold text-foreground">12-day streak</span>
            <span className="text-[11px] text-muted-foreground">and counting</span>
        </div>
    </div>
)

/* ---------- the row ---------- */

const StepsShowcase: React.FC = () => (
    <div className="relative">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-5">
            <StepCard
                index={0}
                title="Create an account"
                body="All you need is an email."
                wash="from-primary/[0.05] via-transparent to-transparent"
            >
                <SignupMock />
            </StepCard>
            <StepCard
                index={1}
                title="Pick your trackers"
                body="Start with expenses, add the rest anytime."
                wash="from-accent/[0.05] via-transparent to-transparent"
            >
                <PickTrackersMock />
            </StepCard>
            <StepCard
                index={2}
                title="Make it a habit"
                body="Streaks and check-ins keep you coming back."
                wash="from-secondary/[0.05] via-transparent to-transparent"
            >
                <StreakMock />
            </StepCard>
        </div>
        {/* sequence markers between the cards */}
        {['left-1/3', 'left-2/3'].map((pos) => (
            <span
                key={pos}
                className={`hidden sm:flex absolute ${pos} top-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-card border border-border shadow-md items-center justify-center z-10`}
                aria-hidden="true"
            >
                <ArrowRight className="w-4 h-4 text-primary" />
            </span>
        ))}
    </div>
)

export default StepsShowcase
