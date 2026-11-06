'use client'
import { use } from 'react'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import ServiceLabourForm from '@/components/Application/Admin/ServiceLabourForm'
import { ADMIN_DASHBOARD } from '@/routes/AdminPanelRoute'
import { ADMIN_SERVICE_LABOUR_SHOW } from '@/routes/ServiceRoute'

const EditServiceLabour = ({ params }) => {
  const { id } = use(params)
  return (
    <div>
      <BreadCrumb breadcrumbData={[{ href: ADMIN_DASHBOARD, label: 'Home' }, { href: ADMIN_SERVICE_LABOUR_SHOW, label: 'Labour Cards' }, { href: '', label: 'Edit' }]} />
      <div className="py-4"><ServiceLabourForm mode="edit" id={id} /></div>
    </div>
  )
}
export default EditServiceLabour
