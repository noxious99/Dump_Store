import React, { useEffect, useRef, useState } from 'react'
import { Plus, ArrowDownLeft, ArrowUpRight } from 'lucide-react'

interface MobileFabProps {
  onAddExpense: () => void
  onAddIncome: () => void
  disabled?: boolean
}

const MobileFab: React.FC<MobileFabProps> = ({
  onAddExpense,
  onAddIncome,
  disabled = false,
}) => {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  if (disabled) return null

  return (
    <div
      ref={ref}
      className="lg:hidden fixed bottom-5 right-5 z-40 flex flex-col items-end gap-2"
    >
      {open && (
        <>
          <button
            onClick={() => {
              onAddIncome()
              setOpen(false)
            }}
            className="h-9 pl-3 pr-4 flex items-center gap-2 text-sm font-semibold text-success bg-card border-2 border-success/30 rounded-full shadow-md active:scale-95 transition-transform"
          >
            <span className="w-5 h-5 rounded-full bg-success/15 flex items-center justify-center">
              <ArrowDownLeft className="w-3 h-3" />
            </span>
            Income
          </button>
          <button
            onClick={() => {
              onAddExpense()
              setOpen(false)
            }}
            className="h-9 pl-3 pr-4 flex items-center gap-2 text-sm font-semibold text-error bg-card border-2 border-error/30 rounded-full shadow-md active:scale-95 transition-transform"
          >
            <span className="w-5 h-5 rounded-full bg-error/15 flex items-center justify-center">
              <ArrowUpRight className="w-3 h-3" />
            </span>
            Expense
          </button>
        </>
      )}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center transition-transform"
        style={{ transform: open ? 'rotate(45deg)' : 'rotate(0)' }}
        aria-label={open ? 'Close add menu' : 'Open add menu'}
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  )
}

export default MobileFab
