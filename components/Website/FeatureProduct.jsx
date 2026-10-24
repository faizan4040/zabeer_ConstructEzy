"use client"

import axios from "axios"
import React, { useEffect, useState, useRef, Suspense } from "react"
import ProductBox from "./ProductBox"
import { useSearchParams } from "next/navigation"

const PRODUCTS_PER_PAGE = 12

// Text ko saaf karta hai: lowercase, comma/symbols hatata hai
const normalize = (str) =>
  String(str || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()

const FeatureProductInner = () => {
  const sectionRef = useRef(null)

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  const searchParams = useSearchParams()
  const rawQuery = (searchParams.get("q") || "").trim()
  const q = normalize(rawQuery)

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/product/get-feature-product`
      )

      const productArray = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.data?.products)
        ? data.data.products
        : Array.isArray(data?.products)
        ? data.products
        : []

      setProducts(productArray.slice().reverse())
    } catch (err) {
      console.error("Failed to fetch products:", err)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  // Search badalne par page 1 par reset + products section tak scroll
  useEffect(() => {
    setCurrentPage(1)
    if (q) {
      sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }, [q])

  // Search filter: query ka har word product text mein hona chahiye
  const filteredProducts = q
    ? products.filter((p) => {
        const text = normalize(
          [
            p.name,
            p.title,
            p.productName,
            p.brand,
            p.description,
            p.category?.name,
            typeof p.category === "string" ? p.category : "",
          ]
            .filter(Boolean)
            .join(" ")
        )
        return q.split(" ").every((word) => text.includes(word))
      })
    : products

  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE)

  const visibleProducts = filteredProducts.slice(
    0,
    currentPage * PRODUCTS_PER_PAGE
  )

  const scrollToSection = () => {
    sectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    })
  }

  const handlePageClick = (page) => {
    setCurrentPage(page)
    scrollToSection()
  }

  const handleLoadMore = () => {
    setCurrentPage((prev) => prev + 1)
    scrollToSection()
  }

  return (
    <section
      id="products-section"
      ref={sectionRef}
      className="w-full scroll-mt-24 px-3 py-4 sm:px-8 lg:px-16"
    >
      {/* Header */}
      <div className="mb-4 flex items-center justify-between gap-2 sm:mb-6">
        <h2 className="text-xl font-bold sm:text-3xl">
          {q ? `Results for "${rawQuery}"` : "Construction Materials"}
        </h2>
        {q && !loading && (
          <span className="shrink-0 text-xs text-gray-500 sm:text-sm">
            {filteredProducts.length} product
            {filteredProducts.length === 1 ? "" : "s"} found
          </span>
        )}
      </div>

      {/* Product Grid: phone par 2, tablet par 2-3, desktop par 4 */}
      <div className="grid min-h-225 grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
        {loading &&
          Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="h-56 animate-pulse rounded-xl bg-gray-200 shadow sm:h-72"
            />
          ))}

        {!loading &&
          visibleProducts.map((product) => (
            <ProductBox key={product._id} product={product} />
          ))}

        {!loading && visibleProducts.length === 0 && (
          <p className="col-span-full py-10 text-center text-gray-500">
            {q ? `No products found for "${rawQuery}".` : "No products found."}
          </p>
        )}
      </div>

      {/* Pagination Controls */}
      {!loading && totalPages > 1 && (
        <div className="mt-8 flex flex-col items-center gap-4 sm:mt-10 sm:flex-row sm:justify-between">
          {/* Load More */}
          {currentPage < totalPages && (
            <button
              onClick={handleLoadMore}
              className="cursor-pointer rounded-lg border-2 border-orange-500 px-6 py-2 font-semibold transition-all duration-300 hover:bg-orange-500 hover:text-white"
            >
              Load More
            </button>
          )}

          {/* Page Numbers */}
          <div className="flex flex-wrap justify-center gap-2">
            {Array.from({ length: totalPages }).map((_, index) => {
              const page = index + 1
              return (
                <button
                  key={page}
                  onClick={() => handlePageClick(page)}
                  className={`rounded-md border px-3 py-2 transition ${
                    currentPage === page
                      ? "bg-black text-white"
                      : "bg-white hover:bg-gray-100"
                  }`}
                >
                  {page}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </section>
  )
}

// useSearchParams ke liye Suspense zaroori hai (Next.js build error se bachata hai)
const FeatureProduct = () => (
  <Suspense fallback={null}>
    <FeatureProductInner />
  </Suspense>
)

export default FeatureProduct