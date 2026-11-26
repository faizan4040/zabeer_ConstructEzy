'use client'

import React, { useState } from 'react'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { RiLogoutCircleRLine } from 'react-icons/ri'
import { showToast } from '@/lib/showToast'
import axios from 'axios'
import { useDispatch } from 'react-redux'
import { useRouter } from 'next/navigation'
import { WEBSITE_LOGIN } from '@/routes/WebsiteRoute'
import { logout } from '@/store/reducer/authReducer'

const LogoutButton = () => {
  const dispatch = useDispatch()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleLogout = async (e) => {
    e.preventDefault()
    if (loading) return
    setLoading(true)
    try {
      const { data } = await axios.post('/api/auth/logout')
      if (!data?.success) throw new Error(data?.message || 'Logout failed.')

      dispatch(logout())
      showToast('success', 'Logged out successfully.')
      router.replace(WEBSITE_LOGIN)
      router.refresh()
    } catch (error) {
      showToast('error', error?.response?.data?.message || error.message || 'Logout failed.')
      setLoading(false)
    }
  }

  return (
    <DropdownMenuItem
      onSelect={handleLogout}
      disabled={loading}
      className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-500/10"
    >
      <RiLogoutCircleRLine className="h-4 w-4" color="currentColor" />
      {loading ? 'Logging out…' : 'Logout'}
    </DropdownMenuItem>
  )
}

export default LogoutButton
