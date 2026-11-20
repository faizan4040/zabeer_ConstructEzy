import connectDB from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperfunction"
import { toPublicDelivery } from "@/lib/delivery"
import ProductVariantModel from "@/models/ProductVariant.model"
import { cleanCustomSize, priceForSize } from "@/lib/customSize"


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

            // made-to-size item: keep the customer's Height × Width. If it is missing the line
            // stays in the cart (sizeMissing) so the customer can add the size there.
            const needsSize = !isSample && !!variant.requiresCustomSize
            const customSize = needsSize ? cleanCustomSize(cartItem.customSize) : null
            const priceUnit = needsSize && variant.priceUnit === 'sqft' ? 'sqft' : 'piece'
            const sized = priceUnit === 'sqft'
                ? (customSize ? priceForSize({ ...variant, priceUnit }, customSize) : { mrp: 0, sellingPrice: 0 })
                : { mrp: variant.mrp, sellingPrice: variant.sellingPrice }

            return {
                productId: product._id,
                variantId: variant._id,
                name: product.name,
                url: product.slug,
                size: variant.size,
                color: variant.color,
                attributes: variant.attributes,
                // Sample → seller ka samplePrice, qty hamesha 1
                mrp: isSample ? product.samplePrice : sized.mrp,
                sellingPrice: isSample ? product.samplePrice : sized.sellingPrice,
                priceUnit: isSample ? 'piece' : priceUnit,
                rateMrp: variant.mrp,
                rateSellingPrice: variant.sellingPrice,
                media: variant?.media[0]?.secure_url,
                qty: isSample ? 1 : cartItem.qty,
                isSample,
                sampleNote: isSample ? (product.sampleNote || '') : '',
                delivery: toPublicDelivery(product),
                requiresCustomSize: needsSize,
                customSize,
                sizeMissing: needsSize && !customSize,
            }
        })
        )

        return response(true, 200, 'verified Cart Data.', verifiedCartData.filter(Boolean))

    } catch(error){
        return catchError(error)
    }
}
