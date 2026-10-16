import { isAuthenticated } from "@/lib/authentication";
import connectDb from "@/lib/databaseConnection";
import Booking from "@/models/Booking.model";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDb();

    // FIX: original route had no auth check at all — anyone could hit
    // this endpoint and see total platform revenue. Restricted to admin.
    const authResult = await isAuthenticated("admin");
    if (!authResult.isAuth) {
      return NextResponse.json({ message: "unauthorized" }, { status: 400 });
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const bookings = await Booking.find({
      paymentStatus: "paid",
      createdAt: { $gte: sevenDaysAgo },
    }).select("adminCommission createdAt");

    const earningMap = {};

    bookings.forEach((b) => {
      const date = new Date(b.createdAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
      });

      if (!earningMap[date]) {
        earningMap[date] = 0;
      }

      // FIX: original was `earningMap[date] + b.adminCommission || 0`,
      // which due to operator precedence evaluates as
      // (earningMap[date] + b.adminCommission) || 0 — if adminCommission
      // was ever undefined, the sum became NaN and silently reset to 0,
      // wiping out that day's already-accumulated total.
      earningMap[date] = earningMap[date] + (b.adminCommission || 0);
    });

    const earnings = Object.entries(earningMap).map(([date, earnings]) => ({
      date,
      earnings,
    }));

    return NextResponse.json(earnings, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "admin earning error" },
      { status: 500 }
    );
  }
}