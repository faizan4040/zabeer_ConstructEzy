import { isAuthenticated } from "@/lib/authentication";
import connectDB from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperfunction";
import ServiceBooking from "@/models/ServiceBooking.model";
import { createOrder, rzConfigured, rzKeyId } from "@/lib/razorpayService";

export async function POST(_req, ctx) {
  try {
    const { id } = await ctx.params;
    const auth = await isAuthenticated();
    if (!auth.isAuth) return response(false, 401, "Please login.");
    if (!rzConfigured()) return response(false, 500, "Razorpay keys .env me nahi mili (RAZORPAY_KEY_ID aur RAZORPAY_KEY_SECRET set karo).");
    await connectDB();

    const b = await ServiceBooking.findOne({ _id: id, user: auth.userId });
    if (!b) return response(false, 404, "Booking not found");
    if (b.paymentMethod !== "online" || b.paymentStatus === "paid" || b.status !== "pending_payment")
      return response(false, 400, "Payment is not available for this booking.");

    // amount booking banne par fix ho chuka hai, isliye purana order dobara use hota hai (double order nahi banta)
    let orderId = b.razorpayOrderId;
    const amount = Math.round(b.total * 100);
    if (!orderId) {
      const order = await createOrder({ amountPaise: amount, receipt: `sb_${String(b._id).slice(-12)}`, notes: { serviceBookingId: String(b._id), bookingCode: b.bookingCode } });
      orderId = order.id;
      await ServiceBooking.updateOne({ _id: b._id }, { razorpayOrderId: orderId });
    }
    return response(true, 200, "OK", {
      orderId, amount, key: rzKeyId(), mode: b.paymentMode, contact: b.contactPhone,
      description: `${b.serviceTitle} (#${b.bookingCode})`,
    });
  } catch (e) { return catchError(e, e.message); }
}
