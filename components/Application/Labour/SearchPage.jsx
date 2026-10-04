'use client'
import React, { useEffect, useState } from 'react'
import { AnimatePresence, motion } from "framer-motion"
import {
  ArrowLeft, MapPin, RefreshCcw, Search, Star, Zap, Phone,
  Construction, Drill, Hammer, HardHat, House, Pickaxe,
  PaintRoller, ShieldCheck, Truck, Warehouse, Wrench,
} from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
const SearchMap = dynamic(() => import("@/components/Application/Labour/SearchMap"), { ssr: false })
import axios from 'axios'

const CATEGORY_META = {
  helpers: { label: "Helpers", Icon: Construction },
  masons: { label: "Masons", Icon: Hammer },
  electricians: { label: "Electricians", Icon: Drill },
  plumbers: { label: "Plumbers", Icon: Wrench },
  carpenters: { label: "Carpenters", Icon: Warehouse },
  painters: { label: "Painters", Icon: PaintRoller },
  "tile-experts": { label: "Tile Experts", Icon: House },
  welders: { label: "Welders", Icon: ShieldCheck },
  "jcb-operators": { label: "JCB Operators", Icon: Truck },
  contractors: { label: "Contractors", Icon: Pickaxe },
  engineers: { label: "Engineers", Icon: HardHat },
}

