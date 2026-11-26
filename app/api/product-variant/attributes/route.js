import { isAuthenticated } from "@/lib/authentication";
import connectDB from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperfunction";
import ProductModel from "@/models/Product.model";
import CategoryModel from "@/models/Category.model"
import { mergeAttributes } from "@/lib/mergeAttributes";

export async function GET(request) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()

        const { searchParams } = new URL(request.url)
        const productId = searchParams.get('productId')

        if (!productId) {
            return response(false, 400, 'productId is required.')
        }

        const product = await ProductModel.findOne({ _id: productId, deletedAt: null }).select('category')
        if (!product) {
            return response(false, 404, 'Product not found.')
        }

        const category = await CategoryModel.findOne({ _id: product.category, deletedAt: null }).select('name attributes')
        if (!category) {
            return response(false, 404, 'Category not found.')
        }

        return response(true, 200, 'Attributes fetched.', {
            categoryName: category.name,
            // same-label attributes (e.g. "kg" twice) merged into one
            attributes: mergeAttributes(category.attributes),
        })

    } catch (error) {
        return catchError(error)
    }
}