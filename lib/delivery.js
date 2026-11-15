import { calculateDistanceKm } from "@/lib/distance"

// ─────────────────────────────────────────────────────────────────────────────
// Listing delivery options (Product.deliveryType)
//
//   free          → supplier khud deliver karega, buyer se koi charge nahi
//   paid_supplier → supplier khud deliver karega, ₹ deliveryRatePerKm × distance
//   constructezy  → ConstructEzy deliver karega, platform rate × distance
//
// Buyer ko sirf "Free Delivery" ya "Paid Delivery · ₹X/km" dikhna chahiye —
// "constructezy" kabhi bhi buyer-facing API/UI me expose nahi hota. Isliye
// product ko buyer tak bhejne se pehle hamesha toPublicDelivery() use karo.
// ─────────────────────────────────────────────────────────────────────────────

export const DELIVERY_TYPES = ["free", "paid_supplier", "constructezy"]

// ConstructEzy ka apna per-km rate. Server-only env var — change karne ke liye
// .env me CONSTRUCTEZY_DELIVERY_RATE_PER_KM set karo (default ₹20/km).
export function getPlatformRatePerKm() {
  const n = Number(process.env.CONSTRUCTEZY_DELIVERY_RATE_PER_KM)
  return Number.isFinite(n) && n > 0 ? n : 20
}

// Sample hamesha returnable hai — sirf delivery ke 7 din ke andar
export const SAMPLE_RETURN_WINDOW_DAYS = 7

// Product → buyer-safe delivery info. Kabhi bhi "constructezy" leak nahi karta.
export function toPublicDelivery(product) {
  const type = product?.deliveryType || "free"
  if (type === "paid_supplier") {
    return { mode: "paid", ratePerKm: Number(product.deliveryRatePerKm) || 0 }
  }
  if (type === "constructezy") {
    return { mode: "paid", ratePerKm: getPlatformRatePerKm() }
  }
  return { mode: "free", ratePerKm: 0 }
}

// Buyer-facing product object se internal delivery fields hata ke public info lagao
export function sanitizeProductForBuyer(product) {
  if (!product) return product
  const { deliveryType, deliveryRatePerKm, ...rest } = product
  return { ...rest, delivery: toPublicDelivery(product) }
}

// Shop.location (GeoJSON) → { lat, lng } | null
export function shopCoords(shop) {
  const c = shop?.location?.coordinates
  if (!Array.isArray(c) || c.length !== 2) return null
  const [lng, lat] = c
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
  if (lat === 0 && lng === 0) return null
  return { lat, lng }
}

export function isValidLatLng(loc) {
  return (
    loc &&
    Number.isFinite(Number(loc.lat)) &&
    Number.isFinite(Number(loc.lng)) &&
    Math.abs(Number(loc.lat)) <= 90 &&
    Math.abs(Number(loc.lng)) <= 180 &&
    !(Number(loc.lat) === 0 && Number(loc.lng) === 0)
  )
}

/**
 * Server-side delivery quote. Client ke numbers pe kabhi trust nahi karte —
 * checkout quote aur order-save dono yahi function use karte hain.
 *
 * items: [{ productId, variantId, qty, isSample }]
 * customer: { lat, lng } | null
 *
 * Ek hi shop se aaye saare paid items ek hi trip me jaate hain, isliye charge
 * per item nahi balki per (shop + deliverer) group lagta hai:
 *   charge = distance(shop → buyer) × us group ka highest per-km rate
 *
 * Returns {
 *   totalDeliveryCharge, needsLocation, unavailable: [...productIds],
 *   items: { [productId]: { deliveryType, deliveredBy, ratePerKm, distanceKm, groupKey } },
 *   groups: [{ key, deliveredBy, ratePerKm, distanceKm, charge, productIds }]
 * }
 */
export async function quoteDelivery(items, customer) {
  const { default: ProductModel } = await import("@/models/Product.model")
  const { default: ShopModel } = await import("@/models/Shop.model")

  const productIds = [...new Set(items.map((i) => String(i.productId)))]
  const products = await ProductModel.find({ _id: { $in: productIds } })
    .select("deliveryType deliveryRatePerKm shop")
    .lean()
  const productById = Object.fromEntries(products.map((p) => [String(p._id), p]))

  const shopIds = [...new Set(products.map((p) => p.shop).filter(Boolean).map(String))]
  const shops = await ShopModel.find({ _id: { $in: shopIds } }).select("location").lean()
  const shopById = Object.fromEntries(shops.map((s) => [String(s._id), s]))

  const hasCustomer = isValidLatLng(customer)
  const platformRate = getPlatformRatePerKm()

  const itemInfo = {}
  const groupMap = {}
  const unavailable = []
  let needsLocation = false

  for (const productId of productIds) {
    const p = productById[productId]
    const type = p?.deliveryType || "free"
    const deliveredBy = type === "constructezy" ? "constructezy" : "supplier"
    const ratePerKm =
      type === "paid_supplier" ? Number(p?.deliveryRatePerKm) || 0
      : type === "constructezy" ? platformRate
      : 0

    const info = { deliveryType: type, deliveredBy, ratePerKm, distanceKm: null, groupKey: null }
    itemInfo[productId] = info

    if (type === "free") continue

    if (!hasCustomer) {
      needsLocation = true
      continue
    }

    const origin = shopCoords(shopById[String(p?.shop)])
    if (!origin) {
      // Supplier ne location set nahi ki — distance nikal hi nahi sakte
      unavailable.push(productId)
      continue
    }

    const distanceKm = calculateDistanceKm(origin.lat, origin.lng, Number(customer.lat), Number(customer.lng))
    const key = `${String(p.shop)}|${deliveredBy}`
    info.distanceKm = Math.round(distanceKm * 10) / 10
    info.groupKey = key

    if (!groupMap[key]) {
      groupMap[key] = { key, deliveredBy, ratePerKm: 0, distanceKm: info.distanceKm, charge: 0, productIds: [] }
    }
    groupMap[key].ratePerKm = Math.max(groupMap[key].ratePerKm, ratePerKm)
    groupMap[key].productIds.push(productId)
  }

  const groups = Object.values(groupMap).map((g) => ({
    ...g,
    charge: Math.round(g.distanceKm * g.ratePerKm),
  }))
  const totalDeliveryCharge = groups.reduce((s, g) => s + g.charge, 0)

  return { totalDeliveryCharge, needsLocation, unavailable, items: itemInfo, groups }
}

// Quote ka buyer-safe version — deliveredBy / groupKey hata do
export function toPublicQuote(quote) {
  return {
    totalDeliveryCharge: quote.totalDeliveryCharge,
    needsLocation: quote.needsLocation,
    unavailable: quote.unavailable,
    groups: quote.groups.map((g) => ({
      ratePerKm: g.ratePerKm,
      distanceKm: g.distanceKm,
      charge: g.charge,
      productIds: g.productIds,
    })),
  }
}
