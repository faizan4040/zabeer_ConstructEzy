'use client'

import { useState } from 'react'
import { FlaskConical, Truck, Info } from 'lucide-react'
import { Input } from '@/components/ui/input'
import ShopLocationCard from './ShopLocationCard'

// Shop product add/edit ka "Buy a Sample" + "Delivery" section.
// value: { sampleEnabled, samplePrice, sampleNote, deliveryType, deliveryRatePerKm }
// onChange(nextValue)
const DELIVERY_OPTIONS = [
  {
    value: 'free',
    title: 'Free delivery',
    desc: 'You deliver it yourself. Buyer pays nothing for delivery.',
    buyerSees: 'Free Delivery',
  },
  {
    value: 'paid_supplier',
    title: 'Paid delivery (by you)',
    desc: 'You deliver it yourself and charge per km, from your shop to the buyer.',
    buyerSees: 'Paid Delivery · ₹X/km',
  },
  {
    value: 'constructezy',
    title: 'Delivery managed by ConstructEzy',
    desc: 'We pick up and deliver. Buyer pays ConstructEzy’s per-km rate.',
    buyerSees: 'Paid Delivery · ₹/km',
  },
]

function Toggle({ checked, onChange, id }) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors cursor-pointer ${checked ? 'bg-orange-500' : 'bg-gray-300 dark:bg-stone-600'}`}
    >
      <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
    </button>
  )
}

export default function ListingOptionsSection({ value, onChange, step = 4 }) {
  const [locationEnabled, setLocationEnabled] = useState(null)
  const set = (patch) => onChange({ ...value, ...patch })
  const needsLocation = value.deliveryType !== 'free'

  return (
    <>
      {/* ── Buy a Sample ── */}
      <section className="rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-700 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2">
            <FlaskConical className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
            <div>
              <label htmlFor="sample-toggle" className="font-semibold text-sm sm:text-base text-gray-800 dark:text-gray-100 cursor-pointer">
                Buy a Sample
              </label>
              <p className="text-xs text-gray-500 mt-0.5">
                Shows a “Buy a Sample” button next to Add to Cart / Buy Now. Buyer gets 1 sample.
              </p>
            </div>
          </div>
          <Toggle id="sample-toggle" checked={!!value.sampleEnabled} onChange={(v) => set({ sampleEnabled: v })} />
        </div>

        {value.sampleEnabled && (
          <div className="mt-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Sample price (₹)<span className="text-red-500">*</span></label>
                <Input
                  type="number"
                  min="1"
                  placeholder="e.g. 50"
                  value={value.samplePrice ?? ''}
                  onChange={(e) => set({ samplePrice: e.target.value })}
                  className="rounded-xl h-11 mt-1.5"
                />
              </div>
              <div>
                <label className="text-sm font-medium">What’s in the sample? (optional)</label>
                <Input
                  placeholder="e.g. 1 kg pack, 2 tiles"
                  maxLength={120}
                  value={value.sampleNote ?? ''}
                  onChange={(e) => set({ sampleNote: e.target.value })}
                  className="rounded-xl h-11 mt-1.5"
                />
              </div>
            </div>
            <p className="flex items-start gap-1.5 text-xs text-blue-700 bg-blue-50 dark:bg-blue-950/30 rounded-lg px-3 py-2">
              <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              Only the sample is returnable — within 7 days of delivery. Full orders of this product are not returnable.
            </p>
          </div>
        )}
      </section>

      {/* ── Delivery ── */}
      <section className="rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-700 p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-600">{step}</span>
          <Truck className="h-4 w-4 text-orange-500 shrink-0" />
          <h4 className="font-semibold text-sm sm:text-base text-gray-800 dark:text-gray-100">Delivery</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {DELIVERY_OPTIONS.map((opt) => {
            const active = value.deliveryType === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => set({ deliveryType: opt.value })}
                className={`text-left rounded-xl border p-3.5 transition cursor-pointer ${active
                  ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/30 ring-1 ring-orange-500'
                  : 'border-gray-200 dark:border-gray-700 hover:border-orange-300'}`}
              >
                <p className={`text-sm font-semibold ${active ? 'text-orange-700 dark:text-orange-300' : 'text-gray-800 dark:text-gray-100'}`}>{opt.title}</p>
                <p className="text-xs text-gray-500 mt-1">{opt.desc}</p>
                <p className="text-[11px] text-gray-400 mt-2">Buyer sees: <span className="font-medium text-gray-600 dark:text-gray-300">{opt.buyerSees}</span></p>
              </button>
            )
          })}
        </div>

        {value.deliveryType === 'paid_supplier' && (
          <div className="mt-4 max-w-xs">
            <label className="text-sm font-medium">Delivery charge per km (₹)<span className="text-red-500">*</span></label>
            <Input
              type="number"
              min="1"
              step="0.5"
              placeholder="e.g. 20"
              value={value.deliveryRatePerKm ?? ''}
              onChange={(e) => set({ deliveryRatePerKm: e.target.value })}
              className="rounded-xl h-11 mt-1.5"
            />
            <p className="text-xs text-gray-500 mt-1">
              At checkout: distance (your shop → buyer) × this rate.
            </p>
          </div>
        )}

        {needsLocation && (
          <div className="mt-4">
            <ShopLocationCard compact onChange={(l) => setLocationEnabled(!!l?.enabled)} />
            {locationEnabled === false && (
              <p className="text-xs text-red-600 mt-1.5">Enable your shop location to save a paid delivery option.</p>
            )}
          </div>
        )}
      </section>
    </>
  )
}
