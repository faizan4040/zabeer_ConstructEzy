'use client'

import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { Camera, Loader2, Mail, Phone, Save, Trash2, User } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { showToast } from '@/lib/showToast'
import { login } from '@/store/reducer/authReducer'
import { PROFILE_UPDATED_EVENT, getInitials } from './UserDropdown'

const MAX_SIZE = 2 * 1024 * 1024

/** Profile page for admin + shop owner: photo, name, phone. */
const PanelProfile = ({ children }) => {
  const dispatch = useDispatch()
  const auth = useSelector((s) => s.authStore?.auth)
  const fileRef = useRef(null)

  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState('')
  const [removeAvatar, setRemoveAvatar] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await axios.get('/api/panel/profile')
        if (data?.success) {
          setUser(data.data)
          setName(data.data.name || '')
          setPhone(data.data.phone || '')
          setPreview(data.data.avatar?.url || '')
        }
      } catch {
        showToast('error', 'Could not load your profile.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // free the blob URL when it changes
  useEffect(() => () => preview?.startsWith('blob:') && URL.revokeObjectURL(preview), [preview])

  const pickFile = (e) => {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    if (!f.type.startsWith('image/')) return showToast('error', 'Please choose an image file.')
    if (f.size > MAX_SIZE) return showToast('error', 'Image must be under 2 MB.')
    setFile(f)
    setRemoveAvatar(false)
    setPreview(URL.createObjectURL(f))
  }

  const clearPhoto = () => {
    setFile(null)
    setPreview('')
    setRemoveAvatar(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (name.trim().length < 2) return showToast('error', 'Name must be at least 2 characters.')
    if (phone && phone.length !== 10) return showToast('error', 'Phone number must be 10 digits.')

    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('name', name.trim())
      fd.append('phone', phone)
      if (file) fd.append('file', file)
      if (removeAvatar) fd.append('removeAvatar', 'true')

      const { data } = await axios.put('/api/panel/profile', fd)
      if (!data?.success) throw new Error(data?.message)

      setUser(data.data)
      setFile(null)
      setRemoveAvatar(false)
      setPreview(data.data.avatar?.url || '')
      if (auth) dispatch(login({ ...auth, name: data.data.name, avatar: data.data.avatar }))
      window.dispatchEvent(new CustomEvent(PROFILE_UPDATED_EVENT, { detail: data.data }))
      showToast('success', data.message || 'Profile updated.')
    } catch (err) {
      showToast('error', err?.response?.data?.message || err.message || 'Could not update profile.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20 text-gray-500">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return <div className="py-20 text-center text-red-500">Could not load your profile.</div>
  }

  return (
    <div className="mx-auto max-w-xl py-6">
      <h1 className="mb-5 text-xl font-semibold">My Profile</h1>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border bg-white p-6 shadow-sm dark:bg-card">
        {/* Photo */}
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-5">
          <div className="relative">
            <Avatar className="h-24 w-24 border">
              {preview && <AvatarImage src={preview} alt={name} className="object-cover" />}
              <AvatarFallback className="bg-orange-500 text-2xl font-semibold text-white">
                {getInitials(name)}
              </AvatarFallback>
            </Avatar>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-white shadow hover:bg-orange-600"
              aria-label="Change photo"
            >
              <Camera className="h-4 w-4" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={pickFile} />
          </div>
          <div className="text-center sm:text-left">
            <p className="font-medium">{user.name}</p>
            <p className="text-xs capitalize text-gray-500">{user.role}</p>
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Upload photo
              </button>
              {preview && (
                <button
                  type="button"
                  onClick={clearPhoto}
                  className="flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Remove
                </button>
              )}
            </div>
            <p className="mt-1 text-[11px] text-gray-400">JPG / PNG, max 2 MB</p>
          </div>
        </div>

        {/* Fields */}
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium">
            <User size={14} /> Name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border bg-transparent px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            placeholder="Your full name"
          />
        </div>

        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium">
            <Mail size={14} /> Email
          </label>
          <input
            value={user.email}
            disabled
            className="w-full cursor-not-allowed rounded-xl border bg-gray-50 px-3 py-2.5 text-sm text-gray-400 dark:bg-gray-800"
          />
        </div>

        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium">
            <Phone size={14} /> Phone
          </label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
            maxLength={10}
            inputMode="numeric"
            className="w-full rounded-xl border bg-transparent px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            placeholder="10-digit phone number"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-2.5 font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </form>

      {children}
    </div>
  )
}

export default PanelProfile
