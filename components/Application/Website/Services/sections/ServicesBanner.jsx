'use client'
import React from 'react'
import Link from 'next/link'
import { FaChevronRight, FaShieldAlt, FaRupeeSign, FaRegClock } from 'react-icons/fa'
import { HERO_IMG } from '@/lib/servicesConfig'

const POINTS = [{ t: 'Verified Professionals', I: FaShieldAlt }, { t: 'Transparent Pricing', I: FaRupeeSign }, { t: 'On-time Service', I: FaRegClock }]

const ServicesBanner = ({ image = HERO_IMG }) => (
  <section className="relative mt-3 overflow-hidden rounded-2xl border border-sky-100 bg-gradient-to-r from-white via-sky-50 to-sky-100 shadow-sm">
    <div className="pointer-events-none absolute -right-16 -top-20 h-72 w-72 rounded-full bg-sky-200/50 blur-3xl" />
    <nav className="relative z-10 flex items-center gap-2 px-5 pt-4 text-[13px] text-gray-500 sm:px-8" aria-label="Breadcrumb">
      <Link href="/" className="hover:text-emerald-700">Home</Link><FaChevronRight size={9} /><span className="font-medium text-slate-700">Services</span>
    </nav>
    <div className="relative z-10 px-5 pb-7 pt-3 sm:px-8 md:max-w-[62%]">
      <h1 className="text-[32px] font-extrabold leading-[1.1] text-[#0b1b3f] sm:text-[44px]">Home &amp; Construction<br /><span className="text-emerald-600">Services</span></h1>
      <p className="mt-3 max-w-md text-[15px] leading-relaxed text-slate-600 sm:text-base">Verified professionals for all your construction and renovation needs.</p>
      <ul className="mt-5 flex flex-wrap gap-x-7 gap-y-3">
        {POINTS.map(({ t, I }) => (
          <li key={t} className="flex items-center gap-2 text-[13px] font-semibold text-[#0b1b3f]">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white shadow-sm"><I size={13} /></span>{t}
          </li>
        ))}
      </ul>
    </div>
    {image && <img src={image} alt="" aria-hidden="true" className="pointer-events-none absolute bottom-0 right-0 z-0 hidden h-full max-h-[280px] w-auto object-contain md:block" />}
  </section>
)
export default ServicesBanner
