// Server-side order pricing — the ONLY source of truth for what a customer pays.
// Used by: payment/get-order-id (Razorpay amount), payment/save-order, payment/save-cod-order,
// coupon/apply. The browser's subtotal / couponDiscount / totalAmount are never trusted.
import { prepareOrderItems } from "@/lib/orderDelivery"
import z from "zod"

// Cart line as the browser sends it. mrp / sellingPrice are accepted but IGNORED
// for pricing — prepareOrderItems replaces them with DB values.
export const orderProductSchema = z.object({
  productId: z.string().length(24, "Invalid product id format"),
  variantId: z.string().length(24, "Invalid variant id format"),
  name: z.string().min(1),
  qty: z.number().int().min(1).max(10000),
  mrp: z.number().nonnegative().optional(),
  sellingPrice: z.number().nonnegative().optional(),
  isSample: z.boolean().optional().default(false),
  customSize: z.object({ height: z.number(), width: z.number(), unit: z.string().optional() }).optional().nullable(),
})

export const fullAddressOf = (d) => `${d.address}, ${d.city}, ${d.state} ${d.pincode}, India`

const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100

// Coupon check + discount for a server-calculated subtotal.
// Returns { discount, code } or { error }.
export async function getCouponDiscount(code, subtotal) {
  const clean = String(code || "").trim().toUpperCase()
  if (!clean) return { discount: 0, code: null }

  const { default: CouponModel } = await import("@/models/Coupon.model")
  const coupon = await CouponModel.findOne({ code: clean, deletedAt: null }).lean()
  if (!coupon) return { error: "Invalid coupon code." }

  if (coupon.validity && new Date() > new Date(coupon.validity)) {
    return { error: "Coupon code expired." }
  }
  if (subtotal < coupon.minShoppingAmount) {
    return { error: `Minimum shopping amount should be ₹${coupon.minShoppingAmount}` }
  }

  const pct = Math.min(Math.max(Number(coupon.discountPercentage) || 0, 0), 100)
  return { discount: round2((subtotal * pct) / 100), code: coupon.code, discountPercentage: pct }
}

// Items subtotal from DB prices only (no delivery / location) — for coupon checks at checkout.
// Unavailable items are skipped; samples use the product's samplePrice, qty 1.
export async function cartSubtotal(products = []) {
  const { default: ProductModel } = await import("@/models/Product.model")
  const { default: ProductVariantModel } = await import("@/models/ProductVariant.model")
  const { priceForSize, cleanCustomSize } = await import("@/lib/customSize")

  const [infos, variants] = await Promise.all([
    ProductModel.find({ _id: { $in: products.map((p) => p.productId) }, deletedAt: null })
      .select("sampleEnabled samplePrice").lean(),
    ProductVariantModel.find({ _id: { $in: products.map((p) => p.variantId) }, deletedAt: null })
      .select("product mrp sellingPrice priceUnit").lean(),
  ])
  const infoById = Object.fromEntries(infos.map((p) => [String(p._id), p]))
  const variantById = Object.fromEntries(variants.map((v) => [String(v._id), v]))

  let total = 0
  for (const item of products) {
    const info = infoById[String(item.productId)]
    const v = variantById[String(item.variantId)]
    if (!info || !v || String(v.product) !== String(item.productId)) continue
    if (item.isSample) {
      if (info.sampleEnabled && info.samplePrice > 0) total += info.samplePrice
      continue
    }
    total += priceForSize(v, cleanCustomSize(item.customSize)).sellingPrice * item.qty
  }
  return round2(total)
}

/**
 * Full server-side price of a cart.
 * strict=true  → any problem returns { error } (used before payment / for COD)
 * strict=false → used after payment; still prices what it can
 */
export async function priceOrder({ products, customerLocation, city, addressString, couponCode, strict = true }) {
  const prepared = await prepareOrderItems({ products, customerLocation, city, addressString, strict })
  if (prepared.error) return { error: prepared.error }

  const subtotal = round2(prepared.itemsSubtotal)
  const discount = round2(Math.max(prepared.itemsMrpTotal - prepared.itemsSubtotal, 0))

  const coupon = await getCouponDiscount(couponCode, subtotal)
  if (coupon.error) return { error: coupon.error }

  const couponDiscount = Math.min(coupon.discount, subtotal)
  const deliveryCharge = round2(prepared.deliveryCharge)
  const totalAmount = round2(Math.max(subtotal - couponDiscount, 0) + deliveryCharge)

  return {
    ...prepared,
    subtotal,
    discount,
    couponCode: coupon.code,
    couponDiscount,
    deliveryCharge,
    totalAmount,
  }
}
