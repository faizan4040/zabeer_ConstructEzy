import { NextResponse } from "next/server";
import connectDB from "@/lib/databaseConnection";
import { isAuthenticated } from "@/lib/authentication";
import Booking from "@/models/Booking.model";
import { notifyUser, notifyAdmins } from "@/lib/bookingNotify";

export async function POST(req, context) {
  try {
    const { id } = await context.params;
    await connectDB();

    const session = await isAuthenticated("laber");
    if (!session.isAuth) {
      return NextResponse.json({ message: "unauthorized" }, { status: 401 });
    }

    // atomic: only a "requested" booking of THIS labour can be accepted
    const booking = await Booking.findOneAndUpdate(
      { _id: id, labour: session.userId, bookingStatus: "requested" },
      { $set: { bookingStatus: "confirmed", acceptedAt: new Date() } },
      { new: true }
    );
    if (!booking) {
      return NextResponse.json({ message: "This request is no longer available" }, { status: 400 });
    }

    const payload = { bookingId: String(booking._id), status: "confirmed" };
    await Promise.all([notifyUser(booking.user, payload), notifyAdmins(payload)]);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: `accept error ${error}` }, { status: 500 });
  }
}