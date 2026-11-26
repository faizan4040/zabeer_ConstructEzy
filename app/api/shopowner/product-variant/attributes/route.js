import connectDB from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperfunction"
import { isAuthenticated } from "@/lib/authentication"
import UserModel from "@/models/User.model"
import ProductModel from "@/models/Product.model"
import CategoryModel from "@/models/Category.model"
import { mergeAttributes } from "@/lib/mergeAttributes"

export async function GET(request) {
    try {
        await connectDB()

        const auth = await isAuthenticated("shop owner")
        if (!auth.isAuth) return response(false, 401, "Unauthorized.")

        const user = await UserModel.findOne({ _id: auth.userId, deletedAt: null }).select("shop")
        if (!user?.shop) return response(false, 400, "No shop linked to this account.")

        const { searchParams } = new URL(request.url)
        const productId = searchParams.get('productId')

        if (!productId) {
            return response(false, 400, 'productId is required.')
        }

        const product = await ProductModel.findOne({
            _id: productId,
            shop: user.shop,
            deletedAt: null,
        }).select('category')

        if (!product) {
            return response(false, 404, 'Product not found or not owned by you.')
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