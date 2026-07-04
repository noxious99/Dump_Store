import React from 'react'
import { Sparkles, Repeat, Check } from 'lucide-react'
import Ring from '@/feature-component/dashboard/Ring'
import { CategoryIcon } from '@/components/CategoryIcon'
import Reveal from './Reveal'

/* ---------- shared cell chrome ---------- */

interface CellProps {
    label: string
    heading: string
    tileBg: string
    icon: React.ReactNode
    className?: string
    children: React.ReactNode
}

const Cell: React.FC<CellProps> = ({ label, heading, tileBg, icon, className = '', children }) => (
    <article
        className={`relative overflow-hidden bg-card border border-border rounded-3xl p-6 sm:p-7 flex flex-col ${className}`}
    >
        <div className="flex items-center gap-2.5 mb-4">
            <div className={`w-9 h-9 rounded-xl ${tileBg} flex items-center justify-center`}>{icon}</div>
            <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                {label}
            </span>
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-foreground leading-snug mb-5">{heading}</h3>
        <div className="mt-auto">{children}</div>
    </article>
)

/* ---------- mock fragments (decorative, built from real UI language) ---------- */

const ExpenseMock: React.FC = () => (
    <div aria-hidden="true" className="flex flex-col gap-2">
        {[
            { icon: 'food', label: 'Lunch · kacchi', meta: '12:40 PM', amount: '-$8.50', tone: 'text-foreground' },
            { icon: 'subscriptions', label: 'Spotify', meta: 'auto-logged', amount: '-$9.99', tone: 'text-foreground', auto: true },
            { icon: 'salary', label: 'Salary landed', meta: 'Jul 1', amount: '+$2,400', tone: 'text-success' },
        ].map((row, i) => (
            <div
                key={i}
                className="row-in flex items-center gap-2.5 bg-grey-x100 border border-border/60 rounded-xl px-3 py-2.5"
                style={{ transitionDelay: `${250 + i * 130}ms` }}
            >
                <CategoryIcon name={row.icon} size={16} />
                <span className="text-xs font-semibold text-foreground">{row.label}</span>
                {row.auto ? (
                    <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-secondary bg-secondary/10 px-1.5 py-0.5 rounded-full">
                        <Repeat className="w-2.5 h-2.5" /> auto
                    </span>
                ) : (
                    <span className="text-[10px] text-muted-foreground">{row.meta}</span>
                )}
                <span className={`ml-auto text-xs font-bold tabular-nums ${row.tone}`}>{row.amount}</span>
            </div>
        ))}
        <div className="row-in flex items-center gap-3 px-1 pt-2" style={{ transitionDelay: '650ms' }}>
            <span className="text-[10px] font-medium text-muted-foreground whitespace-nowrap">June budget</span>
            <div className="flex-1 h-1 bg-border rounded-full overflow-hidden">
                <div
                    className="fill-bar h-full bg-primary rounded-full"
                    style={{ '--bar-w': '64%', '--fill-delay': '0.9s' } as React.CSSProperties}
                />
            </div>
            <span className="text-[10px] font-bold text-foreground">64%</span>
        </div>
    </div>
)

const GoalsMock: React.FC = () => (
    <div aria-hidden="true" className="bg-grey-x100 border border-border/60 rounded-xl p-3.5">
        <div className="flex items-center gap-3 mb-3">
            <Ring pct={68} size={44} sw={4} strokeColor="var(--accent)">
                <span className="text-[10px] font-bold text-foreground">68%</span>
            </Ring>
            <div>
                <p className="text-xs font-bold text-foreground leading-tight">Ship portfolio site</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">2 of 3 tasks this week</p>
            </div>
        </div>
        <div className="flex flex-col gap-1.5">
            {[
                { text: 'Wireframe pages', done: true },
                { text: 'Write the bio', done: true },
                { text: 'Deploy v1', done: false },
            ].map((task, i) => (
                <div key={i} className="row-in flex items-center gap-2" style={{ transitionDelay: `${300 + i * 140}ms` }}>
                    <span
                        className={`streak-cell w-4 h-4 rounded-md flex items-center justify-center border ${
                            task.done ? 'bg-accent border-accent' : 'border-grey-x300 bg-transparent'
                        }`}
                        style={{ transitionDelay: `${450 + i * 140}ms` }}
                    >
                        {task.done && <Check className="w-2.5 h-2.5 text-accent-foreground" strokeWidth={3.5} />}
                    </span>
                    <span
                        className={`text-[11px] font-medium ${
                            task.done ? 'text-muted-foreground line-through' : 'text-foreground'
                        }`}
                    >
                        {task.text}
                    </span>
                </div>
            ))}
        </div>
    </div>
)

