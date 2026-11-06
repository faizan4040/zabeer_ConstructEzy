import { isAuthenticated } from "@/lib/authentication";
import connectDB from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperfunction";
import ServiceQuote from "@/models/ServiceQuote.model";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  name: z.string().max(60).optional(), phone: z.string().regex(/^[0-9]{10}$/, "Enter 10 digit phone"),
  serviceType: z.string().min(2).max(60), city: z.string().max(60).optional(),
  preferredDate: z.string().max(20).optional(), details: z.string().max(500).optional(),
});

export async function POST(req) {
  try {
    await connectDB();
    const p = schema.safeParse(await req.json());
    if (!p.success) return response(false, 400, p.error.issues[0]?.message || "Invalid data");
    const auth = await isAuthenticated();
    await ServiceQuote.create({ ...p.data, user: auth.isAuth ? auth.userId : null });
    return response(true, 200, "Request received! Our team will call you shortly.");
  } catch (e) { return catchError(e); }
}

export async function GET(req) {
  try {
    const auth = await isAuthenticated("admin");
    if (!auth.isAuth) return response(false, 403, "Unauthorized.");
    await connectDB();
    const sp = new URL(req.url).searchParams;
    const start = parseInt(sp.get("start") || "0"), size = parseInt(sp.get("size") || "10");
    const [data, total] = await Promise.all([
      ServiceQuote.find().sort({ createdAt: -1 }).skip(start).limit(size).lean(), ServiceQuote.countDocuments(),
    ]);
    return NextResponse.json({ success: true, data, meta: { totalRowCount: total } });
  } catch (e) { return catchError(e); }
}

export async function PATCH(req) {
  try {
    const auth = await isAuthenticated("admin");
    if (!auth.isAuth) return response(false, 403, "Unauthorized.");
    await connectDB();
    const { id, status } = await req.json();
    if (!["new", "contacted", "closed"].includes(status)) return response(false, 400, "Invalid status");
    await ServiceQuote.findByIdAndUpdate(id, { status });
    return response(true, 200, "Updated");
  } catch (e) { return catchError(e); }
}
