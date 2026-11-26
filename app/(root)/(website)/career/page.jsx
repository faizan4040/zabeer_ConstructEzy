'use client'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import axios from 'axios'
import {
  ArrowRight, Briefcase, BarChart3, MapPin, Rocket, Users, TrendingUp, Heart,
  Code2, Box, Headphones, PenTool, Megaphone, HardHat, Mail, Quote,
} from 'lucide-react'
import { WEBSITE_CAREER_APPLY } from '@/routes/WebsiteRoute'

const BRAND = '#0B8457'

const DEPT_ICON = {
  Engineering: Code2,
  Product: Box,
  Design: PenTool,
  Operations: Headphones,
  Business: Briefcase,
  Sales: Megaphone,
  'Site / Field': HardHat,
}

const VALUES = [
  { Icon: Rocket, title: 'High-Impact Work', text: 'Solve real industry problems' },
  { Icon: Users, title: 'Talented Team', text: 'Work with builders, technologists and operators' },
  { Icon: TrendingUp, title: 'Grow With Us', text: 'Learn, lead and create at scale' },
  { Icon: Heart, title: 'Meaningful Impact', text: 'Build for homeowners, contractors and the industry' },
]

function JobMeta({ job }) {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-gray-600">
      {job.location && <span className="flex items-center gap-1.5"><MapPin size={15} />{job.location}</span>}
      <span className="flex items-center gap-1.5"><Briefcase size={15} />{job.employmentType}</span>
      {job.experience && <span className="flex items-center gap-1.5"><BarChart3 size={15} />{job.experience}</span>}
    </div>
  )
}

