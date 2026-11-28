import { isValidLatLng, quoteDelivery } from "@/lib/delivery"
import { cleanCustomSize, priceForSize } from "@/lib/customSize"
import { checkServiceArea, NOT_SERVICEABLE_MESSAGE } from "@/lib/serviceArea"

/**
 * Online + COD dono order-save routes ke liye common step:
 *  1. buyer location resolve (checkout ka GPS, warna address geocode)
 *  2. sample items ko server ke samplePrice / qty 1 pe lock karna
 *  3. return rules: sample → returnable (7 din); jis product me sample option ON hai
 *     uska full order returnable nahi; baaki products apne isReturnable flag pe
 *  4. delivery charge server-side recalculate (client pe trust nahi)
 *  5. custom size (Height × Width inch) — jis variant pe supplier ne ON kiya, wahan zaroori
 *
 * strict=true (COD) → problem ho to { error } return, order nahi banta.
 * strict=false (online, payment already capture ho chuka) → kabhi fail nahi,
 *   jo calculate ho sake wahi record karo (admin baad me dekh sakta hai).
 */
export async function prepareOrderItems({ products, customerLocation, addressString, city, strict = true }) {
  const { default: ProductModel } = await import("@/models/Product.model")

  // 1. location
  let location = isValidLatLng(customerLocation)
    ? { lat: Number(customerLocation.lat), lng: Number(customerLocation.lng) }
    : null
  if (!location && addressString) {
    try {
      const { geocodeAddress } = await import("@/lib/geocode")
      const coords = await geocodeAddress(addressString)
      if (isValidLatLng(coords)) location = coords
    } catch {
      // geocode fail — location null rahega
    }
  }

  // 0. service area — Jaipur (ya config wale shehar) ke bahar order nahi
  const area = checkServiceArea({ lat: location?.lat ?? null, lng: location?.lng ?? null, city })
  if (area.serviceable === false) {
    if (strict) return { error: NOT_SERVICEABLE_MESSAGE }
    console.warn(`[prepareOrderItems] order outside service area (city=${city})`)
  }

  const productIds = [...new Set(products.map((p) => String(p.productId)))]
  const infos = await ProductModel.find({ _id: { $in: productIds } })
    .select("isReturnable sampleEnabled samplePrice deletedAt")
    .lean()
  const infoById = Object.fromEntries(infos.map((p) => [String(p._id), p]))

  const { default: ProductVariantModel } = await import("@/models/ProductVariant.model")
  const variantIds = [...new Set(products.map((p) => String(p.variantId)))]
  // Price ALWAYS comes from the DB variant — never from the cart the browser sends
  const variants = await ProductVariantModel.find({ _id: { $in: variantIds } })
    .select("_id product mrp sellingPrice priceUnit requiresCustomSize deletedAt")
    .lean()
  const variantById = Object.fromEntries(variants.map((v) => [String(v._id), v]))
  const needsSize = new Set(variants.filter((v) => v.requiresCustomSize).map((v) => String(v._id)))

  // 2 + 3. sample + return rules
  const items = []
  for (const item of products) {
    const info = infoById[String(item.productId)]
    const isSample = !!item.isSample
    const variant = variantById[String(item.variantId)]
    const available = info && !info.deletedAt && variant && !variant.deletedAt &&
      String(variant.product) === String(item.productId)
    if (!available) {
      if (strict) return { error: `"${item.name}" is no longer available. Please remove it from your cart.` }
      console.warn(`[prepareOrderItems] unavailable item product=${item.productId} variant=${item.variantId}`)
    }

    if (isSample) {
      const sampleOk = info?.sampleEnabled && info.samplePrice > 0
      if (!sampleOk && strict) {
        return { error: `Sample is no longer available for "${item.name}".` }
      }
      items.push({
        ...item,
        customSize: null,
        isSample: true,
        qty: 1,
        mrp: sampleOk ? info.samplePrice : item.mrp,
        sellingPrice: sampleOk ? info.samplePrice : item.sellingPrice,
        isReturnable: true,
      })
    } else {
      // 5. custom size
      const customSize = needsSize.has(String(item.variantId)) ? cleanCustomSize(item.customSize) : null
      if (needsSize.has(String(item.variantId)) && !customSize) {
        if (strict) return { error: `Please enter height and width (in inches) for "${item.name}".` }
        console.warn(`[prepareOrderItems] missing custom size for variant ${item.variantId}`)
      }
      // per piece → variant price; sqft → DB rate × area. Never the client's price.
      const price = variant
        ? (variant.priceUnit === "sqft" && !customSize
            ? { mrp: Number(variant.mrp) || 0, sellingPrice: Number(variant.sellingPrice) || 0 }
            : priceForSize(variant, customSize))
        : null
      items.push({
        ...item,
        ...(price || {}),
        customSize,
        isSample: false,
        isReturnable: info?.sampleEnabled ? false : info?.isReturnable !== false,
      })
    }
  }

  // 4. delivery
  const quote = await quoteDelivery(items, location)
  if (strict && quote.needsLocation) {
    return { error: "Delivery location is required to calculate the delivery charge. Please share your location at checkout." }
  }
  if (strict && quote.unavailable.length) {
    return { error: "Delivery is not available for some items right now." }
  }

  for (const item of items) {
    const d = quote.items[String(item.productId)] || {}
    item.deliveryType = d.deliveryType || "free"
    item.deliveredBy = d.deliveredBy || "supplier"
    item.deliveryRatePerKm = d.ratePerKm || 0
    item.deliveryDistanceKm = d.distanceKm ?? null
  }

  const itemsSubtotal = items.reduce((s, i) => s + i.sellingPrice * i.qty, 0)
  const itemsMrpTotal = items.reduce((s, i) => s + i.mrp * i.qty, 0)

  return {
    items,
    location,
    deliveryCharge: quote.totalDeliveryCharge,
    itemsSubtotal,
    itemsMrpTotal,
  }
}
