import connectDB from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperfunction"
import { toPublicDelivery } from "@/lib/delivery"
import ProductVariantModel from "@/models/ProductVariant.model"


export async function POST(request) {
     try{
        await connectDB()
        const payload = await request.json()
        const items = Array.isArray(payload) ? payload : []

        const verifiedCartData = await Promise.all(
        items.map(async (cartItem) => {
            const variant = await ProductVariantModel.findById(cartItem.variantId).populate('product').populate('media', 'secure_url').lean()
            if (!variant || !variant.product || variant.product.deletedAt) return null

            const product = variant.product
            const isSample = !!cartItem.isSample

            // Seller ne sample band kar diya → ye cart line hata do
            if (isSample && !(product.sampleEnabled && product.samplePrice > 0)) return null

            return {
                productId: product._id,
                variantId: variant._id,
                name: product.name,
                url: product.slug,
                size: variant.size,
                color: variant.color,
                attributes: variant.attributes,
                // Sample → seller ka samplePrice, qty hamesha 1
                mrp: isSample ? product.samplePrice : variant.mrp,
                sellingPrice: isSample ? product.samplePrice : variant.sellingPrice,
                media: variant?.media[0]?.secure_url,
                qty: isSample ? 1 : cartItem.qty,
                isSample,
                sampleNote: isSample ? (product.sampleNote || '') : '',
                delivery: toPublicDelivery(product),
            }
        })
        )

        return response(true, 200, 'verified Cart Data.', verifiedCartData.filter(Boolean))

    } catch(error){
        return catchError(error)
    }
}
