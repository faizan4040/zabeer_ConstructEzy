'use client'
import React, { useState } from 'react'
import { FaFilter, FaTimes } from 'react-icons/fa'
import { Rating, Check } from './parts'
import { catIcon, CITIES, SERVICE_TYPES, PRO_TYPES, RATINGS, MAX_PRICE, SHOW_EXTRA_FILTERS, toggle, inputCls } from '@/lib/servicesConfig'

const H = ({ children }) => <p className="mb-2 text-[13px] font-semibold text-slate-800">{children}</p>

const CategorySidebar = ({ categories, active, activeTop, onSelect, draft, setDraft, onApply, onReset }) => {
  const [open, setOpen] = useState(false)
  const today = new Date().toISOString().slice(0, 10)
  const pMin = (draft.minPrice / MAX_PRICE) * 100, pMax = (draft.maxPrice / MAX_PRICE) * 100

  return (
    <aside>
      <style>{`
        .dual-range input[type=range]{position:absolute;left:0;top:0;width:100%;height:20px;margin:0;background:transparent;pointer-events:none;-webkit-appearance:none;appearance:none}
        .dual-range input[type=range]::-webkit-slider-thumb{pointer-events:auto;-webkit-appearance:none;height:16px;width:16px;border-radius:9999px;background:#047857;border:3px solid #fff;box-shadow:0 0 0 1px #047857,0 1px 3px rgba(0,0,0,.25);cursor:pointer}
        .dual-range input[type=range]::-moz-range-thumb{pointer-events:auto;height:12px;width:12px;border-radius:9999px;background:#047857;border:3px solid #fff;box-shadow:0 0 0 1px #047857;cursor:pointer}
        .no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{scrollbar-width:none}
      `}</style>

      <h2 className="mb-2.5 text-[17px] font-bold text-[#0b1b3f]">Service Categories</h2>
      <nav className="no-scrollbar flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:gap-0.5 lg:overflow-visible" aria-label="Service categories">
        {[{ _id: 'all', slug: 'all', name: 'All Services' }, ...categories].map((c) => {
          const on = c.slug === 'all' ? active === 'all' : activeTop?._id === c._id
          const I = catIcon(c.name)
          return (
            <div key={c._id} className="shrink-0 lg:shrink">
              <button onClick={() => onSelect(c.slug)} aria-current={on ? 'true' : undefined} className={`flex w-full items-center gap-3 whitespace-nowrap rounded-lg px-3 py-2.5 text-left text-[13.5px] transition ${on ? 'bg-emerald-100 font-semibold text-emerald-800' : 'bg-white font-medium text-slate-700 ring-1 ring-gray-200 hover:bg-gray-100 lg:bg-transparent lg:ring-0'}`}>
                <I size={17} className={on ? 'text-emerald-600' : 'text-slate-500'} />{c.name}
              </button>
              {on && c.children?.length > 0 && (
                <div className="ml-6 mt-0.5 hidden border-l border-emerald-200 pl-2 lg:block">
                  {c.children.map((s) => <button key={s._id} onClick={() => onSelect(s.slug)} className={`block w-full rounded px-2 py-1.5 text-left text-xs ${active === s.slug ? 'font-semibold text-emerald-700' : 'text-slate-600 hover:text-emerald-700'}`}>{s.name}</button>)}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      <button onClick={() => setOpen((s) => !s)} aria-expanded={open} className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border bg-white py-2.5 text-sm font-semibold text-slate-700 lg:hidden">
        {open ? <FaTimes size={13} /> : <FaFilter size={13} />}{open ? 'Hide Filters' : 'Show Filters'}
      </button>

      <div className={`${open ? 'block' : 'hidden'} mt-5 space-y-5 border-t border-gray-200 pt-5 lg:block`}>
        <h2 className="text-[17px] font-bold text-[#0b1b3f]">Filters</h2>

        <div><H>Location</H>
          <select className={inputCls} value={draft.location} onChange={(e) => setDraft({ ...draft, location: e.target.value })}>
            <option value="">All Locations</option>{CITIES.map((c) => <option key={c}>{c}</option>)}
          </select></div>

        {SHOW_EXTRA_FILTERS && <div><H>Service Type</H><div className="space-y-2">{SERVICE_TYPES.map((t) => <Check key={t} checked={draft.serviceTypes.includes(t)} onChange={() => setDraft({ ...draft, serviceTypes: toggle(draft.serviceTypes, t) })}>{t}</Check>)}</div></div>}

        <div><H>Price Range</H>
          <div className="dual-range relative mx-1 mt-3 h-5">
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
          <button onClick={() => { onApply(); setOpen(false) }} className="w-full rounded-lg bg-emerald-700 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800">Apply Filters</button>
          <button onClick={onReset} className="w-full py-1 text-center text-xs font-medium text-gray-500 hover:text-emerald-700">Reset filters</button>
        </div>
      </div>
    </aside>
  )
}
export default CategorySidebar