function SearchPage() {
  const router = useRouter()
  const params = useSearchParams()

  const category = params.get("category") || ""
  const mobile = params.get("mobile") || ""
  const siteDetails = params.get("siteDetails") || ""
  const fullAddress = params.get("fullAddress") || params.get("address") || ""

  const [workAddress, setWorkAddress] = useState(params.get("address") || "")
  const [workLat, setWorkLat] = useState(Number(params.get("lat")) || null)
  const [workLon, setWorkLon] = useState(Number(params.get("lon")) || null)

  const [labourList, setLabourList] = useState([])
  const [loading, setLoading] = useState(false)

  const meta = CATEGORY_META[category] || { label: "Labour", Icon: HardHat }

  const getNearByLabour = async (latitude, longitude, cat) => {
    if (!latitude || !longitude) return
    setLoading(true)
    try {
      const { data } = await axios.post("/api/labours/near-by", {
        latitude, longitude, category: cat
      })
      setLabourList(data)
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  // Re-fetch whenever the resolved work-site coordinates actually change
  // (initial load, or after the customer drags the site pin).
  useEffect(() => {
    getNearByLabour(workLat, workLon, category)
  }, [workLat, workLon, category])

  const handleCoordsChange = ([lat, lon]) => {
    setWorkLat(lat)
    setWorkLon(lon)
  }

  return (
    <div className='min-h-screen bg-zinc-100 text-zinc-900 overflow-x-hidden'>
      <div className='absolute top-5 left-5 z-50'>
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={() => router.back()}
          className="w-11 h-11 rounded-full bg-white border border-zinc-200 shadow-md flex items-center justify-center hover:bg-zinc-50 transition-colors"
        >
          <ArrowLeft size={17} className="text-zinc-900" />
        </motion.button>
      </div>

      <div className='relative w-full h-[46vh] z-0'>
        <SearchMap
          address={workAddress}
          addressCoords={workLat && workLon ? [workLat, workLon] : undefined}
          labourList={labourList}
          onAddressChange={setWorkAddress}
          onCoordsChange={handleCoordsChange}
        />
      </div>

      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 160, damping: 22 }}
        className="relative z-20 -mt-10 bg-white rounded-t-[28px] border-t border-zinc-200 shadow-[0_-8px_40px_rgba(0,0,0,0.08)] pt-5 pb-20 min-h-[56vh]"
      >
        <div className='px-5 lg:px-8 max-w-6xl mx-auto'>

          {/* Site address card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="bg-zinc-50 border border-zinc-200 rounded-2xl overflow-hidden mb-5"
          >
            <div className='flex gap-3 px-4 py-3'>
              <div className='flex flex-col items-center pt-1.5 flex-shrink-0'>
                <div className='w-2.5 h-2.5 rounded-full bg-zinc-900' />
              </div>
              <div className='flex-1 min-w-0'>
                <p className='text-[10px] text-zinc-400 uppercase tracking-widest font-semibold mb-0.5'>Work Site</p>
                <p className='text-sm text-zinc-900 font-semibold leading-snug truncate'>
                  {siteDetails ? `${siteDetails}, ` : ""}{workAddress || fullAddress || "-"}
                </p>
              </div>
              <MapPin size={14} className="text-zinc-400 flex-shrink-0 mt-1.5" />
            </div>
          </motion.div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-between mb-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-zinc-900 flex items-center justify-center shrink-0">
                <meta.Icon size={18} className="text-white" />
              </div>
              <div>
                <h2 className='text-zinc-900 text-lg font-black tracking-tight'>
                  {loading
                    ? "Finding Labour"
                    : labourList.length > 0
                      ? `${meta.label} Available`
                      : "No Labour Nearby"
                  }
                </h2>
                <div className='text-zinc-400 text-xs mt-0.5'>near your work site</div>
              </div>
            </div>

            <AnimatePresence mode='wait'>
              {loading ? (
                <motion.div
                  key="searching"
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  className="flex items-center gap-2 bg-zinc-100 border border-zinc-200 px-3 py-1.5 rounded-full"
                >
                  <div className='w-3.5 h-3.5 rounded-full border-2 border-zinc-300 border-t-zinc-700 animate-spin' />
                  <span className='text-zinc-500 text-xs font-semibold'>Searching...</span>
                </motion.div>
              ) : labourList.length > 0 ? (
                <motion.div
                  key="live"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full"
                >
                  <Zap size={11} className="text-emerald-600 fill-emerald-600" />
                  <span className='text-emerald-700 text-xs font-bold'>Live</span>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </motion.div>

          {/* Empty state */}
          <AnimatePresence>
            {!loading && labourList.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-14 text-center"
              >
                <div className='w-20 h-20 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center mb-4'>
                  <Search size={26} className="text-zinc-400" />
                </div>
                <p className='text-zinc-900 font-bold text-base mb-1'>Labour Not Found</p>
                <p className='text-zinc-400 text-sm max-w-xs leading-relaxed'>
                  No {meta.label.toLowerCase()} available near your work site right now.
                </p>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => getNearByLabour(workLat, workLon, category)}
                  className="mt-5 flex items-center gap-2 bg-zinc-900 text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-zinc-800 transition-colors"
                >
                  <RefreshCcw size={14} /> Retry Search
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Labour list */}
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
            {labourList.map((l, i) => (
              <motion.div
                key={l._id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-zinc-100 overflow-hidden shrink-0 flex items-center justify-center">
                    {l.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={l.photoUrl} alt={l.name || "Labour"} className="w-full h-full object-cover" />
                    ) : (
                      <meta.Icon size={18} className="text-zinc-400" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-zinc-900 truncate">{l.name || "Labour Worker"}</p>
                    <div className="flex items-center gap-1 text-xs text-zinc-400">
                      <Star size={11} className="text-amber-400 fill-amber-400" />
                      <span>{l.rating ? l.rating.toFixed(1) : "New"}</span>
                      {typeof l.distance === "number" && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-zinc-300" />
                          <span>{l.distance.toFixed(1)} km away</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">Day Rate</p>
                    <p className="text-sm font-black text-zinc-900">
                      ₹{l.pricePerDay || l.dailyWage || 0}<span className="text-xs font-medium text-zinc-400">/day</span>
                    </p>
                  </div>
                  {l.experienceYears ? (
                    <div className="text-right">
                      <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">Experience</p>
                      <p className="text-sm font-bold text-zinc-900">{l.experienceYears} yrs</p>
                    </div>
                  ) : null}
                </div>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    const url = new URLSearchParams({
                      category,
                      mobile,
                      labourId: String(l._id),
                      address: workAddress || fullAddress,
                      siteDetails,
                      lat: String(workLat),
                      lon: String(workLon),
                    })
                    router.push(`/user/checkout?${url.toString()}`)
                  }}
                  className="w-full h-11 rounded-xl bg-zinc-900 hover:bg-black text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors"
                >
                  <Phone size={13} /> Book Now
                </motion.button>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default SearchPage

