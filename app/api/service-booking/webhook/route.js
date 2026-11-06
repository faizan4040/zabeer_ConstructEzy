import { NextResponse } from "next/server";
import connectDB from "@/lib/databaseConnection";
import ServiceBooking from "@/models/ServiceBooking.model";
import { verifyWebhook } from "@/lib/razorpayService";
import { settleOnlinePayment } from "@/lib/servicePayment";

export const runtime = "nodejs";

// Razorpay Dashboard > Webhooks: URL = https://<domain>/api/service-booking/webhook
// Events: payment.captured, order.paid, payment.failed. Secret = RAZORPAY_WEBHOOK_SECRET
// Isse payment tab bhi record ho jata hai jab user paise dekar tab/browser band kar de.
export async function POST(req) {
  const raw = await req.text();
  if (!verifyWebhook(raw, req.headers.get("x-razorpay-signature"))) return NextResponse.json({ ok: false }, { status: 400 });
  try {
    const evt = JSON.parse(raw);
    const pay = evt.payload?.payment?.entity;
    if (pay?.order_id) {
      await connectDB();
      const b = await ServiceBooking.findOne({ razorpayOrderId: pay.order_id });
      if (b) {
        if (["payment.captured", "order.paid"].includes(evt.event) && pay.amount === Math.round(b.total * 100))
          await settleOnlinePayment(b._id, { paymentId: pay.id, method: pay.method });
        else if (evt.event === "payment.failed")
          await ServiceBooking.updateOne({ _id: b._id, paymentStatus: "pending" }, { paymentStatus: "failed" });
      }
    }
  } catch (e) { console.error("service webhook error", e); }
  return NextResponse.json({ ok: true });
}
