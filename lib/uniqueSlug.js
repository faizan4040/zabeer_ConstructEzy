// Product slugs are unique across the whole site, but many shops list the same
// item (e.g. "Priya PPC Cement, 50 Kg Bag"). Instead of failing with a duplicate
// key error, give the new product the next free slug: base, base-2, base-3 …

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

export const slugify = (value = "") =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

/**
 * @param {import("mongoose").Model} Model  model with a unique `slug` field
 * @param {string} wanted                  slug the user typed / generated
 * @param {string} [excludeId]             current doc id when editing
 */
export async function uniqueSlug(Model, wanted, excludeId) {
  const base = slugify(wanted) || "product"
  const notSelf = excludeId ? { _id: { $ne: excludeId } } : {}

  // includes soft-deleted docs too — the unique index still covers them
  const taken = await Model.find({ ...notSelf, slug: new RegExp(`^${escapeRegex(base)}(-\\d+)?$`) })
    .select("slug")
    .lean()

  const used = new Set(taken.map((d) => d.slug))
  if (!used.has(base)) return base

  let n = 2
  while (used.has(`${base}-${n}`)) n++
  return `${base}-${n}`
}
