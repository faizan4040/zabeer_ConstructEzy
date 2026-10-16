"use client"

import React, { useRef } from "react"
import { useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import { RiArrowLeftSLine, RiArrowRightSLine, RiArrowRightLine } from "react-icons/ri"
import {
  Hammer,
  Wrench,
  PaintRoller,
  Drill,
  HardHat,
  Truck,
  Pickaxe,
  House,
  ShieldCheck,
  Construction,
  Warehouse,
  Users,
} from "lucide-react"

const LABOUR_CATEGORIES = [
  { title: "All Workers", desc: "Browse all available workers", Icon: Users, slug: "all" },
  { title: "Helpers", desc: "Loading, shifting & site assistance", Icon: Construction, slug: "helpers" },
  { title: "Masons", desc: "Brickwork, plaster & construction", Icon: Hammer, slug: "masons" },
  { title: "Electricians", desc: "Wiring, fittings & repairs", Icon: Drill, slug: "electricians" },
  { title: "Plumbers", desc: "Pipes, taps & bathroom work", Icon: Wrench, slug: "plumbers" },
  { title: "Carpenters", desc: "Furniture & wood work", Icon: Warehouse, slug: "carpenters" },
  { title: "Painters", desc: "Interior & exterior painting", Icon: PaintRoller, slug: "painters" },
  { title: "Tile Experts", desc: "Floor & wall tile installation", Icon: House, slug: "tile-experts" },
]

const LaborSlider = ({ onAuthRequired }) => {
  const sliderRef = useRef(null)
  const router = useRouter()
  const auth = useSelector((store) => store.authStore.auth)

  const scrollLeft = () => sliderRef.current?.scrollBy({ left: -300, behavior: "smooth" })
  const scrollRight = () => sliderRef.current?.scrollBy({ left: 300, behavior: "smooth" })

  // Sirf Book Now button isko use karta hai (unchanged behaviour)
  const goBook = () => {
    if (!auth) {
      onAuthRequired?.()
      return
    }
    router.push("/user/book")
  }

  return (
    <section className="w-full bg-slate-50 py-12 sm:py-16 px-4 sm:px-8 lg:px-16">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            {/* Book Now - top left */}
            <button
              type="button"
              onClick={() => goBook()}
              className="mb-4 inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-gray-900 text-sm font-semibold transition-all cursor-pointer"
            >
              Book Now
              <RiArrowRightLine size={16} />
            </button>

            <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">
              Skilled Workforce
            </p>
            <h2 className="mt-1 text-2xl sm:text-3xl font-bold text-indigo-950">
              Labour Categories
            </h2>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={scrollLeft}
              aria-label="Scroll left"
              className="w-9 h-9 rounded-lg border border-gray-300 bg-white flex items-center justify-center text-indigo-950 hover:bg-indigo-950 hover:text-white hover:border-indigo-950 transition-colors cursor-pointer"
            >
              <RiArrowLeftSLine size={20} />
            </button>
            <button
              onClick={scrollRight}
              aria-label="Scroll right"
              className="w-9 h-9 rounded-lg border border-gray-300 bg-white flex items-center justify-center text-indigo-950 hover:bg-indigo-950 hover:text-white hover:border-indigo-950 transition-colors cursor-pointer"
            >
              <RiArrowRightSLine size={20} />
            </button>
          </div>
        </div>

        {/* Slider - static cards, no click action */}
        <div
          ref={sliderRef}
          className="flex gap-4 overflow-x-auto scroll-smooth pb-2"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {LABOUR_CATEGORIES.map(({ title, desc, Icon, slug }) => (
            <div
              key={slug}
              className="group shrink-0 w-48 sm:w-56 text-left bg-white rounded-xl border border-gray-200 hover:border-amber-400 hover:shadow-md transition p-5"
            >
              <div className="w-12 h-12 rounded-lg bg-indigo-50 group-hover:bg-indigo-950 flex items-center justify-center transition-colors">
                <Icon
                  size={24}
                  strokeWidth={1.75}
                  className="text-indigo-950 group-hover:text-amber-400 transition-colors"
                />
              </div>

              <h3 className="mt-4 font-semibold text-gray-900 text-base leading-tight">
                {title}
              </h3>
              <p className="mt-1 text-gray-500 text-xs leading-snug">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default LaborSlider