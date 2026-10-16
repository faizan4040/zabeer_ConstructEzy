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

    const booking = await Booking.findById(id);
    if (!booking || String(booking.user) !== String(session.userId)) {
      return NextResponse.json({ message: "Booking not found" }, { status: 404 });
    }
    if (!["unassigned", "requested", "confirmed", "rejected"].includes(booking.bookingStatus)) {
      return NextResponse.json({ message: "This booking can no longer be cancelled" }, { status: 400 });
    }
    if (booking.paymentStatus === "paid") {
      return NextResponse.json(
        { message: "Online payment is done. Please contact support for cancellation / refund" },
        { status: 400 }
      );
    }

    booking.bookingStatus = "cancelled";
    booking.cancelledAt = new Date();
    booking.cancellationReason = "Cancelled by customer";
    await booking.save();

    const payload = { bookingId: String(booking._id), status: "cancelled" };
    await Promise.all([booking.labour ? notifyUser(booking.labour, payload) : null, notifyAdmins(payload)]);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: `cancel booking error ${error}` }, { status: 500 });
  }
}