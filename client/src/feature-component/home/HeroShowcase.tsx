import React, { useEffect, useState } from 'react'
import { Check } from 'lucide-react'
import Ring from '@/feature-component/dashboard/Ring'
import { CategoryIcon } from '@/components/CategoryIcon'

/* Fictional-but-plausible demo data. The collage is decorative (aria-hidden):
   it exists to show the product's real UI language, not to be read by AT. */

const WEEK_BARS = [42, 58, 34, 72, 50, 88, 64] // % heights, Mon–Sun
const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

const TOP_CATEGORIES = [
    { icon: 'food', amount: '$342' },
    { icon: 'groceries', amount: '$256' },
    { icon: 'travel', amount: '$180' },
    { icon: 'entertainment', amount: '$121' },
]

const QUICK_LOGS = [
    { icon: 'food', label: 'Coffee', amount: '$4.50' },
    { icon: 'travel', label: 'Bus fare', amount: '$2.25' },
    { icon: 'groceries', label: 'Groceries', amount: '$32.40' },
]

const prefersReducedMotion = () =>
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Eased count-up for the headline amount. */
const useCountUp = (target: number, duration = 1400) => {
    const [value, setValue] = useState(() => (prefersReducedMotion() ? target : 0))

    useEffect(() => {
        if (prefersReducedMotion()) return
        let raf: number
        const t0 = performance.now()
        const tick = (t: number) => {
            const p = Math.min((t - t0) / duration, 1)
            const eased = 1 - Math.pow(1 - p, 3)
            setValue(Math.round(target * eased))
            if (p < 1) raf = requestAnimationFrame(tick)
        }
        raf = requestAnimationFrame(tick)
        return () => cancelAnimationFrame(raf)
    }, [target, duration])

    return value
}

/**
 * The hero visual: a composed collage of Tracero's real card language —
 * expense overview, a floating goal ring, a settled IOU, and a quick-log
 * toast that keeps logging by itself. No stock art; the product is the art.
 */
