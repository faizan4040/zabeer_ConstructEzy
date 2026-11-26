'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CheckCheck } from 'lucide-react'
import { usePanelNotifications } from './PanelNotifications'
import { EmptyNotifications, NotificationRow } from './HeaderNotificationBell'

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'order', label: 'New Orders' },
  { key: 'general', label: 'Updates' },
  { key: 'stock', label: 'Stock Alerts' },
]

/** Full notifications page for admin + shop owner (same data as the header bell). */
const NotificationsPage = () => {
  const { cfg, items, totalUnseen, markAllRead } = usePanelNotifications()
  const [tab, setTab] = useState('all')

  const list = tab === 'all' ? items : items.filter((i) => i.type === tab)
  const countFor = (key) => (key === 'all' ? items : items.filter((i) => i.type === key)).filter((i) => i.unread).length

  return (
    <div className="mx-auto max-w-3xl py-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Notifications</h1>
          <p className="text-sm text-muted-foreground">
            {totalUnseen > 0 ? `${totalUnseen} unread` : 'You are all caught up'}
          </p>
        </div>
        {totalUnseen > 0 && (
          <button
            type="button"
            onClick={markAllRead}
            className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-gray-50 dark:hover:bg-white/5"
          >
            <CheckCheck className="h-4 w-4" /> Mark all as read
          </button>
        )}
      </div>

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {TABS.map((t) => {
          const n = countFor(t.key)
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                tab === t.key
                  ? 'border-orange-500 bg-orange-500 text-white'
                  : 'hover:bg-gray-50 dark:hover:bg-white/5'
              }`}
            >
              {t.label}
              {n > 0 && <span className="ms-1.5 text-xs opacity-80">({n})</span>}
            </button>
          )
        })}
      </div>

      <div className="overflow-hidden rounded-2xl border bg-card">
        {list.length === 0 ? <EmptyNotifications /> : list.map((item) => <NotificationRow key={item.key} item={item} />)}
      </div>

      <p className="mt-3 text-center text-xs text-muted-foreground">
        New orders show here until you mark them read.{' '}
        <Link href={cfg.ordersPage} className="font-medium text-orange-500 hover:underline">
          See all orders
        </Link>
      </p>
    </div>
  )
}

export default NotificationsPage
