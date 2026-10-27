'use client'
import Link from "next/link"
import { FaBuilding, FaPencilRuler, FaTruck, FaHardHat, FaUserTie, FaArrowRight } from "react-icons/fa"
import { IMAGES } from "@/routes/AllImages"

const BANNER_IMAGE = IMAGES.projectEnquiry
const ENQUIRY_LINK = "/project-enquiry" 

const FEATURES = [
  { label: ["New", "Construction"], icon: FaBuilding },
  { label: ["Renovation"], icon: FaPencilRuler },
  { label: ["Bulk Material", "Supply"], icon: FaTruck },
  { label: ["Labour &", "Contractor"], icon: FaHardHat },
  { label: ["Architect &", "Interior Support"], icon: FaUserTie },
]

export default function ProjectEnquiry() {
  return (
    <section className="px-3 sm:px-6 lg:px-8 my-6 sm:my-8">
      <div className="relative max-w-400 mx-auto overflow-hidden rounded-2xl border border-emerald-100 shadow-sm bg-linear-to-r from-emerald-50 via-emerald-50/70 to-white">

        {/* Image: desktop = right side, mobile = bottom strip */}
        <div className="hidden md:block absolute inset-y-0 right-0 w-[48%] lg:w-[44%]">
          <img src={BANNER_IMAGE} alt="Construction project planning" className="h-full w-full object-cover object-center" />
          {/* left fade into the green background */}
          <div className="absolute inset-0 bg-linear-to-r from-emerald-50 via-emerald-50/30 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 px-5 py-6 sm:px-8 sm:py-8 lg:px-10 md:w-[68%] lg:w-[62%]">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0b2a4a] tracking-tight">
            Project Enquiry
          </h2>
          <p className="mt-2 text-lg sm:text-xl font-bold text-gray-900">
            Planning a new project or renovation?
          </p>
          <p className="mt-1.5 text-sm text-gray-600 max-w-xl">
            Get customized quotes, expert consultation and reliable supply &amp; service partners for your construction project.
          </p>

          {/* Feature chips */}
          <ul className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:flex lg:flex-wrap lg:items-center gap-x-4 gap-y-4 lg:gap-x-6 rounded-xl bg-white/70 backdrop-blur-sm px-4 py-3 w-full lg:w-fit">
            {FEATURES.map(({ label, icon: Icon }) => (
              <li key={label.join(" ")} className="flex items-center gap-2.5">
                <Icon size={26} className="text-[#0B8457] shrink-0" />
                <span className="text-[13px] font-semibold leading-tight text-gray-900">
                  {label.map((l, i) => (
                    <span key={i} className="block">{l}</span>
                  ))}
                </span>
              </li>
            ))}
          </ul>

          <Link
            href={ENQUIRY_LINK}
            className="mt-5 inline-flex items-center justify-center gap-2 w-full sm:w-auto rounded-lg bg-[#0B8457] hover:bg-[#086b47] text-white text-sm sm:text-base font-semibold px-7 py-3 shadow-md transition-colors"
          >
            Get a Project Quote
            <FaArrowRight size={14} />
          </Link>
        </div>

        {/* Mobile image strip (below md) */}
        <div className="md:hidden relative h-44 sm:h-56">
          <img src={BANNER_IMAGE} alt="Construction project planning" className="h-full w-full object-cover object-right" />
          <div className="absolute inset-0 bg-linear-to-b from-emerald-50 via-transparent to-transparent" />
        </div>
      </div>
    </section>
  )
}