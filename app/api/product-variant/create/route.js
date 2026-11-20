import { isAuthenticated } from "@/lib/authentication";
import connectDB from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperfunction";
import { buildVariantDocs, findConflicts } from "@/lib/variantBulk";
import ProductModel from "@/models/Product.model";
import ProductVariantModel from "@/models/ProductVariant.model";

// Body: { product, brand, media, variants: [{ attributes, sku, stock, mrp, sellingPrice }] }
// Old single-variant body ({ product, sku, attributes, ... }) is still accepted.
export async function POST(request){
    try{
      const auth = await isAuthenticated('admin')
      if(!auth.isAuth){
        return response(false, 403, 'Unauthorized.')
      }

      await connectDB()
      const payload = await request.json()
      if (!Array.isArray(payload?.variants)) {
        payload.variants = [payload]
      }

      const { error, docs } = buildVariantDocs(payload)
      if (error) return response(false, 400, error)

      const product = await ProductModel.findOne({ _id: docs[0].product, deletedAt: null }).select('_id')
      if (!product) return response(false, 404, 'Product not found.')

      const conflict = await findConflicts(ProductVariantModel, docs)
      if (conflict) return response(false, 409, conflict)

      await ProductVariantModel.insertMany(docs)

      return response(true, 200, docs.length === 1
        ? 'Product Variant added successfully.'
        : `${docs.length} variants added successfully.`)

    }catch(error){
      return catchError(error)
    }
}




// import { isAuthenticated } from "@/lib/authentication";
// import connectDB from "@/lib/databaseConnection";
// import { catchError, response } from "@/lib/helperfunction";
// import { zSchema } from "@/lib/zodSchema";
// import ProductVariantModel from "@/models/ProductVariant.model";


// export async function POST(request){
//     try{
//       const auth = await isAuthenticated('admin')
//       if(!auth.isAuth){
//         return response(false, 403, 'Unauthorized.')
//       }

//       await connectDB()
//       const payload = await request.json()
   
//           const schema = zSchema.pick({
//             product: true,        
//             sku: true,            
//             color: true,          
//             size: true,   
//             gender: true,
//             stock: true,  
//             mrp: true,
//             sellingPrice: true,
//             discountPercentage: true,
//             media: true,
//           })

//       const validate = schema.safeParse(payload)
//       console.log("API RECEIVED", payload)
//       console.log("STOCK TYPE", typeof payload.stock)
//       if(!validate.success){
//         return response(false, 400, 'Invalid or missing fields.', validate.error)
//       }

//       const variantData = validate.data

//       const newProductVariant = new ProductVariantModel({
//           product: variantData.product,
//           color: variantData.color,
//           size: variantData.size,
//           gender: variantData.gender,
//           sku: variantData.sku,
//           stock: variantData.stock,   
//           mrp: variantData.mrp,
//           sellingPrice: variantData.sellingPrice,
//           discountPercentage: variantData.discountPercentage,
//           media: variantData.media,
//       })
       
//       console.log("SAVING TO DB", variantData.stock)
//       await newProductVariant.save()
//       await newProductVariant.save()

//       console.log("DB SAVED", newProductVariant)

//       return response(true, 200, 'Product Variant added successfully.')


//     }catch(error){
//       return catchError(error)
//     }
// }





