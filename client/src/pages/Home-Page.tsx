import React from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { ArrowRight, Check, LayoutDashboard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { selectUser } from '@/feature-component/auth/userSlice'
import { CategoryIcon } from '@/components/CategoryIcon'
import HeroShowcase from '@/feature-component/home/HeroShowcase'
import BentoFeatures from '@/feature-component/home/BentoFeatures'
import StepsShowcase from '@/feature-component/home/StepsShowcase'
import Reveal from '@/feature-component/home/Reveal'

/* ---------- small editorial helpers ---------- */

const SectionHeader: React.FC<{ eyebrow: string; heading: string; sub?: string; id: string; center?: boolean }> = ({
    eyebrow,
    heading,
    sub,
    id,
    center = false,
}) => (
    <Reveal>
        <header className={`mb-10 lg:mb-14 ${center ? 'text-center' : 'max-w-2xl'}`}>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary mb-3">{eyebrow}</p>
            <h2 id={id} className="text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
                {heading}
            </h2>
            {sub && (
                <p className={`text-muted-foreground text-base lg:text-lg mt-4 ${center ? 'max-w-xl mx-auto' : 'max-w-xl'}`}>
                    {sub}
                </p>
            )}
        </header>
    </Reveal>
)

/* Kalam notes ink themselves in letter by letter once the card is in view.
   The visible chars are decorative; screen readers get the full sentence. */
const HandwrittenNote: React.FC<{ text: string }> = ({ text }) => {
    let charIndex = 0
    const words = text.split(' ')
    return (
        <p
            className="text-base text-foreground/75 leading-snug -rotate-1"
            style={{ fontFamily: 'var(--font-handwriting)' }}
            aria-label={text}
        >
            <span aria-hidden="true">
                {words.map((word, wi) => (
                    <span key={wi} className="inline-block">
                        {Array.from(word).map((ch) => {
                            const ci = charIndex++
                            return (
                                <span key={ci} className="note-char" style={{ '--ci': ci } as React.CSSProperties}>
                                    {ch}
                                </span>
                            )
                        })}
                        {wi < words.length - 1 && ' '}
                    </span>
                ))}
            </span>
        </p>
    )
}

/* ---------- static content ---------- */

const MOMENTS: {
    time: string
    dot: string
    icon: string
    chip: string
    amount: string
    amountTone: string
    extra: React.ReactNode
    note: string
}[] = [
    {
        time: '7:42 AM',
        dot: 'bg-primary',
        icon: 'food',
        chip: 'Coffee',
        amount: '-$4.50',
        amountTone: 'text-foreground',
        extra: (
            <>
                <span className="whitespace-nowrap">Food budget</span>
                <span className="flex-1 h-1 bg-border rounded-full overflow-hidden">
                    <span
                        className="fill-bar block h-full bg-primary rounded-full"
                        style={{ '--bar-w': '41%', '--fill-delay': '0.55s' } as React.CSSProperties}
                    />
                </span>
                <span className="font-bold text-foreground">41%</span>
            </>
        ),
        note: 'Logged before the barista called your name.',
    },
    {
        time: '6:15 PM',
        dot: 'bg-accent',
        icon: 'goal',
        chip: 'Spanish practice',
        amount: '✓',
        amountTone: 'text-accent',
        extra: (
            <>
                <span className="flex gap-1">
                    {Array.from({ length: 7 }, (_, i) => (
                        <span
                            key={i}
                            className={`streak-cell w-1.5 h-1.5 rounded-full ${i < 5 ? 'bg-accent' : 'bg-border'}`}
                            style={{ transitionDelay: `${420 + i * 70}ms` }}
                        />
                    ))}
                </span>
                <span className="font-bold text-foreground">12 days</span>
                <span>and counting</span>
            </>
        ),
        note: 'Day 12. Still going.',
    },
    {
        time: '9:38 PM',
        dot: 'bg-secondary',
        icon: 'iou',
        chip: 'Rafi settled up',
        amount: '+$40',
        amountTone: 'text-success',
        extra: (
            <>
                <Check className="streak-cell w-3 h-3 text-success" strokeWidth={3} style={{ transitionDelay: '450ms' }} />
                <span>All IOUs settled</span>
                <span className="fade-late ml-auto font-bold text-success [--join-delay:0.9s]">Net +$45</span>
            </>
        ),
        note: 'Paid back. No reminder needed.',
    },
]

const TRUST_POINTS = ['Free forever', 'No credit card', 'Private by default']

const Home: React.FC = () => {
    const user = useSelector(selectUser)
    const isLoggedIn = Boolean(user.token)
    const firstName = (user.name?.trim() || user.username || '').split(' ')[0]

    return (
        <main>
            {/* ============================== HERO ============================== */}
            {/* -mt-16 pulls the hero's backdrop up behind the transparent sticky nav */}
            <section className="relative overflow-hidden -mt-16" aria-labelledby="hero-heading">
                {/* Backdrop: fading line grid + slow aurora orbs */}
                <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                    <div className="absolute inset-0 bg-grid-fade animate-grid-pan" />
                    <div className="absolute -top-32 right-[-10%] w-[480px] h-[480px] bg-primary/15 rounded-full blur-3xl animate-aurora" />
                    <div className="absolute -bottom-40 left-[-10%] w-[420px] h-[420px] bg-secondary/10 rounded-full blur-3xl animate-aurora [animation-delay:-9s]" />
                </div>

                <div className="relative max-w-7xl mx-auto px-6 lg:px-12 pt-[7.5rem] pb-10 lg:pt-44 lg:pb-28">
                    <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
                        {/* Copy */}
                        <div className="w-full lg:w-[54%] flex flex-col gap-6 text-center lg:text-left items-center lg:items-start">
                            {isLoggedIn && (
                                <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-primary/10 text-primary">
                                    Welcome back{firstName ? `, ${firstName}` : ''} 👋
                                </span>
                            )}
                            <h1
                                id="hero-heading"
                                className="text-4xl sm:text-5xl lg:text-[3.4rem] xl:text-6xl font-extrabold tracking-tight leading-[1.08] text-foreground text-balance"
                            >
                                <span className="whitespace-nowrap">Track money.</span>
                                <br className="hidden lg:block" />{' '}
                                <span className="whitespace-nowrap">Hit goals.</span>{' '}
                                <span className="text-gradient whitespace-nowrap">Settle up.</span>
                            </h1>
                            <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-xl">
                                {isLoggedIn
                                    ? 'Pick up where you left off. Your trackers are ready.'
                                    : 'One simple app for your spending, your goals, and the money friends owe you.'}
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                                {isLoggedIn ? (
                                    <Button
                                        asChild
                                        size="lg"
                                        className="h-12 px-8 rounded-xl text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 transition-all duration-300"
                                    >
                                        <Link to="/dashboard">
                                            <LayoutDashboard className="mr-1.5 h-4 w-4" />
                                            Go to Dashboard
                                        </Link>
                                    </Button>
                                ) : (
                                    <>
                                        <Button
                                            asChild
                                            size="lg"
                                            className="h-12 px-8 rounded-xl text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 transition-all duration-300"
                                        >
                                            <Link to="/auth?mode=signup">
                                                Start tracking free
                                                <ArrowRight className="ml-1.5 h-4 w-4" />
                                            </Link>
                                        </Button>
                                        <Button
                                            asChild
                                            variant="outline"
                                            size="lg"
                                            className="h-12 px-8 rounded-xl text-base font-semibold hover:bg-primary/5 transition-all duration-300"
                                        >
                                            <Link to="/auth?mode=signin">Sign in</Link>
                                        </Button>
                                    </>
                                )}
                            </div>
                            {!isLoggedIn && (
                                <ul className="flex flex-wrap items-center justify-center lg:justify-start gap-x-5 gap-y-2 mt-1">
                                    {TRUST_POINTS.map((point) => (
                                        <li key={point} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                            <Check className="w-3.5 h-3.5 text-success" strokeWidth={3} />
                                            {point}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* Living product collage — visible on every screen size */}
                        <div className="w-full lg:w-[46%]">
                            <HeroShowcase />
                        </div>
                    </div>
                </div>
            </section>

            {/* ============================ TOOLKIT ============================ */}
            <section className="py-16 lg:py-24 px-6" aria-labelledby="toolkit-heading">
                <div className="max-w-6xl mx-auto">
                    <SectionHeader
                        id="toolkit-heading"
                        eyebrow="What's inside"
                        heading="One app, three trackers"
                        sub="Each tool does one job well. Use them together or on their own."
                    />
                    <BentoFeatures />
                </div>
            </section>

            {/* ========================== HOW IT WORKS ========================== */}
            <section className="py-14 lg:py-20 px-6" aria-labelledby="how-it-works-heading">
                <div className="max-w-6xl mx-auto">
                    <div className="relative overflow-hidden bg-grey-x100 border border-border/60 rounded-[2rem] p-6 sm:p-10 lg:p-12">
                        <div className="absolute inset-0 bg-grid-fade opacity-60 pointer-events-none" aria-hidden="true" />
                        <Reveal>
                            <header className="flex items-end justify-between gap-6 mb-10 lg:mb-12">
                                <div>
                                    <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary mb-3">
                                        How it works
                                    </p>
                                    <h2
                                        id="how-it-works-heading"
                                        className="text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground"
                                    >
                                        Start in minutes
                                    </h2>
                                </div>
                                <p className="hidden lg:block text-sm text-muted-foreground max-w-[230px] text-right pb-1">
                                    About three minutes from sign-up to your first logged expense.
                                </p>
                            </header>
                        </Reveal>
                        <StepsShowcase />
                    </div>
                </div>
            </section>

            {/* ========================= A DAY WITH TRACERO ========================= */}
            <section className="py-16 lg:py-24 px-6" aria-labelledby="day-heading">
                <div className="max-w-6xl mx-auto">
                    <Reveal>
                        <header className="flex items-end justify-between gap-6 mb-10 lg:mb-14">
                            <div>
                                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary mb-3">
                                    In practice
                                </p>
                                <h2
                                    id="day-heading"
                                    className="text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground"
                                >
                                    A day with Tracero
                                </h2>
                            </div>
                            <div className="hidden lg:block -rotate-2 pb-1">
                                <p
                                    className="text-[15px] leading-snug text-foreground/75 text-right"
                                    style={{ fontFamily: 'var(--font-handwriting)' }}
                                >
                                    total time in the app:
                                    <br />
                                    <span className="relative inline-block">
                                        about thirty seconds
                                        <svg
                                            className="absolute -bottom-1.5 left-0 w-full"
                                            height="6"
                                            viewBox="0 0 120 6"
                                            preserveAspectRatio="none"
                                            aria-hidden="true"
                                        >
                                            <path
                                                d="M2 4 C 20 2, 40 5, 60 3 S 100 2, 118 4"
                                                stroke="var(--primary)"
                                                strokeWidth="1.5"
                                                fill="none"
                                                strokeLinecap="round"
                                                opacity="0.6"
                                            />
                                        </svg>
                                    </span>
                                </p>
                            </div>
                        </header>
                    </Reveal>
                    <div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
                            {MOMENTS.map((moment, i) => (
                                <Reveal key={moment.time} delay={i * 110} className="h-full">
                                    <div className="h-full flex flex-col">
                                        {/* the day's rail — each segment runs to the next moment's dot,
                                            the last one fades out */}
                                        <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                                            <span
                                                className={`w-2 h-2 rounded-full ${moment.dot} ring-4 ring-background flex-shrink-0`}
                                                aria-hidden="true"
                                            />
                                            <span>{moment.time}</span>
                                            <span
                                                className={`hidden md:block flex-1 h-px bg-gradient-to-r ml-1 ${
                                                    [
                                                        'from-primary/40 to-accent/40 md:-mr-5 lg:-mr-6',
                                                        'from-accent/40 to-secondary/40 md:-mr-5 lg:-mr-6',
                                                        'from-secondary/40 to-transparent',
                                                    ][i]
                                                }`}
                                                aria-hidden="true"
                                            />
                                        </p>
                                        <article className="flex-1 bg-card border border-border rounded-2xl p-5 flex flex-col">
                                            <div
                                                className="row-in flex items-center gap-2.5 bg-grey-x100 border border-border/60 rounded-xl px-3 py-2.5"
                                                style={{ transitionDelay: '180ms' }}
                                            >
                                                <CategoryIcon name={moment.icon} size={16} />
                                                <span className="text-xs font-semibold text-foreground">{moment.chip}</span>
                                                <span className={`ml-auto text-xs font-bold tabular-nums ${moment.amountTone}`}>
                                                    {moment.amount}
                                                </span>
                                            </div>
                                            {/* what Tracero does with the log — quiet context line */}
                                            <div
                                                className="row-in flex items-center gap-2 px-1 mt-2.5 text-[10px] font-medium text-muted-foreground"
                                                style={{ transitionDelay: '340ms' }}
                                                aria-hidden="true"
                                            >
                                                {moment.extra}
                                            </div>
                                            <div className="mt-4 pt-3 border-t border-border/60">
                                                <HandwrittenNote text={moment.note} />
                                            </div>
                                        </article>
                                    </div>
                                </Reveal>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ============================== CTA ============================== */}
            <section className="px-6 pb-20 lg:pb-28 pt-8" aria-labelledby="cta-heading">
                <Reveal className="max-w-5xl mx-auto">
                    <div className="grain relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-indigo-700 via-violet-700 to-purple-800 px-6 py-14 sm:p-14 lg:p-16 text-center">
                        {/* decorative: hero's grid language + soft highlight + concentric rings */}
                        <div className="absolute inset-0 bg-grid-white pointer-events-none" aria-hidden="true" />
                        <div
                            className="absolute -top-40 left-1/4 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl pointer-events-none"
                            aria-hidden="true"
                        />
                        <svg
                            className="absolute -right-24 -bottom-32 w-[380px] h-[380px] pointer-events-none"
                            viewBox="0 0 380 380"
                            aria-hidden="true"
                        >
                            {[60, 105, 150, 190].map((r) => (
                                <circle
                                    key={r}
                                    cx="190"
                                    cy="190"
                                    r={r}
                                    fill="none"
                                    stroke="white"
                                    strokeOpacity="0.09"
                                    strokeWidth="1.5"
                                />
                            ))}
                        </svg>

                        <div className="relative">
                            <h2
                                id="cta-heading"
                                className="text-3xl lg:text-4xl font-extrabold tracking-tight text-white mb-4"
                            >
                                {isLoggedIn ? 'Ready to keep going?' : 'Ready when you are'}
                            </h2>
                            <p className="text-white/75 text-lg mb-8 max-w-xl mx-auto">
                                {isLoggedIn
                                    ? 'Your trackers are waiting. Jump back in and keep the momentum going.'
                                    : 'Your first expense takes ten seconds to log.'}
                            </p>
                            <Button
                                asChild
                                size="lg"
                                className="h-12 px-8 rounded-xl text-base font-semibold bg-white text-slate-900 hover:bg-white/90 shadow-xl transition-all duration-300"
                            >
                                <Link to={isLoggedIn ? '/dashboard' : '/auth?mode=signup'}>
                                    {isLoggedIn ? (
                                        <>
                                            <LayoutDashboard className="mr-1.5 h-4 w-4" />
                                            Back to your dashboard
                                        </>
                                    ) : (
                                        <>
                                            Create your free account
                                            <ArrowRight className="ml-1.5 h-4 w-4" />
                                        </>
                                    )}
                                </Link>
                            </Button>
                            {!isLoggedIn && (
                                <p className="text-white/60 text-xs mt-5">Free forever · No credit card · No ads</p>
                            )}
                        </div>
                    </div>
                </Reveal>
            </section>
        </main>
    )
}

export default Home
