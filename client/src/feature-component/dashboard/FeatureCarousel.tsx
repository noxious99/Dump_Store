import React from 'react'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel'
import { CategoryIcon, type CategoryIconName } from '@/components/CategoryIcon'

export interface FeatureSlide {
  key: string
  label: string
  icon: CategoryIconName
  /** Accent color token for the active tab — each card's identity color. */
  accent: string
  /** When true, a dot on the tab flags that this feature needs the user now. */
  attention?: boolean
  node: React.ReactNode
}

interface FeatureCarouselProps {
  slides: FeatureSlide[]
}

/**
 * Mobile-only horizontal, swipeable carousel for the three feature summary
 * cards (Expenses / Goals / IOUs). Replaces the vertical stack on small
 * screens so the cards no longer pile the page into a tall wall — one card
 * shows at a time, the rest are a swipe (or tab tap) away. Desktop keeps the
 * equal stacked cards (it has the room and the wall isn't a problem there).
 *
 * The cards stay co-equal — full width, full card, equal turn; none is shrunk
 * or demoted. The segmented tab strip doubles as the position indicator and as
 * direct navigation, and carries an "attention dot" so an off-screen card can
 * still signal it needs the user (e.g. over budget). That dot is what keeps the
 * dashboard a triage surface even though only one card is visible at a time.
 */
const FeatureCarousel: React.FC<FeatureCarouselProps> = ({ slides }) => {
  const [api, setApi] = React.useState<CarouselApi>()
  const [selected, setSelected] = React.useState(0)

  React.useEffect(() => {
    if (!api) return
    const onSelect = () => setSelected(api.selectedScrollSnap())
    onSelect()
    api.on('select', onSelect)
    api.on('reInit', onSelect)
    return () => {
      api.off('select', onSelect)
    }
  }, [api])

  return (
    <div>
      {/* Segmented tab strip — indicator + direct navigation + attention dots */}
      <div className="flex items-center gap-1 mb-3 p-1 bg-grey-x100 rounded-xl">
        {slides.map((s, i) => {
          const active = i === selected
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => api?.scrollTo(i)}
              aria-label={`Show ${s.label}${s.attention ? ' — needs attention' : ''}`}
              aria-current={active}
              className={`relative flex-1 inline-flex items-center justify-center gap-1.5 h-8 rounded-lg text-xs font-semibold transition-colors ${
                active ? 'bg-card shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
              style={active ? { color: s.accent } : undefined}
            >
              <CategoryIcon name={s.icon} size={16} />
              <span>{s.label}</span>
              {s.attention && (
                <span
                  className="absolute top-1 right-1.5 flex h-2 w-2"
                  aria-hidden
                >
                  <span className="absolute inline-flex h-full w-full rounded-full bg-error opacity-60 animate-ping" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-error" />
                </span>
              )}
            </button>
          )
        })}
      </div>

      <Carousel setApi={setApi} opts={{ align: 'start' }}>
        {/* items-stretch keeps every slide at the tallest card's height, so the
            container never jumps as the user swipes between them. */}
        <CarouselContent className="items-stretch">
          {slides.map((s) => (
            <CarouselItem key={s.key}>{s.node}</CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  )
}

export default FeatureCarousel
