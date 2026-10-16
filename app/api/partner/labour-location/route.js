import { NextResponse } from "next/server";
import connectDb from "@/lib/databaseConnection";
import { isAuthenticated } from "@/lib/authentication";
import Labour from "@/models/Labour.model";

export async function POST(req) {
  try {
    await connectDb();

    const session = await isAuthenticated(["customer", "laber"]);
    if (!session.isAuth) {
      return NextResponse.json({ message: "unauthorized" }, { status: 401 });
    }

    const { latitude, longitude, address } = await req.json();
    const lat = Number(latitude);
    const lon = Number(longitude);
    if (!lat || !lon || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      return NextResponse.json({ message: "invalid location" }, { status: 400 });
    }

    const labour = await Labour.findOne({ owner: session.userId });
    if (!labour) {
      return NextResponse.json({ message: "labour profile not found" }, { status: 400 });
    }

    labour.location = {
      latitude: lat,
      longitude: lon,
      address: (address || "").trim() || labour.location?.address || "",
    };
    await labour.save();

    return NextResponse.json({ message: "location saved", location: labour.location }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: `save location error ${error}` }, { status: 500 });
  }
}