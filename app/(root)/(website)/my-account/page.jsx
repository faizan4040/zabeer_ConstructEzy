'use client'

import USerPanelLayout from '@/components/Website/UserPanelLayout'
import WebsiteBreadcrumb from '@/components/Website/WebsiteBreadcrumb'
import useFetch from '@/hooks/useFetch'
import { WEBSITE_ORDER_DETAILS } from '@/routes/WebsiteRoute'
import { ShoppingBagIcon } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import { IoCartOutline } from 'react-icons/io5'
import { useSelector } from 'react-redux'

const breadCrumbData = {
  title: 'Dashboard',
  links: [{ label: 'Dashboard' }]
}

const MyAccount = () => {
  const { data: dashboardData } = useFetch('/api/dashboard/user')
  const cartStore = useSelector(store => store.cartStore)
  const totalOrders = dashboardData?.data?.totalOrder ?? 0
  const recentOrders = dashboardData?.data?.recentOrders ?? []
  const cartCount = cartStore?.count ?? 0

  return (
    <div>
      <WebsiteBreadcrumb props={breadCrumbData} />

      <USerPanelLayout>
        <div className="bg-white rounded-xl shadow-sm border">

          {/* HEADER */}
          <div className="p-6 border-b">
            <h2 className="text-2xl font-semibold text-gray-800">
              Dashboard Overview
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Track your orders and activity
            </p>
          </div>

          {/* STATS */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* TOTAL ORDERS */}
            <div className="flex items-center justify-between rounded-xl p-5 bg-linear-to-r from-indigo-500 to-indigo-600 text-white shadow">
              <div>
                <p className="text-sm opacity-90">Total Orders</p>
                <h3 className="text-3xl font-bold mt-1">{totalOrders}</h3>
              </div>
              <ShoppingBagIcon size={36} />
            </div>

            {/* CART ITEMS */}
            <div className="flex items-center justify-between rounded-xl p-5 bg-linear-to-r from-emerald-500 to-emerald-600 text-white shadow">
              <div>
                <p className="text-sm opacity-90">Items in Cart</p>
                <h3 className="text-3xl font-bold mt-1">{cartCount}</h3>
              </div>
              <IoCartOutline size={36} />
            </div>
          </div>

          {/* RECENT ORDERS */}
          <div className="p-6 pt-0">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              Recent Orders
            </h3>

            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="p-3 text-left">Sr.No</th>
                    <th className="p-3 text-left">Image</th>
                    <th className="p-3 text-left">Order ID</th>
                    <th className="p-3 text-left">Total Items</th>
                    <th className="p-3 text-left">Amount</th>
                  </tr>
                </thead>

                <tbody>
                  {recentOrders.length > 0 ? (
                    recentOrders.map((order, index) => {
                      const firstProduct = order.products?.[0]
                      const productImage =
                        firstProduct?.variantId?.media?.[0]?.secure_url ||
                        firstProduct?.variantId?.media?.[0]?.url

                      return (
                        <tr
                          key={order._id}
                          className="border-t hover:bg-gray-50 transition"
                        >
                          <td className="p-3 text-sm">{index + 1}</td>

                          <td className="p-3">
                            {productImage ? (
                              <img
                                src={productImage}
                                alt={firstProduct?.name || 'Product'}
                                className="w-12 h-12 object-cover rounded-md border"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gray-100 rounded-md border" />
                            )}
                          </td>

                          <td className="p-3 font-medium text-primary">
                            <Link
                              href={WEBSITE_ORDER_DETAILS(order._id)}
                              className="hover:underline hover:text-yellow-500"
                            >
                              {order._id}
                            </Link>
                          </td>

                          <td className="p-3 text-sm">
                            {order.products.length}
                          </td>

                          <td className="p-3 font-semibold text-green-600">
                            {order.totalAmount.toLocaleString('en-IN', {
                              style: 'currency',
                              currency: 'INR'
                            })}
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="p-6 text-center text-gray-500"
                      >
                        No recent orders found 🛒
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </USerPanelLayout>
    </div>
  )
}

export default MyAccount
