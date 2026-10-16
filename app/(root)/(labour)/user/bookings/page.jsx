'use client'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import Link from 'next/link'
import { Loader2, MapPin, Phone, Clock, IndianRupee, Plus, Star, X } from 'lucide-react'
import { payForBooking } from '@/lib/payBooking'

const STATUS = {
  unassigned: { text: "Finding labour", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  requested: { text: "Waiting for labour", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  rejected: { text: "Finding another labour", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  awaiting_payment: { text: "Payment pending", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  confirmed: { text: "Confirmed", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  started: { text: "In progress", cls: "bg-blue-50 text-blue-700 border-blue-200" },
  completed: { text: "Completed", cls: "bg-zinc-100 text-zinc-700 border-zinc-200" },
  cancelled: { text: "Cancelled", cls: "bg-red-50 text-red-700 border-red-200" },
  expired: { text: "Expired", cls: "bg-zinc-100 text-zinc-500 border-zinc-200" },
}

const CANCELLABLE = ["unassigned", "requested", "rejected", "awaiting_payment", "confirmed"]

const fmt = (d) =>
  d ? new Date(d).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "-"

const paymentLine = (b) => {
  if (b.paymentMethod === "cash") return "Cash · pay after work"
  if (b.paymentStatus === "paid") return "Online · paid"
  if (["confirmed", "completed"].includes(b.bookingStatus)) return "Online · payment pending"
  return "Online · you can pay after the labour accepts"
}

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)
  const [error, setError] = useState("")

  // review modal
  const [reviewing, setReviewing] = useState(null)
  const [stars, setStars] = useState(0)
  const [comment, setComment] = useState("")
  const [reviewError, setReviewError] = useState("")
  const [savingReview, setSavingReview] = useState(false)

  const load = async () => {
    try {
      const { data } = await axios.get("/api/booking/my")
      setBookings(data)
    } catch (e) {
      setError(e?.response?.status === 401 ? "Please login to see your bookings." : "Could not load bookings.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    const t = setInterval(load, 15000)
    return () => clearInterval(t)
  }, [])

  const pay = async (id) => {
    setBusyId(id)
    try { await payForBooking(id) } catch (e) { alert(e?.response?.data?.message || e.message) }
    await load()
    setBusyId(null)
  }

  const cancel = async (id) => {
    if (!confirm("Cancel this booking?")) return
    setBusyId(id)
    try { await axios.post(`/api/booking/${id}/cancel`) }
    catch (e) { alert(e?.response?.data?.message || "Could not cancel") }
    await load()
    setBusyId(null)
  }

  const openReview = (b) => {
    setReviewing(b)
    setStars(0)
    setComment("")
    setReviewError("")
  }

  const submitReview = async () => {
    if (!stars) { setReviewError("Select a rating"); return }
    setSavingReview(true)
    setReviewError("")
    try {
      await axios.post("/api/labour-review/create", { bookingId: reviewing._id, rating: stars, review: comment })
      setReviewing(null)
      await load()
    } catch (e) {
      setReviewError(e?.response?.data?.message || "Could not submit review")
    } finally {
      setSavingReview(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-100 px-4 py-10">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black tracking-tight">My Bookings</h1>
          <Link href="/user/book" className="flex items-center gap-1.5 bg-zinc-900 text-white text-sm font-bold px-4 py-2.5 rounded-xl">
            <Plus size={15} /> New booking
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>
        ) : error ? (
          <div className="bg-white border border-zinc-200 rounded-2xl p-10 text-center text-zinc-500">{error}</div>
        ) : bookings.length === 0 ? (
          <div className="bg-white border border-zinc-200 rounded-2xl p-10 text-center text-zinc-500">You have no bookings yet.</div>
        ) : (
          <div className="space-y-4">
            {bookings.map((b) => {
              const st = STATUS[b.bookingStatus] || STATUS.requested
              const paidOnline = b.paymentMethod === "online" && b.paymentStatus === "paid"
              const canCancel = CANCELLABLE.includes(b.bookingStatus) && !paidOnline
              const canPay =
                b.paymentMethod === "online" &&
                ["pending", "failed"].includes(b.paymentStatus) &&
                ["confirmed", "completed"].includes(b.bookingStatus) &&
                b.fare > 0
              const canReview = b.bookingStatus === "completed" && !b.reviewed
              return (
                <div key={b._id} className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="font-bold text-lg">{b.labourName || "Labour will be assigned"}</p>
                      <p className="text-xs text-zinc-500 capitalize">{(b.category === "all" ? "any worker" : b.category || "").replace("-", " ")}</p>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${st.cls}`}>{st.text}</span>
                  </div>

                  {["unassigned", "rejected"].includes(b.bookingStatus) && (
                    <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2 mb-3">
                      Our team will call you shortly and arrange a labour for you.
                    </p>
                  )}

                  <div className="space-y-2 text-sm text-zinc-700">
                    <p className="flex items-center gap-2"><Clock size={14} className="text-zinc-400" /> Visit: {fmt(b.visitAt)}</p>
                    <p className="flex items-start gap-2"><MapPin size={14} className="text-zinc-400 mt-0.5 shrink-0" /> {b.siteDetails ? `${b.siteDetails}, ` : ""}{b.workAddress}</p>
                    {b.labourMobileNumber && b.bookingStatus !== "cancelled" && (
                      <a href={`tel:${b.labourMobileNumber}`} className="flex items-center gap-2 font-semibold hover:underline">
                        <Phone size={14} className="text-zinc-400" /> {b.labourMobileNumber}
                      </a>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-zinc-100 gap-3 flex-wrap">
                    <div>
                      {b.fare > 0 ? (
                        <>
                          <p className="text-xs text-zinc-400">{b.duration} {b.pricingType === "hourly" ? "hr" : "day"} × ₹{b.ratePerUnit}</p>
                          <p className="text-xl font-black flex items-center"><IndianRupee size={16} />{b.fare}</p>
                        </>
                      ) : (
                        <p className="text-sm font-bold text-zinc-600">Fare will be confirmed on call</p>
                      )}
                      <p className="text-xs text-zinc-500">{paymentLine(b)}</p>
                    </div>
                    <div className="flex gap-2">
                      {canPay && (
                        <button onClick={() => pay(b._id)} disabled={busyId === b._id} className="px-4 py-2.5 rounded-xl bg-zinc-900 text-white text-sm font-bold disabled:opacity-50">
                          {busyId === b._id ? "Please wait…" : "Pay now"}
                        </button>
                      )}
                      {canReview && (
                        <button onClick={() => openReview(b)} className="flex items-center gap-1 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold">
                          <Star size={14} /> Rate labour
                        </button>
                      )}
                      {canCancel && (
                        <button onClick={() => cancel(b._id)} disabled={busyId === b._id} className="px-4 py-2.5 rounded-xl border border-zinc-300 text-sm font-bold disabled:opacity-50">
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {reviewing && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => !savingReview && setReviewing(null)}>
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-black">Rate {reviewing.labourName}</h3>
                <p className="text-xs text-zinc-500">How was the work?</p>
              </div>
              <button onClick={() => setReviewing(null)} disabled={savingReview} className="p-1 text-zinc-500"><X size={20} /></button>
            </div>

            <div className="flex gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((s) => (
                <button key={s} onClick={() => setStars(s)} type="button">
                  <Star size={30} className={s <= stars ? "text-amber-400 fill-amber-400" : "text-zinc-300"} />
                </button>
              ))}
            </div>

            <textarea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={1000}
              placeholder="Share your experience (optional)"
              className="w-full p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-sm outline-none focus:border-zinc-900"
            />

            {reviewError && <p className="text-red-600 text-xs mt-2">{reviewError}</p>}

            <button
              onClick={submitReview}
              disabled={savingReview}
              className="w-full h-12 mt-4 rounded-2xl bg-zinc-900 text-white font-black text-sm disabled:opacity-50 flex items-center justify-center"
            >
              {savingReview ? <Loader2 size={18} className="animate-spin" /> : "Submit review"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
