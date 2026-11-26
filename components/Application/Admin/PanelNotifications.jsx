'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'
import axios from 'axios'
import { useOrderNotifications } from '@/hooks/useOrderNotifications'

const POLL_INTERVAL = 30000

export const PANEL_CONFIG = {
  admin: {
    base: '/admin',
    orderEndpoint: '/api/dashboard/admin/notifications/orders',
    orderStorageKey: 'admin_last_seen_order_id',
    ordersPage: '/admin/orders',
    orderLink: (id) => `/admin/orders/details/${id}`,
    stockEndpoint: '/api/dashboard/admin/stock-report',
    stockLink: '/admin/stock',
    stockSeenKey: 'admin_seen_low_stock',
  },
  shopowner: {
    base: '/shop',
    orderEndpoint: '/api/shopowner/dashboard/notifications/orders',
    orderStorageKey: 'shopowner_last_seen_order_id',
    ordersPage: '/shop/orders',
    orderLink: (id) => `/shop/orders/${id}`,
    stockEndpoint: '/api/shopowner/dashboard/stock-report',
    stockLink: '/shop/product-variant',
    stockSeenKey: 'shopowner_seen_low_stock',
  },
}

const readSeen = (key) => {
  try {
    return new Set(JSON.parse(localStorage.getItem(key) || '[]'))
  } catch {
    return new Set()
  }
}

const writeSeen = (key, ids) => {
  try {
    localStorage.setItem(key, JSON.stringify(ids))
  } catch {}
}

const PanelNotificationsContext = createContext(null)

/**
 * Single source of truth for dashboard notifications (new orders + general
 * notifications + low stock). Used by the header bell, the shop sidebar count
 * and the /notifications page, so they always show the same number.
 */
export const PanelNotificationsProvider = ({ role, children }) => {
  const pathname = usePathname()
  const panelRole = role || (pathname?.startsWith('/admin') ? 'admin' : 'shopowner')
  const cfg = PANEL_CONFIG[panelRole]

  // 1) New orders
  const { notifications: orders, unseenCount: unseenOrders, markAllRead: markOrdersRead } =
    useOrderNotifications(cfg.orderEndpoint, cfg.orderStorageKey)

  // 2) General notifications (order status, support replies, enquiries …)
  const [general, setGeneral] = useState([])
  const [unreadGeneral, setUnreadGeneral] = useState(0)

  // 3) Low / out of stock
  const [lowStock, setLowStock] = useState([])
  const [seenStock, setSeenStock] = useState(() => new Set())

  const fetchGeneral = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/notifications', { params: { limit: 50 } })
      if (data?.success) {
        setGeneral(data.data.notifications || [])
        setUnreadGeneral(data.data.unreadCount || 0)
      }
    } catch {}
  }, [])

  const fetchStock = useCallback(async () => {
    try {
      const { data } = await axios.get(cfg.stockEndpoint)
      if (data?.success) {
        const table = data.data?.stockTable || []
        setLowStock(table.filter((i) => i.status === 'Low Stock' || i.status === 'Out of Stock'))
      }
    } catch {}
  }, [cfg.stockEndpoint])

  useEffect(() => {
    setSeenStock(readSeen(cfg.stockSeenKey))
    fetchGeneral()
    fetchStock()
    const t1 = setInterval(fetchGeneral, POLL_INTERVAL)
    const t2 = setInterval(fetchStock, POLL_INTERVAL * 4)
    return () => {
      clearInterval(t1)
      clearInterval(t2)
    }
  }, [cfg.stockSeenKey, fetchGeneral, fetchStock])

  const unseenStock = lowStock.filter((i) => !seenStock.has(String(i.variantId))).length
  const totalUnseen = unseenOrders + unreadGeneral + unseenStock

  const items = useMemo(() => {
    const orderItems = orders.map((o) => ({
      key: `o-${o._id}`,
      type: 'order',
      title: `New order #${String(o._id).slice(-6)}`,
      message: `₹${Number(o.totalAmount || 0).toLocaleString('en-IN')}`,
      time: o.createdAt,
      href: cfg.orderLink(o._id),
      unread: true,
    }))
    const generalItems = general.map((n) => ({
      key: `n-${n._id}`,
      type: 'general',
      title: n.title,
      message: n.message,
      time: n.createdAt,
      href: n.link || null,
      unread: !n.isRead,
    }))
    const timed = [...orderItems, ...generalItems].sort(
      (a, b) => new Date(b.time || 0) - new Date(a.time || 0)
    )
    const stockItems = lowStock.map((s) => ({
      key: `s-${s.variantId}`,
      type: 'stock',
      title: s.status === 'Out of Stock' ? 'Out of stock' : 'Low stock',
      message: `${s.productName} • SKU ${s.sku || '—'} • ${s.remainingStock} left`,
      time: null,
      href: cfg.stockLink,
      unread: !seenStock.has(String(s.variantId)),
    }))
    return [...timed, ...stockItems]
  }, [orders, general, lowStock, seenStock, cfg])

  const markAllRead = useCallback(async () => {
    markOrdersRead()

    const stockIds = lowStock.map((s) => String(s.variantId))
    writeSeen(cfg.stockSeenKey, stockIds)
    setSeenStock(new Set(stockIds))

    if (unreadGeneral > 0) {
      setUnreadGeneral(0)
      setGeneral((prev) => prev.map((n) => ({ ...n, isRead: true })))
      try {
        await axios.post('/api/notifications/mark-read', { ids: 'all' })
      } catch {}
    }
  }, [markOrdersRead, lowStock, cfg.stockSeenKey, unreadGeneral])

  const value = useMemo(
    () => ({ role: panelRole, cfg, items, totalUnseen, markAllRead, refresh: fetchGeneral }),
    [panelRole, cfg, items, totalUnseen, markAllRead, fetchGeneral]
  )

  return <PanelNotificationsContext.Provider value={value}>{children}</PanelNotificationsContext.Provider>
}

export const usePanelNotifications = () => {
  const ctx = useContext(PanelNotificationsContext)
  if (!ctx) throw new Error('usePanelNotifications must be used inside <PanelNotificationsProvider>')
  return ctx
}
