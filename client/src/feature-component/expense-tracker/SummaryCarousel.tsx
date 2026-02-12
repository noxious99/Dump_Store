import React, { useEffect, useState } from 'react'
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    type CarouselApi,
} from '@/components/ui/carousel'

interface SummaryCarouselProps {
    children: React.ReactNode
}

const SummaryCarousel: React.FC<SummaryCarouselProps> = ({ children }) => {
    const childArray = React.Children.toArray(children)
    const [api, setApi] = useState<CarouselApi>()
    const [activeIndex, setActiveIndex] = useState(0)

    useEffect(() => {
        if (!api) return

        const onSelect = () => {
            setActiveIndex(api.selectedScrollSnap())
        }

        onSelect()
        api.on('select', onSelect)
        return () => { api.off('select', onSelect) }
    }, [api])

    return (
        <div>
            <Carousel
                setApi={setApi}
                opts={{
                    align: 'start',
                    breakpoints: {
                        '(min-width: 1024px)': { active: false }
                    }
                }}
            >
                <CarouselContent className="-ml-3 lg:-ml-6">
                    {childArray.map((child, index) => (
                        <CarouselItem
                            key={index}
                            className="pl-3 basis-[calc(100%-1.5rem)] lg:pl-6 lg:basis-1/3 animate-stagger-in"
                        >
                            {child}
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>

            {/* Dot indicators — mobile only */}
            <div className="flex justify-center gap-2 mt-3 lg:hidden">
                {childArray.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => api?.scrollTo(index)}
                        aria-label={`Go to card ${index + 1}`}
                        className={`h-2 rounded-full transition-all duration-300 ${
                            index === activeIndex
                                ? 'w-6 bg-primary'
                                : 'w-2 bg-grey-x300'
                        }`}
                    />
                ))}
            </div>
        </div>
    )
}

export default SummaryCarousel
