import { isAuthenticated } from "@/lib/authentication";
import connectDB from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperfunction";
import ServiceBooking from "@/models/ServiceBooking.model";
import ServiceReview from "@/models/ServiceReview.model";
import ServiceListing from "@/models/ServiceListing.model";
import UserModel from "@/models/User.model";
import { z } from "zod";

const schema = z.object({ rating: z.coerce.number().int().min(1).max(5), comment: z.string().max(600).optional() });

export async function POST(req, ctx) {
  try {
    const { id } = await ctx.params;
    const auth = await isAuthenticated();
    if (!auth.isAuth) return response(false, 401, "Unauthorized");
    await connectDB();
    const p = schema.safeParse(await req.json());
    if (!p.success) return response(false, 400, "Rating 1-5 required");

    const b = await ServiceBooking.findOneAndUpdate(
      { _id: id, user: auth.userId, status: "completed", reviewed: false },
      { reviewed: true }, { new: true }
    );
    if (!b) return response(false, 400, "You can review only completed, un-reviewed bookings.");

    const u = await UserModel.findById(auth.userId).select("name").lean();
    await ServiceReview.create({
      booking: b._id, listing: b.listing, user: auth.userId,
      userName: u?.name || "Customer", rating: p.data.rating, comment: p.data.comment || "",
    });
    const [agg] = await ServiceReview.aggregate([
      { $match: { listing: b.listing } },
      { $group: { _id: null, avg: { $avg: "$rating" }, n: { $sum: 1 } } },
    ]);
    await ServiceListing.updateOne({ _id: b.listing }, { rating: Math.round((agg?.avg || 0) * 10) / 10, reviewCount: agg?.n || 0 });
    return response(true, 200, "Thanks for your review!");
  } catch (e) { return catchError(e); }
}
