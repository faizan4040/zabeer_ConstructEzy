'use client'

import React, { Suspense, useState } from 'react'
import axios from 'axios'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { FaPhoneAlt, FaEnvelope, FaWhatsapp, FaRegClock, FaCheckCircle, FaPaperPlane } from 'react-icons/fa'
import { WHATSAPP, PHONE } from '@/lib/servicesConfig'
import { WEBSITE_HOME } from '@/routes/WebsiteRoute'

// Form ke subjects. URL me ?subject=partner jaisa diya ho to wahi pehle se select hoga.
const SUBJECTS = [
  { key: 'order', label: 'Order / Delivery help' },
  { key: 'service', label: 'Service booking help' },
  { key: 'payment', label: 'Payment / Refund' },
  { key: 'return', label: 'Return / Replacement' },
  { key: 'partner', label: 'Partner with us' },
  { key: 'other', label: 'Something else' },
]

const SUPPORT_EMAIL = 'support@constructezy.com'
const inputCls =
  'w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100'

const ContactForm = () => {
  const sp = useSearchParams()
  const initialSubject = SUBJECTS.some((s) => s.key === sp.get('subject')) ? sp.get('subject') : 'order'

  const [form, setForm] = useState({ name: '', phone: '', email: '', subject: initialSubject, message: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.name.trim().length < 2) return setError('Please enter your name.')
    if (!/^[0-9]{10}$/.test(form.phone)) return setError('Please enter a valid 10 digit phone number.')
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) return setError('Please enter a valid email.')
    if (form.message.trim().length < 5) return setError('Please write your message.')

    const subject = SUBJECTS.find((s) => s.key === form.subject)?.label || 'Other'
    const details = [form.email && `Email: ${form.email}`, form.message.trim()].filter(Boolean).join(' | ')

    setLoading(true)
    try {
      // Admin panel ke "Service Quotes" list me "Contact - <subject>" naam se dikhega
      await axios.post('/api/service-quote', {
        name: form.name.trim().slice(0, 60),
        phone: form.phone,
        serviceType: `Contact - ${subject}`.slice(0, 60),
        details: details.slice(0, 500),
      })
      setDone(true)
    } catch (err) {
      setError(err?.response?.data?.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-emerald-100 bg-emerald-50/60 px-6 py-12 text-center">
        <FaCheckCircle className="text-emerald-600" size={44} />
        <h2 className="mt-4 text-xl font-bold text-gray-900">Message sent!</h2>
        <p className="mt-2 max-w-sm text-sm text-gray-600">Thanks for reaching out. Our team will call you back shortly.</p>
        <Link href={WEBSITE_HOME} className="mt-6 rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800">
          Back to Home
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7" noValidate>
      <h2 className="text-lg font-bold text-gray-900 sm:text-xl">Send us a message</h2>
      <p className="mt-1 text-sm text-gray-500">Fill in the form and we&apos;ll get back to you.</p>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-gray-700">Full name *</span>
          <input className={inputCls} value={form.name} onChange={set('name')} placeholder="Your name" maxLength={60} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-gray-700">Phone number *</span>
          <input
            className={inputCls}
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
            placeholder="10 digit mobile number"
            inputMode="numeric"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-gray-700">Email (optional)</span>
          <input className={inputCls} type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-gray-700">How can we help? *</span>
          <select className={inputCls} value={form.subject} onChange={set('subject')}>
            {SUBJECTS.map((s) => (
              <option key={s.key} value={s.key}>{s.label}</option>
            ))}
          </select>
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-sm font-medium text-gray-700">Message *</span>
          <textarea
            className={`${inputCls} min-h-32 resize-y`}
            value={form.message}
            onChange={set('message')}
            placeholder="Tell us about your query. Include your order / booking number if you have one."
            maxLength={450}
          />
        </label>
      </div>

      {error && <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        <FaPaperPlane size={13} />
        {loading ? 'Sending…' : 'Send Message'}
      </button>
    </form>
  )
}

const InfoRow = ({ Icon, title, children }) => (
  <div className="flex gap-3">
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
      <Icon size={16} />
    </span>
    <div className="min-w-0 text-sm">
      <p className="font-semibold text-gray-900">{title}</p>
      <div className="mt-0.5 break-words text-gray-600">{children}</div>
    </div>
  </div>
)

const ContactUs = () => {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <section className="bg-linear-to-br from-emerald-700 to-emerald-900 px-4 py-10 text-white sm:py-14">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-3xl font-extrabold sm:text-4xl">Help &amp; Contact</h1>
          <p className="mt-2 max-w-xl text-sm text-emerald-50 sm:text-base">
            Questions about an order, a service booking, payments or returns? We&apos;re here to help.
          </p>
        </div>
      </section>

      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-8 sm:py-12 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Suspense fallback={null}>
            <ContactForm />
          </Suspense>
        </div>

        <aside className="space-y-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-bold">Other ways to reach us</h2>
          {PHONE && (
            <InfoRow Icon={FaPhoneAlt} title="Call us">
              <a href={`tel:${PHONE}`} className="hover:text-emerald-700">{PHONE}</a>
            </InfoRow>
          )}
          {WHATSAPP && (
            <InfoRow Icon={FaWhatsapp} title="WhatsApp">
              <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener noreferrer" className="hover:text-emerald-700">Chat with us</a>
            </InfoRow>
          )}
          <InfoRow Icon={FaEnvelope} title="Email">
            <a href={`mailto:${SUPPORT_EMAIL}`} className="hover:text-emerald-700">{SUPPORT_EMAIL}</a>
          </InfoRow>
          <InfoRow Icon={FaRegClock} title="Business hours">
            Monday – Saturday: 9:00 AM – 6:00 PM<br />Sunday: Closed
          </InfoRow>
          <p className="rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
            Tip: keep your order / booking number ready so we can help you faster.
          </p>
        </aside>
      </main>
    </div>
  )
}

export default ContactUs
