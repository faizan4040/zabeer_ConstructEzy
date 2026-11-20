'use client'

import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import MediaModal from '@/components/Application/Admin/MediaModal'
import ButtonLoading from '@/components/Application/ButtonLoading'
import { CustomSizeToggle } from '@/components/Application/VariantRowsEditor'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import useFetch from '@/hooks/useFetch'
import { showToast } from '@/lib/showToast'
import { calcDiscount } from '@/lib/variantBulk'
import { ADMIN_DASHBOARD, ADMIN_PRODUCT_VARIANT_SHOW } from '@/routes/AdminPanelRoute'
import axios from 'axios'
import Image from 'next/image'
import React, { use, useEffect, useState } from 'react'

const breadcrumbData = [
  { href: ADMIN_DASHBOARD, label: 'Home' },
  { href: ADMIN_PRODUCT_VARIANT_SHOW, label: 'Product Variants' },
  { href: '', label: 'Edit Product Variant' },
]

const Field = ({ label, children }) => (
  <label className="block">
    <span className="text-sm font-medium">{label}</span>
    <div className="mt-1.5">{children}</div>
  </label>
)

const EditProductVariant = ({ params }) => {
  const { id } = use(params)

  const { data: getVariant, loading: getVariantLoading } = useFetch(`/api/product-variant/get/${id}`)
  const { data: getProduct } = useFetch('/api/product?deleteType=SD&&size=10000')

  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [selectedMedia, setSelectedMedia] = useState([])

  const [productId, setProductId] = useState('')
  const [templates, setTemplates] = useState([]) // [{label, presets, allowCustom}]
  const [attrs, setAttrs] = useState({})         // {label: value}
  const [form, setForm] = useState({ brand: '', sku: '', stock: '', mrp: '', sellingPrice: '' })
  const [requiresCustomSize, setRequiresCustomSize] = useState(false)
  const [priceUnit, setPriceUnit] = useState('piece')

  const productName = getProduct?.data?.find?.((p) => p._id === productId)?.name

  // fill the form from the saved variant
  useEffect(() => {
    if (!getVariant?.success) return
    const v = getVariant.data
    setProductId(String(v?.product?._id || v?.product || ''))
    setAttrs(Object.fromEntries((v?.attributes || []).map((a) => [a.label, a.value])))
    setForm({
      brand: v?.brand || '',
      sku: v?.sku || '',
      stock: v?.stock ?? 0,
      mrp: v?.mrp ?? '',
      sellingPrice: v?.sellingPrice ?? '',
    })
    setRequiresCustomSize(!!v?.requiresCustomSize)
    setPriceUnit(v?.priceUnit === 'sqft' ? 'sqft' : 'piece')
    setSelectedMedia((v?.media || []).map((m) => ({ _id: m._id, url: m.secure_url || m.url })))
  }, [getVariant])

  // option labels from the category + any labels already on this variant
  useEffect(() => {
    if (!productId) return
    axios
      .get(`/api/product-variant/attributes?productId=${productId}`)
      .then(({ data: res }) => setTemplates(res.success ? res.data.attributes || [] : []))
      .catch(() => setTemplates([]))
  }, [productId])

  const labels = [...new Set([...templates.map((t) => t.label), ...Object.keys(attrs)])]
  const labelList = labels.length ? labels : ['Variant']
  const presetsOf = (label) => templates.find((t) => t.label === label)?.presets || []

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))
  const discount = calcDiscount(form.mrp, form.sellingPrice)

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data: response } = await axios.put('/api/product-variant/update', {
        _id: id,
        attributes: labelList.map((label) => ({ label, value: (attrs[label] || '').trim() })),
        brand: form.brand,
        sku: form.sku,
        stock: Number(form.stock),
        mrp: Number(form.mrp),
        sellingPrice: Number(form.sellingPrice),
        media: selectedMedia.map((m) => m._id),
        requiresCustomSize,
        priceUnit,
      })
      if (!response.success) throw new Error(response.message)
      showToast('success', response.message)
    } catch (error) {
      showToast('error', error?.response?.data?.message || error.message)
    } finally {
      setLoading(false)
    }
  }

  if (getVariantLoading && !getVariant) {
    return <p className="p-6 text-sm text-gray-500">Loading...</p>
  }

  return (
    <div>
      <BreadCrumb breadcrumbData={breadcrumbData} />
      <div className="py-4">
        <Card className="py-0 rounded-3xl shadow-sm">
          <CardHeader className="pt-3 px-3 border-b [.border-b]:pb-2">
            <h4 className="text-xl font-semibold">Edit Product Variant</h4>
            {productName && <p className="text-sm text-gray-500">{productName}</p>}
          </CardHeader>

          <CardContent className="pb-5">
            <form onSubmit={onSubmit} className="mt-5 space-y-6">
              {/* Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {labelList.map((label) => {
                  const listId = `edit-opt-${label.replace(/\W+/g, '')}`
                  const presets = presetsOf(label)
                  return (
                    <Field key={label} label={`${label} *`}>
                      <Input
                        value={attrs[label] || ''}
                        onChange={(e) => setAttrs((a) => ({ ...a, [label]: e.target.value }))}
                        list={presets.length ? listId : undefined}
                        placeholder={presets[0] ? `e.g. ${presets[0]}` : ''}
                      />
                      {presets.length > 0 && (
                        <datalist id={listId}>
                          {presets.map((p) => <option key={p} value={p} />)}
                        </datalist>
                      )}
                    </Field>
                  )
                })}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <Field label="Brand *"><Input value={form.brand} onChange={set('brand')} /></Field>
                <Field label="SKU *"><Input value={form.sku} onChange={set('sku')} /></Field>
                <Field label="Stock *"><Input type="number" min="0" step="1" value={form.stock} onChange={set('stock')} /></Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <Field label={`MRP (₹)${requiresCustomSize && priceUnit === 'sqft' ? ' per sq ft' : ''} *`}>
                  <Input type="number" min="0" step="0.01" value={form.mrp} onChange={set('mrp')} />
                </Field>
                <Field label={`Selling price (₹)${requiresCustomSize && priceUnit === 'sqft' ? ' per sq ft' : ''} *`}>
                  <Input type="number" min="0" step="0.01" value={form.sellingPrice} onChange={set('sellingPrice')} />
                </Field>
                <Field label="Discount (%)">
                  <Input value={discount} readOnly className="text-gray-500" />
                </Field>
              </div>

              <CustomSizeToggle
                checked={requiresCustomSize}
                onChange={setRequiresCustomSize}
                priceUnit={priceUnit}
                onPriceUnitChange={setPriceUnit}
              />

              {/* Media */}
              <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
                <MediaModal
                  open={open}
                  setOpen={setOpen}
                  selectedMedia={selectedMedia}
                  setSelectedMedia={setSelectedMedia}
                  isMultiple={true}
                />
                <div
                  onClick={() => setOpen(true)}
                  className="cursor-pointer rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 dark:bg-card p-5 text-center text-sm font-semibold text-gray-600 hover:border-orange-400 hover:bg-orange-50"
                >
                  Click to change photos
                </div>
                {selectedMedia.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {selectedMedia.map((media) => (
                      <div key={media._id} className="group relative aspect-square overflow-hidden rounded-xl border bg-white">
                        <Image src={media.url} alt="" fill className="object-cover" />
                        <button
                          type="button"
                          onClick={() => setSelectedMedia((prev) => prev.filter((m) => m._id !== media._id))}
                          className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white text-sm font-bold opacity-100 sm:opacity-0 group-hover:opacity-100 hover:bg-red-500 cursor-pointer"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <ButtonLoading
                loading={loading}
                type="submit"
                text="Save Changes"
                className="bg-[#fff0ea] text-orange-400 hover:bg-orange-500 hover:text-white"
              />
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default EditProductVariant
