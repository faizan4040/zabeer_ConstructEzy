import connectDB from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperfunction";
import CategoryModel from "@/models/Category.model";
import ProductModel from "@/models/Product.model";
import { sanitizeProductForBuyer } from "@/lib/delivery";


export async function GET(request) {

    try{
       
     await connectDB()
       
     const searchParams = request.nextUrl.searchParams

     const brand = searchParams.get('brand')
     const inStock = searchParams.get('inStock')
     const minPrice = parseInt(searchParams.get('minPrice')) || 0
     const maxPrice = parseInt(searchParams.get('maxPrice')) || 100000
     const categorySlug = searchParams.get('category')
     const search = searchParams.get('q')

     const limit = parseInt(searchParams.get('limit')) || 9
     const page = parseInt(searchParams.get('page')) || 0
     const skip = page * limit

     const sortOption = searchParams.get('sort') || 'default_sorting'
     let sortquery = {}
     if (sortOption === 'default_sorting') sortquery = { createdAt: -1 }
     if (sortOption === 'asc') sortquery = { name: 1 }
     if (sortOption === 'desc') sortquery = { name: -1 }
     if (sortOption === 'price_low_high') sortquery = { sellingPrice: 1 }
     if (sortOption === 'price_high_low') sortquery = { sellingPrice: -1 }

     // ===== NEW: parent select ho to uski sub-categories ke products bhi aayenge =====
     let categoryId = []
     if(categorySlug){
         const slugs = categorySlug.split(',')

         const selected = await CategoryModel.find({ deletedAt: null, slug: { $in: slugs } })
           .select('_id').lean()
         const selectedIds = selected.map(category => category._id)

         const children = await CategoryModel.find({ deletedAt: null, parent: { $in: selectedIds } })
           .select('_id').lean()

         categoryId = [...selectedIds, ...children.map(category => category._id)]
     }

     let matchStage = {}
     if(categoryId.length > 0) matchStage.category = { $in: categoryId }
     if(search) matchStage.name = { $regex: search, $options: 'i' }

     const products = await ProductModel.aggregate([
        
         { $match: matchStage },
         { $sort: sortquery },
         { $skip: skip },
         { $limit: limit + 1 },

         {
           $lookup: {
             from: 'productvariants',
             localField: '_id',
             foreignField: 'product',
             as: 'variants'
           }
         },

         {
           $addFields: {
             variants: {
               $filter: {
                 input: "$variants",
                 as: "variant",
                 cond: {
                   $and: [
                     brand   ? { $in: ["$$variant.brand", brand.split(',')] } : { $literal: true },
                     inStock === 'true' ? { $gt: ["$$variant.stock", 0] }    : { $literal: true },
                     { $gte: ["$$variant.sellingPrice", minPrice] },
                     { $lte: ["$$variant.sellingPrice", maxPrice] },
                   ],
                 },
               },
             },
           },
         },

         {
           $match: {
             $expr: { $gt: [{ $size: "$variants" }, 0] }
           }
         },

         {
           $lookup: {
             from: 'media',
             localField: 'media',
             foreignField: '_id',
             as: 'media'
           }
         },

         {
           $project: {
             _id: 1,
             name: 1,
             slug: 1,
             mrp: 1,
             sellingPrice: 1,
             discountPercentage: 1,
             deliveryType: 1,
             deliveryRatePerKm: 1,
             media: {
               _id: 1,
               secure_url: 1,
               alt: 1
             },
             variants: {
               brand: 1,
               mrp: 1,
               sellingPrice: 1,
               discountPercentage: 1,
               stock: 1,
             }
           }
         }
     ])

     let nextPage = null
     if(products.length > limit){
        nextPage = page + 1
        products.pop()
     }

     // deliveryType buyer ko nahi bhejte — sirf { mode, ratePerKm }
     return response(true, 200, 'Product data found', { products: products.map(sanitizeProductForBuyer), nextPage })

    } catch(error){
        return catchError(error)
    }
}




