import { isAuthenticated } from "@/lib/authentication";
import connectDB from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperfunction";
import { fetchPayment, verifySignature } from "@/lib/razorpayService";
import { settleDue } from "@/lib/serviceWallet";

export async function POST(req) {
  try {
    const auth = await isAuthenticated("laber");
    if (!auth.isAuth) return response(false, 403, "Unauthorized");
    await connectDB();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();
    if (!razorpay_payment_id || !verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature))
      return response(false, 400, "Payment verification failed.");

    // asli amount aur owner Razorpay se lo — client ka bheja amount kabhi trust nahi
    const p = await fetchPayment(razorpay_payment_id);
    if (p.order_id !== razorpay_order_id || !["captured", "authorized"].includes(p.status))
      return response(false, 400, "Payment not completed.");
    if (p.notes?.userId && p.notes.userId !== String(auth.userId)) return response(false, 400, "Payment does not belong to you.");

    const r = await settleDue(auth.userId, p.amount / 100, { via: "online", ref: `rzp:${razorpay_payment_id}` });
    return response(true, 200, r.duplicate ? "Already counted" : "Commission paid", { settled: r.settled || 0 });
  } catch (e) { return catchError(e, e.message); }
}
