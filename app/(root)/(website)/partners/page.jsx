import React from 'react'
import Link from 'next/link'
import { FaStore, FaHardHat, FaTruck, FaArrowRight } from 'react-icons/fa'
import { WEBSITE_CONTACT_US } from '@/routes/WebsiteRoute'

export const metadata = { title: 'Our Partners | ConstructEzy' }

const PARTNERS = [
  { Icon: FaStore, t: 'Shop Owners & Vendors', d: 'Local hardware and building-material stores that supply quality products through ConstructEzy.' },
  { Icon: FaHardHat, t: 'Service Professionals', d: 'Verified plumbers, electricians, painters, carpenters and contractors who serve our customers.' },
  { Icon: FaTruck, t: 'Logistics Partners', d: 'Delivery partners who make sure your materials reach your site on time.' },
]

const Partners = () => (
  <div className="min-h-screen bg-gray-50 text-gray-900">
    <section className="bg-linear-to-br from-emerald-700 to-emerald-900 px-4 py-10 text-white sm:py-14">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-extrabold sm:text-4xl">Our Partners</h1>
        <p className="mt-2 max-w-xl text-sm text-emerald-50 sm:text-base">
          ConstructEzy works with trusted vendors, professionals and delivery partners to serve you better.
        </p>
      </div>
    </section>

    <main className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {PARTNERS.map(({ Icon, t, d }) => (
          <div key={t} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"><Icon size={18} /></span>
            <h2 className="mt-3 font-semibold">{t}</h2>
            <p className="mt-1 text-sm leading-relaxed text-gray-600">{d}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-col items-start gap-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold">Want to partner with us?</h2>
          <p className="mt-1 text-sm text-gray-600">Send us your details and our team will get in touch.</p>
        </div>
        <Link href={`${WEBSITE_CONTACT_US}?subject=partner`} className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800">
          Become a Partner <FaArrowRight size={12} />
        </Link>
      </div>
    </main>
  </div>
)

export default Partners
