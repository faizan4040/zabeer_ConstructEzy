import { NextResponse } from "next/server";
import connectDB from "@/lib/databaseConnection";
import { isAuthenticated } from "@/lib/authentication";
import Booking from "@/models/Booking.model";

export async function POST(req, context) {
  try {
    const { id } = await context.params;
    await connectDB();

    const session = await isAuthenticated();
    if (!session.isAuth) {
      return NextResponse.json({ message: "unauthorized" }, { status: 401 });
    }

    const booking = await Booking.findById(id);
    if (!booking || String(booking.user) !== String(session.userId)) {
      return NextResponse.json({ message: "Booking not found" }, { status: 404 });
    }
    // online payment opens only after the labour accepted
    if (
      booking.paymentMethod !== "online" ||
      booking.paymentStatus === "paid" ||
      !["confirmed", "completed"].includes(booking.bookingStatus)
    ) {
      return NextResponse.json({ message: "Payment is not available for this booking now" }, { status: 400 });
    }
    if (!booking.fare) {
      return NextResponse.json({ message: "Fare is not decided yet" }, { status: 400 });
    }

    const auth = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString("base64");
    const res = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Basic ${auth}` },
      body: JSON.stringify({
        amount: booking.fare * 100,
        currency: "INR",
        receipt: `bk_${String(booking._id).slice(-12)}`,
        notes: { bookingId: String(booking._id) },
      }),
    });
    const order = await res.json();
    if (!res.ok) {
      return NextResponse.json({ message: order?.error?.description || "Could not create payment" }, { status: 502 });
    }

    booking.razorpayOrderId = order.id;
    await booking.save();

    return NextResponse.json(
      { orderId: order.id, amount: order.amount, key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ message: `payment create error ${error}` }, { status: 500 });
  }
}