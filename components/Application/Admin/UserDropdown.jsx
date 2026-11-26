'use client'

import React, { useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import Link from 'next/link'
import { User, Settings, Store } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import LogoutButton from './LogoutButton'
import { WEBSITE_HOME } from '@/routes/WebsiteRoute'

export const PROFILE_UPDATED_EVENT = 'panel-profile-updated'

export const getInitials = (name = '') =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('') || 'U'

const UserDropdown = ({ role = 'shopowner' }) => {
  const [user, setUser] = useState(null)
  const base = role === 'admin' ? '/admin' : '/shop'

  const fetchProfile = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/panel/profile')
      if (data?.success) setUser(data.data)
    } catch {}
  }, [])

  useEffect(() => {
    fetchProfile()
    // Profile page fires this after saving, so the header photo/name refresh instantly
    const onUpdate = (e) => (e.detail ? setUser(e.detail) : fetchProfile())
    window.addEventListener(PROFILE_UPDATED_EVENT, onUpdate)
    return () => window.removeEventListener(PROFILE_UPDATED_EVENT, onUpdate)
  }, [fetchProfile])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" aria-label="Account menu" className="rounded-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-400">
          <Avatar className="h-9 w-9">
            {user?.avatar?.url && <AvatarImage src={user.avatar.url} alt={user.name} className="object-cover" />}
            <AvatarFallback className="bg-orange-500 text-white text-sm font-semibold">
              {getInitials(user?.name)}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="flex items-center gap-3 py-2">
          <Avatar className="h-10 w-10">
            {user?.avatar?.url && <AvatarImage src={user.avatar.url} alt={user.name} className="object-cover" />}
            <AvatarFallback className="bg-orange-500 text-white text-sm font-semibold">
              {getInitials(user?.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{user?.name || 'Loading…'}</p>
            <p className="text-xs font-normal text-muted-foreground truncate">{user?.email}</p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild className="cursor-pointer">
          <Link href={`${base}/profile`}>
            <User className="h-4 w-4" />
            Profile
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild className="cursor-pointer">
          <Link href={`${base}/settings`}>
            <Settings className="h-4 w-4" />
            Settings
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild className="cursor-pointer">
          <Link href={WEBSITE_HOME}>
            <Store className="h-4 w-4" />
            Go to Customer Site
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <LogoutButton />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default UserDropdown