const HeroShowcase: React.FC = () => {
    const spend = useCountUp(1284)
    const [settled, setSettled] = useState(() => prefersReducedMotion())
    const [logIdx, setLogIdx] = useState(0)
    const reduced = prefersReducedMotion()

    // Bars + budget line grow in shortly after mount
    useEffect(() => {
        const t = setTimeout(() => setSettled(true), 250)
        return () => clearTimeout(t)
    }, [])

    // The quick-log toast cycles through entries
    useEffect(() => {
        if (reduced) return
        const id = setInterval(() => {
            setLogIdx((i) => (i + 1) % QUICK_LOGS.length)
        }, 3600)
        return () => clearInterval(id)
    }, [reduced])

    const log = QUICK_LOGS[logIdx]

    return (
        <div aria-hidden="true" className="relative w-full max-w-[440px] lg:max-w-[470px] mx-auto select-none pt-12 pb-16 px-3">
            {/* Backdrop glow behind the collage */}
            <div className="absolute inset-8 bg-gradient-to-br from-primary/25 via-accent/15 to-secondary/20 blur-3xl rounded-full opacity-60" />

            {/* ============ Main card — monthly expense overview ============ */}
            <div className="relative bg-card/95 backdrop-blur-sm border border-border rounded-2xl p-5 shadow-xl">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                            <CategoryIcon name="expense" size={20} />
                        </div>
                        <span className="text-sm font-bold text-foreground">June overview</span>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-success/10 text-success">
                        On track
                    </span>
                </div>

                <div className="flex items-baseline gap-1.5 mb-2.5">
                    <span className="text-3xl font-extrabold text-foreground tracking-tight tabular-nums">
                        ${spend.toLocaleString()}
                    </span>
                    <span className="text-sm text-muted-foreground">/ $2,000</span>
                </div>

                {/* Budget bar */}
                <div className="h-1 bg-border rounded-full overflow-hidden mb-4">
                    <div
                        className="h-full rounded-full bg-primary transition-all duration-1000 ease-out"
                        style={{ width: settled ? '64%' : '0%' }}
                    />
                </div>

                {/* This week — mini bar chart */}
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    This week
                </p>
                <div className="flex items-end justify-between gap-2 h-16 mb-1">
                    {WEEK_BARS.map((h, i) => (
                        <div key={i} className="flex-1 h-full flex items-end">
                            <div
                                className={`w-full rounded-[3px] ${i === 5 ? 'bg-primary' : 'bg-primary/25'}`}
                                style={{
                                    height: `${h}%`,
                                    transform: settled ? 'scaleY(1)' : 'scaleY(0)',
                                    transformOrigin: 'bottom',
                                    transition: `transform 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${i * 70}ms`,
                                }}
                            />
                        </div>
                    ))}
                </div>
                <div className="flex justify-between gap-2 mb-4">
                    {DAY_LABELS.map((d, i) => (
                        <span key={i} className="flex-1 text-center text-[9px] font-medium text-muted-foreground/70">
                            {d}
                        </span>
                    ))}
                </div>

                {/* Top categories */}
                <div className="flex items-center gap-3 flex-wrap pt-3 border-t border-border">
                    {TOP_CATEGORIES.map((cat, i) => (
                        <div key={i} className="flex items-center gap-1">
                            <CategoryIcon name={cat.icon} size={16} />
                            <span className="text-[10px] text-muted-foreground font-medium">{cat.amount}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ============ Floating goal card — top right ============ */}
            <div className="absolute -top-1 -right-1 sm:-right-5 animate-float">
                <div className="bg-card border border-border rounded-xl p-3 shadow-lg w-[148px]">
                    <p className="text-[11px] font-bold text-foreground leading-tight mb-2">Learn Spanish</p>
                    <div className="flex items-center gap-2.5">
                        <Ring pct={72} size={40} sw={4} strokeColor="var(--accent)">
                            <span className="text-[9px] font-bold text-foreground">72%</span>
                        </Ring>
                        <div>
                            <p className="text-[10px] font-semibold text-foreground leading-tight">12-day</p>
                            <p className="text-[10px] text-muted-foreground leading-tight">streak</p>
                            <div className="flex gap-[3px] mt-1">
                                {Array.from({ length: 7 }, (_, i) => (
                                    <span
                                        key={i}
                                        className={`w-1.5 h-1.5 rounded-full ${i < 5 ? 'bg-accent' : 'bg-border'}`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ============ Floating IOU chip — bottom left ============ */}
            <div className="absolute bottom-3 -left-1 sm:-left-6 animate-float-delayed">
                <div className="flex items-center gap-2.5 bg-card border border-border rounded-xl pl-3 pr-3.5 py-2.5 shadow-lg">
                    <div className="w-7 h-7 rounded-full bg-secondary/15 flex items-center justify-center">
                        <span className="text-[10px] font-bold text-secondary">RA</span>
                    </div>
                    <div>
                        <p className="text-[11px] font-semibold text-foreground leading-tight">Rafi settled up</p>
                        <p className="text-[10px] text-muted-foreground leading-tight">IOU · just now</p>
                    </div>
                    <span className="text-xs font-bold text-success ml-1.5">+$40</span>
                </div>
            </div>

            {/* ============ Quick-log toast — cycles by itself ============ */}
            <div className="absolute top-2 -left-1 sm:-left-4">
                <div
                    key={logIdx}
                    className="flex items-center gap-2 bg-popover border border-border rounded-xl pl-2.5 pr-3 py-2 shadow-lg"
                    style={reduced ? undefined : { animation: 'toast-cycle 3.6s ease-in-out both' }}
                >
                    <CategoryIcon name={log.icon} size={16} />
                    <span className="text-[11px] font-semibold text-popover-foreground">
                        {log.label} · {log.amount}
                    </span>
                    <span className="w-4 h-4 rounded-full bg-success/15 flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-success" strokeWidth={3} />
                    </span>
                </div>
            </div>

            {/* ============ Handwritten annotation ============ */}
            <div className="hidden sm:block absolute -bottom-3 right-6 text-muted-foreground">
                <svg width="46" height="34" viewBox="0 0 46 34" fill="none" className="ml-8 -mb-1 opacity-60">
                    <path
                        d="M42 30 C 32 28, 16 22, 9 6"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                    />
                    <path
                        d="M5 12 L9 5 L15 9"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                    />
                </svg>
                <p
                    className="text-sm -rotate-3 opacity-80"
                    style={{ fontFamily: 'var(--font-handwriting)' }}
                >
                    ten seconds a day
                </p>
            </div>
        </div>
    )
}

export default HeroShowcase
