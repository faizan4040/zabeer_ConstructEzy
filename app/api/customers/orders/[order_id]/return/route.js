import { isAuthenticated } from "@/lib/authentication"
import connectDB from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperfunction"
import OrderModel from "@/models/Order.model"
import ProductModel from "@/models/Product.model"
import ReturnModel from "@/models/Return.model"
import WalletTransactionModel from "@/models/WalletTransaction.model"
import { SAMPLE_RETURN_WINDOW_DAYS } from "@/lib/delivery"

export async function POST(request, { params }) {
  try {
    const auth = await isAuthenticated("customer")
    if (!auth.isAuth) return response(false, 401, "Unauthorized.")

    await connectDB()
    const { order_id } = await params
    const { productId, reason, isSample } = await request.json()

    if (!reason || reason.trim().length < 5) {
      return response(false, 400, "Please provide a valid reason for return.")
    }

    const order = await OrderModel.findOne({ order_id, user: auth.userId, deleteAt: null })
    if (!order) return response(false, 404, "Order not found.")

    // same product ka sample aur full order dono ek order me ho sakte hain
    const item =
      order.products.find((p) => String(p.productId) === productId && !!p.isSample === !!isSample) ||
      order.products.find((p) => String(p.productId) === productId)
    if (!item) return response(false, 404, "Product not found in this order.")

    // ── Core eligibility checks ──
    if (item.status !== "delivered") {
      return response(false, 400, "Return can only be requested after the item is delivered.")
    }
    if (item.isReturnable === false) {
      return response(false, 400, "This product is not eligible for return.")
    }
    if (item.returnRequested) {
      return response(false, 400, "A return request already exists for this item.")
    }

    // ── 7-day return window from delivery ──
    // Sample ke liye strict: delivery time pata hona hi chahiye (deliveredAt ya
    // statusHistory ka "delivered" entry), warna bhi window check hota hai.
    const deliveredAt =
      item.deliveredAt ||
      [...(item.statusHistory || [])].reverse().find((h) => h.status === "delivered")?.at ||
      (item.isSample ? order.updatedAt : null)
    if (deliveredAt) {
      const daysSinceDelivery = (Date.now() - new Date(deliveredAt).getTime()) / (1000 * 60 * 60 * 24)
      if (daysSinceDelivery > SAMPLE_RETURN_WINDOW_DAYS) {
        return response(false, 400, `Return window has expired (${SAMPLE_RETURN_WINDOW_DAYS} days from delivery).`)
      }
    }

      const product = await ProductModel.findById(productId).select("shop")
    if (!product) return response(false, 404, "Product no longer exists.")   // ✅ ADD

    const wrongDefectiveKeywords = ["wrong", "defect", "damage", "broken", "different", "not as described"]
    const reasonLower = reason.trim().toLowerCase()
    const reasonCategory = wrongDefectiveKeywords.some((k) => reasonLower.includes(k)) ? "wrong_defective" : "other"

    await ReturnModel.create({
      order: order._id,
      orderId: order.order_id,
      productId: item.productId,
      variantId: item.variantId,
      productName: item.name,
      qty: item.qty,
      isSample: !!item.isSample,
      customer: auth.userId,
      customerName: order.name,
      customerEmail: order.email,
      customerPhone: order.phone,
      shop: product.shop,
      reason: reason.trim(),
      reasonCategory,
    })
    
    item.returnRequested = true
    await order.save()

    await WalletTransactionModel.updateOne(
  { order: order._id, productId: item.productId, status: "on_hold" },
  { $set: { status: "cancelled", failureReason: "Return requested by customer" } }
)

    return response(true, 200, "Return request submitted successfully.")
  } catch (error) {
    return catchError(error, "Failed to submit return request.")
  }
}