"use client"

import React, { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import { IMAGES } from "@/routes/AllImages"

/* ------------------------------------------------------------------ */
/*  SETTINGS                                                           */
/* ------------------------------------------------------------------ */
const AUTO_DELAY = 5000 // ms between slides

// true  -> live text + button is shown on top of the image (left side)
// false -> only the image is shown
const SHOW_TEXT = true

// Scroll targets (same IDs jo ShopServicesSection mein use hui hain)
const PRODUCTS_SECTION_ID = "products-section"
const SERVICES_SECTION_ID = "services-section"

/* ------------------------------------------------------------------ */
/*  SLIDES                                                             */
/* ------------------------------------------------------------------ */
const SLIDES = [
  {
    id: 1,
    eyebrow: "CONSTRUCTION MATERIALS MADE EASY",
    titleTop: "Everything your site",
    titleBottom: "needs,",
    highlight: "in one place",
    description:
      "Wide range of construction materials, top brands, quick delivery and expert support.",
    cta: { label: "Explore Products", targetId: PRODUCTS_SECTION_ID },
    image: IMAGES.homebanner_1,
    alt: "Cement, paints, pipes, switches and safety helmet",
  },
  {
    id: 2,
    eyebrow: "TOP BRANDS · BEST PRICES",
    titleTop: "Premium quality",
    titleBottom: "materials,",
    highlight: "delivered fast",
    description:
      "Cement, steel, bricks, paints and plumbing from trusted brands, right at your site.",
    cta: { label: "Shop Now", targetId: PRODUCTS_SECTION_ID },
    image: IMAGES.homebanner_2,
    alt: "Premium construction materials",
  },
  {
    id: 3,
    eyebrow: "EXPERT SUPPORT",
    titleTop: "Build smarter with",
    titleBottom: "trusted",
    highlight: "partners",
    description:
      "Get bulk quotes, expert guidance and on-time delivery for projects of every size.",
    cta: { label: "Get a Quote", targetId: SERVICES_SECTION_ID },
    image: IMAGES.homebanner_3,
    alt: "Construction experts and materials",
  },
]

/* ------------------------------------------------------------------ */
/*  SMOOTH SCROLL                                                      */
/* ------------------------------------------------------------------ */
const scrollToSection = (e, targetId) => {
  e.preventDefault()
  const el = document.getElementById(targetId)

  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" })
    window.history.replaceState(null, "", `#${targetId}`)
  }
}

