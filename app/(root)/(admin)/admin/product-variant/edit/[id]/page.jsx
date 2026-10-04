'use client'

import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import MediaModal from '@/components/Application/Admin/MediaModal'
import ButtonLoading from '@/components/Application/ButtonLoading'
import Select from '@/components/Application/Select'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import useFetch from '@/hooks/useFetch'
import { showToast } from '@/lib/showToast'
import { sizes } from '@/lib/utils'
import { zSchema } from '@/lib/zodSchema'
import { ADMIN_DASHBOARD, ADMIN_PRODUCT_VARIANT_SHOW } from '@/routes/AdminPanelRoute'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import Image from 'next/image'
import React, { use, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

const genderOptions = [
  { label: "Men", value: "men" },
  { label: "Women", value: "women" },
  { label: "Kids", value: "kids" },
]

const breadcrumbData = [
  { href: ADMIN_DASHBOARD, label: 'Home' },
  { href: ADMIN_PRODUCT_VARIANT_SHOW, label: 'Product Variants' },
  { href: '', label: 'Edit Product Variant' },
]

const EditProductVariant = ({ params }) => {
  const { id } = use(params)  // same as EditProduct

  const [loading, setLoading] = useState(false)
  const [productOption, setProductOption] = useState([])
  const [open, setOpen] = useState(false)
  const [selectedMedia, setSelectedMedia] = useState([])

  // same pattern as EditProduct
  const { data: getProduct } = useFetch('/api/product?deleteType=SD&&size=10000')
  const { data: getVariant, loading: getVariantLoading } = useFetch(`/api/product-variant/get/${id}`)

  // add this right here
  useEffect(() => {
    console.log('getVariant:', getVariant)
    console.log('getVariant.data:', getVariant?.data)
  }, [getVariant])

  const formSchema = zSchema.pick({
    product: true,
    sku: true,
    color: true,
    size: true,
    gender: true,
    stock: true,
    mrp: true,
    sellingPrice: true,
    discountPercentage: true,
  })

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      product: "",
      sku: "",
      color: "",
      size: "",
      gender: "",
      stock: 0,
      mrp: 0,
      sellingPrice: 0,
      discountPercentage: 0,
    },
  })

  // populate product dropdown options
  useEffect(() => {
    if (getProduct && getProduct.success) {
      const options = getProduct.data.map((product) => ({
        label: product.name,
        value: product._id,
      }))
      setProductOption(options)
    }
  }, [getProduct])

  // populate form fields — same pattern as EditProduct
