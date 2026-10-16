"use client"

import React, { useRef } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { IMAGES } from "@/routes/AllImages"

const categories = [
  { id: 1, title: "Electrician", image: IMAGES.Electrician },
  { id: 2, title: "Plumber", image: IMAGES.Plumber },
  { id: 3, title: "Carpenter", image: IMAGES.Carpenter },
  { id: 4, title: "Mason", image: IMAGES.Mason },
  { id: 5, title: "Painter", image: IMAGES.Painter },
  { id: 6, title: "Welder", image: IMAGES.Welder },
  { id: 7, title: "AC Technician", image: IMAGES.Ac_Technician },
  { id: 8, title: "Tile Fixer", image: IMAGES.Tile_Fixer },
]

const ShopBySlider = () => {
  const sliderRef = useRef(null)

  const scrollLeft = () => {
    sliderRef.current?.scrollBy({
      left: -400,
      behavior: "smooth",
    })
  }

  const scrollRight = () => {
    sliderRef.current?.scrollBy({
      left: 400,
      behavior: "smooth",
    })
  }

  return (
    <section id="services" className="w-full px-4 sm:px-8 lg:px-16 py-10">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-black">
          Hire by Service
        </h2>

        <div className="flex items-center gap-3">
          <button
            onClick={scrollLeft}
            className="
              w-10 h-10
              rounded-full
              border border-gray-300
              flex items-center justify-center
              hover:bg-black hover:text-white
              transition-all duration-300
              cursor-pointer
            "
          >
            <ChevronLeft size={20} />
          </button>

          <button
            onClick={scrollRight}
            className="
              w-10 h-10
              rounded-full
              border border-gray-300
              flex items-center justify-center
              hover:bg-black hover:text-white
              transition-all duration-300
              cursor-pointer
            "
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* SLIDER - static cards, no click action */}
      <div
        ref={sliderRef}
        className="
          flex gap-5
          overflow-x-auto
          scroll-smooth
          snap-x snap-mandatory
          hide-scrollbar
          pb-2
        "
      >
        {categories.map((item) => (
          <div
            key={item.id}
            className="
              relative
              min-w-65
              sm:min-w-[320px]
              lg:min-w-95
              h-85
              sm:h-105
              rounded-3xl
              overflow-hidden
              group
              snap-start
              shrink-0
            "
          >
            {/* IMAGE */}
            <Image
              src={item.image}
              alt={item.title}
              fill
              loading="lazy"
              quality={75}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="
                object-cover
                transition-transform
                duration-500
                group-hover:scale-105
                transform-gpu
                will-change-transform
              "
            />

            {/* OVERLAY */}
            <div className="absolute inset-0 bg-black/30 z-10" />

            {/* CONTENT */}
            <div className="absolute bottom-5 left-5 z-20">
              <h3 className="text-white text-xl sm:text-2xl font-semibold">
                {item.title}
              </h3>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default ShopBySlider