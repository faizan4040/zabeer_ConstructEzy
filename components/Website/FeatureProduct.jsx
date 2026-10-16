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
      id="shop"
      ref={sectionRef}
      className="w-full px-4 sm:px-8 lg:px-16 -py-4"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold">
          {q ? `Results for "${rawQuery}"` : "Construction Materials"}
        </h2>
        {q && !loading && (
          <span className="text-sm text-gray-500">
            {filteredProducts.length} product
            {filteredProducts.length === 1 ? "" : "s"} found
          </span>
        )}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 min-h-225">
        {loading &&
          Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="h-72 rounded-xl bg-gray-200 animate-pulse shadow"
            />
          ))}

        {!loading &&
          visibleProducts.map((product) => (
            <ProductBox key={product._id} product={product} />
          ))}

        {!loading && visibleProducts.length === 0 && (
          <p className="col-span-full text-center text-gray-500 py-10">
            {q ? `No products found for "${rawQuery}".` : "No products found."}
          </p>
        )}
      </div>

      {/* Pagination Controls */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-between items-center mt-10">
          {/* Load More */}
          {currentPage < totalPages && (
            <button
              onClick={handleLoadMore}
              className="px-6 py-2 rounded-lg border-orange-500 hover:bg-orange-500 border-2 hover:text-white transition-all duration-300 cursor-pointer font-semibold"
            >
              Load More
            </button>
          )}

          {/* Page Numbers */}
          <div className="flex gap-2">
            {Array.from({ length: totalPages }).map((_, index) => {
              const page = index + 1
              return (
                <button
                  key={page}
                  onClick={() => handlePageClick(page)}
                  className={`px-3 py-2 rounded-md border transition ${
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