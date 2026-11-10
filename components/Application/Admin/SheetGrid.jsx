'use client'
// Google-Sheets style editable grid used by Vendor List + Logistic Partners.
// Config (columns, options, api) comes from lib/partnerSheets.js.
//
// Editing:  click a cell to select · double-click / Enter / just start typing to edit
//           Enter = save + move down · Tab = save + move right · Esc = cancel
//           Delete = clear cell · Ctrl+C / Ctrl+V (multi-cell paste from Excel/Sheets)
//           Ctrl+Z / Ctrl+Y undo / redo. Every change is saved to the server automatically.
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import axios from 'axios'
import {
  Undo2, Redo2, Printer, ListFilter, Filter, ChevronDown, ChevronRight, Plus, Download, Upload, Search, MapPin,
  Star, Trash2, X, Columns3, Layers, FileSpreadsheet, FileText, Check, Loader2, CircleCheck, CircleAlert,
  ExternalLink, ArrowDownAZ, ArrowUpAZ,
} from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { showToast } from '@/lib/showToast'
import { CHIP_COLORS, STATUS_COLORS, coerceValue } from '@/lib/partnerSheets'

/* ───────────────────────── helpers ───────────────────────── */
const GUTTER = 64
const isBlank = (v) => v === null || v === undefined || v === ''
const same = (a, b) => (isBlank(a) && isBlank(b)) || String(a) === String(b)
const blankOf = (col) => (['number', 'percent', 'rating', 'date'].includes(col.type) ? null : '')
const colLetter = (i) => {
  let s = ''
  i += 1
  while (i > 0) { const m = (i - 1) % 26; s = String.fromCharCode(65 + m) + s; i = Math.floor((i - 1) / 26) }
  return s
}
const fmtDate = (v) => {
  if (isBlank(v)) return ''
  const d = new Date(v)
  return isNaN(d) ? '' : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' })
}
const isoDay = (v) => {
  if (isBlank(v)) return ''
  const d = new Date(v)
  return isNaN(d) ? '' : d.toISOString().slice(0, 10)
}
// what a human sees / what search + copy use
const fmt = (col, v) => {
  if (isBlank(v)) return ''
  if (col.type === 'date') return fmtDate(v)
  if (col.type === 'percent') return `${v}%`
  return String(v)
}
// what goes into the text editor / export file
const rawText = (col, v) => (isBlank(v) ? '' : col.type === 'date' ? isoDay(v) : String(v))
const coerceClient = (col, raw) => {
  const r = coerceValue(col, raw)
  if (r.ok && r.value instanceof Date) r.value = r.value.toISOString()
  return r
}
const hash = (s) => [...String(s)].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7)
const chipClass = (col, v) => {
  const i = col.options ? col.options.indexOf(v) : -1
  return CHIP_COLORS[(i >= 0 ? i : hash(v)) % CHIP_COLORS.length]
}
const filterActive = (f) =>
  !!f && (Array.isArray(f.values) || !!f.text || !isBlank(f.min) || !isBlank(f.max) || !!f.from || !!f.to)
const passFilter = (col, v, f) => {
  if (Array.isArray(f.values)) return f.values.includes(isBlank(v) ? '' : String(v))
  if (f.text) return fmt(col, v).toLowerCase().includes(f.text.toLowerCase())
  if (!isBlank(f.min) || !isBlank(f.max)) {
    if (isBlank(v)) return false
    if (!isBlank(f.min) && Number(v) < Number(f.min)) return false
    if (!isBlank(f.max) && Number(v) > Number(f.max)) return false
    return true
  }
  if (f.from || f.to) {
    const d = isoDay(v)
    if (!d) return false
    if (f.from && d < f.from) return false
    if (f.to && d > f.to) return false
  }
  return true
}
const compare = (col, a, b) => {
  if (isBlank(a) && isBlank(b)) return 0
  if (isBlank(a)) return 1
  if (isBlank(b)) return -1
  if (['number', 'percent', 'rating'].includes(col.type)) return Number(a) - Number(b)
  if (col.type === 'date') return String(isoDay(a)).localeCompare(isoDay(b))
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' })
}
const csvEscape = (v) => {
  const s = v === null || v === undefined ? '' : String(v)
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}
function parseCSV(text) {
  text = text.replace(/^﻿/, '')
  const rows = []
  let row = [], cur = '', q = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (q) {
      if (c === '"') { if (text[i + 1] === '"') { cur += '"'; i++ } else q = false }
      else cur += c
    } else if (c === '"') q = true
    else if (c === ',') { row.push(cur); cur = '' }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++
      row.push(cur); rows.push(row); row = []; cur = ''
    } else cur += c
  }
  if (cur !== '' || row.length) { row.push(cur); rows.push(row) }
  return rows
}
const download = (blob, name) => {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = name
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(a.href), 1000)
}
const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '')
const errMsg = (e) => e?.response?.data?.message || e?.message || 'Something went wrong'
const loadPrefs = (key) => { try { return JSON.parse(localStorage.getItem(key) || '{}') } catch { return {} } }
const savePrefs = (key, v) => { try { localStorage.setItem(key, JSON.stringify(v)) } catch { /* private mode */ } }

/* ───────────────────────── cell display ───────────────────────── */
function Logo({ row, name }) {
  const [broken, setBroken] = useState(false)
  if (row.logo && !broken) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={row.logo} alt="" onError={() => setBroken(true)} className="h-6 w-10 shrink-0 object-contain" />
  }
  const initials = (name || '?').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '?'
  return (
    <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${CHIP_COLORS[hash(name || '') % CHIP_COLORS.length]}`}>
      {initials}
    </span>
  )
}

function CellView({ col, row, onOpen }) {
  const v = row[col.key]
  switch (col.type) {
    case 'code':
      return <span className="font-mono text-xs text-gray-500">{v}</span>
    case 'status':
      return (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onOpen() }}
          className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[v] || 'bg-gray-100 text-gray-600'}`}
        >
          {v || '—'} <ChevronDown className="h-3 w-3" />
        </button>
      )
    case 'select':
      if (isBlank(v)) return null
      return col.chip
        ? <span className={`truncate rounded-md px-2 py-0.5 text-xs ${chipClass(col, v)}`}>{v}</span>
        : <span className="truncate">{v}</span>
    case 'rating':
      if (isBlank(v)) return <span className="text-gray-300">—</span>
      return <span className="inline-flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />{Number(v).toFixed(1)}</span>
    case 'url':
      if (isBlank(v)) return null
      return (
        <span className="flex min-w-0 items-center gap-1">
          <span className="truncate text-blue-600 dark:text-blue-400">{v}</span>
          {/^https?:\/\//i.test(v) && (
            <a href={v} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="shrink-0 text-gray-400 hover:text-blue-600">
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </span>
      )
    case 'date':
      return isBlank(v) ? <span className="text-gray-300">—</span> : <span>{fmtDate(v)}</span>
    default:
      if (col.logo) {
        return (
          <span className="flex min-w-0 items-center gap-2">
            <Logo row={row} name={v} />
            <span className={`truncate ${isBlank(v) ? 'italic text-gray-400' : 'font-medium'}`}>{v || 'Untitled'}</span>
          </span>
        )
      }
      return <span className="truncate">{fmt(col, v)}</span>
  }
}

/* ───────────────────────── editors ───────────────────────── */
function useCommitOnce(onCommit, onCancel) {
  const done = useRef(false)
  return {
    commit: (v, move) => { if (done.current) return; done.current = true; onCommit(v, move) },
    cancel: () => { if (done.current) return; done.current = true; onCancel() },
  }
}

