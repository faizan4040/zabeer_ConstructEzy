'use client'

// Shop owner: all my variants in one place. Edit stock / price / "ask customer for size" inline.

import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import { Input } from '@/components/ui/input'
import { showToast } from '@/lib/showToast'
import { calcDiscount } from '@/lib/variantBulk'
import { SHOP_OWNER_DASHBOARD, SHOP_OWNER_VARIANT_ADD } from '@/routes/ShopOwnerPanelRoute'
import { IMAGES } from '@/routes/AllImages'
import axios from 'axios'
import Image from 'next/image'
import Link from 'next/link'
import React, { useEffect, useMemo, useState } from 'react'
import { Loader2, Plus, Ruler, Search } from 'lucide-react'

const breadcrumbData = [
  { href: SHOP_OWNER_DASHBOARD, label: 'Home' },
  { href: '', label: 'Variants' },
]

const toDraft = (v) => ({
  stock: v.stock ?? 0,
  mrp: v.mrp ?? '',
  sellingPrice: v.sellingPrice ?? '',
  requiresCustomSize: !!v.requiresCustomSize,
  priceUnit: v.priceUnit === 'sqft' ? 'sqft' : 'piece',
})

const VariantRow = ({ variant, onSaved }) => {
  const [draft, setDraft] = useState(toDraft(variant))
  const [saving, setSaving] = useState(false)
  const original = toDraft(variant)
  const dirty = JSON.stringify(draft) !== JSON.stringify(original)
  const discount = calcDiscount(draft.mrp, draft.sellingPrice)
  const perSqft = draft.requiresCustomSize && draft.priceUnit === 'sqft'

  const set = (key, value) => setDraft((d) => ({ ...d, [key]: value }))

  const save = async () => {
    setSaving(true)
    try {
      const { data } = await axios.put('/api/shopowner/product-variant/edit', {
        _id: variant._id,
        stock: Number(draft.stock),
        mrp: Number(draft.mrp),
        sellingPrice: Number(draft.sellingPrice),
        requiresCustomSize: draft.requiresCustomSize,
        priceUnit: draft.priceUnit,
      })
      if (!data.success) throw new Error(data.message)
      showToast('success', data.message)
      onSaved(data.data)
    } catch (error) {
      showToast('error', error?.response?.data?.message || error.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={`rounded-2xl border bg-white dark:bg-card p-3 sm:p-4 ${dirty ? 'border-orange-300' : 'border-gray-200 dark:border-gray-700'}`}>
      <div className="flex gap-3">
        <Image
          src={variant.media?.[0]?.secure_url || IMAGES.image_placeholder}
          alt=""
          width={56}
          height={56}
          className="h-14 w-14 shrink-0 rounded-lg border object-cover"
        />
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-sm text-gray-800 dark:text-gray-100 truncate">{variant.product?.name}</p>
          <p className="text-xs text-gray-500 truncate">
            {(variant.attributes || []).map((a) => `${a.label}: ${a.value}`).join(' | ')} · SKU {variant.sku}
          </p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <label className="block">
          <span className="text-[11px] font-medium text-gray-500">Stock</span>
          <Input type="number" min="0" step="1" value={draft.stock} onChange={(e) => set('stock', e.target.value)} className="h-9 text-sm" />
        </label>
        <label className="block">
          <span className="text-[11px] font-medium text-gray-500">MRP (₹){perSqft ? ' / sq ft' : ''}</span>
          <Input type="number" min="0" step="0.01" value={draft.mrp} onChange={(e) => set('mrp', e.target.value)} className="h-9 text-sm" />
        </label>
        <label className="block">
          <span className="text-[11px] font-medium text-gray-500">Selling (₹){perSqft ? ' / sq ft' : ''}</span>
          <Input type="number" min="0" step="0.01" value={draft.sellingPrice} onChange={(e) => set('sellingPrice', e.target.value)} className="h-9 text-sm" />
        </label>
        <div className="flex items-end">
          <span className="text-xs text-gray-500 pb-2">Discount <b className="text-gray-800 dark:text-gray-100">{discount}%</b></span>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={draft.requiresCustomSize}
            onChange={(e) => set('requiresCustomSize', e.target.checked)}
            className="h-4 w-4 accent-orange-500"
          />
          <Ruler className="h-4 w-4 text-orange-500" /> Customer se size lo (H × W)
        </label>
        {draft.requiresCustomSize && (
          <select
            value={draft.priceUnit}
            onChange={(e) => set('priceUnit', e.target.value)}
            className="h-8 rounded-md border border-gray-300 bg-transparent px-2 text-sm"
          >
            <option value="piece">Price per piece</option>
            <option value="sqft">Price per sq ft</option>
          </select>
        )}
        <div className="ml-auto flex gap-2">
          {dirty && (
            <button type="button" onClick={() => setDraft(original)} className="rounded-lg px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 cursor-pointer">
              Reset
            </button>
          )}
          <button
            type="button"
            disabled={!dirty || saving}
            onClick={save}
            className="inline-flex items-center gap-1.5 rounded-lg bg-orange-500 px-4 py-1.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />} Save
          </button>
        </div>
      </div>
    </div>
  )
}

const ShopVariants = () => {
  const [variants, setVariants] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')

  useEffect(() => {
    axios
      .get('/api/shopowner/product-variant/get')
      .then(({ data }) => setVariants(data.success ? data.data : []))
      .catch(() => showToast('error', 'Could not load variants.'))
      .finally(() => setLoading(false))
  }, [])

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return variants
    return variants.filter((v) =>
      [v.product?.name, v.sku, ...(v.attributes || []).map((a) => a.value)].join(' ').toLowerCase().includes(q)
    )
  }, [variants, query])

  // keep the populated product/media from the list, take the new numbers from the server
  const onSaved = (updated) =>
    setVariants((prev) =>
      prev.map((v) =>
        v._id === updated?._id
          ? { ...v, stock: updated.stock, mrp: updated.mrp, sellingPrice: updated.sellingPrice, discountPercentage: updated.discountPercentage, requiresCustomSize: updated.requiresCustomSize, priceUnit: updated.priceUnit }
          : v
      )
    )

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <BreadCrumb breadcrumbData={breadcrumbData} />

      <div className="mt-4 mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl sm:text-2xl font-bold">My Variants</h1>
        <Link
          href={SHOP_OWNER_VARIANT_ADD}
          className="inline-flex items-center gap-1.5 rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
        >
          <Plus className="h-4 w-4" /> Add Variants
        </Link>
      </div>

      <div className="relative mb-4 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search product, SKU or option" className="pl-9 h-10" />
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : shown.length === 0 ? (
        <p className="text-sm text-gray-500">No variants found.</p>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
          {shown.map((v) => (
            <VariantRow key={v._id} variant={v} onSaved={onSaved} />
          ))}
        </div>
      )}
    </div>
  )
}

export default ShopVariants
