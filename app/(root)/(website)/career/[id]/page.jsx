'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import axios from 'axios'
import {
  Home, ChevronRight, MapPin, Briefcase, BarChart3, Check, CloudUpload, FileText, X,
  Link2, ArrowRight, Loader2, Hash, CalendarDays, FileSearch, CalendarCheck, Users, BadgeCheck, Code2,
} from 'lucide-react'
import { WEBSITE_CAREERS, WEBSITE_HOME } from '@/routes/WebsiteRoute'
import { EXPERIENCE_OPTIONS, NOTICE_PERIODS, RESUME_MAX_BYTES, WHY_JOIN_MAX } from '@/lib/careers'

const EMPTY = {
  fullName: '', email: '', phone: '', location: '',
  experience: '', currentCompany: '', currentRole: '', noticePeriod: '',
  portfolioUrl: '', whyJoin: '',
}

const inputCls =
  'w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#0B8457] focus:ring-2 focus:ring-emerald-100 transition'

function Field({ label, required, optional, error, children }) {
  return (
    <label className="block">
      <span className="block text-sm font-semibold text-gray-800 mb-1.5">
        {label}
        {required && <span className="text-rose-500"> *</span>}
        {optional && <span className="font-normal text-gray-500"> (Optional)</span>}
      </span>
      {children}
      {error && <span className="block mt-1 text-xs text-rose-600">{error}</span>}
    </label>
  )
}

function SectionTitle({ children }) {
  return <h3 className="text-lg font-bold text-gray-900 mb-4">{children}</h3>
}

