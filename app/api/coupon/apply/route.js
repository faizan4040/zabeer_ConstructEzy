import connectDB from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperfunction"
import { zSchema } from "@/lib/zodSchema"
import { cartSubtotal, getCouponDiscount, orderProductSchema } from "@/lib/orderPricing"
import z from "zod"

// Coupon check at checkout. The subtotal is calculated here from DB prices of the
// cart items — any amount the browser sends (old minShoppingAmount field) is ignored.
// Orders re-check the coupon again on the server when placed (lib/orderPricing.js).
export async function POST(request) {
  try {
    await connectDB()

    const payload = await request.json()

    const schema = zSchema.pick({ code: true }).extend({
      products: z.array(orderProductSchema).min(1, "Your cart is empty."),
    })

    const validate = schema.safeParse(payload)
    if (!validate.success) {
      return response(false, 400, "Missing or invalid data.", validate.error)
    }

    const { code, products } = validate.data

    const subtotal = await cartSubtotal(products)
    const result = await getCouponDiscount(code, subtotal) // deleted / expired / min amount checked here
    if (result.error) return response(false, 400, result.error)

    return response(true, 200, "Coupon applied successfully", {
      code: result.code,
      discountPercentage: result.discountPercentage,
      discountAmount: result.discount,
      subtotal,
    })

  } catch (error) {
    return catchError(error)
  }
}
