'use client'

import React, { useEffect, useState } from 'react'
import axios from 'axios'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FaArrowLeft, FaArrowRight, FaChevronLeft, FaChevronRight, FaCheckCircle, FaMapMarkerAlt, FaRegCalendarAlt, FaPhoneAlt, FaStar, FaHome } from 'react-icons/fa'
import { Img, StepBar, money, fmtDate } from './ui'
import { showToast } from '@/lib/showToast'
import { payServiceBooking } from '@/lib/payServiceBooking'
import { TIME_SLOTS, slotStart, toYMD } from '@/lib/serviceConstants'
import { WEBSITE_SERVICES, WEBSITE_SERVICE_DETAILS, WEBSITE_SERVICE_CONFIRMED, WEBSITE_MY_SERVICE_BOOKINGS, WEBSITE_LOGIN } from '@/routes/ServiceRoute'

const PAY = [['upi', 'UPI', '(Google Pay, PhonePe, Paytm, etc.)'], ['card', 'Cards', '(Credit / Debit)'], ['netbanking', 'Net Banking', ''], ['wallet', 'Wallets', '(Paytm, Amazon Pay, etc.)'], ['cash', 'Cash on Service', 'Pay the professional after the work is done']]
const KEY = 'ce_service_address'
const inp = 'w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15'
const card = 'rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5'
const PrimaryBtn = ({ children, ...p }) => <button {...p} className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-700 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50">{children}</button>
const GhostBtn = ({ children, ...p }) => <button {...p} className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-gray-50 disabled:opacity-50">{children}</button>

