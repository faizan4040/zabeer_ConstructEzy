"use client"

import React, { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import axios from "axios"
import { ChevronRight, ArrowRight } from "lucide-react"
import { IMAGES } from "@/routes/AllImages"
import { WEBSITE_HOME } from "@/routes/WebsiteRoute"

const MAX_CATEGORIES = 6

// Fallback images based on category name
const getFallbackImage = (name = "") => {
  const n = name.toLowerCase()

  if (n.includes("plumb")) return IMAGES?.category_plumbing
  if (n.includes("electric")) return IMAGES?.category_electrical
  if (n.includes("tools")) return IMAGES?.category_tools
  if (n.includes("paint") || n.includes("finish"))
    return IMAGES?.category_paints
  if (n.includes("furniture"))
    return IMAGES?.category_furniture
  if (n.includes("hardware")) return IMAGES?.category_hardware
  if (n.includes("cement"))
    return IMAGES?.category_cement
  if (n.includes("power") || n.includes("tool"))
    return IMAGES?.category_power_tools
  if (n.includes("safety") || n.includes("ppe"))
    return IMAGES?.category_safety

  return null
}

// Get category image from API or fallback
const getCategoryImage = (cat) => {
  const fromApi =
    (typeof cat.image === "string" && cat.image) ||
    cat.image?.url ||
    cat.image?.secure_url ||
    cat.imageUrl ||
    cat.thumbnail ||
    cat.icon ||
    ""

  return fromApi || getFallbackImage(cat.name) || null
}

// Default categories shown when API fails or returns no categories
const DEFAULT_CATEGORIES = [
  { _id: "d1", name: "Plumbing", slug: "plumbing" },
  { _id: "d2", name: "Electrical", slug: "electrical" },
  { _id: "d3", name: "Paints & Finishes", slug: "paints-finishes" },
  { _id: "d4", name: "Hardware", slug: "hardware" },
  { _id: "d5", name: "Power Tools", slug: "power-tools" },
  { _id: "d6", name: "Safety & PPE", slug: "safety-ppe" },
  { _id: "d7", name: "Cement", slug: "cement" },
  { _id: "d8", name: "Furniture", slug: "furniture" },
]

// Category Card
const CategoryCard = ({ cat }) => {
  const src = getCategoryImage(cat)
  const [imgFailed, setImgFailed] = useState(false)

  const isRemote = typeof src === "string" && /^https?:\/\//i.test(src)
  const showImage = src && !imgFailed

  return (
    <Link
      href={`${WEBSITE_HOME}?category=${encodeURIComponent(
        cat.slug || cat._id
      )}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-900/10"
    >
      {/* Category Image (rounded box with padding around it) */}
      <div className="p-2">
        <div className="relative h-28 w-full overflow-hidden rounded-xl bg-slate-100 sm:h-32 lg:h-30 xl:h-[130px]">
          {showImage ? (
            <Image
              src={src}
              alt={cat.name || "Category"}
              fill
              sizes="(min-width: 1280px) 15vw, (min-width: 1024px) 16vw, (min-width: 640px) 30vw, 46vw"
              unoptimized={isRemote}
              onError={() => setImgFailed(true)}
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-50 to-slate-100 text-4xl font-bold text-emerald-300">
              {cat.name?.charAt(0) || "C"}
            </div>
          )}
        </div>
      </div>

      {/* Category Name */}
      <div className="flex min-h-12 items-center justify-between gap-2 px-3 pb-3 pt-1 sm:px-4">
        <span className="line-clamp-1 text-sm font-bold text-[#0b1b3f] transition-colors group-hover:text-emerald-700 sm:text-[15px]">
          {cat.name}
        </span>

        <ChevronRight
          size={16}
          className="shrink-0 text-slate-500 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-emerald-700"
        />
      </div>
    </Link>
  )
}

// Loading Skeleton
const CardSkeleton = () => (
  <div className="animate-pulse overflow-hidden rounded-2xl border border-slate-200 bg-white">
    <div className="p-2">
      <div className="h-28 rounded-xl bg-slate-100 sm:h-32 lg:h-[120px] xl:h-[130px]" />
    </div>
    <div className="px-4 pb-3.5 pt-1">
      <div className="h-4 w-2/3 rounded bg-slate-200" />
    </div>
  </div>
)

// Main Component
const ShopByCategory = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const fetchCategories = async () => {
      try {
        const { data } = await axios.get("/api/category/get-category")

        if (!cancelled && data?.success) {
          const topLevel = (data.data || []).filter((cat) => !cat.parent)
          setCategories(topLevel.slice(0, MAX_CATEGORIES))
        }
      } catch (error) {
        console.error("Error fetching categories:", error)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchCategories()

    return () => {
      cancelled = true
    }
  }, [])

  const list =
    categories.length > 0 ? categories : loading ? [] : DEFAULT_CATEGORIES

  return (
    <section className="max-w-full bg-white py-6 sm:py-8">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-4 flex items-center justify-between sm:mb-5">
          <h2 className="text-xl font-extrabold tracking-tight text-[#0b1b3f] sm:text-2xl lg:text-[28px]">
            Shop by Category
          </h2>

          <Link
            href={WEBSITE_HOME}
            className="group inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 transition-colors hover:text-emerald-900"
          >
            View All Products
            <ArrowRight
              size={16}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
          {loading
            ? Array.from({ length: MAX_CATEGORIES }).map((_, i) => (
                <CardSkeleton key={i} />
              ))
            : list.map((cat) => <CategoryCard key={cat._id} cat={cat} />)}
        </div>
      </div>
    </section>
  )
}

export default ShopByCategory