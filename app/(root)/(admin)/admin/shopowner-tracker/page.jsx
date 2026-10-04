'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import axios from 'axios'
import {
  Store, Package, ShoppingCart, IndianRupee, Loader2, X,
  ShieldCheck, ShieldAlert, Search, Users,
} from 'lucide-react'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import { Card, CardContent } from '@/components/ui/card'
import { showToast } from '@/lib/showToast'
import { IMAGES } from '@/routes/AllImages'
import { ADMIN_DASHBOARD, ADMIN_SHOPOWNER_TRACKER_DETAILS } from '@/routes/AdminPanelRoute'

const breadcrumbData = [
  { href: ADMIN_DASHBOARD, label: 'Home' },
  { href: '', label: 'Shopowner Tracker' },
]

// ── Reusable, properly-built toggle switch (the old one had layout issues) ──
const ToggleSwitch = ({ checked, onClick, disabled, loading }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={onClick}
    disabled={disabled}
    className={`relative inline-flex h-7 w-13 shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out
      focus:outline-none focus:ring-2 focus:ring-offset-2
      ${checked ? 'bg-emerald-500 focus:ring-emerald-300' : 'bg-gray-300 focus:ring-gray-300'}
      ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
    `}
    style={{ width: '52px' }}
  >
    <span
      className={`inline-flex items-center justify-center h-5.5 w-5.5 transform rounded-full bg-white shadow-md transition-transform duration-200 ease-in-out
        ${checked ? 'translate-x-[26px]' : 'translate-x-1'}
      `}
      style={{ height: '22px', width: '22px' }}
    >
      {loading && <Loader2 size={11} className="animate-spin text-gray-400" />}
    </span>
  </button>
)

