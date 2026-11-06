import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import AdminLabourJobs from '@/components/Application/Labour/AdminLabourJobs'
import { ADMIN_DASHBOARD } from '@/routes/AdminPanelRoute'
import { ADMIN_LABOUR_JOBS } from '@/routes/ServiceRoute'

export const metadata = { title: 'Labour Jobs | Admin' }

export default function Page() {
  return (
    <div>
      <BreadCrumb breadcrumbData={[{ href: ADMIN_DASHBOARD, label: 'Home' }, { href: ADMIN_LABOUR_JOBS, label: 'Labour Jobs' }]} />
      <div className="py-4"><AdminLabourJobs /></div>
    </div>
  )
}
