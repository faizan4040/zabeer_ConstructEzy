import { isAuthenticated } from "@/lib/authentication";
import connectDB from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperfunction";
import ServiceListing from "@/models/ServiceListing.model";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const auth = await isAuthenticated("admin");
    if (!auth.isAuth) return response(false, 403, "Unauthorized.");
    await connectDB();
    const sp = new URL(req.url).searchParams;
    const start = parseInt(sp.get("start") || "0"), size = parseInt(sp.get("size") || "10");
    const g = (sp.get("globalFilter") || "").trim();
    const q = { deletedAt: null };
    if (g) {
      const rx = new RegExp(g.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      q.$or = [{ title: rx }, { labourName: rx }, { city: rx }];
    }
    const [data, total] = await Promise.all([
      ServiceListing.find(q).sort({ createdAt: -1 }).skip(start).limit(size)
        .populate("category", "name").populate("subCategory", "name").lean(),
      ServiceListing.countDocuments(q),
    ]);
    return NextResponse.json({ success: true, data, meta: { totalRowCount: total } });
  } catch (e) { return catchError(e); }
}
