import { isAuthenticated } from "@/lib/authentication";
import connectDB from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperfunction";
import ServiceBooking from "@/models/ServiceBooking.model";
import { getPaymentQRStatus } from "@/lib/razorpayQR";
import { finishJob } from "@/lib/serviceWallet";

// Razorpay se server-to-server status check. Wallet credit sirf yahin se (client trust nahi).
export async function GET(_req, ctx) {
  try {
    const { id } = await ctx.params;
    const auth = await isAuthenticated(["laber", "admin"]);
    if (!auth.isAuth) return response(false, 403, "Unauthorized");
    await connectDB();
    const filter = { _id: id };
    if (auth.role === "laber") filter.labourUser = auth.userId;
    const b = await ServiceBooking.findOne(filter);
    if (!b || !b.qrCodeId) return response(false, 404, "No QR for this booking");
    if (b.paymentStatus === "paid") return response(true, 200, "Paid", { paid: true });

    const qr = await getPaymentQRStatus(b.qrCodeId);
    const received = Number(qr.payments_amount_received || 0);
    if (received >= Math.round(b.total * 100)) {
      const claimed = await ServiceBooking.findOneAndUpdate(
        { _id: id, paymentStatus: "cash_due", status: { $in: ["confirmed", "in_progress"] } },
        { paymentMethod: "online", paymentStatus: "paid", paidAt: new Date(), razorpayPaymentId: `qr:${b.qrCodeId}` },
        { new: true }
      );
      // QR scan = customer ne pay kar diya, kaam finish: commission auto cut, baaki wallet me
      if (claimed) await finishJob({ _id: claimed._id });
      return response(true, 200, "Paid", { paid: true });
    }
    return response(true, 200, "Waiting", { paid: false, closed: qr.status === "closed" });
  } catch (e) { return catchError(e); }
}
