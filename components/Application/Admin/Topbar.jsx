'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import ThemeSwitch from './ThemeSwitch'
import UserDropdown from './UserDropdown'
import HeaderNotificationBell from './HeaderNotificationBell'
import { Button } from '@/components/ui/button'
import { useSidebar } from '@/components/ui/sidebar'
import { BsBlockquoteLeft } from 'react-icons/bs'
import AdminSearch from './AdminSearch'

const Topbar = ({ role }) => {
  const { toggleSidebar } = useSidebar()
  const pathname = usePathname()
  // Same Topbar is used by both panels — detect which one from the URL
  const panelRole = role || (pathname?.startsWith('/admin') ? 'admin' : 'shopowner')

  return (
    <div
      className="
        fixed top-0 left-0 z-30 h-14 w-full
        flex items-center justify-between gap-3
        border-b bg-white dark:bg-card
        px-4 md:ps-72 md:pe-8
      "
    >
      {/* Search */}
      <div className="relative flex-1 min-w-0 max-w-md">
        <AdminSearch />
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <HeaderNotificationBell />
        <ThemeSwitch />
        <UserDropdown role={panelRole} />
        <Button
          onClick={toggleSidebar}
          type="button"
          size="icon"
          className="ms-1 bg-orange-500 md:hidden"
        >
          <BsBlockquoteLeft />
        </Button>
      </div>
    </div>
  )
}

export default Topbar
