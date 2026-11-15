import connectDB from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperfunction";
import ProductModel from "@/models/Product.model";
import ProductVariantModel from "@/models/ProductVariant.model";
import ReviewModel from "@/models/Review.model";
import { sanitizeProductForBuyer } from "@/lib/delivery";


export async function GET(request, {params}) {

    try{

        await connectDB()

        const getParams = await params
        const slug = getParams.slug

        const searchParams = request.nextUrl.searchParams

        const filter = {
              deletedAt: null
        }

        if(!slug) {
            return response(false, 404, 'Product not found.')
        }

        filter.slug = slug

        //get product
        const getProduct = await ProductModel.findOne(filter).populate('media', 'secure_url').lean()

        if(!getProduct){
            return response(false, 404, 'Product not fount.')
        }


        // hide products belonging to a blocked shop, same as if they didn't exist
        if (getProduct.shop) {
            const owner = await (await import('@/models/User.model')).default.findOne({ shop: getProduct.shop, role: 'shop owner' }).select('isBlocked')
            if (owner?.isBlocked) {
                return response(false, 404, 'Product not fount.')
            }
        }


        //get product variant — dynamic attribute filter, e.g. ?Weight=200g&Color=Red
        const variantFilter = {
            product: getProduct._id,
            deletedAt: null,
        }

        const attributeConditions = []
        for (const [label, value] of searchParams.entries()) {
            if (value) {
                attributeConditions.push({
                    attributes: { $elemMatch: { label, value } }
                })
            }
        }

        if (attributeConditions.length > 0) {
            variantFilter.$and = attributeConditions
        }

        let variant = await ProductVariantModel.findOne(variantFilter).populate('media', 'secure_url').lean()

        // if no variant matches the requested combination (e.g. bad/partial query),
        // fall back to any variant of this product instead of a hard 404
        if (!variant) {
            variant = await ProductVariantModel.findOne({ product: getProduct._id, deletedAt: null }).populate('media', 'secure_url').lean()
        }

        if(!variant) {
           return response(false, 404, 'Product not fount.')
        }


        // get all attribute options for this product, grouped by label
        // e.g. { Weight: ["100g","200g","500g"], Color: ["Red","White"] }
        const attributeGroupsRaw = await ProductVariantModel.aggregate([
            { $match: { product: getProduct._id, deletedAt: null } },
            { $unwind: "$attributes" },
            { $group: { _id: "$attributes.label", values: { $addToSet: "$attributes.value" } } },
            { $project: { _id: 0, label: "$_id", values: 1 } }
        ])

        const attributeGroups = {}
        attributeGroupsRaw.forEach((group) => {
            attributeGroups[group.label] = group.values
        })

        // get review
        const review = await ReviewModel.countDocuments({ product: getProduct._id })

        // deliveryType (e.g. "constructezy") buyer ko kabhi nahi bhejte — sirf { mode, ratePerKm }
        const productData = {
            product: sanitizeProductForBuyer(getProduct),
            variant: variant,
            attributeGroups: attributeGroups,
            reviewCount: review
        }

       return response(true, 200, 'Product data found.', productData)

    } catch(error){
        return catchError(error)
    }
}

















// import connectDB from "@/lib/databaseConnection";
// import { catchError, response } from "@/lib/helperfunction";
// import ProductModel from "@/models/Product.model";
// import ProductVariantModel from "@/models/ProductVariant.model";
// import ReviewModel from "@/models/Review.model";


// export async function GET(request, {params}) {

//     try{

//         await connectDB()

//         const getParams = await params
//         const slug = getParams.slug

//         const searchParams = request.nextUrl.searchParams
//         const size = searchParams.get('size')
//         const color = searchParams.get('color')


//         const filter = {
//               deletedAt: null
//         }

//         if(!slug) {
//             return response(FaSleigh, 404, 'Product not found.')
//         }

//         filter.slug = slug

//         //get product
//         const getProduct = await ProductModel.findOne(filter).populate('media', 'secure_url').lean()

//         if(!getProduct){
//             return response(false, 404, 'Product not fount.')
//         }

        
//         // NEW: hide products belonging to a blocked shop, same as if they didn't exist
//         if (getProduct.shop) {
//             const owner = await (await import('@/models/User.model')).default.findOne({ shop: getProduct.shop, role: 'shop owner' }).select('isBlocked')
//             if (owner?.isBlocked) {
//                 return response(false, 404, 'Product not fount.')
//             }
//         }


//         //get product variant
//         const variantFilter = {
//             product: getProduct._id
//         }

//         if(size){
//             variantFilter.size = size
//         }
        
//         if(color){
//             variantFilter.color = color
//         }
        
//         const variant = await ProductVariantModel.findOne(variantFilter).populate('media','secure_url').lean()
       
//         if(!variant) {
//            return response(false, 404, 'Product not fount.')
//         }


//         //get color and size
//         const getColor = await ProductVariantModel.distinct('color', {product: getProduct._id})

//         const getSize = await ProductVariantModel.aggregate([
//                     {$match: {product: getProduct._id}},
//                     {$sort: {_id: 1} },
//                     {
//                         $group: {
//                             _id: "$size",
//                             first: { $first: "$_id" }
//                         }
//                     },
//                     { $sort: { first: 1 } },
//                     {$project: { _id: 0, size: "$_id"} }
//                 ])
      
//         // get review        
//         const review = await ReviewModel.countDocuments({ product: getProduct._id })

//         const productData = {
//             product: getProduct,
//             variant: variant,
//             colors: getColor,
//             sizes: getSize.length ? getSize.map(item => item.size): [],
//             reviewCount: review
//         }

//        return response(true, 200, 'Product data found.', productData)

//     } catch(error){
//         return catchError(error)
//     }
// }