'use client'

import { useState } from 'react'
import Link from 'next/link'
import axios from 'axios'
import {
  ArrowRight, BadgeCheck, Building2, CheckCircle2, ChevronRight, ClipboardList, Hammer,
  Home, Layers, Loader2, MapPin, MoreHorizontal, Phone, PhoneCall, ShieldCheck, User,
  Users, Wrench, Zap,
} from 'lucide-react'
import { showToast } from '@/lib/showToast'
import { IMAGES } from '@/routes/AllImages'

const PROJECT_TYPES = [
  { value: 'New Construction', label: ['New', 'Construction'], icon: Building2 },
  { value: 'Renovation / Remodelling', label: ['Renovation /', 'Remodelling'], icon: Home },
  { value: 'Repair & Maintenance', label: ['Repair &', 'Maintenance'], icon: Wrench },
  { value: 'Other', label: ['Other'], icon: MoreHorizontal },
]

const HERO_BADGES = [
  { label: 'Verified Partners', icon: ShieldCheck },
  { label: 'Expert Consultation', icon: Zap },
  { label: 'Multiple Quotes', icon: Layers },
]

const STEPS = [
  { title: 'Submit Enquiry', text: 'Share your project requirement with us.', icon: ClipboardList },
  { title: 'Call Discussion', text: 'Our team will call you to understand your requirement in detail.', icon: PhoneCall },
  { title: 'Get Quotes', text: 'Receive customised quotes from verified partners.', icon: Users },
  { title: 'Discuss & Finalise', text: 'Compare, discuss and choose the best partner.', icon: CheckCircle2 },
]

const WHY = [
  'Verified suppliers & service providers',
  'End-to-end project support',
  'Competitive & transparent pricing',
]

const EMPTY = { projectType: 'New Construction', requirement: '', location: '', name: '', phone: '' }

const inputBox =
  'flex items-center gap-3 rounded-xl border border-slate-300 bg-white px-3.5 focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-600/20'

