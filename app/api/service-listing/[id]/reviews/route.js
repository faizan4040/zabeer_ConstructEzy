import connectDB from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperfunction";
import ServiceReview from "@/models/ServiceReview.model";

export async function GET(_req, ctx) {
  try {
    const { id } = await ctx.params;
    await connectDB();
    const items = await ServiceReview.find({ listing: id }).sort({ createdAt: -1 }).limit(50)
      .select("userName rating comment createdAt").lean();
    return response(true, 200, "OK", items);
  } catch (e) { return catchError(e); }
}
