'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FaBoxOpen, FaTools, FaSearch, FaHeadset } from 'react-icons/fa'
import { USER_ORDERS, WEBSITE_ORDER_DETAILS, WEBSITE_CONTACT_US } from '@/routes/WebsiteRoute'
import { WEBSITE_MY_SERVICE_BOOKINGS } from '@/routes/ServiceRoute'

const TrackOrder = () => {
  const router = useRouter()
  const [orderId, setOrderId] = useState('')
  const [error, setError] = useState('')

  const track = (e) => {
    e.preventDefault()
    const id = orderId.trim()
    if (!id) return setError('Please enter your order ID.')
    router.push(WEBSITE_ORDER_DETAILS(encodeURIComponent(id)))
  }

  const cards = [
    { href: USER_ORDERS, Icon: FaBoxOpen, t: 'My Product Orders', d: 'See all your material orders and their delivery status' },
    { href: WEBSITE_MY_SERVICE_BOOKINGS, Icon: FaTools, t: 'My Service Bookings', d: 'Check status of your booked services' },
    { href: WEBSITE_CONTACT_US, Icon: FaHeadset, t: 'Need help?', d: 'Contact our support team' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <section className="bg-linear-to-br from-emerald-700 to-emerald-900 px-4 py-10 text-white sm:py-14">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-3xl font-extrabold sm:text-4xl">Track Order / Booking</h1>
          <p className="mt-2 text-sm text-emerald-50 sm:text-base">Enter your order ID or open your orders and bookings.</p>
        </div>
      </section>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
        <form onSubmit={track} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
          <label htmlFor="order-id" className="text-sm font-semibold text-gray-800">Order ID</label>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <input
              id="order-id"
              value={orderId}
              onChange={(e) => { setOrderId(e.target.value); setError('') }}
              placeholder="e.g. ORD-123456"
              className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            />
            <button type="submit" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-emerald-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800">
              <FaSearch size={13} /> Track
            </button>
          </div>
          {error && <p className="mt-2 text-sm font-medium text-rose-600">{error}</p>}
          <p className="mt-3 text-xs text-gray-500">You can find your order ID in the confirmation message / email.</p>
        </form>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {cards.map(({ href, Icon, t, d }) => (
            <Link key={t} href={href} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"><Icon size={18} /></span>
              <p className="mt-3 font-semibold text-gray-900">{t}</p>
              <p className="mt-1 text-sm text-gray-500">{d}</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}

export default TrackOrder