const IouMock: React.FC = () => (
    <div aria-hidden="true" className="flex flex-col gap-2">
        {[
            { initials: 'NA', name: 'Nadia', note: 'owes you', amount: '+$65', tone: 'text-success', bg: 'bg-secondary/15 text-secondary' },
            { initials: 'AR', name: 'Arif', note: 'you owe', amount: '-$20', tone: 'text-error', bg: 'bg-accent/15 text-accent' },
        ].map((row, i) => (
            <div
                key={i}
                className="row-in flex items-center gap-2.5 bg-grey-x100 border border-border/60 rounded-xl px-3 py-2.5"
                style={{ transitionDelay: `${250 + i * 140}ms` }}
            >
                <span className={`w-7 h-7 rounded-full ${row.bg} flex items-center justify-center text-[10px] font-bold`}>
                    {row.initials}
                </span>
                <div>
                    <p className="text-xs font-semibold text-foreground leading-tight">{row.name}</p>
                    <p className="text-[10px] text-muted-foreground leading-tight">{row.note}</p>
                </div>
                <span className={`ml-auto text-xs font-bold tabular-nums ${row.tone}`}>{row.amount}</span>
            </div>
        ))}
        <div className="row-in flex items-center justify-between px-1 pt-1.5" style={{ transitionDelay: '560ms' }}>
            <span className="text-[10px] font-medium text-muted-foreground">Net position</span>
            <span
                className="join-in text-xs font-bold text-success tabular-nums [--join-delay:1s]"
            >
                +$45
            </span>
        </div>
    </div>
)

const InsightsMock: React.FC = () => (
    <div aria-hidden="true">
        <div className="flex flex-col gap-2 mb-4">
            <div
                className="row-in flex items-start gap-2.5 bg-grey-x100 border border-border/60 rounded-xl px-3.5 py-3"
                style={{ transitionDelay: '250ms' }}
            >
                <Sparkles className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-xs text-foreground font-medium leading-relaxed">
                    Delivery orders spike on Wednesdays, mostly after 8pm.
                </p>
            </div>
            <div
                className="row-in flex items-start gap-2.5 bg-grey-x100 border border-border/60 rounded-xl px-3.5 py-3"
                style={{ transitionDelay: '400ms' }}
            >
                <Sparkles className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-xs text-foreground font-medium leading-relaxed">
                    At this pace, you'll finish June about $180 under budget.
                </p>
            </div>
        </div>
        {/* spending trend — a proper little chart with a "now" endpoint */}
        <div className="relative">
            <svg viewBox="0 0 400 56" preserveAspectRatio="none" className="w-full h-14 block">
                <defs>
                    <linearGradient id="insight-line" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="var(--secondary)" />
                        <stop offset="100%" stopColor="var(--primary)" />
                    </linearGradient>
                    <linearGradient id="insight-fill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.16" />
                        <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
                    </linearGradient>
                </defs>
                <path
                    className="fade-late [--join-delay:1.5s]"
                    d="M0 44 C 40 40, 70 26, 110 30 S 180 48, 230 36 S 320 10, 392 16 L 400 56 L 0 56 Z"
                    fill="url(#insight-fill)"
                    stroke="none"
                />
                <path
                    className="draw-line"
                    pathLength={1}
                    d="M0 44 C 40 40, 70 26, 110 30 S 180 48, 230 36 S 320 10, 392 16"
                    fill="none"
                    stroke="url(#insight-line)"
                    strokeWidth="2"
                />
            </svg>
            <span className="fade-late absolute right-0 top-[22%] w-2 h-2 -translate-y-1/2 translate-x-1/2 rounded-full bg-primary ring-4 ring-primary/20 [--join-delay:1.7s]" />
        </div>
    </div>
)

/* ---------- the grid ---------- */

/**
 * Bento layout for the three trackers + smart insights. Every cell shows a
 * miniature of the real product instead of stock art; each carries exactly
 * one accent color, matching the tracker's identity in the app.
 */
const BentoFeatures: React.FC = () => (
    <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-5">
        <Reveal className="lg:col-span-3" delay={0}>
            <Cell
                label="Expense Tracker"
                heading="Know where your money goes"
                tileBg="bg-primary/10"
                icon={<CategoryIcon name="expense" size={20} />}
                className="h-full bg-gradient-to-br from-primary/[0.04] to-card"
            >
                <ExpenseMock />
            </Cell>
        </Reveal>

        <Reveal className="lg:col-span-2" delay={90}>
            <Cell
                label="Goal Tracker"
                heading="Break big goals into daily wins"
                tileBg="bg-accent/10"
                icon={<CategoryIcon name="goal" size={20} />}
                className="h-full bg-gradient-to-br from-accent/[0.04] to-card"
            >
                <GoalsMock />
            </Cell>
        </Reveal>

        <Reveal className="lg:col-span-2" delay={0}>
            <Cell
                label="IOU Tracker"
                heading="Never lose track of who owes what"
                tileBg="bg-secondary/10"
                icon={<CategoryIcon name="iou" size={20} />}
                className="h-full bg-gradient-to-br from-secondary/[0.04] to-card"
            >
                <IouMock />
            </Cell>
        </Reveal>

        <Reveal className="lg:col-span-3" delay={90}>
            <Cell
                label="Smart Insights"
                heading="Spot patterns you'd otherwise miss"
                tileBg="bg-primary/10"
                icon={<Sparkles className="w-[18px] h-[18px] text-primary" />}
                className="h-full bg-gradient-to-br from-primary/[0.04] to-card"
            >
                <InsightsMock />
            </Cell>
        </Reveal>
    </div>
)

export default BentoFeatures
