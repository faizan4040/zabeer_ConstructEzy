'use client'
import { useState } from 'react'
import axios from 'axios'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import SimpleTable from '@/components/Application/Admin/SimpleTable'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { showToast } from '@/lib/showToast'
import { ADMIN_DASHBOARD, ADMIN_PROJECT_ENQUIRIES } from '@/routes/AdminPanelRoute'

const STATUS_STYLE = {
  new: 'bg-orange-50 text-orange-700 border-orange-200',
  contacted: 'bg-blue-50 text-blue-700 border-blue-200',
  closed: 'bg-green-50 text-green-700 border-green-200',
}

const ProjectEnquiries = () => {
  const [tick, setTick] = useState(0)

  const setStatus = async (id, status) => {
    try {
      const { data } = await axios.patch('/api/project-enquiry', { id, status })
      if (!data?.success) throw new Error(data?.message)
      showToast('success', data.message)
      setTick((t) => t + 1)
    } catch (e) {
      showToast('error', e?.response?.data?.message || e.message)
    }
  }

  const columns = [
    { header: 'Received', cell: (r) => new Date(r.createdAt).toLocaleString('en-IN') },
    { header: 'Name', cell: (r) => r.name },
    { header: 'Mobile', cell: (r) => <a href={`tel:${r.phone}`} className="text-blue-600">{r.phone}</a> },
    { header: 'Project Type', cell: (r) => r.projectType },
    { header: 'Location', cell: (r) => r.location },
    { header: 'Requirement', cell: (r) => <p className="max-w-xs whitespace-pre-line text-xs">{r.requirement}</p> },
    {
      header: 'Status',
      cell: (r) => (
        <select
          value={r.status}
          onChange={(e) => setStatus(r._id, e.target.value)}
          className={`rounded border px-2 py-1 text-xs ${STATUS_STYLE[r.status] || ''}`}
        >
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="closed">Closed</option>
        </select>
      ),
    },
  ]

  return (
    <div>
      <BreadCrumb
        breadcrumbData={[
          { href: ADMIN_DASHBOARD, label: 'Home' },
          { href: ADMIN_PROJECT_ENQUIRIES, label: 'Project Enquiries' },
        ]}
      />
      <div className="py-4">
        <Card className="py-0 rounded-3xl shadow-sm gap-0">
          <CardHeader className="pt-3 px-3 border-b [.border-b]:pb-2">
            <h4 className="text-xl font-semibold">Project Enquiries</h4>
          </CardHeader>
          <CardContent className="pb-5 px-0 pt-4">
            <SimpleTable
              fetchUrl="/api/project-enquiry"
              columns={columns}
              refreshKey={tick}
              searchPlaceholder="Search name, mobile, location..."
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ProjectEnquiries
