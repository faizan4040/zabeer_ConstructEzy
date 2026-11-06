'use client'
import React from 'react'
import Link from 'next/link'
import { FaWhatsapp, FaPhoneAlt, FaFileDownload, FaChevronRight } from 'react-icons/fa'
import { WHATSAPP, PHONE } from '@/lib/servicesConfig'
import { WEBSITE_MATERIAL_LIST } from '@/routes/ServiceRoute'

const CARDS = [
  { key: 'wa', href: WHATSAPP ? `https://wa.me/${WHATSAPP}` : '#', ext: true, Icon: FaWhatsapp, size: 26, wrap: 'border-emerald-100 from-emerald-50', ic: 'rounded-full bg-[#25D366]', t: 'Book via WhatsApp', d: 'Chat with our team' },
  { key: 'call', href: PHONE ? `tel:${PHONE}` : '#', Icon: FaPhoneAlt, size: 19, wrap: 'border-sky-100 from-sky-50', ic: 'rounded-full bg-sky-500', t: 'Book via Call', d: 'Talk to our experts' },
  { key: 'up', href: WEBSITE_MATERIAL_LIST, Icon: FaFileDownload, size: 22, wrap: 'border-orange-100 from-orange-50', ic: 'rounded-lg bg-orange-400', t: 'Upload Your Material List', d: 'Get best prices & quick quotes' },
]

const ContactCards = () => (
  <div className="mt-3 grid gap-3 md:grid-cols-3">
    {CARDS.map(({ key, href, ext, Icon, size, wrap, ic, t, d }) => (
      <Link key={key} href={href} {...(ext ? { target: '_blank', rel: 'noreferrer' } : {})} className={`group flex items-center gap-3 rounded-xl border bg-gradient-to-r to-white px-4 py-3.5 transition hover:-translate-y-0.5 hover:shadow-md ${wrap}`}>
        <span className={`flex h-12 w-12 shrink-0 items-center justify-center text-white shadow ${ic}`}><Icon size={size} /></span>
        <span className="min-w-0"><b className="block text-[15px] text-[#0b1b3f]">{t}</b><span className="text-xs text-gray-500">{d}</span></span>
        <FaChevronRight size={13} className="ml-auto shrink-0 text-gray-400 transition group-hover:translate-x-1" />
      </Link>
    ))}
  </div>
)
export default ContactCards
