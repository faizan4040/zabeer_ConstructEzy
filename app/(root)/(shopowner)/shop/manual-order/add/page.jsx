'use client'

import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import Image from 'next/image'

import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import Select from '@/components/Application/Select'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import useFetch from '@/hooks/useFetch'
import { showToast } from '@/lib/showToast'
import { SHOP_OWNER_DASHBOARD, SHOP_OWNER_MANUAL_ORDER_SHOW } from '@/routes/ShopOwnerPanelRoute'

import {
  FiUser, FiMail, FiPhone, FiMapPin, FiShoppingBag,
  FiTag, FiDollarSign, FiUploadCloud, FiX, FiCheckCircle,
  FiArrowRight, FiPackage,
} from 'react-icons/fi'
import { MdOutlineInventory2 } from 'react-icons/md'
import { BsBoxSeam, BsReceipt, BsCashCoin } from 'react-icons/bs'
import { HiSparkles } from 'react-icons/hi'
import { TbFileInvoice } from 'react-icons/tb'
import { RiShoppingBag3Line } from 'react-icons/ri'

const manualOrderSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().min(10, 'Enter at least 10 digits'),
  address: z.string().min(1, 'Address is required'),
  productName: z.string().min(1, 'Product name is required'),
  category: z.string().min(1, 'Category is required'),
  qty: z.coerce.number().min(1, 'Min qty is 1'),
  price: z.coerce.number().min(0, 'Price must be ≥ 0'),
})

const breadcrumbData = [
  { href: SHOP_OWNER_DASHBOARD, label: 'Home' },
  { href: SHOP_OWNER_MANUAL_ORDER_SHOW, label: 'Manual Orders' },
  { href: '', label: 'Add Manual Order' },
]

