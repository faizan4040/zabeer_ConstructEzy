'use client'

import { useState } from 'react'
import Link from 'next/link'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { Bell, Package, AlertTriangle, Info, CheckCircle2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { usePanelNotifications } from './PanelNotifications'

dayjs.extend(relativeTime)

const ICONS = {
  order: <Package className="h-4 w-4 text-orange-500" />,
  stock: <AlertTriangle className="h-4 w-4 text-red-500" />,
  general: <Info className="h-4 w-4 text-blue-500" />,
}

/** One notification row — shared by the header bell and the notifications page. */
export const NotificationRow = ({ item, onClick }) => {
  const body = (
    <div
      className={`flex items-start gap-3 px-4 py-3 border-b last:border-b-0 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors ${
        item.unread ? 'bg-orange-50/60 dark:bg-orange-500/5' : ''
      }`}
    >
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-white/10">
        {ICONS[item.type] || ICONS.general}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{item.title}</p>
        {item.message && (
          <p className="text-xs text-muted-foreground line-clamp-2">{item.message}</p>
        )}
        {item.time && (
          <p className="mt-0.5 text-[10px] text-muted-foreground">{dayjs(item.time).fromNow()}</p>
        )}
      </div>
      {item.unread && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-orange-500" />}
    </div>
  )
  return item.href ? (
    <Link href={item.href} onClick={onClick}>
      {body}
    </Link>
  ) : (
    body
  )
}

export const EmptyNotifications = () => (
  <div className="flex flex-col items-center gap-2 py-10 text-sm text-muted-foreground">
    <CheckCircle2 className="h-6 w-6 text-green-500" />
    You&apos;re all caught up
  </div>
)

/** Header bell: new orders + general notifications + low-stock alerts in one place. */
const HeaderNotificationBell = () => {
  const { cfg, items, totalUnseen, markAllRead } = usePanelNotifications()
  const [open, setOpen] = useState(false)

  const handleOpenChange = (next) => {
    setOpen(next)
    // Mark read when the panel closes, so the user still sees what was new
    if (!next && totalUnseen > 0) markAllRead()
  }

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Notifications"
          className="relative flex h-9 w-9 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
        >
          <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          {totalUnseen > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
              {totalUnseen > 9 ? '9+' : totalUnseen}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[min(22rem,calc(100vw-2rem))] p-0 rounded-xl">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <p className="text-sm font-semibold">Notifications</p>
          {totalUnseen > 0 && (
            <button
              type="button"
              onClick={markAllRead}
              className="text-xs font-medium text-orange-500 hover:underline"
            >
              Mark all as read
            </button>
          )}
        </div>

        <div className="max-h-96 overflow-y-auto">
          {items.length === 0 ? (
            <EmptyNotifications />
          ) : (
            items.slice(0, 15).map((item) => (
              <NotificationRow key={item.key} item={item} onClick={() => handleOpenChange(false)} />
            ))
          )}
        </div>

        <Link
          href={`${cfg.base}/notifications`}
          onClick={() => handleOpenChange(false)}
          className="block border-t py-2.5 text-center text-xs font-medium text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-500/10"
        >
          View all notifications
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default HeaderNotificationBell
