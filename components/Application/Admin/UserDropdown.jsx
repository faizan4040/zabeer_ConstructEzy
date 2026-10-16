'use client'

import React, { useEffect, useState } from 'react'
import axios from 'axios'
import Link from 'next/link'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { IoShirtOutline } from 'react-icons/io5'
import { MdOutlineShoppingBag } from 'react-icons/md'
import { FiBell, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi'

import LogoutButton from './LogoutButton'
import { BellIcon } from 'lucide-react'

const UserDropdown = () => {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axios.get('/api/dashboard/admin/stock-report')
        if (res.data?.success) {
          const lowStock = res.data.data.stockTable.filter(
            item => item.status === 'Low Stock'
          )
          setNotifications(lowStock)
        }
      } catch (err) {
        console.error('Notification error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()
  }, [])

  const hasNotifications = notifications.length > 0

  return (
    <div className="flex items-center gap-4">

      {/* NOTIFICATION BELL */}
     <DropdownMenu>
  <DropdownMenuTrigger asChild>
    <div className="relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 cursor-pointer transition">
      
      {/* Bell Icon */}
      <BellIcon
        className={`h-6 w-6 ${
          hasNotifications
            ? "text-red-600 animate-pulse"
            : "text-gray-600"
        }`}
      />

      {/* Count Badge */}
      {hasNotifications && (
        <span className="absolute -top-1 -right-1 min-w-4.5 h-4.5 px-1.25
          text-[11px] font-semibold bg-red-600 text-white rounded-full
          flex items-center justify-center shadow">
          {notifications.length}
        </span>
      )}
    </div>
  </DropdownMenuTrigger>

  <DropdownMenuContent
    align="end"
    className="w-80 p-0 mt-3 shadow-lg rounded-xl"
  >
    <DropdownMenuLabel className="px-4 py-3 font-semibold text-sm">
      Notifications
    </DropdownMenuLabel>

    <DropdownMenuSeparator />

    <div className="max-h-80 overflow-y-auto">
      {loading ? (
        <p className="p-4 text-sm text-gray-500">Loading...</p>
      ) : hasNotifications ? (
        notifications.map(item => (
          <DropdownMenuItem
            key={item.variantId}
            className="flex gap-3 items-start px-4 py-3 cursor-default hover:bg-red-50"
          >
            <FiAlertTriangle className="text-red-600 mt-1 shrink-0" />

            <div className="flex-1">
              <p className="text-sm font-semibold text-red-700">
                Low Stock Alert
              </p>
              <p className="text-xs text-gray-700">
                {item.productName}
              </p>
              <p className="text-xs text-gray-500">
                SKU: {item.sku} • {item.remainingStock} left
              </p>
            </div>
          </DropdownMenuItem>
        ))
      ) : (
        <div className="flex items-center gap-2 px-4 py-6 text-green-700 text-sm">
          <FiCheckCircle />
          All stock levels are healthy
        </div>
      )}
    </div>
  </DropdownMenuContent>
</DropdownMenu>

      {/* USER MENU */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Avatar className="cursor-pointer">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>AD</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="me-5 w-44">
          <DropdownMenuSeparator />

          <DropdownMenuItem asChild>
            <Link href="" className="flex items-center gap-2">
              <IoShirtOutline />
              New Product
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link href="" className="flex items-center gap-2">
              <MdOutlineShoppingBag />
              Orders
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          <LogoutButton />
        </DropdownMenuContent>
      </DropdownMenu>

    </div>
  )
}

export default UserDropdown






