'use client'
import { useState } from 'react'
import axios from 'axios'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import SimpleTable from '@/components/Application/Admin/SimpleTable'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { showToast } from '@/lib/showToast'
import { ADMIN_DASHBOARD } from '@/routes/AdminPanelRoute'
import { ADMIN_LABOUR_WITHDRAWALS } from '@/routes/ServiceRoute'

const LabourWithdrawals = () => {
  const [tick, setTick] = useState(0)
  const act = async (r, action) => {
    let utr = ''
    if (action === 'paid') { utr = prompt('Bank transfer ke baad UTR / reference number daalo:') || ''; if (!utr.trim()) return }
    else if (action === 'payout') { if (!confirm(`₹${r.amount} RazorpayX se seedha labour ke bank me bhejna hai?`)) return }
    else if (!confirm('Reject karne par paisa labour ke wallet me wapas jayega. Continue?')) return
    try { const { data } = await axios.patch('/api/admin/labour-withdrawals', { id: r._id, action, utr }); if (!data.success) throw new Error(data.message); showToast('success', data.message); setTick((t) => t + 1) }
    catch (e) { showToast('error', e?.response?.data?.message || e.message) }
  }
  const col = { requested: 'bg-yellow-100 text-yellow-700', processing: 'bg-blue-100 text-blue-700', paid: 'bg-green-100 text-green-700', rejected: 'bg-red-100 text-red-700' }
  const columns = [
    { header: 'Requested', cell: (r) => new Date(r.createdAt).toLocaleString('en-IN') },
    { header: 'Labour', cell: (r) => <div><p className="font-medium">{r.user?.name}</p><p className="text-xs text-gray-500">{r.user?.phone}</p></div> },
    { header: 'Amount', cell: (r) => <span className="font-semibold">₹{r.amount}</span> },
    { header: 'Bank / UPI', cell: (r) => r.bank ? (
      <div className="text-xs"><p>{r.bank.accountHolder || r.bank.accountHolderName}</p><p>{r.bank.accountNumber} {r.bank.ifsc || r.bank.ifscCode}</p><p>{r.bank.upiId || r.bank.upi}</p></div>
    ) : <span className="text-xs text-gray-400">Registered Labours me dekho</span> },
    { header: 'Status', cell: (r) => <div><span className={`rounded-full px-2 py-0.5 text-xs capitalize ${col[r.status]}`}>{r.status}</span>{r.note && <p className="mt-1 text-xs text-gray-500">{r.note}</p>}</div> },
    { header: '', cell: (r) => ['requested', 'processing'].includes(r.status) ? (
      <div className="flex gap-2 text-xs">
        {r.status === 'requested' && <button onClick={() => act(r, 'payout')} className="rounded bg-indigo-600 px-2 py-1 text-white">Pay to bank</button>}
        <button onClick={() => act(r, 'paid')} className="rounded bg-green-600 px-2 py-1 text-white">Mark paid</button>
        {r.status === 'requested' && <button onClick={() => act(r, 'rejected')} className="rounded border border-red-200 px-2 py-1 text-red-500">Reject</button>}
      </div>) : null },
  ]
  return (
    <div>
      <BreadCrumb breadcrumbData={[{ href: ADMIN_DASHBOARD, label: 'Home' }, { href: ADMIN_LABOUR_WITHDRAWALS, label: 'Labour Withdrawals' }]} />
      <div className="py-4">
        <Card className="py-0 rounded-3xl shadow-sm gap-0">
          <CardHeader className="pt-3 px-3 border-b [.border-b]:pb-2"><h4 className="text-xl font-semibold">Labour Withdraw Requests</h4></CardHeader>
          <CardContent className="pb-5 px-0 pt-4"><SimpleTable fetchUrl="/api/admin/labour-withdrawals" columns={columns} refreshKey={tick} /></CardContent>
        </Card>
      </div>
    </div>
  )
}
export default LabourWithdrawals
