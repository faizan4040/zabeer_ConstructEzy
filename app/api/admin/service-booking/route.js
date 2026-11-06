import { isAuthenticated } from "@/lib/authentication";
import connectDB from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperfunction";
import ServiceBooking from "@/models/ServiceBooking.model";
import UserModel from "@/models/User.model";
import { NextResponse } from "next/server";

const sum = (field) => [{ $group: { _id: null, n: { $sum: 1 }, amt: { $sum: field } } }];

// ?payment=online|cash &status=... &globalFilter=... &start &size
export async function GET(req) {
  try {
    const auth = await isAuthenticated("admin");
    if (!auth.isAuth) return response(false, 403, "Unauthorized.");
    await connectDB();
    void UserModel; // populate ke liye model register

    const sp = new URL(req.url).searchParams;
    const start = parseInt(sp.get("start") || "0"), size = Math.min(200, parseInt(sp.get("size") || "10"));
    const g = (sp.get("globalFilter") || "").trim();
    const q = {};
    if (["online", "cash"].includes(sp.get("payment"))) q.paymentMethod = sp.get("payment");
    if (["pending_payment", "confirmed", "in_progress", "completed", "cancelled"].includes(sp.get("status"))) q.status = sp.get("status");
    if (g) {
      const rx = new RegExp(g.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      q.$or = [{ bookingCode: rx }, { serviceTitle: rx }, { labourName: rx }, { contactPhone: rx }, { razorpayPaymentId: rx }];
    }

    const [data, total, [facet]] = await Promise.all([
      ServiceBooking.find(q).sort({ createdAt: -1 }).skip(start).limit(size).populate("user", "name email phone").lean(),
      ServiceBooking.countDocuments(q),
      ServiceBooking.aggregate([{ $facet: {
        all: [{ $count: "n" }],
        online: [{ $match: { paymentStatus: "paid" } }, ...sum("$total")],
        cashDone: [{ $match: { paymentStatus: "cash_collected" } }, ...sum("$total")],
        cashDue: [{ $match: { paymentStatus: "cash_due", status: { $ne: "cancelled" } } }, ...sum("$total")],
        unpaid: [{ $match: { status: "pending_payment", paymentStatus: { $in: ["pending", "failed"] } } }, ...sum("$total")],
        commission: [{ $match: { $or: [{ paymentStatus: "paid" }, { paymentStatus: "cash_collected" }] } }, { $group: { _id: null, amt: { $sum: { $add: ["$commission", "$platformFee"] } } } }],
        refund: [{ $match: { status: "cancelled", paymentStatus: "paid" } }, ...sum("$total")],
      } }]),
    ]);
    const f = (k) => facet[k]?.[0] || { n: 0, amt: 0 };
    const stats = {
      bookings: facet.all?.[0]?.n || 0, online: f("online"), cashCollected: f("cashDone"), cashPending: f("cashDue"),
      unpaid: f("unpaid"), platformEarning: facet.commission?.[0]?.amt || 0, refundNeeded: f("refund"),
    };
    return NextResponse.json({ success: true, data, meta: { totalRowCount: total, stats } });
  } catch (e) { return catchError(e); }
}