function TextEditor({ col, initial, onCommit, onCancel }) {
  const [draft, setDraft] = useState(initial)
  const { commit, cancel } = useCommitOnce(onCommit, onCancel)
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.focus()
    if (el.type === 'text') { const n = el.value.length; try { el.setSelectionRange(n, n) } catch { /* ignore */ } }
  }, [col.type])
  return (
    <input
      ref={ref}
      type={col.type === 'date' ? 'date' : ['number', 'percent', 'rating'].includes(col.type) ? 'number' : 'text'}
      step="any"
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') { e.preventDefault(); commit(draft, 'down') }
        else if (e.key === 'Tab') { e.preventDefault(); commit(draft, e.shiftKey ? 'left' : 'right') }
        else if (e.key === 'Escape') { e.preventDefault(); cancel() }
        e.stopPropagation()
      }}
      onBlur={() => commit(draft)}
      className="absolute inset-0 z-20 w-full min-w-full rounded-none border-2 border-emerald-600 bg-white px-2 text-sm outline-none dark:bg-stone-800"
    />
  )
}

function OptionEditor({ col, current, initial, onCommit, onCancel }) {
  const [draft, setDraft] = useState(initial)
  const { commit, cancel } = useCommitOnce(onCommit, onCancel)
  const inputRef = useRef(null)
  const [rect, setRect] = useState(null)
  const filtered = useMemo(() => {
    const q = draft.trim().toLowerCase()
    return q ? col.options.filter((o) => o.toLowerCase().includes(q)) : col.options
  }, [draft, col.options])
  const [hi, setHi] = useState(() => Math.max(0, col.options.indexOf(current)))
  useEffect(() => { if (draft) setHi(0) }, [draft])
  useLayoutEffect(() => {
    inputRef.current?.focus()
    const r = inputRef.current?.getBoundingClientRect()
    if (r) setRect(r)
  }, [])

  // Enter/Tab: exact match > highlighted suggestion > custom text (non-strict) > keep current value
  const finish = (move) => {
    const t = draft.trim()
    const exact = col.options.find((o) => o.toLowerCase() === t.toLowerCase())
    if (exact) return commit(exact, move)
    if (filtered[hi]) return commit(filtered[hi], move)
    if (t && !col.strict) return commit(t, move)
    commit(current, move)
  }

  const below = rect ? window.innerHeight - rect.bottom > 240 : true
  return (
    <>
      <input
        ref={inputRef}
        value={draft}
        placeholder={current || 'Type or pick…'}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          e.stopPropagation()
          if (e.key === 'ArrowDown') { e.preventDefault(); setHi((h) => Math.min(filtered.length - 1, h + 1)) }
          else if (e.key === 'ArrowUp') { e.preventDefault(); setHi((h) => Math.max(0, h - 1)) }
          else if (e.key === 'Enter') { e.preventDefault(); finish('down') }
          else if (e.key === 'Tab') { e.preventDefault(); finish(e.shiftKey ? 'left' : 'right') }
          else if (e.key === 'Escape') { e.preventDefault(); cancel() }
        }}
        onBlur={() => {
          const t = draft.trim()
          if (!t) return cancel()
          const exact = col.options.find((o) => o.toLowerCase() === t.toLowerCase())
          if (exact) return commit(exact)
          if (!col.strict) return commit(t)
          cancel()
        }}
        className="absolute inset-0 z-20 w-full min-w-full rounded-none border-2 border-emerald-600 bg-white px-2 text-sm outline-none dark:bg-stone-800"
      />
      {rect && createPortal(
        <div
          style={{
            position: 'fixed', left: rect.left, width: Math.max(rect.width, 200),
            ...(below ? { top: rect.bottom + 2 } : { bottom: window.innerHeight - rect.top + 2 }),
          }}
          className="z-[100] max-h-60 overflow-auto rounded-md border bg-white py-1 text-sm shadow-lg dark:bg-stone-800"
        >
          {filtered.map((o, i) => (
            <div
              key={o}
              onMouseDown={(e) => { e.preventDefault(); commit(o) }}
              onMouseEnter={() => setHi(i)}
              className={`flex cursor-pointer items-center justify-between px-3 py-1.5 ${i === hi ? 'bg-emerald-50 dark:bg-emerald-900/30' : ''}`}
            >
              <span className={col.type === 'status' ? `rounded px-2 py-0.5 text-xs ${STATUS_COLORS[o] || ''}` : col.chip ? `rounded px-2 py-0.5 text-xs ${chipClass(col, o)}` : ''}>{o}</span>
              {o === current && <Check className="h-3.5 w-3.5 text-emerald-600" />}
            </div>
          ))}
          {!col.strict && draft.trim() && !col.options.some((o) => o.toLowerCase() === draft.trim().toLowerCase()) && (
            <div onMouseDown={(e) => { e.preventDefault(); commit(draft) }} className="cursor-pointer border-t px-3 py-1.5 text-gray-600 hover:bg-gray-50 dark:text-gray-300">
              Use “{draft.trim()}”
            </div>
          )}
          {!filtered.length && col.strict && <div className="px-3 py-1.5 text-gray-400">No match</div>}
        </div>,
        document.body,
      )}
    </>
  )
}

/* ───────────────────────── column filter popover ───────────────────────── */
function ColumnFilter({ col, rows, filter, onChange, sort, onSort }) {
  const active = filterActive(filter)
  const [q, setQ] = useState('')
  const isList = col.type === 'select' || col.type === 'status'
  const distinct = useMemo(() => {
    if (!isList) return []
    const m = new Map()
    rows.forEach((r) => { const v = isBlank(r[col.key]) ? '' : String(r[col.key]); m.set(v, (m.get(v) || 0) + 1) })
    return [...m.entries()].sort((a, b) => (a[0] === '' ? 1 : b[0] === '' ? -1 : a[0].localeCompare(b[0])))
  }, [rows, col.key, isList])
  const allVals = distinct.map(([v]) => v)
  const checked = filter?.values ?? allVals
  const toggle = (v) => {
    const next = checked.includes(v) ? checked.filter((x) => x !== v) : [...checked, v]
    onChange(next.length === allVals.length ? null : { values: next })
  }
  const numeric = ['number', 'percent', 'rating'].includes(col.type)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          className={`rounded p-0.5 ${active ? 'bg-emerald-600 text-white' : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-stone-700'}`}
          title="Filter & sort"
        >
          <ListFilter className="h-3.5 w-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-3 text-sm" onClick={(e) => e.stopPropagation()}>
        <p className="mb-2 font-semibold">{col.label}</p>
        <div className="mb-3 flex gap-2">
          <button type="button" onClick={() => onSort(sort?.key === col.key && sort.dir === 'asc' ? null : { key: col.key, dir: 'asc' })}
            className={`flex flex-1 items-center justify-center gap-1 rounded border px-2 py-1 text-xs ${sort?.key === col.key && sort.dir === 'asc' ? 'border-emerald-600 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30' : ''}`}>
            <ArrowDownAZ className="h-3.5 w-3.5" /> Sort A→Z
          </button>
          <button type="button" onClick={() => onSort(sort?.key === col.key && sort.dir === 'desc' ? null : { key: col.key, dir: 'desc' })}
            className={`flex flex-1 items-center justify-center gap-1 rounded border px-2 py-1 text-xs ${sort?.key === col.key && sort.dir === 'desc' ? 'border-emerald-600 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30' : ''}`}>
            <ArrowUpAZ className="h-3.5 w-3.5" /> Sort Z→A
          </button>
        </div>

        {isList ? (
          <>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search values" className="mb-2 w-full rounded border px-2 py-1 text-xs outline-none focus:border-emerald-600 dark:bg-stone-800" />
            <div className="mb-2 flex justify-between text-xs">
              <button type="button" className="text-emerald-700 hover:underline" onClick={() => onChange(null)}>Select all</button>
              <button type="button" className="text-emerald-700 hover:underline" onClick={() => onChange({ values: [] })}>Clear</button>
            </div>
            <div className="max-h-52 space-y-1 overflow-auto">
              {distinct.filter(([v]) => (v || '(Blanks)').toLowerCase().includes(q.toLowerCase())).map(([v, n]) => (
                <label key={v || '__blank'} className="flex cursor-pointer items-center gap-2 rounded px-1 py-0.5 hover:bg-gray-50 dark:hover:bg-stone-800">
                  <input type="checkbox" checked={checked.includes(v)} onChange={() => toggle(v)} className="accent-emerald-600" />
                  <span className="flex-1 truncate">{v || <em className="text-gray-400">(Blanks)</em>}</span>
                  <span className="text-xs text-gray-400">{n}</span>
                </label>
              ))}
            </div>
          </>
        ) : numeric ? (
          <div className="flex gap-2">
            <input type="number" placeholder="Min" value={filter?.min ?? ''} onChange={(e) => onChange({ ...filter, min: e.target.value })} className="w-full rounded border px-2 py-1 text-xs dark:bg-stone-800" />
            <input type="number" placeholder="Max" value={filter?.max ?? ''} onChange={(e) => onChange({ ...filter, max: e.target.value })} className="w-full rounded border px-2 py-1 text-xs dark:bg-stone-800" />
          </div>
        ) : col.type === 'date' ? (
          <div className="space-y-2 text-xs">
            <label className="flex items-center gap-2">From <input type="date" value={filter?.from ?? ''} onChange={(e) => onChange({ ...filter, from: e.target.value })} className="flex-1 rounded border px-2 py-1 dark:bg-stone-800" /></label>
            <label className="flex items-center gap-2">To&nbsp;&nbsp;&nbsp; <input type="date" value={filter?.to ?? ''} onChange={(e) => onChange({ ...filter, to: e.target.value })} className="flex-1 rounded border px-2 py-1 dark:bg-stone-800" /></label>
          </div>
        ) : (
          <input autoFocus placeholder="Contains…" value={filter?.text ?? ''} onChange={(e) => onChange(e.target.value ? { text: e.target.value } : null)} className="w-full rounded border px-2 py-1 text-xs outline-none focus:border-emerald-600 dark:bg-stone-800" />
        )}

        {active && (
          <button type="button" onClick={() => onChange(null)} className="mt-3 w-full rounded border border-red-200 py-1 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
            Clear filter
          </button>
        )}
      </PopoverContent>
    </Popover>
  )
}