export default function Career() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [dept, setDept] = useState('All')

  useEffect(() => {
    axios.get('/api/careers')
      .then(({ data }) => setJobs(data?.success ? data.data : []))
      .catch(() => setJobs([]))
      .finally(() => setLoading(false))
  }, [])

  const depts = useMemo(() => {
    const m = {}
    jobs.forEach((j) => { m[j.department] = (m[j.department] || 0) + 1 })
    return Object.entries(m)
  }, [jobs])

  const visible = dept === 'All' ? jobs : jobs.filter((j) => j.department === dept)

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden bg-linear-to-br from-[#06352a] via-[#0a5a43] to-[#0B8457] text-white">
        <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-white/5" />
        <div className="absolute right-40 -bottom-32 w-80 h-80 rounded-full bg-white/5" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <span className="inline-block rounded-full bg-white/10 border border-white/15 px-4 py-1.5 text-sm text-emerald-200">
              Careers at ConstructEzy
            </span>
            <h1 className="mt-5 text-3xl sm:text-5xl font-bold leading-tight">Build Your Career at ConstructEzy</h1>
            <p className="mt-4 text-base sm:text-lg text-emerald-50/90 max-w-xl">
              Join a mission-driven team building India&apos;s most trusted construction-tech platform.
            </p>
            <a
              href="#open-roles"
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-[#22e39a] hover:bg-[#1fd08d] text-[#06352a] font-semibold px-6 py-3 transition-colors"
            >
              View Open Roles <ArrowRight size={18} />
            </a>
          </div>

          {/* decorative stats */}
          <div className="hidden lg:grid grid-cols-2 gap-4">
            {[
              { Icon: HardHat, k: 'Construction', v: 'Materials, labour & services' },
              { Icon: Code2, k: 'Technology', v: 'Marketplace & platform' },
              { Icon: Users, k: 'People first', v: 'Small team, big ownership' },
              { Icon: TrendingUp, k: 'Fast growth', v: 'Jaipur & Delhi NCR' },
            ].map(({ Icon, k, v }) => (
              <div key={k} className="rounded-2xl bg-white/10 border border-white/15 backdrop-blur p-5">
                <Icon size={26} className="text-[#22e39a]" />
                <p className="mt-3 font-semibold">{k}</p>
                <p className="text-sm text-emerald-50/80">{v}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ─── VALUES STRIP ─── */}
        <section className="-mt-8 relative z-10 rounded-2xl bg-gray-50 border border-gray-100 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 lg:divide-x divide-gray-200">
          {VALUES.map(({ Icon, title, text }) => (
            <div key={title} className="flex items-center gap-4 p-5">
              <span className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                <Icon size={24} style={{ color: BRAND }} />
              </span>
              <div>
                <p className="font-semibold">{title}</p>
                <p className="text-sm text-gray-600">{text}</p>
              </div>
            </div>
          ))}
        </section>

        {/* ─── OPEN ROLES ─── */}
        <section id="open-roles" className="scroll-mt-28 py-12 sm:py-16 grid lg:grid-cols-[1fr_340px] gap-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold">Open Roles</h2>

            {depts.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {[['All', jobs.length], ...depts].map(([d, n]) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDept(d)}
                    className={`rounded-full px-4 py-2 text-sm font-medium border cursor-pointer transition-colors ${
                      dept === d ? 'bg-[#0B8457] border-[#0B8457] text-white' : 'bg-white border-gray-200 text-gray-700 hover:border-[#0B8457]'
                    }`}
                  >
                    {d === 'All' ? 'All Roles' : d} ({n})
                  </button>
                ))}
              </div>
            )}

            <div className="mt-6 space-y-4">
              {loading && [0, 1, 2].map((i) => <div key={i} className="h-24 rounded-2xl bg-gray-100 animate-pulse" />)}

              {!loading && visible.length === 0 && (
                <div className="rounded-2xl border border-dashed border-gray-300 p-10 text-center">
                  <Briefcase className="mx-auto text-gray-400" size={32} />
                  <p className="mt-3 font-semibold">No open roles right now</p>
                  <p className="text-sm text-gray-600 mt-1">
                    We&apos;re always happy to meet good people — send your CV to{' '}
                    <a href="mailto:careers@constructezy.com" className="font-medium" style={{ color: BRAND }}>careers@constructezy.com</a>
                  </p>
                </div>
              )}

              {!loading && visible.map((job) => {
                const Icon = DEPT_ICON[job.department] || Briefcase
                return (
                  <Link
                    key={job._id}
                    href={WEBSITE_CAREER_APPLY(job._id)}
                    className="group flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 hover:border-[#0B8457] hover:shadow-md transition"
                  >
                    <span className="w-14 h-14 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                      <Icon size={26} style={{ color: BRAND }} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-lg font-semibold">{job.title}</p>
                      <div className="mt-1"><JobMeta job={job} /></div>
                    </div>
                    <span className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-50 text-[#0B8457] group-hover:bg-[#0B8457] group-hover:text-white px-5 py-2.5 text-sm font-semibold transition-colors">
                      Apply Now <ArrowRight size={16} />
                    </span>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* ─── SIDE CARD ─── */}
          <aside className="space-y-4 lg:pt-14">
            <div className="rounded-2xl border border-gray-200 p-6">
              <h3 className="text-lg font-bold">Life at ConstructEzy</h3>
              <ul className="mt-4 space-y-3 text-sm text-gray-700">
                {['Real ownership from day one', 'Work on-ground with builders & vendors', 'Learn across tech, ops and business', 'Fast decisions, small team'].map((t) => (
                  <li key={t} className="flex gap-2"><span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: BRAND }} />{t}</li>
                ))}
              </ul>
              <div className="mt-5 rounded-xl bg-emerald-50 p-4 flex gap-3">
                <Quote size={22} className="shrink-0" style={{ color: BRAND }} />
                <p className="text-sm font-medium text-gray-800">A place to build, learn, and grow — together.</p>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 p-6">
              <p className="font-semibold">Don&apos;t see your role?</p>
              <p className="text-sm text-gray-600 mt-1">Send us your CV and we&apos;ll reach out when something fits.</p>
              <a href="mailto:careers@constructezy.com" className="mt-3 inline-flex items-center gap-2 text-sm font-semibold" style={{ color: BRAND }}>
                <Mail size={16} /> careers@constructezy.com
              </a>
            </div>
          </aside>
        </section>
      </main>
    </div>
  )
}
