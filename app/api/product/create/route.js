import { isAuthenticated } from "@/lib/authentication";
import connectDB from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperfunction";
import { zSchema } from "@/lib/zodSchema";
import ProductModel from "@/models/Product.model";
import { encode } from "entities";
import { uniqueSlug } from "@/lib/uniqueSlug";


export async function POST(request){
    try{
      const auth = await isAuthenticated('admin')
      if(!auth.isAuth){
        return response(false, 403, 'Unauthorized.')
      }

      await connectDB()
      const payload = await request.json()
   
         const schema = zSchema.pick({
            name: true, 
            slug: true,
            category: true,
            mrp: true,
            sellingPrice: true,
            discountPercentage: true,
            description: true,
            media: true,
          }) 

      const validate = schema.safeParse(payload)
      if(!validate.success){
        return response(false, 400, 'Invalid or missing fields.', validate.error)
      }

      const productData = validate.data

      // Trashed products keep their slug in the DB (unique index) → pick next free slug
      productData.slug = await uniqueSlug(ProductModel, productData.slug)

      const newProduct = new ProductModel({
          name: productData.name,
          slug: productData.slug,
          category: productData.category,
          mrp: productData.mrp,
          sellingPrice: productData.sellingPrice,
          discountPercentage: productData.discountPercentage,
          description: encode(productData.description), 
          media: productData.media,
          createdBy: auth.userId,
      })

      await newProduct.save()

      return response(true, 200, 'Product added successfully.')


    }catch(error){
      return catchError(error)
    }
}









// import { isAuthenticated } from "@/lib/authentication";
// import connectDB from "@/lib/databaseConnection";
// import { catchError, response } from "@/lib/helperfunction";
// import { zSchema } from "@/lib/zodSchema";
// import ProductModel from "@/models/Product.model";
// import { encode } from "entities";


// export async function POST(request){
//     try{
//       const auth = await isAuthenticated('admin')
//       if(!auth.isAuth){
//         return response(false, 403, 'Unauthorized.')
//       }

//       await connectDB()
//       const payload = await request.json()
   
//          const schema = zSchema.pick({
//             name: true, 
//             slug: true,
//             category: true,
//             mrp: true,
//             sellingPrice: true,
//             discountPercentage: true,
//             description: true,
//             media: true,
//           }) 

//       const validate = schema.safeParse(payload)
//       if(!validate.success){
//         return response(false, 400, 'Invalid or missing fields.', validate.error)
//       }

//       const productData = validate.data

//       const newProduct = new ProductModel({
//           name: productData.name,
//           slug: productData.slug,
//           category: productData.category,
//           mrp: productData.mrp,
//           sellingPrice: productData.sellingPrice,
//           discountPercentage: productData.discountPercentage,
//           description: encode(productData.description), 
//           media: productData.media,
//       })

//       await newProduct.save()

//       return response(true, 200, 'Product added successfully.')


//     }catch(error){
//       return catchError(error)
//     }
// }