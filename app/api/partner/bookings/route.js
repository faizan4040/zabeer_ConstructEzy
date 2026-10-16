import { NextResponse } from "next/server";
import connectDB from "@/lib/databaseConnection";
import { isAuthenticated } from "@/lib/authentication";
import Booking from "@/models/Booking.model";

// Labour sees: new requests, accepted jobs, completed jobs.
// Customer phone + address are included on purpose.
export async function GET() {
  try {
    await connectDB();
    const session = await isAuthenticated("laber");
    if (!session.isAuth) {
      return NextResponse.json({ message: "unauthorized" }, { status: 401 });
    }

    const rows = await Booking.find({
      labour: session.userId,
      bookingStatus: { $in: ["requested", "confirmed", "completed"] },
    })
      .sort({ visitAt: 1 })
      .limit(150)
      .select(
        "-adminNote -razorpayOrderId -razorpayPaymentId -rejectedBy -payoutId -payoutError -payoutRazorpayStatus -adminCommission"
      )
      .lean();

    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: `partner bookings error ${error}` }, { status: 500 });
  }
}
