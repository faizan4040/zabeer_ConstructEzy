'use client'

import { useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import Link from 'next/link'
import { Download, Search, TrendingUp, Loader2, Landmark } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { SHOP_OWNER_DASHBOARD, SHOP_OWNER_PAYMENT_DETAILS, SHOP_OWNER_BANK_ACCOUNT } from '@/routes/ShopOwnerPanelRoute'

const breadcrumbData = [
  { href: SHOP_OWNER_DASHBOARD, label: 'Home' },
  { href: '', label: 'Payment' },
]

const formatINR = (n) => `₹${Math.abs(Number(n) || 0).toLocaleString('en-IN')}`
const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

const ShopPaymentsPage = () => {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const fetchSummary = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/shopowner/payments/summary')
      setSummary(data.data)
    } catch {
      setSummary(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSummary()
    const interval = setInterval(fetchSummary, 30000)
    return () => clearInterval(interval)
  }, [fetchSummary])

  if (loading) return <div className="flex justify-center py-32"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>

  return (
    <div>
      <BreadCrumb breadcrumbData={breadcrumbData} />

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Payment</h1>
        <div className="flex gap-2">
          <Link href={SHOP_OWNER_BANK_ACCOUNT} className="flex items-center gap-2 border text-gray-700 text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-gray-50">
            <Landmark size={16} /> Bank Account
          </Link>
          <a href="/api/shopowner/payments/export" className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium px-4 py-2.5 rounded-xl">
            <Download size={16} /> Download
          </a>
        </div>
      </div>

      <div className="relative max-w-md mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by Order / Sub-Order No." className="pl-9 rounded-xl h-11" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card className="rounded-2xl shadow-sm border-green-100">
          <CardContent className="p-5 bg-green-50/50 rounded-2xl">
            <p className="text-sm text-gray-600 mb-1">Last Payment</p>
            {summary?.lastPayment ? (
              <p className="text-2xl font-bold text-green-700">
                {formatINR(summary.lastPayment.amount)} Paid on {formatDate(summary.lastPayment.date)}
              </p>
            ) : (
              <p className="text-sm text-gray-400">No payments made yet.</p>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-5 space-y-3">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Outstanding Payment</p>
              <p className="text-xl font-bold text-red-600">-{formatINR(summary?.totalOutstanding || 0)}</p>
            </div>
            <div className="pt-2 border-t">
              <p className="text-sm text-gray-600 mb-1">Next Payment</p>
              {summary?.nextPayment ? (
                <p className="text-lg font-bold text-red-600">
                  -{formatINR(summary.nextPayment.amount)} Due on {formatDate(summary.nextPayment.dueDate)}
                </p>
              ) : (
                <p className="text-sm text-gray-400">No upcoming payments.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-yellow-500" />
              <h3 className="font-semibold text-gray-900">Payment Over Time</h3>
            </div>
            <Link href={SHOP_OWNER_PAYMENT_DETAILS} className="text-sm font-medium text-orange-600 hover:underline">
              View Details
            </Link>
          </div>

          {summary?.chartData?.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={summary.chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value) => formatINR(value)} />
                <Line type="monotone" dataKey="amount" stroke="#f97316" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Landmark className="w-8 h-8 mb-2 text-gray-300" />
              <p className="text-sm">No payment history yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default ShopPaymentsPage