import { isValidLatLng, quoteDelivery } from "@/lib/delivery"

/**
 * Online + COD dono order-save routes ke liye common step:
 *  1. buyer location resolve (checkout ka GPS, warna address geocode)
 *  2. sample items ko server ke samplePrice / qty 1 pe lock karna
 *  3. return rules: sample → returnable (7 din); jis product me sample option ON hai
 *     uska full order returnable nahi; baaki products apne isReturnable flag pe
 *  4. delivery charge server-side recalculate (client pe trust nahi)
 *
 * strict=true (COD) → problem ho to { error } return, order nahi banta.
 * strict=false (online, payment already capture ho chuka) → kabhi fail nahi,
 *   jo calculate ho sake wahi record karo (admin baad me dekh sakta hai).
 */
export async function prepareOrderItems({ products, customerLocation, addressString, strict = true }) {
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

  const productIds = [...new Set(products.map((p) => String(p.productId)))]
  const infos = await ProductModel.find({ _id: { $in: productIds } })
    .select("isReturnable sampleEnabled samplePrice")
    .lean()
  const infoById = Object.fromEntries(infos.map((p) => [String(p._id), p]))

  // 2 + 3. sample + return rules
  const items = []
  for (const item of products) {
    const info = infoById[String(item.productId)]
    const isSample = !!item.isSample

    if (isSample) {
      const sampleOk = info?.sampleEnabled && info.samplePrice > 0
      if (!sampleOk && strict) {
        return { error: `Sample is no longer available for "${item.name}".` }
      }
      items.push({
        ...item,
        isSample: true,
        qty: 1,
        mrp: sampleOk ? info.samplePrice : item.mrp,
        sellingPrice: sampleOk ? info.samplePrice : item.sellingPrice,
        isReturnable: true,
      })
    } else {
      items.push({
        ...item,
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

  return {
    items,
    location,
    deliveryCharge: quote.totalDeliveryCharge,
    itemsSubtotal,
  }
}
