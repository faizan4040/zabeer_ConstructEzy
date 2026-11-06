'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FaClipboardList, FaTools, FaShoppingBag, FaSearch, FaRegCalendarAlt, FaMapMarkerAlt, FaStar, FaPhoneAlt } from 'react-icons/fa'
import { Img, money, fmtDate } from './ui'
import { showToast } from '@/lib/showToast'
import { payServiceBooking } from '@/lib/payServiceBooking'
import { slotStart, istYMD } from '@/lib/serviceConstants'
import { WEBSITE_SERVICES, WEBSITE_SERVICE_CONFIRMED, WEBSITE_LOGIN } from '@/routes/ServiceRoute'

const TABS = [['all', 'All'], ['upcoming', 'Upcoming'], ['completed', 'Completed'], ['cancelled', 'Cancelled']]
const UPCOMING = ['pending_payment', 'confirmed', 'in_progress']
const CHIP = { pending_payment: 'bg-yellow-100 text-yellow-700', confirmed: 'bg-green-100 text-green-700', in_progress: 'bg-blue-100 text-blue-700', completed: 'bg-emerald-100 text-emerald-800', cancelled: 'bg-red-100 text-red-700' }
const LABEL = { pending_payment: 'Payment pending', confirmed: 'Confirmed', in_progress: 'In Progress', completed: 'Completed', cancelled: 'Cancelled' }
const NAV = [[FaClipboardList, 'My Bookings', null], [FaTools, 'Book a Service', WEBSITE_SERVICES], [FaShoppingBag, 'Shop Products', '/shop']]

