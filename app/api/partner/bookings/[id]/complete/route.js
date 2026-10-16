import { NextResponse } from "next/server";
import connectDB from "@/lib/databaseConnection";
import { isAuthenticated } from "@/lib/authentication";
import Booking from "@/models/Booking.model";
import Labour from "@/models/Labour.model";

export async function POST(req, context) {
  try {
    const { id } = await context.params;
    await connectDB();

    const session = await isAuthenticated("laber");
    if (!session.isAuth) {
      return NextResponse.json({ message: "unauthorized" }, { status: 401 });
    }

    const { cashReceived } = await req.json().catch(() => ({}));

    const booking = await Booking.findById(id);
    if (!booking || String(booking.labour) !== String(session.userId)) {
      return NextResponse.json({ message: "Booking not found" }, { status: 404 });
    }
    if (booking.bookingStatus !== "confirmed") {
      return NextResponse.json({ message: "This job cannot be completed" }, { status: 400 });
    }
    if (booking.paymentMethod === "cash" && !cashReceived) {
      return NextResponse.json({ message: "Confirm that you received the cash" }, { status: 400 });
    }
    if (booking.paymentMethod === "online" && booking.paymentStatus !== "paid") {
      return NextResponse.json({ message: "Customer has not paid online yet" }, { status: 400 });
    }

    booking.bookingStatus = "completed";
    booking.completedAt = new Date();
    await booking.save();

    await Labour.updateOne({ _id: booking.labourProfile }, { $inc: { completedJobs: 1 } });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: `complete booking error ${error}` }, { status: 500 });
  }
}