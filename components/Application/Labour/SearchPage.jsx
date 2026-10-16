'use client'
import React, { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from "framer-motion"
import {
  ArrowLeft, MapPin, RefreshCcw, Search, Star, Phone, HardHat, BadgeCheck,
  X, Loader2, Banknote, Wallet, Clock, AlertCircle, UserPlus,
} from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import axios from 'axios'

const CATEGORY_LABEL = {
  all: "Workers", helpers: "Helpers", masons: "Masons", electricians: "Electricians",
  plumbers: "Plumbers", carpenters: "Carpenters", painters: "Painters",
  "tile-experts": "Tile Experts", welders: "Welders", "jcb-operators": "JCB Operators",
  contractors: "Contractors", engineers: "Engineers",
}

// value for <input type="datetime-local" min=...>
const nowLocal = () => {
  const d = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
  return d.toISOString().slice(0, 16)
}

function Stars({ value, size = 12 }) {
  return (
    <span className="inline-flex">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} size={size} className={s <= Math.round(value || 0) ? "text-amber-400 fill-amber-400" : "text-zinc-300"} />
      ))}
    </span>
  )
}

function SearchPage() {
  const router = useRouter()
  const params = useSearchParams()

  const category = params.get("category") || "all"
  const mobile = params.get("mobile") || ""
  const siteDetails = params.get("siteDetails") || ""
  const address = params.get("address") || ""
  const lat = Number(params.get("lat")) || null
  const lon = Number(params.get("lon")) || null

  const [labourList, setLabourList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // hire modal (selected.unassigned = "no labour found, let our team assign one")
  const [selected, setSelected] = useState(null)
  const [pricingType, setPricingType] = useState("daily")
  const [quantity, setQuantity] = useState(1)
  const [visitAt, setVisitAt] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("cash")
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState("")

  // reviews modal
  const [reviewFor, setReviewFor] = useState(null)
  const [reviewData, setReviewData] = useState({ reviews: [], total: 0, avg: 0, next: null })
  const [reviewLoading, setReviewLoading] = useState(false)

  const label = CATEGORY_LABEL[category] || "Labour"
  const isAssign = !!selected?.unassigned

  const fetchLabour = async () => {
    if (!lat || !lon) { setLoading(false); return }
    setLoading(true)
    setError("")
    try {
      const { data } = await axios.post("/api/labours/near-by", { latitude: lat, longitude: lon, category })
      setLabourList(data)
    } catch (e) {
      setLabourList([])
      setError(e?.response?.status === 401 ? "Please login to see labour contact details." : "Could not load labour. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchLabour() }, [lat, lon, category])

  const openHire = (l) => {
    setSelected(l)
    setPricingType(l.rateType === "hour" ? "hourly" : "daily")
    setQuantity(1)
    setVisitAt("")
    setPaymentMethod("cash")
    setFormError("")
  }

  // nobody nearby: our team finds a labour of the same category and calls the customer
  const openAssign = () =>
    openHire({ _id: null, unassigned: true, fullName: `a ${label.toLowerCase()}`, rateType: "both" })

  const rate = useMemo(() => {
    if (!selected || isAssign) return 0
    return pricingType === "hourly" ? selected.pricePerHour : selected.pricePerDay
  }, [selected, pricingType, isAssign])

  const total = (rate || 0) * (Number(quantity) || 0)

  const handleHire = async () => {
    if (!visitAt) { setFormError("Select the date and time you want the labour to visit"); return }
    if (!quantity || quantity < 1) { setFormError("Enter a valid number"); return }
    setSubmitting(true)
    setFormError("")
    try {
      await axios.post("/api/booking/create", {
        labourId: selected._id || undefined,
        category,
        pricingType,
        quantity: Number(quantity),
        visitAt: new Date(visitAt).toISOString(),
        paymentMethod,
        workAddress: address,
        siteDetails,
        workLocation: { latitude: lat, longitude: lon },
        mobileNumber: mobile,
      })
      // Online payment opens from "My Bookings" once the labour accepts, so we just go there.
      router.push("/user/bookings")
    } catch (e) {
      const existing = e?.response?.data?.booking
      if (e?.response?.status === 409 && existing) { router.push("/user/bookings"); return }
      setFormError(e?.response?.data?.message || "Could not create booking")
      setSubmitting(false)
    }
  }

  const loadReviews = async (labourId, page, reset) => {
    setReviewLoading(true)
    try {
      const { data } = await axios.get(`/api/labour-review/get?labourId=${labourId}&page=${page}`)
      setReviewData((prev) => ({
        reviews: reset ? data.reviews : [...prev.reviews, ...data.reviews],
        total: data.totalReviews,
        avg: data.averageRating,
        next: data.nextPage,
      }))
    } catch (e) {
      // keep whatever is already shown
    } finally {
      setReviewLoading(false)
    }
  }

  const openReviews = (l) => {
    setReviewFor(l)
    setReviewData({ reviews: [], total: 0, avg: l.rating || 0, next: null })
    loadReviews(l._id, 1, true)
  }

  return (
    <div className='min-h-screen bg-zinc-100 text-zinc-900'>
      <div className='max-w-6xl mx-auto px-5 lg:px-8 py-6'>
        <div className='flex items-center gap-3 mb-6'>
          <button
            onClick={() => router.back()}
            className="w-11 h-11 rounded-full bg-white border border-zinc-200 shadow-sm flex items-center justify-center hover:bg-zinc-50"
          >
            <ArrowLeft size={17} />
          </button>
          <div className='min-w-0'>
            <h1 className='text-xl font-black tracking-tight'>
              {loading ? "Finding labour…" : labourList.length ? `${label} near you` : "No labour found"}
            </h1>
            <p className='text-xs text-zinc-500 flex items-center gap-1 truncate'>
              <MapPin size={12} className="shrink-0" />
              <span className='truncate'>{siteDetails ? `${siteDetails}, ` : ""}{address || "-"}</span>
            </p>
          </div>
        </div>

        {loading && (
          <div className='flex justify-center py-24'><Loader2 className='animate-spin text-zinc-700' size={30} /></div>
        )}

        {!loading && (error || labourList.length === 0) && (
          <div className="bg-white border border-zinc-200 rounded-3xl flex flex-col items-center text-center py-16 px-6">
            <div className='w-20 h-20 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center mb-4'>
              <Search size={26} className="text-zinc-400" />
            </div>
            <p className='font-bold text-base mb-1'>{error ? "Something went wrong" : "Labour not found in your area"}</p>
            <p className='text-zinc-500 text-sm max-w-xs'>
              {error || `No ${label.toLowerCase()} are available near this address right now. Our team can arrange one for you and call you to confirm.`}
            </p>
            <div className='flex flex-wrap justify-center gap-3 mt-6'>
              {!error && lat && lon && (
                <button onClick={openAssign} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl">
                  <UserPlus size={14} /> Book anyway, we will assign
                </button>
              )}
              <button onClick={fetchLabour} className="flex items-center gap-2 bg-zinc-900 text-white text-sm font-semibold px-5 py-2.5 rounded-xl">
                <RefreshCcw size={14} /> Retry
              </button>
              <button onClick={() => router.push("/user/book")} className="text-sm font-semibold px-5 py-2.5 rounded-xl border border-zinc-300 bg-white">
                Change search
              </button>
            </div>
          </div>
        )}

        {!loading && !error && labourList.length > 0 && (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
            {labourList.map((l) => (
              <div key={l._id} className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-14 h-14 rounded-xl bg-zinc-100 overflow-hidden shrink-0 flex items-center justify-center">
                    {l.profileImage
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={l.profileImage} alt={l.fullName} className="w-full h-full object-cover" />
                      : <HardHat size={20} className="text-zinc-400" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold truncate flex items-center gap-1">
                      {l.fullName}
                      <BadgeCheck size={15} className="text-emerald-600 shrink-0" />
                    </p>
                    <p className="text-xs text-zinc-500 capitalize">{(l.category || "").replace("-", " ")}</p>
                    <div className="flex items-center gap-1 text-xs text-zinc-500 mt-0.5">
                      <button onClick={() => openReviews(l)} className="flex items-center gap-1 hover:underline">
                        <Star size={11} className="text-amber-400 fill-amber-400" />
                        <span>{l.rating ? l.rating.toFixed(1) : "New"}</span>
                        {l.totalReviews > 0 && <span>({l.totalReviews})</span>}
                      </button>
                      <span className="w-1 h-1 rounded-full bg-zinc-300" />
                      <span>{l.distance.toFixed(1)} km away</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center bg-zinc-50 border border-zinc-100 rounded-xl py-3 mb-4">
                  <div>
                    <p className="text-[10px] text-zinc-400">Experience</p>
                    <p className="text-sm font-bold">{l.experienceYears || 0} yrs</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-400">Per day</p>
                    <p className="text-sm font-bold">{l.pricePerDay ? `₹${l.pricePerDay}` : "-"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-400">Per hour</p>
                    <p className="text-sm font-bold">{l.pricePerHour ? `₹${l.pricePerHour}` : "-"}</p>
                  </div>
                </div>

                <a href={`tel:${l.phone}`} className="flex items-center gap-2 text-sm font-semibold text-zinc-800 mb-4 hover:underline">
                  <Phone size={14} /> {l.phone}
                </a>

                <div className="flex gap-2 mt-auto">
                  <a
                    href={`tel:${l.phone}`}
                    className="flex-1 h-11 rounded-xl border border-zinc-300 bg-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-zinc-50"
                  >
                    <Phone size={14} /> Call
                  </a>
                  <button
                    onClick={() => openHire(l)}
                    className="flex-1 h-11 rounded-xl bg-zinc-900 hover:bg-black text-white font-bold text-sm"
                  >
                    Hire
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Hire modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => !submitting && setSelected(null)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 max-h-[92vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h3 className="text-lg font-black">{isAssign ? `Book ${selected.fullName}` : `Hire ${selected.fullName}`}</h3>
                  <p className="text-xs text-zinc-500">
                    {isAssign ? "Our team will find the right person and call you" : "Fix the visit time and payment"}
                  </p>
                </div>
                <button onClick={() => setSelected(null)} disabled={submitting} className="p-1 text-zinc-500 hover:text-zinc-900">
                  <X size={20} />
                </button>
              </div>

              {selected.rateType === "both" && (
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {[["daily", "Per day"], ["hourly", "Per hour"]].map(([id, text]) => (
                    <button
                      key={id}
                      onClick={() => setPricingType(id)}
                      className={`h-11 rounded-xl text-sm font-bold border-2 ${pricingType === id ? "bg-zinc-900 text-white border-zinc-900" : "bg-zinc-50 border-zinc-200"}`}
                    >
                      {text}
                    </button>
                  ))}
                </div>
              )}

              <label className="text-xs font-bold text-zinc-500">{pricingType === "hourly" ? "How many hours?" : "How many days?"}</label>
              <input
                type="number" min={1} max={pricingType === "hourly" ? 24 : 365}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full mt-1 mb-4 h-12 px-4 rounded-xl bg-zinc-50 border border-zinc-200 text-sm font-semibold outline-none focus:border-zinc-900"
              />

              <label className="text-xs font-bold text-zinc-500 flex items-center gap-1"><Clock size={12} /> Visit date & time at your home</label>
              <input
                type="datetime-local" min={nowLocal()}
                value={visitAt}
                onChange={(e) => setVisitAt(e.target.value)}
                className="w-full mt-1 mb-4 h-12 px-4 rounded-xl bg-zinc-50 border border-zinc-200 text-sm font-semibold outline-none focus:border-zinc-900"
              />

              <p className="text-xs font-bold text-zinc-500 mb-2">Payment</p>
              <div className="space-y-2 mb-5">
                {[
                  { id: "cash", Icon: Banknote, title: "Cash", sub: "Pay the labour after work" },
                  { id: "online", Icon: Wallet, title: "Online", sub: "UPI · Card · Netbanking. Pay from My Bookings after the labour accepts" },
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPaymentMethod(p.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-2xl border-2 text-left ${paymentMethod === p.id ? "bg-zinc-900 border-zinc-900 text-white" : "bg-zinc-50 border-zinc-200"}`}
                  >
                    <p.Icon size={18} />
                    <span>
                      <span className="block text-sm font-bold">{p.title}</span>
                      <span className={`block text-xs ${paymentMethod === p.id ? "text-zinc-400" : "text-zinc-500"}`}>{p.sub}</span>
                    </span>
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between border-t border-zinc-100 pt-4 mb-4">
                {isAssign ? (
                  <span className="text-sm text-zinc-500">Fare will be confirmed by our team on call</span>
                ) : (
                  <>
                    <span className="text-sm text-zinc-500">Total ({quantity || 0} × ₹{rate || 0})</span>
                    <span className="text-2xl font-black">₹{total}</span>
                  </>
                )}
              </div>

              {formError && (
                <div className="flex items-center gap-2 text-red-600 text-xs mb-3">
                  <AlertCircle size={14} /> {formError}
                </div>
              )}

              <button
                onClick={handleHire}
                disabled={submitting}
                className="w-full h-14 rounded-2xl bg-zinc-900 hover:bg-black disabled:opacity-50 text-white font-black text-sm flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 size={18} className="animate-spin" /> : isAssign ? "Send request" : "Confirm Booking"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reviews modal */}
      <AnimatePresence>
        {reviewFor && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => setReviewFor(null)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-black">{reviewFor.fullName}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Stars value={reviewData.avg} size={14} />
                    <span className="text-sm font-bold">{reviewData.avg ? Number(reviewData.avg).toFixed(1) : "New"}</span>
                    <span className="text-xs text-zinc-500">{reviewData.total} reviews</span>
                  </div>
                </div>
                <button onClick={() => setReviewFor(null)} className="p-1 text-zinc-500 hover:text-zinc-900"><X size={20} /></button>
              </div>

              {reviewData.reviews.length === 0 && !reviewLoading && (
                <p className="text-sm text-zinc-500 py-6 text-center">No reviews yet.</p>
              )}

              <div className="space-y-3">
                {reviewData.reviews.map((r) => (
                  <div key={r._id} className="border border-zinc-100 rounded-xl p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold">{r.reviewedBy}</p>
                      <span className="text-[11px] text-zinc-400">
                        {new Date(r.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                      </span>
                    </div>
                    <Stars value={r.rating} />
                    {r.title && <p className="text-sm font-semibold mt-1">{r.title}</p>}
                    {r.review && <p className="text-sm text-zinc-600 mt-1">{r.review}</p>}
                  </div>
                ))}
              </div>

              {reviewLoading && <div className="flex justify-center py-4"><Loader2 className="animate-spin" size={20} /></div>}

              {reviewData.next && !reviewLoading && (
                <button
                  onClick={() => loadReviews(reviewFor._id, reviewData.next, false)}
                  className="w-full mt-4 h-11 rounded-xl border border-zinc-300 text-sm font-bold"
                >
                  Load more
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default SearchPage






























// 'use client'
// import React, { useEffect, useMemo, useState } from 'react'
// import { AnimatePresence, motion } from "framer-motion"
// import {
//   ArrowLeft, MapPin, RefreshCcw, Search, Star, Phone, HardHat, BadgeCheck,
//   X, Loader2, Banknote, Wallet, Clock, AlertCircle,
// } from 'lucide-react'
// import { useRouter, useSearchParams } from 'next/navigation'
// import axios from 'axios'
// import { payForBooking } from '@/lib/payBooking'

// const CATEGORY_LABEL = {
//   all: "Workers", helpers: "Helpers", masons: "Masons", electricians: "Electricians",
//   plumbers: "Plumbers", carpenters: "Carpenters", painters: "Painters",
//   "tile-experts": "Tile Experts", welders: "Welders", "jcb-operators": "JCB Operators",
//   contractors: "Contractors", engineers: "Engineers",
// }

// // value for <input type="datetime-local" min=...>
// const nowLocal = () => {
//   const d = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
//   return d.toISOString().slice(0, 16)
// }

// function SearchPage() {
//   const router = useRouter()
//   const params = useSearchParams()

//   const category = params.get("category") || "all"
//   const mobile = params.get("mobile") || ""
//   const siteDetails = params.get("siteDetails") || ""
//   const address = params.get("address") || ""
//   const lat = Number(params.get("lat")) || null
//   const lon = Number(params.get("lon")) || null

//   const [labourList, setLabourList] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState("")

//   // hire modal
//   const [selected, setSelected] = useState(null)
//   const [pricingType, setPricingType] = useState("daily")
//   const [quantity, setQuantity] = useState(1)
//   const [visitAt, setVisitAt] = useState("")
//   const [paymentMethod, setPaymentMethod] = useState("cash")
//   const [submitting, setSubmitting] = useState(false)
//   const [formError, setFormError] = useState("")

//   const label = CATEGORY_LABEL[category] || "Labour"

//   const fetchLabour = async () => {
//     if (!lat || !lon) { setLoading(false); return }
//     setLoading(true)
//     setError("")
//     try {
//       const { data } = await axios.post("/api/labours/near-by", { latitude: lat, longitude: lon, category })
//       setLabourList(data)
//     } catch (e) {
//       setLabourList([])
//       setError(e?.response?.status === 401 ? "Please login to see labour contact details." : "Could not load labour. Please try again.")
//     } finally {
//       setLoading(false)
//     }
//   }

//   useEffect(() => { fetchLabour() }, [lat, lon, category])

//   const openHire = (l) => {
//     setSelected(l)
//     setPricingType(l.rateType === "hour" ? "hourly" : "daily")
//     setQuantity(1)
//     setVisitAt("")
//     setPaymentMethod("cash")
//     setFormError("")
//   }

//   const rate = useMemo(() => {
//     if (!selected) return 0
//     return pricingType === "hourly" ? selected.pricePerHour : selected.pricePerDay
//   }, [selected, pricingType])

//   const total = (rate || 0) * (Number(quantity) || 0)

//   const handleHire = async () => {
//     if (!visitAt) { setFormError("Select the date and time you want the labour to visit"); return }
//     if (!quantity || quantity < 1) { setFormError("Enter a valid number"); return }
//     setSubmitting(true)
//     setFormError("")
//     try {
//       const { data: booking } = await axios.post("/api/booking/create", {
//         labourId: selected._id,
//         pricingType,
//         quantity: Number(quantity),
//         visitAt: new Date(visitAt).toISOString(),
//         paymentMethod,
//         workAddress: address,
//         siteDetails,
//         workLocation: { latitude: lat, longitude: lon },
//         mobileNumber: mobile,
//       })
//       if (paymentMethod === "online") {
//         try { await payForBooking(booking._id) }
//         catch (e) { console.log(e) } // booking stays unpaid, user can pay from My Bookings
//       }
//       router.push("/user/bookings")
//     } catch (e) {
//       const existing = e?.response?.data?.booking
//       if (e?.response?.status === 409 && existing) { router.push("/user/bookings"); return }
//       setFormError(e?.response?.data?.message || "Could not create booking")
//       setSubmitting(false)
//     }
//   }

//   return (
//     <div className='min-h-screen bg-zinc-100 text-zinc-900'>
//       <div className='max-w-6xl mx-auto px-5 lg:px-8 py-6'>
//         <div className='flex items-center gap-3 mb-6'>
//           <button
//             onClick={() => router.back()}
//             className="w-11 h-11 rounded-full bg-white border border-zinc-200 shadow-sm flex items-center justify-center hover:bg-zinc-50"
//           >
//             <ArrowLeft size={17} />
//           </button>
//           <div className='min-w-0'>
//             <h1 className='text-xl font-black tracking-tight'>
//               {loading ? "Finding labour…" : labourList.length ? `${label} near you` : "No labour found"}
//             </h1>
//             <p className='text-xs text-zinc-500 flex items-center gap-1 truncate'>
//               <MapPin size={12} className="shrink-0" />
//               <span className='truncate'>{siteDetails ? `${siteDetails}, ` : ""}{address || "-"}</span>
//             </p>
//           </div>
//         </div>

//         {loading && (
//           <div className='flex justify-center py-24'><Loader2 className='animate-spin text-zinc-700' size={30} /></div>
//         )}

//         {!loading && (error || labourList.length === 0) && (
//           <div className="bg-white border border-zinc-200 rounded-3xl flex flex-col items-center text-center py-16 px-6">
//             <div className='w-20 h-20 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center mb-4'>
//               <Search size={26} className="text-zinc-400" />
//             </div>
//             <p className='font-bold text-base mb-1'>{error ? "Something went wrong" : "Labour not found in your area"}</p>
//             <p className='text-zinc-500 text-sm max-w-xs'>
//               {error || `No ${label.toLowerCase()} are registered near this address yet. Try another category or a nearby location.`}
//             </p>
//             <div className='flex gap-3 mt-6'>
//               <button onClick={fetchLabour} className="flex items-center gap-2 bg-zinc-900 text-white text-sm font-semibold px-5 py-2.5 rounded-xl">
//                 <RefreshCcw size={14} /> Retry
//               </button>
//               <button onClick={() => router.push("/user/book")} className="text-sm font-semibold px-5 py-2.5 rounded-xl border border-zinc-300 bg-white">
//                 Change search
//               </button>
//             </div>
//           </div>
//         )}

//         {!loading && !error && labourList.length > 0 && (
//           <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
//             {labourList.map((l) => (
//               <div key={l._id} className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm flex flex-col">
//                 <div className="flex items-center gap-3 mb-4">
//                   <div className="w-14 h-14 rounded-xl bg-zinc-100 overflow-hidden shrink-0 flex items-center justify-center">
//                     {l.profileImage
//                       // eslint-disable-next-line @next/next/no-img-element
//                       ? <img src={l.profileImage} alt={l.fullName} className="w-full h-full object-cover" />
//                       : <HardHat size={20} className="text-zinc-400" />}
//                   </div>
//                   <div className="min-w-0 flex-1">
//                     <p className="font-bold truncate flex items-center gap-1">
//                       {l.fullName}
//                       <BadgeCheck size={15} className="text-emerald-600 shrink-0" />
//                     </p>
//                     <p className="text-xs text-zinc-500 capitalize">{(l.category || "").replace("-", " ")}</p>
//                     <div className="flex items-center gap-1 text-xs text-zinc-500 mt-0.5">
//                       <Star size={11} className="text-amber-400 fill-amber-400" />
//                       <span>{l.rating ? l.rating.toFixed(1) : "New"}</span>
//                       <span className="w-1 h-1 rounded-full bg-zinc-300" />
//                       <span>{l.distance.toFixed(1)} km away</span>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-3 gap-2 text-center bg-zinc-50 border border-zinc-100 rounded-xl py-3 mb-4">
//                   <div>
//                     <p className="text-[10px] text-zinc-400">Experience</p>
//                     <p className="text-sm font-bold">{l.experienceYears || 0} yrs</p>
//                   </div>
//                   <div>
//                     <p className="text-[10px] text-zinc-400">Per day</p>
//                     <p className="text-sm font-bold">{l.pricePerDay ? `₹${l.pricePerDay}` : "-"}</p>
//                   </div>
//                   <div>
//                     <p className="text-[10px] text-zinc-400">Per hour</p>
//                     <p className="text-sm font-bold">{l.pricePerHour ? `₹${l.pricePerHour}` : "-"}</p>
//                   </div>
//                 </div>

//                 <a href={`tel:${l.phone}`} className="flex items-center gap-2 text-sm font-semibold text-zinc-800 mb-4 hover:underline">
//                   <Phone size={14} /> {l.phone}
//                 </a>

//                 <div className="flex gap-2 mt-auto">
//                   <a
//                     href={`tel:${l.phone}`}
//                     className="flex-1 h-11 rounded-xl border border-zinc-300 bg-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-zinc-50"
//                   >
//                     <Phone size={14} /> Call
//                   </a>
//                   <button
//                     onClick={() => openHire(l)}
//                     className="flex-1 h-11 rounded-xl bg-zinc-900 hover:bg-black text-white font-bold text-sm"
//                   >
//                     Hire
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>

//       {/* Hire modal */}
//       <AnimatePresence>
//         {selected && (
//           <motion.div
//             initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
//             className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4"
//             onClick={() => !submitting && setSelected(null)}
//           >
//             <motion.div
//               initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
//               onClick={(e) => e.stopPropagation()}
//               className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 max-h-[92vh] overflow-y-auto"
//             >
//               <div className="flex items-start justify-between mb-5">
//                 <div>
//                   <h3 className="text-lg font-black">Hire {selected.fullName}</h3>
//                   <p className="text-xs text-zinc-500">Fix the visit time and payment</p>
//                 </div>
//                 <button onClick={() => setSelected(null)} disabled={submitting} className="p-1 text-zinc-500 hover:text-zinc-900">
//                   <X size={20} />
//                 </button>
//               </div>

//               {selected.rateType === "both" && (
//                 <div className="grid grid-cols-2 gap-2 mb-4">
//                   {[["daily", "Per day"], ["hourly", "Per hour"]].map(([id, text]) => (
//                     <button
//                       key={id}
//                       onClick={() => setPricingType(id)}
//                       className={`h-11 rounded-xl text-sm font-bold border-2 ${pricingType === id ? "bg-zinc-900 text-white border-zinc-900" : "bg-zinc-50 border-zinc-200"}`}
//                     >
//                       {text}
//                     </button>
//                   ))}
//                 </div>
//               )}

//               <label className="text-xs font-bold text-zinc-500">{pricingType === "hourly" ? "How many hours?" : "How many days?"}</label>
//               <input
//                 type="number" min={1} max={pricingType === "hourly" ? 24 : 365}
//                 value={quantity}
//                 onChange={(e) => setQuantity(e.target.value)}
//                 className="w-full mt-1 mb-4 h-12 px-4 rounded-xl bg-zinc-50 border border-zinc-200 text-sm font-semibold outline-none focus:border-zinc-900"
//               />

//               <label className="text-xs font-bold text-zinc-500 flex items-center gap-1"><Clock size={12} /> Visit date & time at your home</label>
//               <input
//                 type="datetime-local" min={nowLocal()}
//                 value={visitAt}
//                 onChange={(e) => setVisitAt(e.target.value)}
//                 className="w-full mt-1 mb-4 h-12 px-4 rounded-xl bg-zinc-50 border border-zinc-200 text-sm font-semibold outline-none focus:border-zinc-900"
//               />

//               <p className="text-xs font-bold text-zinc-500 mb-2">Payment</p>
//               <div className="space-y-2 mb-5">
//                 {[
//                   { id: "cash", Icon: Banknote, title: "Cash", sub: "Pay the labour after work" },
//                   { id: "online", Icon: Wallet, title: "Online", sub: "UPI · Card · Netbanking" },
//                 ].map((p) => (
//                   <button
//                     key={p.id}
//                     onClick={() => setPaymentMethod(p.id)}
//                     className={`w-full flex items-center gap-3 p-3 rounded-2xl border-2 text-left ${paymentMethod === p.id ? "bg-zinc-900 border-zinc-900 text-white" : "bg-zinc-50 border-zinc-200"}`}
//                   >
//                     <p.Icon size={18} />
//                     <span>
//                       <span className="block text-sm font-bold">{p.title}</span>
//                       <span className={`block text-xs ${paymentMethod === p.id ? "text-zinc-400" : "text-zinc-500"}`}>{p.sub}</span>
//                     </span>
//                   </button>
//                 ))}
//               </div>

//               <div className="flex items-center justify-between border-t border-zinc-100 pt-4 mb-4">
//                 <span className="text-sm text-zinc-500">Total ({quantity || 0} × ₹{rate || 0})</span>
//                 <span className="text-2xl font-black">₹{total}</span>
//               </div>

//               {formError && (
//                 <div className="flex items-center gap-2 text-red-600 text-xs mb-3">
//                   <AlertCircle size={14} /> {formError}
//                 </div>
//               )}

//               <button
//                 onClick={handleHire}
//                 disabled={submitting}
//                 className="w-full h-14 rounded-2xl bg-zinc-900 hover:bg-black disabled:opacity-50 text-white font-black text-sm flex items-center justify-center gap-2"
//               >
//                 {submitting ? <Loader2 size={18} className="animate-spin" /> : paymentMethod === "online" ? "Confirm & Pay Online" : "Confirm Booking"}
//               </button>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   )
// }

// export default SearchPage