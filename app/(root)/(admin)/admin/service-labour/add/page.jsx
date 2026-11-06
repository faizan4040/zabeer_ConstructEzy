'use client'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import ServiceLabourForm from '@/components/Application/Admin/ServiceLabourForm'
import { ADMIN_DASHBOARD } from '@/routes/AdminPanelRoute'
import { ADMIN_SERVICE_LABOUR_SHOW } from '@/routes/ServiceRoute'

const AddServiceLabour = () => (
  <div>
    <BreadCrumb breadcrumbData={[{ href: ADMIN_DASHBOARD, label: 'Home' }, { href: ADMIN_SERVICE_LABOUR_SHOW, label: 'Labour Cards' }, { href: '', label: 'Add Labour' }]} />
    <div className="py-4"><ServiceLabourForm mode="add" /></div>
  </div>
)
export default AddServiceLabour
