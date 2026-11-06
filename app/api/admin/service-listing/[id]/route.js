import { isAuthenticated } from "@/lib/authentication";
import connectDB from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperfunction";
import ServiceListing from "@/models/ServiceListing.model";

export async function GET(_req, ctx) {
  try {
    const auth = await isAuthenticated("admin");
    if (!auth.isAuth) return response(false, 403, "Unauthorized.");
    const { id } = await ctx.params;
    await connectDB();
    const doc = await ServiceListing.findOne({ _id: id, deletedAt: null }).lean();
    return doc ? response(true, 200, "OK", doc) : response(false, 404, "Not found");
  } catch (e) { return catchError(e); }
}
