"use client"

import { useState, useEffect, useCallback } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

const SLIDES = [
  {
    tag: "About PSSF",
    heading: "Kenya's Public Service Pension, Modernised",
    body: "The Public Service Superannuation Fund (PSSF) was established under the Public Service Superannuation Scheme Act, 2012. It replaces the old non-contributory pension system and covers all public servants employed on or after 1 January 2021.",
    accent: "#1A7A4A",
  },
  {
    tag: "Contributions",
    heading: "A Shared Commitment to Your Future",
    body: "As a member you contribute 7.5% of your basic salary every month. Your employer — the Government of Kenya — contributes 15%. These funds are pooled, invested, and grow on your behalf until retirement or separation.",
    accent: "#2563EB",
  },
  {
    tag: "Benefits",
    heading: "What You're Entitled To",
    body: "PSSF provides retirement benefits, invalidity benefits, and death/survivor benefits. On reaching retirement age (60 years) or completing 10 years of service, members receive a lump-sum gratuity plus a monthly pension for life.",
    accent: "#7C3AED",
  },
  {
    tag: "Regulation",
    heading: "Supervised & Fully Regulated",
    body: "PSSF is registered with and regulated by the Retirement Benefits Authority (RBA) under Cap. 197 of the Laws of Kenya. The fund is audited annually and reports to the National Treasury and Parliament.",
    accent: "#D97706",
  },
  {
    tag: "AVC",
    heading: "Grow Your Nest Egg Faster",
    body: "Additional Voluntary Contributions (AVC) let you top up your mandatory contributions at any time. There is no upper limit — any extra amount you contribute is invested and compounded, boosting your final benefit payout.",
    accent: "#0891B2",
  },
  {
    tag: "Digital Portal",
    heading: "Self-Service, Anywhere",
    body: "This portal lets you enrol, nominate beneficiaries, set up AVCs, submit claims, and download contribution statements — all without visiting an office. Every submission is cryptographically logged for your protection.",
    accent: "#E11D48",
  },
]

export function PssfCarousel() {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)

  const next = useCallback(() => setCurrent((c) => (c + 1) % SLIDES.length), [])
  const prev = () => setCurrent((c) => (c - 1 + SLIDES.length) % SLIDES.length)

  useEffect(() => {
    if (paused) return
    const t = setInterval(next, 5000)
    return () => clearInterval(t)
  }, [paused, next])

  const slide = SLIDES[current]

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Accent bar */}
      <div className="h-1 w-full transition-all duration-500" style={{ background: slide.accent }} />

      <div className="px-5 py-5 min-h-[130px] flex flex-col justify-between gap-3">
        <div className="space-y-1.5">
          <span
            className="inline-block text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
            style={{ background: `${slide.accent}18`, color: slide.accent }}
          >
            {slide.tag}
          </span>
          <h3 className="text-sm font-black text-[#0D2137] leading-snug">{slide.heading}</h3>
          <p className="text-xs text-gray-500 leading-relaxed">{slide.body}</p>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between pt-1">
          {/* Dots */}
          <div className="flex gap-1.5">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={cn(
                  "rounded-full transition-all duration-300 cursor-pointer",
                  i === current ? "w-5 h-1.5" : "w-1.5 h-1.5 bg-gray-200 hover:bg-gray-300"
                )}
                style={i === current ? { background: slide.accent } : undefined}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>

          {/* Arrows */}
          <div className="flex gap-1">
            <button
              onClick={prev}
              className="flex size-6 items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600 transition-all cursor-pointer"
            >
              <ChevronLeft className="size-3.5" />
            </button>
            <button
              onClick={next}
              className="flex size-6 items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600 transition-all cursor-pointer"
            >
              <ChevronRight className="size-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