/* ───────────────────────── bulk value input ───────────────────────── */
function BulkValueInput({ col, value, onChange }) {
  const cls = 'h-8 rounded-md border bg-white px-2 text-sm outline-none focus:border-emerald-600 dark:bg-stone-800'
  if (!col) return null
  if (col.type === 'status') {
    return (
      <select value={value} onChange={(e) => onChange(e.target.value)} className={cls}>
        <option value="">Choose…</option>
        {col.options.map((o) => <option key={o}>{o}</option>)}
      </select>
    )
  }
  if (col.type === 'select') {
    return (
      <>
        <input list={`bulk-${col.key}`} value={value} onChange={(e) => onChange(e.target.value)} placeholder="Value" className={`${cls} w-44`} />
        <datalist id={`bulk-${col.key}`}>{col.options.map((o) => <option key={o} value={o} />)}</datalist>
      </>
    )
  }
  const type = col.type === 'date' ? 'date' : ['number', 'percent', 'rating'].includes(col.type) ? 'number' : 'text'
  return <input type={type} step="any" value={value} onChange={(e) => onChange(e.target.value)} placeholder="Value (blank = clear)" className={`${cls} w-48`} />
}

/* ═════════════════════════ main grid ═════════════════════════ */
export default function SheetGrid({ sheet }) {
  const prefsKey = `sheetgrid:${sheet.key}`
  const allCols = sheet.columns
  const colMap = useMemo(() => Object.fromEntries(allCols.map((c) => [c.key, c])), [allCols])
  const editableCols = useMemo(() => allCols.filter((c) => c.type !== 'code'), [allCols])
  const viewCol = colMap[sheet.viewField]

  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [statusTab, setStatusTab] = useState('all')
  const [viewTab, setViewTab] = useState('all')
  const [search, setSearch] = useState('')
  const [region, setRegion] = useState('')
  const [colFilters, setColFilters] = useState({})
  const [sort, setSort] = useState(null)
  const [groupBy, setGroupBy] = useState('')
  const [collapsed, setCollapsed] = useState(() => new Set())
  const [hidden, setHidden] = useState(() => new Set(allCols.filter((c) => c.hidden).map((c) => c.key)))
  const [extraViews, setExtraViews] = useState([])
  const [zoom, setZoom] = useState(100)
  const [selected, setSelected] = useState(() => new Set())
  const [active, setActive] = useState(null) // { id, key }
  const [editing, setEditing] = useState(null) // { id, key, initial }
  const [saveState, setSaveState] = useState('idle') // idle | saving | saved | error
  const [limit, setLimit] = useState(300)
  const [bulkKey, setBulkKey] = useState('')
  const [bulkValue, setBulkValue] = useState('')
  const [, force] = useState(0)

  const undoStack = useRef([])
  const redoStack = useRef([])
  const pending = useRef(0)
  const gridRef = useRef(null)
  const fileRef = useRef(null)
  const lastClick = useRef(null)

  /* prefs (column visibility, zoom, custom bottom tabs) per browser */
  useEffect(() => {
    const p = loadPrefs(prefsKey)
    if (Array.isArray(p.hidden)) setHidden(new Set(p.hidden.filter((k) => colMap[k])))
    if (p.zoom) setZoom(p.zoom)
    if (Array.isArray(p.extraViews)) setExtraViews(p.extraViews)
  }, [prefsKey, colMap])
  const persist = (patch) => savePrefs(prefsKey, { ...loadPrefs(prefsKey), ...patch })

  /* load */
  const load = useCallback(async () => {
    setLoading(true)
    setLoadError('')
    try {
      const { data } = await axios.get(sheet.api)
      if (!data.success) throw new Error(data.message)
      setRows(data.data || [])
    } catch (e) {
      setLoadError(errMsg(e))
    } finally {
      setLoading(false)
    }
  }, [sheet.api])
  useEffect(() => { load() }, [load])

  const api = useCallback(async (method, body) => {
    const { data } = await axios({ method, url: sheet.api, data: body })
    if (!data.success) throw new Error(data.message || 'Request failed')
    return data
  }, [sheet.api])

  // wraps every server write for the "Saving… / All changes saved" indicator
  const track = useCallback(async (fn) => {
    pending.current += 1
    setSaveState('saving')
    try {
      const r = await fn()
      pending.current -= 1
      if (pending.current === 0) setSaveState('saved')
      return r
    } catch (e) {
      pending.current -= 1
      setSaveState('error')
      throw e
    }
  }, [])

  /* ── write operations ── */
  const applyLocal = (changes, field) =>
    setRows((prev) => prev.map((r) => {
      const cs = changes.filter((c) => c.id === r._id)
      if (!cs.length) return r
      const n = { ...r }
      cs.forEach((c) => { n[c.key] = c[field] })
      return n
    }))

  // changes: [{ id, key, before, after }]
  const commitChanges = useCallback(async (changes, { history = true } = {}) => {
    const real = changes.filter((c) => !same(c.before, c.after))
    if (!real.length) return
    applyLocal(real, 'after')
    if (history) { undoStack.current.push({ type: 'edit', changes: real }); redoStack.current = []; force((x) => x + 1) }

    // group into as few PATCH calls as possible (bulk edits become one request)
    const perRow = new Map()
    real.forEach((c) => { perRow.set(c.id, { ...(perRow.get(c.id) || {}), [c.key]: c.after }) })
    const groups = new Map()
    perRow.forEach((updates, id) => {
      const k = JSON.stringify(updates)
      groups.set(k, { updates, ids: [...(groups.get(k)?.ids || []), id] })
    })
    try {
      await track(() => Promise.all([...groups.values()].map((g) => api('patch', g))))
    } catch (e) {
      applyLocal(real, 'before')
      showToast('error', `Not saved: ${errMsg(e)}`)
    }
  }, [api, track])

  const deleteRows = useCallback(async (ids, { history = true } = {}) => {
    if (!ids.length) return
    const removed = new Set(ids)
    setRows((prev) => prev.filter((r) => !removed.has(r._id)))
    setSelected((s) => new Set([...s].filter((id) => !removed.has(id))))
    try {
      await track(() => api('delete', { ids }))
      if (history) { undoStack.current.push({ type: 'delete', ids }); redoStack.current = []; force((x) => x + 1) }
      if (history) showToast('success', `${ids.length} row(s) deleted — Ctrl+Z to undo`)
    } catch (e) {
      showToast('error', errMsg(e))
      load()
    }
  }, [api, track, load])

  const restoreRows = useCallback(async (ids) => {
    try {
      const { data } = await track(() => api('patch', { ids, restore: true }))
      setRows((prev) => {
        const have = new Set(prev.map((r) => r._id))
        return [...prev, ...data.filter((r) => !have.has(r._id))].sort((a, b) => a.seq - b.seq)
      })
    } catch (e) { showToast('error', errMsg(e)) }
  }, [api, track])

  const createRows = useCallback(async (list) => {
    const { data, message } = await track(() => api('post', { rows: list }))
    setRows((prev) => [...prev, ...data])
    undoStack.current.push({ type: 'add', ids: data.map((r) => r._id) })
    redoStack.current = []
    force((x) => x + 1)
    return { data, message }
  }, [api, track])

  const undo = useCallback(async () => {
    const op = undoStack.current.pop()
    if (!op) return
    redoStack.current.push(op)
    force((x) => x + 1)
    if (op.type === 'edit') await commitChanges(op.changes.map((c) => ({ ...c, before: c.after, after: c.before })), { history: false })
    else if (op.type === 'delete') await restoreRows(op.ids)
    else if (op.type === 'add') await deleteRows(op.ids, { history: false })
  }, [commitChanges, restoreRows, deleteRows])

  const redo = useCallback(async () => {
    const op = redoStack.current.pop()
    if (!op) return
    undoStack.current.push(op)
    force((x) => x + 1)
    if (op.type === 'edit') await commitChanges(op.changes, { history: false })
    else if (op.type === 'delete') await deleteRows(op.ids, { history: false })
    else if (op.type === 'add') await restoreRows(op.ids)
  }, [commitChanges, restoreRows, deleteRows])

  /* ── derived data ── */
  const visibleCols = useMemo(() => allCols.filter((c) => !hidden.has(c.key)), [allCols, hidden])

  const counts = useMemo(() => {
    const c = { all: rows.length, Active: 0, Onboarding: 0, Inactive: 0 }
    rows.forEach((r) => { if (c[r.status] !== undefined) c[r.status] += 1 })
    return c
  }, [rows])

  const regions = useMemo(() => {
    const set = new Map()
    rows.forEach((r) => sheet.regionFields.forEach((f) =>
      String(r[f] || '').split(/[,/;|]/).map((s) => s.trim()).filter(Boolean).forEach((t) => set.set(t.toLowerCase(), t))))
    return [...set.values()].sort((a, b) => a.localeCompare(b))
  }, [rows, sheet.regionFields])

  // rows after tab/region/search (used for column-filter value lists)
  const baseRows = useMemo(() => {
    const q = search.trim().toLowerCase()
    const reg = region.toLowerCase()
    return rows.filter((r) => {
      if (statusTab !== 'all' && r.status !== statusTab) return false
      if (viewTab !== 'all' && r[sheet.viewField] !== viewTab) return false
      if (reg && !sheet.regionFields.some((f) => String(r[f] || '').toLowerCase().includes(reg))) return false
      if (q && !allCols.some((c) => fmt(c, r[c.key]).toLowerCase().includes(q))) return false
      return true
    })
  }, [rows, statusTab, viewTab, region, search, allCols, sheet.viewField, sheet.regionFields])

  const filteredRows = useMemo(() => {
    const fs = Object.entries(colFilters).filter(([, f]) => filterActive(f))
    let out = fs.length ? baseRows.filter((r) => fs.every(([k, f]) => passFilter(colMap[k], r[k], f))) : baseRows
    if (sort && colMap[sort.key]) {
      const col = colMap[sort.key]
      out = [...out].sort((a, b) => {
        const c = compare(col, a[sort.key], b[sort.key])
        return isBlank(a[sort.key]) || isBlank(b[sort.key]) ? c : sort.dir === 'asc' ? c : -c
      })
    }
    return out
  }, [baseRows, colFilters, sort, colMap])

  // display items: group headers + rows; navRows = rows the keyboard can move through
  const { items, navRows } = useMemo(() => {
    const limited = filteredRows.slice(0, limit)
    if (!groupBy || !colMap[groupBy]) return { items: limited.map((r) => ({ type: 'row', row: r })), navRows: limited }
    const col = colMap[groupBy]
    const m = new Map()
    limited.forEach((r) => { const k = fmt(col, r[groupBy]); if (!m.has(k)) m.set(k, []); m.get(k).push(r) })
    const keys = [...m.keys()].sort((a, b) => {
      if (a === '') return 1
      if (b === '') return -1
      const ia = col.options?.indexOf(a) ?? -1, ib = col.options?.indexOf(b) ?? -1
      if (ia >= 0 && ib >= 0) return ia - ib
      return a.localeCompare(b, undefined, { numeric: true })
    })
    const its = [], nav = []
    keys.forEach((k) => {
      its.push({ type: 'group', key: k, count: m.get(k).length })
      if (!collapsed.has(k)) m.get(k).forEach((r) => { its.push({ type: 'row', row: r }); nav.push(r) })
    })
    return { items: its, navRows: nav }
  }, [filteredRows, limit, groupBy, colMap, collapsed])

  const rowNo = useMemo(() => new Map(filteredRows.map((r, i) => [r._id, i + 2])), [filteredRows])
  const rowsById = useMemo(() => Object.fromEntries(rows.map((r) => [r._id, r])), [rows])
  const activeFilterCount = Object.values(colFilters).filter(filterActive).length + (region ? 1 : 0) + (search ? 1 : 0)

  // sticky (frozen) columns: everything up to and including the name column (if it is near the left)
  const stickyLeft = useMemo(() => {
    const idx = visibleCols.findIndex((c) => c.key === sheet.nameField)
    const map = {}
    if (idx < 0 || idx > 2) return map
    let left = GUTTER
    for (let i = 0; i <= idx; i++) { map[visibleCols[i].key] = left; left += visibleCols[i].width }
    return map
  }, [visibleCols, sheet.nameField])

  /* ── navigation / editing ── */
  const focusGrid = () => gridRef.current?.focus({ preventScroll: true })

  const move = useCallback((dir, from) => {
    const cur = from || active
    if (!cur) return
    let ri = navRows.findIndex((r) => r._id === cur.id)
    let ci = visibleCols.findIndex((c) => c.key === cur.key)
    if (ri < 0 || ci < 0) return
    if (dir === 'down') ri = Math.min(navRows.length - 1, ri + 1)
    if (dir === 'up') ri = Math.max(0, ri - 1)
    if (dir === 'right') { if (ci < visibleCols.length - 1) ci += 1; else if (ri < navRows.length - 1) { ci = 0; ri += 1 } }
    if (dir === 'left') { if (ci > 0) ci -= 1; else if (ri > 0) { ci = visibleCols.length - 1; ri -= 1 } }
    setActive({ id: navRows[ri]._id, key: visibleCols[ci].key })
  }, [active, navRows, visibleCols])

  useEffect(() => {
    if (!active) return
    const el = gridRef.current?.querySelector(`[data-cell="${active.id}:${active.key}"]`)
    el?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  }, [active])

  const startEdit = (id, key, initial) => {
    const col = colMap[key]
    if (!col || col.type === 'code' || !rowsById[id]) return
    const isOpt = col.type === 'select' || col.type === 'status'
    setActive({ id, key })
    setEditing({ id, key, initial: initial ?? (isOpt ? '' : rawText(col, rowsById[id][key])) })
  }

  const finishEdit = (value, dir) => {
    const ed = editing
    setEditing(null)
    if (!ed) return
    const col = colMap[ed.key]
    const row = rowsById[ed.id]
    if (row) {
      const r = coerceClient(col, value)
      if (!r.ok) showToast('error', r.error)
      else commitChanges([{ id: ed.id, key: ed.key, before: row[ed.key] ?? blankOf(col), after: r.value }])
    }
    if (dir) move(dir, ed)
    setTimeout(focusGrid, 0)
  }
  const cancelEdit = () => { setEditing(null); setTimeout(focusGrid, 0) }

  const onGridKeyDown = (e) => {
    // ignore keys typed into inputs (filter popovers, checkboxes) — React bubbles portal events here too
    if (editing || e.target !== e.currentTarget) return
    const mod = e.ctrlKey || e.metaKey
    if (mod && e.key.toLowerCase() === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); return }
    if (mod && e.key.toLowerCase() === 'y') { e.preventDefault(); redo(); return }
    if (!active) return
    const col = colMap[active.key]
    const row = rowsById[active.id]
    if (!row) return
    if (mod && e.key.toLowerCase() === 'c') {
      e.preventDefault()
      navigator.clipboard?.writeText(rawText(col, row[active.key])).catch(() => {})
      return
    }
    const arrows = { ArrowDown: 'down', ArrowUp: 'up', ArrowLeft: 'left', ArrowRight: 'right' }
    if (arrows[e.key]) { e.preventDefault(); move(arrows[e.key]); return }
    if (e.key === 'Tab') { e.preventDefault(); move(e.shiftKey ? 'left' : 'right'); return }
    if (e.key === 'Enter' || e.key === 'F2') { e.preventDefault(); startEdit(active.id, active.key); return }
    if (e.key === 'Escape') { setActive(null); return }
    if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault()
      if (col.type === 'code' || col.type === 'status') return
      const r = coerceClient(col, '')
      if (r.ok) commitChanges([{ id: row._id, key: col.key, before: row[col.key] ?? blankOf(col), after: r.value }])
      return
    }
    if (!mod && !e.altKey && e.key.length === 1 && col.type !== 'code' && col.type !== 'date') {
      e.preventDefault()
      startEdit(active.id, active.key, e.key)
    }
  }

  // paste a block (tab/newline separated, e.g. copied from Excel / Google Sheets) starting at the active cell
  const onPaste = (e) => {
    if (editing || !active || e.target !== e.currentTarget) return
    const text = e.clipboardData?.getData('text/plain')
    if (!text) return
    e.preventDefault()
    const lines = text.replace(/\r/g, '').split('\n')
    if (lines.length > 1 && lines[lines.length - 1] === '') lines.pop()
    const r0 = navRows.findIndex((r) => r._id === active.id)
    const c0 = visibleCols.findIndex((c) => c.key === active.key)
    const changes = [], errors = []
    lines.forEach((line, i) => {
      const row = navRows[r0 + i]
      if (!row) return
      line.split('\t').forEach((val, j) => {
        const col = visibleCols[c0 + j]
        if (!col || col.type === 'code') return
        const r = coerceClient(col, val)
        if (!r.ok) errors.push(r.error)
        else changes.push({ id: row._id, key: col.key, before: row[col.key] ?? blankOf(col), after: r.value })
      })
    })
    if (errors.length) showToast('warning', `${errors.length} cell(s) skipped: ${errors[0]}`)
    commitChanges(changes)
  }

  const onCellMouseDown = (id, key) => {
    const now = Date.now()
    const prev = lastClick.current
    lastClick.current = { id, key, t: now }
    if (editing) {
      // clicking inside the open editor: ignore. clicking elsewhere: select it, the editor's blur saves.
      if (editing.id !== id || editing.key !== key) setActive({ id, key })
      return
    }
    setActive({ id, key })
    if (prev && prev.id === id && prev.key === key && now - prev.t < 400) startEdit(id, key)
  }

  /* ── selection ── */
  const allVisibleSelected = filteredRows.length > 0 && filteredRows.every((r) => selected.has(r._id))
  const toggleAll = () => setSelected(allVisibleSelected ? new Set() : new Set(filteredRows.map((r) => r._id)))
  const toggleRow = (id) => setSelected((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })

  /* ── actions ── */
  const addRow = async () => {
    const prefill = {}
    if (statusTab !== 'all') prefill.status = statusTab
    if (viewTab !== 'all') prefill[sheet.viewField] = viewTab
    setSearch(''); setRegion(''); setColFilters({}); setSort(null)
    setLimit((l) => Math.max(l, rows.length + 1))
    try {
      const { data } = await createRows([prefill])
      const id = data[0]._id
      setTimeout(() => startEditNew(id), 50)
    } catch (e) { showToast('error', errMsg(e)) }
  }
  // separate so it reads the fresh rowsById on next render
  const startEditNew = (id) => {
    setActive({ id, key: sheet.nameField })
    setEditing({ id, key: sheet.nameField, initial: '' })
  }

  const applyBulk = () => {
    const col = colMap[bulkKey]
    if (!col) return showToast('warning', 'Choose a column to update')
    const r = coerceClient(col, bulkValue)
    if (!r.ok) return showToast('error', r.error)
    const changes = [...selected].filter((id) => rowsById[id]).map((id) => ({
      id, key: col.key, before: rowsById[id][col.key] ?? blankOf(col), after: r.value,
    }))
    commitChanges(changes)
    showToast('success', `${col.label} updated for ${changes.length} row(s)`)
    setBulkValue('')
  }

  const bulkDelete = () => {
    const ids = [...selected]
    if (!ids.length) return
    if (!confirm(`Delete ${ids.length} ${sheet.singular.toLowerCase()}(s)? You can undo with Ctrl+Z.`)) return
    deleteRows(ids)
  }

  const exportRows = (onlySelected) => (onlySelected ? filteredRows.filter((r) => selected.has(r._id)) : filteredRows)
  const fileBase = `${sheet.title.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().slice(0, 10)}`

  const exportCSV = (onlySelected = false) => {
    const list = exportRows(onlySelected)
    const lines = [allCols.map((c) => csvEscape(c.label)).join(',')]
    list.forEach((r) => lines.push(allCols.map((c) => csvEscape(rawText(c, r[c.key]))).join(',')))
    download(new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' }), `${fileBase}.csv`)
  }

  const exportExcel = async (onlySelected = false) => {
    try {
      const ExcelJS = (await import('exceljs')).default
      const wb = new ExcelJS.Workbook()
      const ws = wb.addWorksheet(sheet.title.slice(0, 31))
      ws.columns = allCols.map((c) => ({ header: c.label, key: c.key, width: Math.max(10, Math.round(c.width / 7)) }))
      exportRows(onlySelected).forEach((r) => ws.addRow(Object.fromEntries(allCols.map((c) => {
        const v = r[c.key]
        if (isBlank(v)) return [c.key, null]
        if (c.type === 'date') return [c.key, new Date(v)]
        return [c.key, v]
      }))))
      ws.getRow(1).font = { bold: true }
      ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDCFCE7' } }
      ws.views = [{ state: 'frozen', ySplit: 1 }]
      allCols.forEach((c, i) => { if (c.type === 'date') ws.getColumn(i + 1).numFmt = 'dd mmm yyyy' })
      const buf = await wb.xlsx.writeBuffer()
      download(new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), `${fileBase}.xlsx`)
    } catch (e) { showToast('error', `Excel export failed: ${errMsg(e)}`) }
  }

  const downloadTemplate = () => {
    const header = editableCols.map((c) => csvEscape(c.label)).join(',')
    download(new Blob(['﻿' + header + '\r\n'], { type: 'text/csv;charset=utf-8' }), `${sheet.key}-import-template.csv`)
  }

  const importFile = async (file) => {
    if (!file) return
    try {
      let table
      if (/\.xlsx$/i.test(file.name)) {
        const ExcelJS = (await import('exceljs')).default
        const wb = new ExcelJS.Workbook()
        await wb.xlsx.load(await file.arrayBuffer())
        const ws = wb.worksheets[0]
        table = []
        ws.eachRow({ includeEmpty: false }, (row) => {
          const vals = []
          for (let i = 1; i <= ws.columnCount; i++) {
            let v = row.getCell(i).value
            if (v && typeof v === 'object' && !(v instanceof Date)) v = v.text ?? v.result ?? v.hyperlink ?? (v.richText ? v.richText.map((t) => t.text).join('') : '')
            if (v instanceof Date) v = v.toISOString().slice(0, 10)
            vals.push(v ?? '')
          }
          table.push(vals)
        })
      } else if (/\.csv$/i.test(file.name)) {
        table = parseCSV(await file.text())
      } else {
        return showToast('error', 'Please choose a .csv or .xlsx file')
      }
      if (table.length < 2) return showToast('warning', 'File has no data rows')

      const lookup = {}
      editableCols.forEach((c) => { lookup[norm(c.label)] = c; lookup[norm(c.key)] = c })
      const mapping = table[0].map((h) => lookup[norm(h)] || null)
      if (!mapping.some(Boolean)) return showToast('error', 'No matching column headers found. Download the template to see the expected headers.')

      const out = [], errors = []
      table.slice(1).forEach((cells, i) => {
        if (cells.every((v) => String(v ?? '').trim() === '')) return
        const obj = {}
        mapping.forEach((col, j) => {
          if (!col) return
          const r = coerceClient(col, cells[j])
          if (r.ok) obj[col.key] = r.value
          else errors.push(`Row ${i + 2}: ${r.error}`)
        })
        out.push(obj)
      })
      if (errors.length) return showToast('error', `Import stopped — fix ${errors.length} error(s). ${errors.slice(0, 3).join(' | ')}`)
      if (!out.length) return showToast('warning', 'No rows to import')
      if (!confirm(`Import ${out.length} ${sheet.singular.toLowerCase()}(s) into ${sheet.title}?`)) return
      const { message } = await createRows(out)
      showToast('success', message)
    } catch (e) {
      showToast('error', `Import failed: ${errMsg(e)}`)
    } finally {
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const printSheet = () => {
    const w = window.open('', '_blank')
    if (!w) return showToast('warning', 'Allow pop-ups to print')
    const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))
    const head = visibleCols.map((c) => `<th>${esc(c.label)}</th>`).join('')
    const body = filteredRows.map((r) => `<tr>${visibleCols.map((c) => `<td>${esc(fmt(c, r[c.key]))}</td>`).join('')}</tr>`).join('')
    w.document.write(`<!doctype html><html><head><title>${esc(sheet.title)}</title><style>
      body{font-family:system-ui,sans-serif;font-size:11px;margin:16px} h1{font-size:16px;margin:0 0 8px}
      table{border-collapse:collapse;width:100%} th,td{border:1px solid #ccc;padding:4px 6px;text-align:left}
      th{background:#dcfce7} @page{size:landscape;margin:10mm}</style></head><body>
      <h1>${esc(sheet.title)} — ${filteredRows.length} rows · ${new Date().toLocaleString('en-IN')}</h1>
      <table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></body></html>`)
    w.document.close()
    w.focus()
    w.print()
  }

  const toggleColumn = (key) => setHidden((h) => {
    const n = new Set(h)
    n.has(key) ? n.delete(key) : n.add(key)
    if (n.size >= allCols.length) return h
    persist({ hidden: [...n] })
    return n
  })
  const setZoomP = (z) => { setZoom(z); persist({ zoom: z }) }
  const allViews = [...sheet.views, ...extraViews.filter((v) => !sheet.views.includes(v))]
  const addableViews = useMemo(() => {
    const vals = new Set([...(viewCol?.options || []), ...rows.map((r) => r[sheet.viewField]).filter(Boolean)])
    return [...vals].filter((v) => !allViews.includes(v))
  }, [viewCol, rows, sheet.viewField, allViews])
  const addView = (v) => { const next = [...extraViews, v]; setExtraViews(next); persist({ extraViews: next }); setViewTab(v) }
  const removeView = (v) => { const next = extraViews.filter((x) => x !== v); setExtraViews(next); persist({ extraViews: next }); if (viewTab === v) setViewTab('all') }

  const tableWidth = GUTTER + visibleCols.reduce((s, c) => s + c.width, 0)
  const groupableCols = allCols.filter((c) => ['select', 'status', 'text', 'rating'].includes(c.type) && !c.logo)

  /* ── render ── */
  const tabBtn = (val, label, n) => (
    <button
      key={val}
      type="button"
      onClick={() => { setStatusTab(val); setSelected(new Set()) }}
      className={`-mb-px border-b-2 px-4 py-3 text-sm font-medium transition ${statusTab === val ? 'border-emerald-700 text-emerald-700 dark:text-emerald-400' : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'}`}
    >
      {label} ({n})
    </button>
  )
  const toolBtn = 'inline-flex h-9 items-center gap-1.5 rounded-lg border bg-white px-3 text-sm hover:bg-gray-50 disabled:opacity-40 dark:bg-stone-800 dark:hover:bg-stone-700'

  return (
    <div className="w-full min-w-0 max-w-full py-4">
      {/* header */}
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{sheet.title}</h1>
          <p className="text-sm text-gray-500">{sheet.subtitle}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex h-10 items-center gap-1.5 rounded-lg border bg-white px-3 text-sm dark:bg-stone-800">
            <MapPin className="h-4 w-4 text-gray-500" />
            <select value={region} onChange={(e) => setRegion(e.target.value)} className="bg-transparent outline-none">
              <option value="">All Locations</option>
              {regions.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={sheet.searchPlaceholder}
              className="h-10 w-72 max-w-[80vw] rounded-lg border bg-white pl-9 pr-8 text-sm outline-none focus:border-emerald-600 dark:bg-stone-800"
            />
            {search && <button type="button" onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"><X className="h-4 w-4" /></button>}
          </div>
        </div>
      </div>

      <div className="w-full min-w-0 max-w-full overflow-hidden rounded-2xl border bg-white shadow-sm dark:bg-card">
        {/* status tabs + import/export + add */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b px-3">
          <div className="flex flex-wrap">
            {tabBtn('all', `All ${sheet.plural}`, counts.all)}
            {tabBtn('Active', 'Active', counts.Active)}
            {tabBtn('Onboarding', 'Onboarding', counts.Onboarding)}
            {tabBtn('Inactive', 'Inactive', counts.Inactive)}
          </div>
          <div className="flex items-center gap-2 py-2">
            <span className="mr-1 hidden items-center gap-1 text-xs sm:inline-flex">
              {saveState === 'saving' && <><Loader2 className="h-3.5 w-3.5 animate-spin text-gray-500" /><span className="text-gray-500">Saving…</span></>}
              {saveState === 'saved' && <><CircleCheck className="h-3.5 w-3.5 text-emerald-600" /><span className="text-emerald-700">All changes saved</span></>}
              {saveState === 'error' && <><CircleAlert className="h-3.5 w-3.5 text-red-500" /><span className="text-red-600">Last change not saved</span></>}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" className={toolBtn}><Download className="h-4 w-4" /> Import / Export <ChevronDown className="h-3.5 w-3.5" /></button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuLabel>Export ({filteredRows.length} rows in view)</DropdownMenuLabel>
                <DropdownMenuItem onSelect={() => exportExcel()}><FileSpreadsheet className="h-4 w-4" /> Excel (.xlsx)</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => exportCSV()}><FileText className="h-4 w-4" /> CSV (.csv)</DropdownMenuItem>
                {selected.size > 0 && <>
                  <DropdownMenuItem onSelect={() => exportExcel(true)}><FileSpreadsheet className="h-4 w-4" /> Selected rows → Excel</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => exportCSV(true)}><FileText className="h-4 w-4" /> Selected rows → CSV</DropdownMenuItem>
                </>}
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Import</DropdownMenuLabel>
                <DropdownMenuItem onSelect={() => fileRef.current?.click()}><Upload className="h-4 w-4" /> Import CSV / Excel</DropdownMenuItem>
                <DropdownMenuItem onSelect={downloadTemplate}><Download className="h-4 w-4" /> Download import template</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <input ref={fileRef} type="file" accept=".csv,.xlsx" className="hidden" onChange={(e) => importFile(e.target.files?.[0])} />
            <button type="button" onClick={addRow} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-emerald-700 px-4 text-sm font-medium text-white hover:bg-emerald-800">
              <Plus className="h-4 w-4" /> Add {sheet.singular}
            </button>
          </div>
        </div>

        {/* toolbar */}
        <div className="flex flex-wrap items-center gap-2 border-b px-3 py-2">
          <button type="button" title="Undo (Ctrl+Z)" disabled={!undoStack.current.length} onClick={undo} className="rounded p-2 hover:bg-gray-100 disabled:opacity-30 dark:hover:bg-stone-700"><Undo2 className="h-4 w-4" /></button>
          <button type="button" title="Redo (Ctrl+Y)" disabled={!redoStack.current.length} onClick={redo} className="rounded p-2 hover:bg-gray-100 disabled:opacity-30 dark:hover:bg-stone-700"><Redo2 className="h-4 w-4" /></button>
          <button type="button" title="Print" onClick={printSheet} className="rounded p-2 hover:bg-gray-100 dark:hover:bg-stone-700"><Printer className="h-4 w-4" /></button>

          <select value={zoom} onChange={(e) => setZoomP(Number(e.target.value))} className={`${toolBtn} pr-2`} title="Zoom">
            {[75, 90, 100, 110, 125].map((z) => <option key={z} value={z}>{z}%</option>)}
          </select>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" className={toolBtn}><Columns3 className="h-4 w-4" /> View <ChevronDown className="h-3.5 w-3.5" /></button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="max-h-96 w-56 overflow-auto">
              <DropdownMenuLabel>Show columns</DropdownMenuLabel>
              {allCols.map((c) => (
                <DropdownMenuCheckboxItem key={c.key} checked={!hidden.has(c.key)} onCheckedChange={() => toggleColumn(c.key)} onSelect={(e) => e.preventDefault()}>
                  {c.label}
                </DropdownMenuCheckboxItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => { setHidden(new Set()); persist({ hidden: [] }) }}>Show all columns</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Popover>
            <PopoverTrigger asChild>
              <button type="button" className={`${toolBtn} ${activeFilterCount ? 'border-emerald-600 bg-emerald-50 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' : ''}`}>
                <Filter className="h-4 w-4" /> Filter{activeFilterCount ? ` (${activeFilterCount})` : ''} <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-3 text-sm" align="start">
              <p className="mb-2 font-semibold">Active filters</p>
              {!activeFilterCount && <p className="text-xs text-gray-500">No filters. Use the <ListFilter className="inline h-3 w-3" /> icon on any column header to filter or sort it.</p>}
              <div className="space-y-1">
                {search && <FilterChip label={`Search: “${search}”`} onClear={() => setSearch('')} />}
                {region && <FilterChip label={`Location: ${region}`} onClear={() => setRegion('')} />}
                {Object.entries(colFilters).filter(([, f]) => filterActive(f)).map(([k, f]) => (
                  <FilterChip key={k} label={`${colMap[k].label}: ${f.values ? `${f.values.length} value(s)` : f.text ? `contains “${f.text}”` : [f.min ?? f.from, f.max ?? f.to].map((x) => (isBlank(x) ? '…' : x)).join(' – ')}`}
                    onClear={() => setColFilters((p) => ({ ...p, [k]: null }))} />
                ))}
              </div>
              {activeFilterCount > 0 && (
                <button type="button" onClick={() => { setColFilters({}); setSearch(''); setRegion('') }} className="mt-3 w-full rounded border py-1 text-xs hover:bg-gray-50 dark:hover:bg-stone-800">Clear all filters</button>
              )}
            </PopoverContent>
          </Popover>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" className={`${toolBtn} ${groupBy ? 'border-emerald-600 bg-emerald-50 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' : ''}`}>
                <Layers className="h-4 w-4" /> Group By{groupBy ? `: ${colMap[groupBy].label}` : ''} <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="max-h-96 w-56 overflow-auto">
              <DropdownMenuRadioGroup value={groupBy} onValueChange={(v) => { setGroupBy(v); setCollapsed(new Set()) }}>
                <DropdownMenuRadioItem value="">No grouping</DropdownMenuRadioItem>
                {groupableCols.map((c) => <DropdownMenuRadioItem key={c.key} value={c.key}>{c.label}</DropdownMenuRadioItem>)}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {sort && (
            <button type="button" onClick={() => setSort(null)} className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs dark:bg-stone-700">
              Sorted: {colMap[sort.key].label} {sort.dir === 'asc' ? '↑' : '↓'} <X className="h-3 w-3" />
            </button>
          )}
          <span className="ml-auto text-xs text-gray-500">{filteredRows.length} of {rows.length} rows</span>
        </div>

        {/* bulk update bar */}
        {selected.size > 0 && (
          <div className="flex flex-wrap items-center gap-2 border-b bg-emerald-50 px-3 py-2 text-sm dark:bg-emerald-900/20">
            <span className="font-semibold text-emerald-800 dark:text-emerald-300">{selected.size} selected</span>
            <span className="text-gray-500">· Set</span>
            <select value={bulkKey} onChange={(e) => { setBulkKey(e.target.value); setBulkValue('') }} className="h-8 rounded-md border bg-white px-2 text-sm dark:bg-stone-800">
              <option value="">column…</option>
              {editableCols.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
            </select>
            {bulkKey && <><span className="text-gray-500">to</span><BulkValueInput col={colMap[bulkKey]} value={bulkValue} onChange={setBulkValue} /></>}
            <button type="button" onClick={applyBulk} disabled={!bulkKey} className="h-8 rounded-md bg-emerald-700 px-3 text-white hover:bg-emerald-800 disabled:opacity-40">Apply to {selected.size}</button>
            <button type="button" onClick={bulkDelete} className="inline-flex h-8 items-center gap-1 rounded-md border border-red-200 bg-white px-3 text-red-600 hover:bg-red-50 dark:bg-stone-800"><Trash2 className="h-4 w-4" /> Delete</button>
            <button type="button" onClick={() => setSelected(new Set())} className="ml-auto text-xs text-gray-500 hover:underline">Clear selection</button>
          </div>
        )}

        {/* grid */}
        <div
          ref={gridRef}
          tabIndex={0}
          onKeyDown={onGridKeyDown}
          onPaste={onPaste}
          className="relative h-[calc(100vh-340px)] min-h-[320px] w-full max-w-full overflow-auto overscroll-contain outline-none"
        >
          {loading ? (
            <div className="flex h-80 items-center justify-center gap-2 text-gray-500"><Loader2 className="h-5 w-5 animate-spin" /> Loading…</div>
          ) : loadError ? (
            <div className="flex h-80 flex-col items-center justify-center gap-3 text-sm text-red-600">
              {loadError}
              <button type="button" onClick={load} className="rounded border px-3 py-1 text-gray-700 dark:text-gray-200">Retry</button>
            </div>
          ) : (
            <div style={{ zoom: zoom / 100 }}>
              <table className="border-separate border-spacing-0 text-sm" style={{ width: tableWidth, tableLayout: 'fixed' }}>
                <colgroup>
                  <col style={{ width: GUTTER }} />
                  {visibleCols.map((c) => <col key={c.key} style={{ width: c.width }} />)}
                </colgroup>
                <thead>
                  <tr>
                    <th className="sticky left-0 top-0 z-30 h-7 border-b border-r bg-gray-100 dark:bg-stone-800" />
                    {visibleCols.map((c, i) => (
                      <th key={c.key} style={stickyLeft[c.key] !== undefined ? { left: stickyLeft[c.key] } : undefined}
                        className={`sticky top-0 h-7 border-b border-r bg-gray-100 text-xs font-normal text-gray-500 dark:bg-stone-800 ${stickyLeft[c.key] !== undefined ? 'z-30' : 'z-20'}`}>
                        {colLetter(i)}
                      </th>
                    ))}
                  </tr>
                  <tr>
                    <th className="sticky left-0 top-7 z-30 h-10 border-b border-r bg-emerald-50 dark:bg-emerald-950">
                      <div className="flex items-center justify-center gap-1.5">
                        <input type="checkbox" checked={allVisibleSelected} onChange={toggleAll} className="accent-emerald-600" title="Select all rows in view" />
                        <span className="text-xs text-gray-400">1</span>
                      </div>
                    </th>
                    {visibleCols.map((c) => (
                      <th key={c.key} style={stickyLeft[c.key] !== undefined ? { left: stickyLeft[c.key] } : undefined}
                        className={`sticky top-7 h-10 border-b border-r bg-emerald-50 px-2 text-left text-xs font-semibold dark:bg-emerald-950 ${stickyLeft[c.key] !== undefined ? 'z-30' : 'z-20'}`}>
                        <div className="flex items-center justify-between gap-1">
                          <span className="truncate" title={c.label}>{c.label}{sort?.key === c.key ? (sort.dir === 'asc' ? ' ↑' : ' ↓') : ''}</span>
                          <ColumnFilter
                            col={c}
                            rows={baseRows}
                            filter={colFilters[c.key]}
                            onChange={(f) => setColFilters((p) => ({ ...p, [c.key]: f }))}
                            sort={sort}
                            onSort={setSort}
                          />
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map((it) => {
                    if (it.type === 'group') {
                      const open = !collapsed.has(it.key)
                      return (
                        <tr key={`g:${it.key}`}>
                          <td colSpan={visibleCols.length + 1} className="sticky left-0 border-b bg-gray-50 px-3 py-1.5 dark:bg-stone-800/60">
                            <button type="button" className="flex items-center gap-1 text-sm font-semibold"
                              onClick={() => setCollapsed((s) => { const n = new Set(s); open ? n.add(it.key) : n.delete(it.key); return n })}>
                              {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                              {colMap[groupBy].label}: {it.key || '(Blank)'} <span className="font-normal text-gray-500">· {it.count}</span>
                            </button>
                          </td>
                        </tr>
                      )
                    }
                    const r = it.row
                    const isSel = selected.has(r._id)
                    return (
                      <tr key={r._id} className={isSel ? 'bg-emerald-50/70 dark:bg-emerald-900/20' : 'hover:bg-gray-50/70 dark:hover:bg-stone-800/40'}>
                        <td className={`sticky left-0 z-10 h-10 border-b border-r text-center ${isSel ? 'bg-emerald-50 dark:bg-emerald-950' : 'bg-white dark:bg-card'}`}>
                          <div className="flex items-center justify-center gap-1.5">
                            <input type="checkbox" checked={isSel} onChange={() => toggleRow(r._id)} className="accent-emerald-600" />
                            <span className="w-6 text-xs text-gray-400">{rowNo.get(r._id)}</span>
                          </div>
                        </td>
                        {visibleCols.map((c) => {
                          const isActive = active?.id === r._id && active?.key === c.key
                          const isEditing = editing?.id === r._id && editing?.key === c.key
                          const sticky = stickyLeft[c.key] !== undefined
                          return (
                            <td
                              key={c.key}
                              data-cell={`${r._id}:${c.key}`}
                              style={sticky ? { left: stickyLeft[c.key] } : undefined}
                              onMouseDown={() => onCellMouseDown(r._id, c.key)}
                              className={`relative h-10 cursor-default select-none border-b border-r px-2 ${sticky ? `sticky z-10 ${isSel ? 'bg-emerald-50 dark:bg-emerald-950' : 'bg-white dark:bg-card'}` : ''} ${isActive && !isEditing ? 'outline outline-2 -outline-offset-2 outline-emerald-600' : ''}`}
                            >
                              <div className="flex h-full items-center overflow-hidden whitespace-nowrap">
                                <CellView col={c} row={r} onOpen={() => startEdit(r._id, c.key)} />
                              </div>
                              {isEditing && (c.type === 'select' || c.type === 'status'
                                ? <OptionEditor col={c} current={r[c.key] || ''} initial={editing.initial} onCommit={finishEdit} onCancel={cancelEdit} />
                                : <TextEditor col={c} initial={editing.initial} onCommit={finishEdit} onCancel={cancelEdit} />)}
                            </td>
                          )
                        })}
                      </tr>
                    )
                  })}
                  {!items.length && (
                    <tr>
                      <td colSpan={visibleCols.length + 1} className="py-16 text-center text-sm text-gray-500">
                        {rows.length ? 'No rows match the current filters.' : <>No {sheet.title.toLowerCase()} yet. Click <b>Add {sheet.singular}</b> or import a CSV / Excel file.</>}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              {filteredRows.length > limit && (
                <div className="p-3 text-center">
                  <button type="button" onClick={() => setLimit((l) => l + 300)} className="rounded border px-4 py-1.5 text-sm hover:bg-gray-50 dark:hover:bg-stone-800">
                    Show more ({filteredRows.length - limit} remaining)
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* bottom sheet tabs (quick views) */}
        <div className="flex items-center gap-1 overflow-x-auto border-t px-3 py-2 text-sm">
          <button type="button" onClick={addRow} title={`Add ${sheet.singular}`} className="rounded p-1.5 text-gray-600 hover:bg-gray-100 dark:hover:bg-stone-700"><Plus className="h-4 w-4" /></button>
          <button
            type="button"
            onClick={() => setViewTab('all')}
            className={`whitespace-nowrap rounded-lg px-4 py-1.5 ${viewTab === 'all' ? 'bg-emerald-50 font-semibold text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-stone-700'}`}
          >
            All {sheet.plural}
          </button>
          {allViews.map((v) => (
            <span key={v} className={`group inline-flex items-center whitespace-nowrap rounded-lg ${viewTab === v ? 'bg-emerald-50 font-semibold text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-stone-700'}`}>
              <button type="button" onClick={() => setViewTab(v)} className="px-4 py-1.5">{v}</button>
              {extraViews.includes(v) && (
                <button type="button" title="Remove tab" onClick={() => removeView(v)} className="-ml-3 mr-1 hidden rounded p-0.5 text-gray-400 hover:text-red-500 group-hover:inline"><X className="h-3 w-3" /></button>
              )}
            </span>
          ))}
          {addableViews.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" title="Add a tab" className="rounded p-1.5 text-gray-600 hover:bg-gray-100 dark:hover:bg-stone-700"><Plus className="h-4 w-4" /></button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="max-h-80 overflow-auto">
                <DropdownMenuLabel>Add tab for {viewCol?.label}</DropdownMenuLabel>
                {addableViews.map((v) => <DropdownMenuItem key={v} onSelect={() => addView(v)}>{v}</DropdownMenuItem>)}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <span className="ml-auto hidden whitespace-nowrap pl-4 text-xs text-gray-400 lg:inline">
            Double-click or type to edit · Enter/Tab to save · Ctrl+V paste from Excel · Ctrl+Z undo
          </span>
        </div>
      </div>
    </div>
  )
}

function FilterChip({ label, onClear }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded bg-gray-50 px-2 py-1 text-xs dark:bg-stone-800">
      <span className="truncate">{label}</span>
      <button type="button" onClick={onClear} className="text-gray-400 hover:text-red-500"><X className="h-3 w-3" /></button>
    </div>
  )
}
