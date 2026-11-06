'use client'
import React from 'react'
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa'

export const Rating = ({ value = 0, size = 13 }) => (
  <span className="inline-flex items-center gap-0.5 text-amber-400" aria-label={`${value} out of 5`}>
    {[1, 2, 3, 4, 5].map((i) => value >= i ? <FaStar key={i} size={size} /> : value >= i - 0.5 ? <FaStarHalfAlt key={i} size={size} /> : <FaRegStar key={i} size={size} className="text-amber-300" />)}
  </span>
)

export const Check = ({ checked, onChange, children }) => (
  <label className="flex cursor-pointer items-center gap-2.5 text-[13px] text-slate-600 hover:text-slate-900">
    <input type="checkbox" checked={checked} onChange={onChange} className="h-4 w-4 cursor-pointer rounded border-gray-300 accent-emerald-700" />
    {children}
  </label>
)

export const FieldLabel = ({ children, optional }) => (
  <label className="mb-1 block text-[12px] font-semibold text-slate-700">{children} {optional && <span className="font-normal text-gray-400">(Optional)</span>}</label>
)
