'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { FaSearch, FaTimes, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaStar, FaBriefcase, FaCheckCircle, FaIdCard, FaUniversity, FaFileAlt, FaSyncAlt } from 'react-icons/fa'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { ADMIN_DASHBOARD } from '@/routes/AdminPanelRoute'
import { ADMIN_REGISTERED_LABOURS } from '@/routes/ServiceRoute'

// READ-ONLY: register wale labour ka system chhedta nahi. Data: /api/admin/registered-labours
const PAGE = 10
const FILTERS = [['all', 'All'], ['approved', 'Approved'], ['pending', 'Pending'], ['rejected', 'Rejected'], ['incomplete', 'Incomplete profile']]
const TONE = { ok: 'bg-green-100 text-green-700', bad: 'bg-red-100 text-red-700', wait: 'bg-yellow-100 text-yellow-700', na: 'bg-gray-100 text-gray-600' }
const Chip = ({ t, tone }) => <span className={`whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${TONE[tone]}`}>{String(t).replace(/_/g, ' ')}</span>
const toneOf = (s) => (s === 'approved' ? 'ok' : s === 'rejected' ? 'bad' : s === 'not_required' ? 'na' : 'wait')

const SKIP = new Set(['_id', '__v', 'owner', 'user', 'partner', 'userId', 'partnerId', 'createdAt', 'updatedAt'])
const pretty = (k) => k.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[_-]/g, ' ').replace(/^./, (c) => c.toUpperCase())
const urlOf = (v) => (typeof v === 'string' && /^(https?:)?\/\/|^\//.test(v) ? v : v && typeof v === 'object' && typeof v.url === 'string' ? v.url : null)
const mask = (a) => (a ? `XXXX XXXX ${String(a).slice(-4)}` : '')

// documents/bank ka structure alag ho sakta hai, isliye jo bhi fields hain unhe generic dikhate hain
const splitFields = (obj) => {
  const files = [], texts = []
  Object.entries(obj || {}).forEach(([k, v]) => {
    if (SKIP.has(k) || v === null || v === '' || v === undefined) return
    const u = urlOf(v)
    if (u) files.push([pretty(k), u])
    else if (typeof v !== 'object') texts.push([pretty(k), String(v)])
  })
  return { files, texts }
}

const FileTile = ({ label, url }) => {
  const [bad, setBad] = useState(false)
  return (
    <a href={url} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-lg border bg-gray-50 hover:shadow">
      {!bad ? <img src={url} alt={label} onError={() => setBad(true)} className="h-24 w-full object-cover" /> : <div className="flex h-24 items-center justify-center text-gray-400"><FaFileAlt size={22} /></div>}
      <p className="truncate px-2 py-1.5 text-center text-[11px] font-medium text-gray-600">{label}</p>
    </a>
  )
}

const Section = ({ icon: I, title, children }) => (
  <section className="rounded-xl border border-gray-200 p-4">
    <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800"><I className="text-orange-500" size={13} />{title}</h4>{children}
  </section>
)
const Field = ({ k, v }) => (v === undefined || v === null || v === '' || v === false) ? null : <div><dt className="text-xs text-gray-500">{k}</dt><dd className="break-words text-sm font-medium">{v}</dd></div>

const Avatar = ({ r, size = 40 }) => r.image
  ? <img src={r.image} alt="" style={{ width: size, height: size }} className="rounded-full border object-cover" />
  : <span style={{ width: size, height: size }} className="flex shrink-0 items-center justify-center rounded-full bg-orange-100 font-semibold text-orange-600">{(r.name || '?')[0]?.toUpperCase()}</span>

const RegisteredLabours = () => {
  const [rows, setRows] = useState([])
  const [debug, setDebug] = useState(null)
  const [state, setState] = useState('loading')
  const [err, setErr] = useState('')
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState('all')
  const [page, setPage] = useState(0)
  const [open, setOpen] = useState(null)

  const load = useCallback(async () => {
    setState('loading'); setErr('')
    try {
      const { data } = await axios.get('/api/admin/registered-labours', { params: { size: 500 }, timeout: 30000 })
      if (data.success === false) throw new Error(data.message)
      setRows(data.data || []); setDebug(data.meta?.debug || null); setState('ok')
    } catch (e) { setErr(e?.response?.data?.message || e.message); setState('error') }
  }, [])
  useEffect(() => { load() }, [load])
  useEffect(() => { setPage(0) }, [q, filter])
  useEffect(() => { const k = (e) => e.key === 'Escape' && setOpen(null); window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k) }, [])

  const stat = (r) => (!r.hasProfile ? 'incomplete' : r.status)
  const counts = useMemo(() => Object.fromEntries(FILTERS.map(([k]) => [k, k === 'all' ? rows.length : rows.filter((r) => stat(r) === k).length])), [rows])
  const list = useMemo(() => rows.filter((r) => filter === 'all' || stat(r) === filter)
    .filter((r) => !q || `${r.name} ${r.phone} ${r.email} ${r.category} ${r.address}`.toLowerCase().includes(q.toLowerCase())), [rows, filter, q])
  const pages = Math.max(1, Math.ceil(list.length / PAGE))
  const view = list.slice(page * PAGE, page * PAGE + PAGE)

  const docs = open ? splitFields(open.docs) : { files: [], texts: [] }
  const bank = open ? splitFields(open.bank) : { files: [], texts: [] }

  return (
    <div>
      <BreadCrumb breadcrumbData={[{ href: ADMIN_DASHBOARD, label: 'Home' }, { href: ADMIN_REGISTERED_LABOURS, label: 'Registered Labours' }]} />
      <div className="py-4">
        <Card className="py-0 rounded-3xl shadow-sm gap-0">
          <CardHeader className="pt-3 px-3 border-b [.border-b]:pb-2">
            <div className="flex items-center justify-between gap-3"><h4 className="text-xl font-semibold">Registered Labours <span className="text-sm font-normal text-gray-500">({rows.length})</span></h4>
              <button onClick={load} className="flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-gray-50"><FaSyncAlt size={11} />Refresh</button></div>
          </CardHeader>
          <CardContent className="pb-5 px-0 pt-4">
            <div className="flex flex-wrap items-center gap-3 px-4 pb-3">
              <div className="relative"><FaSearch size={12} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, phone, email, category" className="w-72 max-w-full rounded-lg border border-gray-300 py-2 pl-8 pr-3 text-sm outline-none focus:border-orange-400" /></div>
              <div className="flex flex-wrap gap-1.5">{FILTERS.map(([k, l]) => <button key={k} onClick={() => setFilter(k)} className={`rounded-full px-3 py-1 text-xs font-medium ${filter === k ? 'bg-orange-500 text-white' : 'border bg-white text-gray-600 hover:bg-gray-50'}`}>{l} ({counts[k]})</button>)}</div>
            </div>

            {state === 'loading' && <div className="space-y-2 px-4">{[1, 2, 3].map((i) => <div key={i} className="h-14 animate-pulse rounded-lg bg-gray-100" />)}</div>}
            {state === 'error' && <div className="mx-4 rounded-lg bg-red-50 p-4 text-sm text-red-600">{err} <button onClick={load} className="ml-2 font-semibold underline">Retry</button></div>}

            {state === 'ok' && !rows.length && (
              <div className="mx-4 rounded-xl border border-dashed p-6 text-sm text-gray-600">
                <p className="font-semibold text-gray-800">Koi registered labour nahi mila.</p>
                {debug && <>
                  <p className="mt-2">Database me users role ke hisaab se: <b>{Object.entries(debug.roles).map(([r, n]) => `${r}: ${n}`).join(', ') || 'koi user nahi'}</b></p>
                  <p>Labour profiles: <b>{debug.labourProfiles}</b> · Partner documents: <b>{debug.partnerDocs}</b> · Bank records: <b>{debug.partnerBanks}</b></p>
                  <p className="mt-2 text-xs text-gray-500">Agar yahan "laber" role ke users hain par list khali hai, to ye number mujhe bhej do. Agar labour kisi aur role ke naam se hain (jaise "labour"), to wo role bhi bata do.</p>
                </>}
              </div>
            )}

            {state === 'ok' && rows.length > 0 && (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500"><tr>{['Labour', 'Category', 'Rate', 'Exp.', 'Profile', 'Approval', 'Video KYC', 'Registered', ''].map((h) => <th key={h} className="whitespace-nowrap px-4 py-2.5 font-semibold">{h}</th>)}</tr></thead>
                    <tbody className="divide-y">
                      {view.map((r) => (
                        <tr key={r._id} onClick={() => setOpen(r)} className="cursor-pointer align-middle hover:bg-orange-50/40">
                          <td className="px-4 py-3"><div className="flex items-center gap-3"><Avatar r={r} /><div className="min-w-0"><p className="font-medium">{r.name}</p><p className="text-xs text-gray-500">{r.phone || r.email}</p></div></div></td>
                          <td className="px-4 py-3 capitalize">{r.category || '—'}</td>
                          <td className="whitespace-nowrap px-4 py-3">{[r.pricePerHour && `₹${r.pricePerHour}/hr`, r.pricePerDay && `₹${r.pricePerDay}/day`].filter(Boolean).join(' · ') || '—'}</td>
                          <td className="whitespace-nowrap px-4 py-3">{r.experienceYears || 0} yr</td>
                          <td className="px-4 py-3">{r.hasProfile ? <Chip t="complete" tone="ok" /> : <Chip t={`step ${r.onboardingStep}/8`} tone="wait" />}</td>
                          <td className="px-4 py-3"><Chip t={r.status} tone={toneOf(r.status)} /></td>
                          <td className="px-4 py-3"><Chip t={r.videoKycStatus} tone={toneOf(r.videoKycStatus)} /></td>
                          <td className="whitespace-nowrap px-4 py-3">{new Date(r.createdAt).toLocaleDateString('en-IN')}</td>
                          <td className="px-4 py-3"><span className="rounded border px-2 py-1 text-xs">View details</span></td>
                        </tr>))}
                      {!view.length && <tr><td colSpan={9} className="px-4 py-10 text-center text-gray-400">Is filter me koi labour nahi.</td></tr>}
                    </tbody>
                  </table>
                </div>
                <div className="flex items-center justify-between px-4 pt-3 text-sm text-gray-500"><span>{list.length} labour</span>
                  <div className="flex items-center gap-2"><button disabled={page === 0} onClick={() => setPage((p) => p - 1)} className="rounded border px-3 py-1 disabled:opacity-40">Prev</button><span>{page + 1} / {pages}</span><button disabled={page + 1 >= pages} onClick={() => setPage((p) => p + 1)} className="rounded border px-3 py-1 disabled:opacity-40">Next</button></div></div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ============ DETAILS PANEL ============ */}
      {open && (
        <div className="fixed inset-0 z-[60] flex justify-end bg-black/50" onClick={() => setOpen(null)}>
          <div className="h-full w-full max-w-2xl overflow-y-auto bg-white p-5 dark:bg-stone-900" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Labour details">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="flex items-center gap-4"><Avatar r={open} size={64} />
                <div><h3 className="text-xl font-bold">{open.name}</h3><p className="text-sm capitalize text-gray-500">{open.category || 'Category not set'}{open.experienceYears > 0 && ` · ${open.experienceYears} yrs experience`}</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5"><Chip t={open.status} tone={toneOf(open.status)} />{open.hasProfile ? <Chip t="profile complete" tone="ok" /> : <Chip t={`onboarding ${open.onboardingStep}/8`} tone="wait" />}<Chip t={`KYC ${open.videoKycStatus}`} tone={toneOf(open.videoKycStatus)} />{open.isBlocked && <Chip t="blocked" tone="bad" />}</div></div></div>
              <button onClick={() => setOpen(null)} aria-label="Close" className="rounded-full p-2 hover:bg-gray-100"><FaTimes /></button>
            </div>

            {open.rejectionReason && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">Rejection reason: {open.rejectionReason}</p>}
            {!open.hasProfile && <p className="mb-4 rounded-lg bg-yellow-50 px-3 py-2 text-xs text-yellow-700">Onboarding adhoori hai (step {open.onboardingStep}/8). Profile details poori hone par yahan aayengi.</p>}

            <div className="space-y-4">
              <Section icon={FaPhoneAlt} title="Contact"><dl className="grid gap-3 sm:grid-cols-2">
                <Field k="Phone" v={open.phone && <a className="text-blue-600" href={`tel:${open.phone}`}>{open.phone}</a>} />
                <Field k="Email" v={open.email && <a className="text-blue-600" href={`mailto:${open.email}`}>{open.email}</a>} />
                <Field k="Email verified" v={open.isEmailVerified ? 'Yes' : 'No'} /><Field k="Registered on" v={new Date(open.createdAt).toLocaleString('en-IN')} />
                <div className="sm:col-span-2"><Field k="Address" v={open.address} /></div></dl></Section>

              <Section icon={FaBriefcase} title="Work & pricing"><dl className="grid gap-3 sm:grid-cols-2">
                <Field k="Category" v={open.category} /><Field k="Experience" v={`${open.experienceYears || 0} years`} /><Field k="Rate type" v={open.rateType} />
                <Field k="Per hour" v={open.pricePerHour && `₹${open.pricePerHour}`} /><Field k="Per day" v={open.pricePerDay && `₹${open.pricePerDay}`} />
                <Field k="Service radius" v={open.serviceRadius && `${open.serviceRadius} km`} /><Field k="Availability" v={open.availability} />
                <div className="sm:col-span-2"><Field k="Skills" v={(open.skills || []).join(', ')} /></div>
                <div className="sm:col-span-2"><Field k="About" v={open.about} /></div></dl></Section>

              <Section icon={FaStar} title="Performance"><dl className="grid gap-3 sm:grid-cols-3">
                <Field k="Rating" v={`${open.rating || 0} (${open.totalReviews} reviews)`} /><Field k="Jobs completed" v={open.completedJobs} /><Field k="Verified badge" v={open.isVerified ? 'Yes' : 'No'} /></dl></Section>

              <Section icon={FaIdCard} title="Verification"><dl className="grid gap-3 sm:grid-cols-2">
                <Field k="Aadhaar number" v={mask(open.aadhaarNumber)} /><Field k="Video KYC" v={open.videoKycStatus.replace(/_/g, ' ')} /></dl>
                {open.aadhaarImage && <div className="mt-3 w-40"><FileTile label="Aadhaar image" url={open.aadhaarImage} /></div>}</Section>

              {(docs.files.length > 0 || docs.texts.length > 0) && (
                <Section icon={FaFileAlt} title="Documents">
                  {docs.texts.length > 0 && <dl className="mb-3 grid gap-3 sm:grid-cols-2">{docs.texts.map(([k, v]) => <Field key={k} k={k} v={v} />)}</dl>}
                  {docs.files.length > 0 && <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{docs.files.map(([k, u]) => <FileTile key={k} label={k} url={u} />)}</div>}</Section>)}

              {(bank.files.length > 0 || bank.texts.length > 0) && (
                <Section icon={FaUniversity} title="Bank details">
                  <dl className="grid gap-3 sm:grid-cols-2">{bank.texts.map(([k, v]) => <Field key={k} k={k} v={v} />)}</dl>
                  {bank.files.length > 0 && <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">{bank.files.map(([k, u]) => <FileTile key={k} label={k} url={u} />)}</div>}</Section>)}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
export default RegisteredLabours
