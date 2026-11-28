// Category slugs are unique per parent (index { parent, slug }), and trashed categories
// still sit in the DB holding their slug. Rename those so the same name can be used again.
export async function releaseCategorySlug(CategoryModel, parent, slug, excludeId) {
  const stale = await CategoryModel.find({
    parent: parent || null,
    slug,
    deletedAt: { $ne: null },
    ...(excludeId ? { _id: { $ne: excludeId } } : {}),
  }).select("_id slug").lean()

  for (const c of stale) {
    await CategoryModel.updateOne({ _id: c._id }, { $set: { slug: `${c.slug}--deleted-${c._id}` } })
  }
}
