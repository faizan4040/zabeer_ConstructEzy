'use client'
import { useEffect, useRef, useState, useCallback } from "react"
import { X, User, MapPin, ChevronDown, Navigation, Truck, Clock, Shield, Store } from "lucide-react"
import { USER_DASHBOARD, WEBSITE_HOME, WEBSITE_LOGIN, WEBSITE_REGISTER, WEBSITE_SHOP } from "@/routes/WebsiteRoute"
import Card from '@/components/Website/Cart'
import Link from "next/link"
import { useSelector } from "react-redux"
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar"
import { IMAGES } from "@/routes/AllImages"
import { useRouter } from "next/navigation"
import { IoSearchOutline } from "react-icons/io5"

function getStaticRoleIcon(role) {
  const normalized = String(role || "").trim().toLowerCase()
  if (normalized === "admin") {
    return { bgClass: "bg-gradient-to-br from-amber-400 to-rose-500", Icon: Shield }
  }
  if (normalized === "shop owner") {
    return { bgClass: "bg-gradient-to-br from-sky-400 to-indigo-600", Icon: Store }
  }
  return null // customer / everyone else -> normal avatar image flow
}

export default function Header() {
  const [query, setQuery] = useState("")
  const router = useRouter()
  const [profileOpen, setProfileOpen] = useState(false)
  const auth = useSelector(store => store.authStore.auth)

  // Mobile search
  const [mobileQuery, setMobileQuery] = useState("")

  // Location state
  const [locationModal, setLocationModal] = useState(false)
  const [locationName, setLocationName] = useState("")
  const [manualInput, setManualInput] = useState("")
  const [locStatus, setLocStatus] = useState({ msg: "", type: "" })
  const [nearestLabor, setNearestLabor] = useState(null)
  const [deliveryTime, setDeliveryTime] = useState("60 mins")
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)

  // Avatar image load-failure fallback
  const [avatarFailed, setAvatarFailed] = useState(false)

  const profileRef = useRef(null)
  const locationModalRef = useRef(null)
  const mobileSheetRef = useRef(null)

  /* Click outside handler */
  useEffect(() => {
    const handler = (e) => {
      if (!(e.target instanceof Node)) return
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false)
      const inDesktop = locationModalRef.current?.contains(e.target)
      const inMobile = mobileSheetRef.current?.contains(e.target)
      if (!inDesktop && !inMobile) setLocationModal(false)
    }
    document.addEventListener("pointerdown", handler)
    return () => document.removeEventListener("pointerdown", handler)
  }, [])

  useEffect(() => {
    setAvatarFailed(false)
  }, [auth?.avatar?.url])

  const goSearch = (text) => {
    const q = text.trim()
    // /shop ki jagah Home par hi bhejo
    router.push(q ? `${WEBSITE_HOME}?q=${encodeURIComponent(q)}` : WEBSITE_HOME, { scroll: false })
  }

  const handleSearch = () => goSearch(query)
  const handleMobileSearch = () => goSearch(mobileQuery)

  /* ── Fetch Nearest Labor ── */
  const fetchNearestLabor = useCallback(async (latitude, longitude, city) => {
    try {
      const response = await fetch("/api/labor/nearest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latitude, longitude, city })
      })

      if (response.ok) {
        const data = await response.json()
        setNearestLabor(data)
        if (data.distance) {
          const time = Math.ceil(data.distance / 2) + 10
          setDeliveryTime(`${Math.max(time, 60)} mins`)
        }
      }
    } catch (error) {
      console.log("Error fetching nearest labor:", error)
    }
  }, [])

  /* ── Location Handlers ── */
  const applyLocation = useCallback((name, latitude, longitude, city) => {
    setLocationName(name)
    setLocationModal(false)
    setManualInput("")
    setLocStatus({ msg: "", type: "" })
    setIsLoadingLocation(false)

    if (latitude && longitude) {
      fetchNearestLabor(latitude, longitude, city)
    }
  }, [fetchNearestLabor])

  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocStatus({ msg: "Geolocation is not supported by your browser.", type: "error" })
      return
    }

    setIsLoadingLocation(true)
    setLocStatus({ msg: "Detecting your location…", type: "loading" })

    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude, longitude } }) => {
        setLocStatus({ msg: "Fetching address…", type: "loading" })
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          )
          const data = await res.json()
          const addr = data.address
          const area = addr.suburb || addr.neighbourhood || addr.city_district || addr.city || "Your Area"
          const city = addr.city || addr.town || addr.state_district || ""
          const label = city ? `${area}, ${city}` : area

          setLocStatus({ msg: "Location detected!", type: "success" })
          setTimeout(() => applyLocation(label, latitude, longitude, city), 800)
        } catch (error) {
          console.error("Geocoding error:", error)
          setLocStatus({ msg: "Could not fetch address. Please enter manually.", type: "error" })
          setIsLoadingLocation(false)
        }
      },
      (err) => {
        console.error("Geolocation error code:", err.code, "Message:", err.message)
        const msgs = {
          1: "Location permission denied. Please enable location access in your browser settings and try again.",
          2: "Location is unavailable. Please check your device settings and try again.",
          3: "Location request timed out. Please try again or enter manually.",
        }
        setLocStatus({ msg: msgs[err.code] || "Error detecting location. Please try again.", type: "error" })
        setIsLoadingLocation(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    )
  }, [applyLocation])

  const confirmManual = useCallback(() => {
    if (!manualInput.trim()) {
      setLocStatus({ msg: "Please enter a location first.", type: "error" })
      return
    }
    applyLocation(manualInput.trim(), null, null, null)
  }, [manualInput, applyLocation])

  /* ── Status text color ── */
  const statusColor =
    locStatus.type === "success" ? "text-emerald-600"
      : locStatus.type === "error" ? "text-rose-600"
        : "text-[#0B8457]"

  if (auth?.role === "laber") return null

  const avatarSrc = !avatarFailed && auth?.avatar?.url ? auth.avatar.url : IMAGES.profile
  const staticRoleIcon = getStaticRoleIcon(auth?.role)

  /* ── Shared location panel content (desktop dropdown + mobile sheet) ── */
  const locationPanel = (
    <>
      <div className="px-5 sm:px-6 pt-5 sm:pt-6 pb-4 border-b border-gray-100 bg-emerald-50/60">
        <p className="font-bold text-gray-900 text-base">Set delivery location</p>
        <p className="text-sm text-gray-500 mt-1">We'll show products available in your area</p>
        <p className="text-xs text-gray-500 mt-2 flex items-center gap-1.5">
          <Clock size={12} className="text-[#0B8457]" />
          Delivery in <span className="font-semibold text-[#0B8457]">{deliveryTime}</span>
        </p>
      </div>

      <button
        type="button"
        onClick={detectLocation}
        disabled={isLoadingLocation}
        className="w-full flex items-center gap-4 px-5 sm:px-6 py-4 hover:bg-emerald-50/60 transition-colors border-b border-gray-100 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className={`w-11 h-11 rounded-full ${isLoadingLocation ? 'bg-gray-200 animate-pulse' : 'bg-emerald-100'} flex items-center justify-center shrink-0`}>
          {isLoadingLocation ? (
            <div className="animate-spin">
              <Navigation size={18} className="text-[#0B8457]" />
            </div>
          ) : (
            <Navigation size={18} className="text-[#0B8457]" />
          )}
        </span>
        <div className="text-left">
          <p className="text-base font-semibold text-[#0B8457]">
            {isLoadingLocation ? "Detecting location..." : "Use my current location"}
          </p>
          <p className="text-sm text-gray-400 mt-0.5">Auto-detect via GPS</p>
        </div>
      </button>

      <div className="px-5 sm:px-6 py-5 border-b border-gray-100">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Or enter manually</p>
        <input
          type="text"
          value={manualInput}
          onChange={e => setManualInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && confirmManual()}
          placeholder="Enter area, street, pincode…"
          className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0B8457] focus:ring-2 focus:ring-emerald-200 transition"
        />
        <button
          type="button"
          onClick={confirmManual}
          className="w-full mt-4 bg-[#0B8457] hover:bg-[#086b47] text-white text-base font-semibold py-3 rounded-xl transition-all cursor-pointer shadow-md"
        >
          Confirm Location
        </button>
      </div>

      {locStatus.msg && (
        <div className={`px-5 sm:px-6 py-4 ${locStatus.type === "error" ? "bg-rose-50" : locStatus.type === "success" ? "bg-emerald-50" : "bg-emerald-50/60"}`}>
          <p className={`text-sm font-medium flex items-center gap-2 ${statusColor}`}>
            {locStatus.type === "loading" && <span className="inline-block animate-spin">⏳</span>}
            {locStatus.type === "success" && "✅"}
            {locStatus.type === "error" && "⚠️"}
            <span>{locStatus.msg}</span>
          </p>
        </div>
      )}

      {nearestLabor && (
        <div className="px-5 sm:px-6 py-4 bg-emerald-50 border-t border-gray-100">
          <div className="flex items-start gap-3">
            <Truck size={18} className="text-[#0B8457] shrink-0 mt-0.5" />
            <div className="text-left">
              <p className="text-sm font-semibold text-gray-900">{nearestLabor.name}</p>
              <p className="text-xs text-gray-600 mt-0.5">{nearestLabor.distance?.toFixed(1)} km away</p>
              <p className="text-xs text-gray-600 mt-1">Rating: {nearestLabor.rating || "N/A"} ⭐</p>
            </div>
          </div>
        </div>
      )}

      <div className="px-5 sm:px-6 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-600">
        <p>💡 Make sure location permissions are enabled in your browser settings for auto-detection to work.</p>
      </div>
    </>
  )

  /* ── Account trigger (avatar / role icon / guest icon) ── */
  const accountVisual = auth ? (
    staticRoleIcon ? (
      <span className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center shrink-0 ${staticRoleIcon.bgClass}`}>
        <staticRoleIcon.Icon size={17} className="text-white" />
      </span>
    ) : (
      <Avatar className="w-8 h-8 sm:w-9 sm:h-9">
        <AvatarImage src={avatarSrc} onError={() => setAvatarFailed(true)} />
        <AvatarFallback>
          <User size={18} />
        </AvatarFallback>
      </Avatar>
    )
  ) : (
    <User size={26} strokeWidth={1.6} className="text-gray-900" />
  )

  return (
    <div className="sticky top-0 z-50">
      <header className="relative z-50 bg-white border-b border-gray-200 shadow-sm">

        {/* ─── MAIN NAV ─── */}
        <div className="bg-white text-gray-900 px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3">
          <div className="flex items-center justify-between gap-3 sm:gap-4 lg:gap-6 max-w-400 mx-auto">

            {/* LEFT: Logo */}
            <Link href={WEBSITE_HOME} className="shrink-0">
              <img src={IMAGES.logo} className="h-9 sm:h-11 lg:h-12 w-auto" alt="Logo" />
            </Link>

            {/* Desktop: Location pill */}
            <div className="hidden lg:block relative shrink-0" ref={locationModalRef}>
              <button
                type="button"
                onClick={() => { setLocationModal(v => !v); setLocStatus({ msg: "", type: "" }) }}
                className="flex items-center gap-2 cursor-pointer rounded-lg bg-white hover:bg-gray-50 border border-gray-200 shadow-sm px-3.5 py-2.5 transition-colors whitespace-nowrap"
              >
                <MapPin size={17} className="text-gray-900 shrink-0" />
                <span className="text-sm font-semibold text-gray-900 truncate max-w-35">
                  {locationName || "Select location"}
                </span>
                <ChevronDown size={15} className={`text-gray-900 shrink-0 transition-transform ${locationModal ? "rotate-180" : ""}`} />
              </button>

              {locationModal && (
                <div className="absolute top-full left-0 mt-3 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 text-black">
                  {locationPanel}
                </div>
              )}
            </div>

            {/* Desktop: Search (always open) */}
            <div className="hidden md:flex flex-1 min-w-0 justify-center">
              <div className="relative flex items-stretch w-full max-w-2xl rounded-lg border border-[#0B8457] bg-white overflow-hidden focus-within:ring-2 focus-within:ring-emerald-200 transition">
                <IoSearchOutline size={22} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-900 pointer-events-none" />
                <input
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSearch()}
                  className="flex-1 min-w-0 pl-12 pr-10 py-3 text-gray-900 text-sm bg-transparent focus:outline-none placeholder-gray-400"
                  placeholder="Search products, materials or services..."
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => { setQuery(""); goSearch("") }}
                    className="absolute right-28 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                    aria-label="Clear"
                  >
                    <X size={16} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleSearch}
                  className="px-7 bg-[#0B8457] hover:bg-[#086b47] text-white text-sm font-semibold cursor-pointer transition-colors"
                >
                  Search
                </button>
              </div>
            </div>

            {/* Spacer on mobile so icons stay right */}
            <div className="flex-1 md:hidden" />

            {/* RIGHT: Icons */}
            <div className="flex items-center gap-3 sm:gap-6 shrink-0">

              {/* Mobile Location Icon */}
              <button
                className="flex lg:hidden items-center justify-center w-9 h-9 rounded-full border border-gray-200 bg-white hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => { setLocationModal(true); setLocStatus({ msg: "", type: "" }) }}
                aria-label="Location"
              >
                <MapPin size={18} className={locationName ? "text-[#0B8457]" : "text-gray-900"} />
              </button>

              {/* Profile / Auth */}
              <div className="relative shrink-0" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 cursor-pointer hover:opacity-75 transition-opacity"
                  aria-label="Profile"
                >
                  {accountVisual}
                  <span className="hidden sm:inline text-sm font-semibold text-gray-900">Account</span>
                  <ChevronDown size={15} className={`hidden sm:block text-gray-900 transition-transform ${profileOpen ? "rotate-180" : ""}`} />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-4 w-64 sm:w-80 bg-white text-black rounded-2xl shadow-2xl border border-gray-100 p-5 sm:p-6 z-50">
                    {!auth ? (
                      <>
                        <Link href={WEBSITE_REGISTER}>
                          <button className="w-full bg-[#0B8457] hover:bg-[#086b47] text-white py-3 rounded-xl cursor-pointer mb-3 font-medium transition-all">
                            Create Free Account
                          </button>
                        </Link>
                        <Link href={WEBSITE_LOGIN}>
                          <button className="w-full border-2 border-[#0B8457] text-[#0B8457] py-3 hover:bg-[#0B8457] hover:text-white rounded-xl cursor-pointer font-medium transition-all">
                            Sign In
                          </button>
                        </Link>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-4">
                        {staticRoleIcon ? (
                          <span className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${staticRoleIcon.bgClass}`}>
                            <staticRoleIcon.Icon size={22} className="text-white" />
                          </span>
                        ) : (
                          <Link href={`/profile/${auth.id || auth._id}`}>
                            <Avatar className="w-12 h-12">
                              <AvatarImage src={avatarSrc} onError={() => setAvatarFailed(true)} />
                              <AvatarFallback>
                                <User size={22} />
                              </AvatarFallback>
                            </Avatar>
                          </Link>
                        )}
                        <span className="font-semibold text-gray-900 text-center wrap-break-word max-w-full">{auth.name}</span>

                        <Link href={USER_DASHBOARD} className="w-full">
                          <button className="w-full bg-[#0B8457] hover:bg-[#086b47] text-white py-3 px-4 rounded-xl cursor-pointer transition-all font-semibold">
                            Dashboard
                          </button>
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Cart */}
              <div className="shrink-0 text-gray-900">
                <Card className="cursor-pointer" />
              </div>
            </div>
          </div>
        </div>

        {/* ─── MOBILE SEARCH BAR (always open, below md) ─── */}
        <div className="md:hidden bg-white px-3 sm:px-6 pb-3 pt-1">
          <div className="relative flex items-stretch rounded-lg border border-[#0B8457] bg-white overflow-hidden focus-within:ring-2 focus-within:ring-emerald-200 transition">
            <IoSearchOutline size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-900 pointer-events-none" />
            <input
              type="text"
              value={mobileQuery}
              onChange={e => setMobileQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleMobileSearch()}
              className="flex-1 min-w-0 pl-10 pr-9 py-2.5 text-gray-900 text-sm bg-transparent focus:outline-none placeholder-gray-400"
              placeholder="Search products, materials or services..."
            />
            {mobileQuery && (
              <button
                onClick={() => setMobileQuery("")}
                className="absolute right-14 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                aria-label="Clear"
              >
                <X size={16} />
              </button>
            )}
            <button
              type="button"
              onClick={handleMobileSearch}
              className="w-12 bg-[#0B8457] hover:bg-[#086b47] flex items-center justify-center text-white cursor-pointer transition-colors"
              aria-label="Search"
            >
              <IoSearchOutline size={18} />
            </button>
          </div>
        </div>

        {/* ─── MOBILE / TABLET LOCATION STRIP ─── */}
        <button
          type="button"
          onClick={() => { setLocationModal(true); setLocStatus({ msg: "", type: "" }) }}
          className="lg:hidden w-full bg-gray-50 text-gray-900 px-3 sm:px-6 py-2 flex items-center justify-between text-sm border-t border-gray-200 cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Clock size={15} className="text-[#0B8457]" />
            <span className="font-semibold text-[#0B8457]">{deliveryTime}</span>
          </span>
          <span className="flex items-center gap-1.5 text-gray-700 truncate text-xs max-w-[65%]">
            <MapPin size={13} className="shrink-0" />
            <span className="truncate">{locationName || "Select location"}</span>
            <ChevronDown size={13} className="shrink-0" />
          </span>
        </button>
      </header>

      {/* ─── MOBILE LOCATION BOTTOM SHEET ─── */}
      {locationModal && (
        <div className="lg:hidden fixed inset-0 z-60 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm">
          <div
            ref={mobileSheetRef}
            className="relative w-full sm:max-w-md bg-white text-black rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh]"
          >
            <button
              type="button"
              onClick={() => setLocationModal(false)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 hover:bg-gray-100 flex items-center justify-center cursor-pointer z-10"
              aria-label="Close"
            >
              <X size={16} className="text-gray-600" />
            </button>
            {locationPanel}
          </div>
        </div>
      )}
    </div>
  )
}