'use client'

import { useState } from 'react'
import axios from 'axios'
import { useTheme } from 'next-themes'
import { Eye, EyeOff, Loader2, Lock, Monitor, Moon, Sun } from 'lucide-react'
import { showToast } from '@/lib/showToast'

const PasswordInput = ({ value, onChange, placeholder }) => {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border bg-transparent px-3 py-2.5 pe-10 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute inset-y-0 right-3 flex items-center text-gray-400"
        aria-label={show ? 'Hide password' : 'Show password'}
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  )
}

/** Settings page for admin + shop owner: theme + change password. */
const PanelSettings = () => {
  const { theme, setTheme } = useTheme()
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [saving, setSaving] = useState(false)

  const changePassword = async (e) => {
    e.preventDefault()
    if (!current || !next) return showToast('error', 'Please fill all password fields.')
    if (next.length < 8) return showToast('error', 'New password must be at least 8 characters.')
    if (next !== confirm) return showToast('error', 'New passwords do not match.')

    setSaving(true)
    try {
      const { data } = await axios.put('/api/panel/change-password', {
        currentPassword: current,
        newPassword: next,
      })
      if (!data?.success) throw new Error(data?.message)
      showToast('success', data.message)
      setCurrent('')
      setNext('')
      setConfirm('')
    } catch (err) {
      showToast('error', err?.response?.data?.message || err.message || 'Could not change password.')
    } finally {
      setSaving(false)
    }
  }

  const themes = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ]

  return (
    <div className="mx-auto max-w-xl space-y-6 py-6">
      <h1 className="text-xl font-semibold">Settings</h1>

      {/* Appearance */}
      <section className="rounded-2xl border bg-white p-6 shadow-sm dark:bg-card">
        <h2 className="mb-1 font-semibold">Appearance</h2>
        <p className="mb-4 text-sm text-gray-500">Choose how the dashboard looks.</p>
        <div className="grid grid-cols-3 gap-3">
          {themes.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setTheme(value)}
              className={`flex flex-col items-center gap-2 rounded-xl border py-3 text-sm transition ${
                theme === value
                  ? 'border-orange-500 bg-orange-50 text-orange-600 dark:bg-orange-500/10'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* Password */}
      <section className="rounded-2xl border bg-white p-6 shadow-sm dark:bg-card">
        <h2 className="mb-1 flex items-center gap-2 font-semibold">
          <Lock size={16} /> Change Password
        </h2>
        <p className="mb-4 text-sm text-gray-500">Use at least 8 characters.</p>
        <form onSubmit={changePassword} className="space-y-3">
          <PasswordInput value={current} onChange={setCurrent} placeholder="Current password" />
          <PasswordInput value={next} onChange={setNext} placeholder="New password" />
          <PasswordInput value={confirm} onChange={setConfirm} placeholder="Confirm new password" />
          <button
            type="submit"
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-2.5 font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
          >
            {saving && <Loader2 size={16} className="animate-spin" />}
            {saving ? 'Updating…' : 'Update Password'}
          </button>
        </form>
      </section>
    </div>
  )
}

export default PanelSettings
