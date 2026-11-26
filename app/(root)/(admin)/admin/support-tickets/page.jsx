'use client'
import { useState } from 'react'
import axios from 'axios'
import { Loader2, MessageSquareReply, Send } from 'lucide-react'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import SimpleTable from '@/components/Application/Admin/SimpleTable'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { showToast } from '@/lib/showToast'
import { ADMIN_DASHBOARD, ADMIN_SUPPORT_TICKETS } from '@/routes/AdminPanelRoute'

const STATUS = {
  open: { label: 'Open', cls: 'bg-orange-50 text-orange-700 border-orange-200' },
  in_progress: { label: 'In Progress', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  resolved: { label: 'Resolved', cls: 'bg-green-50 text-green-700 border-green-200' },
  closed: { label: 'Closed', cls: 'bg-gray-100 text-gray-700 border-gray-200' },
}

const CATEGORY_LABEL = {
  payment: 'Payment', inventory: 'Inventory', account: 'Account',
  ads_promotions: 'Ads & Promotions', instant_cash: 'Instant Cash', other: 'Other',
}

const SupportTickets = () => {
  const [tick, setTick] = useState(0)
  const [active, setActive] = useState(null) // ticket being replied to
  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)

  const update = async (body) => {
    const { data } = await axios.patch('/api/admin/support-tickets', body)
    if (!data?.success) throw new Error(data?.message)
    showToast('success', data.message)
    setTick((t) => t + 1)
  }

  const setStatus = async (id, status) => {
    try { await update({ id, status }) }
    catch (e) { showToast('error', e?.response?.data?.message || e.message) }
  }

  const openReply = (t) => { setActive(t); setReply(t.adminReply || '') }

  const sendReply = async () => {
    if (reply.trim().length < 2) return showToast('error', 'Please write a reply.')
    setSending(true)
    try {
      await update({ id: active._id, reply })
      setActive(null)
    } catch (e) {
      showToast('error', e?.response?.data?.message || e.message)
    } finally {
      setSending(false)
    }
  }

  const columns = [
    { header: 'Raised', cell: (r) => new Date(r.createdAt).toLocaleString('en-IN') },
    {
      header: 'Shop Owner',
      cell: (r) => (
        <div className="text-xs">
          <p className="font-medium text-sm">{r.user?.name || '—'}</p>
          {r.shop?.name && <p className="text-muted-foreground">{r.shop.name}</p>}
          {r.user?.phone && <a href={`tel:${r.user.phone}`} className="text-blue-600">{r.user.phone}</a>}
        </div>
      ),
    },
    {
      header: 'Category',
      cell: (r) => (
        <div className="text-xs">
          <p>{CATEGORY_LABEL[r.category] || r.category}</p>
          {r.orderId && <p className="text-muted-foreground">Order: {r.orderId}</p>}
        </div>
      ),
    },
    {
      header: 'Issue',
      cell: (r) => (
        <div className="max-w-xs">
          <p className="text-sm font-medium">{r.subject}</p>
          <p className="text-xs text-muted-foreground line-clamp-3 whitespace-pre-line">{r.description}</p>
        </div>
      ),
    },
    {
      header: 'Status',
      cell: (r) => (
        <select
          value={r.status}
          onChange={(e) => setStatus(r._id, e.target.value)}
          className={`rounded border px-2 py-1 text-xs ${STATUS[r.status]?.cls || ''}`}
        >
          {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      ),
    },
    {
      header: 'Reply',
      cell: (r) => (
        <button
          type="button"
          onClick={() => openReply(r)}
          className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium hover:bg-gray-50 dark:hover:bg-white/5"
        >
          <MessageSquareReply className="h-3.5 w-3.5" />
          {r.adminReply ? 'Edit reply' : 'Reply'}
        </button>
      ),
    },
  ]

  return (
    <div>
      <BreadCrumb
        breadcrumbData={[
          { href: ADMIN_DASHBOARD, label: 'Home' },
          { href: ADMIN_SUPPORT_TICKETS, label: 'Support Tickets' },
        ]}
      />
      <div className="py-4">
        <Card className="py-0 rounded-3xl shadow-sm gap-0">
          <CardHeader className="pt-3 px-3 border-b [.border-b]:pb-2">
            <h4 className="text-xl font-semibold">Shop Owner Support Tickets</h4>
          </CardHeader>
          <CardContent className="pb-5 px-0 pt-4">
            <SimpleTable
              fetchUrl="/api/admin/support-tickets"
              columns={columns}
              refreshKey={tick}
              searchPlaceholder="Search subject, order ID..."
            />
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Reply to ticket</DialogTitle>
            <DialogDescription>{active?.subject}</DialogDescription>
          </DialogHeader>
          {active && (
            <div className="space-y-3">
              <p className="max-h-32 overflow-y-auto whitespace-pre-line rounded-lg bg-muted p-3 text-sm">
                {active.description}
              </p>
              <Textarea
                rows={5}
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                maxLength={2000}
                placeholder="Write your reply to the shop owner…"
              />
              <p className="text-xs text-muted-foreground">
                The shop owner gets a notification and sees this reply under Support → My Ticket.
              </p>
              <button
                type="button"
                onClick={sendReply}
                disabled={sending}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
              >
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {sending ? 'Sending…' : 'Send Reply'}
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default SupportTickets
