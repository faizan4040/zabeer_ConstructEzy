import { NextResponse } from "next/server";
import connectDB from "@/lib/databaseConnection";
import { isAuthenticated } from "@/lib/authentication";
import Booking from "@/models/Booking.model";
import { notifyUser, notifyAdmins } from "@/lib/bookingNotify";

// body: { method: "cash" | "online" }
export async function POST(req, context) {
  try {
    const { id } = await context.params;
    await connectDB();

    const session = await isAuthenticated();
    if (!session.isAuth) {
      return NextResponse.json({ message: "unauthorized" }, { status: 401 });
    }

    const { method } = await req.json();
    if (!["cash", "online"].includes(method)) {
      return NextResponse.json({ message: "Invalid payment method" }, { status: 400 });
    }

    const booking = await Booking.findById(id);
    if (!booking || String(booking.user) !== String(session.userId)) {
      return NextResponse.json({ message: "Booking not found" }, { status: 404 });
    }
    if (!["unassigned", "requested", "confirmed", "rejected"].includes(booking.bookingStatus)) {
      return NextResponse.json({ message: "Payment method can no longer be changed" }, { status: 400 });
    }
    if (booking.paymentStatus === "paid") {
      return NextResponse.json({ message: "Already paid online" }, { status: 400 });
    }

    booking.paymentMethod = method;
    booking.paymentStatus = method === "cash" ? "cash" : "pending";
    await booking.save();

    const payload = { bookingId: String(booking._id), status: booking.bookingStatus };
    await Promise.all([booking.labour ? notifyUser(booking.labour, payload) : null, notifyAdmins(payload)]);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: `payment method error ${error}` }, { status: 500 });
  }
}