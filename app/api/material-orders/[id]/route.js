import { NextResponse } from "next/server";
import connectDB from "@/lib/databaseConnection";
import MaterialOrder from "@/models/MaterialOrder";
import { deleteFile } from "@/lib/cloudinaryServer";

export const runtime = "nodejs";

const STATUSES = ["new", "contacted", "quoted", "delivered", "cancelled"];

export async function PATCH(req, { params }) {
  // TODO: admin auth check
  try {
    const { id } = await params;
    const { status } = await req.json();
    if (!STATUSES.includes(status))
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    await connectDB();
    const order = await MaterialOrder.findByIdAndUpdate(id, { status }, { new: true });
    if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ order });
  } catch (e) {
    console.error("material-orders PATCH error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  // TODO: admin auth check
  try {
    const { id } = await params;
    await connectDB();
    const order = await MaterialOrder.findByIdAndDelete(id);
    if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

    for (const f of order.files || []) {
      if (!f.publicId) continue;
      try {
        // PDF aur images dono "image" resource type mein upload hote hain (resource_type: auto)
        await deleteFile(f.publicId, "image");
      } catch (err) {
        console.error("Cloudinary delete failed:", err);
      }
    }
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("material-orders DELETE error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}