export default function ProjectEnquiryPage() {
  const [form, setForm] = useState(EMPTY)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.requirement.trim().length < 10) return showToast('error', 'Please describe your requirement (min 10 characters).')
    if (form.location.trim().length < 3) return showToast('error', 'Please enter the project location.')
    if (form.name.trim().length < 2) return showToast('error', 'Please enter your name.')
    if (!/^[6-9]\d{9}$/.test(form.phone)) return showToast('error', 'Enter a valid 10-digit mobile number.')

    setSubmitting(true)
    try {
      const { data } = await axios.post('/api/project-enquiry', form)
      if (!data?.success) throw new Error(data?.message)
      showToast('success', data.message)
      setForm(EMPTY)
      setDone(true)
    } catch (err) {
      showToast('error', err?.response?.data?.message || err.message || 'Could not submit enquiry.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-slate-50 pb-12">
      {/* ───────────── HERO ───────────── */}
      <section className="relative overflow-hidden bg-linear-to-r from-[#0b2a3a] via-[#0d3b3a] to-[#0b5a3e]">
        <img
          src={IMAGES.projectEnquiry}
          alt=""
          aria-hidden="true"
          className="absolute inset-y-0 right-0 hidden h-full w-1/2 object-cover opacity-25 md:block"
        />
        <div className="absolute inset-0 bg-linear-to-r from-[#0b2a3a] via-[#0b2a3a]/80 to-transparent" />

        <div className="relative mx-auto max-w-7xl px-4 pb-24 pt-6 sm:px-6 lg:px-8 lg:pb-28">
          <nav className="flex items-center gap-1.5 text-sm text-white/80">
            <Link href="/" className="hover:text-white">Home</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-white">Project Enquiry</span>
          </nav>

          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
            Project <span className="text-emerald-400">Enquiry</span>
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-white/85 sm:text-lg">
            Share your construction or renovation requirement and our team will connect you with the
            right suppliers, service providers and experts.
          </p>

          <ul className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
            {HERO_BADGES.map(({ label, icon: Icon }) => (
              <li key={label} className="flex items-center gap-2.5 text-sm font-medium text-white">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600">
                  <Icon className="h-4.5 w-4.5" />
                </span>
                {label}
              </li>
            ))}
            <li className="flex items-center gap-2.5 rounded-full border-2 border-emerald-500 bg-[#0b2a3a]/60 py-1.5 pe-5 ps-2 text-white">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600">
                <BadgeCheck className="h-4.5 w-4.5" />
              </span>
              <span className="leading-tight">
                <span className="block text-sm font-semibold">1 Year Free Service</span>
                <span className="block text-[11px] text-white/80">After Project Completion</span>
              </span>
            </li>
          </ul>
        </div>
      </section>

      {/* ───────────── CONTENT ───────────── */}
      <div className="relative z-10 mx-auto -mt-16 grid max-w-7xl grid-cols-1 gap-6 px-4 sm:px-6 lg:grid-cols-[1.15fr_1fr] lg:px-8">
        {/* FORM */}
        <section className="h-fit rounded-2xl bg-white p-5 shadow-lg ring-1 ring-black/5 sm:p-8">
          <h2 className="text-2xl font-extrabold text-[#0b1b3f] sm:text-3xl">Submit Your Project Enquiry</h2>
          <p className="mt-1.5 text-sm text-slate-600 sm:text-base">
            Tell us your requirement and we&apos;ll get in touch with you shortly.
          </p>

          {done ? (
            <div className="mt-8 flex flex-col items-center rounded-2xl bg-emerald-50 px-6 py-10 text-center">
              <CheckCircle2 className="h-14 w-14 text-emerald-600" />
              <h3 className="mt-3 text-xl font-bold text-[#0b1b3f]">Enquiry Submitted!</h3>
              <p className="mt-1 text-sm text-slate-600">Our team will call you shortly to discuss your project.</p>
              <button
                type="button"
                onClick={() => setDone(false)}
                className="mt-5 rounded-lg border border-emerald-600 px-5 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100"
              >
                Submit another enquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              {/* Project type */}
              <div>
                <p className="mb-2 text-sm font-semibold text-[#0b1b3f]">
                  Project Type <span className="text-red-500">*</span>
                </p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {PROJECT_TYPES.map(({ value, label, icon: Icon }) => {
                    const active = form.projectType === value
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, projectType: value }))}
                        aria-pressed={active}
                        className={`flex min-h-24 flex-col items-center justify-center gap-1.5 rounded-xl border px-2 py-3 text-center text-sm leading-tight transition ${
                          active
                            ? 'border-emerald-600 bg-emerald-50 text-[#0b1b3f] ring-1 ring-emerald-600'
                            : 'border-slate-200 text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/40'
                        }`}
                      >
                        <Icon className={`h-6 w-6 ${active ? 'text-emerald-600' : 'text-slate-700'}`} />
                        <span>
                          {label.map((l) => (
                            <span key={l} className="block">{l}</span>
                          ))}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Requirement */}
              <div>
                <label htmlFor="pe-req" className="mb-2 block text-sm font-semibold text-[#0b1b3f]">
                  Project Requirement <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="pe-req"
                  rows={4}
                  maxLength={1000}
                  value={form.requirement}
                  onChange={set('requirement')}
                  placeholder="Describe your requirement (e.g. build a house, home renovation, plumbing work, interior, etc.)"
                  className="w-full resize-y rounded-xl border border-slate-300 px-3.5 py-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                />
              </div>

              {/* Location */}
              <div>
                <label htmlFor="pe-loc" className="mb-2 block text-sm font-semibold text-[#0b1b3f]">
                  Project Location <span className="text-red-500">*</span>
                </label>
                <div className={inputBox}>
                  <MapPin className="h-4.5 w-4.5 shrink-0 text-slate-500" />
                  <input
                    id="pe-loc"
                    value={form.location}
                    onChange={set('location')}
                    maxLength={150}
                    placeholder="Enter project location (e.g. Mansarovar, Jaipur)"
                    className="w-full bg-transparent py-3 text-sm outline-none"
                  />
                </div>
              </div>

              {/* Name + phone */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="pe-name" className="mb-2 block text-sm font-semibold text-[#0b1b3f]">
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <div className={inputBox}>
                    <User className="h-4.5 w-4.5 shrink-0 text-slate-500" />
                    <input
                      id="pe-name"
                      value={form.name}
                      onChange={set('name')}
                      maxLength={60}
                      autoComplete="name"
                      placeholder="Enter your name"
                      className="w-full bg-transparent py-3 text-sm outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="pe-phone" className="mb-2 block text-sm font-semibold text-[#0b1b3f]">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <div className={inputBox}>
                    <Phone className="h-4.5 w-4.5 shrink-0 text-slate-500" />
                    <input
                      id="pe-phone"
                      value={form.phone}
                      onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                      inputMode="numeric"
                      autoComplete="tel"
                      placeholder="Enter 10-digit mobile number"
                      className="w-full bg-transparent py-3 text-sm outline-none"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 py-3.5 text-base font-semibold text-white shadow-md transition hover:bg-emerald-800 disabled:opacity-60"
              >
                {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
                {submitting ? 'Submitting…' : 'Submit Enquiry'}
                {!submitting && <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />}
              </button>
            </form>
          )}
        </section>

        {/* RIGHT COLUMN */}
        <aside className="space-y-5">
          {/* Planning card */}
          <div className="flex items-center gap-4 overflow-hidden rounded-2xl bg-linear-to-r from-emerald-100 to-emerald-50 p-5 shadow-sm ring-1 ring-emerald-100">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white text-emerald-700 shadow-sm">
              <Hammer className="h-8 w-8" />
            </span>
            <div>
              <h3 className="text-xl font-extrabold leading-tight text-[#0b1b3f] sm:text-2xl">
                Planning a Construction Project?
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                From materials to labour to complete project execution — we&apos;ve got you covered.
              </p>
            </div>
          </div>

          {/* How it works */}
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
            <h3 className="text-xl font-extrabold text-[#0b1b3f]">How It Works?</h3>
            <ol className="mt-4 grid grid-cols-2 gap-5 sm:grid-cols-4">
              {STEPS.map(({ title, text, icon: Icon }, i) => (
                <li key={title} className="flex flex-col items-center text-center">
                  <Icon className="h-8 w-8 text-emerald-600" />
                  <span className="mt-2 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
                    {i + 1}
                  </span>
                  <p className="mt-2 text-sm font-semibold text-[#0b1b3f]">{title}</p>
                  <p className="mt-0.5 text-[11px] leading-snug text-slate-600">{text}</p>
                </li>
              ))}
            </ol>
          </div>

          {/* 1 year free service */}
          <div className="flex items-center gap-4 rounded-2xl bg-emerald-50 p-5 ring-1 ring-emerald-100">
            <BadgeCheck className="h-14 w-14 shrink-0 text-emerald-600" />
            <div className="border-l-2 border-emerald-600 ps-4">
              <h3 className="text-xl font-extrabold text-[#0b1b3f]">1 Year Free Service</h3>
              <p className="mt-0.5 text-sm text-slate-600">
                Get 1 year of free service and maintenance support after project completion.
              </p>
            </div>
          </div>

          {/* Why choose */}
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
            <h3 className="text-xl font-extrabold text-[#0b1b3f]">Why Choose ConstructEzy?</h3>
            <ul className="mt-3 space-y-2.5">
              {WHY.map((w) => (
                <li key={w} className="flex items-center gap-2.5 text-sm text-slate-700">
                  <CheckCircle2 className="h-5 w-5 shrink-0 fill-emerald-600 text-white" />
                  {w}
                </li>
              ))}
              <li className="flex w-fit items-center gap-2.5 rounded-full bg-emerald-100 py-1 pe-4 ps-1 text-sm font-semibold text-emerald-800">
                <CheckCircle2 className="h-5 w-5 shrink-0 fill-emerald-600 text-white" />
                1 Year free service after project completion
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  )
}
