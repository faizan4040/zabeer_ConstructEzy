'use client'
import { useState } from 'react'
import axios from 'axios'
import Link from 'next/link'
import { FilePlus } from 'lucide-react'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import SimpleTable from '@/components/Application/Admin/SimpleTable'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { showToast } from '@/lib/showToast'
import { ADMIN_DASHBOARD } from '@/routes/AdminPanelRoute'
import { ADMIN_SERVICE_LABOUR_ADD, ADMIN_SERVICE_LABOUR_EDIT, ADMIN_SERVICE_LABOUR_SHOW } from '@/routes/ServiceRoute'

const ServiceLabourList = () => {
  const [tick, setTick] = useState(0)

  const toggle = async (r) => {
    try { await axios.put(`/api/service-listing/${r._id}`, { isActive: !r.isActive }); setTick((t) => t + 1) }
    catch (e) { showToast('error', e?.response?.data?.message || e.message) }
  }
  const remove = async (r) => {
    if (!confirm(`Delete "${r.title}" (${r.labourName})?`)) return
    try { await axios.delete(`/api/service-listing/${r._id}`); showToast('success', 'Deleted'); setTick((t) => t + 1) }
    catch (e) { showToast('error', e?.response?.data?.message || e.message) }
  }

  const columns = [
    { header: 'Labour', cell: (r) => (
      <div className="flex items-center gap-3">
        <img src={r.photo || '/assets/images/image_placeholder.webp'} alt="" className="h-12 w-12 rounded-md border object-cover" />
        <div><p className="font-medium">{r.labourName}</p><p className="text-xs text-gray-500">{r.title}</p></div>
      </div>) },
    { header: 'Category', cell: (r) => <span>{r.category?.name}{r.subCategory?.name ? ` › ${r.subCategory.name}` : ''}</span> },
    { header: 'Price', cell: (r) => `₹${r.price}` },
    { header: 'Rating', cell: (r) => `${r.rating?.toFixed?.(1) ?? 0} (${r.reviewCount || 0})` },
    { header: 'Bookings', cell: (r) => r.bookingCount || 0 },
    { header: 'Wallet link', cell: (r) => r.linkedLabourUser ? <span className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-700">Linked</span> : <span className="text-xs text-gray-400">—</span> },
    { header: 'Status', cell: (r) => (
      <button onClick={() => toggle(r)} className={`rounded-full px-3 py-1 text-xs font-medium ${r.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>{r.isActive ? 'Active' : 'Hidden'}</button>) },
    { header: 'Actions', cell: (r) => (
      <div className="flex gap-2 text-xs">
        <Link href={ADMIN_SERVICE_LABOUR_EDIT(r._id)} className="rounded border px-2 py-1 hover:bg-gray-50">Edit</Link>
        <button onClick={() => remove(r)} className="rounded border border-red-200 px-2 py-1 text-red-500 hover:bg-red-50">Delete</button>
      </div>) },
  ]

  return (
    <div>
      <BreadCrumb breadcrumbData={[{ href: ADMIN_DASHBOARD, label: 'Home' }, { href: ADMIN_SERVICE_LABOUR_SHOW, label: 'Labour Cards' }]} />
      <div className="py-4">
        <Card className="py-0 rounded-3xl shadow-sm gap-0">
          <CardHeader className="pt-3 px-3 border-b [.border-b]:pb-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xl font-semibold">Labour Cards (Frontend par dikhne wale)</h4>
              <Button asChild className="bg-[#fff0ea] text-orange-400 font-mono hover:bg-orange-500 hover:text-white">
                <Link href={ADMIN_SERVICE_LABOUR_ADD}><FilePlus />Add Labour</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pb-5 px-0 pt-4">
            <SimpleTable fetchUrl="/api/admin/service-listing" columns={columns} refreshKey={tick} searchPlaceholder="Search labour, title, city" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
export default ServiceLabourList
