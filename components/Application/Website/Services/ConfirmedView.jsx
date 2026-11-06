'use client'

import React, { useEffect, useState } from 'react'
import axios from 'axios'
import Link from 'next/link'
import { FaCheck, FaExclamation, FaPhoneAlt, FaWhatsapp, FaRegCalendarAlt, FaMapMarkerAlt } from 'react-icons/fa'
import { Img, money, fmtDate } from './ui'
import { WEBSITE_MY_SERVICE_BOOKINGS, WEBSITE_SERVICES, WEBSITE_LOGIN } from '@/routes/ServiceRoute'

const ConfirmedView = ({ bookingId }) => {
  const [b, setB] = useState(null)
  const [err, setErr] = useState('')
  useEffect(() => {
    axios.get(`/api/service-booking/${bookingId}`, { timeout: 25000 })
      .then(({ data }) => { if (!data.success) throw new Error(data.statusCode === 401 ? 'login' : data.message); setB(data.data) })
      .catch((e) => setErr(e.message))
  }, [bookingId])

  if (err === 'login') return <div className="py-24 text-center"><Link href={WEBSITE_LOGIN} className="font-semibold text-emerald-700 underline">Please login to view this booking</Link></div>
  if (err) return <p className="py-24 text-center text-gray-500">{err}</p>
  if (!b) return <div className="mx-auto max-w-[620px] animate-pulse px-4 py-10"><div className="mx-auto mb-6 h-16 w-16 rounded-full bg-gray-100" /><div className="h-64 rounded-2xl bg-gray-100" /></div>

  const pending = b.status === 'pending_payment'
  return (
    <div className="mx-auto w-full max-w-[620px] px-4 pb-16 pt-10">
      <div className="mb-7 text-center">
        <span className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full text-white shadow-lg ${pending ? 'bg-yellow-500 shadow-yellow-200' : 'bg-emerald-600 shadow-emerald-200'}`}>{pending ? <FaExclamation size={26} /> : <FaCheck size={26} />}</span>
        <h1 className="mt-4 text-2xl font-extrabold text-[#0b1b3f]">{pending ? 'Payment Pending' : 'Booking Confirmed!'}</h1>
        <p className="mt-1 text-sm text-gray-500">{pending ? 'Complete the payment from My Bookings to confirm your slot.' : 'Your service has been booked successfully.'}</p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 text-sm shadow-sm">
        <div className="flex items-center justify-between border-b pb-3">
          <div><p className="text-xs text-gray-500">Booking ID</p><b className="text-base text-[#0b1b3f]">#{b.bookingCode}</b></div>
          <span className={`rounded-md px-2.5 py-1 text-xs font-semibold capitalize ${pending ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>{pending ? 'Payment pending' : 'Confirmed'}</span>
        </div>
        <div className="flex items-center gap-3 py-4"><Img src={b.serviceImage} className="h-12 w-12 rounded-lg object-cover object-top" /><b className="flex-1 text-[#0b1b3f]">{b.serviceTitle}</b><b>{money(b.total)}</b></div>
        <dl className="space-y-4 border-t pt-4">
          <div className="flex gap-3"><FaRegCalendarAlt className="mt-0.5 text-gray-400" /><div><dt className="text-xs text-gray-500">Date &amp; Time</dt><dd className="font-medium">{fmtDate(b.date)}, {b.timeSlot}</dd></div></div>
          <div className="flex gap-3"><FaMapMarkerAlt className="mt-0.5 text-gray-400" /><div><dt className="text-xs text-gray-500">Address</dt><dd className="font-medium">{b.address.fullAddress}, {b.address.city} - {b.address.pincode}</dd></div></div>
          <div className="flex items-center justify-between gap-3 border-t pt-4">
            <div className="flex items-center gap-3"><Img src={b.serviceImage} className="h-11 w-11 rounded-full border-2 border-emerald-100 object-cover object-top" /><div><dt className="text-xs text-gray-500">Professional</dt><dd className="font-semibold">{b.labourName}</dd></div></div>
            {b.labourPhone && <div className="flex gap-2">
              <a href={`tel:${b.labourPhone}`} aria-label="Call professional" className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-600 text-emerald-700 hover:bg-emerald-50"><FaPhoneAlt size={13} /></a>
              <a href={`https://wa.me/91${b.labourPhone}`} target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp" className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-600 text-emerald-700 hover:bg-emerald-50"><FaWhatsapp size={15} /></a>
            </div>}
          </div>
          <div className="flex justify-between border-t pt-4 text-xs text-gray-500"><span>Payment</span><span className="font-medium capitalize text-slate-700">{b.paymentMethod === 'cash' ? 'Cash on service' : `Online (${b.paymentMode || 'Razorpay'})`} · {b.paymentStatus.replace('_', ' ')}</span></div>
        </dl>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <Link href={WEBSITE_MY_SERVICE_BOOKINGS} className="rounded-xl bg-emerald-700 py-3 text-center text-sm font-semibold text-white hover:bg-emerald-800">Track Booking</Link>
        <Link href={WEBSITE_MY_SERVICE_BOOKINGS} className="rounded-xl border border-emerald-700 py-3 text-center text-sm font-semibold text-emerald-700 hover:bg-emerald-50">View My Bookings</Link>
      </div>
      <p className="mt-4 text-center text-xs text-gray-500">You can track this booking anytime in My Bookings. <Link href={WEBSITE_SERVICES} className="underline">Book another service</Link></p>
    </div>
  )
}
export default ConfirmedView
