'use client'
import { useState } from 'react'
import axios from 'axios'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import SimpleTable from '@/components/Application/Admin/SimpleTable'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { showToast } from '@/lib/showToast'
import { ADMIN_DASHBOARD } from '@/routes/AdminPanelRoute'
import { ADMIN_SERVICE_QUOTES } from '@/routes/ServiceRoute'

const ServiceQuotes = () => {
  const [tick, setTick] = useState(0)
  const setStatus = async (id, status) => {
    try { await axios.patch('/api/service-quote', { id, status }); setTick((t) => t + 1) }
    catch (e) { showToast('error', e?.response?.data?.message || e.message) }
  }
  const columns = [
    { header: 'Received', cell: (r) => new Date(r.createdAt).toLocaleString('en-IN') },
    { header: 'Name', cell: (r) => r.name || '—' },
    { header: 'Phone', cell: (r) => <a href={`tel:${r.phone}`} className="text-blue-600">{r.phone}</a> },
    { header: 'Service', cell: (r) => r.serviceType },
    { header: 'City / Date', cell: (r) => `${r.city || '—'} · ${r.preferredDate || '—'}` },
    { header: 'Details', cell: (r) => <p className="max-w-xs text-xs">{r.details || '—'}</p> },
    { header: 'Status', cell: (r) => (
      <select value={r.status} onChange={(e) => setStatus(r._id, e.target.value)} className="rounded border px-2 py-1 text-xs">
        <option value="new">New</option><option value="contacted">Contacted</option><option value="closed">Closed</option>
      </select>) },
  ]
  return (
    <div>
      <BreadCrumb breadcrumbData={[{ href: ADMIN_DASHBOARD, label: 'Home' }, { href: ADMIN_SERVICE_QUOTES, label: 'Quote Requests' }]} />
      <div className="py-4">
        <Card className="py-0 rounded-3xl shadow-sm gap-0">
          <CardHeader className="pt-3 px-3 border-b [.border-b]:pb-2"><h4 className="text-xl font-semibold">Service Quote Requests</h4></CardHeader>
          <CardContent className="pb-5 px-0 pt-4"><SimpleTable fetchUrl="/api/service-quote" columns={columns} refreshKey={tick} /></CardContent>
        </Card>
      </div>
    </div>
  )
}
export default ServiceQuotes
