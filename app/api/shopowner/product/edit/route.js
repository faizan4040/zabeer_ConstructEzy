import connectDB from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperfunction";
import { isAuthenticated } from "@/lib/authentication";
import { zSchema } from "@/lib/zodSchema";
import ProductModel from "@/models/Product.model";
import UserModel from "@/models/User.model";
import ShopModel from "@/models/Shop.model";
import { listingOptionsSchema, pickListingOptions } from "@/lib/listingOptions";
import { shopCoords } from "@/lib/delivery";

export async function PUT(request) {
  try {
    await connectDB();

    const auth = await isAuthenticated("shop owner");
    if (!auth.isAuth) return response(false, 401, "Unauthorized.");

    const user = await UserModel.findOne({ _id: auth.userId, deletedAt: null }).select("shop");
    if (!user?.shop) return response(false, 400, "No shop linked to this account.");

    const payload = await request.json();
    const { _id, ...rest } = payload;

    if (!_id) return response(false, 400, "Product id is required.");

    const validationSchema = zSchema.pick({
      name: true,
      slug: true,
      category: true,
      mrp: true,
      sellingPrice: true,
      discountPercentage: true,
      media: true,
      description: true,
      isReturnable: true,   // ✅ ADD
    });

    const validatedData = validationSchema.safeParse(rest);
    if (!validatedData.success) {
      return response(false, 401, "Invalid or missing input field.", validatedData.error);
    }

    const product = await ProductModel.findOne({ _id, shop: user.shop, deletedAt: null });
    if (!product) return response(false, 404, "Product not found or not owned by you.");

    const options = listingOptionsSchema.safeParse(pickListingOptions(rest));
    if (!options.success) {
      return response(false, 400, options.error.issues?.[0]?.message || "Invalid sample / delivery settings.");
    }
    if (options.data.deliveryType !== "free") {
      const shop = await ShopModel.findById(user.shop).select("location").lean();
      if (!shopCoords(shop)) {
        return response(false, 400, "Please enable your shop location first — paid delivery is calculated from your shop to the buyer.");
      }
    }

    Object.assign(product, validatedData.data, options.data);
    await product.save();

    return response(true, 200, "Product updated successfully.", product);
  } catch (error) {
    return catchError(error);
  }
}