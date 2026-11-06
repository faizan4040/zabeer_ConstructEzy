'use client'

import React, { useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import Link from 'next/link'
import { FaCheckCircle, FaRegClock, FaShieldAlt, FaStar, FaRegStar, FaStarHalfAlt, FaChevronRight, FaArrowRight, FaUserCheck } from 'react-icons/fa'
import { Img, money, fmtDate } from './ui'
import { WEBSITE_SERVICES, WEBSITE_SERVICE_BOOK } from '@/routes/ServiceRoute'

const Rating = ({ value = 0, size = 14 }) => (
  <span className="inline-flex gap-0.5 text-amber-400">
    {[1, 2, 3, 4, 5].map((i) => value >= i ? <FaStar key={i} size={size} /> : value >= i - 0.5 ? <FaStarHalfAlt key={i} size={size} /> : <FaRegStar key={i} size={size} className="text-amber-300" />)}
  </span>
)
const TABS = [['included', "What's Included"], ['process', 'Service Process'], ['reviews', 'Ratings & Reviews']]

const Skeleton = () => (
  <div className="mx-auto w-full max-w-[1100px] animate-pulse px-4 py-6 sm:px-6">
    <div className="mb-4 h-4 w-64 rounded bg-gray-100" />
    <div className="grid gap-5 rounded-2xl border bg-white p-5 md:grid-cols-[300px_1fr] lg:grid-cols-[300px_1fr_240px]">
      <div className="h-60 rounded-xl bg-gray-100" /><div className="space-y-3"><div className="h-6 w-1/2 rounded bg-gray-100" /><div className="h-4 w-1/3 rounded bg-gray-100" /><div className="h-16 rounded bg-gray-100" /></div><div className="h-40 rounded-xl bg-gray-100" />
    </div>
  </div>
)

const ServiceDetails = ({ id }) => {
  const [s, setS] = useState(null)
  const [state, setState] = useState('loading')
  const [err, setErr] = useState('')
  const [tab, setTab] = useState('included')
  const [reviews, setReviews] = useState([])
  const [showAll, setShowAll] = useState(false)

  const load = useCallback(() => {
    setState('loading'); setErr('')
    axios.get(`/api/service-listing/${id}`, { timeout: 25000 })
      .then(({ data }) => { if (!data.success) throw new Error(data.message || 'Not available'); setS(data.data); setState('ok') })
      .catch((e) => { setErr(e.code === 'ECONNABORTED' ? 'Server slow hai (database connect nahi ho paya). Dobara try karo.' : e.message); setState('error') })
    axios.get(`/api/service-listing/${id}/reviews`, { timeout: 25000 }).then(({ data }) => setReviews(data.data || [])).catch(() => {})
  }, [id])
  useEffect(() => { load() }, [load])

  if (state === 'loading') return <Skeleton />
  if (state === 'error') return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <p className="mb-1 text-lg font-bold text-[#0b1b3f]">Service load nahi hui</p>
      <p className="mb-5 text-sm text-gray-500">{err}</p>
      <div className="flex justify-center gap-3">
        <button onClick={load} className="rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800">Retry</button>
        <Link href={WEBSITE_SERVICES} className="rounded-lg border border-emerald-700 px-5 py-2.5 text-sm font-semibold text-emerald-700">Back to services</Link>
      </div>
    </div>
  )

  const included = s.whatsIncluded || []
  const list = showAll ? included : included.slice(0, 4)

  return (
    <div className="mx-auto w-full max-w-[1100px] px-4 pb-14 sm:px-6">
      <nav className="flex flex-wrap items-center gap-1.5 py-3 text-[13px] text-gray-500" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-emerald-700">Home</Link><FaChevronRight size={9} />
        <Link href={WEBSITE_SERVICES} className="hover:text-emerald-700">Services</Link><FaChevronRight size={9} />
        {s.category?.slug && <><Link href={`${WEBSITE_SERVICES}?category=${s.category.slug}`} className="hover:text-emerald-700">{s.category.name}</Link><FaChevronRight size={9} /></>}
        <span className="font-medium text-slate-800">{s.title}</span>
      </nav>

      {/* top: photo | info | price box */}
      <section className="grid gap-5 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5 md:grid-cols-[300px_minmax(0,1fr)] lg:grid-cols-[300px_minmax(0,1fr)_240px]">
        <Img src={s.photo} alt={s.title} className="h-64 w-full rounded-xl object-cover object-top md:h-full md:max-h-[300px]" />

        <div className="min-w-0">
          <h1 className="text-[24px] font-extrabold leading-tight text-[#0b1b3f] sm:text-[28px]">{s.title}</h1>
          <p className="mt-0.5 text-sm text-gray-500">by {s.labourName}{s.experienceYears > 0 && ` · ${s.experienceYears} years experience`}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm"><Rating value={s.rating} size={15} /><b>{s.rating ? s.rating.toFixed(1) : 'New'}</b>{s.reviewCount > 0 && <span className="text-gray-500">({s.reviewCount} reviews)</span>}</div>
          <p className="mt-3 text-[13.5px] leading-relaxed text-slate-600">{s.description || s.shortDescription}</p>
          <ul className="mt-4 space-y-2.5 text-[13.5px] text-slate-700">
            {s.isVerified && <li className="flex items-center gap-2.5"><FaCheckCircle className="text-emerald-600" />Verified Professionals</li>}
            <li className="flex items-center gap-2.5"><FaRegClock className="text-emerald-600" />On-time Service</li>
            {s.hasWarranty && <li className="flex items-center gap-2.5"><FaShieldAlt className="text-emerald-600" />Service Warranty</li>}
          </ul>
        </div>

        <aside className="h-fit rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:col-span-2 lg:col-span-1">
          <p className="text-xs text-gray-500">Starting at</p>
          <p className="text-[32px] font-extrabold leading-tight text-[#0b1b3f]">{money(s.price)}</p>
          <Link href={WEBSITE_SERVICE_BOOK(s._id)} className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-emerald-700 py-3 text-[15px] font-semibold text-white shadow-sm transition hover:bg-emerald-800">Book Now</Link>
          {s.avgDurationMins > 0 && <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-gray-500"><FaRegClock size={11} />Avg. {s.avgDurationMins} mins</p>}
          <p className="mt-3 border-t pt-3 text-xs text-gray-500">Have a bigger requirement?<br /><Link href={WEBSITE_SERVICES} className="inline-flex items-center gap-1 font-semibold text-emerald-700 hover:underline">Request a Quote <FaArrowRight size={10} /></Link></p>
        </aside>
      </section>

      {/* tabs */}
      <section className="mt-5 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex gap-6 overflow-x-auto border-b" role="tablist">
          {TABS.map(([k, l]) => <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`-mb-px whitespace-nowrap border-b-2 pb-3 text-sm font-semibold transition ${tab === k ? 'border-emerald-700 text-emerald-800' : 'border-transparent text-gray-500 hover:text-slate-800'}`}>{l}{k === 'reviews' && reviews.length > 0 && ` (${reviews.length})`}</button>)}
        </div>

        <div className="pt-5 text-sm">
          {tab === 'included' && (included.length ? (
            <>
              <ul className="grid gap-3 sm:grid-cols-2">{list.map((w, i) => <li key={i} className="flex items-start gap-2.5 text-slate-700"><FaCheckCircle className="mt-0.5 shrink-0 text-emerald-600" size={14} />{w}</li>)}</ul>
              {included.length > 4 && <button onClick={() => setShowAll((v) => !v)} className="mt-4 text-[13px] font-semibold text-emerald-700 underline">{showAll ? 'Show Less' : 'View Full Details'}</button>}
            </>
          ) : <p className="text-gray-500">Details will be shared by the professional.</p>)}

          {tab === 'process' && (s.process?.length ? (
            <ol className="space-y-4">{s.process.map((p, i) => <li key={i} className="flex gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-xs font-bold text-white">{i + 1}</span><span><b className="block text-[#0b1b3f]">{p.title}</b><span className="text-gray-500">{p.description}</span></span></li>)}</ol>
          ) : <p className="text-gray-500">Book, professional arrives at your slot, work is done, then you pay.</p>)}

          {tab === 'reviews' && (reviews.length ? (
            <div className="space-y-4">{reviews.map((r, i) => <div key={i} className="border-b pb-3 last:border-0"><div className="flex flex-wrap items-center gap-2"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"><FaUserCheck size={12} /></span><b>{r.userName}</b><Rating value={r.rating} size={12} /><span className="text-xs text-gray-400">{fmtDate(r.createdAt)}</span></div>{r.comment && <p className="mt-1.5 text-gray-600">{r.comment}</p>}</div>)}</div>
          ) : <p className="text-gray-500">No reviews yet. Be the first after your service!</p>)}
        </div>
      </section>
    </div>
  )
}
export default ServiceDetails
