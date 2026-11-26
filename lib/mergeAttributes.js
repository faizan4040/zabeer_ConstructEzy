// Category variant attributes must have unique labels. If a category was saved
// with the same label twice (e.g. "kg" → [30, 40] and "kg" → [50, 60, 30, 40]),
// the variant editor treated them as two options and generated every combination
// (2 × 2 = 4 rows for what should be 4 single "kg" values).
//
// This merges same-label attributes (case / space-insensitive) into one, keeping
// the first label's spelling, the union of presets (in order, no repeats) and
// allowCustom if any of them allowed it. Safe on both client and server.

const norm = (s) => String(s ?? '').trim().replace(/\s+/g, ' ').toLowerCase()

export function mergeAttributes(attributes = []) {
  const byLabel = new Map()

  for (const raw of attributes || []) {
    const attr = typeof raw?.toObject === 'function' ? raw.toObject() : raw
    const label = String(attr?.label ?? '').trim().replace(/\s+/g, ' ')
    if (!label) continue

    const key = norm(label)
    const presets = (attr.presets || []).map((p) => String(p ?? '').trim()).filter(Boolean)

    if (!byLabel.has(key)) {
      byLabel.set(key, { ...attr, label, presets: [], allowCustom: attr.allowCustom !== false, _seen: new Set() })
    }
    const merged = byLabel.get(key)
    for (const p of presets) {
      const pk = norm(p)
      if (!merged._seen.has(pk)) {
        merged._seen.add(pk)
        merged.presets.push(p)
      }
    }
    if (attr.allowCustom !== false) merged.allowCustom = true
  }

  return [...byLabel.values()].map(({ _seen, ...a }) => a)
}
