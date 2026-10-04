'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import { SHOP_OWNER_DASHBOARD, SHOP_OWNER_MANUAL_ORDER_SHOW } from '@/routes/ShopOwnerPanelRoute'
import { showToast } from '@/lib/showToast'
import { FiShoppingBag, FiUser, FiMail, FiPhone, FiMapPin, FiTag, FiDollarSign, FiPackage, FiClock, FiCheck } from 'react-icons/fi'
import { MdOutlineInventory2 } from 'react-icons/md'
import { BsBoxSeam, BsCashCoin } from 'react-icons/bs'

const ORDER_STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']
const PAYMENT_STATUSES = ['Pending', 'Paid', 'Failed']

const ShopOwnerManualOrderDetails = () => {
  const { order_id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [orderStatus, setOrderStatus] = useState('pending')
  const [paymentStatus, setPaymentStatus] = useState('Pending')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!order_id) return
    ;(async () => {
      try {
        const res = await fetch(`/api/shopowner/manual-order/get/${order_id}`)
        const data = await res.json()
        if (!data.success) throw new Error(data.message)
        setOrder(data.data)
        setOrderStatus(data.data.status)
        setPaymentStatus(data.data.paymentStatus)
      } catch (err) {
        setOrder(null)
      } finally {
        setLoading(false)
      }
    })()
  }, [order_id])

  const handleUpdate = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/shopowner/manual-order/${order_id}/update-status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: orderStatus, paymentStatus }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.message)
      showToast('success', data.message)
    } catch (err) {
      showToast('error', err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="py-40 text-center text-gray-500">Loading order details...</div>
  if (!order) return <div className="py-40 text-center text-red-500">Order not found.</div>

  const inr = (n) => Number(n || 0).toLocaleString('en-IN')

  return (
    <div className="max-w-3xl mx-auto pb-16">
      <BreadCrumb breadcrumbData={[
        { href: SHOP_OWNER_DASHBOARD, label: 'Home' },
        { href: SHOP_OWNER_MANUAL_ORDER_SHOW, label: 'Manual Orders' },
        { href: '', label: `#${order.order_id}` },
      ]} />

      <div className="bg-white border rounded-2xl shadow-sm p-6 mt-4">
        <div className="flex items-center gap-3">
          <FiShoppingBag className="text-yellow-500" size={22} />
          <h2 className="text-xl font-bold">#{order.order_id}</h2>
        </div>
        <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
          <FiClock size={12} /> {new Date(order.createdAt).toLocaleString('en-IN')}
        </p>

        <div className="grid sm:grid-cols-2 gap-4 mt-6">
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Order Status</p>
            <select value={orderStatus} onChange={(e) => setOrderStatus(e.target.value)} className="w-full h-10 rounded-lg border px-3 text-sm capitalize">
              {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Payment Status</p>
            <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)} className="w-full h-10 rounded-lg border px-3 text-sm">
              {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <button
          onClick={handleUpdate}
          disabled={saving}
          className="mt-4 w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-linear-to-r from-orange-500 to-orange-600 text-white font-semibold hover:from-orange-600 hover:to-orange-700 disabled:opacity-60"
        >
          <FiCheck /> {saving ? 'Saving…' : 'Update Status'}
        </button>
      </div>

      <div className="bg-white border rounded-2xl shadow-sm p-6 mt-4">
        <h4 className="font-semibold mb-4 flex items-center gap-2"><FiUser className="text-yellow-500" /> Customer</h4>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div><span className="text-gray-400 text-xs uppercase font-semibold flex items-center gap-1"><FiUser size={11} />Name</span><p>{order.name}</p></div>
          <div><span className="text-gray-400 text-xs uppercase font-semibold flex items-center gap-1"><FiMail size={11} />Email</span><p>{order.email || '—'}</p></div>
          <div><span className="text-gray-400 text-xs uppercase font-semibold flex items-center gap-1"><FiPhone size={11} />Phone</span><p>{order.phone}</p></div>
          <div><span className="text-gray-400 text-xs uppercase font-semibold flex items-center gap-1"><FiMapPin size={11} />Address</span><p>{order.address}</p></div>
        </div>
      </div>

      <div className="bg-white border rounded-2xl shadow-sm overflow-hidden mt-4">
        <h4 className="font-semibold p-5 border-b flex items-center gap-2"><BsBoxSeam className="text-yellow-500" /> Products</h4>
        {order.products.map((p, i) => (
          <div key={i} className="flex items-center gap-4 p-4 border-b last:border-0">
            <div className="relative w-14 h-14 rounded-lg border overflow-hidden shrink-0 bg-gray-100">
              {p.media ? <Image src={p.media} alt={p.name} fill className="object-cover" unoptimized /> : <FiPackage className="m-auto text-gray-300" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{p.name}</p>
              <p className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                <FiTag size={10} />{p.category?.name || '—'}
                <MdOutlineInventory2 size={10} />Qty: {p.qty}
                <FiDollarSign size={10} />₹{inr(p.price)}/unit
              </p>
            </div>
            <div className="text-right font-bold text-orange-600">₹{inr(p.qty * p.price)}</div>
          </div>
        ))}
      </div>

      <div className="bg-white border rounded-2xl shadow-sm p-6 mt-4 flex justify-between items-center">
        <div className="flex items-center gap-2"><BsCashCoin className="text-yellow-500" /><span className="font-semibold">Grand Total</span></div>
        <span className="text-2xl font-bold text-orange-600">₹{inr(order.totalAmount)}</span>
      </div>
    </div>
  )
}

export default ShopOwnerManualOrderDetails