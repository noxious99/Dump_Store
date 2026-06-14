import React from 'react'
import { Plus } from 'lucide-react'

interface MobileFabProps {
  // Opens the transaction adder on the Expense tab — income is one
  // segment-tap away inside, so the common action stays single-tap
  onAdd: () => void
  disabled?: boolean
}

const MobileFab: React.FC<MobileFabProps> = ({ onAdd, disabled = false }) => {
  if (disabled) return null

  return (
    <button
      onClick={onAdd}
      className="lg:hidden fixed bottom-20 right-5 z-40 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center active:scale-95 transition-transform"
      aria-label="Add expense"
    >
      <Plus className="w-6 h-6" />
    </button>
  )
}

export default MobileFab