/* ─────────────── Success screen ─────────────── */
function Submitted({ result }) {
  const steps = [
    { Icon: FileSearch, title: 'Application Review', text: 'Our team will review your application and profile.' },
    { Icon: CalendarCheck, title: 'Initial Screening', text: "If shortlisted, we'll reach out for a brief conversation." },
    { Icon: Users, title: 'Interview(s)', text: 'Technical and/or functional rounds with our team.' },
    { Icon: BadgeCheck, title: 'Outcome', text: "We'll get back to you with the final update." },
  ]
  const when = new Date(result.submittedAt).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
  return (
    <div className="bg-linear-to-b from-emerald-50/60 to-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16 text-center">
        <div className="mx-auto w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center">
          <span className="w-16 h-16 rounded-full bg-[#0B8457] flex items-center justify-center">
            <Check size={36} strokeWidth={3} className="text-white" />
          </span>
        </div>
        <h1 className="mt-6 text-3xl sm:text-4xl font-bold">Application Submitted!</h1>
        <p className="mt-3 text-gray-600 max-w-2xl mx-auto">
          Thank you for applying to ConstructEzy. We&apos;ve received your application for the{' '}
          <span className="font-semibold text-gray-900">{result.jobTitle}</span> role and our team will review it shortly.
        </p>

        <div className="mt-8 grid sm:grid-cols-3 rounded-2xl border border-gray-200 bg-white text-left divide-y sm:divide-y-0 sm:divide-x divide-gray-200">
          {[
            { Icon: Briefcase, k: 'Role', v: result.jobTitle },
            { Icon: Hash, k: 'Application ID', v: result.code },
            { Icon: CalendarDays, k: 'Submitted On', v: when },
          ].map(({ Icon, k, v }) => (
            <div key={k} className="flex items-center gap-4 p-5">
              <span className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                <Icon size={22} className="text-[#0B8457]" />
              </span>
              <div className="min-w-0">
                <p className="text-sm text-gray-500">{k}</p>
                <p className="font-bold text-gray-900 wrap-break-word">{v}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-gray-500">Please save your Application ID for future reference.</p>

        <h2 className="mt-12 text-2xl font-bold">What&apos;s Next?</h2>
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map(({ Icon, title, text }, i) => (
            <div key={title} className="flex flex-col items-center">
              <span className={`w-16 h-16 rounded-full flex items-center justify-center ${i === 0 ? 'bg-[#0B8457] text-white' : 'bg-gray-100 text-gray-700'}`}>
                <Icon size={26} />
              </span>
              <p className="mt-3 font-bold">{title}</p>
              <p className="mt-1 text-sm text-gray-600 max-w-55">{text}</p>
            </div>
          ))}
        </div>

        <Link
          href={WEBSITE_CAREERS}
          className="mt-12 inline-flex items-center gap-2 rounded-lg bg-[#0B8457] hover:bg-[#086b47] text-white font-semibold px-10 py-3.5 transition-colors"
        >
          Back to Careers <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  )
}

/* ─────────────── Apply page ─────────────── */
export default function ApplyPage() {
  const { id } = useParams()
  const [job, setJob] = useState(null)
  const [loadErr, setLoadErr] = useState('')
  const [form, setForm] = useState(EMPTY)
  const [resume, setResume] = useState(null)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [serverErr, setServerErr] = useState('')
  const [result, setResult] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef(null)

  useEffect(() => {
    axios.get(`/api/careers/${id}`)
      .then(({ data }) => (data?.success ? setJob(data.data) : setLoadErr(data?.message || 'Job not found.')))
      .catch(() => setLoadErr('Could not load this job.'))
  }, [id])

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }))
    if (errors[k]) setErrors((er) => ({ ...er, [k]: '' }))
  }

  const pickFile = (file) => {
    if (!file) return
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setErrors((er) => ({ ...er, resume: 'Only PDF files are allowed.' })); return
    }
    if (file.size > RESUME_MAX_BYTES) {
      setErrors((er) => ({ ...er, resume: 'Resume must be under 5 MB.' })); return
    }
    setResume(file)
    setErrors((er) => ({ ...er, resume: '' }))
  }

  const validate = () => {
    const e = {}
    if (form.fullName.trim().length < 2) e.fullName = 'Please enter your full name.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = 'Enter a valid email address.'
    if (!/^[6-9]\d{9}$/.test(form.phone)) e.phone = 'Enter a valid 10-digit mobile number.'
    if (!form.location.trim()) e.location = 'Please enter your current location.'
    if (!form.experience) e.experience = 'Please select your experience.'
    if (!form.noticePeriod) e.noticePeriod = 'Please select your notice period.'
    if (!resume) e.resume = 'Please upload your resume (PDF).'
    if (form.portfolioUrl && !/^https?:\/\/\S+$/i.test(form.portfolioUrl.trim())) e.portfolioUrl = 'Link must start with http:// or https://'
    if (form.whyJoin.trim().length < 10) e.whyJoin = 'Please write at least a few words.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = async (ev) => {
    ev.preventDefault()
    setServerErr('')
    if (!validate()) {
      document.querySelector('[data-err="1"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    setSubmitting(true)
    try {
      const fd = new FormData()
      fd.append('jobId', id)
      Object.entries(form).forEach(([k, v]) => fd.append(k, v.trim()))
      fd.append('resume', resume)
      const { data } = await axios.post('/api/careers/apply', fd)
      if (data?.success) {
        setResult(data.data)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        setServerErr(data?.message || 'Could not submit. Please try again.')
      }
    } catch (e) {
      setServerErr(e?.response?.data?.message || 'Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (result) return <Submitted result={result} />

  if (loadErr) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <Briefcase className="mx-auto text-gray-400" size={36} />
        <p className="mt-4 text-xl font-bold">{loadErr}</p>
        <Link href={WEBSITE_CAREERS} className="mt-6 inline-flex items-center gap-2 font-semibold text-[#0B8457]">
          See all open roles <ArrowRight size={16} />
        </Link>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="flex items-center justify-center py-40 text-gray-500">
        <Loader2 className="animate-spin mr-2" size={20} /> Loading…
      </div>
    )
  }

  const errAttr = (k) => (errors[k] ? { 'data-err': '1' } : {})

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-600 mb-6 flex-wrap">
          <Link href={WEBSITE_HOME} aria-label="Home"><Home size={16} /></Link>
          <ChevronRight size={14} />
          <Link href={WEBSITE_CAREERS} className="hover:text-[#0B8457]">Careers</Link>
          <ChevronRight size={14} />
          <span className="truncate max-w-50">{job.title}</span>
          <ChevronRight size={14} />
          <span className="font-semibold text-gray-900">Apply</span>
        </nav>

        <div className="grid lg:grid-cols-[380px_1fr] gap-8 items-start">
          {/* ─── Job card ─── */}
          <aside className="rounded-2xl border border-gray-200 p-6 lg:sticky lg:top-28">
            <span className="w-16 h-16 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Code2 size={30} className="text-[#0B8457]" />
            </span>
            <h2 className="mt-4 text-2xl font-bold">{job.title}</h2>
            <p className="text-gray-600 mt-1">{job.department} · {job.employmentType}</p>
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-700">
              {job.location && <span className="flex items-center gap-1.5"><MapPin size={15} />{job.location}</span>}
              <span className="flex items-center gap-1.5"><Briefcase size={15} />{job.employmentType}</span>
              {job.experience && <span className="flex items-center gap-1.5"><BarChart3 size={15} />{job.experience}</span>}
            </div>

            {job.about && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="font-bold">About the Role</p>
                <p className="mt-2 text-sm text-gray-600 leading-6 whitespace-pre-line">{job.about}</p>
              </div>
            )}

            {job.responsibilities?.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="font-bold">Key Responsibilities</p>
                <ul className="mt-3 space-y-2">
                  {job.responsibilities.map((r) => (
                    <li key={r} className="flex gap-2 text-sm text-gray-700">
                      <Check size={16} className="text-[#0B8457] shrink-0 mt-0.5" />{r}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {job.skills?.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="font-bold">Required Skills</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {job.skills.map((s) => (
                    <span key={s} className="rounded-full border border-gray-300 px-3 py-1 text-sm text-gray-700">{s}</span>
                  ))}
                </div>
              </div>
            )}
          </aside>

          {/* ─── Form ─── */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Apply for {job.title}</h1>
            <p className="text-gray-600 mt-1">Tell us about yourself and why you&apos;re a great fit for ConstructEzy.</p>

            <form onSubmit={submit} noValidate className="mt-6 rounded-2xl border border-gray-200 p-5 sm:p-7 space-y-8">
              {/* Personal */}
              <section>
                <SectionTitle>Personal Information</SectionTitle>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div {...errAttr('fullName')}>
                    <Field label="Full Name" required error={errors.fullName}>
                      <input className={inputCls} value={form.fullName} onChange={set('fullName')} placeholder="Enter your full name" maxLength={100} autoComplete="name" />
                    </Field>
                  </div>
                  <div {...errAttr('email')}>
                    <Field label="Email Address" required error={errors.email}>
                      <input type="email" className={inputCls} value={form.email} onChange={set('email')} placeholder="you@email.com" maxLength={150} autoComplete="email" />
                    </Field>
                  </div>
                  <div {...errAttr('phone')}>
                    <Field label="Phone Number" required error={errors.phone}>
                      <div className="flex gap-2">
                        <span className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 text-sm font-medium text-gray-800 shrink-0">🇮🇳 +91</span>
                        <input
                          inputMode="numeric"
                          className={inputCls}
                          value={form.phone}
                          onChange={(e) => { setForm((f) => ({ ...f, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })); setErrors((er) => ({ ...er, phone: '' })) }}
                          placeholder="Enter mobile number"
                          autoComplete="tel-national"
                        />
                      </div>
                    </Field>
                  </div>
                  <div {...errAttr('location')}>
                    <Field label="Location (Current)" required error={errors.location}>
                      <input className={inputCls} value={form.location} onChange={set('location')} placeholder="e.g., Jaipur, Delhi NCR" maxLength={120} />
                    </Field>
                  </div>
                </div>
              </section>

              {/* Professional */}
              <section className="pt-6 border-t border-gray-200">
                <SectionTitle>Professional Information</SectionTitle>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div {...errAttr('experience')}>
                    <Field label="Total Experience" required error={errors.experience}>
                      <select className={inputCls} value={form.experience} onChange={set('experience')}>
                        <option value="">Select experience</option>
                        {EXPERIENCE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </Field>
                  </div>
                  <Field label="Current / Last Company">
                    <input className={inputCls} value={form.currentCompany} onChange={set('currentCompany')} placeholder="Enter company name" maxLength={120} />
                  </Field>
                  <Field label="Current Role / Designation">
                    <input className={inputCls} value={form.currentRole} onChange={set('currentRole')} placeholder="Enter your designation" maxLength={120} />
                  </Field>
                  <div {...errAttr('noticePeriod')}>
                    <Field label="Notice Period" required error={errors.noticePeriod}>
                      <select className={inputCls} value={form.noticePeriod} onChange={set('noticePeriod')}>
                        <option value="">Select notice period</option>
                        {NOTICE_PERIODS.map((o) => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </Field>
                  </div>
                </div>
              </section>

              {/* Resume */}
              <section className="pt-6 border-t border-gray-200">
                <SectionTitle>Resume &amp; Links</SectionTitle>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div {...errAttr('resume')}>
                    <span className="block text-sm font-semibold text-gray-800 mb-1.5">Upload Resume <span className="text-rose-500">*</span></span>
                    <input ref={fileRef} type="file" accept="application/pdf,.pdf" className="hidden" onChange={(e) => { pickFile(e.target.files?.[0]); e.target.value = '' }} />
                    {resume ? (
                      <div className="flex items-center gap-3 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-3">
                        <FileText size={22} className="text-[#0B8457] shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{resume.name}</p>
                          <p className="text-xs text-gray-500">{(resume.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                        <button type="button" onClick={() => setResume(null)} className="p-1 text-gray-500 hover:text-rose-600 cursor-pointer" aria-label="Remove resume">
                          <X size={18} />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={(e) => { e.preventDefault(); setDragOver(false); pickFile(e.dataTransfer.files?.[0]) }}
                        className={`w-full flex items-center gap-4 rounded-lg border-2 border-dashed px-4 py-5 text-left cursor-pointer transition-colors ${
                          dragOver ? 'border-[#0B8457] bg-emerald-50' : errors.resume ? 'border-rose-300' : 'border-gray-300 hover:border-[#0B8457]'
                        }`}
                      >
                        <CloudUpload size={28} className="text-[#0B8457] shrink-0" />
                        <span className="text-sm">
                          <span className="text-gray-700">Drag &amp; drop your resume here or</span>{' '}
                          <span className="font-semibold text-[#0B8457]">Browse File</span>
                          <span className="block text-xs text-gray-500 mt-0.5">PDF only, max 5 MB</span>
                        </span>
                      </button>
                    )}
                    {errors.resume && <span className="block mt-1 text-xs text-rose-600">{errors.resume}</span>}
                  </div>
                  <div {...errAttr('portfolioUrl')}>
                    <Field label="Portfolio / GitHub / LinkedIn" optional error={errors.portfolioUrl}>
                      <div className="relative">
                        <Link2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input className={`${inputCls} pl-9`} value={form.portfolioUrl} onChange={set('portfolioUrl')} placeholder="https://linkedin.com/in/your-profile" maxLength={300} />
                      </div>
                    </Field>
                  </div>
                </div>
              </section>

              {/* Additional */}
              <section className="pt-6 border-t border-gray-200">
                <SectionTitle>Additional Information</SectionTitle>
                <div {...errAttr('whyJoin')}>
                  <Field label="Why do you want to work at ConstructEzy?" required error={errors.whyJoin}>
                    <div className="relative">
                      <textarea
                        rows={4}
                        className={`${inputCls} resize-none pb-6`}
                        value={form.whyJoin}
                        onChange={set('whyJoin')}
                        maxLength={WHY_JOIN_MAX}
                        placeholder="Tell us in a few lines…"
                      />
                      <span className="absolute right-3 bottom-2.5 text-xs text-gray-500">{form.whyJoin.length} / {WHY_JOIN_MAX}</span>
                    </div>
                  </Field>
                </div>
              </section>

              {serverErr && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{serverErr}</div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-[#0B8457] hover:bg-[#086b47] disabled:opacity-70 text-white font-semibold px-10 py-3.5 cursor-pointer transition-colors"
              >
                {submitting ? <><Loader2 size={18} className="animate-spin" /> Submitting…</> : <>Submit Application <ArrowRight size={18} /></>}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
