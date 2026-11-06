import { isAuthenticated } from "@/lib/authentication";
import connectDB from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperfunction";
import ServiceBooking from "@/models/ServiceBooking.model";
import { fetchPayment, verifySignature } from "@/lib/razorpayService";
import { settleOnlinePayment } from "@/lib/servicePayment";

export async function POST(req, ctx) {
  try {
    const { id } = await ctx.params;
    const auth = await isAuthenticated();
    if (!auth.isAuth) return response(false, 401, "Please login.");
    await connectDB();

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();
    const b = await ServiceBooking.findOne({ _id: id, user: auth.userId });
    if (!b || !razorpay_payment_id || b.razorpayOrderId !== razorpay_order_id) return response(false, 400, "Invalid payment.");
    if (!verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)) return response(false, 400, "Payment verification failed.");

    // Razorpay se payment ka asli method / amount lo (admin dashboard me dikhane ke liye)
    let method;
    try {
      const p = await fetchPayment(razorpay_payment_id);
      if (p.order_id !== razorpay_order_id || p.amount !== Math.round(b.total * 100)) return response(false, 400, "Payment amount mismatch.");
      method = p.method;
    } catch { /* signature verify ho chuka hai, isliye aage badho */ }

    const r = await settleOnlinePayment(id, { paymentId: razorpay_payment_id, method });
    return response(true, 200, "Payment successful", r.claimed || b);
  } catch (e) { return catchError(e, e.message); }
}
