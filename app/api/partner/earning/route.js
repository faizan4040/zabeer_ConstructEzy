import { NextResponse } from "next/server";
import connectDb from "@/lib/databaseConnection";
import { isAuthenticated } from "@/lib/authentication";
import Booking from "@/models/Booking.model";
import { bucketize, sevenDaysAgo } from "@/lib/dayBuckets";

// Labour's earning of the last 7 days: completed jobs only (cash and online both)
export async function GET() {
  try {
    await connectDb();

    const authResult = await isAuthenticated("laber");
    if (!authResult.isAuth) {
      return NextResponse.json({ message: "unauthorized" }, { status: 401 });
    }

    const rows = await Booking.find({
      labour: authResult.userId,
      bookingStatus: "completed",
      completedAt: { $gte: sevenDaysAgo() },
    })
      .select("labourAmount fare completedAt")
      .lean();

    return NextResponse.json(bucketize(rows, "completedAt", (r) => r.labourAmount || r.fare), { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "partner earning error" }, { status: 500 });
  }
}
