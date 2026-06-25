import React from 'react'
import { Plus, Wallet, Target, Handshake } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { QuickAddType } from './QuickAddSheet'

// The faint glyph behind the "+" — a line icon (not the gradient CategoryIcon,
// which can't be tinted) so it ghosts cleanly and adapts to the theme.
const WATERMARK: Record<QuickAddType, LucideIcon> = {
  transaction: Wallet,
  goal: Target,
  iou: Handshake,
}

interface DashboardFabProps {
  onAdd: () => void
  /** Active card's accent — the FAB fills with it (deepened a touch for contrast). */
  accent: string
  /** Active card's type — picks the watermark glyph + the sheet's opening tab. */
  type: QuickAddType
}

/**
 * Mobile-only quick-add anchor. Position/size/icon stay constant (the muscle
 * memory), but the fill recolors to the active carousel card and a faint
 * tracker glyph ghosts behind the "+" — together they signal what a tap will
 * add right now, without the ambiguity of a context-magic button.
 */
const DashboardFab: React.FC<DashboardFabProps> = ({ onAdd, accent, type }) => {
  const Watermark = WATERMARK[type]
  return (
    <button
      onClick={onAdd}
      aria-label="Add entry"
      // Deepen the accent ~12% so the white glyph clears contrast on the
      // lighter teal; indigo/violet only gain headroom.
      style={{ backgroundColor: `color-mix(in srgb, ${accent} 88%, #000)` }}
      className="lg:hidden fixed bottom-20 right-5 z-40 w-14 h-14 rounded-full text-primary-foreground shadow-lg flex items-center justify-center overflow-hidden active:scale-95 transition-[background-color,transform] duration-300"
    >
      {/* Identity texture: a small, faint, centered tracker glyph behind the +.
          currentColor → adapts to the theme foreground. */}
      <Watermark
        className="absolute -bottom-1.5 -left-1.5 w-10 h-10 opacity-20"
        strokeWidth={2}
        aria-hidden
      />
      <Plus className="relative w-6 h-6 drop-shadow-sm" strokeWidth={2} />
    </button>
  )
}

export default DashboardFab
