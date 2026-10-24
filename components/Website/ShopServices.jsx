"use client"

import React from "react"
import Image from "next/image"
import { IMAGES } from "@/routes/AllImages"

/* ------------------------------ CONFIG ------------------------------ */
// Ye IDs un sections par lagani hain jahan scroll hoke rukna hai
const PRODUCTS_SECTION_ID = "products-section"
const SERVICES_SECTION_ID = "services-section"

/* ------------------------------ ICONS ------------------------------ */
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

const BadgeIcon = () => (
  <svg viewBox="0 0 24 24" className="h-6 w-6 sm:h-7 sm:w-7" aria-hidden="true">
    <path d="M8 13.5 6 22l6-3 6 3-2-8.5" fill="#0f9d6b" opacity="0.85" />
    <circle cx="12" cy="9" r="7" fill="#0f9d6b" />
    <path
      d="m8.8 9.2 2.2 2.2 4.2-4.4"
      fill="none"
      stroke="#fff"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const DollarIcon = () => (
  <svg viewBox="0 0 24 24" className="h-6 w-6 sm:h-7 sm:w-7" aria-hidden="true">
    <circle cx="12" cy="12" r="10" fill="#0f9d6b" />
    <path
      d="M14.6 9.2c-.3-1-1.3-1.6-2.6-1.6-1.5 0-2.6.8-2.6 1.9 0 2.7 5.4 1.2 5.4 4 0 1.2-1.2 2-2.8 2-1.4 0-2.5-.7-2.8-1.8M12 6.2v1.4m0 8.8v1.4"
      fill="none"
      stroke="#fff"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
)

const TruckIcon = () => (
  <svg viewBox="0 0 24 24" className="h-6 w-6 sm:h-7 sm:w-7" aria-hidden="true">
    <path d="M2 6.5A1.5 1.5 0 0 1 3.5 5H14v11H2V6.5Z" fill="#0f9d6b" />
    <path d="M14 8h4l4 4v4h-8V8Z" fill="#0f9d6b" opacity="0.85" />
    <circle cx="7" cy="17.5" r="2.2" fill="#fff" stroke="#0f9d6b" strokeWidth="1.6" />
    <circle cx="17.5" cy="17.5" r="2.2" fill="#fff" stroke="#0f9d6b" strokeWidth="1.6" />
    <path d="M5 9h6M5 12h4" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
)

const CheckCircle = ({ tone = "emerald" }) => (
  <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" aria-hidden="true">
    <circle cx="12" cy="12" r="11" fill={tone === "teal" ? "#14a38b" : "#10a56d"} />
    <path
      d="m7.2 12.4 3.3 3.3 6.3-6.6"
      fill="none"
      stroke="#fff"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

/* ------------------------------- DATA ------------------------------ */
const SHOP_FEATURES = [
  { label: "Top Brands", icon: <BadgeIcon /> },
  { label: "Competitive Prices", icon: <DollarIcon /> },
  { label: "Fast Delivery", icon: <TruckIcon /> },
]

const SERVICE_POINTS = [
  "Verified Professionals",
  "Upfront Pricing",
  "On-time Service",
  "Quality Assurance",
]

/* --------------------------- SMOOTH SCROLL -------------------------- */
const scrollToSection = (e, targetId) => {
  e.preventDefault()
  const el = document.getElementById(targetId)

  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" })
    // URL mein #hash set hota hai, page reload nahi hota
    window.history.replaceState(null, "", `#${targetId}`)
  }
}

/* ------------------------------ BUTTON ----------------------------- */
const CardButton = ({ targetId, children }) => (
  <a
    href={`#${targetId}`}
    onClick={(e) => scrollToSection(e, targetId)}
    className="group inline-flex items-center gap-2.5 rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-800/20 transition-all hover:-translate-y-0.5 hover:bg-emerald-800 hover:shadow-lg sm:px-7 sm:py-3 sm:text-[15px]"
  >
    {children}
    <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
  </a>
)

/* ----------------------------- COMPONENT --------------------------- */
const ShopServicesSection = () => {
  return (
    <section className="w-full bg-white py-5 sm:py-8">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-4 px-4 sm:px-6 md:grid-cols-2 md:gap-6 lg:px-8">
        {/* =================== CARD 1 : SHOP PRODUCTS =================== */}
        <article className="group relative flex min-h-[260px] flex-col overflow-hidden rounded-2xl border border-emerald-100 bg-linear-to-br from-emerald-50 via-emerald-50/70 to-green-100/60 p-5 shadow-sm transition-shadow hover:shadow-xl sm:min-h-[270px] sm:p-7">
          {/* Product image (right) */}
          <div className="pointer-events-none absolute bottom-10 right-0 top-0 w-[58%] sm:w-[55%]">
            <Image
              src={IMAGES.shopproducts}
              alt="Cement, paint, pipes, switches and wood"
              fill
              sizes="(min-width: 768px) 28vw, 60vw"
              className="object-contain object-right-bottom transition-transform duration-500 group-hover:scale-105"
            />
          </div>

          {/* Text */}
          <div className="relative z-10 max-w-[60%] sm:max-w-[50%]">
            <h2 className="text-2xl font-extrabold tracking-tight text-[#0b1b3f] sm:text-3xl lg:text-[34px]">
              Shop Products
            </h2>
            <p className="mt-2 text-[13px] leading-snug text-slate-600 sm:mt-3 sm:text-base">
              High quality construction materials from trusted brands.
            </p>
            <div className="mt-4 sm:mt-5">
              <CardButton targetId={PRODUCTS_SECTION_ID}>Browse Products</CardButton>
            </div>
          </div>

          {/* Feature row */}
          <ul className="relative z-10 mt-auto flex flex-wrap items-center gap-x-5 gap-y-2 pt-5 sm:gap-x-8">
            {SHOP_FEATURES.map((f) => (
              <li
                key={f.label}
                className="flex items-center gap-2 text-xs font-semibold text-[#0b1b3f] sm:text-sm"
              >
                {f.icon}
                {f.label}
              </li>
            ))}
          </ul>
        </article>

        {/* =================== CARD 2 : BOOK SERVICES =================== */}
        <article className="group relative flex min-h-[260px] flex-col overflow-hidden rounded-2xl border border-sky-100 bg-linear-to-br from-sky-50 via-blue-50/80 to-indigo-100/60 p-5 shadow-sm transition-shadow hover:shadow-xl sm:min-h-[270px] sm:p-7">
          {/* Worker image */}
          <div className="pointer-events-none absolute bottom-0 right-0 top-0 w-[55%] sm:right-[8%] sm:w-[50%] lg:right-[10%]">
            <Image
              src={IMAGES.book_services}
              alt="Verified ConstructEzy professional"
              fill
              sizes="(min-width: 768px) 25vw, 55vw"
              className="object-contain object-bottom transition-transform duration-500 group-hover:scale-105"
            />
          </div>

          {/* Text */}
          <div className="relative z-10 max-w-[55%] sm:max-w-[48%]">
            <h2 className="text-2xl font-extrabold tracking-tight text-[#0b1b3f] sm:text-3xl lg:text-[34px]">
              Book Services
            </h2>
            <p className="mt-2 text-[13px] leading-snug text-slate-600 sm:mt-3 sm:text-base">
              Verified professionals for all your construction needs.
            </p>
            <div className="mt-4 sm:mt-5">
              <CardButton targetId={SERVICES_SECTION_ID}>Browse Services</CardButton>
            </div>
          </div>

          {/* Checklist panel (right) */}
          <ul className="absolute right-3 top-1/2 z-10 hidden -translate-y-1/2 space-y-3 rounded-xl bg-white/80 px-4 py-4 shadow-md ring-1 ring-black/5 backdrop-blur-sm lg:block xl:right-4">
            {SERVICE_POINTS.map((p, i) => (
              <li
                key={p}
                className="flex items-center gap-2.5 text-[11px] font-medium text-slate-700 xl:text-xs"
              >
                <CheckCircle tone={i === 2 ? "teal" : "emerald"} />
                {p}
              </li>
            ))}
          </ul>

          {/* Mobile / tablet: compact checklist at bottom */}
          <ul className="relative z-10 mt-auto grid grid-cols-2 gap-x-3 gap-y-2 pt-5 lg:hidden">
            {SERVICE_POINTS.map((p, i) => (
              <li
                key={p}
                className="flex items-center gap-2 text-[11px] font-semibold text-slate-700 sm:text-xs"
              >
                <CheckCircle tone={i === 2 ? "teal" : "emerald"} />
                {p}
              </li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  )
}

export default ShopServicesSection