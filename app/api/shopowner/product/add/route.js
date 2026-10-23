import connectDB from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperfunction"
import { isAuthenticated } from "@/lib/authentication"
import { zSchema } from "@/lib/zodSchema"
import UserModel from "@/models/User.model"
import ProductModel from "@/models/Product.model"

export async function POST(request) {
  try {
    await connectDB()

    const auth = await isAuthenticated("shop owner")
    if (!auth.isAuth) return response(false, 401, "Unauthorized.")

    const user = await UserModel.findOne({ _id: auth.userId, deletedAt: null }).select("shop")
    if (!user?.shop) return response(false, 400, "No shop linked to this account.")

    const payload = await request.json()

    const validationSchema = zSchema.pick({
      name: true,
      slug: true,
      category: true,
      mrp: true,
      sellingPrice: true,
      discountPercentage: true,
      description: true,
      media: true,
      // isReturnable: true,
    })

    const validatedData = validationSchema.safeParse(payload)
    if (!validatedData.success) {
      return response(false, 401, "Invalid or missing input field.", validatedData.error)
    }

    const newProduct = new ProductModel({
      ...validatedData.data,
      createdBy: auth.userId,
      shop: user.shop,
    })

    await newProduct.save()

    return response(true, 200, "Product added successfully.", newProduct)
  } catch (error) {
    return catchError(error)
  }
}







// import connectDB from "@/lib/databaseConnection"
// import { catchError, response } from "@/lib/helperfunction"
// import { isAuthenticated } from "@/lib/authentication"
// import { zSchema } from "@/lib/zodSchema"
// import UserModel from "@/models/User.model"
// import ProductModel from "@/models/Product.model"

// export async function POST(request) {
//   try {
//     await connectDB()

//     const auth = await isAuthenticated("shop owner")
//     if (!auth.isAuth) return response(false, 401, "Unauthorized.")

//     const user = await UserModel.findOne({ _id: auth.userId, deletedAt: null }).select("shop")
//     if (!user?.shop) return response(false, 400, "No shop linked to this account.")

//     const payload = await request.json()

//     const validationSchema = zSchema.pick({
//       name: true,
//       slug: true,
//       category: true,
//       mrp: true,
//       sellingPrice: true,
//       discountPercentage: true,
//       description: true,
//       media: true,
//     })

//     const validatedData = validationSchema.safeParse(payload)
//     if (!validatedData.success) {
//       return response(false, 401, "Invalid or missing input field.", validatedData.error)
//     }

//     const newProduct = new ProductModel({
//       ...validatedData.data,
//       createdBy: auth.userId,
//       shop: user.shop,
//     })

//     await newProduct.save()

//     return response(true, 200, "Product added successfully.", newProduct)
//   } catch (error) {
//     return catchError(error)
//   }
// }






