'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import {
  Users, FileText, CalendarDays, BadgeCheck, Search, Plus, Pencil, Trash2, Mail, Phone, MapPin,
  ExternalLink, Briefcase, Building2, Clock, UserRound, X, ChevronLeft, ChevronRight, Loader2, Hash,
} from 'lucide-react'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { showToast } from '@/lib/showToast'
import { ADMIN_DASHBOARD, ADMIN_RECRUITMENT } from '@/routes/AdminPanelRoute'
import { APPLICATION_STATUSES, JOB_DEPARTMENTS, JOB_TYPES, STATUS_META } from '@/lib/careers'

const PAGE = 10
const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
const initials = (n = '') => n.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('') || '?'

const inputCls = 'w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-600'

function StatusPill({ status }) {
  const m = STATUS_META[status] || STATUS_META.applied
  return <span className={`inline-block rounded-md px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${m.cls}`}>{m.label}</span>
}

function StatCard({ Icon, value, label, tone }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border bg-card p-4">
      <span className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${tone}`}><Icon size={22} /></span>
      <div>
        <p className="text-2xl font-bold leading-tight">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}

/* ═════════════════ Candidate detail panel ═════════════════ */
function CandidatePanel({ app, onClose, onUpdated }) {
  const [notes, setNotes] = useState(app.adminNotes || '')
  const [busy, setBusy] = useState('')
  useEffect(() => { setNotes(app.adminNotes || '') }, [app._id, app.adminNotes])

  const patch = async (body, key) => {
    setBusy(key)
    try {
      const { data } = await axios.patch('/api/admin/recruitment/applications', { id: app._id, ...body })
      if (!data?.success) throw new Error(data?.message)
      onUpdated(data.data)
      showToast('success', key === 'notes' ? 'Notes saved.' : `Marked as ${STATUS_META[body.status].label}.`)
    } catch (e) {
      showToast('error', e?.response?.data?.message || e.message || 'Failed.')
    } finally { setBusy('') }
  }

  const rows = [
    { Icon: Briefcase, k: 'Applied For', v: app.jobTitle },
    { Icon: Hash, k: 'Application ID', v: app.code },
    { Icon: CalendarDays, k: 'Applied On', v: fmtDate(app.createdAt) },
    { Icon: Clock, k: 'Experience', v: app.experience },
    { Icon: Building2, k: 'Current Company', v: app.currentCompany || '—' },
    { Icon: UserRound, k: 'Current Role', v: app.currentRole || '—' },
    { Icon: CalendarDays, k: 'Notice Period', v: app.noticePeriod },
  ]

  const actions = [
    { s: 'shortlisted', label: 'Shortlist', cls: 'border border-emerald-600 text-emerald-700 hover:bg-emerald-50' },
    { s: 'interview', label: 'Move to Interview', cls: 'bg-emerald-700 text-white hover:bg-emerald-800' },
    { s: 'hired', label: 'Hire', cls: 'bg-green-600 text-white hover:bg-green-700' },
    { s: 'rejected', label: 'Reject', cls: 'border border-rose-400 text-rose-600 hover:bg-rose-50' },
  ]

  return (
    <div className="rounded-2xl border bg-card p-5 space-y-5">
      <div className="flex items-start gap-4">
        <span className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-700 font-bold text-lg flex items-center justify-center shrink-0">{initials(app.fullName)}</span>
        <div className="min-w-0 flex-1">
          <p className="text-xl font-bold wrap-break-word">{app.fullName}</p>
          <div className="mt-1 space-y-1 text-sm text-muted-foreground">
            <a href={`mailto:${app.email}`} className="flex items-center gap-1.5 hover:text-emerald-700 break-all"><Mail size={14} className="shrink-0" />{app.email}</a>
            <a href={`tel:+91${app.phone}`} className="flex items-center gap-1.5 hover:text-emerald-700"><Phone size={14} />+91 {app.phone}</a>
            <span className="flex items-center gap-1.5"><MapPin size={14} />{app.location}</span>
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-md hover:bg-muted cursor-pointer" aria-label="Close"><X size={18} /></button>
      </div>

      <div className="flex items-center gap-2"><span className="text-sm text-muted-foreground">Status:</span><StatusPill status={app.status} /></div>

      {/* Resume */}
      <div className="flex flex-wrap gap-2">
        <a href={app.resumeUrl} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 text-sm font-semibold">
          <FileText size={16} /> View Resume
        </a>
        {app.portfolioUrl && (
          <a href={app.portfolioUrl} target="_blank" rel="noopener noreferrer nofollow"
            className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold hover:bg-muted">
            <ExternalLink size={16} /> Portfolio / Profile
          </a>
        )}
      </div>

      <div className="rounded-xl border p-4">
        <p className="font-semibold mb-3">Basic Information</p>
        <dl className="space-y-2.5 text-sm">
          {rows.map(({ Icon, k, v }) => (
            <div key={k} className="grid grid-cols-[20px_120px_1fr] gap-2 items-start">
              <Icon size={15} className="text-muted-foreground mt-0.5" />
              <dt className="text-muted-foreground">{k}</dt>
              <dd className="font-medium wrap-break-word">{v}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="rounded-xl border p-4">
        <p className="font-semibold mb-2">Why ConstructEzy?</p>
        <p className="text-sm text-muted-foreground whitespace-pre-line wrap-break-word">{app.whyJoin}</p>
      </div>

      <div className="rounded-xl border p-4">
        <p className="font-semibold mb-2">Internal Notes</p>
        <textarea rows={3} className={inputCls} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Only visible to admins…" maxLength={2000} />
        <button
          onClick={() => patch({ adminNotes: notes }, 'notes')}
          disabled={busy === 'notes' || notes === (app.adminNotes || '')}
          className="mt-2 rounded-lg border px-3 py-1.5 text-sm font-medium hover:bg-muted disabled:opacity-50 cursor-pointer"
        >
          {busy === 'notes' ? 'Saving…' : 'Save Notes'}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {actions.map(({ s, label, cls }) => (
          <button key={s}
            onClick={() => patch({ status: s }, s)}
            disabled={!!busy || app.status === s}
            className={`rounded-lg px-3 py-2.5 text-sm font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-colors ${cls}`}
          >
            {busy === s ? <Loader2 size={16} className="animate-spin mx-auto" /> : label}
          </button>
        ))}
      </div>
    </div>
  )
}

/* ═════════════════ Candidates tab ═════════════════ */
function CandidatesTab({ jobs }) {
  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('all')
  const [jobId, setJobId] = useState('all')
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [selectedId, setSelectedId] = useState(null)

  useEffect(() => {
    axios.get('/api/admin/recruitment/applications')
      .then(({ data }) => (data?.success ? setApps(data.data) : showToast('error', data?.message || 'Failed to load.')))
      .catch(() => showToast('error', 'Failed to load candidates.'))
      .finally(() => setLoading(false))
  }, [])

  const counts = useMemo(() => {
    const c = { all: apps.length }
    APPLICATION_STATUSES.forEach((s) => { c[s] = 0 })
    apps.forEach((a) => { c[a.status] = (c[a.status] || 0) + 1 })
    return c
  }, [apps])

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    return apps.filter((a) =>
      (status === 'all' || a.status === status) &&
      (jobId === 'all' || String(a.job) === jobId) &&
      (!s || [a.fullName, a.email, a.phone, a.code, a.location, a.currentRole].some((v) => v?.toLowerCase().includes(s))))
  }, [apps, status, jobId, q])

  useEffect(() => { setPage(1) }, [status, jobId, q])
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE))
  const shown = filtered.slice((page - 1) * PAGE, page * PAGE)
  const selected = apps.find((a) => a._id === selectedId)

  const onUpdated = useCallback((u) => setApps((list) => list.map((a) => (a._id === u._id ? u : a))), [])

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard Icon={Users} value={counts.all} label="Total Candidates" tone="bg-emerald-50 text-emerald-700" />
        <StatCard Icon={FileText} value={counts.applied} label="New Applications" tone="bg-blue-50 text-blue-700" />
        <StatCard Icon={CalendarDays} value={counts.interview} label="In Interview" tone="bg-violet-50 text-violet-700" />
        <StatCard Icon={BadgeCheck} value={counts.hired} label="Hired" tone="bg-amber-50 text-amber-700" />
      </div>

      <div className={`grid gap-5 ${selected ? 'xl:grid-cols-[1fr_440px]' : ''}`}>
        <div className="rounded-2xl border bg-card p-4 min-w-0">
          {/* status chips */}
          <div className="flex flex-wrap gap-2">
            {['all', ...APPLICATION_STATUSES].map((s) => (
              <button key={s} onClick={() => setStatus(s)}
                className={`rounded-lg px-3.5 py-1.5 text-sm font-medium border cursor-pointer ${status === s ? 'bg-emerald-700 border-emerald-700 text-white' : 'hover:bg-muted'}`}>
                {s === 'all' ? 'All Candidates' : STATUS_META[s].label} ({counts[s] || 0})
              </button>
            ))}
          </div>

          {/* filters */}
          <div className="mt-4 flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input className={`${inputCls} pl-9`} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, email, phone or ID…" />
            </div>
            <select className={`${inputCls} sm:w-56`} value={jobId} onChange={(e) => setJobId(e.target.value)}>
              <option value="all">All Jobs</option>
              {jobs.map((j) => <option key={j._id} value={j._id}>{j.title}</option>)}
            </select>
          </div>

          {/* table */}
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground border-b">
                  <th className="py-2.5 pr-3 font-medium">Candidate</th>
                  <th className="py-2.5 pr-3 font-medium">Applied For</th>
                  <th className="py-2.5 pr-3 font-medium">Experience</th>
                  <th className="py-2.5 pr-3 font-medium">Status</th>
                  <th className="py-2.5 font-medium">Applied On</th>
                </tr>
              </thead>
              <tbody>
                {loading && <tr><td colSpan={5} className="py-10 text-center text-muted-foreground"><Loader2 className="animate-spin inline mr-2" size={16} />Loading…</td></tr>}
                {!loading && shown.length === 0 && <tr><td colSpan={5} className="py-10 text-center text-muted-foreground">No candidates found.</td></tr>}
                {shown.map((a) => (
                  <tr key={a._id} onClick={() => setSelectedId(a._id)}
                    className={`border-b last:border-0 cursor-pointer transition-colors ${selectedId === a._id ? 'bg-emerald-50/70 dark:bg-emerald-950/30' : 'hover:bg-muted/50'}`}>
                    <td className="py-3 pr-3">
                      <div className="flex items-center gap-3">
                        <span className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold flex items-center justify-center shrink-0">{initials(a.fullName)}</span>
                        <div className="min-w-0">
                          <p className="font-semibold truncate max-w-45">{a.fullName}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-45">{a.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-3 max-w-40">{a.jobTitle}</td>
                    <td className="py-3 pr-3 whitespace-nowrap">{a.experience}</td>
                    <td className="py-3 pr-3"><StatusPill status={a.status} /></td>
                    <td className="py-3 whitespace-nowrap">{fmtDate(a.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* pagination */}
          {filtered.length > PAGE && (
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Showing {(page - 1) * PAGE + 1}–{Math.min(page * PAGE, filtered.length)} of {filtered.length}</span>
              <div className="flex items-center gap-1">
                <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="p-2 rounded-md border disabled:opacity-40 cursor-pointer" aria-label="Previous"><ChevronLeft size={16} /></button>
                <span className="px-3">{page} / {pages}</span>
                <button disabled={page === pages} onClick={() => setPage((p) => p + 1)} className="p-2 rounded-md border disabled:opacity-40 cursor-pointer" aria-label="Next"><ChevronRight size={16} /></button>
              </div>
            </div>
          )}
        </div>

        {selected && <CandidatePanel app={selected} onClose={() => setSelectedId(null)} onUpdated={onUpdated} />}
      </div>
    </div>
  )
}

/* ═════════════════ Job form dialog ═════════════════ */
const L = ({ children, req }) => <span className="block text-sm font-medium mb-1">{children}{req && <span className="text-rose-500"> *</span>}</span>

const BLANK_JOB = { title: '', department: 'Engineering', location: '', employmentType: 'Full-time', experience: '', about: '', responsibilities: '', skills: '', status: 'open' }

function JobDialog({ open, job, onClose, onSaved }) {
  const [f, setF] = useState(BLANK_JOB)
  const [saving, setSaving] = useState(false)
  useEffect(() => {
    if (!open) return
    setF(job ? {
      ...BLANK_JOB, ...job,
      responsibilities: (job.responsibilities || []).join('\n'),
      skills: (job.skills || []).join(', '),
    } : BLANK_JOB)
  }, [open, job])

  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }))

  const save = async (e) => {
    e.preventDefault()
    if (f.title.trim().length < 2) return showToast('error', 'Job title is required.')
    setSaving(true)
    try {
      const body = {
        title: f.title, department: f.department, location: f.location, employmentType: f.employmentType,
        experience: f.experience, about: f.about, status: f.status,
        responsibilities: f.responsibilities.split('\n'),
        skills: f.skills.split(','),
      }
      const { data } = job
        ? await axios.patch('/api/admin/recruitment/jobs', { id: job._id, ...body })
        : await axios.post('/api/admin/recruitment/jobs', body)
      if (!data?.success) throw new Error(data?.message)
      showToast('success', data.message)
      onSaved()
      onClose()
    } catch (err) {
      showToast('error', err?.response?.data?.message || err.message || 'Failed to save.')
    } finally { setSaving(false) }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{job ? 'Edit Job Post' : 'Post a New Job'}</DialogTitle></DialogHeader>
        <form onSubmit={save} className="space-y-4">
          <label className="block"><L req>Job Title</L><input className={inputCls} value={f.title} onChange={set('title')} placeholder="e.g. Frontend Developer" maxLength={120} /></label>
          <div className="grid sm:grid-cols-2 gap-3">
            <label className="block"><L>Department</L>
              <select className={inputCls} value={f.department} onChange={set('department')}>{JOB_DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}</select>
            </label>
            <label className="block"><L>Employment Type</L>
              <select className={inputCls} value={f.employmentType} onChange={set('employmentType')}>{JOB_TYPES.map((d) => <option key={d}>{d}</option>)}</select>
            </label>
            <label className="block"><L>Location</L><input className={inputCls} value={f.location} onChange={set('location')} placeholder="e.g. Jaipur / Delhi NCR" maxLength={120} /></label>
            <label className="block"><L>Experience</L><input className={inputCls} value={f.experience} onChange={set('experience')} placeholder="e.g. 2–4 Years" maxLength={40} /></label>
          </div>
          <label className="block"><L>About the Role</L><textarea rows={3} className={inputCls} value={f.about} onChange={set('about')} maxLength={3000} placeholder="Short description of the role…" /></label>
          <label className="block"><L>Key Responsibilities <span className="font-normal text-muted-foreground">(one per line)</span></L>
            <textarea rows={4} className={inputCls} value={f.responsibilities} onChange={set('responsibilities')} placeholder={'Develop and maintain web apps\nWork with product & design teams'} />
          </label>
          <label className="block"><L>Required Skills <span className="font-normal text-muted-foreground">(comma separated)</span></L>
            <input className={inputCls} value={f.skills} onChange={set('skills')} placeholder="React.js, JavaScript, Tailwind" />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={f.status === 'open'} onChange={(e) => setF((x) => ({ ...x, status: e.target.checked ? 'open' : 'closed' }))} />
            Show on Careers page (accepting applications)
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted cursor-pointer">Cancel</button>
            <button type="submit" disabled={saving} className="rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-2 text-sm font-semibold disabled:opacity-60 cursor-pointer">
              {saving ? 'Saving…' : job ? 'Save Changes' : 'Publish Job'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

/* ═════════════════ Job posts tab ═════════════════ */
function JobsTab({ jobs, loading, reload }) {
  const [dialog, setDialog] = useState({ open: false, job: null })

  const toggle = async (job) => {
    try {
      const { data } = await axios.patch('/api/admin/recruitment/jobs', { id: job._id, status: job.status === 'open' ? 'closed' : 'open' })
      if (!data?.success) throw new Error(data?.message)
      showToast('success', data.message); reload()
    } catch (e) { showToast('error', e?.response?.data?.message || e.message) }
  }

  const remove = async (job) => {
    if (!window.confirm(`Delete "${job.title}"? Existing applications will be kept.`)) return
    try {
      const { data } = await axios.delete('/api/admin/recruitment/jobs', { data: { id: job._id } })
      if (!data?.success) throw new Error(data?.message)
      showToast('success', data.message); reload()
    } catch (e) { showToast('error', e?.response?.data?.message || e.message) }
  }

  return (
    <div className="rounded-2xl border bg-card p-4">
      <div className="flex items-center justify-between gap-3 mb-4">
        <p className="font-semibold">{jobs.length} job post{jobs.length === 1 ? '' : 's'}</p>
        <button onClick={() => setDialog({ open: true, job: null })}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 text-sm font-semibold cursor-pointer">
          <Plus size={16} /> Post a Job
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground border-b">
              <th className="py-2.5 pr-3 font-medium">Title</th>
              <th className="py-2.5 pr-3 font-medium">Department</th>
              <th className="py-2.5 pr-3 font-medium">Location</th>
              <th className="py-2.5 pr-3 font-medium">Type / Exp.</th>
              <th className="py-2.5 pr-3 font-medium">Applications</th>
              <th className="py-2.5 pr-3 font-medium">Status</th>
              <th className="py-2.5 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={7} className="py-10 text-center text-muted-foreground"><Loader2 className="animate-spin inline mr-2" size={16} />Loading…</td></tr>}
            {!loading && jobs.length === 0 && (
              <tr><td colSpan={7} className="py-12 text-center text-muted-foreground">No jobs yet — click <b>Post a Job</b> to publish your first opening.</td></tr>
            )}
            {jobs.map((j) => (
              <tr key={j._id} className="border-b last:border-0">
                <td className="py-3 pr-3 font-semibold">{j.title}<p className="text-xs font-normal text-muted-foreground">Posted {fmtDate(j.createdAt)}</p></td>
                <td className="py-3 pr-3">{j.department}</td>
                <td className="py-3 pr-3">{j.location || '—'}</td>
                <td className="py-3 pr-3 whitespace-nowrap">{j.employmentType}{j.experience ? ` · ${j.experience}` : ''}</td>
                <td className="py-3 pr-3">{j.applications}</td>
                <td className="py-3 pr-3">
                  <button onClick={() => toggle(j)} title="Click to toggle"
                    className={`rounded-md px-2.5 py-1 text-xs font-semibold cursor-pointer ${j.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                    {j.status === 'open' ? 'Live' : 'Closed'}
                  </button>
                </td>
                <td className="py-3 text-right whitespace-nowrap">
                  <button onClick={() => setDialog({ open: true, job: j })} className="p-2 rounded-md hover:bg-muted cursor-pointer" aria-label="Edit"><Pencil size={16} /></button>
                  <button onClick={() => remove(j)} className="p-2 rounded-md hover:bg-rose-50 text-rose-600 cursor-pointer" aria-label="Delete"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <JobDialog open={dialog.open} job={dialog.job} onClose={() => setDialog({ open: false, job: null })} onSaved={reload} />
    </div>
  )
}

