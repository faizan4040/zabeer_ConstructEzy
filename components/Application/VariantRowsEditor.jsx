'use client'

// Multi-row variant editor: fill many variants (option + SKU + stock + MRP + price)
// and save them all in one request. Used by the admin and shop owner "Add Variant" pages.

import { Input } from '@/components/ui/input'
import { calcDiscount } from '@/lib/variantBulk'
import { Copy, Plus, Ruler, Sparkles, Trash2 } from 'lucide-react'
import React, { useMemo, useState } from 'react'

// Used when the product's category has no option template set up yet.
export const FALLBACK_TEMPLATE = { label: 'Variant', presets: [], allowCustom: true }

let rowSeq = 0
const newId = () => `row-${Date.now()}-${rowSeq++}`

export const emptyRow = (attrs = {}) => ({
  id: newId(),
  attrs,
  sku: '',
  stock: '',
  mrp: '',
  sellingPrice: '',
})

const skuPart = (text) =>
  String(text || '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '')
    .slice(0, 8)

export const makeSku = (productName, attrs) => {
  const prefix =
    String(productName || 'VAR')
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 4) || 'VAR'
  const parts = Object.values(attrs).map(skuPart).filter(Boolean)
  return [prefix, ...parts].join('-')
}

// rows -> API "variants" array
export const rowsToVariants = (rows, templates) =>
  rows.map((r) => ({
    attributes: templates.map((t) => ({ label: t.label, value: (r.attrs[t.label] || '').trim() })),
    sku: r.sku.trim(),
    stock: r.stock === '' ? NaN : Number(r.stock),
    mrp: r.mrp === '' ? NaN : Number(r.mrp),
    sellingPrice: r.sellingPrice === '' ? NaN : Number(r.sellingPrice),
  }))

const comboKey = (attrs, templates) =>
  templates.map((t) => `${t.label}=${String(attrs[t.label] || '').trim().toLowerCase()}`).join('|')

const fmt = (n) => (Number(n) > 0 ? Number(n).toLocaleString('en-IN') : '0')

