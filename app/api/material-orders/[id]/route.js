import { NextResponse } from "next/server";
import { unlink } from "fs/promises";
import path from "path";
import connectDB from "@/lib/databaseConnection"; 
import MaterialOrder from "@/models/MaterialOrder";

export const runtime = "nodejs";

const STATUSES = ["new", "contacted", "quoted", "delivered", "cancelled"];

export async function PATCH(req, { params }) {
  // TODO: admin auth check
  const { id } = await params;
  const { status } = await req.json();
  if (!STATUSES.includes(status))
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  await connectDB();
  const order = await MaterialOrder.findByIdAndUpdate(id, { status }, { new: true });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ order });
}

export async function DELETE(req, { params }) {
  // TODO: admin auth check
  const { id } = await params;
  await connectDB();
  const order = await MaterialOrder.findByIdAndDelete(id);
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  for (const f of order.files) {
    try {
      await unlink(path.join(process.cwd(), "public", f.url));
    } catch {}
  }
  return NextResponse.json({ success: true });
}