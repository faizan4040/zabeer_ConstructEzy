// Shared helpers for adding many product variants in one save.
// Pure functions only, so both the add pages (client) and the API routes (server) can use them.

// Discount % from MRP and selling price. Always 0..100, rounded.
export const calcDiscount = (mrp, sellingPrice) => {
  const m = Number(mrp)
  const s = Number(sellingPrice)
  if (!(m > 0) || !(s > 0) || s >= m) return 0
  return Math.round(((m - s) / m) * 100)
}

// Stable key for an attribute combination, independent of order: "color=red|weight=25kg"
export const attributeKey = (attributes = []) =>
  attributes
    .map((a) => `${String(a.label).trim().toLowerCase()}=${String(a.value).trim().toLowerCase()}`)
    .sort()
    .join('|')

// Validates the bulk payload { product, brand, media, requiresCustomSize, variants:[{attributes, sku, stock, mrp, sellingPrice}] }.
// Returns { error } or { docs } ready for insertMany.
export const buildVariantDocs = (payload) => {
  const product = String(payload?.product || '').trim()
  const brand = String(payload?.brand || '').trim()
  const media = Array.isArray(payload?.media) ? payload.media.filter(Boolean).map(String) : []
  const variants = Array.isArray(payload?.variants) ? payload.variants : []
  const requiresCustomSize = payload?.requiresCustomSize === true
  const priceUnit = requiresCustomSize && payload?.priceUnit === 'sqft' ? 'sqft' : 'piece'

  if (!product) return { error: 'Product is required.' }
  if (!brand) return { error: 'Brand is required.' }
  if (media.length === 0) return { error: 'Please add at least one photo.' }
  if (variants.length === 0) return { error: 'Add at least one variant row.' }

  const docs = []
  const seenSku = new Set()
  const seenCombo = new Set()

  for (let i = 0; i < variants.length; i++) {
    const row = variants[i] || {}
    const n = `Row ${i + 1}`

    const attributes = (Array.isArray(row.attributes) ? row.attributes : [])
      .map((a) => ({ label: String(a?.label || '').trim(), value: String(a?.value || '').trim() }))
      .filter((a) => a.label)
    if (attributes.length === 0) return { error: `${n}: select at least one option.` }
    const emptyAttr = attributes.find((a) => !a.value)
    if (emptyAttr) return { error: `${n}: ${emptyAttr.label} is required.` }

    const sku = String(row.sku || '').trim()
    if (sku.length < 3) return { error: `${n}: SKU must be at least 3 characters.` }

    const stock = Number(row.stock)
    const mrp = Number(row.mrp)
    const sellingPrice = Number(row.sellingPrice)
    if (!Number.isFinite(stock) || stock < 0 || !Number.isInteger(stock)) return { error: `${n}: stock must be a whole number, 0 or more.` }
    if (!(mrp > 0)) return { error: `${n}: MRP must be greater than 0.` }
    if (!(sellingPrice > 0)) return { error: `${n}: selling price must be greater than 0.` }
    if (sellingPrice > mrp) return { error: `${n}: selling price cannot be more than MRP.` }

    const skuKey = sku.toLowerCase()
    if (seenSku.has(skuKey)) return { error: `${n}: SKU "${sku}" is used twice.` }
    seenSku.add(skuKey)

    const combo = attributeKey(attributes)
    if (seenCombo.has(combo)) {
      return { error: `${n}: the same option combination (${attributes.map((a) => a.value).join(' / ')}) is added twice.` }
    }
    seenCombo.add(combo)

    docs.push({
      product,
      brand,
      media,
      attributes,
      requiresCustomSize,
      priceUnit,
      sku,
      stock,
      mrp,
      sellingPrice,
      discountPercentage: calcDiscount(mrp, sellingPrice),
    })
  }

  return { docs }
}

// Checks the new docs against variants already saved for this product (SKU + combination clashes).
export const findConflicts = async (ProductVariantModel, docs) => {
  const skus = docs.map((d) => d.sku)
  const skuClash = await ProductVariantModel.findOne({ sku: { $in: skus } }).select('sku').lean()
  if (skuClash) return `SKU "${skuClash.sku}" already exists. Use a different SKU.`

  const existing = await ProductVariantModel.find({ product: docs[0].product, deletedAt: null })
    .select('attributes')
    .lean()
  const existingKeys = new Set(existing.map((v) => attributeKey(v.attributes)))
  const dup = docs.find((d) => existingKeys.has(attributeKey(d.attributes)))
  if (dup) return `Variant ${dup.attributes.map((a) => a.value).join(' / ')} already exists for this product.`

  return null
}

// Validates an edit of ONE existing variant. Only the fields sent are changed.
// Returns { error } or { update } for Object.assign onto the variant document.
export const buildVariantUpdate = (payload) => {
  const update = {}
  const has = (k) => payload && Object.prototype.hasOwnProperty.call(payload, k)

  if (has('attributes')) {
    const attributes = (Array.isArray(payload.attributes) ? payload.attributes : [])
      .map((a) => ({ label: String(a?.label || '').trim(), value: String(a?.value || '').trim() }))
      .filter((a) => a.label)
    if (attributes.length === 0) return { error: 'Select at least one option.' }
    const empty = attributes.find((a) => !a.value)
    if (empty) return { error: `${empty.label} is required.` }
    update.attributes = attributes
  }
  if (has('brand')) {
    const brand = String(payload.brand || '').trim()
    if (!brand) return { error: 'Brand is required.' }
    update.brand = brand
  }
  if (has('sku')) {
    const sku = String(payload.sku || '').trim()
    if (sku.length < 3) return { error: 'SKU must be at least 3 characters.' }
    update.sku = sku
  }
  if (has('stock')) {
    const stock = Number(payload.stock)
    if (!Number.isInteger(stock) || stock < 0) return { error: 'Stock must be a whole number, 0 or more.' }
    update.stock = stock
  }
  if (has('media')) {
    const media = Array.isArray(payload.media) ? payload.media.filter(Boolean).map(String) : []
    if (media.length === 0) return { error: 'Please add at least one photo.' }
    update.media = media
  }
  if (has('mrp') || has('sellingPrice')) {
    const mrp = Number(payload.mrp)
    const sellingPrice = Number(payload.sellingPrice)
    if (!(mrp > 0)) return { error: 'MRP must be greater than 0.' }
    if (!(sellingPrice > 0)) return { error: 'Selling price must be greater than 0.' }
    if (sellingPrice > mrp) return { error: 'Selling price cannot be more than MRP.' }
    update.mrp = mrp
    update.sellingPrice = sellingPrice
    update.discountPercentage = calcDiscount(mrp, sellingPrice)
  }
  if (has('requiresCustomSize')) {
    update.requiresCustomSize = payload.requiresCustomSize === true
    update.priceUnit = update.requiresCustomSize && payload.priceUnit === 'sqft' ? 'sqft' : 'piece'
  }
  return { update }
}
