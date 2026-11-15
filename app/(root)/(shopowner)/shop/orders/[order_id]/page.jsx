'use client'

import React, { useEffect, useState, use } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import axios from 'axios'
import useFetch from '@/hooks/useFetch'
import { IMAGES } from '@/routes/AllImages'
import { WEBSITE_PRODUCT_DETAILS } from '@/routes/WebsiteRoute'
import { SHOP_OWNER_DASHBOARD, SHOP_OWNER_ORDER_SHOW } from '@/routes/ShopOwnerPanelRoute'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import Select from '@/components/Application/Select'
import ButtonLoading from '@/components/Application/ButtonLoading'
import { showToast } from '@/lib/showToast'
import { FaCircleUser } from "react-icons/fa6"
import { IoCalendarNumber } from "react-icons/io5"

const breadcrumbData = [
  { href: SHOP_OWNER_DASHBOARD, label: "Home" },
  { href: SHOP_OWNER_ORDER_SHOW, label: "Orders" },
  { href: '', label: "Order Details" },
]

const statusOptions = [
  { label: "Pending", value: "pending" },
  { label: "Processing", value: "processing" },
  { label: "Shipped", value: "shipped" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
]

const ShopOwnerOrderDetails = ({ params }) => {
  const { order_id } = use(params)
  const [orderData, setOrderData] = useState(null)
  const { data } = useFetch(`/api/shopowner/orders/get/${order_id}`)
  const [orderStatus, setOrderStatus] = useState()
  const [updatingStatus, setUpdatingStatus] = useState(false)

  useEffect(() => {
    if (data?.success) {
      setOrderData(data.data)
      // this shop's own item(s) status — take the first item's status as the representative value
      setOrderStatus(data?.data?.products?.[0]?.status || 'pending')
    }
  }, [data])

  const handleOrderStatus = async () => {
    setUpdatingStatus(true)
    try {
      const { data: response } = await axios.put('/api/shopowner/orders/update-status', {
        _id: orderData?._id,
        status: orderStatus,
      })
      if (!response.success) throw new Error(response.message)
      showToast('success', response.message)
    } catch (error) {
      showToast('error', error.message)
    } finally {
      setUpdatingStatus(false)
    }
  }

  const formatDate = (date) => {
    if (!date) return 'Not available'
    const d = new Date(date)
    return isNaN(d.getTime()) ? 'Not available' : d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '₹0.00'
    return amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })
  }

  if (!orderData) {
    return <div className="py-40 text-center text-gray-500">Loading order details...</div>
  }

  return (
    <div className="px-4 lg:px-2 py-8 bg-[#f7f8fc] min-h-screen space-y-6">
      <BreadCrumb breadcrumbData={breadcrumbData} />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* LEFT: order + status */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold">#{orderData.order_id}</h2>
            <span className="border-2 rounded-full border-yellow-500 text-yellow-500 p-1 px-3 text-sm capitalize">
              your item: {orderStatus}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Customer: {orderData.name} · {new Date(orderData.createdAt).toLocaleString()}
          </p>

          <div className="mt-6 flex justify-between items-start gap-4 flex-wrap">
            <p className="text-sm text-gray-500">
              Order date: <strong>{formatDate(orderData.createdAt)}</strong>
            </p>

            <div className="w-64">
              <h4 className="font-semibold mb-2 text-sm">Update Your Item Status</h4>
              <Select
                options={statusOptions}
                selected={orderStatus}
                setSelected={(value) => setOrderStatus(value)}
                placeholder="Select status"
                isMulti={false}
              />
              <div className="mt-2">
                <ButtonLoading
                  type="button"
                  text="Save Status"
                  loading={updatingStatus}
                  onClick={handleOrderStatus}
                  className="w-full bg-linear-to-r cursor-pointer hover:text-white from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700 text-white font-semibold py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 ease-in-out active:scale-95"
                />
              </div>
              <p className="text-xs text-gray-400 mt-2">This only updates your own items — other sellers in this order (if any) are unaffected.</p>
            </div>
          </div>
        </div>

        {/* RIGHT: summary — this shop's earnings only */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h4 className="font-semibold mb-4">Your Earnings from This Order</h4>
          <div className="border-t border-gray-300 mt-2 pt-6 space-y-3 text-sm text-gray-700">
            <div className="flex justify-between items-center">
              <span>Your Items Subtotal</span>
              <span>{formatCurrency(orderData.subtotal)}</span>
            </div>
            <div className="border-t border-gray-300 mt-2 pt-2" />
            <div className="flex justify-between items-center text-base font-semibold text-gray-900 bg-gray-100 p-2 rounded-lg">
              <span>Total (Your Share)</span>
              <span>{formatCurrency(orderData.totalAmount)}</span>
            </div>
            <p className="text-xs text-gray-400">Coupon/discount splitting across multiple sellers isn't shown here — this is your raw item revenue.</p>
          </div>
        </div>
      </div>

      {/* PRODUCTS TABLE — only this shop's items */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <h3 className="p-5 font-semibold border-b text-gray-800">Your Products in This Order</h3>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="p-4 text-left">Product</th>
              <th className="text-center">Status</th>
              <th className="text-center">Qty</th>
              <th className="text-right">Price</th>
              <th className="text-right pr-6">Amount</th>
            </tr>
          </thead>
          <tbody>
            {orderData.products.map((p) => (
              <tr key={`${p.variantId._id}-${p.isSample ? 's' : 'f'}`} className="border-t hover:bg-gray-50 transition">
                <td className="p-4 flex gap-4 items-center">
                  <Image
                    src={p.variantId.media?.[0]?.secure_url || IMAGES.image_placeholder}
                    width={56} height={56}
                    className="rounded-lg border bg-white object-cover"
                    alt={p.productId.name || 'Product'}
                  />
                  <div className="flex flex-col">
                    <Link href={WEBSITE_PRODUCT_DETAILS(p.productId.slug)} className="font-medium text-gray-800 hover:underline">
                      {p.productId.name}
                    </Link>
                    {p.variantId.size && <p className="text-xs text-gray-500 mt-1">Size: {p.variantId.size}</p>}
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {p.isSample && (
                        <span className="text-[11px] font-semibold bg-orange-100 text-orange-700 rounded-full px-2 py-0.5">Sample</span>
                      )}
                      <span className={`text-[11px] font-semibold rounded-full px-2 py-0.5 ${p.deliveredBy === 'constructezy' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                        {p.deliveredBy === 'constructezy'
                          ? 'ConstructEzy will pick up & deliver'
                          : p.deliveryType === 'paid_supplier'
                            ? `You deliver · ₹${p.deliveryRatePerKm}/km${p.deliveryDistanceKm != null ? ` · ${p.deliveryDistanceKm} km` : ''}`
                            : 'You deliver · Free delivery'}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="text-center capitalize">{p.status || 'pending'}</td>
                <td className="text-center font-medium text-gray-800">{p.qty}</td>
                <td className="text-right text-gray-700">₹{Number(p.sellingPrice).toLocaleString('en-IN')}</td>
                <td className="text-right pr-6 font-semibold text-gray-900">
                  ₹{(p.qty * p.sellingPrice).toLocaleString('en-IN')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* CUSTOMER INFO */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h4 className="font-semibold mb-4">Customer & Shipping</h4>
        <div className="grid sm:grid-cols-2 gap-4 text-sm text-gray-700">
          <div><span className="text-gray-400 text-xs uppercase font-semibold">Name</span><p>{orderData.name}</p></div>
          <div><span className="text-gray-400 text-xs uppercase font-semibold">Email</span><p>{orderData.email}</p></div>
          <div><span className="text-gray-400 text-xs uppercase font-semibold">Phone</span><p>{orderData.phone}</p></div>
          <div><span className="text-gray-400 text-xs uppercase font-semibold">Address</span><p>{orderData.address}, {orderData.city}, {orderData.state} — {orderData.pincode}</p></div>
        </div>
      </div>
    </div>
  )
}

export default ShopOwnerOrderDetails