'use client'

import React, { useState } from 'react'
import ThemeSwitch from './ThemeSwitch'
import UserDropdown from './UserDropdown'
import { Button } from '@/components/ui/button'
import { useSidebar } from '@/components/ui/sidebar'
import { BsBlockquoteLeft } from "react-icons/bs"
import AdminSearch from './AdminSearch'
import OrderNotificationBell from "@/components/Application/ShopOwner/Dashboard/OrderNotificationBell"
import NotificationBell from "@/components/Application/NotificationBell"   


const Topbar = ({ role = "shopowner" }) => {
  const { toggleSidebar } = useSidebar()
  const [showSearch, setShowSearch] = useState(false)

  const bellConfig =
    role === "admin"
      ? {
          endpoint: "/api/dashboard/admin/notifications/orders",
          storageKey: "admin_last_seen_order_id",
          orderLinkPrefix: "/admin/orders",
        }
      : {
          endpoint: "/api/shopowner/dashboard/notifications/orders",
          storageKey: "shopowner_last_seen_order_id",
          orderLinkPrefix: "/shop/orders",
        }

  return (
    <div
      className="
        fixed top-0 left-0 z-30 h-14 w-full
        flex items-center justify-between
        border bg-[#f9f7f7] dark:bg-card
        px-5 md:ps-72 md:pe-8
      "
    >
      {/* 🔍 Search Bar */}
      <div className="relative flex-1 max-w-md">
        <AdminSearch />
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        <OrderNotificationBell {...bellConfig} />
        <NotificationBell />   {/* ✅ NEW — general notifications (order status updates, etc.) */}
        <ThemeSwitch />
        <UserDropdown />
        <Button
          onClick={toggleSidebar}
          type="button"
          size="icon"
          className="ms-2 bg-orange-500 md:hidden"
        >
          <BsBlockquoteLeft />
        </Button>
      </div>
    </div>
  )
}

export default Topbar
