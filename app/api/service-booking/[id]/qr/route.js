import { isAuthenticated } from "@/lib/authentication";
import connectDB from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperfunction";
import ServiceBooking from "@/models/ServiceBooking.model";
import { createPaymentQR } from "@/lib/razorpayQR";

// Labour site par customer se online payment lene ke liye QR banata hai
export async function POST(_req, ctx) {
  try {
    const { id } = await ctx.params;
    const auth = await isAuthenticated(["laber", "admin"]);
    if (!auth.isAuth) return response(false, 403, "Unauthorized");
    await connectDB();
    const filter = { _id: id, paymentStatus: "cash_due", status: { $in: ["confirmed", "in_progress"] } };
    if (auth.role === "laber") filter.labourUser = auth.userId;
    const b = await ServiceBooking.findOne(filter);
    if (!b) return response(false, 404, "Booking not found or already paid.");

    const qr = await createPaymentQR({ amount: b.total, orderId: b.bookingCode, description: `${b.serviceTitle} #${b.bookingCode}` });
    b.qrCodeId = qr.id;
    await b.save();
    return response(true, 200, "QR ready", { qrId: qr.id, imageUrl: qr.image_url, amount: b.total });
  } catch (e) { return catchError(e); }
}
