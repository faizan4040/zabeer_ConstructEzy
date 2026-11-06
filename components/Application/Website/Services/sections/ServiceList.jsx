'use client'
import React from 'react'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import ServiceCard from './ServiceCard'

const ServiceList = ({ heading, items, loading, query, sort, setSort, favs, onLike, page, pages, setPage }) => (
  <section>
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
      <h2 className="text-lg font-bold text-[#0b1b3f]">{heading}</h2>
      <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort services" className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-[13px] text-slate-600 outline-none focus:border-emerald-600">
        <option value="popularity">Sort by: Popularity</option><option value="rating">Sort by: Rating</option>
        <option value="price_asc">Price: Low to High</option><option value="price_desc">Price: High to Low</option>
      </select>
    </div>

    {loading && <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-[140px] animate-pulse rounded-xl bg-gray-100" />)}</div>}

    {!loading && !items.length && <div className="rounded-xl border border-dashed border-gray-300 bg-white py-14 text-center text-gray-500">No services found{query && ` for "${query}"`}. Try another category or filter.</div>}

    {!loading && items.length > 0 && <div className="space-y-3">{items.map((s) => <ServiceCard key={s._id} s={s} liked={favs[s._id]} onLike={() => onLike(s._id)} />)}</div>}

    {pages > 1 && (
      <div className="mt-6 flex items-center justify-center gap-3 text-sm">
        <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="flex items-center gap-2 rounded-lg border bg-white px-4 py-2 font-medium text-slate-700 hover:bg-gray-50 disabled:opacity-40"><FaChevronLeft size={10} />Prev</button>
        <span className="text-slate-600">{page} / {pages}</span>
        <button disabled={page === pages} onClick={() => setPage((p) => p + 1)} className="flex items-center gap-2 rounded-lg border bg-white px-4 py-2 font-medium text-slate-700 hover:bg-gray-50 disabled:opacity-40">Next<FaChevronRight size={10} /></button>
      </div>
    )}
  </section>
)
export default ServiceList
