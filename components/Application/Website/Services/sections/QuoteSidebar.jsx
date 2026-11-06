'use client'
import React, { useState } from 'react'
import axios from 'axios'
import Link from 'next/link'
import { FaArrowRight, FaHeadset, FaWhatsapp, FaPhoneAlt } from 'react-icons/fa'
import { FieldLabel } from './parts'
import { showToast } from '@/lib/showToast'
import { WHY, CITIES, WHATSAPP, PHONE, inputCls } from '@/lib/servicesConfig'
import { WEBSITE_MY_SERVICE_BOOKINGS } from '@/routes/ServiceRoute'

const BLANK = { name: '', phone: '', serviceType: '', city: 'Delhi NCR', preferredDate: '', details: '' }

const QuoteSidebar = ({ categories }) => {
  const [quote, setQuote] = useState(BLANK)
  const [sending, setSending] = useState(false)
  const today = new Date().toISOString().slice(0, 10)
  const set = (k) => (e) => setQuote({ ...quote, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault(); setSending(true)
    try {
      const { data } = await axios.post('/api/service-quote', quote)
      if (!data.success) throw new Error(data.message)
      showToast('success', data.message); setQuote({ ...quote, details: '', preferredDate: '' })
    } catch (err) { showToast('error', err.message) } finally { setSending(false) }
  }

  return (
    // tablet: quote | (why + help) side by side · desktop: ek column
    <aside className="grid items-start gap-4 md:grid-cols-2 lg:grid-cols-1">
      <form onSubmit={submit} className="space-y-3 rounded-xl border border-emerald-100 bg-gradient-to-b from-emerald-50 to-emerald-50/40 p-4 shadow-sm">
        <div><h2 className="text-[18px] font-bold text-emerald-700">Get a Service Quote</h2><p className="mt-1 text-[11.5px] leading-snug text-slate-600">Tell us what you need and we'll connect you with the right professionals.</p></div>
        <input className={inputCls} placeholder="Your name" value={quote.name} onChange={set('name')} />
        <input className={inputCls} placeholder="Phone (10 digit)" inputMode="numeric" required value={quote.phone} onChange={(e) => setQuote({ ...quote, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })} />
        <div><FieldLabel>Service Type</FieldLabel>
          <select className={inputCls} required value={quote.serviceType} onChange={set('serviceType')}><option value="">Select Service</option>{categories.map((c) => <option key={c._id} value={c.name}>{c.name}</option>)}</select></div>
        <div><FieldLabel>Your Location</FieldLabel>
          <select className={inputCls} value={quote.city} onChange={set('city')}>{CITIES.map((c) => <option key={c}>{c}</option>)}</select></div>
        <div><FieldLabel>Preferred Date</FieldLabel><input className={inputCls} type="date" min={today} value={quote.preferredDate} onChange={set('preferredDate')} /></div>
        <div><FieldLabel optional>Additional Details</FieldLabel><textarea className={inputCls} rows={3} placeholder="e.g. 2BHK painting, kitchen renovation, etc." value={quote.details} onChange={set('details')} /></div>
        <button type="submit" disabled={sending} className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-700 py-3 text-[13px] font-semibold text-white shadow-sm transition hover:bg-emerald-800 disabled:opacity-60">{sending ? 'Sending...' : <>Request a Quote <FaArrowRight size={12} /></>}</button>
      </form>

      <div className="space-y-4">
        <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3.5 text-[16px] font-bold leading-snug text-[#0b1b3f]">Why Choose ConstructEzy Services?</h2>
          <ul className="space-y-3.5">
            {WHY.map(({ t, d, Icon }) => (
              <li key={t} className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"><Icon size={15} /></span>
                <span className="min-w-0"><b className="block text-[13px] leading-tight text-[#0b1b3f]">{t}</b><span className="text-[11.5px] text-gray-500">{d}</span></span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border border-sky-100 bg-sky-50 p-4">
          <div className="mb-3 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#0b1b3f] shadow-sm"><FaHeadset size={20} /></span>
            <div><p className="text-[15px] font-bold text-[#0b1b3f]">Need Help?</p><p className="text-[11.5px] text-gray-500">Talk to our experts</p></div>
          </div>
          <a href={WHATSAPP ? `https://wa.me/${WHATSAPP}` : '#'} target="_blank" rel="noreferrer" className="mb-2 flex items-center justify-center gap-2 rounded-lg bg-emerald-700 py-2.5 text-[13px] font-semibold text-white hover:bg-emerald-800"><FaWhatsapp size={16} />Chat on WhatsApp</a>
          <a href={PHONE ? `tel:${PHONE}` : '#'} className="flex items-center justify-center gap-2 rounded-lg border border-sky-400 bg-white py-2.5 text-[13px] font-semibold text-sky-600 hover:bg-sky-50"><FaPhoneAlt size={13} />Call Now</a>
          <p className="mt-2.5 text-center text-[11.5px] text-gray-500">Available 9 AM - 9 PM</p>
          <Link href={WEBSITE_MY_SERVICE_BOOKINGS} className="mt-2 block text-center text-xs font-semibold text-emerald-700 underline">My Bookings</Link>
        </section>
      </div>
    </aside>
  )
}
export default QuoteSidebar
