"use client"

import React, { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import { RiArrowRightLine } from "react-icons/ri"
import { ChevronRight, ArrowRight } from "lucide-react"
import { IMAGES } from "@/routes/AllImages"

/* ------------------------------------------------------------------ */
/*  SERVICES  (images come from your existing IMAGES keys)             */
/* ------------------------------------------------------------------ */
const SERVICES = [
  { id: 1, title: "Electrician", slug: "electricians", image: IMAGES?.Electrician },
  { id: 2, title: "Plumber", slug: "plumbers", image: IMAGES?.Plumber },
  { id: 3, title: "Carpenter", slug: "carpenters", image: IMAGES?.Carpenter },
  { id: 4, title: "Mason", slug: "masons", image: IMAGES?.Mason },
  { id: 5, title: "Painter", slug: "painters", image: IMAGES?.Painter },
  { id: 6, title: "Welder", slug: "welders", image: IMAGES?.Welder },
  { id: 7, title: "AC Technician", slug: "ac-technician", image: IMAGES?.Ac_Technician },
  { id: 8, title: "Tile Fixer", slug: "tile-fixers", image: IMAGES?.Tile_Fixer },
]

const LaborSlider = ({ onAuthRequired }) => {
  const sectionRef = useRef(null)
  const [visible, setVisible] = useState(false)
  const router = useRouter()
  const auth = useSelector((store) => store.authStore.auth)

  // Book Now behaviour unchanged (login check -> booking page)
  const goBook = () => {
    if (!auth) {
      onAuthRequired?.()
      return
    }
    router.push("/user/book")
  }

  // Cards reveal once, when the section scrolls into view
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true)
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.12 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section  
      id="services-section"
      ref={sectionRef}
      className="w-full bg-white py-6 sm:py-8"
    >
      <style>{`
        @keyframes serviceCardIn {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes bookRing {
          0%   { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.55); }
          70%  { box-shadow: 0 0 0 14px rgba(245, 158, 11, 0); }
          100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0); }
        }
        .service-card { opacity: 0; }
        .service-card.is-visible { animation: serviceCardIn 0.55s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
        .book-now-btn { animation: bookRing 2.2s ease-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .service-card { opacity: 1; }
          .service-card.is-visible { animation: none; }
          .book-now-btn { animation: none; }
        }
      `}</style>

      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        {/* ---------- Header ---------- */}
        <div className="mb-4 flex items-center justify-between sm:mb-5">
          <h2 className="text-xl font-extrabold tracking-tight text-[#0b1b3f] sm:text-2xl lg:text-[28px]">
            Book a Service
          </h2>

          <button
            type="button"
            onClick={goBook}
            className="group inline-flex cursor-pointer items-center gap-1.5 text-sm font-semibold text-emerald-700 transition-colors hover:text-emerald-900"
          >
            View All Services
            <ArrowRight
              size={16}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </button>
        </div>

        {/* ---------- Book Now strip (hire labour) ---------- */}
        <div className="mb-5 flex flex-col gap-4 rounded-2xl border border-amber-200 bg-linear-to-r from-amber-50 via-orange-50 to-amber-50 p-4 sm:mb-6 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">
              Skilled Workforce
            </p>
            <p className="mt-1 text-base font-bold text-indigo-950 sm:text-lg">
              Need a worker today? Pick a service or book directly.
            </p>
          </div>

          {/* Book Now - main action */}
          <button
            type="button"
            onClick={() => goBook()}
            className="book-now-btn group inline-flex w-full cursor-pointer items-center justify-center gap-3 rounded-xl bg-linear-to-r from-amber-400 to-orange-500 px-8 py-3.5 text-base font-bold text-gray-900 shadow-lg shadow-amber-500/30 transition-all hover:-translate-y-0.5 hover:from-amber-500 hover:to-orange-600 hover:shadow-xl hover:shadow-amber-500/40 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-950/40 active:translate-y-0 sm:w-auto sm:text-lg"
          >
            Book Now
            <RiArrowRightLine
              size={20}
              className="transition-transform group-hover:translate-x-1"
            />
          </button>
        </div>

        {/* ---------- Service cards ---------- */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {SERVICES.map((item, i) => (
            <button
              key={item.id}
              type="button"
              onClick={goBook}
              style={{ animationDelay: `${i * 80}ms` }}
              className={`service-card ${
                visible ? "is-visible" : ""
              } group flex cursor-pointer flex-col overflow-hidden rounded-xl border border-slate-200/80 bg-white text-left shadow-[0_1px_3px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-900/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500`}
            >
              {/* Photo */}
              <div className="relative h-36 w-full overflow-hidden bg-slate-100 sm:h-40 lg:h-44">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    loading="lazy"
                    quality={75}
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-4xl font-bold text-slate-300">
                    {item.title.charAt(0)}
                  </div>
                )}
              </div>

              {/* Name + chevron */}
              <div className="flex items-center justify-between px-4 py-3.5">
                <span className="line-clamp-1 text-sm font-bold text-[#0b1b3f] transition-colors group-hover:text-emerald-700 sm:text-[15px]">
                  {item.title}
                </span>
                <ChevronRight
                  size={16}
                  className="shrink-0 text-slate-500 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-emerald-700"
                />
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

export default LaborSlider











