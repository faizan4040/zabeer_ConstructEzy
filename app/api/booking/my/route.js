import { NextResponse } from "next/server";
import connectDB from "@/lib/databaseConnection";
import { isAuthenticated } from "@/lib/authentication";
import Booking from "@/models/Booking.model";
import "@/models/Labour.model";

export async function GET() {
  try {
    await connectDB();
    const session = await isAuthenticated();
    if (!session.isAuth) {
      return NextResponse.json({ message: "unauthorized" }, { status: 401 });
    }

    const rows = await Booking.find({ user: session.userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate({ path: "labourProfile", select: "fullName phone experienceYears profileImage rating" })
      .lean();

    const data = rows.map((b) => {
      // internal fields the customer should not see
      const {
        payoutId, payoutUtr, payoutRazorpayStatus, payoutError, payoutAt,
        adminCommission, labourAmount, rejectedBy, adminNote, ...safe
      } = b;
      // labour phone + profile only after the labour accepted
      const visible = ["confirmed", "completed"].includes(b.bookingStatus);
      return visible ? safe : { ...safe, labourMobileNumber: "", labourProfile: null };
    });

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: `my bookings error ${error}` }, { status: 500 });
  }
}