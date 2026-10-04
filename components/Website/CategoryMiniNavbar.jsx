'use client'
import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { ChevronDown, Menu, Calculator } from "lucide-react"
import { WEBSITE_HOME } from "@/routes/WebsiteRoute"

const ITEMS_PER_COLUMN = 10

export default function CategoryMiniNavbar() {
  const [categories, setCategories] = useState([])
  const [openIndex, setOpenIndex] = useState(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const router = useRouter()
  const wrapRef = useRef(null)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get("/api/category/get-category")
        if (data.success) {
          const all = data.data
          const topLevel = all.filter((cat) => !cat.parent)

          const withChildren = topLevel.map((top) => ({
            ...top,
            children: all.filter((cat) => cat.parent === top._id),
          }))

          setCategories(withChildren)
        }
      } catch (error) {
        console.log("Error fetching categories:", error)
      }
    }
    fetchCategories()
  }, [])

  useEffect(() => {
    const handler = (e) => {
      if (!(e.target instanceof Node)) return
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpenIndex(null)
      }
    }
    document.addEventListener("pointerdown", handler)
    return () => document.removeEventListener("pointerdown", handler)
  }, [])

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") setOpenIndex(null)
    }
    document.addEventListener("keydown", handleEsc)
    return () => document.removeEventListener("keydown", handleEsc)
  }, [])

  const goToShop = (slug) => {
    setOpenIndex(null)
    setMobileOpen(false)
    router.push(`${WEBSITE_HOME}?category=${slug}`)
  }

  const goToCalculator = () => {
    setOpenIndex(null)
    setMobileOpen(false)
    router.push("/cost-calculator")
  }

  if (!categories.length) return null

  return (
    <div
      ref={wrapRef}
      className="bg-gradient-to-r from-indigo-950 via-purple-950 to-slate-900 text-white border-t border-white/10 relative z-40"
    >
      <div className="px-4 sm:px-6 lg:px-8">

        {/* ── Desktop (centered) ── */}
        <div className="hidden lg:flex items-center justify-center">
          <ul className="flex items-center justify-center flex-wrap gap-1">
            {categories.map((cat, index) => {
              const hasChildren = cat.children?.length > 0
              const columnCount = hasChildren
                ? Math.ceil(cat.children.length / ITEMS_PER_COLUMN)
                : 1
              const isOpen = openIndex === index

              return (
                <li
                  key={cat._id}
                  className="relative"
                  onMouseEnter={() => hasChildren && setOpenIndex(index)}
                  onMouseLeave={() => hasChildren && setOpenIndex(null)}
                >
                  <button
                    type="button"
                    onClick={() =>
                      hasChildren
                        ? setOpenIndex(isOpen ? null : index)
                        : goToShop(cat.slug)
                    }
                    className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium cursor-pointer transition-colors ${
                      isOpen
                        ? "text-amber-400 bg-white/10"
                        : "text-indigo-100 hover:text-amber-400 hover:bg-white/5"
                    }`}
                  >
                    {cat.name}
                    {hasChildren && <ChevronDown size={14} />}
                  </button>

                  {/* Simple dropdown */}
                  {hasChildren && isOpen && (
                    <div
                      className="absolute top-full left-0 bg-white text-black rounded-b-lg shadow-lg border border-gray-200 z-50"
                      style={{ minWidth: columnCount > 1 ? `${columnCount * 220}px` : "220px" }}
                    >
                      <div
                        className="grid py-1"
                        style={{
                          gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
                          gridTemplateRows: `repeat(${Math.min(cat.children.length, ITEMS_PER_COLUMN)}, auto)`,
                          gridAutoFlow: "column",
                        }}
                      >
                        {cat.children.map((sub) => (
                          <button
                            key={sub._id}
                            type="button"
                            onClick={() => goToShop(sub.slug)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-800 hover:bg-indigo-50 hover:text-indigo-700 cursor-pointer"
                          >
                            {sub.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        </div>

        {/* ── Mobile: "All Categories" toggle + accordion ── */}
        <div className="lg:hidden">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              className="flex-1 flex items-center gap-2 py-3 text-sm font-medium cursor-pointer text-indigo-100"
            >
              <Menu size={16} className="text-amber-400" />
              All Categories
              <ChevronDown
                size={14}
                className={`ml-auto transition-transform duration-300 ${mobileOpen ? "rotate-180" : ""}`}
              />
            </button>
          </div>

          <div
            className={`grid transition-all duration-300 ease-out ${
              mobileOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
            }`}
          >
            <div className="overflow-hidden">
              <div className="pb-3 border-t border-white/10">
                {categories.map((cat, index) => {
                  const hasChildren = cat.children?.length > 0
                  const isOpen = openIndex === index
                  return (
                    <div key={cat._id} className="border-b border-white/10 last:border-b-0">
                      <button
                        type="button"
                        onClick={() =>
                          hasChildren
                            ? setOpenIndex(isOpen ? null : index)
                            : goToShop(cat.slug)
                        }
                        className={`w-full flex items-center justify-between py-2.5 text-sm cursor-pointer ${
                          isOpen ? "text-amber-400" : "text-indigo-100"
                        }`}
                      >
                        {cat.name}
                        {hasChildren && (
                          <ChevronDown
                            size={14}
                            className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                          />
                        )}
                      </button>
                      {hasChildren && (
                        <div
                          className={`grid transition-all duration-300 ease-out ${
                            isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                          }`}
                        >
                          <div className="overflow-hidden">
                            <div className="pl-4 pb-2 grid grid-cols-2 gap-x-2">
                              {cat.children.map((sub) => (
                                <button
                                  key={sub._id}
                                  type="button"
                                  onClick={() => goToShop(sub.slug)}
                                  className="block w-full text-left py-2 text-sm text-indigo-200/80 hover:text-amber-400 transition-colors cursor-pointer"
                                >
                                  {sub.name}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

