import { isAuthenticated } from "@/lib/authentication";
import connectDB from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperfunction";
import ServiceBooking from "@/models/ServiceBooking.model";
import Labour from "@/models/Labour.model";
import { sendNotification } from "@/lib/notification";
import { emitJobUpdate, emitLive, labourRoom } from "@/lib/realtime";

// Admin labour ko call/message karke job deta hai -> labour ko notification + dashboard par job
// body: { labourUserId, note }
export async function POST(req, ctx) {
  try {
    const auth = await isAuthenticated("admin");
    if (!auth.isAuth) return response(false, 403, "Unauthorized.");
    const { id } = await ctx.params;
    await connectDB();
    const { labourUserId, note = "" } = await req.json();

    const labour = await Labour.findOne({ owner: labourUserId, status: "approved", isActive: true }).lean();
    if (!labour) return response(false, 404, "Approved labour not found.");

    const prev = await ServiceBooking.findById(id).select("labourUser status").lean();
    if (!prev) return response(false, 404, "Booking not found.");

    // kaam shuru hone ke baad labour nahi badalta (paisa galat labour ko na jaye)
    const b = await ServiceBooking.findOneAndUpdate(
      { _id: id, status: { $in: ["pending_payment", "confirmed"] } },
      {
        labourUser: labour.owner, labourName: labour.fullName, labourPhone: labour.phone,
        assignedAt: new Date(), adminNote: String(note).slice(0, 300),
      },
      { new: true }
    );
    if (!b) return response(false, 400, "Only bookings that have not started can be assigned.");

    const when = `${new Date(b.date).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short" })}, ${b.timeSlot}`;
    await sendNotification({
      userId: labour.owner, type: "labour_job", link: "/",
      title: "New job assigned",
      message: `${b.serviceTitle} · ${when} · ${b.address?.city || ""}. ${note ? `Note: ${note}` : ""}`.trim(),
    });
    emitLive(labourRoom(String(labour.owner)), "job:assigned", {
      bookingId: String(b._id), title: b.serviceTitle, when, city: b.address?.city || "",
    });
    // purane labour se job hat gayi to uska dashboard bhi refresh ho
    if (prev.labourUser && String(prev.labourUser) !== String(labour.owner)) {
      emitLive(labourRoom(String(prev.labourUser)), "job:removed", { bookingId: String(b._id) });
    }
    emitJobUpdate(b, "job:assigned");
    return response(true, 200, `Assigned to ${labour.fullName}`, b);
  } catch (e) { return catchError(e); }
}
