'use client'
import useFetch from '@/hooks/useFetch'
import React, { useEffect, useMemo, useState } from 'react'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Checkbox } from '../ui/checkbox'
import { Slider } from '../ui/slider'
import ButtonLoading from '../Application/ButtonLoading'
import { useRouter, useSearchParams } from 'next/navigation'
import { WEBSITE_SHOP } from '@/routes/WebsiteRoute'
import { Button } from '../ui/button'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'

const Filter = () => {
    const  searchParams = useSearchParams()

    const [selectedCategory, setSelectedCategory] = useState([])
    const [selectedBrand, setSelectedBrand] = useState([])
    const [inStockOnly, setInStockOnly] = useState(false)
    const [openGroups, setOpenGroups] = useState([]) // expanded top-level category ids

    const [priceFilter, setPriceFilter] = useState({minPrice: 0, maxPrice: 3000})
    const { data: categoryData } = useFetch('/api/category/get-category')
    const { data: brandData } = useFetch('/api/product-variant/brands')

    const router = useRouter()

    // ---------- Flat list -> tree (top-level + apni sub-categories) ----------
    const categoryTree = useMemo(() => {
      if (!categoryData?.success) return []

      const list = categoryData.data
      const byName = (a, b) => a.name.localeCompare(b.name)

      const childrenMap = new Map()
      const roots = []

      list.forEach((cat) => {
        const parentId = cat.parent ? String(cat.parent) : null
        if (!parentId) {
          roots.push(cat)
        } else {
          if (!childrenMap.has(parentId)) childrenMap.set(parentId, [])
          childrenMap.get(parentId).push(cat)
        }
        // parent deleted ho to wo sub-category yahan nahi dikhegi (root nahi banti)
      })

      return roots.sort(byName).map((root) => ({
        ...root,
        children: (childrenMap.get(String(root._id)) || []).sort(byName),
      }))
    }, [categoryData])

    useEffect(()=>{
        searchParams.get('category') ? setSelectedCategory(searchParams.get('category').split(',')) : setSelectedCategory([])
        searchParams.get('brand') ? setSelectedBrand(searchParams.get('brand').split(',')) : setSelectedBrand([])
        setInStockOnly(searchParams.get('inStock') === 'true')
    },[searchParams])

    // Jis group ki koi category selected hai use auto-open rakho
    useEffect(() => {
      if (!categoryTree.length) return
      const toOpen = categoryTree
        .filter((group) =>
          selectedCategory.includes(group.slug) ||
          group.children.some((child) => selectedCategory.includes(child.slug))
        )
        .map((group) => String(group._id))

      if (toOpen.length) {
        setOpenGroups((prev) => Array.from(new Set([...prev, ...toOpen])))
      }
    }, [categoryTree, selectedCategory])

    const toggleGroup = (id) => {
      setOpenGroups((prev) => prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id])
    }

    const handlePriceChange = (value) => {
     setPriceFilter({ minPrice: value[0], maxPrice: value[1] })
    }

    const handleCategoryFilter = (categorySlug) => {
      const params = new URLSearchParams(searchParams.toString())

      let newSelectedCategory = [...selectedCategory]
      if (newSelectedCategory.includes(categorySlug)) {
        newSelectedCategory = newSelectedCategory.filter(cat => cat !== categorySlug)
      } else {
        newSelectedCategory.push(categorySlug)
      }

      setSelectedCategory(newSelectedCategory)

      newSelectedCategory.length > 0
        ? params.set('category', newSelectedCategory.join(','))
        : params.delete('category')

      params.delete('page')
      router.push(`${WEBSITE_SHOP}?${params.toString()}`)
    }


    const handleBrandFilter = (brand) => {
      const params = new URLSearchParams(searchParams.toString())

      let newSelectedBrand = [...selectedBrand]
      if (newSelectedBrand.includes(brand)) {
        newSelectedBrand = newSelectedBrand.filter(b => b !== brand)
      } else {
        newSelectedBrand.push(brand)
      }

      setSelectedBrand(newSelectedBrand)

      newSelectedBrand.length > 0
        ? params.set('brand', newSelectedBrand.join(','))
        : params.delete('brand')

      params.delete('page')
      router.push(`${WEBSITE_SHOP}?${params.toString()}`)
    }


    const handleInStockFilter = () => {
      const params = new URLSearchParams(searchParams.toString())
      const next = !inStockOnly

      setInStockOnly(next)

      next
        ? params.set('inStock', 'true')
        : params.delete('inStock')

      params.delete('page')
      router.push(`${WEBSITE_SHOP}?${params.toString()}`)
    }


    const handlePriceFilter = () => {
    const params = new URLSearchParams(searchParams.toString())

    params.set('minPrice', priceFilter.minPrice)
    params.set('maxPrice', priceFilter.maxPrice)
    params.delete('page')

    router.push(`${WEBSITE_SHOP}?${params.toString()}`)
  }

  return (
    <div>
      {searchParams.size > 0 && 
        <Button type="button" variant='destructive' className="w-full" asChild>
            <Link href={WEBSITE_SHOP}>
              Clear Filter
            </Link>
        </Button>
      }
    <Accordion type="multiple" defaultValue={['1', '2', '3', '4']} className="cursor-pointer">

    {/* ===================== CATEGORY (top-level -> sub-categories) ===================== */}
    <AccordionItem value="item-1">
        <AccordionTrigger className="uppercase font-semibold cursor-pointer">Category</AccordionTrigger>
        <AccordionContent>
         <div className='max-h-72 overflow-auto pr-1'>
           <ul className='space-y-1'>
            {categoryTree.map((group) => {
              const groupId = String(group._id)
              const hasChildren = group.children.length > 0
              const isOpen = openGroups.includes(groupId)

              // Sub-category nahi hai to seedha checkbox
              if (!hasChildren) {
                return (
                  <li key={groupId}>
                    <label className='flex items-center space-x-3 py-1.5'>
                      <Checkbox
                        className='cursor-pointer'
                        onCheckedChange={() => handleCategoryFilter(group.slug)}
                        checked={selectedCategory.includes(group.slug)}
                      />
                      <span className='font-medium'>{group.name}</span>
                    </label>
                  </li>
                )
              }

              const selectedCount = [group.slug, ...group.children.map((c) => c.slug)]
                .filter((slug) => selectedCategory.includes(slug)).length

              return (
                <li key={groupId}>
                  {/* Top-level: sirf heading, click par sub-categories khulti hain */}
                  <button
                    type='button'
                    onClick={() => toggleGroup(groupId)}
                    aria-expanded={isOpen}
                    className='w-full flex items-center justify-between py-1.5 text-left font-medium cursor-pointer hover:text-yellow-500'
                  >
                    <span className='flex items-center gap-2'>
                      {group.name}
                      {selectedCount > 0 && (
                        <span className='px-1.5 py-0.5 rounded-full text-[10px] bg-orange-100 text-orange-600'>
                          {selectedCount}
                        </span>
                      )}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {/* Sirf isi group ki sub-categories */}
                  {isOpen && (
                    <ul className='ml-2 pl-3 border-l border-gray-200 space-y-1 pb-2'>
                      <li>
                        <label className='flex items-center space-x-3 py-1 text-sm text-gray-600'>
                          <Checkbox
                            className='cursor-pointer'
                            onCheckedChange={() => handleCategoryFilter(group.slug)}
                            checked={selectedCategory.includes(group.slug)}
                          />
                          <span>All {group.name}</span>
                        </label>
                      </li>
                      {group.children.map((child) => (
                        <li key={String(child._id)}>
                          <label className='flex items-center space-x-3 py-1 text-sm'>
                            <Checkbox
                              className='cursor-pointer'
                              onCheckedChange={() => handleCategoryFilter(child.slug)}
                              checked={selectedCategory.includes(child.slug)}
                            />
                            <span>{child.name}</span>
                          </label>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              )
            })}
           </ul>
         </div>
        </AccordionContent>
    </AccordionItem>

    <AccordionItem value="item-2">
        <AccordionTrigger className="uppercase font-semibold cursor-pointer">Brand</AccordionTrigger>
        <AccordionContent>
         <div className='max-h-48 overflow-auto'>
           <ul>
            {brandData && brandData.success && brandData.data.map((brand)=>(
                <li key={brand}>
                    <label className='flex items-center space-x-3'>
                     <Checkbox className='cursor-pointer'
                      onCheckedChange={()=> handleBrandFilter(brand)}
                      checked={selectedBrand.includes(brand)}
                     />
                     <span>{brand}</span>
                    </label>
                </li>
            ))}
           </ul>
         </div>
        </AccordionContent>
    </AccordionItem>


    <AccordionItem value="item-3">
        <AccordionTrigger className="uppercase font-semibold cursor-pointer">Availability</AccordionTrigger>
        <AccordionContent>
         <ul>
            <li>
                <label className='flex items-center space-x-3'>
                 <Checkbox className='cursor-pointer'
                  onCheckedChange={handleInStockFilter}
                  checked={inStockOnly}
                 />
                 <span>In Stock Only</span>
                </label>
            </li>
         </ul>
        </AccordionContent>
    </AccordionItem>


    <AccordionItem value="item-4">
        <AccordionTrigger className="uppercase font-semibold cursor-pointer">Price</AccordionTrigger>
        <AccordionContent>
         <Slider defaultValue={[0, 3000]} max={3000} step={1} onValueChange={handlePriceChange} className='p-4'/>
         <div className='flex justify-between items-center pt-4 '>
            <span>{priceFilter.minPrice.toLocaleString('en-IN',{ style:'currency', currency: 'INR'})}</span>
            <span>{priceFilter.maxPrice.toLocaleString('en-IN',{ style:'currency', currency: 'INR'})}</span>
         </div>

         <div className='mt-4'>
            <ButtonLoading onClick={handlePriceFilter} type='button' text="Filter price"
             className="rounded-full p-4 cursor-pointer border-2 border-orange-500 hover:bg-orange-400 hover:text-white transition-all duration-300"
            />
         </div>
        </AccordionContent>
    </AccordionItem>


    </Accordion>
    </div>
  )
}

export default Filter

