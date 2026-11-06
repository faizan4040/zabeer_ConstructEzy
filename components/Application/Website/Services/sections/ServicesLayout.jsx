import React from 'react'

/**
 *  ┌───────────────────────── banner ─────────────────────────┐
 *  ├──────────── contact (3 cards) ───────────────────────────┤
 *  │ left       │ center                     │ right           │
 *  │ categories │ popular + service cards    │ quote/why/help  │
 *  │ + filters  │                            │                 │
 *  ├───────────────────── footer (steps) ─────────────────────┤
 *  Mobile/tablet: ek column (left -> center -> right)
 */
const ServicesLayout = ({ banner, contacts, left, center, right, footer }) => (
  <div className="mx-auto w-full max-w-[1400px] px-3 pb-12 sm:px-5 lg:px-6">
    {banner}
    {contacts}
    <div className="mt-6 grid items-start gap-5 lg:grid-cols-[200px_minmax(0,1fr)_240px] xl:grid-cols-[210px_minmax(0,1fr)_280px]">
      <div className="min-w-0">{left}</div>
      <div className="min-w-0">{center}</div>
      <div className="min-w-0">{right}</div>
    </div>
    {footer}
  </div>
)
export default ServicesLayout
