'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  FaWhatsapp, FaPhoneAlt, FaFileDownload, FaChevronRight, FaChevronLeft, FaArrowRight, FaShieldAlt, FaRupeeSign,
  FaRegClock, FaCheckCircle, FaRegHeart, FaHeart, FaStar, FaStarHalfAlt, FaRegStar, FaHome, FaWrench, FaBolt,
  FaPaintRoller, FaHammer, FaSnowflake, FaBoxOpen, FaHardHat, FaTint, FaBug, FaBroom, FaTools, FaSearch,
  FaRegCalendarAlt, FaMapMarkerAlt, FaHeadset, FaUserCheck, FaClipboardCheck, FaBriefcase, FaFilter, FaTimes, FaTag, FaAward,
} from 'react-icons/fa'
import { showToast } from '@/lib/showToast'
import { WEBSITE_SERVICES, WEBSITE_SERVICE_DETAILS, WEBSITE_MATERIAL_LIST, WEBSITE_MY_SERVICE_BOOKINGS } from '@/routes/ServiceRoute'

/* ============================== CONFIG ============================== */
const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || ''
const PHONE = process.env.NEXT_PUBLIC_SUPPORT_PHONE || ''
const HERO_IMG = process.env.NEXT_PUBLIC_SERVICES_HERO_IMG || '/assets/images/book_services.png'
const PLACEHOLDER = '/assets/images/image_placeholder.webp'
const CITIES = ['Delhi NCR', 'Jaipur', 'Gurugram', 'Noida', 'Ghaziabad', 'Faridabad']
const SERVICE_TYPES = ['Repair & Maintenance', 'Installation', 'New Construction', 'Renovation']
const PRO_TYPES = ['Individual Professional', 'Company / Team']
const RATINGS = [4.5, 4, 3.5, 3]
const MAX_PRICE = 50000
const PAGE_SIZE = 12
const SHOW_EXTRA_FILTERS = true // Service Type / Availability / Professional Type (abhi sirf UI)
const EMPTY = { location: '', serviceTypes: [], minPrice: 0, maxPrice: MAX_PRICE, rating: '', today: false, week: false, date: '', proTypes: [] }

const STEPS = [
  { t: 'Choose Service', d: 'Select the service you need', Icon: FaSearch },
  { t: 'Select Date & Location', d: 'Pick a convenient date and time', Icon: FaRegCalendarAlt },
  { t: 'Confirm Booking', d: 'Get confirmation on your booking', Icon: FaClipboardCheck },
  { t: 'Professional Arrives', d: 'Our verified professional reaches your location', Icon: FaUserCheck },
]
const WHY = [
  { t: 'Verified Professionals', d: 'Background checked', Icon: FaShieldAlt },
  { t: 'Transparent Pricing', d: 'No hidden charges', Icon: FaTag },
  { t: 'On-time Service', d: 'Reliable & punctual', Icon: FaRegClock },
  { t: 'Quality Assurance', d: 'Service warranty', Icon: FaAward },
  { t: 'Wide Service Coverage', d: 'Across Delhi NCR & Jaipur', Icon: FaMapMarkerAlt },
  { t: 'Dedicated Support', d: "We're here to help", Icon: FaHeadset },
]

const catIcon = (name = '') => {
  const s = name.toLowerCase()
  if (s.includes('plumb')) return FaWrench
  if (s.includes('electric')) return FaBolt
  if (s.includes('paint')) return FaPaintRoller
  if (s.includes('carpent')) return FaHammer
  if (/\bac\b|air con|cooling/.test(s)) return FaSnowflake
  if (s.includes('renov')) return FaHome
  if (s.includes('install')) return FaBoxOpen
  if (s.includes('civil') || s.includes('contract') || s.includes('mason')) return FaHardHat
  if (s.includes('water')) return FaTint
  if (s.includes('pest')) return FaBug
  if (s.includes('clean')) return FaBroom
  return FaTools
}