useEffect(() => {
  if (getVariant && getVariant.success) {
    const variant = getVariant.data  //directly the variant object
    form.reset({
      product: variant?.product?._id || variant?.product || "",
      sku: variant?.sku || "",
      color: variant?.color || "",
      size: variant?.size || "",
      gender: variant?.gender || "",
      stock: variant?.stock || 0,
      mrp: variant?.mrp || 0,
      sellingPrice: variant?.sellingPrice || 0,
      discountPercentage: variant?.discountPercentage || 0,
    })

    if (variant?.media && variant.media.length > 0) {
      const media = variant.media.map((m) => ({
        _id: m._id,
        url: m.secure_url || m.url,
      }))
      setSelectedMedia(media)
    }
  }
}, [getVariant])

  // auto calculate discount
  useEffect(() => {
    const mrp = form.getValues('mrp') || 0
    const sellingPrice = form.getValues('sellingPrice') || 0
    if (mrp > 0 && sellingPrice > 0) {
      const discountPercentage = ((mrp - sellingPrice) / mrp * 100)
      form.setValue('discountPercentage', Math.round(discountPercentage))
    }
  }, [form.watch('mrp'), form.watch('sellingPrice')])

  const onSubmit = async (values) => {
    setLoading(true)
    try {
      if (selectedMedia.length <= 0) {
        return showToast('error', 'Please select media.')
      }

      const mediaIds = selectedMedia.map(media => media._id)
      values.media = mediaIds

      // PUT request with id — same as EditProduct
      const { data: response } = await axios.put(`/api/product-variant/update`, { ...values, _id: id })
      if (!response.success) {
        throw new Error(response.message)
      }

      showToast('success', response.message)
    } catch (error) {
      showToast('error', error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <BreadCrumb breadcrumbData={breadcrumbData} />
      <div className="py-4">
        <Card className="py-0 rounded-3xl shadow-sm">
          <CardHeader className="pt-3 px-3 border-b [.border-b]:pb-2">
            <h4 className="text-xl font-semibold">Edit Product Variant</h4>
          </CardHeader>

          <CardContent className="pb-5">
            <div className="mt-5">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                  {/* ===== Row 1: Product + SKU ===== */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FormField
                      control={form.control}
                      name="product"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Product *</FormLabel>
                          <FormControl>
                            <Select
                              options={productOption}
                              selected={field.value}
                              setSelected={field.onChange}
                              isMulti={false}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="sku"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SKU *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter SKU" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* ===== Row 2: Color + Size ===== */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FormField
                      control={form.control}
                      name="color"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Color *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter color" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="size"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Size *</FormLabel>
                          <FormControl>
                            {/* only render after data loads — same as Editor in EditProduct */}
                            {!getVariantLoading && (
                              <Select
                                options={sizes}
                                selected={field.value}
                                setSelected={field.onChange}
                                isMulti={false}
                              />
                            )}
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* ===== Row 3: Selling Price + MRP ===== */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FormField
                      control={form.control}
                      name="sellingPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Selling Price *</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="Enter selling price" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="mrp"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Original Price (MRP) *</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="Enter MRP" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* ===== Row 4: Discount + Gender ===== */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FormField
                      control={form.control}
                      name="discountPercentage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Discount (%)</FormLabel>
                          <FormControl>
                            <Input type="number" readOnly {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gender *</FormLabel>
                          <FormControl>
                            {/* only render after data loads */}
                            {!getVariantLoading && (
                              <Select
                                options={genderOptions}
                                selected={field.value}
                                setSelected={field.onChange}
                                isMulti={false}
                              />
                            )}
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* ===== Row 5: Stock ===== */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FormField
                      control={form.control}
                      name="stock"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Stock Quantity *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Enter stock quantity"
                              value={field.value}
                              onChange={(e) => field.onChange(e.target.valueAsNumber)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* ===== Media ===== */}
                  <div className="md:col-span-2 border-dashed rounded p-5 text-center">
                    <MediaModal
                      open={open}
                      setOpen={setOpen}
                      selectedMedia={selectedMedia}
                      setSelectedMedia={setSelectedMedia}
                      isMultiple={true}
                    />

                    <div className="mt-6 w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-background p-4 shadow-sm">

                      {/* Upload Area */}
                      <div
                        onClick={() => setOpen(true)}
                        className="cursor-pointer rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 dark:bg-card p-6 text-center transition hover:border-orange-400 hover:bg-orange-50"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <div className="rounded-full bg-orange-100 p-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M12 12v9m0-9l-3 3m3-3l3 3m0-12a4 4 0 00-8 0" />
                            </svg>
                          </div>
                          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Click to upload or select media
                          </p>
                          <p className="text-xs text-gray-500">JPG, PNG, WEBP • Max 5 images</p>
                        </div>
                      </div>

                      {/* Selected Images Preview */}
                      {selectedMedia.length > 0 && (
                        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {selectedMedia.map((media) => (
                            <div key={media._id} className="group relative aspect-square overflow-hidden rounded-xl border bg-white shadow-sm">
                              <Image
                                src={media.url}
                                alt=""
                                fill
                                className="object-cover transition-transform group-hover:scale-105"
                              />
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setSelectedMedia(prev => prev.filter(item => item._id !== media._id))
                                }}
                                className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white text-sm font-bold leading-none opacity-0 backdrop-blur transition-all group-hover:opacity-100 hover:bg-red-500 hover:scale-105 cursor-pointer"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ===== Submit ===== */}
                  <div className="mb-3 mt-5">
                    <ButtonLoading
                      loading={loading}
                      type="submit"
                      text="+ Save Changes"
                      className="bg-[#fff0ea] cursor-pointer text-orange-400 font-mono hover:bg-orange-500 hover:text-white"
                    />
                  </div>

                </form>
              </Form>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default EditProductVariant