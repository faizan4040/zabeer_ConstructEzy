import { isAuthenticated } from "@/lib/authentication";
import connectDB from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperfunction";
import { buildVariantUpdate } from "@/lib/variantBulk";
import ProductVariantModel from "@/models/ProductVariant.model";

// Body: { _id, ...only the fields to change } — attributes, brand, sku, stock, mrp,
// sellingPrice, media, requiresCustomSize, priceUnit. Discount is always recalculated.
export async function PUT(request){
    try{
      const auth = await isAuthenticated('admin')
      if(!auth.isAuth){
        return response(false, 403, 'Unauthorized.')
      }

      await connectDB()
      const { _id, ...payload } = await request.json()
      if (!_id) return response(false, 400, 'Variant id is required.')

      const { error, update } = buildVariantUpdate(payload)
      if (error) return response(false, 400, error)

      const variant = await ProductVariantModel.findOne({ deletedAt: null, _id })
      if (!variant) return response(false, 404, 'Data not found.')

      if (update.sku && update.sku !== variant.sku) {
        const clash = await ProductVariantModel.findOne({ sku: update.sku, _id: { $ne: _id } }).select('_id').lean()
        if (clash) return response(false, 409, `SKU "${update.sku}" already exists.`)
      }

      Object.assign(variant, update)
      await variant.save()

      return response(true, 200, 'Product Variant updated successfully.')
    }catch(error){
      return catchError(error)
    }
}
