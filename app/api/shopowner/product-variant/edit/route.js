import connectDB from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperfunction"
import { isAuthenticated } from "@/lib/authentication"
import { buildVariantUpdate, releaseSkus } from "@/lib/variantBulk"
import UserModel from "@/models/User.model"
import "@/models/Product.model"
import ProductVariantModel from "@/models/ProductVariant.model"

// Body: { _id, ...only the fields to change } — stock, mrp, sellingPrice, sku, brand,
// attributes, media, requiresCustomSize, priceUnit. Discount is always recalculated.
export async function PUT(request) {
  try {
    await connectDB()

    const auth = await isAuthenticated("shop owner")
    if (!auth.isAuth) return response(false, 401, "Unauthorized.")

    const user = await UserModel.findOne({ _id: auth.userId, deletedAt: null }).select("shop")
    if (!user?.shop) return response(false, 400, "No shop linked to this account.")

    const { _id, ...payload } = await request.json()
    if (!_id) return response(false, 400, "Variant id is required.")

    const { error, update } = buildVariantUpdate(payload)
    if (error) return response(false, 400, error)

    const variant = await ProductVariantModel.findOne({ _id, deletedAt: null }).populate("product", "shop")
    if (!variant || String(variant.product?.shop) !== String(user.shop)) {
      return response(false, 404, "Variant not found or not owned by you.")
    }

    if (update.sku && update.sku !== variant.sku) {
      const clash = await releaseSkus(ProductVariantModel, [update.sku], _id)
      if (clash) return response(false, 409, `SKU "${update.sku}" already exists.`)
    }

    Object.assign(variant, update)
    await variant.save()

    return response(true, 200, "Variant updated successfully.", variant)
  } catch (error) {
    return catchError(error)
  }
}
