"use client"

import React from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { IMAGES } from "@/routes/AllImages"

const TESTIMONIALS = [
  {
    id: 1,
    name: "Amit Sharma",
    city: "Gurgaon",
    rating: 5,
    avatar: IMAGES?.avatar_amit,
    text: "Great quality products and super fast delivery. The platform is very easy to use and saved me a lot of time for my home construction.",
  },
  {
    id: 2,
    name: "Sneha Verma",
    city: "Delhi",
    rating: 5,
    avatar: IMAGES?.avatar_sneha,
    text: "Booked a plumbing service through ConstructEzy and the professional arrived on time. Very professional and reasonably priced.",
  },
  {
    id: 3,
    name: "Rohit Mehta",
    city: "Noida",
    rating: 5,
    avatar: IMAGES?.avatar_rohit,
    text: "Wide range of genuine products at competitive prices. I regularly order materials for my site and the experience has been excellent.",
  },
]

/* ------------------------------ ICONS ------------------------------ */
const Star = ({ filled = true }) => (
  <svg
    viewBox="0 0 24 24"
    className={`h-4 w-4 sm:h-[18px] sm:w-[18px] ${
      filled ? "fill-amber-400" : "fill-slate-200"
    }`}
    aria-hidden="true"
  >
    <path d="M12 2.5l2.92 6.1 6.58.9-4.8 4.62 1.2 6.6L12 17.5l-5.9 3.22 1.2-6.6L2.5 9.5l6.58-.9L12 2.5z" />
  </svg>
)

const QuoteMark = () => (
  <svg
    viewBox="0 0 32 32"
    className="h-8 w-8 fill-slate-200 sm:h-9 sm:w-9"
    aria-hidden="true"
  >
    <path d="M13 6C7.5 8 4 12.6 4 19v7h10v-9H8.6c.4-3 2.3-5.3 5.4-6.6L13 6Zm15 0c-5.5 2-9 6.6-9 13v7h10v-9h-5.4c.4-3 2.3-5.3 5.4-6.6L28 6Z" />
  </svg>
)

/* ------------------------------ CARD ------------------------------- */
const ReviewCard = ({ item }) => {
  const initials = item.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)

  return (
    <article className="relative flex h-full w-[85%] shrink-0 snap-start flex-col rounded-xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/10 sm:w-[60%] md:w-auto md:shrink md:p-6">
      {/* Quote mark */}
      <div className="absolute right-5 top-4 sm:right-6 sm:top-5">
        <QuoteMark />
      </div>

      {/* Person */}
      <div className="flex items-center gap-4">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-emerald-100 ring-2 ring-white shadow-md sm:h-[72px] sm:w-[72px]">
          {item.avatar ? (
            <Image
              src={item.avatar}
              alt={item.name}
              fill
              sizes="72px"
              className="object-cover"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-lg font-bold text-emerald-700">
              {initials}
            </span>
          )}
        </div>

        <div className="min-w-0">
          <h3 className="truncate text-[15px] font-bold text-[#0b1b3f] sm:text-base">
            {item.name}
          </h3>
          <p className="text-xs font-medium text-slate-600 sm:text-[13px]">
            {item.city}
          </p>
          <div
            className="mt-1 flex items-center gap-0.5"
            aria-label={`${item.rating} out of 5 stars`}
          >
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} filled={i < item.rating} />
            ))}
          </div>
        </div>
      </div>

      {/* Review text */}
      <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-[15px]">
        “{item.text}”
      </p>
    </article>
  )
}

/* ---------------------------- COMPONENT ---------------------------- */
const Testimonial = () => {
  return (
    <section className="w-full bg-white py-6 sm:py-8">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between gap-4 sm:mb-5">
          <div>
            <h2 className="text-xl font-extrabold tracking-tight text-[#0b1b3f] sm:text-2xl lg:text-[28px]">
              What our customers say
            </h2>
            <p className="mt-1 text-xs text-slate-600 sm:text-sm">
              Trusted by homeowners, builders and businesses across India.
            </p>
          </div>

          <Link
            href="/reviews"
            className="group inline-flex shrink-0 items-center gap-1.5 pt-1 text-sm font-semibold text-emerald-700 transition-colors hover:text-emerald-900"
          >
            View All Reviews
            <ArrowRight
              size={16}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </div>

        {/* Cards: 3 columns on desktop, swipe row on mobile */}
        <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 [scrollbar-width:none] sm:mx-0 sm:px-0 md:grid md:grid-cols-3 md:gap-5 md:overflow-visible md:pb-0 lg:gap-6 [&::-webkit-scrollbar]:hidden">
          {TESTIMONIALS.map((item) => (
            <ReviewCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default Testimonial