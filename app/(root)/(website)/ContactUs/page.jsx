'use client'

import React, { Suspense, useRef, useState } from 'react'
import axios from 'axios'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  FaPhoneAlt,
  FaEnvelope,
  FaWhatsapp,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaPaperPlane,
  FaCubes,
  FaHardHat,
  FaDraftingCompass,
  FaHandshake,
  FaRegCommentDots,
  FaUser,
  FaBuilding,
  FaTruck,
} from 'react-icons/fa'
import { WHATSAPP, PHONE } from '@/lib/servicesConfig'
import { WEBSITE_HOME } from '@/routes/WebsiteRoute'

/**
 * ConstructEzy – Contact Us
 *
 * Hero buttons: WhatsApp, Call Us, Submit an Enquiry, Become a Supplier / Service Partner.
 * Enquiry categories ("I am a"): Customer, Contractor / Builder, Supplier / Service Provider.
 *   -> the category is saved in the lead's serviceType, e.g.
 *      "Contact - Contractor - Project Enquiries"
 *      so your team can filter leads by who they came from.
 *
 * URL support: /contact?type=supplier&subject=supplier
 *   type    = customer | contractor | supplier
 *   subject = product | service | project | supplier | general   (old ?subject=partner still works)
 */

const BLUE = '#12305a'
const YELLOW = '#f5b800'

const gridStyle = {
  backgroundImage:
    'linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.07) 1px, transparent 1px)',
  backgroundSize: '32px 32px',
}

const SUPPORT_EMAIL = 'support@constructezy.com'

// Who is writing to us. "tag" is the short word saved with the lead.
const ENQUIRY_TYPES = [
  { key: 'customer', label: 'Customer', who: 'Homeowner', tag: 'Customer', Icon: FaUser },
  {
    key: 'contractor',
    label: 'Contractor / Builder',
    who: 'Contractor, builder or construction business',
    tag: 'Contractor',
    Icon: FaBuilding,
  },
  {
    key: 'supplier',
    label: 'Supplier / Service Provider',
    who: 'Material supplier or service provider',
    tag: 'Supplier',
    Icon: FaTruck,
  },
]

// What they need help with
const SUBJECTS = [
  {
    key: 'product',
    label: 'Product Enquiries',
    text: 'Looking for construction materials or need a quotation?',
    Icon: FaCubes,
  },
  {
    key: 'service',
    label: 'Service & Labour Booking',
    text: 'Need electricians, plumbers, carpenters, masons or other skilled professionals?',
    Icon: FaHardHat,
  },
  {
    key: 'project',
    label: 'Project Enquiries',
    text: 'Planning a new construction or renovation project?',
    Icon: FaDraftingCompass,
  },
  {
    key: 'supplier',
    label: 'Supplier Partnerships',
    text: 'Interested in listing your products or partnering with ConstructEzy?',
    Icon: FaHandshake,
  },
  {
    key: 'general',
    label: 'General Support',
    text: 'Have a question, suggestion or feedback? We\u2019re happy to help.',
    Icon: FaRegCommentDots,
  },
]

// Old links like ?subject=partner keep working
const SUBJECT_ALIASES = { partner: 'supplier', order: 'product', other: 'general' }

const inputCls =
  'w-full rounded-lg border border-[#14213a]/20 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#12305a] focus:ring-2 focus:ring-[#f5b800]/60'

const heroBtn =
  'inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-bold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white'