const Calendar = ({ value, onChange }) => {
  const [view, setView] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1) })
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const cells = [...Array(view.getDay()).fill(null), ...Array.from({ length: new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate() }, (_, i) => i + 1)]
  const canPrev = view > new Date(today.getFullYear(), today.getMonth(), 1)
  return (
    <div className="rounded-xl border border-gray-200 p-3">
      <div className="mb-2 flex items-center justify-between">
        <button type="button" disabled={!canPrev} onClick={() => setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100 disabled:opacity-30" aria-label="Previous month"><FaChevronLeft size={11} /></button>
        <b className="text-sm">{view.toLocaleString('en-IN', { month: 'long', year: 'numeric' })}</b>
        <button type="button" onClick={() => setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100" aria-label="Next month"><FaChevronRight size={11} /></button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => <span key={d} className="py-1 text-gray-400">{d}</span>)}
        {cells.map((n, i) => {
          if (!n) return <span key={i} />
          const d = new Date(view.getFullYear(), view.getMonth(), n), ymd = toYMD(d), past = d < today, on = value === ymd
          return <button key={i} type="button" disabled={past} onClick={() => onChange(ymd)} className={`aspect-square rounded-full text-[13px] transition ${on ? 'bg-emerald-700 font-bold text-white' : past ? 'text-gray-300' : 'hover:bg-emerald-50'}`}>{n}</button>
        })}
      </div>
    </div>
  )
}

const BookingWizard = ({ id }) => {
  const router = useRouter()
  const [s, setS] = useState(null)
  const [loadErr, setLoadErr] = useState('')
  const [step, setStep] = useState(1)
  const [date, setDate] = useState('')
  const [slot, setSlot] = useState('')
  const [booked, setBooked] = useState([])
  const [addr, setAddr] = useState({ fullAddress: '', landmark: '', city: 'Delhi NCR', pincode: '' })
  const [phone, setPhone] = useState('')
  const [saved, setSaved] = useState(false)
  const [edit, setEdit] = useState(true)
  const [method, setMethod] = useState('upi')
  const [paying, setPaying] = useState(false)

  useEffect(() => {
    axios.get(`/api/service-listing/${id}`, { timeout: 25000 }).then(({ data }) => { if (!data.success) throw new Error(data.message); setS(data.data) }).catch((e) => setLoadErr(e.message || 'Could not load'))
    try { const sv = JSON.parse(localStorage.getItem(KEY) || 'null'); if (sv?.addr?.fullAddress) { setAddr(sv.addr); setPhone(sv.phone || ''); setSaved(true); setEdit(false) } } catch {}
  }, [id])

  useEffect(() => {
    setSlot(''); setBooked([])
    if (date) axios.get(`/api/service-listing/${id}/slots`, { params: { date } }).then(({ data }) => setBooked(data.data || [])).catch(() => {})
  }, [date, id])

  const off = (t) => booked.includes(t) || (date && slotStart(date, t) < new Date(Date.now() + 30 * 60 * 1000))
  const addrOk = addr.fullAddress.trim().length >= 5 && addr.city.trim().length >= 2 && /^\d{6}$/.test(addr.pincode) && /^\d{10}$/.test(phone)
  const isCash = method === 'cash'

  const next = () => {
    if (step === 1 && !(date && slot)) return showToast('error', 'Please select a date and time slot.')
    if (step === 2 && !addrOk) return showToast('error', 'Fill full address, city, 6-digit PIN and 10-digit phone.')
    setStep((x) => x + 1); window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const back = () => (step === 1 ? router.push(WEBSITE_SERVICE_DETAILS(id)) : setStep((x) => x - 1))

  const confirm = async () => {
    setPaying(true)
    try {
      const { data } = await axios.post('/api/service-booking', { listingId: id, date, timeSlot: slot, address: addr, contactPhone: phone, paymentMethod: isCash ? 'cash' : 'online', paymentMode: isCash ? '' : method })
      if (!data.success) {
        if (data.statusCode === 401) { router.push(`${WEBSITE_LOGIN}?callback=${encodeURIComponent(`/services/${id}/book`)}`); return }
        throw new Error(data.message)
      }
      try { localStorage.setItem(KEY, JSON.stringify({ addr, phone })) } catch {}
      const b = data.data
      if (isCash) return router.push(WEBSITE_SERVICE_CONFIRMED(b._id))
      const ok = await payServiceBooking(b._id)
      if (ok) router.push(WEBSITE_SERVICE_CONFIRMED(b._id))
      else { showToast('error', 'Payment not completed. You can pay from My Bookings.'); router.push(WEBSITE_MY_SERVICE_BOOKINGS) }
    } catch (e) { showToast('error', e?.response?.data?.message || e.message) } finally { setPaying(false) }
  }

  if (loadErr) return <div className="py-24 text-center"><p className="mb-3 text-gray-600">{loadErr}</p><Link className="font-semibold text-emerald-700 underline" href={WEBSITE_SERVICES}>Back to services</Link></div>
  if (!s) return <div className="mx-auto max-w-[1000px] animate-pulse px-4 py-8"><div className="mb-6 h-6 rounded bg-gray-100" /><div className="h-80 rounded-2xl bg-gray-100" /></div>
  const p = s.pricing

  return (
    <div className="mx-auto w-full max-w-[1000px] px-4 pb-14 sm:px-6">
      <nav className="flex flex-wrap items-center gap-1.5 py-3 text-[13px] text-gray-500"><Link href="/">Home</Link><FaChevronRight size={9} /><Link href={WEBSITE_SERVICES}>Services</Link><FaChevronRight size={9} /><Link href={WEBSITE_SERVICE_DETAILS(id)}>{s.title}</Link></nav>
      <StepBar current={step} />

      {/* ------- STEP 1: Select Date & Time ------- */}
      {step === 1 && (
        <div className="grid gap-5 md:grid-cols-[230px_minmax(0,1fr)]">
          <div className={card}>
            <Img src={s.photo} alt={s.title} className="h-36 w-full rounded-xl object-cover object-top" />
            <h3 className="mt-3 font-bold text-[#0b1b3f]">{s.title}</h3>
            <p className="mt-0.5 text-xs text-gray-500">{s.shortDescription || `by ${s.labourName}`}</p>
            <p className="mt-2.5 text-xs text-gray-500">Starting at <b className="text-lg text-[#0b1b3f]">{money(s.price)}</b></p>
            <p className="mt-1 flex items-center gap-1 text-xs"><FaStar className="text-amber-400" size={12} /><b>{s.rating ? s.rating.toFixed(1) : 'New'}</b>{s.reviewCount > 0 && <span className="text-gray-500">({s.reviewCount})</span>}</p>
          </div>
          <div className={card}>
            <h2 className="mb-4 text-lg font-bold text-[#0b1b3f]">Select Date &amp; Time</h2>
            <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
              <Calendar value={date} onChange={setDate} />
              <div>
                <p className="mb-2 text-sm font-semibold text-slate-700">Available Time Slots</p>
                {!date ? <p className="rounded-lg bg-gray-50 p-4 text-sm text-gray-400">Pick a date to see slots.</p> : (
                  <div className="grid grid-cols-2 gap-2">
                    {TIME_SLOTS.map((t) => <button key={t} type="button" disabled={off(t)} onClick={() => setSlot(t)} className={`rounded-lg border py-2.5 text-[13px] transition ${slot === t ? 'border-emerald-700 bg-emerald-700 font-semibold text-white' : off(t) ? 'cursor-not-allowed border-gray-100 bg-gray-50 text-gray-300 line-through' : 'border-gray-200 hover:border-emerald-600'}`}>{t}</button>)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------- STEP 2: Address ------- */}
      {step === 2 && (
        <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]">
          <div className={card}>
            <h2 className="mb-3 text-lg font-bold text-[#0b1b3f]">Your Location</h2>
            {saved && !edit ? (
              <div className="rounded-xl bg-emerald-50/60 p-4 text-sm">
                <p className="flex items-center gap-2 font-semibold"><FaHome className="text-emerald-600" />Home</p>
                <p className="mt-1.5 text-gray-600">{addr.fullAddress}, {addr.city} - {addr.pincode}</p><p className="mt-0.5 text-gray-500">+91 {phone}</p>
                <button onClick={() => setEdit(true)} className="mt-2 text-xs font-semibold text-emerald-700 underline">Change</button>
              </div>
            ) : <p className="text-sm text-gray-500">Enter the address where the service is needed. We'll remember it for next time.</p>}
          </div>
          <div className={card}>
            <h2 className="mb-3 text-lg font-bold text-[#0b1b3f]">Add Service Address</h2>
            <div className={`grid gap-3 sm:grid-cols-2 ${!edit ? 'pointer-events-none opacity-50' : ''}`}>
              <div className="sm:col-span-2"><label className="mb-1 block text-xs font-semibold">Full Address*</label><input className={inp} value={addr.fullAddress} onChange={(e) => setAddr({ ...addr, fullAddress: e.target.value })} placeholder="House / flat no., street, area" /></div>
              <div className="sm:col-span-2"><label className="mb-1 block text-xs font-semibold">Landmark <span className="font-normal text-gray-400">(Optional)</span></label><input className={inp} value={addr.landmark} onChange={(e) => setAddr({ ...addr, landmark: e.target.value })} placeholder="Near metro station" /></div>
              <div><label className="mb-1 block text-xs font-semibold">City*</label><input className={inp} value={addr.city} onChange={(e) => setAddr({ ...addr, city: e.target.value })} /></div>
              <div><label className="mb-1 block text-xs font-semibold">PIN Code*</label><input className={inp} inputMode="numeric" value={addr.pincode} onChange={(e) => setAddr({ ...addr, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })} /></div>
              <div className="sm:col-span-2"><label className="mb-1 block text-xs font-semibold">Contact Number*</label><input className={inp} inputMode="numeric" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="10 digit mobile" /></div>
            </div>
          </div>
        </div>
      )}

      {/* ------- STEP 3: Review ------- */}
      {step === 3 && (
        <div className="grid gap-5 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <div className={card}>
            <h2 className="mb-3 text-lg font-bold text-[#0b1b3f]">Booking Summary</h2>
            <div className="flex items-center gap-3"><Img src={s.photo} className="h-14 w-14 rounded-lg object-cover object-top" /><b className="flex-1 text-[#0b1b3f]">{s.title}</b><b>{money(p.price)}</b></div>
            <dl className="mt-4 space-y-4 border-t pt-4 text-sm">
              <div className="flex gap-3"><FaRegCalendarAlt className="mt-1 text-gray-400" /><div><dt className="text-xs text-gray-500">Date &amp; Time</dt><dd className="font-medium">{fmtDate(`${date}T00:00:00+05:30`)}, {slot}</dd></div></div>
              <div className="flex gap-3"><FaMapMarkerAlt className="mt-1 text-gray-400" /><div><dt className="text-xs text-gray-500">Address</dt><dd className="font-medium">{addr.fullAddress}{addr.landmark && `, ${addr.landmark}`}, {addr.city} - {addr.pincode}</dd></div></div>
              <div className="flex gap-3"><FaPhoneAlt className="mt-1 text-gray-400" /><div><dt className="text-xs text-gray-500">Contact Number</dt><dd className="font-medium">+91 {phone}</dd></div></div>
            </dl>
            <div className="mt-4 flex justify-between border-t pt-3 text-base"><span className="text-gray-600">Total Amount</span><b>{money(p.price)}</b></div>
          </div>
          <div className="space-y-5">
            <div className={card}>
              <div className="mb-3 flex items-center justify-between"><h3 className="font-bold text-[#0b1b3f]">Professional Details</h3><button onClick={() => setStep(1)} className="text-xs font-semibold text-emerald-700">Edit</button></div>
              <div className="flex items-center gap-3"><Img src={s.photo} className="h-14 w-14 rounded-full border-2 border-emerald-100 object-cover object-top" />
                <div className="text-sm"><p className="font-semibold">{s.labourName}</p><p className="flex items-center gap-1 text-xs"><FaStar className="text-amber-400" size={11} />{s.rating ? s.rating.toFixed(1) : 'New'}</p>{s.experienceYears > 0 && <p className="text-xs text-gray-500">{s.experienceYears} years experience</p>}{s.isVerified && <p className="flex items-center gap-1 text-xs font-medium text-emerald-700"><FaCheckCircle size={10} />Verified</p>}</div></div>
            </div>
            <div className={`${card} text-xs text-gray-600`}>
              <h3 className="mb-2 text-sm font-bold text-[#0b1b3f]">Cancellation Policy</h3>
              <ul className="list-disc space-y-1 pl-4"><li>Free cancellation up to 2 hours before service</li><li>Paid bookings: contact support for cancellation &amp; refund</li><li>No cancellation within 2 hours of the slot</li></ul>
            </div>
          </div>
        </div>
      )}

      {/* ------- STEP 4: Payment ------- */}
      {step === 4 && (
        <div className="grid gap-5 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <div className={card}>
            <h2 className="mb-3 text-lg font-bold text-[#0b1b3f]">Choose Payment Method</h2>
            <div className="space-y-2.5">{PAY.map(([k, t, d]) => (
              <label key={k} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 text-sm transition ${method === k ? 'border-emerald-600 bg-emerald-50/50' : 'border-gray-200 hover:border-gray-300'}`}>
                <input type="radio" name="pm" className="mt-1 accent-emerald-700" checked={method === k} onChange={() => setMethod(k)} /><span><b>{t}</b> <span className="text-xs text-gray-500">{d}</span></span>
              </label>))}</div>
            <p className="mt-3 text-xs text-gray-500">{isCash ? 'Pay the professional in cash after the service is completed.' : 'Secure payment via Razorpay. Your booking is confirmed once payment succeeds.'}</p>
          </div>
          <div className={`${card} h-fit`}>
            <h3 className="mb-3 font-bold text-[#0b1b3f]">Price Details</h3>
            <div className="space-y-2 text-sm"><div className="flex justify-between"><span className="text-gray-600">Service Charge</span><span>{money(p.price)}</span></div><div className="flex justify-between"><span className="text-gray-600">Platform Fee</span><span>{money(p.platformFee)}</span></div></div>
            <div className="mt-3 flex justify-between border-t pt-3 text-base font-bold"><span>Total Amount</span><span>{money(p.total)}</span></div>
          </div>
        </div>
      )}

      <div className="mt-6 flex items-center justify-between">
        <GhostBtn onClick={back} disabled={paying}><FaArrowLeft size={11} />Back</GhostBtn>
        {step < 4 && <PrimaryBtn onClick={next}>{step === 3 ? 'Confirm Booking' : 'Continue'}<FaArrowRight size={11} /></PrimaryBtn>}
        {step === 4 && <PrimaryBtn onClick={confirm} disabled={paying}>{paying ? 'Please wait...' : isCash ? 'Confirm Booking' : `Pay Now ${money(p.total)}`}</PrimaryBtn>}
      </div>
    </div>
  )
}
export default BookingWizard
