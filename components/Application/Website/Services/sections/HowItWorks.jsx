import React from 'react'
import { FaArrowRight } from 'react-icons/fa'
import { STEPS } from '@/lib/servicesConfig'

const HowItWorks = () => (
  <section className="mt-10 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-5 sm:p-6">
    <h2 className="mb-4 text-xl font-bold text-[#0b1b3f]">How Service Booking Works</h2>
    <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {STEPS.map(({ t, d, Icon }, i) => (
        <li key={t} className="relative flex items-start gap-3 rounded-xl bg-white p-4 shadow-sm">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-xs font-bold text-white">{i + 1}</span>
          <span className="min-w-0 flex-1"><b className="block text-[13px] text-[#0b1b3f]">{t}</b><span className="text-[11.5px] leading-snug text-gray-500">{d}</span></span>
          <Icon size={22} className="shrink-0 text-emerald-700/70" />
          {i < STEPS.length - 1 && <FaArrowRight size={12} className="absolute -right-[14px] top-1/2 z-10 hidden -translate-y-1/2 text-gray-400 lg:block" />}
        </li>
      ))}
    </ol>
  </section>
)
export default HowItWorks
