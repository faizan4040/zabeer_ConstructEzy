import { isAuthenticated } from "@/lib/authentication";
import connectDB from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperfunction";
import ServiceListing from "@/models/ServiceListing.model";
import "@/models/ServiceCategory.model"; // populate ke liye model register hona chahiye
import { listingSchema } from "@/lib/serviceSchemas";
import { calcAmounts } from "@/lib/serviceWallet";

export async function GET(_req, ctx) {
  try {
    const { id } = await ctx.params;
    await connectDB();
    const doc = await ServiceListing.findOne({ _id: id, deletedAt: null, isActive: true })
      .select("-linkedLabourUser").populate("category", "name slug").lean();
    if (!doc) return response(false, 404, "Not found");
    return response(true, 200, "OK", { ...doc, pricing: calcAmounts(doc.price) });
  } catch (e) { return catchError(e); }
}

export async function PUT(req, ctx) {
  try {
    const auth = await isAuthenticated("admin");
    if (!auth.isAuth) return response(false, 403, "Unauthorized.");
    const { id } = await ctx.params;
    await connectDB();
    const parsed = listingSchema.partial().safeParse(await req.json());
    if (!parsed.success) return response(false, 400, parsed.error.issues[0]?.message || "Invalid data", parsed.error.flatten());
    const doc = await ServiceListing.findByIdAndUpdate(id, parsed.data, { new: true });
    return doc ? response(true, 200, "Updated", doc) : response(false, 404, "Not found");
  } catch (e) { return catchError(e); }
}

export async function DELETE(_req, ctx) {
  try {
    const auth = await isAuthenticated("admin");
    if (!auth.isAuth) return response(false, 403, "Unauthorized.");
    const { id } = await ctx.params;
    await connectDB();
    await ServiceListing.findByIdAndUpdate(id, { deletedAt: new Date() });
    return response(true, 200, "Moved to trash");
  } catch (e) { return catchError(e); }
}
