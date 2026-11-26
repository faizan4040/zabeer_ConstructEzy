import { mergeAttributes } from "@/lib/mergeAttributes";
import { isAuthenticated } from "@/lib/authentication";
import connectDB from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperfunction";
import { createCategorySchema } from "@/lib/zodSchema";
import CategoryModel from "@/models/Category.model";

export async function POST(request) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()
        const payload = await request.json()

        const validate = createCategorySchema.safeParse(payload)
        if (!validate.success) {
            return response(false, 400, 'Invalid or missing fields.', validate.error)
        }

        const data = validate.data

        const newCategory = new CategoryModel({
            name: data.name,
            slug: data.slug,
            parent: data.parent || null,
            attributes: data.parent ? mergeAttributes(data.attributes) : [], // top-level categories don't need attributes; same-label attributes merged
        })

        await newCategory.save()

        return response(true, 200, 'Category added successfully.')

    } catch (error) {
        return catchError(error)
    }
}




// import { isAuthenticated } from "@/lib/authentication";
// import connectDB from "@/lib/databaseConnection";
// import { catchError, response } from "@/lib/helperfunction";
// import { zSchema } from "@/lib/zodSchema";
// import CategoryModel from "@/models/Category.model";


// export async function POST(request){
//     try{
//       const auth = await isAuthenticated('admin')
//       if(!auth.isAuth){
//         return response(false, 403, 'Unauthorized.')
//       }

//       await connectDB()
//       const payload = await request.json()
   
//       const schema = zSchema.pick({
//         name: true, slug: true
//       })

//       const validate = schema.safeParse(payload)
//       if(!validate.success){
//         return response(false, 400, 'Invalid or missing fields.', validate.error)
//       }

//       const {name, slug} = validate.data
//       const parent = payload.parent || null

//       // Case-insensitive duplicate check, scoped to the same parent
//       const existing = await CategoryModel.findOne({
//         parent: parent,
//         deletedAt: null,
//         $or: [
//           { name: { $regex: `^${name.trim()}$`, $options: 'i' } },
//           { slug: slug.trim().toLowerCase() },
//         ],
//       })

//       if(existing){
//         return response(false, 409, parent
//           ? 'A subcategory with this name already exists under the selected category.'
//           : 'A category with this name already exists.')
//       }

//       const newCategory = new CategoryModel({
//         name, slug, parent
//       })

//       await newCategory.save()

//       return response(true, 200, parent ? 'Subcategory added successfully.' : 'Category added successfully.')


//     }catch(error){
//       return catchError(error)
//     }
// }












// import { isAuthenticated } from "@/lib/authentication";
// import connectDB from "@/lib/databaseConnection";
// import { catchError, response } from "@/lib/helperfunction";
// import { zSchema } from "@/lib/zodSchema";
// import CategoryModel from "@/models/Category.model";


// export async function POST(request){
//     try{
//       const auth = await isAuthenticated('admin')
//       if(!auth.isAuth){
//         return response(false, 403, 'Unauthorized.')
//       }

//       await connectDB()
//       const payload = await request.json()
   
//       const schema = zSchema.pick({
//         name: true, slug: true
//       }) 

//       const validate = schema.safeParse(payload)
//       if(!validate.success){
//         return response(false, 400, 'Invalid or missing fields.', validate.error)
//       }

//       const {name, slug} = validate.data

//       const newCategory = new CategoryModel({
//         name, slug
//       })

//       await newCategory.save()

//       return response(true, 200, 'Category added successfully.')


//     }catch(error){
//       return catchError(error)
//     }
// }