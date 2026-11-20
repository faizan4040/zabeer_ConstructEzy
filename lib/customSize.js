// "Custom size" = the customer types Height × Width (in inches) before ordering,
// e.g. for doors and windows. The supplier turns it on per variant (requiresCustomSize).

export const SIZE_UNIT = 'inch'
export const SIZE_MIN = 1
export const SIZE_MAX = 600 // 50 ft — anything bigger is almost certainly a typo

// Returns { height, width, unit } with clean numbers, or null if missing/invalid.
export const cleanCustomSize = (size) => {
  if (!size) return null
  const height = Math.round(Number(size.height) * 100) / 100
  const width = Math.round(Number(size.width) * 100) / 100
  if (!(height >= SIZE_MIN && height <= SIZE_MAX)) return null
  if (!(width >= SIZE_MIN && width <= SIZE_MAX)) return null
  return { height, width, unit: SIZE_UNIT }
}

// Error text for the product page inputs, or '' when the size is fine.
export const customSizeError = (height, width) => {
  if (height === '' || height == null) return 'Please enter the height.'
  if (width === '' || width == null) return 'Please enter the width.'
  const h = Number(height)
  const w = Number(width)
  if (!(h >= SIZE_MIN && h <= SIZE_MAX)) return `Height must be between ${SIZE_MIN} and ${SIZE_MAX} inches.`
  if (!(w >= SIZE_MIN && w <= SIZE_MAX)) return `Width must be between ${SIZE_MIN} and ${SIZE_MAX} inches.`
  return ''
}

// "H 84 × W 36 inch"
export const formatCustomSize = (size) =>
  size && size.height && size.width ? `H ${size.height} × W ${size.width} ${size.unit || SIZE_UNIT}` : ''

// Part of a cart-line key, so the same door in two sizes stays as two lines.
export const customSizeKey = (size) => (size ? `${size.height}x${size.width}` : '')

// ===== Pricing by size =====
// priceUnit 'piece' → MRP / selling price is per piece (default)
// priceUnit 'sqft'  → MRP / selling price is per sq ft; line price = rate × (H × W / 144)
export const PRICE_UNITS = ['piece', 'sqft']

const round2 = (n) => Math.round(n * 100) / 100

export const areaSqft = (size) => (size ? round2((Number(size.height) * Number(size.width)) / 144) : 0)

// Price of ONE item for this size. rate = { mrp, sellingPrice, priceUnit } from the variant.
export const priceForSize = (rate, size) => {
  const mrp = Number(rate?.mrp) || 0
  const sellingPrice = Number(rate?.sellingPrice) || 0
  if (rate?.priceUnit !== 'sqft') return { mrp, sellingPrice }
  const area = areaSqft(size)
  return { mrp: round2(mrp * area), sellingPrice: round2(sellingPrice * area) }
}
