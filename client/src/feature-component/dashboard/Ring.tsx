import React, { useEffect, useState } from 'react'

interface RingProps {
  pct: number
  size?: number
  sw?: number
  strokeColor?: string
  children?: React.ReactNode
}

const Ring: React.FC<RingProps> = ({
  pct,
  size = 48,
  sw = 4,
  strokeColor = 'var(--primary)',
  children,
}) => {
  const [animated, setAnimated] = useState(0)
  const r = (size - sw) / 2
  const circ = 2 * Math.PI * r

  useEffect(() => {
    const t = setTimeout(() => setAnimated(pct), 150)
    return () => clearTimeout(t)
  }, [pct])

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke="currentColor" strokeWidth={sw}
          className="text-border"
        />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" strokeLinecap="round" strokeWidth={sw}
          style={{
            stroke: strokeColor,
            strokeDasharray: circ,
            strokeDashoffset: circ - (Math.min(animated, 100) / 100) * circ,
            transition: 'stroke-dashoffset 1s cubic-bezier(.4,0,.2,1)',
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  )
}

export default Ring