const ShopownerTracker = () => {
  const [shopOwners, setShopOwners] = useState([])
  const [loading, setLoading] = useState(true)
  const [togglingId, setTogglingId] = useState(null)
  const [search, setSearch] = useState('')

  const [blockModal, setBlockModal] = useState(null)
  const [reason, setReason] = useState('')

  const fetchData = async () => {
    try {
      const { data } = await axios.get('/api/admin/shopowner-tracker')
      if (data.success) setShopOwners(data.data)
    } catch (err) {
      showToast('error', 'Failed to load shopowners.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 20000)
    return () => clearInterval(interval)
  }, [])

  const handleToggle = (owner) => {
    if (owner.isBlocked) {
      if (!window.confirm(`Unblock "${owner.shop?.name || owner.name}"? They'll be notified by email.`)) return
      doToggle(owner._id, false, '')
    } else {
      setReason('')
      setBlockModal(owner)
    }
  }

  const confirmBlock = () => {
    if (!reason.trim()) {
      showToast('error', 'Please enter a reason — this is emailed to the shopowner.')
      return
    }
    doToggle(blockModal._id, true, reason.trim())
    setBlockModal(null)
  }

  const doToggle = async (userId, block, reasonText) => {
    setTogglingId(userId)
    try {
      const { data } = await axios.put('/api/admin/shopowner-tracker/toggle-block', { userId, block, reason: reasonText })
      if (!data.success) throw new Error(data.message)
      showToast('success', data.message)
      fetchData()
    } catch (err) {
      showToast('error', err?.response?.data?.message || err.message)
    } finally {
      setTogglingId(null)
    }
  }

  const filtered = useMemo(() => {
    if (!search.trim()) return shopOwners
    const q = search.toLowerCase()
    return shopOwners.filter(
      (o) =>
        o.name?.toLowerCase().includes(q) ||
        o.email?.toLowerCase().includes(q) ||
        o.shop?.name?.toLowerCase().includes(q)
    )
  }, [shopOwners, search])

  const stats = useMemo(() => {
    const total = shopOwners.length
    const blocked = shopOwners.filter((o) => o.isBlocked).length
    const totalEarnings = shopOwners.reduce((sum, o) => sum + (Number(o.earnings) || 0), 0)
    return { total, active: total - blocked, blocked, totalEarnings }
  }, [shopOwners])

  if (loading) {
    return <div className="py-40 flex justify-center"><Loader2 className="animate-spin text-yellow-500" size={28} /></div>
  }

  return (
    <div>
      <BreadCrumb breadcrumbData={breadcrumbData} />

      {/* ══ Header ══ */}
      <div className="mt-4 mb-6 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-orange-500 via-orange-400 to-amber-300 p-6 md:p-8 text-white relative overflow-hidden">
        <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/10" />
        <div className="absolute right-16 bottom-0 h-20 w-20 rounded-full bg-white/10" />
        <div className="relative flex items-center gap-3">
          <div className="rounded-2xl bg-white/20 p-3 backdrop-blur-sm"><Store className="h-6 w-6" /></div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold">Shopowner Tracker</h1>
            <p className="text-sm text-orange-50 mt-0.5">Monitor every shop's listings and earnings, and manage access.</p>
          </div>
        </div>
      </div>

      {/* ══ Stat summary strip ══ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-white border rounded-2xl p-4 flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 text-blue-500" />
          </div>
          <div className="min-w-0">
            <p className="text-lg font-bold text-gray-900 leading-none">{stats.total}</p>
            <p className="text-xs text-gray-500 mt-1">Total Shops</p>
          </div>
        </div>
        <div className="bg-white border rounded-2xl p-4 flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="min-w-0">
            <p className="text-lg font-bold text-gray-900 leading-none">{stats.active}</p>
            <p className="text-xs text-gray-500 mt-1">Active</p>
          </div>
        </div>
        <div className="bg-white border rounded-2xl p-4 flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5 text-red-500" />
          </div>
          <div className="min-w-0">
            <p className="text-lg font-bold text-gray-900 leading-none">{stats.blocked}</p>
            <p className="text-xs text-gray-500 mt-1">Blocked</p>
          </div>
        </div>
        <div className="bg-white border rounded-2xl p-4 flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
            <IndianRupee className="w-5 h-5 text-green-500" />
          </div>
          <div className="min-w-0">
            <p className="text-lg font-bold text-gray-900 leading-none truncate">
              ₹{stats.totalEarnings.toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-gray-500 mt-1">Total Earnings</p>
          </div>
        </div>
      </div>

      {/* ══ Search ══ */}
      <div className="relative max-w-md mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by shop name, owner name, or email..."
          className="w-full pl-9 pr-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
        />
      </div>

      {/* ══ Shop cards ══ */}
      {!filtered.length ? (
        <div className="text-center py-20 text-gray-400">
          {search ? 'No shopowners match your search.' : 'No shopowners yet.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((owner) => (
            <Card
              key={owner._id}
              className={`rounded-2xl shadow-sm overflow-hidden transition-all ${
                owner.isBlocked ? 'border-red-200' : 'border-gray-200/70'
              }`}
            >
              <div className={`h-1.5 ${owner.isBlocked ? 'bg-red-500' : 'bg-emerald-500'}`} />
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border shrink-0 bg-gray-100">
                    <Image src={owner.avatar?.url || IMAGES.profile} alt={owner.name} fill className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link href={ADMIN_SHOPOWNER_TRACKER_DETAILS(owner._id)} className="font-semibold text-sm truncate hover:underline block text-gray-900">
                      {owner.shop?.name || 'No Shop'}
                    </Link>
                    <p className="text-xs text-gray-500 truncate">{owner.name} · {owner.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="bg-gray-50 rounded-xl p-2.5 text-center">
                    <Package size={14} className="mx-auto text-yellow-500 mb-1" />
                    <p className="text-sm font-bold text-gray-900">{owner.productCount}</p>
                    <p className="text-[10px] text-gray-400">Products</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-2.5 text-center">
                    <ShoppingCart size={14} className="mx-auto text-blue-500 mb-1" />
                    <p className="text-sm font-bold text-gray-900">{owner.orderCount}</p>
                    <p className="text-[10px] text-gray-400">Orders</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-2.5 text-center">
                    <IndianRupee size={14} className="mx-auto text-green-500 mb-1" />
                    <p className="text-sm font-bold text-gray-900">₹{Number(owner.earnings).toLocaleString('en-IN')}</p>
                    <p className="text-[10px] text-gray-400">Earnings</p>
                  </div>
                </div>

                {owner.isBlocked && owner.blockReason && (
                  <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg p-2.5 mb-3 leading-relaxed">
                    <span className="font-semibold">Reason:</span> {owner.blockReason}
                  </p>
                )}

                <div className="flex items-center justify-between pt-1">
                  <span className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                    owner.isBlocked ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${owner.isBlocked ? 'bg-red-500' : 'bg-emerald-500'}`} />
                    {owner.isBlocked ? 'Blocked' : 'Active'}
                  </span>

                  <ToggleSwitch
                    checked={!owner.isBlocked}
                    onClick={() => handleToggle(owner)}
                    disabled={togglingId === owner._id}
                    loading={togglingId === owner._id}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ══ Block-reason modal ══ */}
      {blockModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <ShieldAlert size={18} className="text-red-500" />
                Block "{blockModal.shop?.name || blockModal.name}"
              </h3>
              <button onClick={() => setBlockModal(null)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <label className="text-sm font-medium text-gray-700 mb-1.5 block">
              Reason for blocking <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              placeholder="e.g. Multiple customer complaints about product quality, fraudulent listings, etc."
              className="w-full border rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-300"
            />
            <p className="text-xs text-gray-400 mt-1.5">
              This reason will be emailed to the shopowner, along with instructions to appeal.
            </p>

            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setBlockModal(null)}
                className="text-sm font-medium px-4 py-2 rounded-xl border text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmBlock}
                className="text-sm font-semibold px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white"
              >
                Block & Send Email
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ShopownerTracker