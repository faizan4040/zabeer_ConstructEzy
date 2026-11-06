import { isAuthenticated } from "@/lib/authentication";
import connectDB from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperfunction";
import ServiceBooking from "@/models/ServiceBooking.model";
import { slotStart, istYMD } from "@/lib/serviceConstants";

export async function GET(_req, ctx) {
  try {
    const { id } = await ctx.params;
    const auth = await isAuthenticated();
    if (!auth.isAuth) return response(false, 401, "Unauthorized");
    await connectDB();
    const b = await ServiceBooking.findOne({ _id: id, user: auth.userId }).lean();
    if (!b) return response(false, 404, "Booking not found");
    return response(true, 200, "OK", b);
  } catch (e) { return catchError(e); }
}

// Cancel: free tak service se 2 ghante pehle. Online paid booking ka refund admin se hota hai.
export async function PATCH(req, ctx) {
  try {
    const { id } = await ctx.params;
    const auth = await isAuthenticated();
    if (!auth.isAuth) return response(false, 401, "Unauthorized");
    await connectDB();
    const { reason = "" } = await req.json().catch(() => ({}));

    const b = await ServiceBooking.findOne({ _id: id, user: auth.userId });
    if (!b) return response(false, 404, "Booking not found");
    if (!["pending_payment", "confirmed"].includes(b.status)) return response(false, 400, "This booking can't be cancelled.");
    if (b.paymentStatus === "paid") return response(false, 400, "Paid booking: please contact support for cancellation & refund.");
    if (slotStart(istYMD(b.date), b.timeSlot) - Date.now() < 2 * 60 * 60 * 1000)
      return response(false, 400, "Free cancellation is allowed only up to 2 hours before the service.");

    const upd = await ServiceBooking.findOneAndUpdate(
      { _id: id, status: { $in: ["pending_payment", "confirmed"] }, paymentStatus: { $ne: "paid" } },
      { status: "cancelled", cancelledAt: new Date(), cancelReason: String(reason).slice(0, 200) },
      { new: true }
    );
    return upd ? response(true, 200, "Booking cancelled", upd) : response(false, 409, "Could not cancel. Refresh and try again.");
  } catch (e) { return catchError(e); }
}
