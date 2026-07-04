import React from 'react'
import { Link } from 'react-router-dom'
import { Check, Flame } from 'lucide-react'
import logo from '../../assets/tracero_logo.png'

const LogoLockup: React.FC<{ white?: boolean }> = ({ white = false }) => (
    <Link to="/home" className="inline-flex items-center gap-2.5 group">
        <div
            role="img"
            aria-label="Tracero"
            className={`h-[26px] transition-transform duration-200 group-hover:scale-105 ${
                white ? 'bg-white' : 'bg-gradient-to-r from-primary to-accent'
            }`}
            style={{
                aspectRatio: '558 / 502',
                WebkitMaskImage: `url(${logo})`,
                maskImage: `url(${logo})`,
                WebkitMaskRepeat: 'no-repeat',
                maskRepeat: 'no-repeat',
                WebkitMaskPosition: 'center',
                maskPosition: 'center',
                WebkitMaskSize: 'contain',
                maskSize: 'contain',
            }}
        />
        <span
            className={`text-base font-extrabold tracking-tight ${white ? 'text-white' : 'text-foreground'}`}
            style={{ fontFamily: 'var(--font-heading)' }}
        >
            Tracero
        </span>
    </Link>
)

interface AuthShellProps {
    headline: string
    sub: string
    children: React.ReactNode
}

/**
 * Focused-flow layout for the auth screens: brand panel on the left (xl+),
 * form on the right. The app navbar is hidden on these routes, so both
 * sides carry their own logo link back home.
 */
const AuthShell: React.FC<AuthShellProps> = ({ headline, sub, children }) => (
    <div className="min-h-screen flex">
        {/* Brand panel — same visual language as the homepage CTA */}
        <div className="hidden xl:flex w-1/2 relative overflow-hidden grain bg-gradient-to-br from-indigo-700 via-violet-700 to-purple-800">
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

            <div className="absolute top-8 left-10 z-10">
                <LogoLockup white />
            </div>

            <div className="relative z-10 flex flex-col justify-center w-full max-w-lg mx-auto px-10">
                <h1 className="text-4xl xl:text-[2.75rem] font-extrabold tracking-tight text-white leading-[1.15] mb-4">
                    {headline}
                </h1>
                <p className="text-lg text-white/75 leading-relaxed mb-10">{sub}</p>

                {/* product vignette — the streak, in glass */}
                <div
                    aria-hidden="true"
                    className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-4 w-fit"
                >
                    <div className="flex gap-1.5 mb-2.5">
                        {Array.from({ length: 7 }, (_, i) => (
                            <span
                                key={i}
                                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                    i < 5 ? 'bg-white/90' : 'border border-white/30'
                                }`}
                            >
                                {i < 5 && <Check className="w-3.5 h-3.5 text-violet-700" strokeWidth={3} />}
                            </span>
                        ))}
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Flame className="w-3.5 h-3.5 text-amber-300" />
                        <span className="text-[11px] font-bold text-white">12-day streak</span>
                        <span className="text-[11px] text-white/60">and counting</span>
                    </div>
                </div>
                <p
                    className="text-[15px] text-white/70 mt-6 -rotate-2 w-fit"
                    style={{ fontFamily: 'var(--font-handwriting)' }}
                >
                    ten seconds a day
                </p>
            </div>
        </div>

        {/* Form side */}
        <div className="w-full xl:w-1/2 flex flex-col bg-background">
            <div className="xl:hidden px-5 pt-5">
                <LogoLockup />
            </div>
            <div className="flex-1 flex items-center justify-center px-4 sm:px-8 lg:px-16 py-10">
                {children}
            </div>
        </div>
    </div>
)

export default AuthShell
