'use client'
import React, { useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import * as socketClient from '@/lib/socket-client'
import { Loader2, MapPin, Phone, Clock, IndianRupee, CheckCircle2, User, Check, X } from 'lucide-react'

const fmt = (d) =>
  d ? new Date(d).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "-"

const TABS = [
  ["requested", "New requests"],
  ["confirmed", "Accepted"],
  ["completed", "Completed"],
]

const PAYOUT_TEXT = {
  pending: "Will be sent to your bank soon",
  processing: "Being sent to your bank",
  paid: "Sent to your bank",
  failed: "Bank transfer delayed. Our team will fix it",
  not_applicable: "",
}

export default function PartnerBookingsPage() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)
  const [tab, setTab] = useState("requested")
  const [error, setError] = useState("")

  const load = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/partner/bookings")
      setJobs(Array.isArray(data) ? data : [])
      setError("")
    } catch (e) {
      setError(e?.response?.data?.message || "Could not load bookings. Please logout and login again.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    const t = setInterval(load, 10000)

    let socket
    try {
      socket = socketClient.getSocket?.()
      socket?.on("booking-update", load)
      socket?.on("new-booking", load)
    } catch (e) {}

    return () => {
      clearInterval(t)
      try {
        socket?.off("booking-update", load)
        socket?.off("new-booking", load)
      } catch (e) {}
    }
  }, [load])

  const act = async (job, action, body = {}) => {
    setBusyId(job._id)
    try {
      await axios.post(`/api/partner/bookings/${job._id}/${action}`, body)
      await load()
      if (action === "accept") setTab("confirmed")
    } catch (e) {
      alert(e?.response?.data?.message || `Could not ${action}`)
      await load()
    } finally {
      setBusyId(null)
    }
  }

  const reject = (job) => {
    if (!confirm("Reject this request?")) return
    act(job, "reject")
  }

  const complete = (job) => {
    let cashReceived = false
    if (job.paymentMethod === "cash") {
      if (!confirm(`Did you receive ₹${job.fare} cash from the customer?`)) return
      cashReceived = true
    } else if (!confirm("Mark this job as completed?")) return
    act(job, "complete", { cashReceived })
  }

  const count = (s) => jobs.filter((j) => j.bookingStatus === s).length
  const list = jobs.filter((j) => j.bookingStatus === tab)

  const done = jobs.filter((j) => j.bookingStatus === "completed")
  const mine = (j) => j.labourAmount || j.fare || 0
  const earned = done.reduce((s, j) => s + mine(j), 0)
  const online = done.filter((j) => j.paymentMethod === "online")
  const sentToBank = online.filter((j) => j.payoutStatus === "paid").reduce((s, j) => s + mine(j), 0)
  const pendingToBank = online.filter((j) => j.payoutStatus !== "paid").reduce((s, j) => s + mine(j), 0)

  return (
    <div className="min-h-screen bg-zinc-100 px-4 py-10">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-black tracking-tight">My Jobs</h1>
        <p className="text-sm text-zinc-500 mb-5">Accept a request, call the customer, reach on time, finish the work.</p>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
          <div className="bg-white border border-zinc-200 rounded-2xl p-4">
            <p className="text-xs text-zinc-400">New requests</p>
            <p className="text-2xl font-black text-amber-600">{count("requested")}</p>
          </div>
          <div className="bg-white border border-zinc-200 rounded-2xl p-4">
            <p className="text-xs text-zinc-400">Accepted</p>
            <p className="text-2xl font-black">{count("confirmed")}</p>
          </div>
          <div className="bg-white border border-zinc-200 rounded-2xl p-4">
            <p className="text-xs text-zinc-400">Total earned</p>
            <p className="text-2xl font-black">₹{earned}</p>
          </div>
          <div className="bg-white border border-zinc-200 rounded-2xl p-4">
            <p className="text-xs text-zinc-400">Sent to bank</p>
            <p className="text-2xl font-black text-emerald-600">₹{sentToBank}</p>
          </div>
          <div className="bg-white border border-zinc-200 rounded-2xl p-4">
            <p className="text-xs text-zinc-400">Pending to bank</p>
            <p className="text-2xl font-black text-amber-600">₹{pendingToBank}</p>
          </div>
        </div>

        <div className="flex gap-2 mb-5 flex-wrap">
          {TABS.map(([id, text]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`px-4 py-2 rounded-xl text-sm font-bold border ${tab === id ? "bg-zinc-900 text-white border-zinc-900" : "bg-white border-zinc-200"}`}
            >
              {text}{id === "requested" && count("requested") > 0 ? ` (${count("requested")})` : ""}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm p-3">{error}</div>
        )}

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>
        ) : list.length === 0 ? (
          <div className="bg-white border border-zinc-200 rounded-2xl p-10 text-center text-zinc-500">
            No {TABS.find((t) => t[0] === tab)[1].toLowerCase()} right now.
          </div>
        ) : (
          <div className="space-y-4">
            {list.map((j) => (
              <div key={j._id} className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm">
                <div className="space-y-2 text-sm text-zinc-700">
                  <p className="flex items-center gap-2 font-bold text-base">
                    <User size={15} className="text-zinc-400" /> {j.userName || "Customer"}
                  </p>
                  <a href={`tel:${j.userMobileNumber}`} className="flex items-center gap-2 font-semibold hover:underline">
                    <Phone size={14} className="text-zinc-400" /> {j.userMobileNumber}
                  </a>
                  <p className="flex items-start gap-2">
                    <MapPin size={14} className="text-zinc-400 mt-0.5 shrink-0" />
                    {j.siteDetails ? `${j.siteDetails}, ` : ""}{j.workAddress}
                  </p>
                  <p className="flex items-center gap-2">
                    <Clock size={14} className="text-zinc-400" /> Visit: {fmt(j.visitAt)}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-zinc-100 gap-3 flex-wrap">
                  <div>
                    <p className="text-xs text-zinc-400">
                      {j.duration} {j.pricingType === "hourly" ? "hr" : "day"} × ₹{j.ratePerUnit}
                    </p>
                    <p className="text-xl font-black flex items-center"><IndianRupee size={16} />{j.fare}</p>
                    <p className="text-xs font-semibold mt-0.5">
                      {j.paymentMethod === "cash"
                        ? "Collect cash from customer"
                        : j.paymentStatus === "paid"
                        ? "Paid online — goes to your bank account"
                        : "Online — customer pays after you accept"}
                    </p>
                    {j.bookingStatus === "completed" && j.paymentMethod === "online" && PAYOUT_TEXT[j.payoutStatus] && (
                      <p className="text-xs text-zinc-500 mt-0.5">
                        {PAYOUT_TEXT[j.payoutStatus]}{j.payoutStatus === "paid" && j.payoutUtr ? ` (UTR ${j.payoutUtr})` : ""}
                      </p>
                    )}
                  </div>

                  {j.bookingStatus === "requested" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => act(j, "accept")}
                        disabled={busyId === j._id}
                        className="flex items-center gap-1 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold disabled:opacity-50"
                      >
                        <Check size={16} /> Accept
                      </button>
                      <button
                        onClick={() => reject(j)}
                        disabled={busyId === j._id}
                        className="flex items-center gap-1 px-5 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold disabled:opacity-50"
                      >
                        <X size={16} /> Reject
                      </button>
                    </div>
                  )}

                  {j.bookingStatus === "confirmed" && (
                    <button
                      onClick={() => complete(j)}
                      disabled={busyId === j._id}
                      className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold disabled:opacity-50"
                    >
                      {busyId === j._id ? "Please wait…" : "Work completed"}
                    </button>
                  )}

                  {j.bookingStatus === "completed" && (
                    <span className="flex items-center gap-1 text-emerald-600 text-sm font-bold">
                      <CheckCircle2 size={16} /> Done
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
