'use client'

import { useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import Link from 'next/link'
import { Loader2, Package, MapPin, ScanLine, Inbox, Truck, IndianRupee, RefreshCw, RotateCcw } from 'lucide-react'
import { showToast } from '@/lib/showToast'

const STATUS_LABELS = {
  pending: { label: 'Waiting for Shop', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  ready_to_ship: { label: 'Packed - Ready', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  shipped: { label: 'Shipped', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  delivered: { label: 'Delivered', color: 'bg-green-50 text-green-700 border-green-200' },
}


const DeliveryDashboardPage = () => {
  const [available, setAvailable] = useState([])
  const [myOrders, setMyOrders] = useState([])
  const [myReturns, setMyReturns] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [busyId, setBusyId] = useState(null)


  const fetchAll = useCallback(async (silent = false) => {
    if (silent) setRefreshing(true)
    try {
      const [availRes, myRes, returnsRes] = await Promise.all([
        axios.get('/api/delivery/orders/available'),
        axios.get('/api/delivery/orders/my'),
        axios.get('/api/delivery/returns'),
      ])
      setAvailable(availRes.data.data)
      setMyOrders(myRes.data.data)
      setMyReturns(returnsRes.data.data || [])
    } catch {
      showToast('error', 'Failed to load orders.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchAll()
    const interval = setInterval(() => fetchAll(true), 15000)
    return () => clearInterval(interval)
  }, [fetchAll])

  const handleAccept = async (orderId) => {
    setBusyId(orderId)
    try {
      const { data } = await axios.post(`/api/delivery/orders/${orderId}/accept`)
      showToast(data.success ? 'success' : 'error', data.message)
      fetchAll()
    } catch (err) {
      showToast('error', err?.response?.data?.message || 'Action failed.')
    } finally {
      setBusyId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-7 h-7 animate-spin text-yellow-500" />
        <p className="text-sm text-gray-400">Loading your dashboard...</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6 space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Deliveries</h1>
          <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1.5">
            {refreshing ? (
              <><RefreshCw className="w-3 h-3 animate-spin" /> Syncing...</>
            ) : (
              'Live updates every 15s'
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/delivery/returns"
            className="flex items-center gap-2 bg-white border hover:bg-gray-50 transition text-gray-700 text-sm font-medium px-4 py-2.5 rounded-xl shadow-sm"
          >
            <RotateCcw size={16} />
            Returns
          </Link>

          <Link
            href="/delivery/scan"
            className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 transition text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-sm"
          >
            <ScanLine size={16} />
            Scan Label
          </Link>
        </div>
      </div>

      {/* ── Stats strip ── */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white border rounded-2xl p-4 flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
            <Inbox className="w-5 h-5 text-yellow-500" />
          </div>
          <div>
            <p className="text-xl font-bold text-gray-900 leading-none">{available.length}</p>
            <p className="text-xs text-gray-500 mt-1">Available Pickups</p>
          </div>
        </div>

        <div className="bg-white border rounded-2xl p-4 flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
            <Truck className="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <p className="text-xl font-bold text-gray-900 leading-none">{myOrders.length}</p>
            <p className="text-xs text-gray-500 mt-1">My Active Orders</p>
          </div>
        </div>

        <div className="bg-white border rounded-2xl p-4 flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
            <RotateCcw className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <p className="text-xl font-bold text-gray-900 leading-none">{myReturns.length}</p>
            <p className="text-xs text-gray-500 mt-1">Return Pickups</p>
          </div>
        </div>
      </div>

      {/* ── Available pickups ── */}
      <section>
        <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          Available Orders
          <span className="text-xs font-medium text-gray-400">({available.length})</span>
        </h2>

        {available.length === 0 ? (
          <div className="border border-dashed rounded-2xl py-10 flex flex-col items-center justify-center text-center bg-gray-50/50">
            <Inbox className="w-8 h-8 text-gray-300 mb-2" />
            <p className="text-sm text-gray-500">No orders waiting for pickup right now.</p>
            <p className="text-xs text-gray-400 mt-1">New orders will appear here automatically.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {available.map((order) => (
              <div
                key={order._id}
                className="bg-white border rounded-2xl p-4 flex items-center justify-between gap-4 shadow-sm hover:shadow-md transition"
              >
                <div className="min-w-0 space-y-1.5">
                  <p className="font-semibold text-sm text-gray-900 truncate">
                    #{order.order_id}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center gap-1.5">
                    <MapPin size={13} className="shrink-0" />
                    {order.city}, {order.state} · {order.pincode}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Package size={13} /> {order.products?.length || 0} item(s)
                    </span>
                    <span className="flex items-center gap-1 font-medium text-gray-700">
                      <IndianRupee size={13} /> {order.totalAmount}
                    </span>
                  </div>
                </div>

                <button
                  disabled={busyId === order.order_id}
                  onClick={() => handleAccept(order.order_id)}
                  className="shrink-0 bg-orange-500 hover:bg-orange-600 transition text-white text-sm font-medium px-4 py-2.5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  {busyId === order.order_id ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    'Accept'
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── My accepted orders — now clickable, opens order detail with map + payment + OTP ── */}
      <section>
        <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          My Orders
          <span className="text-xs font-medium text-gray-400">({myOrders.length})</span>
        </h2>

        {myOrders.length === 0 ? (
          <div className="border border-dashed rounded-2xl py-10 flex flex-col items-center justify-center text-center bg-gray-50/50">
            <Truck className="w-8 h-8 text-gray-300 mb-2" />
            <p className="text-sm text-gray-500">You haven't accepted any orders yet.</p>
            <p className="text-xs text-gray-400 mt-1">Accept a pickup above to see it here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {myOrders.map((order) => {
              const status = STATUS_LABELS[order.status] || STATUS_LABELS.pending
              return (
                <Link key={order._id} href={`/delivery/order/${order.order_id}`}>
                  <div className="bg-white border rounded-2xl p-4 flex items-center justify-between gap-4 shadow-sm hover:shadow-md transition cursor-pointer">
                    <div className="min-w-0 space-y-1.5">
                      <p className="font-semibold text-sm text-gray-900 truncate">
                        #{order.order_id}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center gap-1.5">
                        <MapPin size={13} className="shrink-0" />
                        {order.city}, {order.state}
                      </p>
                    </div>

                    <span className={`shrink-0 text-xs font-medium px-3 py-1.5 rounded-full border whitespace-nowrap ${status.color}`}>
                      {status.label}
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}

export default DeliveryDashboardPage