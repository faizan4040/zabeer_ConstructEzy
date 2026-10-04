"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { Bell, Package } from "lucide-react"
import { useOrderNotifications } from "@/hooks/useOrderNotifications"

/**
 * @param {string} endpoint - notifications API endpoint
 * @param {string} storageKey - localStorage key (unique per role)
 * @param {string} orderLinkPrefix - e.g. "/shop/orders" or "/admin/orders"
 */
const OrderNotificationBell = ({ endpoint, storageKey, orderLinkPrefix }) => {
  const { notifications, unseenCount, markAllRead } = useOrderNotifications(endpoint, storageKey)
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleToggle = () => {
    setOpen((prev) => {
      if (!prev) markAllRead()
      return !prev
    })
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleToggle}
        className="relative flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <Bell className="h-5 w-5 text-gray-500 dark:text-gray-300" />
        {unseenCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unseenCount > 9 ? "9+" : unseenCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden z-50">
          <div className="px-4 py-3 flex items-center justify-between">
            <p className="font-semibold text-sm text-gray-800 dark:text-gray-100">Order Notifications</p>
            {notifications.length > 0 && (
              <span className="text-xs text-gray-400">{notifications.length} new</span>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-10 text-center text-sm text-gray-400">No new orders</div>
            ) : (
              notifications.map((order) => (
                <Link
                  key={order._id}
                  href={`${orderLinkPrefix}/${order._id}`}
                  className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-orange-50 dark:bg-orange-500/20 text-yellow-500 flex items-center justify-center shrink-0">
                    <Package className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">
                      New order #{order._id?.slice(-6)}
                    </p>
                    <p className="text-xs text-gray-400">
                      ₹{Number(order.totalAmount || 0).toLocaleString("en-IN")} · just now
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>

          <Link
            href={orderLinkPrefix}
            className="block text-center py-2.5 text-xs font-medium text-yellow-500 hover:bg-orange-50 dark:hover:bg-orange-500/10"
          >
            View all orders
          </Link>
        </div>
      )}
    </div>
  )
}

export default OrderNotificationBell