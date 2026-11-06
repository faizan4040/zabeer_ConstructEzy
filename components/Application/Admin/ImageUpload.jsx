'use client'

import React, { useRef, useState } from 'react'
import axios from 'axios'
import { FaCloudUploadAlt, FaTimes } from 'react-icons/fa'
import { showToast } from '@/lib/showToast'

/** Apne computer se image chuno -> server par upload -> onChange(url). Media library / URL ki zarurat nahi. */
const ImageUpload = ({ value, onChange, hint = 'JPG, PNG, WEBP or AVIF - max 5 MB', size = 112 }) => {
  const input = useRef(null)
  const [busy, setBusy] = useState(false)
  const [drag, setDrag] = useState(false)

  const upload = async (file) => {
    if (!file) return
    if (!/^image\/(jpeg|png|webp|avif)$/.test(file.type)) return showToast('error', 'Only JPG, PNG, WEBP or AVIF images are allowed.')
    if (file.size > 5 * 1024 * 1024) return showToast('error', 'Image must be under 5 MB.')
    setBusy(true)
    try {
      const fd = new FormData(); fd.append('file', file)
      const { data } = await axios.post('/api/admin/upload-image', fd)
      if (!data.success) throw new Error(data.message)
      onChange(data.data.url); showToast('success', 'Image uploaded')
    } catch (e) { showToast('error', e?.response?.data?.message || e.message) }
    finally { setBusy(false); if (input.current) input.current.value = '' }
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true) }} onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); upload(e.dataTransfer.files?.[0]) }}
        style={{ width: size, height: size }}
        className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed ${drag ? 'border-orange-400 bg-orange-50' : 'border-gray-300 bg-gray-50'}`}
      >
        {value ? <img src={value} alt="Preview" className="h-full w-full object-cover" /> : <FaCloudUploadAlt className="text-3xl text-gray-300" />}
        {busy && <div className="absolute inset-0 flex items-center justify-center bg-white/80 text-xs font-medium text-gray-600">Uploading...</div>}
        {value && !busy && (
          <button type="button" onClick={() => onChange('')} aria-label="Remove image" className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white"><FaTimes size={10} /></button>
        )}
      </div>
      <div>
        <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="hidden" onChange={(e) => upload(e.target.files?.[0])} />
        <button type="button" disabled={busy} onClick={() => input.current?.click()} className="rounded-lg border border-orange-400 px-4 py-2 text-sm font-medium text-orange-500 hover:bg-orange-50 disabled:opacity-50">
          {value ? 'Change image' : 'Choose image from computer'}
        </button>
        <p className="mt-1.5 text-xs text-gray-500">{hint}</p>
      </div>
    </div>
  )
}
export default ImageUpload
