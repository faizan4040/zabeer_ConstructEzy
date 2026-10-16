'use client'
import React, { useCallback, useEffect, useState } from 'react'
import { motion } from "framer-motion"
import axios from 'axios'
import { Clock, IndianRupee, Loader2, MapPin, HardHat, Banknote, Wallet } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { getSocket } from '@/lib/socket-client'

const fmt = (d) =>
  d ? new Date(d).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "-"

function PendingRequestsPage() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [actingId, setActingId] = useState(null)
  const [error, setError] = useState("")
  const router = useRouter()

  const load = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/partner/bookings/pending")
      setBookings(Array.isArray(data) ? data : [])
      setError("")
    } catch (e) {
      setError(e?.response?.data?.message || "Could not load requests. Please logout and login again.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    // polling keeps the page correct even when the socket is not connected
    const t = setInterval(load, 10000)
    let socket
    try {
      socket = getSocket()
      socket.on("booking-update", load)
    } catch (e) {}
    return () => {
      clearInterval(t)
      try { socket?.off("booking-update", load) } catch (e) {}
    }
  }, [load])

  const handleAccept = async (id) => {
    try {
      setActingId(id)
      await axios.post(`/api/partner/bookings/${id}/accept`)
      router.push("/partner/bookings")
    } catch (e) {
      alert(e?.response?.data?.message || "Could not accept this request")
      await load()
      setActingId(null)
    }
  }

  const handleReject = async (id) => {
    if (!confirm("Reject this request?")) return
    try {
      setActingId(id)
      await axios.post(`/api/partner/bookings/${id}/reject`)
      setBookings((prev) => prev.filter((b) => b._id !== id))
    } catch (e) {
      alert(e?.response?.data?.message || "Could not reject this request")
      await load()
    } finally {
      setActingId(null)
    }
  }

  return (
    <div className='min-h-screen bg-[#f4f5f7]'>
      <div className='bg-white border-b border-gray-200'>
        <div className='max-w-6xl mx-auto px-6 py-16'>
          <h1 className='text-4xl font-semibold text-gray-900'>Job Requests</h1>
          <p className='mt-3 text-gray-500 text-lg'>Accept quickly. Our team will call you and the customer to confirm.</p>
        </div>
      </div>

      <div className='max-w-6xl mx-auto px-6 py-12'>
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm p-3">{error}</div>
        )}

        {loading ? (
          <div className='flex justify-center py-20'>
            <Loader2 className="animate-spin w-8 h-8 text-gray-700" />
          </div>
        ) : bookings.length === 0 ? (
          <div className='bg-white rounded-2xl border border-gray-200 p-16 text-center shadow-sm'>
            <p className='text-gray-500 text-lg'>No pending job requests.</p>
          </div>
        ) : (
          <div className='space-y-6'>
            {bookings.map((b) => (
              <motion.div
                key={b._id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm"
              >
                <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8'>
                  <div className="flex-1 space-y-6">
                    <div className='flex gap-4'>
                      <div className='bg-gray-100 p-3 rounded-lg flex items-center justify-center h-fit'>
                        <MapPin size={18} />
                      </div>
                      <div>
                        <p className='text-xs uppercase text-gray-400 mb-1'>Work Location</p>
                        <p className='text-gray-900 font-medium'>{b.siteDetails ? `${b.siteDetails}, ` : ""}{b.workAddress}</p>
                      </div>
                    </div>

                    <div className='flex gap-4'>
                      <div className='bg-gray-100 p-3 rounded-lg flex items-center justify-center h-fit'>
                        <HardHat size={18} />
                      </div>
                      <div>
                        <p className='text-xs uppercase text-gray-400 mb-1'>Work Type</p>
                        <p className='text-gray-900 font-medium capitalize'>
                          {(b.category || "").replace("-", " ")} • {b.duration} {b.pricingType === "hourly" ? "hrs" : "days"} @ ₹{b.ratePerUnit}/{b.pricingType === "hourly" ? "hr" : "day"}
                        </p>
                      </div>
                    </div>

                    <div className='flex gap-4'>
                      <div className='bg-gray-100 p-3 rounded-lg flex items-center justify-center h-fit'>
                        <Clock size={18} />
                      </div>
                      <div>
                        <p className='text-xs uppercase text-gray-400 mb-1'>Visit time</p>
                        <p className='text-gray-900 font-medium'>{fmt(b.visitAt)}</p>
                      </div>
                    </div>

                    <div className='flex gap-4'>
                      <div className='bg-gray-100 p-3 rounded-lg flex items-center justify-center h-fit'>
                        {b.paymentMethod === "cash" ? <Banknote size={18} /> : <Wallet size={18} />}
                      </div>
                      <div>
                        <p className='text-xs uppercase text-gray-400 mb-1'>Payment</p>
                        <p className='text-gray-900 font-medium'>
                          {b.paymentMethod === "cash" ? "Cash — collect from the customer after work" : "Online — paid to your bank account"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className='flex flex-col justify-between lg:items-end gap-6 w-full lg:w-auto'>
                    <div className='text-left lg:text-right'>
                      <p className='text-xs tracking-wide text-gray-400 uppercase mb-1'>Fare</p>
                      <div className='flex items-center gap-2 text-3xl font-bold text-gray-900 lg:justify-end'>
                        <IndianRupee size={20} />
                        {b.fare}
                      </div>
                    </div>

                    <div className='flex gap-4 w-full lg:w-auto'>
                      <button
                        onClick={() => handleReject(b._id)}
                        disabled={actingId === b._id}
                        className='flex-1 lg:flex-none px-6 py-3 rounded-xl border border-gray-300 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-100 transition active:scale-[0.98] disabled:opacity-50'
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleAccept(b._id)}
                        disabled={actingId === b._id}
                        className='flex-1 lg:flex-none px-8 py-3 rounded-xl bg-black text-white text-sm font-semibold shadow-md hover:bg-gray-900 transition active:scale-[0.98] disabled:opacity-50 flex items-center justify-center'
                      >
                        {actingId === b._id ? "Please wait..." : "Accept Job"}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default PendingRequestsPage
