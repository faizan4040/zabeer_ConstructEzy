import { NextResponse } from "next/server";
import connectDB from "@/lib/databaseConnection";
import { isAuthenticated } from "@/lib/authentication";
import Labour from "@/models/Labour.model";
import "@/models/User.model";

const MAX_RADIUS_KM = 25;

const haversineKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
};

// 1) labour profile location (saved at registration), if it is real
// 2) otherwise the labour account's last known location (GeoUpdater)
const labourPoint = (l) => {
  const la = l.location?.latitude;
  const lo = l.location?.longitude;
  if (la && lo) return [la, lo];
  const c = l.owner?.location?.coordinates; // [lng, lat]
  if (Array.isArray(c) && c.length === 2 && (c[0] || c[1])) return [c[1], c[0]];
  return null;
};

export async function POST(req) {
  try {
    await connectDB();

    // phone numbers are shown here, so only logged-in users can search
    const session = await isAuthenticated();
    if (!session.isAuth) {
      return NextResponse.json({ message: "Please login to see labour" }, { status: 401 });
    }

    const { latitude, longitude, category } = await req.json();
    const lat = Number(latitude);
    const lon = Number(longitude);
    if (!lat || !lon) {
      return NextResponse.json({ message: "coordinates not found" }, { status: 400 });
    }

    const query = {
      status: "approved", // approved only after partner review + video KYC + final admin review
      isActive: true,
      owner: { $ne: session.userId },
    };
    if (category && category !== "all") query.category = category;

    const labours = await Labour.find(query)
      .select(
        "fullName phone category profileImage about experienceYears rateType pricePerHour pricePerDay skills location rating totalReviews completedJobs availability serviceRadius owner"
      )
      .populate({ path: "owner", select: "location" })
      .lean();

    const result = [];
    for (const l of labours) {
      const p = labourPoint(l);
      if (!p) continue; // no known location at all
      const distance = haversineKm(lat, lon, p[0], p[1]);
      if (distance > Math.min(l.serviceRadius || 10, MAX_RADIUS_KM)) continue;
      const { owner, location, serviceRadius, ...rest } = l;
      result.push({ ...rest, distance, area: location?.address || "" });
    }
    result.sort((a, b) => a.distance - b.distance);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: `near by labour error ${error}` }, { status: 500 });
  }
}