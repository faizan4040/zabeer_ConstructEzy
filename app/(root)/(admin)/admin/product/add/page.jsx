'use client'

import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import Editor from '@/components/Application/Admin/Editor'
import MediaModal from '@/components/Application/Admin/MediaModal'
import ButtonLoading from '@/components/Application/ButtonLoading'
import Select from '@/components/Application/Select'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import useFetch from '@/hooks/useFetch'
import { showToast } from '@/lib/showToast'
import { zSchema } from '@/lib/zodSchema'
import { ADMIN_DASHBOARD, ADMIN_PRODUCT_SHOW } from '@/routes/AdminPanelRoute'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import slugify from 'slugify'

const breadcrumbData = [
  {href: ADMIN_DASHBOARD, label: 'Home'},
  {href: ADMIN_PRODUCT_SHOW, label: 'Product'},
  {href: '', label: 'Add Product'},
]

    const AddProduct = () => {
    const [loading, setLoading] = useState(false)
    const [categoryOption, setCategoryOption] = useState([])
    const {data: getCategory} = useFetch('/api/category?deleteType=SD&&size=10000')
    

    //media modal states
    const [open, setOpen] = useState(false)
    const [selectedMedia, setSelectedMedia] = useState([])
    

    useEffect(() => {
       if(getCategory && getCategory.success){
         const data = getCategory.data
         const options = data.map((cat) => ({ label: cat.name, value:cat._id }))
         setCategoryOption(options)
       }
    },[getCategory])
    
    
    const formSchema = zSchema.pick({
      name: true, 
      slug: true,
      category: true,
      mrp: true,
      sellingPrice: true,
      discountPercentage: true,
      description: true,
    })

 
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      slug: "",  
      category: "",
      mrp: 0,
      sellingPrice: 0,
      discountPercentage: 0,
      description: "",  
    },
  });


  useEffect(() => {
    const name = form.getValues('name')
    if(name){
        form.setValue('slug', slugify(name).toLowerCase())
    }
  },[form.watch('name')])

  //discount percentage calculation
  useEffect(() => {
    const mrp = form.getValues('mrp') || 0
    const sellingPrice = form.getValues('sellingPrice') || 0

     if(mrp > 0 && sellingPrice > 0){
       const discountPercentage = ((mrp - sellingPrice) / mrp * 100)
       form.setValue('discountPercentage', Math.round(discountPercentage))
       }
    
      },[form.watch('mrp'), form.watch('sellingPrice')])

      const editor = (event, editor) =>{
      const data = editor.getData()
      form.setValue('description', data)
      }

   
  const onSubmit = async (values) => {
    setLoading(true)
   try{
      if(selectedMedia.length <= 0){ 
        return showToast('error', 'Please select media.')
      }
      
      const mediaIds = selectedMedia.map(media => media._id)
      values.media = mediaIds

      const {data: response} = await axios.post('/api/product/create', values)
      if(!response.success){
        throw new Error(response.message)
      }
      
      form.reset()
      showToast('success', response.message)
    } catch(error){
      showToast('error', error.message)
   } finally{
    setLoading(false)
   }
  }


  return (
    <div>
        <BreadCrumb breadcrumbData={breadcrumbData}/>
        <div className="py-4 ">
        <Card className="py-0 rounded-3xl shadow-sm">
            <CardHeader className="pt-3 px-3 border-b [.border-b]:pb-2">
            <h4 className="text-xl font-semibold">Add Product</h4>
            </CardHeader>

            <CardContent className="pb-5">
            <div className="mt-5">
                <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                >

                    {/* Row 1: Name + Slug */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name<span className='text-red-500'>*</span></FormLabel>
                            <FormControl>
                            <Input
                                type="text"
                                placeholder="Enter product name"
                                {...field}
                            />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="slug"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Slug<span className='text-red-500'>*</span></FormLabel>
                            <FormControl>
                            <Input
                                type="text"
                                placeholder="Enter slug"
                                {...field}
                            />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />

                    </div>

                    {/* Row 2 & 3 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                    {/* MRP */}
                    <FormField
                        control={form.control}
                        name="mrp"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>MRP<span className='text-red-500'>*</span></FormLabel>
                            <FormControl>
                            <Input
                                type="number"
                                placeholder="Enter MRP"
                                {...field}
                            />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />

                    <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>
                            Category <span className="text-red-500">*</span>
                        </FormLabel>

                        <FormControl>
                            <Select
                            options={categoryOption}
                            selected={field.value}
                            setSelected={field.onChange}
                            isMulti={false}
                            />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />


                    {/* Selling Price */}
                    <FormField
                        control={form.control}
                        name="sellingPrice"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Selling Price<span className='text-red-500'>*</span></FormLabel>
                            <FormControl>
                            <Input
                                type="number"
                                placeholder="Enter selling price"
                                {...field}
                            />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />

                    {/* Discount Percentage */}
                    <FormField
                        control={form.control}
                        name="discountPercentage"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Discount (%)<span className='text-red-500'>*</span></FormLabel>
                            <FormControl>
                            <Input
                                type="number" readOnly
                                placeholder="Enter discount percentage"
                                {...field}
                            />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <div />
                    </div>

                    {/* Row 4: Description (Full Width) */}
                    <div className='max-w-6xl mb-5 md:col-span-2'>
                        <FormLabel>Description<span className='text-red-500'>*</span></FormLabel>
                        <Editor onChange={editor}/>
                        <FormMessage></FormMessage>
                    </div>


                    <div className="md:col-span-2 border-dashed rounded p-5 text-center">
                <MediaModal
                  open={open}
                  setOpen={setOpen}
                  selectedMedia={selectedMedia}
                  setSelectedMedia={setSelectedMedia}
                  isMultiple={true}
                />

            {selectedMedia.length > 0 && (
              <div className="flex justify-center items-center flex-wrap mb-3 gap-2">
                {selectedMedia.map(media => (
                  <div
                    key={media._id}
                    className="h-24 w-24 border rounded overflow-hidden"
                  >
                    <Image
                      src={media.url}
                      width={100}
                      height={100}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* <div
              onClick={() => setOpen(true)}
              className="bg-gray-50 dark:bg-card border w-fit mx-auto px-6 py-3 cursor-pointer rounded"
            >
              <span className="font-semibold">Selected Media</span>
            </div> */}



            <div className="
            mt-6
            w-full
            rounded-2xl
            border border-gray-200 dark:border-gray-700
            bg-white dark:bg-background
            p-4
            shadow-sm
          ">

            {/* Upload Area */}
            <div
              onClick={() => setOpen(true)}
              className="
                cursor-pointer
                rounded-xl
                border-2 border-dashed border-gray-300
                bg-gray-50 dark:bg-card
                p-6
                text-center
                transition
                hover:border-orange-400
                hover:bg-orange-50
              "
            >
              <div className="flex flex-col items-center gap-2">
                <div className="rounded-full bg-orange-100 p-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-yellow-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M12 12v9m0-9l-3 3m3-3l3 3m0-12a4 4 0 00-8 0"
                    />
                  </svg>
                </div>

                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Click to upload or select media
                </p>
                <p className="text-xs text-gray-500">
                  JPG, PNG, WEBP • Max 5 images
                </p>
              </div>
            </div>

            {/* Selected Images Preview */}
            {selectedMedia.length > 0 && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {selectedMedia.map((media) => (
                  <div
                    key={media._id}
                    className="
                      group
                      relative
                      aspect-square
                      overflow-hidden
                      rounded-xl
                      border
                      bg-white
                      shadow-sm
                    "
                  >
                    <Image
                      src={media.url}
                      alt=""
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />

                    {/* Remove button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedMedia(prev =>
                            prev.filter(item => item._id !== media._id)
                          )
                        }}
                        className="
                          absolute top-2 right-2
                          flex h-7 w-7 items-center justify-center
                          rounded-full
                          bg-black/60
                          text-sm
                          font-bold
                          leading-none
                          text-white
                          opacity-0
                          transition
                          group-hover:opacity-100
                          cursor-pointer
                        "
                      >
                        ×
                      </button>

                  </div>
                ))}
              </div>
            )}

          </div>

          </div>


                   <div className='mb-3 mt-5'>
                    <ButtonLoading
                    loading={loading}
                    type="submit"
                    text="+ Add Product"
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

export default AddProduct  