const toggle = (arr, v) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v])
const money = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`
const initials = (n = '') => n.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('') || 'P'
const inputCls = 'w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-[13px] text-slate-700 outline-none transition placeholder:text-gray-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15'

/* ============================ LAYOUT CSS ============================
   Page grid + service card layout plain CSS me hai (Tailwind par depend nahi).
   Page:
     >=1180px : left | center | right
     768-1179 : left | center  (right neeche, 2 column)
     <768     : single column
   Service card (container query, jitni jagah milti hai uske hisaab se):
     <480px   : stacked  (labour -> details -> price/book)
     480-719  : labour left | details right, price/book neeche full width
     >=720    : labour LEFT | details CENTER | price + Book Now RIGHT          */
const CSS = `
.sv-wrap{max-width:1400px;margin:0 auto;padding:0 12px 48px}
.sv-3col{display:grid;grid-template-columns:minmax(0,1fr);gap:20px;align-items:start;margin-top:22px}
.sv-left,.sv-center,.sv-right{min-width:0}
.sv-center{container-type:inline-size;container-name:svc}
.sv-right{display:grid;grid-template-columns:minmax(0,1fr);gap:16px;align-items:start}
.sv-cats{display:flex;gap:8px;overflow-x:auto;padding-bottom:4px;scrollbar-width:none}
.sv-cats::-webkit-scrollbar{display:none}
.sv-cat{flex:0 0 auto}
.sv-filters{display:none}.sv-filters.open{display:block}
.sv-hero-img{display:none}
.sv-pop{display:flex;gap:10px;overflow-x:auto;padding:2px 2px 8px;scrollbar-width:none;scroll-snap-type:x proximity}
.sv-pop::-webkit-scrollbar{display:none}
.sv-pop>*{scroll-snap-align:start}
.sv-steps{display:grid;grid-template-columns:minmax(0,1fr);gap:12px}
.sv-contact{display:grid;grid-template-columns:minmax(0,1fr);gap:10px;margin-top:12px}
.sv-banner-text{max-width:100%}

@media(min-width:480px){.sv-wrap{padding:0 16px 48px}}
@media(min-width:640px){.sv-steps{grid-template-columns:repeat(2,minmax(0,1fr))}.sv-wrap{padding:0 20px 48px}}
@media(min-width:768px){
  .sv-3col{grid-template-columns:200px minmax(0,1fr)}
  .sv-right{grid-column:1/-1;grid-template-columns:repeat(2,minmax(0,1fr))}
  .sv-cats{flex-direction:column;gap:2px;overflow:visible}
  .sv-cat{flex:0 1 auto}
  .sv-filters{display:block}.sv-filter-toggle{display:none!important}
  .sv-hero-img{display:block}
  .sv-banner-text{max-width:62%}
  .sv-contact{grid-template-columns:repeat(3,minmax(0,1fr))}
}
@media(min-width:1180px){
  .sv-3col{grid-template-columns:210px minmax(0,1fr) 280px}
  .sv-right{grid-column:auto;grid-template-columns:minmax(0,1fr)}
  .sv-steps{grid-template-columns:repeat(4,minmax(0,1fr))}
  .sv-wrap{padding:0 24px 48px}
}

