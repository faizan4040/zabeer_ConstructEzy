'use client'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import SheetGrid from '@/components/Application/Admin/SheetGrid'
import { SHEETS } from '@/lib/partnerSheets'
import { ADMIN_DASHBOARD, ADMIN_VENDOR_LIST } from '@/routes/AdminPanelRoute'

export default function VendorListPage() {
  return (
    <div>
      <BreadCrumb breadcrumbData={[{ href: ADMIN_DASHBOARD, label: 'Home' }, { href: ADMIN_VENDOR_LIST, label: 'Vendor List' }]} />
      <SheetGrid sheet={SHEETS.vendors} />
    </div>
  )
}
