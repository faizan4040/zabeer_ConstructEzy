import { isAuthenticated } from "@/lib/authentication";
import connectDB from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperfunction";
import { finishJob } from "@/lib/serviceWallet";

// Labour (assigned) ya admin job complete mark kare
export async function PATCH(_req, ctx) {
  try {
    const { id } = await ctx.params;
    const auth = await isAuthenticated(["admin", "laber"]);
    if (!auth.isAuth) return response(false, 403, "Unauthorized");
    await connectDB();

    const filter = { _id: id };
    if (auth.role === "laber") filter.labourUser = auth.userId;
    const b = await finishJob(filter);
    if (!b) return response(false, 404, "Booking not found, unpaid or already completed.");
    return response(true, 200, "Marked completed", b);
  } catch (e) { return catchError(e); }
}