/* ---------- price range ---------- */
.sv-range{position:relative;height:20px;margin:12px 4px 0}
.sv-range input[type=range]{position:absolute;left:0;top:0;width:100%;height:20px;margin:0;background:transparent;pointer-events:none;-webkit-appearance:none;appearance:none}
.sv-range input[type=range]::-webkit-slider-thumb{pointer-events:auto;-webkit-appearance:none;height:16px;width:16px;border-radius:9999px;background:#047857;border:3px solid #fff;box-shadow:0 0 0 1px #047857,0 1px 3px rgba(0,0,0,.25);cursor:pointer}
.sv-range input[type=range]::-moz-range-thumb{pointer-events:auto;height:12px;width:12px;border-radius:9999px;background:#047857;border:3px solid #fff;box-shadow:0 0 0 1px #047857;cursor:pointer}

/* ---------- service card ---------- */
.sv-card{display:flex;flex-direction:column;overflow:hidden;border-radius:16px;border:1px solid #e5e7eb;background:#fff;box-shadow:0 1px 2px rgba(15,23,42,.05);transition:box-shadow .2s,border-color .2s,transform .2s}
.sv-card:hover{border-color:#a7f3d0;box-shadow:0 8px 24px -8px rgba(4,120,87,.22)}
.sv-labour{display:flex;align-items:center;gap:12px;padding:14px;background:linear-gradient(135deg,#ecfdf5,#f0f9ff);border-bottom:1px solid #e5f4ee}
.sv-labour-info{min-width:0}
.sv-detail{min-width:0;padding:14px}
.sv-buy{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 14px;border-top:1px dashed #e5e7eb;background:#fafafa}
.sv-buy-price{text-align:left}
.sv-buy-actions{display:flex;align-items:center;gap:8px}
.sv-book{flex:1}

@container svc (min-width:480px){
  .sv-card{display:grid;grid-template-columns:168px minmax(0,1fr)}
  .sv-labour{flex-direction:column;justify-content:center;text-align:center;border-bottom:0;border-right:1px solid #e5f4ee;padding:16px 12px}
  .sv-labour-info{display:flex;flex-direction:column;align-items:center}
  .sv-buy{grid-column:1/-1}
}
@container svc (min-width:720px){
  .sv-card{grid-template-columns:172px minmax(0,1fr) 168px}
  .sv-buy{grid-column:auto;flex-direction:column;justify-content:center;border-top:0;border-left:1px dashed #e5e7eb;padding:16px 14px;gap:14px}
  .sv-buy-price{text-align:center}
  .sv-buy-actions{width:100%}
}
.sv-skel{height:150px;border-radius:16px;background:linear-gradient(90deg,#f3f4f6,#e9ecef,#f3f4f6);background-size:200% 100%;animation:svShimmer 1.2s infinite}
@keyframes svShimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
`

/* ============================ SMALL PARTS ============================ */
const Img = ({ src, alt = '', className = '' }) => (
  <img src={src || PLACEHOLDER} alt={alt} loading="lazy" className={className} onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = PLACEHOLDER }} />
)

const Rating = ({ value = 0, size = 13 }) => (
  <span className="inline-flex items-center gap-0.5 text-amber-400" aria-label={`${value} out of 5`}>
    {[1, 2, 3, 4, 5].map((i) => value >= i ? <FaStar key={i} size={size} /> : value >= i - 0.5 ? <FaStarHalfAlt key={i} size={size} /> : <FaRegStar key={i} size={size} className="text-amber-300" />)}
  </span>
)

const Check = ({ checked, onChange, children }) => (
  <label className="flex cursor-pointer items-center gap-2.5 text-[13px] text-slate-600 hover:text-slate-900">
    <input type="checkbox" checked={checked} onChange={onChange} className="h-4 w-4 cursor-pointer rounded border-gray-300 accent-emerald-700" />{children}
  </label>
)

const FieldLabel = ({ children, optional }) => (
  <label className="mb-1 block text-[12px] font-semibold text-slate-700">{children} {optional && <span className="font-normal text-gray-400">(Optional)</span>}</label>
)
const H = ({ children }) => <p className="mb-2 text-[13px] font-semibold text-slate-800">{children}</p>

/* Labour avatar: photo ho to photo, warna naam ke initials */
const Avatar = ({ src, name }) => {
  const [bad, setBad] = useState(false)
  return src && !bad ? (
    <img src={src} alt={name || 'Professional'} onError={() => setBad(true)} className="h-14 w-14 shrink-0 rounded-full border-2 border-white object-cover shadow-md ring-2 ring-emerald-200 min-[480px]:h-18 min-[480px]:w-18" />
  ) : (
    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-white bg-linear-to-br from-emerald-500 to-emerald-700 text-lg font-bold text-white shadow-md ring-2 ring-emerald-200 min-[480px]:h-18 min-[480px]:w-18 min-[480px]:text-2xl">{initials(name)}</span>
  )
}

/* ============================ SERVICE CARD ============================ */
const ServiceCard = ({ s, liked, onLike }) => {
  const href = WEBSITE_SERVICE_DETAILS(s._id)
  const labour = s.labourName || 'Professional'
  const labourPic = s.labourPhoto || s.labourImage || s.labour?.photo
  const city = s.city || s.location
  return (
    <article className="sv-card">
      {/* ---------- LEFT: labour ---------- */}
      <div className="sv-labour">
        <Avatar src={labourPic} name={labour} />
        <div className="sv-labour-info">
          <p className="truncate text-[14px] font-bold text-[#0b1b3f]" title={labour}>{labour}</p>
          {s.isVerified ? (
            <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2 py-0.5 text-[10.5px] font-semibold text-white"><FaCheckCircle size={9} />Verified Pro</span>
          ) : (
            <span className="mt-1 text-[11px] text-gray-500">Service Professional</span>
          )}
          {s.experienceYears > 0 && (
            <span className="mt-1.5 inline-flex items-center gap-1 text-[11.5px] font-medium text-slate-600"><FaBriefcase size={10} className="text-slate-400" />{s.experienceYears}+ yrs exp.</span>
          )}
        </div>
      </div>

      {/* ---------- CENTER: details ---------- */}
      <div className="sv-detail">
        <div className="flex items-start gap-3">
          <Link href={href} className="hidden h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100 min-[360px]:block" aria-label={s.title}>
            <Img src={s.photo} alt={s.title} className="h-full w-full object-cover transition duration-300 hover:scale-110" />
          </Link>
          <div className="min-w-0 flex-1">
            <Link href={href} className="line-clamp-2 text-[15.5px] font-bold leading-snug text-[#0b1b3f] hover:text-emerald-700">{s.title}</Link>
            <div className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[12.5px]">
              <Rating value={s.rating || 0} size={12} />
              <b className="text-slate-700">{s.rating ? s.rating.toFixed(1) : 'New'}</b>
              {s.reviewCount > 0 && <span className="text-gray-500">({s.reviewCount})</span>}
            </div>
          </div>
        </div>

        <p className="mt-2.5 line-clamp-2 text-[12.5px] leading-relaxed text-gray-500">{s.shortDescription || `Professional service by ${labour}.`}</p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {city && <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-medium text-sky-700"><FaMapMarkerAlt size={9} />{city}</span>}
          {(s.badges || []).slice(0, 3).map((b) => (
            <span key={b} className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-slate-600"><FaRegClock size={9} className="text-slate-400" />{b}</span>
          ))}
        </div>
      </div>

      {/* ---------- RIGHT: price + book now ---------- */}
      <div className="sv-buy">
        <div className="sv-buy-price">
          <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500">Starting at</p>
          <p className="text-[22px] font-extrabold leading-tight text-emerald-700">{money(s.price)}</p>
        </div>
        <div className="sv-buy-actions">
          <button type="button" aria-label="Add to wishlist" aria-pressed={liked} onClick={onLike} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white transition hover:border-red-200 hover:bg-red-50">
            {liked ? <FaHeart size={14} className="text-red-500" /> : <FaRegHeart size={14} className="text-slate-500" />}
          </button>
          <Link href={href} className="sv-book flex h-10 items-center justify-center gap-1.5 rounded-lg bg-emerald-700 px-4 text-[13px] font-semibold text-white shadow-sm transition hover:bg-emerald-800 active:scale-[.98]">Book Now<FaArrowRight size={10} /></Link>
        </div>
      </div>
    </article>
  )
}

const CardSkeleton = () => <div className="sv-skel" />

/* ============================== PAGE ============================== */
const ServicesPage = () => {
  const router = useRouter()
  const sp = useSearchParams()
  const active = sp.get('category') || 'all'
  const q = sp.get('q') || ''

  const [tree, setTree] = useState([])
  const [catState, setCatState] = useState('loading')
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [sort, setSort] = useState('popularity')
  const [draft, setDraft] = useState(EMPTY)
  const [filters, setFilters] = useState(EMPTY)
  const [showFilters, setShowFilters] = useState(false)
  const [favs, setFavs] = useState({})
  const [quote, setQuote] = useState({ name: '', phone: '', serviceType: '', city: 'Delhi NCR', preferredDate: '', details: '' })
  const [sending, setSending] = useState(false)

  useEffect(() => {
    axios.get('/api/service-category')
      .then((r) => { if (r.data?.success === false) throw new Error(r.data.message); setTree(r.data?.data || []); setCatState('ok') })
      .catch(() => setCatState('error'))
  }, [])

  const apiParams = useMemo(() => {
    const p = {}
    if (filters.location) p.city = filters.location
    if (filters.minPrice > 0) p.minPrice = filters.minPrice
    if (filters.maxPrice < MAX_PRICE) p.maxPrice = filters.maxPrice
    if (filters.rating) p.rating = filters.rating
    return p
  }, [filters])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await axios.get('/api/service-listing', { params: { category: active, sort, page, limit: PAGE_SIZE, q: q || undefined, ...apiParams } })
      setItems(data.data?.items || []); setTotal(data.data?.total || 0)
    } catch { setItems([]); setTotal(0) } finally { setLoading(false) }
  }, [active, sort, page, q, apiParams])
  useEffect(() => { load() }, [load])
  useEffect(() => { setPage(1) }, [active, sort, filters, q])

  const go = (slug) => router.push(slug === 'all' ? WEBSITE_SERVICES : `${WEBSITE_SERVICES}?category=${slug}`, { scroll: false })
  const activeTop = useMemo(() => tree.find((c) => c.slug === active || c.children?.some((s) => s.slug === active)), [tree, active])
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const today = new Date().toISOString().slice(0, 10)
  const pMin = (draft.minPrice / MAX_PRICE) * 100
  const pMax = (draft.maxPrice / MAX_PRICE) * 100
  const heading = active === 'all' ? 'Recommended Services'
    : `${activeTop?.name || 'Services'}${activeTop && activeTop.slug !== active ? ' › ' + (activeTop.children.find((s) => s.slug === active)?.name || '') : ''}`
  const activeFilterCount = [filters.location, filters.rating, filters.minPrice > 0, filters.maxPrice < MAX_PRICE].filter(Boolean).length

  const setQ = (k) => (e) => setQuote({ ...quote, [k]: e.target.value })
  const sendQuote = async (e) => {
    e.preventDefault(); setSending(true)
    try {
      const { data } = await axios.post('/api/service-quote', quote)
      if (!data.success) throw new Error(data.message)
      showToast('success', data.message); setQuote({ ...quote, details: '', preferredDate: '' })
    } catch (err) { showToast('error', err.message) } finally { setSending(false) }
  }

  return (
    <div className="sv-wrap">
      <style>{CSS}</style>

      {/* ============================ 1. BANNER ============================ */}
      <section className="relative mt-3 overflow-hidden rounded-2xl border border-sky-100 bg-linear-to-r from-white via-sky-50 to-sky-100 shadow-sm" style={{ minHeight: 200 }}>
        <nav className="relative z-10 flex items-center gap-2 px-4 pt-4 text-[12.5px] text-gray-500 sm:px-8 sm:text-[13px]" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-emerald-700">Home</Link><FaChevronRight size={9} /><span className="font-medium text-slate-700">Services</span>
        </nav>
        <div className="sv-banner-text relative z-10 px-4 pb-6 pt-3 sm:px-8">
          <h1 className="text-[26px] font-extrabold leading-[1.1] text-[#0b1b3f] sm:text-[38px] lg:text-[44px]">Home &amp; Construction<br /><span className="text-emerald-600">Services</span></h1>
          <p className="mt-2.5 max-w-md text-[14px] leading-relaxed text-slate-600 sm:text-base">Verified professionals for all your construction and renovation needs.</p>
          <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2.5">
            {[[FaShieldAlt, 'Verified Professionals'], [FaRupeeSign, 'Transparent Pricing'], [FaRegClock, 'On-time Service']].map(([I, t]) => (
              <li key={t} className="flex items-center gap-2 text-[12.5px] font-semibold text-[#0b1b3f] sm:text-[13px]"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white shadow-sm"><I size={13} /></span>{t}</li>
            ))}
          </ul>
        </div>
        <img src={HERO_IMG} alt="" aria-hidden="true" className="sv-hero-img pointer-events-none absolute bottom-0 right-0 z-0 h-full w-auto object-contain" style={{ maxHeight: 290, maxWidth: '42%' }} onError={(e) => { e.currentTarget.style.display = 'none' }} />
      </section>

      {/* ======================= 2. THREE ACTION CARDS ======================= */}
      <div className="sv-contact">
        {[
          { href: WHATSAPP ? `https://wa.me/${WHATSAPP}` : '#', ext: true, Icon: FaWhatsapp, size: 24, wrap: 'border-emerald-100 from-emerald-50', ic: 'rounded-full bg-[#25D366]', t: 'Book via WhatsApp', d: 'Chat with our team' },
          { href: PHONE ? `tel:${PHONE}` : '#', Icon: FaPhoneAlt, size: 18, wrap: 'border-sky-100 from-sky-50', ic: 'rounded-full bg-sky-500', t: 'Book via Call', d: 'Talk to our experts' },
          { href: WEBSITE_MATERIAL_LIST, Icon: FaFileDownload, size: 20, wrap: 'border-orange-100 from-orange-50', ic: 'rounded-lg bg-orange-400', t: 'Upload Material List', d: 'Get best prices & quick quotes' },
        ].map(({ href, ext, Icon, size, wrap, ic, t, d }) => (
          <Link key={t} href={href} {...(ext ? { target: '_blank', rel: 'noreferrer' } : {})} className={`group flex items-center gap-3 rounded-xl border bg-gradient-to-r to-white px-4 py-3 transition hover:-translate-y-0.5 hover:shadow-md ${wrap}`}>
            <span className={`flex h-11 w-11 shrink-0 items-center justify-center text-white shadow ${ic}`}><Icon size={size} /></span>
            <span className="min-w-0"><b className="block truncate text-[14.5px] text-[#0b1b3f]">{t}</b><span className="block truncate text-xs text-gray-500">{d}</span></span>
            <FaChevronRight size={12} className="ml-auto shrink-0 text-gray-400 transition group-hover:translate-x-1" />
          </Link>
        ))}
      </div>

      {/* ============ 3. LEFT SIDEBAR | CENTER CONTENT | RIGHT SIDEBAR ============ */}
      <div className="sv-3col">

        {/* ------------------------- LEFT SIDEBAR ------------------------- */}
        <aside className="sv-left">
          <h2 className="mb-2.5 text-[16px] font-bold text-[#0b1b3f]">Service Categories</h2>
          <nav className="sv-cats" aria-label="Service categories">
            {[{ _id: 'all', slug: 'all', name: 'All Services', icon: FaHome }, ...tree].map((c) => {
              const on = c.slug === 'all' ? active === 'all' : activeTop?._id === c._id
              const I = c.icon || catIcon(c.name)
              return (
                <div key={c._id} className="sv-cat">
                  <button onClick={() => go(c.slug)} aria-current={on ? 'true' : undefined} className={`flex w-full items-center gap-3 whitespace-nowrap rounded-lg border px-3 py-2.5 text-left text-[13.5px] transition md:border-transparent ${on ? 'border-emerald-200 bg-emerald-100 font-semibold text-emerald-800' : 'border-gray-200 bg-white font-medium text-slate-700 hover:bg-gray-100 md:bg-transparent'}`}>
                    <I size={16} className={on ? 'text-emerald-600' : 'text-slate-500'} />{c.name}
                  </button>
                  {on && c.children?.length > 0 && (
                    <div className="ml-6 mt-0.5 hidden border-l border-emerald-200 pl-2 md:block">
                      {c.children.map((s) => <button key={s._id} onClick={() => go(s.slug)} className={`block w-full rounded px-2 py-1.5 text-left text-xs ${active === s.slug ? 'font-semibold text-emerald-700' : 'text-slate-600 hover:text-emerald-700'}`}>{s.name}</button>)}
                    </div>
                  )}
                </div>
              )
            })}
          </nav>
          {catState === 'error' && <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">Categories load nahi hui. /api/service-category check karo.</p>}
          {catState === 'ok' && !tree.length && <p className="mt-2 px-1 text-xs text-gray-500">Admin ne abhi koi category add nahi ki.</p>}

          <button onClick={() => setShowFilters((s) => !s)} aria-expanded={showFilters} className="sv-filter-toggle mt-3 flex w-full items-center justify-center gap-2 rounded-lg border bg-white py-2.5 text-sm font-semibold text-slate-700">
            {showFilters ? <FaTimes size={13} /> : <FaFilter size={13} />}{showFilters ? 'Hide Filters' : 'Show Filters'}
            {activeFilterCount > 0 && <span className="rounded-full bg-emerald-700 px-1.5 text-[11px] text-white">{activeFilterCount}</span>}
          </button>

          <div className={`sv-filters ${showFilters ? 'open' : ''} mt-4 space-y-5 rounded-xl border border-gray-200 bg-white p-4 md:mt-5 md:rounded-none md:border-0 md:border-t md:bg-transparent md:px-0 md:pb-0 md:pt-5`}>
            <h2 className="text-[16px] font-bold text-[#0b1b3f]">Filters</h2>

            <div><H>Location</H>
              <select className={inputCls} value={draft.location} onChange={(e) => setDraft({ ...draft, location: e.target.value })}>
                <option value="">All Locations</option>{CITIES.map((c) => <option key={c}>{c}</option>)}
              </select></div>

            {SHOW_EXTRA_FILTERS && <div><H>Service Type</H><div className="space-y-2">{SERVICE_TYPES.map((t) => <Check key={t} checked={draft.serviceTypes.includes(t)} onChange={() => setDraft({ ...draft, serviceTypes: toggle(draft.serviceTypes, t) })}>{t}</Check>)}</div></div>}

            <div><H>Price Range</H>
              <div className="sv-range">
                <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-gray-200" />
                <div className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-emerald-700" style={{ left: `${pMin}%`, right: `${100 - pMax}%` }} />
                <input type="range" aria-label="Minimum price" min="0" max={MAX_PRICE} step="500" value={draft.minPrice} onChange={(e) => setDraft({ ...draft, minPrice: Math.min(Number(e.target.value), draft.maxPrice - 500) })} />
                <input type="range" aria-label="Maximum price" min="0" max={MAX_PRICE} step="500" value={draft.maxPrice} onChange={(e) => setDraft({ ...draft, maxPrice: Math.max(Number(e.target.value), draft.minPrice + 500) })} />
              </div>
              <p className="mt-2 text-xs text-gray-500">₹{draft.minPrice.toLocaleString('en-IN')} - ₹{draft.maxPrice.toLocaleString('en-IN')}{draft.maxPrice >= MAX_PRICE ? '+' : ''}</p></div>

            <div><H>Rating</H><div className="space-y-2">
              {RATINGS.map((r) => <Check key={r} checked={String(draft.rating) === String(r)} onChange={() => setDraft({ ...draft, rating: String(draft.rating) === String(r) ? '' : r })}><Rating value={r} size={11} /><span className="text-[12.5px]">{r.toFixed(1)} &amp; above</span></Check>)}
            </div></div>

            {SHOW_EXTRA_FILTERS && (
              <>
                <div><H>Availability</H><div className="space-y-2">
                  <Check checked={draft.today} onChange={() => setDraft({ ...draft, today: !draft.today, week: false })}>Today</Check>
                  <Check checked={draft.week} onChange={() => setDraft({ ...draft, week: !draft.week, today: false })}>This Week</Check>
                  <input type="date" aria-label="Choose date" min={today} value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} className={inputCls} />
                </div></div>
                <div><H>Professional Type</H><div className="space-y-2">{PRO_TYPES.map((t) => <Check key={t} checked={draft.proTypes.includes(t)} onChange={() => setDraft({ ...draft, proTypes: toggle(draft.proTypes, t) })}>{t}</Check>)}</div></div>
              </>
            )}

            <div className="space-y-2 pt-1">
              <button onClick={() => { setFilters(draft); setShowFilters(false) }} className="w-full rounded-lg bg-emerald-700 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800">Apply Filters</button>
              <button onClick={() => { setDraft(EMPTY); setFilters(EMPTY) }} className="w-full py-1 text-center text-xs font-medium text-gray-500 hover:text-emerald-700">Reset filters</button>
            </div>
          </div>
        </aside>

        {/* ------------------------- CENTER CONTENT ------------------------- */}
        <main className="sv-center space-y-6">
          {/* ---- Popular categories: chhote compact cards ---- */}
          {tree.length > 0 && (
            <section>
              <div className="mb-2.5 flex items-center justify-between">
                <h2 className="text-[16px] font-bold text-[#0b1b3f] sm:text-[17px]">Popular Service Categories</h2>
                <button onClick={() => go('all')} className="flex items-center gap-1.5 text-[12.5px] font-semibold text-emerald-700 hover:underline">View All <FaArrowRight size={10} /></button>
              </div>
              <div className="sv-pop">
                {tree.map((c) => {
                  const on = activeTop?._id === c._id
                  return (
                    <button key={c._id} onClick={() => go(c.slug)} className={`group flex w-[100px] shrink-0 flex-col items-center gap-2 rounded-xl border bg-white px-2 pb-2.5 pt-3 text-center shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md sm:w-[116px] ${on ? 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-600/30' : 'border-gray-200'}`}>
                      <Img src={c.image} alt={c.name} className="h-[60px] w-[60px] rounded-full border border-gray-100 object-cover sm:h-[72px] sm:w-[72px]" />
                      <span className="line-clamp-2 min-h-[32px] text-[12px] font-semibold leading-[1.3] text-slate-700 group-hover:text-emerald-700 sm:text-[12.5px]">{c.name}</span>
                    </button>
                  )
                })}
              </div>
            </section>
          )}

          {/* ---- Service list ---- */}
          <section>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-[17px] font-bold text-[#0b1b3f] sm:text-lg">{heading}</h2>
                {!loading && total > 0 && <p className="text-xs text-gray-500">{total} service{total > 1 ? 's' : ''} available</p>}
              </div>
              <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort services" className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-[13px] text-slate-600 outline-none focus:border-emerald-600">
                <option value="popularity">Sort by: Popularity</option><option value="rating">Sort by: Rating</option>
                <option value="price_asc">Price: Low to High</option><option value="price_desc">Price: High to Low</option>
              </select>
            </div>

            {loading && <div className="space-y-3">{[1, 2, 3].map((i) => <CardSkeleton key={i} />)}</div>}
            {!loading && !items.length && <div className="rounded-xl border border-dashed border-gray-300 bg-white px-4 py-14 text-center text-gray-500">No services found{q && ` for "${q}"`}. Try another category or filter.</div>}

            {!loading && items.length > 0 && (
              <div className="space-y-3.5">
                {items.map((s) => <ServiceCard key={s._id} s={s} liked={!!favs[s._id]} onLike={() => setFavs((f) => ({ ...f, [s._id]: !f[s._id] }))} />)}
              </div>
            )}

            {pages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-3 text-sm">
                <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="flex items-center gap-2 rounded-lg border bg-white px-4 py-2 font-medium text-slate-700 hover:bg-gray-50 disabled:opacity-40"><FaChevronLeft size={10} />Prev</button>
                <span className="text-slate-600">{page} / {pages}</span>
                <button disabled={page === pages} onClick={() => setPage((p) => p + 1)} className="flex items-center gap-2 rounded-lg border bg-white px-4 py-2 font-medium text-slate-700 hover:bg-gray-50 disabled:opacity-40">Next<FaChevronRight size={10} /></button>
              </div>
            )}
          </section>
        </main>

        {/* ------------------------- RIGHT SIDEBAR ------------------------- */}
        <aside className="sv-right">
          <form onSubmit={sendQuote} className="space-y-3 rounded-xl border border-emerald-100 bg-gradient-to-b from-emerald-50 to-emerald-50/40 p-4 shadow-sm">
            <div><h2 className="text-[18px] font-bold text-emerald-700">Get a Service Quote</h2><p className="mt-1 text-[11.5px] leading-snug text-slate-600">Tell us what you need and we'll connect you with the right professionals.</p></div>
            <input className={inputCls} placeholder="Your name" value={quote.name} onChange={setQ('name')} />
            <input className={inputCls} placeholder="Phone (10 digit)" inputMode="numeric" required value={quote.phone} onChange={(e) => setQuote({ ...quote, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })} />
            <div><FieldLabel>Service Type</FieldLabel><select className={inputCls} required value={quote.serviceType} onChange={setQ('serviceType')}><option value="">Select Service</option>{tree.map((c) => <option key={c._id} value={c.name}>{c.name}</option>)}</select></div>
            <div><FieldLabel>Your Location</FieldLabel><select className={inputCls} value={quote.city} onChange={setQ('city')}>{CITIES.map((c) => <option key={c}>{c}</option>)}</select></div>
            <div><FieldLabel>Preferred Date</FieldLabel><input className={inputCls} type="date" min={today} value={quote.preferredDate} onChange={setQ('preferredDate')} /></div>
            <div><FieldLabel optional>Additional Details</FieldLabel><textarea className={inputCls} rows={3} placeholder="e.g. 2BHK painting, kitchen renovation, etc." value={quote.details} onChange={setQ('details')} /></div>
            <button type="submit" disabled={sending} className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-700 py-3 text-[13px] font-semibold text-white shadow-sm transition hover:bg-emerald-800 disabled:opacity-60">{sending ? 'Sending...' : <>Request a Quote <FaArrowRight size={12} /></>}</button>
          </form>

          <div className="space-y-4">
            <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <h2 className="mb-3.5 text-[16px] font-bold leading-snug text-[#0b1b3f]">Why Choose ConstructEzy Services?</h2>
              <ul className="space-y-3.5">
                {WHY.map(({ t, d, Icon }) => (
                  <li key={t} className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"><Icon size={15} /></span>
                    <span className="min-w-0"><b className="block text-[13px] leading-tight text-[#0b1b3f]">{t}</b><span className="text-[11.5px] text-gray-500">{d}</span></span>
                  </li>
                ))}
              </ul>
            </section>
            <section className="rounded-xl border border-sky-100 bg-sky-50 p-4">
              <div className="mb-3 flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#0b1b3f] shadow-sm"><FaHeadset size={20} /></span>
                <div><p className="text-[15px] font-bold text-[#0b1b3f]">Need Help?</p><p className="text-[11.5px] text-gray-500">Talk to our experts</p></div>
              </div>
              <a href={WHATSAPP ? `https://wa.me/${WHATSAPP}` : '#'} target="_blank" rel="noreferrer" className="mb-2 flex items-center justify-center gap-2 rounded-lg bg-emerald-700 py-2.5 text-[13px] font-semibold text-white hover:bg-emerald-800"><FaWhatsapp size={16} />Chat on WhatsApp</a>
              <a href={PHONE ? `tel:${PHONE}` : '#'} className="flex items-center justify-center gap-2 rounded-lg border border-sky-400 bg-white py-2.5 text-[13px] font-semibold text-sky-600 hover:bg-sky-50"><FaPhoneAlt size={13} />Call Now</a>
              <p className="mt-2.5 text-center text-[11.5px] text-gray-500">Available 9 AM - 9 PM</p>
              <Link href={WEBSITE_MY_SERVICE_BOOKINGS} className="mt-2 block text-center text-xs font-semibold text-emerald-700 underline">My Bookings</Link>
            </section>
          </div>
        </aside>
      </div>

      {/* ======================= 4. HOW IT WORKS ======================= */}
      <section className="mt-10 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 sm:p-6">
        <h2 className="mb-4 text-lg font-bold text-[#0b1b3f] sm:text-xl">How Service Booking Works</h2>
        <ol className="sv-steps">
          {STEPS.map(({ t, d, Icon }, i) => (
            <li key={t} className="relative flex items-start gap-3 rounded-xl bg-white p-4 shadow-sm">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-xs font-bold text-white">{i + 1}</span>
              <span className="min-w-0 flex-1"><b className="block text-[13px] text-[#0b1b3f]">{t}</b><span className="text-[11.5px] leading-snug text-gray-500">{d}</span></span>
              <Icon size={22} className="shrink-0 text-emerald-700/70" />
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}

export default ServicesPage