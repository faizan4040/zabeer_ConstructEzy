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
import { zSchema } from '@/lib/zodSchema'
import { ADMIN_DASHBOARD, ADMIN_PRODUCT_VARIANT_SHOW } from '@/routes/AdminPanelRoute'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

const breadcrumbData = [
  { href: ADMIN_DASHBOARD, label: 'Home' },
  { href: ADMIN_PRODUCT_VARIANT_SHOW, label: 'Product Variants' },
  { href: '', label: 'Add Product Variants' },
]

const BRAND_DATALIST_ID = 'brand-suggestions'

const AddProductVariant = () => {
  const [loading, setLoading] = useState(false)
  const [productOption, setProductOption] = useState([])
  const [brandOption, setBrandOption] = useState([])
  const { data: getProduct } = useFetch('/api/product?deleteType=SD&&size=10000')
  const { data: getBrand } = useFetch('/api/product-variant/brands')

  // ===== Dynamic attributes (replaces hardcoded color/size) =====
  const [categoryName, setCategoryName] = useState('')
  const [attributeTemplates, setAttributeTemplates] = useState([]) // [{label, presets, allowCustom}]
  const [attributeValues, setAttributeValues] = useState({})       // {label: value}
  const [customInputFor, setCustomInputFor] = useState(null)       // which attribute label has its custom-input open
  const [attributesLoading, setAttributesLoading] = useState(false)

  // media modal states
  const [open, setOpen] = useState(false)
  const [selectedMedia, setSelectedMedia] = useState([])

  useEffect(() => {
    if (getProduct && getProduct.success) {
      const data = getProduct.data
      const options = data.map((product) => ({ label: product.name, value: product._id }))
      setProductOption(options)
    }
  }, [getProduct])

  useEffect(() => {
    if (getBrand && getBrand.success) {
      setBrandOption(getBrand.data)
    }
  }, [getBrand])

  const formSchema = zSchema.pick({
    product: true,
    sku: true,
    brand: true,
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
      brand: "",
      stock: 0,
      mrp: 0,
      sellingPrice: 0,
      discountPercentage: 0,
    },
  })

  // discount percentage calculation
  useEffect(() => {
    const mrp = form.getValues('mrp') || 0
    const sellingPrice = form.getValues('sellingPrice') || 0

    if (mrp > 0 && sellingPrice > 0) {
      const discountPercentage = ((mrp - sellingPrice) / mrp * 100)
      form.setValue('discountPercentage', Math.round(discountPercentage))
    }
  }, [form.watch('mrp'), form.watch('sellingPrice')])

  // ===== when Product changes, fetch its subcategory's attribute template =====
  const selectedProductId = form.watch('product')

  useEffect(() => {
    const fetchAttributes = async () => {
      if (!selectedProductId) {
        setAttributeTemplates([])
        setAttributeValues({})
        setCategoryName('')
        return
      }
      setAttributesLoading(true)
      try {
        const { data: res } = await axios.get(`/api/product-variant/attributes?productId=${selectedProductId}`)
        if (res.success) {
          setAttributeTemplates(res.data.attributes || [])
          setCategoryName(res.data.categoryName || '')
          setAttributeValues({}) // reset previous selections on product change
        } else {
          setAttributeTemplates([])
        }
      } catch (error) {
        setAttributeTemplates([])
      } finally {
        setAttributesLoading(false)
      }
    }
    fetchAttributes()
  }, [selectedProductId])

  const handleAttributeSelect = (label, value) => {
    setAttributeValues(prev => ({ ...prev, [label]: value }))
  }

  const onSubmit = async (values) => {
    setLoading(true)
    try {
      if (selectedMedia.length <= 0) {
        return showToast('error', 'Please select media.')
      }

      if (attributeTemplates.length > 0) {
        const missing = attributeTemplates.find(t => !attributeValues[t.label])
        if (missing) {
          return showToast('error', `Please select ${missing.label}.`)
        }
      }

      const mediaIds = selectedMedia.map(media => media._id)
      values.media = mediaIds
      values.attributes = Object.entries(attributeValues).map(([label, value]) => ({ label, value }))

      const { data: response } = await axios.post('/api/product-variant/create', values)
      if (!response.success) {
        throw new Error(response.message)
      }

      form.reset()
      setAttributeValues({})
      setSelectedMedia([])
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
      <div className="py-4 ">
        <Card className="py-0 rounded-3xl shadow-sm">
          <CardHeader className="pt-3 px-3 border-b [.border-b]:pb-2">
            <h4 className="text-xl font-semibold">Add Product Variant</h4>
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

                  {/* ===== Dynamic Attributes (Size / Weight / Diameter / Color...) ===== */}
                  {selectedProductId && (
                    <div className="rounded-2xl border border-gray-200 p-4">
                      <p className="text-sm font-semibold text-gray-700 mb-3">
                        {categoryName ? `${categoryName} — Options` : 'Options'}
                      </p>

                      {attributesLoading && (
                        <p className="text-sm text-gray-400">Loading options...</p>
                      )}

                      {!attributesLoading && attributeTemplates.length === 0 && (
                        <p className="text-sm text-gray-400">
                          No custom options set for this product's category. You can still add
                          variants — just contact Admin to set up size/weight options for this category.
                        </p>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {attributeTemplates.map((tmpl) => (
                          <div key={tmpl.label}>
                            <FormLabel className="mb-2 block">{tmpl.label} *</FormLabel>

                            <div className="flex flex-wrap gap-2">
                              {tmpl.presets.map((preset) => (
                                <button
                                  key={preset}
                                  type="button"
                                  onClick={() => {
                                    handleAttributeSelect(tmpl.label, preset)
                                    setCustomInputFor(null)
                                  }}
                                  className={`px-3 py-1.5 rounded-lg border text-sm transition-colors cursor-pointer ${
                                    attributeValues[tmpl.label] === preset
                                      ? 'bg-orange-500 text-white border-orange-500'
                                      : 'bg-white text-gray-700 border-gray-300 hover:border-orange-300'
                                  }`}
                                >
                                  {preset}
                                </button>
                              ))}

                              {tmpl.allowCustom && (
                                <button
                                  type="button"
                                  onClick={() => setCustomInputFor(tmpl.label)}
                                  className={`px-3 py-1.5 rounded-lg border text-sm border-dashed cursor-pointer ${
                                    customInputFor === tmpl.label
                                      ? 'border-orange-400 text-yellow-500'
                                      : 'border-gray-300 text-gray-500 hover:border-orange-300'
                                  }`}
                                >
                                  + Custom
                                </button>
                              )}
                            </div>

                            {tmpl.allowCustom && customInputFor === tmpl.label && (
                              <Input
                                autoFocus
                                placeholder={`Enter custom ${tmpl.label.toLowerCase()}`}
                                className="mt-2"
                                defaultValue={
                                  attributeValues[tmpl.label] && !tmpl.presets.includes(attributeValues[tmpl.label])
                                    ? attributeValues[tmpl.label]
                                    : ''
                                }
                                onChange={(e) => handleAttributeSelect(tmpl.label, e.target.value)}
                              />
                            )}

                            {attributeValues[tmpl.label] && (
                              <p className="text-xs text-gray-500 mt-1">
                                Selected: <span className="font-medium">{attributeValues[tmpl.label]}</span>
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ===== Row: Selling Price + MRP ===== */}
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

                  {/* ===== Row: Discount + Brand ===== */}
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
                      name="brand"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Brand *</FormLabel>
                          <FormControl>
                            <div>
                              <Input
                                placeholder="e.g. UltraTech, ACC, Tata Steel"
                                list={BRAND_DATALIST_ID}
                                {...field}
                              />
                              <datalist id={BRAND_DATALIST_ID}>
                                {brandOption.map((brand) => (
                                  <option key={brand} value={brand} />
                                ))}
                              </datalist>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

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
                  <div className="border-dashed rounded p-5 text-center">
                    <MediaModal
                      open={open}
                      setOpen={setOpen}
                      selectedMedia={selectedMedia}
                      setSelectedMedia={setSelectedMedia}
                      isMultiple={true}
                    />

                    <div className="mt-6 w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-background p-4 shadow-sm">
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
                          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Click to upload or select media</p>
                          <p className="text-xs text-gray-500">JPG, PNG, WEBP • Max 5 images</p>
                        </div>
                      </div>

                      {selectedMedia.length > 0 && (
                        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {selectedMedia.map((media) => (
                            <div key={media._id} className="group relative aspect-square overflow-hidden rounded-xl border bg-white shadow-sm">
                              <Image src={media.url} alt="" fill className="object-cover transition-transform group-hover:scale-105" />
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
                  <ButtonLoading
                    loading={loading}
                    type="submit"
                    text="+ Add Product Variant"
                    className="bg-[#fff0ea] text-orange-400 hover:bg-orange-500 hover:text-white"
                  />

                </form>
              </Form>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default AddProductVariant
















// 'use client'

// import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
// import MediaModal from '@/components/Application/Admin/MediaModal'
// import ButtonLoading from '@/components/Application/ButtonLoading'
// import Select from '@/components/Application/Select'
// import { Card, CardContent, CardHeader } from '@/components/ui/card'
// import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
// import { Input } from '@/components/ui/input'
// import useFetch from '@/hooks/useFetch'
// import { showToast } from '@/lib/showToast'
// import { sizes } from '@/lib/utils'
// import { zSchema } from '@/lib/zodSchema'
// import { ADMIN_DASHBOARD, ADMIN_PRODUCT_VARIANT_SHOW } from '@/routes/AdminPanelRoute'
// import { zodResolver } from '@hookform/resolvers/zod'
// import axios from 'axios'
// import Image from 'next/image'
// import React, { useEffect, useState } from 'react'
// import { useForm } from 'react-hook-form'




// const genderOptions = [
//   { label: "Men", value: "men" },
//   { label: "Women", value: "women" },
//   { label: "Kids", value: "kids" },
// ]


// const breadcrumbData = [
//   {href: ADMIN_DASHBOARD, label: 'Home'},
//   {href: ADMIN_PRODUCT_VARIANT_SHOW, label: 'Product Variants'},
//   {href: '', label: 'Add Product Variants'},
// ]

//     const AddProductVariant = () => {
//     const [loading, setLoading] = useState(false)
//     const [productOption, setProductOption] = useState([])
//     const {data: getProduct} = useFetch('/api/product?deleteType=SD&&size=10000')
    

//     //media modal states
//     const [open, setOpen] = useState(false)
//     const [selectedMedia, setSelectedMedia] = useState([])
    

//     useEffect(() => {
//        if(getProduct && getProduct.success){
//          const data = getProduct.data
//          const options = data.map((product) => ({ label: product.name, value: product._id }))
//          setProductOption(options)
//        }
//     },[getProduct])
     
    
//     const formSchema = zSchema.pick({
//       product: true,        
//       sku: true,            
//       color: true,          
//       size: true,   
//       gender: true,
//       stock: true,  
//       mrp: true,
//       sellingPrice: true,
//       discountPercentage: true,
//     })

 
//   const form = useForm({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       product: "",        
//       sku: "",            
//       color: "",          
//       size: "",   
//       gender: "",        
//       stock: 0,           
//       mrp: 0,
//       sellingPrice: 0,
//       discountPercentage: 0,
//     },
//   })



//   //discount percentage calculation
//   useEffect(() => {
//     const mrp = form.getValues('mrp') || 0
//     const sellingPrice = form.getValues('sellingPrice') || 0

//      if(mrp > 0 && sellingPrice > 0){
//        const discountPercentage = ((mrp - sellingPrice) / mrp * 100)
//        form.setValue('discountPercentage', Math.round(discountPercentage))
//        }
    
//   },[form.watch('mrp'), form.watch('sellingPrice')])

   
//   const onSubmit = async (values) => {
//     setLoading(true)
//    try{
//       if(selectedMedia.length <= 0){ 
//         return showToast('error', 'Please select media.')
//       }
      
//       const mediaIds = selectedMedia.map(media => media._id)
//       values.media = mediaIds

//       const {data: response} = await axios.post('/api/product-variant/create', values)
//       if(!response.success){
//         throw new Error(response.message)
//       }
      
//       form.reset()
//       showToast('success', response.message)
//     } catch(error){
//       showToast('error', error.message)
//    } finally{
//     setLoading(false)
//    }
//   }


//   return (
//     <div>
//         <BreadCrumb breadcrumbData={breadcrumbData}/>
//         <div className="py-4 ">
//         <Card className="py-0 rounded-3xl shadow-sm">
//             <CardHeader className="pt-3 px-3 border-b [.border-b]:pb-2">
//             <h4 className="text-xl font-semibold">Add Product Variant</h4>
//             </CardHeader>

//             <CardContent className="pb-5">
//             <div className="mt-5">
//                 <Form {...form}>
//                 <form
//   onSubmit={form.handleSubmit(onSubmit)}
//   className="space-y-6"
// >

// {/* ===== Row 1: Product + SKU ===== */}
// <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//   <FormField
//     control={form.control}
//     name="product"
//     render={({ field }) => (
//       <FormItem>
//         <FormLabel>Product *</FormLabel>
//         <FormControl>
//           <Select
//             options={productOption}
//             selected={field.value}
//             setSelected={field.onChange}
//             isMulti={false}
//           />
//         </FormControl>
//         <FormMessage />
//       </FormItem>
//     )}
//   />

//   <FormField
//     control={form.control}
//     name="sku"
//     render={({ field }) => (
//       <FormItem>
//         <FormLabel>SKU *</FormLabel>
//         <FormControl>
//           <Input placeholder="Enter SKU" {...field} />
//         </FormControl>
//         <FormMessage />
//       </FormItem>
//     )}
//   />
// </div>

// {/* ===== Row 2: Color + Size ===== */}
// <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//   <FormField
//     control={form.control}
//     name="color"
//     render={({ field }) => (
//       <FormItem>
//         <FormLabel>Color *</FormLabel>
//         <FormControl>
//           <Input placeholder="Enter color" {...field} />
//         </FormControl>
//         <FormMessage />
//       </FormItem>
//     )}
//   />

//   <FormField
//     control={form.control}
//     name="size"
//     render={({ field }) => (
//       <FormItem>
//         <FormLabel>Size *</FormLabel>
//         <FormControl>
//           <Select
//             options={sizes}
//             selected={field.value}
//             setSelected={field.onChange}
//             isMulti={false}
//           />
//         </FormControl>
//         <FormMessage />
//       </FormItem>
//     )}
//   />
// </div>

// {/* ===== Row 3: Stock + Original Price ===== */}
// <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

//     <FormField
//     control={form.control}
//     name="sellingPrice"
//     render={({ field }) => (
//       <FormItem>
//         <FormLabel>Selling Price *</FormLabel>
//         <FormControl>
//           <Input type="number" placeholder="Enter selling price" {...field} />
//         </FormControl>
//         <FormMessage />
//       </FormItem>
//     )}
//   />

//   <FormField
//     control={form.control}
//     name="mrp"
//     render={({ field }) => (
//       <FormItem>
//         <FormLabel>Original Price (MRP) *</FormLabel>
//         <FormControl>
//           <Input type="number" placeholder="Enter MRP" {...field} />
//         </FormControl>
//         <FormMessage />
//       </FormItem>
//     )}
//   />
// </div>

// {/* ===== Row 4: Selling Price + Discount ===== */}
// <div className="grid grid-cols-1 md:grid-cols-2 gap-5">


//   <FormField
//     control={form.control}
//     name="discountPercentage"
//     render={({ field }) => (
//       <FormItem>
//         <FormLabel>Discount (%)</FormLabel>
//         <FormControl>
//           <Input type="number" readOnly {...field} />
//         </FormControl>
//         <FormMessage />
//       </FormItem>
//     )}
//   />


//    <FormField
//     control={form.control}
//     name="gender"
//     render={({ field }) => (
//       <FormItem>
//         <FormLabel>Gender *</FormLabel>
//         <FormControl>
//           <Select
//             options={genderOptions}
//             selected={field.value}
//             setSelected={field.onChange}
//             isMulti={false}
//           />
//         </FormControl>
//         <FormMessage />
//       </FormItem>
//     )}
//   />
// </div>

// <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//    <FormField
//   control={form.control}
//   name="stock"
//   render={({ field }) => (
//     <FormItem>
//       <FormLabel>Stock Quantity *</FormLabel>
//       <FormControl>
//         <Input
//           type="number"
//           placeholder="Enter stock quantity"
//           value={field.value}
//           onChange={(e) => field.onChange(e.target.valueAsNumber)}
//         />
//       </FormControl>
//       <FormMessage />
//     </FormItem>
//   )}
// />
// </div>



// {/* ===== Media ===== */}
// <div className="border-dashed rounded p-5 text-center">
//   <MediaModal
//     open={open}
//     setOpen={setOpen}
//     selectedMedia={selectedMedia}
//     setSelectedMedia={setSelectedMedia}
//     isMultiple={true}
//   />

//   {selectedMedia.length > 0 && (
//     <div className="flex flex-wrap justify-center gap-2 mt-3">
//       {selectedMedia.map(media => (
//         <div key={media._id} className="h-24 w-24 border rounded overflow-hidden">
//           <Image
//             src={media.url}
//             width={100}
//             height={100}
//             alt=""
//             className="w-full h-full object-cover"
//           />
//         </div>
//       ))}
//     </div>
//   )}

// {/* FULL MEDIA SECTION */}
// <div className="
//   mt-6
//   w-full
//   rounded-2xl
//   border border-gray-200 dark:border-gray-700
//   bg-white dark:bg-background
//   p-4
//   shadow-sm
// ">

//   {/* Upload Area */}
//   <div
//     onClick={() => setOpen(true)}
//     className="
//       cursor-pointer
//       rounded-xl
//       border-2 border-dashed border-gray-300
//       bg-gray-50 dark:bg-card
//       p-6
//       text-center
//       transition
//       hover:border-orange-400
//       hover:bg-orange-50
//     "
//   >
//     <div className="flex flex-col items-center gap-2">
//       <div className="rounded-full bg-orange-100 p-3">
//         <svg
//           xmlns="http://www.w3.org/2000/svg"
//           className="h-6 w-6 text-yellow-500"
//           fill="none"
//           viewBox="0 0 24 24"
//           stroke="currentColor"
//         >
//           <path
//             strokeLinecap="round"
//             strokeLinejoin="round"
//             strokeWidth={2}
//             d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M12 12v9m0-9l-3 3m3-3l3 3m0-12a4 4 0 00-8 0"
//           />
//         </svg>
//       </div>

//       <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
//         Click to upload or select media
//       </p>
//       <p className="text-xs text-gray-500">
//         JPG, PNG, WEBP • Max 5 images
//       </p>
//     </div>
//   </div>

//   {/* Selected Images Preview */}
//   {selectedMedia.length > 0 && (
//     <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
//       {selectedMedia.map((media) => (
//         <div
//           key={media._id}
//           className="
//             group
//             relative
//             aspect-square
//             overflow-hidden
//             rounded-xl
//             border
//             bg-white
//             shadow-sm
//           "
//         >
//           <Image
//             src={media.url}
//             alt=""
//             fill
//             className="object-cover transition-transform group-hover:scale-105"
//           />

//           {/* Remove button */}
//           <button
//               type="button"
//               onClick={(e) => {
//                 e.stopPropagation()
//                 setSelectedMedia(prev =>
//                   prev.filter(item => item._id !== media._id)
//                 )
//               }}
//               className="
//                 absolute top-2 right-2
//                 flex h-7 w-7 items-center justify-center
//                 rounded-full
//                 bg-black/60
//                 text-white
//                 text-sm
//                 font-bold
//                 leading-none
//                 opacity-0
//                 backdrop-blur
//                 transition-all
//                 group-hover:opacity-100
//                 hover:bg-red-500
//                 hover:scale-105
//                 cursor-pointer
//               "
//             >
//               ×
//             </button>

//                     </div>
//                   ))}
//                 </div>
//               )}

//             </div>


// </div>

//           {/* ===== Submit ===== */}
//           <ButtonLoading
//             loading={loading}
//             type="submit"
//             text="+ Add Product Variant"
//             className="bg-[#fff0ea] text-orange-400 hover:bg-orange-500 hover:text-white"
//           />

//           </form>

//                 </Form>
//             </div>
//             </CardContent>
//         </Card>
//        </div>

//     </div>
//   )
// }

// export default AddProductVariant  