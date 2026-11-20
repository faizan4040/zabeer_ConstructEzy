'use client'

// Height × Width (inch) editor for a cart line of a made-to-size item.
// Shows a red "size required" box when the size is missing; otherwise the size + a Change link.

import { areaSqft, cleanCustomSize, customSizeError, formatCustomSize, priceForSize, SIZE_MAX, SIZE_MIN } from '@/lib/customSize'
import { showToast } from '@/lib/showToast'
import { setCustomSize } from '@/store/reducer/cartReducer'
import { Ruler } from 'lucide-react'
import React, { useState } from 'react'
import { useDispatch } from 'react-redux'

const inr = (n) => Number(n || 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 })

const CartSizeInput = ({ product }) => {
  const dispatch = useDispatch()
  const missing = !product.customSize
  const [editing, setEditing] = useState(missing)
  const [h, setH] = useState(product.customSize?.height ?? '')
  const [w, setW] = useState(product.customSize?.width ?? '')

  if (!product.requiresCustomSize || product.isSample) return null

  if (!editing && !missing) {
    return (
      <p className="text-sm font-medium text-orange-700">
        Size: {formatCustomSize(product.customSize)}
        {product.priceUnit === 'sqft' && <> ({areaSqft(product.customSize)} sq ft)</>}{' '}
        <button type="button" onClick={() => setEditing(true)} className="text-xs underline text-gray-500 cursor-pointer">
          Change
        </button>
      </p>
    )
  }

  const size = cleanCustomSize({ height: h, width: w })
  const preview =
    product.priceUnit === 'sqft' && size
      ? priceForSize({ mrp: product.rateMrp, sellingPrice: product.rateSellingPrice, priceUnit: 'sqft' }, size)
      : null

  const save = () => {
    const err = customSizeError(h, w)
    if (err) return showToast('error', err)
    dispatch(setCustomSize({ line: product, customSize: size }))
    setEditing(false)
  }

  return (
    <div className={`mt-1 rounded-lg border p-2.5 ${missing ? 'border-red-300 bg-red-50' : 'border-orange-200 bg-orange-50/60'}`}>
      <p className="flex items-center gap-1 text-xs font-semibold text-gray-800">
        <Ruler className="h-3.5 w-3.5 text-orange-500" />
        {missing ? 'Size required — enter height & width (inch)' : 'Change size (inch)'}
      </p>
      <div className="mt-1.5 flex flex-wrap items-center gap-2">
        <input
          type="number" inputMode="decimal" min={SIZE_MIN} max={SIZE_MAX} step="0.25"
          value={h} onChange={(e) => setH(e.target.value)} placeholder="Height"
          className="h-8 w-20 rounded-md border border-gray-300 bg-white px-2 text-sm"
        />
        <span className="text-gray-400">×</span>
        <input
          type="number" inputMode="decimal" min={SIZE_MIN} max={SIZE_MAX} step="0.25"
          value={w} onChange={(e) => setW(e.target.value)} placeholder="Width"
          className="h-8 w-20 rounded-md border border-gray-300 bg-white px-2 text-sm"
        />
        <button type="button" onClick={save} className="h-8 rounded-md bg-orange-500 px-3 text-xs font-semibold text-white hover:bg-orange-600 cursor-pointer">
          Save
        </button>
        {!missing && (
          <button type="button" onClick={() => setEditing(false)} className="h-8 px-2 text-xs text-gray-500 cursor-pointer">
            Cancel
          </button>
        )}
      </div>
      {preview && (
        <p className="mt-1 text-xs text-gray-600">
          {areaSqft(size)} sq ft → {inr(preview.sellingPrice)} each
        </p>
      )}
    </div>
  )
}

export default CartSizeInput
