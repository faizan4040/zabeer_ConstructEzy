import { NextResponse } from "next/server";
import connectDB from "@/lib/databaseConnection";
import { isAuthenticated } from "@/lib/authentication";
import Booking from "@/models/Booking.model";

// New requests that were sent to THIS labour (booking.labour = labour's user id)
export async function GET() {
  try {
    await connectDB();

    const session = await isAuthenticated("laber");
    if (!session.isAuth) {
      return NextResponse.json({ message: "unauthorized" }, { status: 401 });
    }

    const rows = await Booking.find({
      labour: session.userId,
      bookingStatus: "requested",
    })
      .sort({ visitAt: 1 })
      .select(
        "-adminNote -razorpayOrderId -razorpayPaymentId -rejectedBy -payoutId -payoutError -payoutRazorpayStatus -adminCommission"
      )
      .lean();

    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: `fetch pending req error ${error}` }, { status: 500 });
  }
}
