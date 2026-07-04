import React, { useEffect, useRef, useState } from 'react'

interface RevealProps {
    children: React.ReactNode
    /** Stagger offset in ms, applied when the element becomes visible. */
    delay?: number
    className?: string
}

/**
 * Fade-and-rise scroll reveal. Fires once when the element enters the
 * viewport; renders visible immediately for users who prefer reduced motion
 * (the CSS classes also no-op via the media query, this just skips the IO).
 */
const Reveal: React.FC<RevealProps> = ({ children, delay = 0, className = '' }) => {
    const ref = useRef<HTMLDivElement>(null)
    const [shown, setShown] = useState(false)

    useEffect(() => {
        const el = ref.current
        if (!el) return
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            setShown(true)
            return
        }
        const io = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setShown(true)
                    io.disconnect()
                }
            },
            { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
        )
        io.observe(el)
        return () => io.disconnect()
    }, [])

    return (
        <div
            ref={ref}
            className={`${shown ? 'reveal-shown' : 'reveal-hidden'} ${className}`}
            style={delay ? { transitionDelay: `${delay}ms` } : undefined}
        >
            {children}
        </div>
    )
}

export default Reveal
