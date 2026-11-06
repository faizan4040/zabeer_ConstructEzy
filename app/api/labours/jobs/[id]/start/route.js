import { isAuthenticated } from "@/lib/authentication";
import connectDB from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperfunction";
import ServiceBooking from "@/models/ServiceBooking.model";
import Labour from "@/models/Labour.model";
import { emitJobUpdate } from "@/lib/realtime";

// Labour site par pahunch gaya -> "Start Work"
export async function PATCH(_req, ctx) {
  try {
    const { id } = await ctx.params;
    const auth = await isAuthenticated("laber");
    if (!auth.isAuth) return response(false, 403, "Unauthorized");
    await connectDB();

    // sirf "confirmed" start hoti hai: online booking jab tak pay na ho, "pending_payment" rehti hai
    const b = await ServiceBooking.findOneAndUpdate(
      { _id: id, labourUser: auth.userId, status: "confirmed" },
      { status: "in_progress", startedAt: new Date() },
      { new: true }
    );
    if (!b) return response(false, 404, "Job not found or already started.");
    await Labour.updateOne({ owner: auth.userId }, { availability: "busy" }).catch(() => {});
    emitJobUpdate(b, "job:started");
    return response(true, 200, "Work started", b);
  } catch (e) { return catchError(e); }
}
