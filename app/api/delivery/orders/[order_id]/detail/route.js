import { isAuthenticated } from "@/lib/authentication"
import connectDB from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperfunction"
import OrderModel from "@/models/Order.model"
import ProductVariantModel from "@/models/ProductVariant.model"
import ProductModel from "@/models/Product.model"

export async function GET(request, { params }) {
  try {
    const auth = await isAuthenticated("delivery boy")
    if (!auth.isAuth) return response(false, 401, "Unauthorized.")

    await connectDB()
    const { order_id } = await params

    const order = await OrderModel.findOne({
      order_id,
      deliveryPartner: auth.userId,
      deleteAt: null,
    })

    if (!order) return response(false, 404, "Order not found or not assigned to you.")

    //  FIXED: pehle variant ki apni media try karo (specific/accurate), warna
    // product-level media pe fallback karo. Dono me 'media' array hi hai
    // (ObjectId → Media model), jisme se 'secure_url' hi actual image-link hai.
    const variantIds = order.products.map((p) => p.variantId).filter(Boolean)
    const productIds = order.products.map((p) => p.productId).filter(Boolean)

    const variants = await ProductVariantModel.find({ _id: { $in: variantIds } })
      .select("product attributes media")
      .populate("media", "secure_url")

    const products = await ProductModel.find({ _id: { $in: productIds } })
      .select("media")
      .populate("media", "secure_url")

    const variantMap = {}
    variants.forEach((v) => { variantMap[String(v._id)] = v })
    const productImageMap = {}
    products.forEach((p) => { productImageMap[String(p._id)] = p.media?.[0]?.secure_url || null })

    const safeOrder = {
      order_id: order.order_id,
      status: order.status,
      paymentMode: order.paymentMode,
      paymentStatus: order.paymentStatus,
      totalAmount: order.totalAmount,
      ordernote: order.ordernote,

      customer: {
        name: order.name,
        address: order.address,
        landmark: order.landmark,
        city: order.city,
        state: order.state,
        pincode: order.pincode,
        location: order.customerLocation,
      },

      products: order.products.map((p) => {
        const variant = variantMap[String(p.variantId)]
        // ✅ priority: variant-specific image > product-level image
        const image = variant?.media?.[0]?.secure_url || productImageMap[String(p.productId)] || null

        return {
          name: p.name,
          qty: p.qty,
          sellingPrice: p.sellingPrice,
          status: p.status,
          image,
          // Bonus: Size/Weight/Color jaisi attributes bhi dikha do
          attributes: variant?.attributes || [],
          customSize: p.customSize || null, // Height × Width (inch) for made-to-size items
        }
      }),
    }

    return response(true, 200, "Order detail fetched.", safeOrder)
  } catch (error) {
    return catchError(error, "Failed to fetch order detail.")
  }
}