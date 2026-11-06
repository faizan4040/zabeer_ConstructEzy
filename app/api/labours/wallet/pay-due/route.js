import { isAuthenticated } from "@/lib/authentication";
import connectDB from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperfunction";
import LabourWallet from "@/models/LabourWallet.model";
import { createOrder, rzConfigured, rzKeyId } from "@/lib/razorpayService";

// Labour cash jobs ka commission online pay kare (Razorpay order). Amount server decide karta hai.
export async function POST() {
  try {
    const auth = await isAuthenticated("laber");
    if (!auth.isAuth) return response(false, 403, "Unauthorized");
    if (!rzConfigured()) return response(false, 500, "Online payment is not configured.");
    await connectDB();
    const w = await LabourWallet.findOne({ user: auth.userId }).lean();
    const due = Math.round(Number(w?.pendingDue || 0) * 100) / 100;
    if (!(due >= 1)) return response(false, 400, "No commission due.");

    const order = await createOrder({
      amountPaise: Math.round(due * 100),
      receipt: `due_${String(auth.userId).slice(-8)}_${Date.now().toString(36)}`,
      notes: { purpose: "labour_commission_due", userId: String(auth.userId) },
    });
    return response(true, 200, "OK", { key: rzKeyId(), orderId: order.id, amount: order.amount, due });
  } catch (e) { return catchError(e, e.message); }
}
