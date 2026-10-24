import { NextResponse } from "next/server";
import connectDB from "@/lib/databaseConnection";
import MaterialOrder from "@/models/MaterialOrder";
import { uploadBuffer } from "@/lib/cloudinaryServer";

export const runtime = "nodejs";

const ALLOWED = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
const MAX_SIZE = 4 * 1024 * 1024; // 4MB per file (Vercel body limit 4.5MB)
const MAX_FILES = 3;

/* USER: order submit */
export async function POST(req) {
  try {
    const form = await req.formData();
    const name = String(form.get("name") || "").trim();
    const phone = String(form.get("phone") || "").trim();
    const address = String(form.get("address") || "").trim();
    const lat = parseFloat(form.get("lat"));
    const lng = parseFloat(form.get("lng"));
    const files = form.getAll("files").filter((f) => typeof f !== "string");

    if (!name || !address)
      return NextResponse.json({ error: "Name and address required" }, { status: 400 });
    if (!/^[6-9]\d{9}$/.test(phone))
      return NextResponse.json({ error: "Enter valid 10 digit phone" }, { status: 400 });
    if (files.length === 0 || files.length > MAX_FILES)
      return NextResponse.json({ error: `Upload 1 to ${MAX_FILES} files` }, { status: 400 });

    const saved = [];
    for (const file of files) {
      if (!ALLOWED[file.type])
        return NextResponse.json({ error: "Only PDF/JPG/PNG/WEBP allowed" }, { status: 400 });
      if (file.size > MAX_SIZE)
        return NextResponse.json({ error: "File too large (max 4MB)" }, { status: 400 });

      const buffer = Buffer.from(await file.arrayBuffer());
      const result = await uploadBuffer(buffer);
      saved.push({
        url: result.secure_url,
        publicId: result.public_id,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
      });
    }

    await connectDB();
    const order = await MaterialOrder.create({
      name,
      phone,
      address,
      location: {
        lat: Number.isFinite(lat) ? lat : null,
        lng: Number.isFinite(lng) ? lng : null,
      },
      files: saved,
    });

    return NextResponse.json({ success: true, id: order._id }, { status: 201 });
  } catch (e) {
    console.error("material-orders POST error:", e);
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}

/* ADMIN: list */
export async function GET(req) {
  try {
    // TODO: yahan apna admin auth check lagao (session/JWT), warna koi bhi data dekh sakta hai
    await connectDB();
    const status = new URL(req.url).searchParams.get("status");
    const filter = status && status !== "all" ? { status } : {};
    const orders = await MaterialOrder.find(filter).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ orders });
  } catch (e) {
    console.error("material-orders GET error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}