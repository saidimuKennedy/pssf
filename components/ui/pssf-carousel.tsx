"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export interface CarouselSlide {
  src: string
  alt: string
  caption?: string
  tag?: string
}

const DEFAULT_SLIDES: CarouselSlide[] = [
  {
    src: "/images/3rd_annual_meeting.jpeg",
    alt: "PSSF CEO addressing members at the 3rd Annual Members Meeting",
    caption: "3rd Annual Members Meeting",
    tag: "Leadership",
  },
  {
    src: "/images/3rd_meeting.jpeg",
    alt: "PSSF Board of Trustees and senior officials at the 3rd Annual Meeting",
    caption: "Board of Trustees & Senior Officials",
    tag: "Governance",
  },
]

interface PssfCarouselProps {
  slides?: CarouselSlide[]
  /** tall = landing page hero size, compact = dashboard widget */
  size?: "tall" | "compact"
}

export function PssfCarousel({ slides = DEFAULT_SLIDES, size = "compact" }: PssfCarouselProps) {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)

  const next = useCallback(() => setCurrent((c) => (c + 1) % slides.length), [slides.length])
  const prev = () => setCurrent((c) => (c - 1 + slides.length) % slides.length)

  useEffect(() => {
    if (paused) return
    const t = setInterval(next, 5000)
    return () => clearInterval(t)
  }, [paused, next])

  const slide = slides[current]

  return (
    <div
      className="relative overflow-hidden rounded-2xl bg-[#0D2137] group"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Image */}
      <div className={cn("relative w-full", size === "tall" ? "h-72 sm:h-96" : "h-48")}>
        <Image
          key={slide.src}
          src={slide.src}
          alt={slide.alt}
          fill
          className="object-cover transition-opacity duration-500"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority={current === 0}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0D2137]/80 via-transparent to-transparent" />
      </div>

      {/* Caption */}
      {(slide.caption || slide.tag) && (
        <div className="absolute bottom-10 left-0 right-0 px-4">
          {slide.tag && (
            <span className="inline-block text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#1A7A4A]/80 text-white mb-1">
              {slide.tag}
            </span>
          )}
          {slide.caption && (
            <p className="text-xs font-bold text-white/90 leading-snug">{slide.caption}</p>
          )}
        </div>
      )}

      {/* Arrows */}
      <button
        onClick={prev}
        className="absolute left-2 top-1/2 -translate-y-1/2 flex size-7 items-center justify-center rounded-full bg-black/30 text-white opacity-0 group-hover:opacity-100 hover:bg-black/50 transition-all cursor-pointer"
      >
        <ChevronLeft className="size-4" />
      </button>
      <button
        onClick={next}
        className="absolute right-2 top-1/2 -translate-y-1/2 flex size-7 items-center justify-center rounded-full bg-black/30 text-white opacity-0 group-hover:opacity-100 hover:bg-black/50 transition-all cursor-pointer"
      >
        <ChevronRight className="size-4" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={cn(
              "rounded-full transition-all duration-300 cursor-pointer",
              i === current ? "w-5 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/40 hover:bg-white/60"
            )}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
