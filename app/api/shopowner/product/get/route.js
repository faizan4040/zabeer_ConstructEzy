import connectDB from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperfunction";
import { isAuthenticated } from "@/lib/authentication";
import ProductModel from "@/models/Product.model";
import UserModel from "@/models/User.model";
import mongoose from "mongoose";

export async function GET(request) {
  try {
    await connectDB();

    const auth = await isAuthenticated("shop owner");
    if (!auth.isAuth) return response(false, 401, "Unauthorized.");

    const user = await UserModel.findOne({ _id: auth.userId, deletedAt: null }).select("shop");
    if (!user?.shop) return response(false, 400, "No shop linked to this account.");

    // ?id=<productId> → single product (edit page ke liye)
    const id = request?.nextUrl?.searchParams?.get("id");
    if (id) {
      if (!mongoose.isValidObjectId(id)) return response(false, 400, "Invalid product id.");
      const product = await ProductModel.findOne({ _id: id, shop: user.shop, deletedAt: null })
        .populate("media", "_id secure_url")
        .populate("category", "name")
        .lean();
      if (!product) return response(false, 404, "Product not found.");
      return response(true, 200, "Product found.", product);
    }

    const products = await ProductModel.find({ shop: user.shop, deletedAt: null })
      .populate("media", "_id secure_url")
      .populate("category", "name")
      .sort({ createdAt: -1 })
      .lean();

    return response(true, 200, "Products found.", products);
  } catch (error) {
    return catchError(error);
  }
}
