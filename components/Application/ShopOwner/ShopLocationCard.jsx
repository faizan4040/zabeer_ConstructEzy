'use client'

import axios from 'axios'
import { useEffect, useState } from 'react'
import { MapPin, Loader2, CheckCircle2, LocateFixed } from 'lucide-react'
import { showToast } from '@/lib/showToast'

// Browser GPS se shop location save karta hai (PUT /api/shopowner/location).
// Paid delivery ka distance isi location se buyer tak nikalta hai.
// compact=true → product form ke andar chhota inline version
export default function ShopLocationCard({ compact = false, onChange }) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [loc, setLoc] = useState(null) // { enabled, lat, lng, address }
  const [address, setAddress] = useState('')

  useEffect(() => {
    let alive = true
    axios.get('/api/shopowner/location')
      .then(({ data }) => {
        if (!alive || !data.success) return
        setLoc(data.data)
        setAddress(data.data.address || '')
        onChange?.(data.data)
      })
      .catch(() => {})
      .finally(() => alive && setLoading(false))
    return () => { alive = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const enableLocation = () => {
    if (!navigator.geolocation) {
      showToast('error', 'Your browser does not support location.')
      return
    }
    setSaving(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { data } = await axios.put('/api/shopowner/location', {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            address,
          })
          if (!data.success) throw new Error(data.message)
          setLoc(data.data)
          onChange?.(data.data)
          showToast('success', 'Shop location saved.')
        } catch (err) {
          showToast('error', err?.response?.data?.message || err.message || 'Could not save location.')
        } finally {
          setSaving(false)
        }
      },
      (err) => {
        setSaving(false)
        showToast('error', err.code === 1
          ? 'Location permission denied. Allow location in your browser settings and try again.'
          : 'Could not get your location. Please try again.')
      },
      { enableHighAccuracy: true, timeout: 15000 }
    )
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-xs text-gray-500 py-2">
        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Checking shop location…
      </div>
    )
  }

  const enabled = !!loc?.enabled

  return (
    <div className={`rounded-xl border ${enabled ? 'border-green-200 bg-green-50/60 dark:bg-green-950/20' : 'border-amber-200 bg-amber-50 dark:bg-amber-950/20'} ${compact ? 'p-3' : 'p-4 sm:p-5'}`}>
      <div className="flex items-start gap-3">
        <div className={`rounded-lg p-2 shrink-0 ${enabled ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
          {enabled ? <CheckCircle2 className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div>
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
              {enabled ? 'Shop location enabled' : 'Enable your shop location'}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {enabled
                ? 'Paid delivery is calculated from this location to the buyer.'
                : 'Needed for paid delivery — the charge is calculated from your shop to the buyer. Stand at your shop/godown and tap the button.'}
            </p>
            {enabled && (
              <a
                href={`https://www.google.com/maps?q=${loc.lat},${loc.lng}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-blue-600 hover:underline"
              >
                {loc.address || `${Number(loc.lat).toFixed(5)}, ${Number(loc.lng).toFixed(5)}`} · View on map
              </a>
            )}
          </div>

          {!compact && (
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Shop address / landmark (optional)"
              className="w-full border rounded-lg px-3 py-2 text-sm bg-white dark:bg-background focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          )}

          <button
            type="button"
            onClick={enableLocation}
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold px-3 py-2 disabled:opacity-60 cursor-pointer"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <LocateFixed className="h-3.5 w-3.5" />}
            {enabled ? 'Update to current location' : 'Use my current location'}
          </button>
        </div>
      </div>
    </div>
  )
}
