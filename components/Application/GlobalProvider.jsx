"use client"

import { persistor, store } from "@/store/store"
import React, { useEffect } from "react"
import { Provider, useSelector, useStore } from "react-redux"
import { PersistGate } from "redux-persist/integration/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { usePathname } from "next/navigation"
import Loading from "./Loading"
import { BsWhatsapp, BsTelephoneFill } from "react-icons/bs"

const queryClient = new QueryClient()

/* ───────── EDIT THESE ───────── */
// Country code ke saath, + ya space nahi. WhatsApp aur Call dono isi number par jayenge.
const CONTACT_NUMBER = "918955549556"
const WHATSAPP_MESSAGE = "Hi, I need help."

// Middleware wale exact roles. Inme se kisi bhi role ko icons NAHI dikhenge.
// ("laber" spelling middleware jaisi hi hai; "customer" ko icons dikhenge)
const BLOCKED_ROLES = ["admin", "shop owner", "laber", "labour", "labor", "delivery boy"]

// In panels ke andar icons NAHI dikhenge (aur inke sub-paths me bhi nahi)
// /partner/onboarding/labour => labour panel, /delivery/... => delivery panel, /admin/... => admin panel
// NOTE: /labour aur /labour/profile PUBLIC pages hain, isliye unhe yahan nahi rakha
const BLOCKED_PATH_PREFIXES = ["/admin", "/delivery", "/partner"]

// true rakho jab tak sahi chal na jaye. Browser console (F12) me asli path aur role dikhega.
// Sab sahi chalne ke baad false kar dena.
const DEBUG = true

/* Redux me role kahan hai? Apne store ke hisaab se is function ko adjust karo.
   Ye kuch common jagah check karta hai: state.auth.user.role, state.user.role, etc. */
const selectRole = (state) =>
  String(
    state?.auth?.user?.role ??
      state?.auth?.role ??
      state?.user?.user?.role ??
      state?.user?.role ??
      ""
  ).toLowerCase()

const FloatingContact = () => {
  const role = useSelector(selectRole)
  const pathname = (usePathname() || "").toLowerCase()
  const store = useStore()

  const blockedByRole = BLOCKED_ROLES.includes(role.trim())
  const blockedByPath =
    BLOCKED_PATH_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/")) ||
    // "/shop" public listing hai (icons dikhenge), par "/shop/..." shop-owner panel hai (nahi dikhenge)
    pathname.startsWith("/shop/")

  useEffect(() => {
    if (!DEBUG) return
    console.log("[FloatingContact] pathname:", pathname)
    console.log("[FloatingContact] role found:", role || "(empty)")
    console.log("[FloatingContact] hidden:", blockedByRole || blockedByPath)
    console.log("[FloatingContact] full redux state:", store.getState())
  }, [pathname, role, blockedByRole, blockedByPath, store])

  // labour / delivery / shop owner / admin ko kuch nahi dikhega
  if (blockedByRole || blockedByPath) return null

  const waLink = `https://wa.me/${CONTACT_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-center gap-3">
      {/* Call */}
      <a
        href={`tel:+${CONTACT_NUMBER}`}
        aria-label="Call us"
        className="
          group
          relative
          w-12
          h-12
          rounded-full
          bg-neutral-900
          text-white
          flex
          items-center
          justify-center
          shadow-lg
          ring-1
          ring-white/15
          hover:scale-110
          hover:shadow-xl
          transition-all
          duration-300
        "
      >
        <BsTelephoneFill size={20} />
        <span className="pointer-events-none absolute right-14 whitespace-nowrap rounded bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100">
          Call us
        </span>
      </a>

      {/* WhatsApp */}
      <a
        href={waLink}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contact us on WhatsApp"
        className="
          group
          relative
          w-14
          h-14
          rounded-full
          bg-[#25D366]
          text-white
          flex
          items-center
          justify-center
          shadow-lg
          hover:scale-110
          hover:shadow-xl
          transition-all
          duration-300
        "
      >
        <span className="absolute inset-0 animate-ping rounded-full bg-[#25D366] opacity-30" />
        <BsWhatsapp size={28} className="relative" />
        <span className="pointer-events-none absolute right-16 whitespace-nowrap rounded bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100">
          Chat on WhatsApp
        </span>
      </a>
    </div>
  )
}

const GlobalProvider = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <PersistGate persistor={persistor} loading={<Loading />}>
          {children}

          {/* Floating WhatsApp + Call (sirf users ko) */}
          <FloatingContact />
        </PersistGate>
      </Provider>
    </QueryClientProvider>
  )
}

export default GlobalProvider