const ContactPage = () => {
  const sp = useSearchParams()
  const rawSubject = sp.get('subject')
  const mappedSubject = SUBJECT_ALIASES[rawSubject] || rawSubject
  const initialSubject = SUBJECTS.some((s) => s.key === mappedSubject) ? mappedSubject : 'product'
  const initialType = ENQUIRY_TYPES.some((t) => t.key === sp.get('type'))
    ? sp.get('type')
    : initialSubject === 'supplier'
      ? 'supplier'
      : 'customer'

  const formRef = useRef(null)
  const [form, setForm] = useState({
    type: initialType,
    name: '',
    phone: '',
    email: '',
    subject: initialSubject,
    message: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const scrollToForm = () => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  // Hero buttons use this: choose a category + topic, then jump to the form
  const openEnquiry = (type, subject) => {
    setDone(false)
    setForm((f) => ({ ...f, type, subject }))
    scrollToForm()
  }

  const pickSubject = (key) => {
    setForm((f) => ({ ...f, subject: key }))
    if (typeof window !== 'undefined' && window.innerWidth < 1024) scrollToForm()
  }

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.name.trim().length < 2) return setError('Please enter your name.')
    if (!/^[0-9]{10}$/.test(form.phone)) return setError('Please enter a valid 10 digit phone number.')
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) return setError('Please enter a valid email.')
    if (form.message.trim().length < 5) return setError('Please share a few details about your requirement.')

    const type = ENQUIRY_TYPES.find((t) => t.key === form.type)
    const subject = SUBJECTS.find((s) => s.key === form.subject)?.label || 'Other'
    const details = [`Enquiry type: ${type?.label}`, form.email && `Email: ${form.email}`, form.message.trim()]
      .filter(Boolean)
      .join(' | ')

    setLoading(true)
    try {
      // Admin panel "Service Quotes" shows e.g. "Contact - Contractor - Project Enquiries"
      await axios.post('/api/service-quote', {
        name: form.name.trim().slice(0, 60),
        phone: form.phone,
        serviceType: `Contact - ${type?.tag || 'Customer'} - ${subject}`.slice(0, 60),
        details: details.slice(0, 500),
      })
      setDone(true)
    } catch (err) {
      setError(err?.response?.data?.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f6f5f1] text-[#14213a]">
      {/* ───────────── Hero ───────────── */}
      <section className="relative overflow-hidden text-white" style={{ backgroundColor: BLUE }}>
        <div className="absolute inset-0" style={gridStyle} aria-hidden="true" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 md:py-24 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="text-sm font-medium text-white/70">Contact Us</p>

            <h1 className="mt-4 text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
              Get in Touch with ConstructEzy
            </h1>

            <p className="mt-5 text-xl font-semibold text-white/90">
              We&apos;re Here to Make Construction Easier.
            </p>

            <p className="mt-4 max-w-xl text-lg leading-8 text-white/80">
              Have a construction project in mind? Looking for building
              materials, skilled workers or specialised construction services?
            </p>

            {/* Four main actions */}
            <div className="mt-8 grid max-w-xl gap-3 sm:grid-cols-2">
              {WHATSAPP && (
                <a
                  href={`https://wa.me/${WHATSAPP}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${heroBtn} bg-[#25d366] text-[#06210f] hover:brightness-95`}
                >
                  <FaWhatsapp size={18} /> WhatsApp
                </a>
              )}
              {PHONE && (
                <a
                  href={`tel:${PHONE}`}
                  className={`${heroBtn} border-2 border-white/60 text-white hover:bg-white/10`}
                >
                  <FaPhoneAlt size={14} /> Call Us
                </a>
              )}
              <button
                type="button"
                onClick={() => openEnquiry('customer', 'product')}
                className={`${heroBtn} text-[#14213a] hover:brightness-95`}
                style={{ backgroundColor: YELLOW }}
              >
                <FaPaperPlane size={13} /> Submit an Enquiry
              </button>
              <button
                type="button"
                onClick={() => openEnquiry('supplier', 'supplier')}
                className={`${heroBtn} border-2 text-white hover:bg-white/10`}
                style={{ borderColor: YELLOW }}
              >
                <FaHandshake size={16} /> Become a Supplier / Service Partner
              </button>
            </div>
          </div>

          <div className="relative lg:ml-auto lg:w-full lg:max-w-sm">
            <div
              className="absolute -inset-2 translate-x-3 translate-y-3 rounded-lg"
              style={{ backgroundColor: YELLOW }}
              aria-hidden="true"
            />
            <div className="relative rounded-lg bg-white p-6 text-[#14213a] shadow-2xl">
              <p className="leading-7 text-gray-700">
                Whether you&apos;re a homeowner, contractor, builder, supplier
                or service provider, we&apos;d love to hear from you.
              </p>

              <ul className="mt-4 space-y-2">
                {ENQUIRY_TYPES.map(({ key, label, who, Icon }) => (
                  <li key={key} className="flex items-center gap-3 rounded-md bg-[#f6f5f1] px-3 py-2.5">
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[#14213a]"
                      style={{ backgroundColor: YELLOW }}
                    >
                      <Icon size={14} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-bold">{label}</span>
                      <span className="block text-xs text-gray-600">{who}</span>
                    </span>
                  </li>
                ))}
              </ul>

              <p className="mt-5 border-t-2 border-[#14213a] pt-4 text-lg font-bold">
                Let&apos;s Build Something Together!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── Body ───────────── */}
      <main className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:py-20 lg:grid-cols-[0.95fr_1.05fr] lg:gap-14">
        {/* Left: help topics + contact details */}
        <div className="space-y-12">
          <section>
            <h2 className="text-3xl font-bold leading-tight">How Can We Help You?</h2>

            <ul className="mt-6 space-y-3">
              {SUBJECTS.map(({ key, label, text, Icon }) => {
                const active = form.subject === key
                return (
                  <li key={key}>
                    <button
                      type="button"
                      onClick={() => pickSubject(key)}
                      aria-pressed={active}
                      className={`flex w-full items-start gap-4 rounded-xl border-2 p-4 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#12305a] ${
                        active
                          ? 'border-[#14213a] bg-white shadow-[4px_4px_0_0_#f5b800]'
                          : 'border-[#14213a]/15 bg-white hover:border-[#14213a]/50'
                      }`}
                    >
                      <span
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-[#14213a]"
                        style={{ backgroundColor: active ? YELLOW : '#f6f5f1' }}
                      >
                        <Icon size={18} />
                      </span>
                      <span className="min-w-0">
                        <span className="block font-bold">{label}</span>
                        <span className="mt-0.5 block text-sm leading-6 text-gray-600">{text}</span>
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </section>

          <section>
            <h2 className="text-3xl font-bold leading-tight">Reach Out to Us</h2>

            <div className="mt-6 divide-y divide-dashed divide-[#14213a]/25 rounded-xl border-2 border-[#14213a] bg-white">
              <div className="flex items-center gap-4 p-4">
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[#14213a]"
                  style={{ backgroundColor: YELLOW }}
                >
                  <FaEnvelope size={16} />
                </span>
                <div className="min-w-0">
                  <p className="text-sm text-gray-500">Email</p>
                  <a href={`mailto:${SUPPORT_EMAIL}`} className="break-words font-semibold hover:underline">
                    {SUPPORT_EMAIL}
                  </a>
                </div>
              </div>

              {(PHONE || WHATSAPP) && (
                <div className="flex items-center gap-4 p-4">
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[#14213a]"
                    style={{ backgroundColor: YELLOW }}
                  >
                    <FaPhoneAlt size={15} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm text-gray-500">Phone / WhatsApp</p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                      {PHONE && (
                        <a href={`tel:${PHONE}`} className="font-semibold hover:underline">
                          {PHONE}
                        </a>
                      )}
                      {WHATSAPP && (
                        <a
                          href={`https://wa.me/${WHATSAPP}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 hover:underline"
                        >
                          <FaWhatsapp size={15} /> Chat on WhatsApp
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4 p-4">
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[#14213a]"
                  style={{ backgroundColor: YELLOW }}
                >
                  <FaMapMarkerAlt size={16} />
                </span>
                <div className="min-w-0">
                  <p className="text-sm text-gray-500">Business Location</p>
                  <p className="font-semibold">Jaipur, Rajasthan, India</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right: enquiry form */}
        <div ref={formRef} className="scroll-mt-6 lg:sticky lg:top-6 lg:self-start">
          {done ? (
            <div className="rounded-xl border-2 border-[#14213a] bg-white px-6 py-14 text-center shadow-[6px_6px_0_0_#f5b800]">
              <FaCheckCircle className="mx-auto text-emerald-600" size={46} />
              <h2 className="mt-4 text-2xl font-bold">Message sent!</h2>
              <p className="mx-auto mt-2 max-w-sm text-gray-600">
                Thanks for reaching out. Our team will get in touch with you shortly.
              </p>
              <Link
                href={WEBSITE_HOME}
                className="mt-7 inline-block rounded-lg px-6 py-3 text-sm font-bold text-[#14213a] transition hover:brightness-95"
                style={{ backgroundColor: YELLOW }}
              >
                Back to Home
              </Link>
            </div>
          ) : (
            <form
              onSubmit={submit}
              noValidate
              className="rounded-xl border-2 border-[#14213a] bg-white p-6 shadow-[6px_6px_0_0_#f5b800] sm:p-8"
            >
              <h2 className="text-2xl font-bold">Send Us a Message</h2>
              <p className="mt-1 text-gray-600">
                Have a requirement? Share a few details and our team will get in touch with you.
              </p>

              {/* Enquiry category */}
              <fieldset className="mt-6">
                <legend className="mb-2 text-sm font-medium text-gray-700">I am a *</legend>
                <div className="grid gap-2 sm:grid-cols-3">
                  {ENQUIRY_TYPES.map(({ key, label, Icon }) => {
                    const active = form.type === key
                    return (
                      <button
                        key={key}
                        type="button"
                        aria-pressed={active}
                        onClick={() => setForm((f) => ({ ...f, type: key }))}
                        className={`flex items-center gap-2 rounded-lg border-2 px-3 py-2.5 text-left text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#12305a] ${
                          active
                            ? 'border-[#14213a] text-[#14213a]'
                            : 'border-[#14213a]/15 text-gray-600 hover:border-[#14213a]/50'
                        }`}
                        style={active ? { backgroundColor: YELLOW } : undefined}
                      >
                        <Icon size={14} className="shrink-0" />
                        {label}
                      </button>
                    )
                  })}
                </div>
              </fieldset>

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
                      <option key={s.key} value={s.key}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block sm:col-span-2">
                  <span className="mb-1.5 block text-sm font-medium text-gray-700">Your requirement *</span>
                  <textarea
                    className={`${inputCls} min-h-36 resize-y`}
                    value={form.message}
                    onChange={set('message')}
                    placeholder="Share a few details about your requirement."
                    maxLength={450}
                  />
                </label>
              </div>

              {error && (
                <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-600" role="alert">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-bold text-[#14213a] transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
                style={{ backgroundColor: YELLOW }}
              >
                <FaPaperPlane size={13} />
                {loading ? 'Sending…' : 'Submit Enquiry'}
              </button>
            </form>
          )}
        </div>
      </main>

      {/* ───────────── Closing tagline ───────────── */}
      <section className="relative overflow-hidden text-white" style={{ backgroundColor: BLUE }}>
        <div className="absolute inset-0" style={gridStyle} aria-hidden="true" />
        <div className="relative mx-auto max-w-4xl px-6 py-20 text-center">
          <h2 className="text-3xl font-extrabold leading-tight tracking-tight md:text-5xl">
            ConstructEzy — Your Construction Needs, All in One Place.
          </h2>
        </div>
      </section>
    </div>
  )
}

// useSearchParams needs a Suspense boundary in the Next.js App Router
const ContactUs = () => (
  <Suspense fallback={null}>
    <ContactPage />
  </Suspense>
)

export default ContactUs