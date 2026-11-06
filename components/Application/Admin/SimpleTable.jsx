'use client'

import { useCallback, useEffect, useState } from 'react'
import axios from 'axios'

/**
 * Light table: server pagination (start/size/globalFilter) ya plain array dono handle karta hai.
 * columns: [{ header, cell: (row) => node }]
 */
const SimpleTable = ({ fetchUrl, columns, refreshKey = 0, pageSize = 10, searchPlaceholder = 'Search...', onLoaded }) => {
  const [rows, setRows] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [q, setQ] = useState('')
  const [debounced, setDebounced] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const t = setTimeout(() => { setDebounced(q); setPage(0) }, 400)
    return () => clearTimeout(t)
  }, [q])

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const { data: body } = await axios.get(fetchUrl, {
        params: { start: page * pageSize, size: pageSize, globalFilter: debounced },
      })
      if (Array.isArray(body)) {
        const f = debounced ? body.filter((r) => JSON.stringify(r).toLowerCase().includes(debounced.toLowerCase())) : body
        setTotal(f.length); setRows(f.slice(page * pageSize, page * pageSize + pageSize)); onLoaded?.(f)
      } else {
        if (body.success === false) throw new Error(body.message)
        setRows(body.data || []); setTotal(body.meta?.totalRowCount ?? (body.data || []).length); onLoaded?.(body.data || [])
      }
    } catch (e) {
      setError(e?.response?.data?.message || e.message)
    } finally { setLoading(false) }
  }, [fetchUrl, page, pageSize, debounced, refreshKey])

  useEffect(() => { load() }, [load])

  const pages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div>
      <div className="px-4 pb-3">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={searchPlaceholder}
          className="w-full sm:w-72 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-400" />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-stone-800 text-left text-xs uppercase text-gray-500">
            <tr>{columns.map((c, i) => <th key={i} className="px-4 py-2.5 font-semibold whitespace-nowrap">{c.header}</th>)}</tr>
          </thead>
          <tbody className="divide-y">
            {loading && !rows.length && <tr><td colSpan={columns.length} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>}
            {error && <tr><td colSpan={columns.length} className="px-4 py-8 text-center text-red-500">{error}</td></tr>}
            {!loading && !error && !rows.length && <tr><td colSpan={columns.length} className="px-4 py-8 text-center text-gray-400">No data found.</td></tr>}
            {rows.map((r, i) => (
              <tr key={r._id || i} className="hover:bg-gray-50/70 dark:hover:bg-stone-800/60 align-middle">
                {columns.map((c, j) => <td key={j} className="px-4 py-3">{c.cell(r)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between px-4 pt-3 text-sm text-gray-500">
        <span>{total} total</span>
        <div className="flex items-center gap-2">
          <button disabled={page === 0} onClick={() => setPage((p) => p - 1)} className="rounded border px-3 py-1 disabled:opacity-40">Prev</button>
          <span>{page + 1} / {pages}</span>
          <button disabled={page + 1 >= pages} onClick={() => setPage((p) => p + 1)} className="rounded border px-3 py-1 disabled:opacity-40">Next</button>
        </div>
      </div>
    </div>
  )
}

export default SimpleTable