/* ------------------------------------------------------------------ */
/*  ICONS                                                              */
/* ------------------------------------------------------------------ */
const ArrowIcon = ({ className = "" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M5 12h14" />
    <path d="m13 6 6 6-6 6" />
  </svg>
)

const Chevron = ({ dir = "left" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4 sm:h-5 sm:w-5"
    aria-hidden="true"
  >
    {dir === "left" ? <path d="m15 18-6-6 6-6" /> : <path d="m9 18 6-6-6-6" />}
  </svg>
)

/* ------------------------------------------------------------------ */
/*  COMPONENT                                                          */
/* ------------------------------------------------------------------ */
const ConstructionHero = () => {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const touchStartX = useRef(null)
  const total = SLIDES.length

  const goTo = useCallback((i) => setCurrent((i + total) % total), [total])
  const next = useCallback(() => setCurrent((p) => (p + 1) % total), [total])
  const prev = useCallback(() => setCurrent((p) => (p - 1 + total) % total), [total])

  /* Autoplay: restarts on every slide change, pauses on hover/touch */
  useEffect(() => {
    if (paused) return
    const t = setTimeout(next, AUTO_DELAY)
    return () => clearTimeout(t)
  }, [current, paused, next])

  /* Keyboard arrows */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowLeft") prev()
      if (e.key === "ArrowRight") next()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [next, prev])

  /* Touch swipe */
  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX
    setPaused(true)
  }
  const onTouchEnd = (e) => {
    if (touchStartX.current === null) return
    const diff = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(diff) > 50) (diff > 0 ? prev : next)()
    touchStartX.current = null
    setPaused(false)
  }

  return (
    <section
      className="relative w-full overflow-hidden bg-slate-100"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      aria-roledescription="carousel"
      aria-label="Construction materials promotions"
    >
      {/* Thin banner height */}
      <div className="relative h-[240px] sm:h-[300px] md:h-[340px] lg:h-[380px] xl:h-[420px]">
        {/* Slides track */}
        <div
          className="flex h-full w-full transition-transform duration-700 ease-[cubic-bezier(0.65,0,0.35,1)]"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {SLIDES.map((slide, i) => {
            const active = i === current
            return (
              <div
                key={slide.id}
                className="relative h-full w-full shrink-0 grow-0 basis-full"
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${total}`}
                aria-hidden={!active}
              >
                {/* FULL-WIDTH BACKGROUND IMAGE */}
                <Image
                  src={slide.image}
                  alt={slide.alt}
                  fill
                  priority={i === 0}
                  quality={85}
                  sizes="100vw"
                  className="object-cover object-right md:object-center"
                />

                {SHOW_TEXT && (
                  <>
                    {/* Soft white fade on the left so text stays readable */}
                    <div className="pointer-events-none absolute inset-0 bg-linear-to-r from-white/90 via-white/55 to-transparent md:from-white/80 md:via-white/35 md:to-transparent" />

                    {/* TEXT + BUTTON */}
                    <div className="absolute inset-0 mx-auto flex max-w-[1400px] items-center px-12 sm:px-16 lg:px-20">
                      <div
                        className={`max-w-[85%] transition-all duration-700 delay-200 sm:max-w-[60%] md:max-w-[50%] ${
                          active ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                        }`}
                      >
                        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-700 sm:mb-3 sm:text-xs">
                          {slide.eyebrow}
                        </p>

                        <h2 className="text-[24px] font-extrabold leading-[1.1] tracking-tight text-[#0b1b3f] sm:text-3xl md:text-4xl lg:text-5xl">
                          {slide.titleTop}
                          <br />
                          {slide.titleBottom}{" "}
                          <span className="text-emerald-600">{slide.highlight}</span>
                        </h2>

                        <p className="mt-2 max-w-md text-xs leading-relaxed text-slate-700 sm:mt-3 sm:text-sm md:text-base">
                          {slide.description}
                        </p>

                        <a
                          href={`#${slide.cta.targetId}`}
                          onClick={(e) => scrollToSection(e, slide.cta.targetId)}
                          tabIndex={active ? 0 : -1}
                          className="group mt-3 inline-flex items-center gap-2 rounded-md bg-emerald-700 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-emerald-700/25 transition-all hover:-translate-y-0.5 hover:bg-emerald-800 sm:mt-5 sm:px-6 sm:py-2.5 sm:text-sm md:text-base"
                        >
                          {slide.cta.label}
                          <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </a>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>

        {/* ARROWS */}
        <button
          type="button"
          onClick={prev}
          aria-label="Previous slide"
          className="absolute left-2 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white text-slate-800 shadow-lg ring-1 ring-black/5 transition hover:scale-110 hover:bg-emerald-700 hover:text-white sm:left-4 sm:h-11 sm:w-11"
        >
          <Chevron dir="left" />
        </button>
        <button
          type="button"
          onClick={next}
          aria-label="Next slide"
          className="absolute right-2 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white text-slate-800 shadow-lg ring-1 ring-black/5 transition hover:scale-110 hover:bg-emerald-700 hover:text-white sm:right-4 sm:h-11 sm:w-11"
        >
          <Chevron dir="right" />
        </button>

        {/* DOTS */}
        <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
          {SLIDES.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === current}
              className={`h-2 rounded-full transition-all duration-500 ${
                i === current
                  ? "w-7 bg-emerald-600"
                  : "w-2 bg-white/80 ring-1 ring-black/10 hover:bg-white"
              }`}
            />
          ))}
        </div>

        {/* AUTOPLAY PROGRESS BAR */}
        <div className="absolute bottom-0 left-0 z-20 h-[3px] w-full bg-black/5">
          <div
            key={`${current}-${paused}`}
            className="h-full origin-left bg-emerald-600"
            style={{
              animation: paused ? "none" : `heroProgress ${AUTO_DELAY}ms linear forwards`,
              transform: paused ? "scaleX(0)" : undefined,
            }}
          />
        </div>
      </div>

      <style jsx global>{`
        @keyframes heroProgress {
          from {
            transform: scaleX(0);
          }
          to {
            transform: scaleX(1);
          }
        }
      `}</style>
    </section>
  )
}

export default ConstructionHero