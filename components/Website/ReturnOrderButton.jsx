'use client'

import axios from 'axios'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, CheckCircle2, AlertCircle, RotateCcw } from 'lucide-react'

const RETURN_WINDOW_DAYS = 7

const ReturnOrderButton = ({ orderId, productId, status, isReturnable, returnRequested, isSample = false, deliveredAt = null }) => {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [reason, setReason] = useState('')
  const router = useRouter()

  // ── Already returned/requested — show a static badge, no button ──
  if (returnRequested) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-orange-600 whitespace-nowrap">
        <RotateCcw size={12} />
        Return Requested
      </span>
    )
  }

  // ── Only eligible when: item delivered + product marked returnable ──
  if (status !== 'delivered' || isReturnable === false) return null

  // 7-day window (delivery ke baad) khatam → button mat dikhao
  if (deliveredAt && (Date.now() - new Date(deliveredAt).getTime()) / 86400000 > RETURN_WINDOW_DAYS) {
    return <span className="text-[11px] text-gray-400 whitespace-nowrap">Return window closed</span>
  }

  const handleSubmit = async () => {
    if (reason.trim().length < 5) {
      setMessage({ type: 'error', text: 'Please describe the reason (min 5 characters).' })
      return
    }

    try {
      setLoading(true)
      setMessage(null)

      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/customers/orders/${orderId}/return`,
        { productId, reason: reason.trim(), isSample }
      )

      if (data.success) {
        setMessage({ type: 'success', text: data.message || 'Return request submitted.' })
        setFormOpen(false)
        router.refresh()
      } else {
        setMessage({ type: 'error', text: data.message || 'Could not submit return request.' })
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error?.response?.data?.message || 'Something went wrong.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-1.5 min-w-[140px]">
      {!formOpen ? (
        <button
          type="button"
          onClick={() => setFormOpen(true)}
          className="text-[11px] font-semibold text-blue-600 hover:text-blue-700
                     underline underline-offset-2 whitespace-nowrap"
        >
          {isSample ? 'Return Sample' : 'Return Item'}
        </button>
      ) : (
        <div className="flex flex-col gap-2 bg-white border border-blue-200 rounded-lg shadow-sm p-3 w-56">
          <p className="text-xs font-medium text-gray-700">Why are you returning this?</p>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="e.g. Product damaged on arrival, wrong item received..."
            className="text-xs border rounded-md p-2 resize-none focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => { setFormOpen(false); setReason(''); setMessage(null) }}
              disabled={loading}
              className="px-2.5 py-1 rounded border border-gray-300 text-gray-600 text-[11px] font-semibold hover:bg-gray-100 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold disabled:opacity-50"
            >
              {loading && <Loader2 size={10} className="animate-spin" />}
              Submit
            </button>
          </div>
        </div>
      )}

      {message && (
        <div
          className={`flex items-center gap-1 text-[11px] font-medium whitespace-nowrap
          ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}
        >
          {message.type === 'success' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
          {message.text}
        </div>
      )}
    </div>
  )
}

export default ReturnOrderButton