import { NextResponse } from "next/server";
import connectDB from "@/lib/databaseConnection";
import { isAuthenticated } from "@/lib/authentication";
import Labour from "@/models/Labour.model";

export async function GET(req) {
  try {
    await connectDB();
    const session = await isAuthenticated("admin");
    if (!session.isAuth) {
      return NextResponse.json({ message: "unauthorized" }, { status: 401 });
    }

    const category = new URL(req.url).searchParams.get("category");
    const query = { status: "approved", isActive: true };
    if (category && category !== "all") query.category = category;

    const labours = await Labour.find(query)
      .select("fullName phone category experienceYears rateType pricePerHour pricePerDay availability location.address")
      .sort({ fullName: 1 })
      .limit(300)
      .lean();

    return NextResponse.json(labours, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: `assignable error ${error}` }, { status: 500 });
  }
}