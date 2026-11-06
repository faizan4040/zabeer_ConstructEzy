'use client'
import React from 'react'

export const FALLBACK = '/assets/images/image_placeholder.webp'
export const money = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`
export const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' })

export const Img = ({ src, alt = '', className = '' }) => (
  <img src={src || FALLBACK} alt={alt} className={className} onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK }} />
)

export const Stars = ({ rating = 0, size = 14 }) => (
  <span className="inline-flex" aria-label={`${rating} out of 5`}>
    {[1, 2, 3, 4, 5].map((i) => (
      <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill={i <= Math.round(rating) ? '#f5a623' : '#d1d5db'}>
        <path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z" />
      </svg>
    ))}
  </span>
)

export const Btn = ({ children, className = '', variant = 'solid', ...p }) => (
  <button
    {...p}
    className={`inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
      variant === 'solid' ? 'bg-emerald-700 text-white hover:bg-emerald-800' : 'border border-emerald-700 bg-white text-emerald-700 hover:bg-emerald-50'
    } ${className}`}
  >{children}</button>
)

const STEPS = ['Service', 'Address', 'Review', 'Payment']
export const StepBar = ({ current }) => (
  <div className="mb-6 flex items-center justify-between gap-1 sm:gap-2">
    {STEPS.map((s, i) => {
      const n = i + 1, done = n < current, active = n === current
      return (
        <React.Fragment key={s}>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold sm:h-7 sm:w-7 ${done || active ? 'bg-emerald-700 text-white' : 'border border-gray-300 bg-white text-gray-500'}`}>
              {done ? '✓' : n}
            </span>
            <span className={`text-xs sm:text-sm ${active ? 'font-semibold text-emerald-800' : 'text-gray-500'}`}>{s}</span>
          </div>
          {i < STEPS.length - 1 && <span className={`h-px flex-1 ${done ? 'bg-emerald-700' : 'bg-gray-300'}`} />}
        </React.Fragment>
      )
    })}
  </div>
)

export const Tick = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" className="shrink-0"><circle cx="12" cy="12" r="11" fill="#10a56d" /><path d="m7.2 12.4 3.3 3.3 6.3-6.6" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
)
