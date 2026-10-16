import crypto from "crypto";
import { NextResponse } from "next/server";
import connectDB from "@/lib/databaseConnection";
import { isAuthenticated } from "@/lib/authentication";
import Booking from "@/models/Booking.model";
import { notifyUser, notifyAdmins } from "@/lib/bookingNotify";

export async function POST(req, context) {
  try {
    const { id } = await context.params;
    await connectDB();

    const session = await isAuthenticated();
    if (!session.isAuth) {
      return NextResponse.json({ message: "unauthorized" }, { status: 401 });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ message: "Missing payment details" }, { status: 400 });
    }

    const booking = await Booking.findById(id);
    if (!booking || String(booking.user) !== String(session.userId)) {
      return NextResponse.json({ message: "Booking not found" }, { status: 404 });
    }
    if (booking.paymentStatus === "paid") {
      return NextResponse.json({ success: true }, { status: 200 });
    }
    if (booking.razorpayOrderId !== razorpay_order_id) {
      return NextResponse.json({ message: "Order mismatch" }, { status: 400 });
    }

    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const a = Buffer.from(expected);
    const b = Buffer.from(String(razorpay_signature));
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      booking.paymentStatus = "failed";
      await booking.save();
      return NextResponse.json({ message: "Payment verification failed" }, { status: 400 });
    }

    booking.paymentStatus = "paid";
    booking.razorpayPaymentId = razorpay_payment_id;
    booking.payoutStatus = "pending"; // admin sends this to the labour's bank
    await booking.save();

    const payload = { bookingId: String(booking._id), status: booking.bookingStatus };
    await Promise.all([booking.labour ? notifyUser(booking.labour, payload) : null, notifyAdmins(payload)]);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: `payment verify error ${error}` }, { status: 500 });
  }
}