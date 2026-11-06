'use client'
import { useState } from 'react'
import axios from 'axios'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import SimpleTable from '@/components/Application/Admin/SimpleTable'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { showToast } from '@/lib/showToast'
import { ADMIN_DASHBOARD } from '@/routes/AdminPanelRoute'
import { ADMIN_SERVICE_BOOKINGS } from '@/routes/ServiceRoute'

const STATUS = {
  pending_payment: 'bg-yellow-100 text-yellow-700', confirmed: 'bg-green-100 text-green-700', in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-emerald-100 text-emerald-800', cancelled: 'bg-red-100 text-red-700',
}
const PAY = { paid: 'bg-green-100 text-green-700', cash_due: 'bg-orange-100 text-orange-700', cash_collected: 'bg-blue-100 text-blue-700', pending: 'bg-yellow-100 text-yellow-700', failed: 'bg-red-100 text-red-700' }
const Tag = ({ map, v }) => <span className={`whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium capitalize ${map[v] || 'bg-gray-100'}`}>{String(v).replace('_', ' ')}</span>

const ServiceBookings = () => {
  const [tick, setTick] = useState(0)
  const complete = async (r) => {
    if (!confirm(`Mark ${r.bookingCode} completed?`)) return
    try { await axios.patch(`/api/service-booking/${r._id}/complete`); showToast('success', 'Completed'); setTick((t) => t + 1) }
    catch (e) { showToast('error', e?.response?.data?.message || e.message) }
  }

  const columns = [
    { header: 'Booking', cell: (r) => <div><p className="font-semibold">#{r.bookingCode}</p><p className="text-xs text-gray-500">{new Date(r.createdAt).toLocaleString('en-IN')}</p></div> },
    { header: 'Customer', cell: (r) => <div><p className="font-medium">{r.user?.name || '—'}</p><p className="text-xs text-gray-500">{r.contactPhone}</p></div> },
    { header: 'Service / Labour', cell: (r) => <div><p className="font-medium">{r.serviceTitle}</p><p className="text-xs text-gray-500">{r.labourName} {r.labourPhone && `· ${r.labourPhone}`}</p></div> },
    { header: 'Date & Time', cell: (r) => <div><p>{new Date(r.date).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}</p><p className="text-xs text-gray-500">{r.timeSlot}</p></div> },
    { header: 'Address', cell: (r) => <p className="max-w-[220px] text-xs">{r.address?.fullAddress}, {r.address?.city} - {r.address?.pincode}</p> },
    { header: 'Amount', cell: (r) => <div><p className="font-semibold">₹{r.total}</p><p className="text-xs text-gray-500">Labour ₹{r.labourEarning} · Cut ₹{r.commission}</p></div> },
    { header: 'Payment', cell: (r) => <div className="space-y-1"><Tag map={PAY} v={r.paymentStatus} /><p className="text-xs capitalize text-gray-500">{r.paymentMethod}</p></div> },
    { header: 'Status', cell: (r) => <Tag map={STATUS} v={r.status} /> },
    { header: '', cell: (r) => ['confirmed', 'in_progress'].includes(r.status) ? <button onClick={() => complete(r)} className="rounded border px-2 py-1 text-xs hover:bg-gray-50">Mark done</button> : null },
  ]

  return (
    <div>
      <BreadCrumb breadcrumbData={[{ href: ADMIN_DASHBOARD, label: 'Home' }, { href: ADMIN_SERVICE_BOOKINGS, label: 'Service Bookings' }]} />
      <div className="py-4">
        <Card className="py-0 rounded-3xl shadow-sm gap-0">
          <CardHeader className="pt-3 px-3 border-b [.border-b]:pb-2"><h4 className="text-xl font-semibold">Service Bookings</h4></CardHeader>
          <CardContent className="pb-5 px-0 pt-4">
            <SimpleTable fetchUrl="/api/admin/service-booking" columns={columns} refreshKey={tick} searchPlaceholder="Search booking id, service, labour, phone" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
export default ServiceBookings