const MyBookings = () => {
  const router = useRouter()
  const [all, setAll] = useState([])
  const [tab, setTab] = useState('all')
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(null)
  const [state, setState] = useState('loading')
  const [busy, setBusy] = useState('')
  const [rate, setRate] = useState(null)

  const load = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/service-booking', { timeout: 25000 })
      if (!data.success) { setState(data.statusCode === 401 ? 'login' : 'error'); return }
      setAll(data.data); setState('ok')
    } catch { setState('error') }
  }, [])
  useEffect(() => { load() }, [load])

  const counts = useMemo(() => ({ all: all.length, upcoming: all.filter((b) => UPCOMING.includes(b.status)).length, completed: all.filter((b) => b.status === 'completed').length, cancelled: all.filter((b) => b.status === 'cancelled').length }), [all])
  const list = all.filter((b) => tab === 'all' ? true : tab === 'upcoming' ? UPCOMING.includes(b.status) : b.status === tab)
    .filter((b) => !q || `${b.bookingCode} ${b.serviceTitle} ${b.labourName} ${b.address?.fullAddress}`.toLowerCase().includes(q.toLowerCase()))
  const canCancel = (b) => ['pending_payment', 'confirmed'].includes(b.status) && b.paymentStatus !== 'paid' && slotStart(istYMD(b.date), b.timeSlot) - Date.now() >= 2 * 3600 * 1000

  const cancel = async (b) => {
    if (!confirm(`Cancel booking #${b.bookingCode}?`)) return
    setBusy(b._id)
    try { const { data } = await axios.patch(`/api/service-booking/${b._id}`, { reason: 'Cancelled by customer' }); if (!data.success) throw new Error(data.message); showToast('success', data.message); load() }
    catch (e) { showToast('error', e.message) } finally { setBusy('') }
  }
  const pay = async (b) => {
    setBusy(b._id)
    try { if (await payServiceBooking(b._id)) router.push(WEBSITE_SERVICE_CONFIRMED(b._id)); else showToast('error', 'Payment not completed.') }
    catch (e) { showToast('error', e.message) } finally { setBusy('') }
  }
  const submitRate = async () => {
    try { const { data } = await axios.post(`/api/service-booking/${rate.id}/review`, { rating: rate.rating, comment: rate.comment }); if (!data.success) throw new Error(data.message); showToast('success', data.message); setRate(null); load() }
    catch (e) { showToast('error', e.message) }
  }

  let body
  if (state === 'loading') body = <div className="space-y-3">{[1, 2].map((i) => <div key={i} className="h-36 animate-pulse rounded-xl bg-gray-100" />)}</div>
  else if (state === 'login') body = <div className="py-16 text-center"><Link href={`${WEBSITE_LOGIN}?callback=/services/my-bookings`} className="font-semibold text-emerald-700 underline">Please login to see your bookings</Link></div>
  else if (state === 'error') body = <div className="py-16 text-center"><p className="mb-3 text-red-500">Could not load bookings.</p><button onClick={() => { setState('loading'); load() }} className="rounded-lg bg-emerald-700 px-5 py-2 text-sm font-semibold text-white">Retry</button></div>
  else body = (
    <>
      {!list.length && <div className="rounded-xl border border-dashed py-14 text-center text-gray-500">No bookings here yet.</div>}
      <div className="space-y-4">{list.map((b) => (
        <div key={b._id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between text-sm"><b className="text-[#0b1b3f]">#{b.bookingCode}</b><span className={`rounded-md px-2.5 py-0.5 text-xs font-semibold ${CHIP[b.status]}`}>{LABEL[b.status]}</span></div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Img src={b.serviceImage} className="h-14 w-14 shrink-0 rounded-full border-2 border-emerald-100 object-cover object-top" />
            <div className="min-w-0 flex-1 space-y-0.5 text-[13px] text-gray-600">
              <p className="text-[15px] font-semibold text-[#0b1b3f]">{b.serviceTitle}</p>
              <p className="flex items-center gap-2"><FaRegCalendarAlt size={11} className="text-gray-400" />{fmtDate(b.date)}, {b.timeSlot}</p>
              <p className="flex items-center gap-2"><FaMapMarkerAlt size={11} className="text-gray-400" /><span className="truncate">{b.address.fullAddress}, {b.address.city}</span></p>
              <p className="flex items-center gap-2"><FaStar size={11} className="text-amber-400" />{b.labourName}</p>
            </div>
            <p className="text-lg font-bold text-[#0b1b3f] sm:self-start">{money(b.total)}</p>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button onClick={() => setOpen(open === b._id ? null : b._id)} className="rounded-lg border border-gray-300 px-4 py-1.5 text-[13px] font-semibold text-slate-700 hover:bg-gray-50">{open === b._id ? 'Hide Details' : 'View Details'}</button>
            {b.status === 'pending_payment' && <button disabled={busy === b._id} onClick={() => pay(b)} className="rounded-lg bg-emerald-700 px-4 py-1.5 text-[13px] font-semibold text-white hover:bg-emerald-800 disabled:opacity-50">Pay Now</button>}
            {canCancel(b) && <button disabled={busy === b._id} onClick={() => cancel(b)} className="rounded-lg border border-red-300 px-4 py-1.5 text-[13px] font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50">Cancel</button>}
            {b.status === 'completed' && !b.reviewed && <button onClick={() => setRate({ id: b._id, rating: 5, comment: '' })} className="rounded-lg bg-emerald-700 px-4 py-1.5 text-[13px] font-semibold text-white hover:bg-emerald-800">Rate Service</button>}
            {b.labourPhone && ['confirmed', 'in_progress'].includes(b.status) && <a href={`tel:${b.labourPhone}`} className="inline-flex items-center gap-2 rounded-lg border border-emerald-600 px-4 py-1.5 text-[13px] font-semibold text-emerald-700 hover:bg-emerald-50"><FaPhoneAlt size={11} />Call</a>}
          </div>
          {open === b._id && (
            <dl className="mt-3 grid gap-2 border-t pt-3 text-[13px] sm:grid-cols-2">
              <div><dt className="text-xs text-gray-500">Payment</dt><dd className="capitalize">{b.paymentMethod} · {b.paymentStatus.replace('_', ' ')}</dd></div>
              <div><dt className="text-xs text-gray-500">Price</dt><dd>{money(b.price)} + {money(b.platformFee)} fee = <b>{money(b.total)}</b></dd></div>
              <div><dt className="text-xs text-gray-500">Contact</dt><dd>{b.contactPhone}</dd></div>
              <div><dt className="text-xs text-gray-500">Full address</dt><dd>{b.address.fullAddress}{b.address.landmark && `, ${b.address.landmark}`}, {b.address.city} - {b.address.pincode}</dd></div>
              {b.cancelReason && <div><dt className="text-xs text-gray-500">Cancel reason</dt><dd>{b.cancelReason}</dd></div>}
            </dl>
          )}
        </div>))}
      </div>
    </>
  )

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-5 px-4 pb-14 pt-5 sm:px-6 lg:flex-row">
      {/* dark sidebar (desktop) / pill bar (mobile) */}
      <aside className="shrink-0 lg:w-[220px]">
        <nav className="flex gap-2 overflow-x-auto rounded-2xl bg-[#062b22] p-2 lg:flex-col lg:gap-1 lg:p-3" aria-label="Account">
          {NAV.map(([I, label, href]) => {
            const on = !href
            const cls = `flex shrink-0 items-center gap-3 whitespace-nowrap rounded-lg px-3.5 py-2.5 text-sm font-medium transition ${on ? 'bg-emerald-700 text-white' : 'text-emerald-100/80 hover:bg-white/10 hover:text-white'}`
            return on ? <span key={label} className={cls} aria-current="page"><I size={14} />{label}</span> : <Link key={label} href={href} className={cls}><I size={14} />{label}</Link>
          })}
        </nav>
      </aside>

      <main className="min-w-0 flex-1">
        <h1 className="mb-4 text-2xl font-extrabold text-[#0b1b3f]">My Bookings</h1>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {TABS.map(([k, l]) => <button key={k} onClick={() => setTab(k)} className={`rounded-lg px-4 py-2 text-[13px] font-semibold transition ${tab === k ? 'bg-emerald-700 text-white' : 'border border-gray-200 bg-white text-slate-600 hover:bg-gray-50'}`}>{l} ({counts[k]})</button>)}
        </div>
        <div className="relative mb-4"><FaSearch size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by booking ID, service or address" className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-emerald-600" /></div>
        {body}
      </main>

      {rate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setRate(null)}>
          <div className="w-full max-w-sm rounded-2xl bg-white p-5" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-3 text-lg font-bold">Rate this service</h3>
            <div className="mb-3 flex gap-1">{[1, 2, 3, 4, 5].map((i) => <button key={i} onClick={() => setRate({ ...rate, rating: i })} aria-label={`${i} star`}><FaStar size={28} className={i <= rate.rating ? 'text-amber-400' : 'text-gray-300'} /></button>)}</div>
            <textarea rows={3} maxLength={600} value={rate.comment} onChange={(e) => setRate({ ...rate, comment: e.target.value })} placeholder="Share your experience (optional)" className="w-full rounded-lg border p-2 text-sm" />
            <div className="mt-3 flex justify-end gap-2"><button onClick={() => setRate(null)} className="rounded-lg border px-4 py-2 text-sm font-semibold">Cancel</button><button onClick={submitRate} className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white">Submit</button></div>
          </div>
        </div>
      )}
    </div>
  )
}
export default MyBookings
