'use client'

import React, { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import ButtonLoading from '@/components/Application/ButtonLoading'
import ImageUpload from '@/components/Application/Admin/ImageUpload'
import { showToast } from '@/lib/showToast'
import { ADMIN_SERVICE_LABOUR_SHOW } from '@/routes/ServiceRoute'

const empty = {
  title: '', labourName: '', photo: '', category: '', subCategory: '', shortDescription: '', description: '',
  price: '', experienceYears: '', avgDurationMins: '45', phone: '', city: 'Delhi NCR',
  whatsIncluded: [], process: [], badges: '', isVerified: true, hasWarranty: true, isActive: true, linkedLabourUser: '',
}
const Label = ({ children, req }) => <label className="mb-1 block text-sm font-medium">{children}{req && <span className="text-red-500"> *</span>}</label>
const selectCls = 'h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm'

/** mode: 'add' | 'edit' */
const ServiceLabourForm = ({ mode = 'add', id = null }) => {
  const router = useRouter()
  const isEdit = mode === 'edit'
  const [f, setF] = useState(empty)
  const [tree, setTree] = useState([])
  const [labours, setLabours] = useState([])
  const [loading, setLoading] = useState(false)
  const [inc, setInc] = useState('')
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }))

  useEffect(() => {
    axios.get('/api/service-category').then((r) => setTree(r.data?.data || [])).catch(() => {})
    axios.get('/api/admin/registered-labours', { params: { size: 500 } }).then((r) => setLabours(r.data?.data || [])).catch(() => {})
  }, [])

  useEffect(() => {
    if (!isEdit || !id) return
    axios.get(`/api/admin/service-listing/${id}`).then(({ data }) => {
      const d = data.data
      setF({ ...empty, ...d, category: d.category || '', subCategory: d.subCategory || '', linkedLabourUser: d.linkedLabourUser || '',
        badges: (d.badges || []).join(', '), price: d.price ?? '', experienceYears: d.experienceYears ?? '', avgDurationMins: d.avgDurationMins ?? '',
        process: d.process || [], whatsIncluded: d.whatsIncluded || [] })
    }).catch((e) => showToast('error', e?.response?.data?.message || 'Could not load'))
  }, [isEdit, id])

  const subOptions = useMemo(() => tree.find((c) => c._id === f.category)?.children || [], [tree, f.category])
  const addInc = () => { const v = inc.trim(); if (v) { set('whatsIncluded', [...f.whatsIncluded, v]); setInc('') } }
  const setStep = (i, k, v) => set('process', f.process.map((s, x) => (x === i ? { ...s, [k]: v } : s)))

  const submit = async (e) => {
    e.preventDefault()
    if (!f.category) return showToast('error', 'Please select a category.')
    setLoading(true)
    try {
      const payload = {
        title: f.title.trim(), labourName: f.labourName.trim(), photo: f.photo, category: f.category, subCategory: f.subCategory || null,
        shortDescription: f.shortDescription, description: f.description, price: Number(f.price),
        experienceYears: Number(f.experienceYears || 0), avgDurationMins: Number(f.avgDurationMins || 0), phone: f.phone, city: f.city,
        whatsIncluded: f.whatsIncluded, process: f.process.filter((s) => s.title?.trim()),
        badges: f.badges.split(',').map((b) => b.trim()).filter(Boolean),
        isVerified: f.isVerified, hasWarranty: f.hasWarranty, isActive: f.isActive, linkedLabourUser: f.linkedLabourUser || null,
      }
      const res = isEdit ? await axios.put(`/api/service-listing/${id}`, payload) : await axios.post('/api/service-listing', payload)
      if (!res.data.success) throw new Error(res.data.message)
      showToast('success', res.data.message)
      if (isEdit) router.push(ADMIN_SERVICE_LABOUR_SHOW); else setF(empty)
    } catch (err) { showToast('error', err?.response?.data?.message || err.message) }
    finally { setLoading(false) }
  }

  return (
    <Card className="py-0 rounded-3xl shadow-sm">
      <CardHeader className="pt-3 px-3 border-b [.border-b]:pb-2"><h4 className="text-xl font-semibold">{isEdit ? 'Edit Labour' : 'Add Labour'}</h4></CardHeader>
      <CardContent className="pb-5">
        <form onSubmit={submit} className="mt-5 grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2"><Label>Labour photo</Label><ImageUpload value={f.photo} onChange={(u) => set('photo', u)} /></div>

          <div><Label req>Category</Label>
            <select className={selectCls} value={f.category} onChange={(e) => { set('category', e.target.value); set('subCategory', '') }}>
              <option value="">Select category (Plumber, Electrician...)</option>{tree.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
            {!tree.length && <p className="mt-1 text-xs text-orange-500">Pehle Service Setup → Service Categories me category add karo.</p>}</div>
          <div><Label>Sub category</Label>
            <select className={selectCls} value={f.subCategory} onChange={(e) => set('subCategory', e.target.value)} disabled={!subOptions.length}>
              <option value="">{subOptions.length ? 'Select sub category (optional)' : 'No sub categories'}</option>{subOptions.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select></div>
          <div><Label req>Service title</Label><Input value={f.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. Plumbing Repair" required /></div>
          <div><Label req>Labour name</Label><Input value={f.labourName} onChange={(e) => set('labourName', e.target.value)} placeholder="e.g. Rakesh Kumar" required /></div>
          <div><Label req>Starting price (₹)</Label><Input type="number" min="1" value={f.price} onChange={(e) => set('price', e.target.value)} required /></div>
          <div><Label>Experience (years)</Label><Input type="number" min="0" value={f.experienceYears} onChange={(e) => set('experienceYears', e.target.value)} /></div>
          <div><Label>Avg. duration (mins)</Label><Input type="number" min="0" value={f.avgDurationMins} onChange={(e) => set('avgDurationMins', e.target.value)} /></div>
          <div><Label>Labour phone (10 digit)</Label><Input value={f.phone} onChange={(e) => set('phone', e.target.value.replace(/\D/g, '').slice(0, 10))} /></div>
          <div><Label>City</Label><Input value={f.city} onChange={(e) => set('city', e.target.value)} /></div>
          <div><Label>Badges (comma separated)</Label><Input value={f.badges} onChange={(e) => set('badges', e.target.value)} placeholder="Same-day service, 2+ years experience" /></div>

          <div className="md:col-span-2"><Label>Short description (card par dikhega)</Label><Input maxLength={200} value={f.shortDescription} onChange={(e) => set('shortDescription', e.target.value)} placeholder="Fix taps, leakages, pipes, flush tanks and more" /></div>
          <div className="md:col-span-2"><Label>Full description</Label><textarea rows={4} className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm" value={f.description} onChange={(e) => set('description', e.target.value)} /></div>

          <div className="md:col-span-2 rounded-2xl border p-4">
            <Label>What's included</Label>
            <div className="mb-2 flex flex-wrap gap-2">{f.whatsIncluded.map((w, i) => (
              <span key={i} className="flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-1 text-xs text-orange-700">{w}<button type="button" onClick={() => set('whatsIncluded', f.whatsIncluded.filter((_, x) => x !== i))}>×</button></span>))}</div>
            <div className="flex gap-2"><Input value={inc} onChange={(e) => setInc(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addInc() } }} placeholder="e.g. Leak detection and repair — Enter dabao" /><button type="button" onClick={addInc} className="rounded-lg border px-3 text-sm">Add</button></div>
          </div>

          <div className="md:col-span-2 rounded-2xl border p-4">
            <div className="mb-2 flex items-center justify-between"><Label>Service process (steps)</Label>
              <button type="button" onClick={() => set('process', [...f.process, { title: '', description: '' }])} className="rounded-lg border border-orange-400 px-3 py-1 text-sm text-orange-500">+ Add step</button></div>
            {f.process.map((s, i) => (
              <div key={i} className="mb-2 flex gap-2">
                <Input className="max-w-[220px]" placeholder="Step title" value={s.title} onChange={(e) => setStep(i, 'title', e.target.value)} />
                <Input placeholder="Description" value={s.description} onChange={(e) => setStep(i, 'description', e.target.value)} />
                <button type="button" onClick={() => set('process', f.process.filter((_, x) => x !== i))} className="rounded-lg border border-red-200 px-3 text-red-500">×</button>
              </div>))}
          </div>

          <div className="md:col-span-2"><Label>Link registered labour account (wallet / withdraw ke liye, optional)</Label>
            <select className={selectCls} value={f.linkedLabourUser} onChange={(e) => set('linkedLabourUser', e.target.value)}>
              <option value="">Not linked (sirf listing card)</option>
              {labours.map((l) => <option key={l.userId} value={l.userId}>{l.name} — {l.phone || l.email} ({l.category || 'profile incomplete'}, {l.status})</option>)}
            </select>
            <p className="mt-1 text-xs text-gray-500">Link karne par is card ki bookings ka paisa us labour ke wallet me jayega.</p></div>

          <div className="md:col-span-2 flex flex-wrap gap-6 text-sm">
            {[['isVerified', 'Verified'], ['hasWarranty', 'Service warranty'], ['isActive', 'Active (website par dikhao)']].map(([k, l]) => (
              <label key={k} className="flex items-center gap-2"><input type="checkbox" checked={f[k]} onChange={(e) => set(k, e.target.checked)} />{l}</label>))}
          </div>

          <div className="md:col-span-2"><ButtonLoading loading={loading} type="submit" text={isEdit ? 'Update Labour' : '+ Save Labour'} className="bg-[#fff0ea] cursor-pointer text-orange-400 font-mono hover:bg-orange-500 hover:text-white" /></div>
        </form>
      </CardContent>
    </Card>
  )
}
export default ServiceLabourForm
