'use client'
import React from 'react'
import Link from 'next/link'
import { FaCheckCircle, FaBriefcase, FaRegClock, FaHeart, FaRegHeart } from 'react-icons/fa'
import { Img, money } from '../ui'
import { Rating } from './parts'
import { WEBSITE_SERVICE_DETAILS } from '@/routes/ServiceRoute'

// Ek labour ka card: [photo] [title + rating + meta] [price + Book Now]
const ServiceCard = ({ s, liked, onLike }) => {
  const href = WEBSITE_SERVICE_DETAILS(s._id)
  return (
    <article className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-2.5 shadow-sm transition hover:border-emerald-200 hover:shadow-md sm:flex-row sm:items-stretch">
      <div className="relative h-48 w-full shrink-0 overflow-hidden rounded-lg sm:h-[120px] sm:w-[150px]">
        <Link href={href} className="block h-full w-full" aria-label={s.title}><Img src={s.photo} alt={s.title} className="h-full w-full object-cover transition duration-300 hover:scale-105" /></Link>
        <button type="button" aria-label="Add to wishlist" aria-pressed={!!liked} onClick={onLike} className="absolute left-2 top-2 flex h-7 w-7 items-center justify-center rounded-lg bg-white shadow">
          {liked ? <FaHeart size={13} className="text-red-500" /> : <FaRegHeart size={13} className="text-slate-500" />}
        </button>
      </div>

      <div className="min-w-0 flex-1 self-center">
        <Link href={href} className="text-[16px] font-bold text-[#0b1b3f] hover:text-emerald-700">{s.title}</Link>
        <p className="mt-0.5 line-clamp-1 text-[13px] text-gray-500">{s.shortDescription || `by ${s.labourName}`}</p>
        <div className="mt-1.5 flex items-center gap-1.5 text-[13px]">
          <Rating value={s.rating || 0} size={13} />
          <b className="text-slate-700">{s.rating ? s.rating.toFixed(1) : 'New'}</b>
          {s.reviewCount > 0 && <span className="text-gray-500">({s.reviewCount} reviews)</span>}
        </div>
        <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1.5 text-[11.5px] text-gray-500">
          {s.isVerified && <span className="flex items-center gap-1.5"><FaCheckCircle size={12} className="text-emerald-600" />Verified</span>}
          {s.experienceYears > 0 && <span className="flex items-center gap-1.5"><FaBriefcase size={11} className="text-slate-400" />{s.experienceYears}+ years experience</span>}
          {(s.badges || []).slice(0, 2).map((b) => <span key={b} className="flex items-center gap-1.5"><FaRegClock size={11} className="text-slate-400" />{b}</span>)}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-gray-100 pt-2.5 sm:min-w-[124px] sm:flex-col sm:justify-center sm:border-l sm:border-t-0 sm:pl-3 sm:pt-0">
        <div className="sm:text-center"><p className="text-[11px] text-gray-500">Starting at</p><p className="text-[22px] font-extrabold leading-tight text-[#0b1b3f]">{money(s.price)}</p></div>
        <Link href={href} className="rounded-lg bg-emerald-700 px-5 py-2 text-[13px] font-semibold text-white shadow-sm transition hover:bg-emerald-800 sm:w-full sm:text-center">Book Now</Link>
      </div>
    </article>
  )
}
export default ServiceCard