const ShopOwnerManualOrderAdd = () => {
  const [submitting, setSubmitting] = useState(false)
  const [categoryOption, setCategoryOption] = useState([])
  const [media, setMedia] = useState(null) // { url, uploading }
  const [isDragging, setIsDragging] = useState(false)

  const { data: getCategory } = useFetch('/api/shopowner/category/get')
  useEffect(() => {
    if (getCategory?.success) {
      setCategoryOption(getCategory.data.map((c) => ({ label: c.name, value: c._id })))
    }
  }, [getCategory])

  const form = useForm({
    resolver: zodResolver(manualOrderSchema),
    defaultValues: { name: '', email: '', phone: '', address: '', productName: '', category: '', qty: 1, price: 0 },
  })
  const { watch, formState: { errors } } = form
  const watchQty = Number(watch('qty') || 0)
  const watchPrice = Number(watch('price') || 0)
  const lineTotal = watchQty * watchPrice

  /* ── direct Cloudinary upload (shopowner-scoped, no Media doc needed) ── */
  const uploadFile = async (file) => {
    const localUrl = URL.createObjectURL(file)
    setMedia({ url: localUrl, uploading: true })

    try {
      const { data: sig } = await axios.post('/api/shopowner/cloudinary-signature')
      if (!sig.success) throw new Error(sig.message)

      const { signature, timestamp, api_key, cloud_name, folder } = sig.data
      const cloudForm = new FormData()
      cloudForm.append('file', file)
      cloudForm.append('api_key', api_key)
      cloudForm.append('timestamp', timestamp)
      cloudForm.append('signature', signature)
      if (folder) cloudForm.append('folder', folder)

      const { data: cloudRes } = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloud_name}/auto/upload`,
        cloudForm
      )

      URL.revokeObjectURL(localUrl)
      setMedia({ url: cloudRes.secure_url, uploading: false })
    } catch (error) {
      URL.revokeObjectURL(localUrl)
      setMedia(null)
      showToast('error', error?.response?.data?.message || error.message || 'Image upload failed.')
    }
  }

  const handleFiles = (fileList) => {
    const file = Array.from(fileList).find((f) => f.type.startsWith('image/'))
    if (file) uploadFile(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files)
  }

  const onSubmit = async (values) => {
    if (!media || media.uploading) {
      showToast('error', media?.uploading ? 'Please wait — image still uploading.' : 'Please add a product image.')
      return
    }
    setSubmitting(true)
    try {
      const { data } = await axios.post('/api/shopowner/manual-order', { ...values, media: media.url })
      if (!data.success) throw new Error(data.message)
      showToast('success', 'Manual order created successfully!')
      form.reset()
      setMedia(null)
    } catch (err) {
      showToast('error', err?.response?.data?.message || err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto pb-16">
      <BreadCrumb breadcrumbData={breadcrumbData} />

      <div className="mt-4 mb-6 rounded-2xl sm:rounded-3xl bg-linear-to-br from-orange-500 via-orange-400 to-amber-300 p-6 md:p-8 text-white relative overflow-hidden">
        <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/10" />
        <div className="relative flex items-center gap-3">
          <div className="rounded-2xl bg-white/20 p-3 backdrop-blur-sm">
            <TbFileInvoice className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <HiSparkles size={12} />
              <span className="text-[11px] font-bold uppercase tracking-wider">Your Shop</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold">Create a Manual Order</h1>
            <p className="text-sm text-orange-50 mt-0.5">For phone/WhatsApp orders — fill in customer & product details.</p>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

          {/* Customer info */}
          <div className="bg-white dark:bg-card border rounded-2xl shadow-sm p-5 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-600">1</span>
              <h4 className="font-semibold text-sm">Customer Information</h4>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <label className="text-xs font-semibold text-gray-500 flex items-center gap-1 mb-1"><FiUser size={12} />Full Name *</label>
                  <FormControl><input className="w-full h-10 rounded-lg border px-3 text-sm" placeholder="e.g. Rahul Sharma" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem>
                  <label className="text-xs font-semibold text-gray-500 flex items-center gap-1 mb-1"><FiPhone size={12} />Phone *</label>
                  <FormControl><input className="w-full h-10 rounded-lg border px-3 text-sm" placeholder="9876543210" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <label className="text-xs font-semibold text-gray-500 flex items-center gap-1 mb-1"><FiMail size={12} />Email</label>
                  <FormControl><input className="w-full h-10 rounded-lg border px-3 text-sm" placeholder="email@example.com" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="address" render={({ field }) => (
              <FormItem>
                <label className="text-xs font-semibold text-gray-500 flex items-center gap-1 mb-1"><FiMapPin size={12} />Delivery Address *</label>
                <FormControl><textarea rows={3} className="w-full rounded-lg border px-3 py-2 text-sm" placeholder="Full address" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>

          {/* Product info */}
          <div className="bg-white dark:bg-card border rounded-2xl shadow-sm p-5 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-600">2</span>
              <h4 className="font-semibold text-sm">Product Details</h4>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <FormField control={form.control} name="productName" render={({ field }) => (
                <FormItem>
                  <label className="text-xs font-semibold text-gray-500 flex items-center gap-1 mb-1"><FiShoppingBag size={12} />Product Name *</label>
                  <FormControl><input className="w-full h-10 rounded-lg border px-3 text-sm" placeholder="e.g. UltraTech Cement 50kg" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="category" render={({ field }) => (
                <FormItem>
                  <label className="text-xs font-semibold text-gray-500 flex items-center gap-1 mb-1"><FiTag size={12} />Category *</label>
                  <FormControl>
                    <Select options={categoryOption} selected={field.value} setSelected={field.onChange} isMulti={false} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField control={form.control} name="qty" render={({ field }) => (
                <FormItem>
                  <label className="text-xs font-semibold text-gray-500 flex items-center gap-1 mb-1"><MdOutlineInventory2 size={12} />Qty *</label>
                  <FormControl><input type="number" min="1" className="w-full h-10 rounded-lg border px-3 text-sm" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="price" render={({ field }) => (
                <FormItem>
                  <label className="text-xs font-semibold text-gray-500 flex items-center gap-1 mb-1"><FiDollarSign size={12} />Unit Price *</label>
                  <FormControl><input type="number" min="0" step="0.01" className="w-full h-10 rounded-lg border px-3 text-sm" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div>
                <label className="text-xs font-semibold text-gray-500 flex items-center gap-1 mb-1"><BsCashCoin size={12} />Line Total</label>
                <div className="h-10 rounded-lg bg-orange-50 border border-orange-200 flex items-center justify-center font-bold text-orange-600 text-sm">
                  ₹{lineTotal.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            {/* image upload */}
            <div>
              <label className="text-xs font-semibold text-gray-500 flex items-center gap-1 mb-1"><FiUploadCloud size={12} />Product Image *</label>

              {!media && (
                <div
                  role="button" tabIndex={0}
                  onClick={() => document.getElementById('manual-order-file-input').click()}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition ${
                    isDragging ? 'border-orange-500 bg-orange-100' : 'border-gray-300 bg-gray-50 hover:border-orange-400 hover:bg-orange-50'
                  }`}
                >
                  <input id="manual-order-file-input" type="file" accept="image/*" hidden onChange={(e) => { handleFiles(e.target.files); e.target.value = '' }} />
                  <FiUploadCloud className="mx-auto mb-2 text-yellow-500" size={24} />
                  <p className="text-sm font-semibold text-gray-700">{isDragging ? 'Drop image here' : 'Click or drag to upload'}</p>
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP</p>
                </div>
              )}

              {media && (
                <div className="relative w-28 h-28 rounded-xl overflow-hidden border">
                  <Image src={media.url} alt="" fill className="object-cover" unoptimized={media.uploading} />
                  {media.uploading && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                  {!media.uploading && (
                    <button type="button" onClick={() => setMedia(null)} className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center">
                      <FiX size={12} />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* footer */}
          <div className="bg-white dark:bg-card border rounded-2xl shadow-sm p-5 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <FiPackage className="text-yellow-500" />
              {media && !media.uploading && <FiCheckCircle className="text-green-500" />}
              Ready to create this order
            </div>
            <button
              type="submit"
              disabled={submitting || media?.uploading}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-linear-to-r from-orange-500 to-orange-600 text-white font-semibold hover:from-orange-600 hover:to-orange-700 disabled:opacity-60 transition"
            >
              {submitting ? (<><RiShoppingBag3Line className="animate-spin" />Creating…</>) : (<><BsReceipt />Create Order<FiArrowRight /></>)}
            </button>
          </div>
        </form>
      </Form>
    </div>
  )
}

export default ShopOwnerManualOrderAdd