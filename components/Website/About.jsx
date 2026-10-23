"use client"

import React from "react"
import Link from "next/link"
import { ArrowRight, ShieldCheck, Tag, Truck } from "lucide-react"

/* ------------------------------------------------------------------ */
/*  DATA                                                               */
/* ------------------------------------------------------------------ */
const FEATURES = [
  {
    id: 1,
    title: "Trusted Suppliers",
    desc: "Quality products from reputed brands",
    Icon: ShieldCheck,
  },
  {
    id: 2,
    title: "Transparent Pricing",
    desc: "No hidden charges, best market rates",
    Icon: Tag,
  },
  {
    id: 3,
    title: "Reliable Delivery",
    desc: "On-time delivery across Delhi NCR & Jaipur",
    Icon: Truck,
  },
]

/* Light city skyline for the background (x, width, height) */
const BUILDINGS = [
  [0, 38, 70],
  [44, 30, 105],
  [80, 44, 85],
  [130, 28, 125],
  [164, 40, 90],
  [210, 34, 140],
  [250, 46, 100],
  [302, 30, 75],
  [338, 40, 118],
  [384, 34, 92],
  [424, 44, 132],
  [474, 30, 80],
  [510, 40, 110],
  [556, 36, 88],
  [598, 44, 125],
  [648, 30, 72],
  [684, 44, 100],
  [734, 36, 82],
  [776, 40, 115],
  [822, 34, 78],
]

const Skyline = () => (
  <svg
    viewBox="0 0 860 200"
    preserveAspectRatio="xMaxYMax slice"
    className="pointer-events-none absolute bottom-0 right-0 h-[55%] w-full max-w-[900px] lg:h-[62%]"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="skyFade" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.28" />
        <stop offset="100%" stopColor="#cbd5e1" stopOpacity="0.1" />
      </linearGradient>
      <linearGradient id="skyMaskX" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#fff" stopOpacity="0" />
        <stop offset="35%" stopColor="#fff" stopOpacity="1" />
        <stop offset="100%" stopColor="#fff" stopOpacity="1" />
      </linearGradient>
      <mask id="skyMask">
        <rect width="860" height="200" fill="url(#skyMaskX)" />
      </mask>
    </defs>

    <g mask="url(#skyMask)">
      {/* Buildings */}
      {BUILDINGS.map(([x, w, h], i) => (
        <g key={i}>
          <rect x={x} y={200 - h} width={w} height={h} fill="url(#skyFade)" />
          {/* windows */}
          {Array.from({ length: Math.floor(h / 16) }).map((_, r) => (
            <rect
              key={r}
              x={x + 6}
              y={200 - h + 8 + r * 16}
              width={w - 12}
              height="2"
              fill="#fff"
              opacity="0.55"
            />
          ))}
        </g>
      ))}

      {/* Tower crane (right side) */}
      <g stroke="#94a3b8" strokeOpacity="0.4" strokeWidth="2" fill="none">
        <path d="M822 200V28" />
        <path d="M812 200V40M832 200V40" strokeWidth="1.4" />
        <path d="M770 28h80" />
        <path d="M850 28v22" strokeWidth="1.4" />
        <path d="M770 28l52-18 20 18" strokeWidth="1.4" />
        <path d="M775 28v30" strokeWidth="1.2" />
      </g>
    </g>
  </svg>
)

/* ---------------------------- COMPONENT ---------------------------- */
const AboutSection = () => {
  return (
    <section className="relative w-full overflow-hidden bg-linear-to-r from-white via-slate-50 to-slate-100 py-8 sm:py-10 lg:py-12">
      {/* Soft background glow */}
      <div className="pointer-events-none absolute -right-24 top-0 h-72 w-72 rounded-full bg-emerald-100/50 blur-3xl" />
      <Skyline />

      <div className="relative z-10 mx-auto grid max-w-[1400px] grid-cols-1 items-center gap-8 px-4 sm:px-6 lg:grid-cols-[1.15fr_1fr] lg:gap-10 lg:px-8">
        {/* ---------------- LEFT: ABOUT TEXT ---------------- */}
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-[#0b1b3f] sm:text-4xl">
            About Construct<span className="text-emerald-600">Ezy</span>
          </h2>

          <p className="mt-1.5 text-base text-slate-600 sm:text-lg">
            Your one-stop platform for construction materials and services.
          </p>

          <p className="mt-3 max-w-2xl text-[13px] leading-relaxed text-slate-600 sm:text-sm">
            ConstructEzy is built to make construction simple, fast and reliable.
            We connect homeowners, contractors and businesses with high-quality
            materials and verified service professionals — all in one place. From
            electrical and plumbing to paints and renovation services, we help
            you build your dreams with trusted products, fair pricing and a
            seamless experience.
          </p>

          <Link
            href="/about"
            className="group mt-5 inline-flex items-center gap-2.5 rounded-lg bg-emerald-700 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-800/20 transition-all hover:-translate-y-0.5 hover:bg-emerald-800 hover:shadow-lg sm:px-7 sm:py-3"
          >
            Learn More
            <ArrowRight
              size={16}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
        </div>

        {/* ---------------- RIGHT: 3 FEATURES ---------------- */}
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-0">
          {FEATURES.map(({ id, title, desc, Icon }) => (
            <li
              key={id}
              className="group flex flex-col items-center px-3 text-center sm:border-l sm:border-slate-200 sm:px-5 sm:first:border-l lg:px-6"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 ring-1 ring-emerald-100 transition-all duration-300 group-hover:scale-110 group-hover:bg-emerald-100 sm:h-[72px] sm:w-[72px]">
                <Icon
                  size={30}
                  strokeWidth={1.6}
                  className="text-emerald-700"
                />
              </div>

              <h3 className="mt-4 text-sm font-bold text-[#0b1b3f] sm:text-[15px]">
                {title}
              </h3>
              <p className="mt-1.5 max-w-[190px] text-xs leading-snug text-slate-500 sm:text-[13px]">
                {desc}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default AboutSection