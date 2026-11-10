'use client'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import SheetGrid from '@/components/Application/Admin/SheetGrid'
import { SHEETS } from '@/lib/partnerSheets'
import { ADMIN_DASHBOARD, ADMIN_LOGISTIC_PARTNERS } from '@/routes/AdminPanelRoute'

export default function LogisticPartnersPage() {
  return (
    <div>
      <BreadCrumb breadcrumbData={[{ href: ADMIN_DASHBOARD, label: 'Home' }, { href: ADMIN_LOGISTIC_PARTNERS, label: 'Logistic Partners' }]} />
      <SheetGrid sheet={SHEETS.logistics} />
    </div>
  )
}