const VariantRowsEditor = ({ templates, rows, setRows, productName }) => {
  // quick-generate selections: { label: Set(values) } + custom text per label
  const [picked, setPicked] = useState({})
  const [customText, setCustomText] = useState({})

  const togglePick = (label, value) => {
    setPicked((prev) => {
      const set = new Set(prev[label] || [])
      set.has(value) ? set.delete(value) : set.add(value)
      return { ...prev, [label]: set }
    })
  }

  const addCustomPick = (label) => {
    const value = (customText[label] || '').trim()
    if (!value) return
    setPicked((prev) => ({ ...prev, [label]: new Set([...(prev[label] || []), value]) }))
    setCustomText((prev) => ({ ...prev, [label]: '' }))
  }

  // every combination of the picked values (cartesian product)
  const combos = useMemo(() => {
    if (templates.some((t) => !(picked[t.label]?.size > 0))) return []
    return templates.reduce(
      (acc, t) => acc.flatMap((c) => [...picked[t.label]].map((v) => ({ ...c, [t.label]: v }))),
      [{}]
    )
  }, [picked, templates])

  const generateRows = () => {
    setRows((prev) => {
      // drop untouched blank rows, keep anything the user already typed
      const kept = prev.filter(
        (r) => r.sku || r.stock !== '' || r.mrp !== '' || r.sellingPrice !== '' || Object.values(r.attrs).some(Boolean)
      )
      const existing = new Set(kept.map((r) => comboKey(r.attrs, templates)))
      const added = combos
        .filter((c) => !existing.has(comboKey(c, templates)))
        .map((c) => ({ ...emptyRow(c), sku: makeSku(productName, c) }))
      return [...kept, ...added]
    })
    setPicked({})
  }

  const updateRow = (id, patch) => setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  const updateAttr = (id, label, value) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, attrs: { ...r.attrs, [label]: value } } : r)))
  const removeRow = (id) => setRows((prev) => (prev.length > 1 ? prev.filter((r) => r.id !== id) : [emptyRow()]))
  const addRow = () => setRows((prev) => [...prev, emptyRow()])

  // copy row 1's stock / MRP / price into every row
  const applyFirstToAll = () => {
    setRows((prev) => {
      if (prev.length < 2) return prev
      const { stock, mrp, sellingPrice } = prev[0]
      return prev.map((r, i) => (i === 0 ? r : { ...r, stock, mrp, sellingPrice }))
    })
  }

  const fillSkus = () =>
    setRows((prev) => prev.map((r) => (r.sku.trim() ? r : { ...r, sku: makeSku(productName, r.attrs) })))

  const duplicates = useMemo(() => {
    const seen = new Map()
    const dup = new Set()
    rows.forEach((r) => {
      if (!templates.every((t) => (r.attrs[t.label] || '').trim())) return
      const k = comboKey(r.attrs, templates)
      if (seen.has(k)) {
        dup.add(r.id)
        dup.add(seen.get(k))
      } else seen.set(k, r.id)
    })
    return dup
  }, [rows, templates])

  const hasPresets = templates.some((t) => t.presets?.length > 0 || t.allowCustom)

  return (
    <div className="space-y-4">
      {/* Quick generate */}
      {hasPresets && (
        <div className="rounded-xl border border-orange-200 bg-orange-50/50 dark:bg-stone-900 dark:border-stone-700 p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-orange-500" />
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">Quick add — pick all the options you sell</p>
          </div>
          <p className="text-xs text-gray-500 mb-3">
            Select several values, then press Generate. One row is created for every combination.
          </p>

          <div className="space-y-3">
            {templates.map((t) => (
              <div key={t.label}>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1.5">{t.label}</p>
                <div className="flex flex-wrap gap-2">
                  {[...new Set([...(t.presets || []), ...(picked[t.label] || [])])].map((v) => {
                    const on = picked[t.label]?.has(v)
                    return (
                      <button
                        key={v}
                        type="button"
                        onClick={() => togglePick(t.label, v)}
                        className={`px-3 py-1.5 rounded-lg border text-sm transition-colors cursor-pointer ${
                          on
                            ? 'bg-orange-500 text-white border-orange-500'
                            : 'bg-white dark:bg-background text-gray-700 dark:text-gray-300 border-gray-300 hover:border-orange-300'
                        }`}
                      >
                        {v}
                      </button>
                    )
                  })}
                  {t.allowCustom && (
                    <div className="flex gap-1">
                      <Input
                        value={customText[t.label] || ''}
                        onChange={(e) => setCustomText((p) => ({ ...p, [t.label]: e.target.value }))}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            addCustomPick(t.label)
                          }
                        }}
                        placeholder={`Custom ${t.label.toLowerCase()}`}
                        className="h-8 w-36 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => addCustomPick(t.label)}
                        className="h-8 px-2 rounded-lg border border-dashed border-gray-300 text-gray-500 hover:border-orange-300 cursor-pointer"
                        aria-label={`Add custom ${t.label}`}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            disabled={combos.length === 0}
            onClick={generateRows}
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <Sparkles className="h-4 w-4" />
            {combos.length > 0 ? `Generate ${combos.length} row${combos.length > 1 ? 's' : ''}` : 'Generate rows'}
          </button>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
          Variants <span className="text-gray-400 font-normal">({rows.length})</span>
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={fillSkus}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-600 dark:text-gray-300 hover:border-orange-300 cursor-pointer"
          >
            Auto SKU
          </button>
          <button
            type="button"
            onClick={applyFirstToAll}
            disabled={rows.length < 2}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-600 dark:text-gray-300 hover:border-orange-300 disabled:opacity-40 cursor-pointer"
          >
            <Copy className="h-3.5 w-3.5" /> Copy row 1 stock & price to all
          </button>
        </div>
      </div>

      {/* Rows */}
      <div className="space-y-3">
        {rows.map((r, idx) => {
          const discount = calcDiscount(r.mrp, r.sellingPrice)
          const priceError = Number(r.sellingPrice) > 0 && Number(r.mrp) > 0 && Number(r.sellingPrice) > Number(r.mrp)
          const isDup = duplicates.has(r.id)
          return (
            <div
              key={r.id}
              className={`rounded-xl border p-3 bg-white dark:bg-background ${
                isDup || priceError ? 'border-red-300' : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-500">#{idx + 1}</span>
                <button
                  type="button"
                  onClick={() => removeRow(r.id)}
                  className="rounded-md p-1 text-gray-400 hover:bg-red-50 hover:text-red-500 cursor-pointer"
                  aria-label={`Remove row ${idx + 1}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                {templates.map((t) => {
                  const listId = `opts-${r.id}-${t.label.replace(/\W+/g, '')}`
                  return (
                    <label key={t.label} className="block">
                      <span className="text-[11px] font-medium text-gray-500">{t.label} *</span>
                      {t.allowCustom || !t.presets?.length ? (
                        <>
                          <Input
                            value={r.attrs[t.label] || ''}
                            onChange={(e) => updateAttr(r.id, t.label, e.target.value)}
                            list={t.presets?.length ? listId : undefined}
                            placeholder={t.presets?.[0] ? `e.g. ${t.presets[0]}` : 'e.g. 50kg'}
                            className="h-9 text-sm"
                          />
                          {t.presets?.length > 0 && (
                            <datalist id={listId}>
                              {t.presets.map((p) => (
                                <option key={p} value={p} />
                              ))}
                            </datalist>
                          )}
                        </>
                      ) : (
                        <select
                          value={r.attrs[t.label] || ''}
                          onChange={(e) => updateAttr(r.id, t.label, e.target.value)}
                          className="h-9 w-full rounded-md border border-input bg-transparent px-2 text-sm"
                        >
                          <option value="">Select</option>
                          {t.presets.map((p) => (
                            <option key={p} value={p}>
                              {p}
                            </option>
                          ))}
                        </select>
                      )}
                    </label>
                  )
                })}

                <label className="block">
                  <span className="text-[11px] font-medium text-gray-500">SKU *</span>
                  <Input
                    value={r.sku}
                    onChange={(e) => updateRow(r.id, { sku: e.target.value })}
                    placeholder="CEM-50KG"
                    className="h-9 text-sm"
                  />
                </label>
                <label className="block">
                  <span className="text-[11px] font-medium text-gray-500">Stock *</span>
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    value={r.stock}
                    onChange={(e) => updateRow(r.id, { stock: e.target.value })}
                    placeholder="0"
                    className="h-9 text-sm"
                  />
                </label>
                <label className="block">
                  <span className="text-[11px] font-medium text-gray-500">MRP (₹) *</span>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={r.mrp}
                    onChange={(e) => updateRow(r.id, { mrp: e.target.value })}
                    placeholder="400"
                    className="h-9 text-sm"
                  />
                </label>
                <label className="block">
                  <span className="text-[11px] font-medium text-gray-500">Selling price (₹) *</span>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={r.sellingPrice}
                    onChange={(e) => updateRow(r.id, { sellingPrice: e.target.value })}
                    placeholder="350"
                    className={`h-9 text-sm ${priceError ? 'border-red-400' : ''}`}
                  />
                </label>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                <span className="text-gray-500">
                  Discount: <span className="font-semibold text-gray-800 dark:text-gray-100">{discount}%</span>
                </span>
                {discount > 0 && (
                  <span className="text-green-600">
                    Customer saves ₹{fmt(Number(r.mrp) - Number(r.sellingPrice))}
                  </span>
                )}
                {priceError && <span className="text-red-500">Selling price is more than MRP</span>}
                {isDup && <span className="text-red-500">Same option added twice</span>}
              </div>
            </div>
          )
        })}
      </div>

      <button
        type="button"
        onClick={addRow}
        className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-gray-300 py-2.5 text-sm font-medium text-gray-500 hover:border-orange-400 hover:text-orange-500 cursor-pointer"
      >
        <Plus className="h-4 w-4" /> Add another variant
      </button>
    </div>
  )
}

// Supplier switch: ask the customer for Height × Width (inches) before ordering,
// and choose whether the price is per piece or per sq ft.
export const CustomSizeToggle = ({ checked, onChange, priceUnit = 'piece', onPriceUnitChange }) => (
  <div
    className={`rounded-xl border p-3 sm:p-4 transition ${
      checked ? 'border-orange-400 bg-orange-50/60 dark:bg-stone-900' : 'border-gray-200 dark:border-gray-700'
    }`}
  >
    <label className="flex items-start gap-3 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-4 w-4 accent-orange-500 cursor-pointer"
      />
      <span className="min-w-0">
        <span className="flex items-center gap-1.5 text-sm font-semibold text-gray-800 dark:text-gray-100">
          <Ruler className="h-4 w-4 text-orange-500" /> Customer se size lena hai (Height × Width)
        </span>
        <span className="block text-xs text-gray-500 mt-0.5">
          For doors, windows and other made-to-size items. The customer must enter height and width in
          inches on the product page before ordering. You will see the size in the order.
        </span>
      </span>
    </label>

    {checked && onPriceUnitChange && (
      <div className="mt-3 ml-7 space-y-2">
        <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">Price kaise lagega?</p>
        <div className="flex flex-wrap gap-2">
          {[
            ['piece', 'Per piece (fixed price)'],
            ['sqft', 'Per sq ft (size se badhega)'],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => onPriceUnitChange(value)}
              className={`px-3 py-1.5 rounded-lg border text-sm cursor-pointer ${
                priceUnit === value
                  ? 'bg-orange-500 text-white border-orange-500'
                  : 'bg-white dark:bg-background text-gray-700 dark:text-gray-300 border-gray-300 hover:border-orange-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {priceUnit === 'sqft' && (
          <p className="text-xs text-gray-500">
            MRP and selling price above are <b>per sq ft</b>. Customer price = rate × (Height × Width ÷ 144).
            Example: 84&quot; × 36&quot; = 21 sq ft → ₹200/sq ft = ₹4,200.
          </p>
        )}
      </div>
    )}
  </div>
)

export default VariantRowsEditor