/* ═════════════════ Page ═════════════════ */
export default function RecruitmentPage() {
  const [tab, setTab] = useState('candidates')
  const [jobs, setJobs] = useState([])
  const [jobsLoading, setJobsLoading] = useState(true)

  const loadJobs = useCallback(() => {
    setJobsLoading(true)
    axios.get('/api/admin/recruitment/jobs')
      .then(({ data }) => (data?.success ? setJobs(data.data) : showToast('error', data?.message || 'Failed to load jobs.')))
      .catch(() => showToast('error', 'Failed to load jobs.'))
      .finally(() => setJobsLoading(false))
  }, [])
  useEffect(() => { loadJobs() }, [loadJobs])

  return (
    <div>
      <BreadCrumb breadcrumbData={[{ href: ADMIN_DASHBOARD, label: 'Home' }, { href: ADMIN_RECRUITMENT, label: 'Recruitment' }]} />
      <div className="py-4 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Recruitment</h1>
            <p className="text-sm text-muted-foreground">Post jobs on the Careers page and review candidate applications.</p>
          </div>
          <div className="inline-flex rounded-lg border p-1 bg-card self-start">
            {[['candidates', 'Candidates'], ['jobs', 'Job Posts']].map(([k, label]) => (
              <button key={k} onClick={() => setTab(k)}
                className={`rounded-md px-4 py-1.5 text-sm font-semibold cursor-pointer ${tab === k ? 'bg-emerald-700 text-white' : 'hover:bg-muted'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {tab === 'candidates' ? <CandidatesTab jobs={jobs} /> : <JobsTab jobs={jobs} loading={jobsLoading} reload={loadJobs} />}
      </div>
    </div>
  )
}
