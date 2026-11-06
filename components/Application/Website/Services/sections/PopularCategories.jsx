'use client'
import React from 'react'
import { FaArrowRight } from 'react-icons/fa'
import { Img } from '../ui'

const PopularCategories = ({ categories, activeTop, onSelect }) => {
  if (!categories.length) return null
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-bold text-[#0b1b3f]">Popular Service Categories</h2>
        <button onClick={() => onSelect('all')} className="flex items-center gap-1.5 text-[13px] font-semibold text-emerald-700 hover:underline">View All <FaArrowRight size={11} /></button>
      </div>
      <div className="no-scrollbar flex gap-3 overflow-x-auto pb-2">
        {categories.map((c) => (
          <button key={c._id} onClick={() => onSelect(c.slug)} className={`w-[100px] shrink-0 overflow-hidden rounded-xl border bg-white text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:w-[108px] ${activeTop?._id === c._id ? 'border-emerald-600 ring-2 ring-emerald-600/40' : 'border-gray-200'}`}>
            <Img src={c.image} alt={c.name} className="h-[100px] w-full object-cover sm:h-[108px]" />
            <span className="flex min-h-[38px] items-center justify-center px-1 py-1 text-[11.5px] font-semibold leading-tight text-slate-700">{c.name}</span>
          </button>
        ))}
      </div>
    </section>
  )
}
export default PopularCategories
