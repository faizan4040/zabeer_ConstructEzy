'use client'

import React, { useEffect, useState } from 'react'
import axios from 'axios'
import Link from 'next/link'
import { Img, money, fmtDate } from './ui'
import { WEBSITE_MY_SERVICE_BOOKINGS, WEBSITE_SERVICES, WEBSITE_LOGIN } from '@/routes/ServiceRoute'

const ConfirmedView = ({ bookingId }) => {
  const [b, setB] = useState(null)
  const [err, setErr] = useState('')

  useEffect(() => {
    axios.get(`/api/service-booking/${bookingId}`).then(({ data }) => { if (!data.success) throw new Error(data.statusCode === 401 ? 'login' : data.message); setB(data.data) }).catch((e) => setErr(e.message))
  }, [bookingId])

  if (err === 'login') return <div className="py-24 text-center"><Link href={WEBSITE_LOGIN} className="font-semibold text-emerald-700 underline">Please login to view this booking</Link></div>
  if (err) return <p className="py-24 text-center text-gray-500">{err}</p>
  if (!b) return <p className="py-24 text-center text-gray-400">Loading...</p>

  const pending = b.status === 'pending_payment'
  return (
    <div className="mx-auto w-full max-w-[640px] px-4 pb-14 pt-8">
      <div className="mb-6 text-center">
        <span className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full text-3xl text-white ${pending ? 'bg-yellow-500' : 'bg-emerald-600'}`}>{pending ? '!' : '✓'}</span>
        <h1 className="mt-3 text-2xl font-extrabold text-[#0b1b3f]">{pending ? 'Payment Pending' : 'Booking Confirmed!'}</h1>
        <p className="text-sm text-gray-500">{pending ? 'Complete the payment from My Bookings to confirm your slot.' : 'Your service has been booked successfully.'}</p>
      </div>

      <div className="rounded-xl border bg-white p-5 text-sm shadow-sm">
        <div className="flex items-center justify-between border-b pb-3"><div><p className="text-xs text-gray-500">Booking ID</p><b className="text-base">#{b.bookingCode}</b></div>
          <span className={`rounded px-2 py-0.5 text-xs font-semibold capitalize ${pending ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>{b.status.replace('_', ' ')}</span></div>
        <div className="flex items-center gap-3 py-3"><Img src={b.serviceImage} className="h-12 w-12 rounded-lg object-cover" /><b className="flex-1">{b.serviceTitle}</b><b>{money(b.total)}</b></div>
        <dl className="space-y-3 border-t pt-3">
          <div className="flex justify-between gap-4"><dt className="text-gray-500">Date &amp; Time</dt><dd className="text-right font-medium">{fmtDate(b.date)}, {b.timeSlot}</dd></div>
          <div className="flex justify-between gap-4"><dt className="text-gray-500">Address</dt><dd className="text-right font-medium">{b.address.fullAddress}, {b.address.city} - {b.address.pincode}</dd></div>
          <div className="flex justify-between gap-4"><dt className="text-gray-500">Payment</dt><dd className="text-right font-medium capitalize">{b.paymentMethod === 'cash' ? 'Cash on service' : `Online (${b.paymentMode || 'Razorpay'})`} · {b.paymentStatus.replace('_', ' ')}</dd></div>
          <div className="flex items-center justify-between gap-4"><dt className="text-gray-500">Professional</dt>
            <dd className="flex items-center gap-2 font-medium">{b.labourName}{b.labourPhone && <a href={`tel:${b.labourPhone}`} className="flex h-8 w-8 items-center justify-center rounded-full border border-emerald-600 text-emerald-700">📞</a>}</dd></div>
        </dl>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <Link href={WEBSITE_MY_SERVICE_BOOKINGS} className="rounded-lg bg-emerald-700 py-3 text-center text-sm font-semibold text-white hover:bg-emerald-800">Track Booking</Link>
        <Link href={WEBSITE_MY_SERVICE_BOOKINGS} className="rounded-lg border border-emerald-700 py-3 text-center text-sm font-semibold text-emerald-700">View My Bookings</Link>
      </div>
      <p className="mt-4 text-center text-xs text-gray-500">You can find this booking anytime in My Bookings. <Link href={WEBSITE_SERVICES} className="underline">Book another service</Link></p>
    </div>
  )
}
export default ConfirmedView