'use client'
import { useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import slugify from 'slugify'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import ButtonLoading from '@/components/Application/ButtonLoading'
import ImageUpload from '@/components/Application/Admin/ImageUpload'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { showToast } from '@/lib/showToast'
import { ADMIN_DASHBOARD } from '@/routes/AdminPanelRoute'
import { ADMIN_SERVICE_CATEGORY } from '@/routes/ServiceRoute'

const ServiceCategories = () => {
  const [tree, setTree] = useState([])
  const [name, setName] = useState('')
  const [parent, setParent] = useState('')
  const [image, setImage] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(() => axios.get('/api/service-category').then((r) => setTree(r.data?.data || [])).catch(() => {}), [])
  useEffect(() => { load() }, [load])

  const add = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      const base = slugify(name, { lower: true, strict: true })
      const slug = parent ? `${base}-${slugify(tree.find((c) => c._id === parent)?.name || '', { lower: true, strict: true })}` : base
      const { data } = await axios.post('/api/service-category', { name: name.trim(), slug, parent: parent || null, image })
      if (!data.success) throw new Error(data.message)
      showToast('success', data.message); setName(''); setImage(''); load()
    } catch (err) { showToast('error', err?.response?.data?.message || err.message) } finally { setSaving(false) }
  }

  const del = async (c) => {
    if (!confirm(`Delete "${c.name}"${c.children?.length ? ' and its sub categories' : ''}?`)) return
    try { const { data } = await axios.delete(`/api/service-category/${c._id}`); if (!data.success) throw new Error(data.message); showToast('success', data.message); load() }
    catch (err) { showToast('error', err?.response?.data?.message || err.message) }
  }

  const Row = ({ c, sub }) => (
    <div className={`flex items-center justify-between rounded-lg border px-3 py-2 ${sub ? 'ml-8 bg-gray-50' : 'bg-white'}`}>
      <div className="flex items-center gap-3">
        {c.image && <img src={c.image} alt="" className="h-9 w-9 rounded object-cover" />}
        <span className={sub ? 'text-sm' : 'font-semibold'}>{sub && '└ '}{c.name}</span>
        {!sub && c.children?.length > 0 && <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-500">{c.children.length} sub</span>}
      </div>
      <button onClick={() => del(c)} className="rounded border border-red-200 px-2 py-1 text-xs text-red-500 hover:bg-red-50">Delete</button>
    </div>
  )

  return (
    <div>
      <BreadCrumb breadcrumbData={[{ href: ADMIN_DASHBOARD, label: 'Home' }, { href: ADMIN_SERVICE_CATEGORY, label: 'Service Categories' }]} />
      <div className="grid gap-5 py-4 lg:grid-cols-[380px_1fr]">
        <Card className="py-0 rounded-3xl shadow-sm h-fit">
          <CardHeader className="pt-3 px-3 border-b [.border-b]:pb-2"><h4 className="text-xl font-semibold">Add Category</h4></CardHeader>
          <CardContent className="pb-5 pt-4">
            <form onSubmit={add} className="space-y-4">
              <div><label className="mb-1 block text-sm font-medium">Category image</label><ImageUpload value={image} onChange={setImage} size={96} /></div>
              <div><label className="mb-1 block text-sm font-medium">Parent category</label>
                <select className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm" value={parent} onChange={(e) => setParent(e.target.value)}>
                  <option value="">None (Top-level: Plumber, Electrician...)</option>{tree.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select></div>
              <div><label className="mb-1 block text-sm font-medium">Name</label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder={parent ? 'e.g. Tap & Pipe Repair' : 'e.g. Plumbing'} required minLength={2} /></div>
              <ButtonLoading loading={saving} type="submit" text="+ Add Category" className="bg-[#fff0ea] text-orange-400 font-mono hover:bg-orange-500 hover:text-white" />
            </form>
          </CardContent>
        </Card>
        <Card className="py-0 rounded-3xl shadow-sm">
          <CardHeader className="pt-3 px-3 border-b [.border-b]:pb-2"><h4 className="text-xl font-semibold">All Service Categories</h4></CardHeader>
          <CardContent className="space-y-2 pb-5 pt-4">
            {!tree.length && <p className="text-sm text-gray-400">No categories yet.</p>}
            {tree.map((c) => (<div key={c._id} className="space-y-2"><Row c={c} />{c.children?.map((s) => <Row key={s._id} c={s} sub />)}</div>))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
export default ServiceCategories
