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


        // all live variants of this product (the page switches between them on the client)
        const variants = await ProductVariantModel.find({ product: getProduct._id, deletedAt: null })
            .select('attributes mrp sellingPrice discountPercentage stock sku media brand requiresCustomSize priceUnit')
            .populate('media', 'secure_url')
            .sort({ createdAt: 1 })
            .lean()

        if (variants.length === 0) {
           return response(false, 404, 'Product not fount.')
        }

        // pick the variant asked for in the URL, e.g. ?Weight=200g&Color=Red
        const wanted = []
        for (const [label, value] of searchParams.entries()) {
            if (value) wanted.push({ label, value })
        }
        const matches = (v) => wanted.every((w) => v.attributes?.some((a) => a.label === w.label && a.value === w.value))
        const variant =
            (wanted.length && variants.find(matches)) ||
            variants.find((v) => v.stock > 0) ||
            variants[0]

        // option values per label, in the order variants were added
        // e.g. { Weight: ["100g","200g","500g"], Color: ["Red","White"] }
        const attributeGroups = {}
        variants.forEach((v) => {
            (v.attributes || []).forEach(({ label, value }) => {
                if (!attributeGroups[label]) attributeGroups[label] = []
                if (!attributeGroups[label].includes(value)) attributeGroups[label].push(value)
            })
        })

        // get review
        const review = await ReviewModel.countDocuments({ product: getProduct._id })

        // deliveryType (e.g. "constructezy") buyer ko kabhi nahi bhejte — sirf { mode, ratePerKm }
        const productData = {
            product: sanitizeProductForBuyer(getProduct),
            variant: variant,
            variants: variants,
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