import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/databaseConnection";
import { isAuthenticated } from "@/lib/authentication";
import LabourReview from "@/models/LabourReview.model";
import "@/models/Labour.model";
import "@/models/User.model";
import { recalcLabourRating } from "@/lib/labourRating";

// GET: latest customer reviews of labour (admin)
export async function GET() {
  try {
    await connectDB();
    const session = await isAuthenticated("admin");
    if (!session.isAuth) {
      return NextResponse.json({ message: "unauthorized" }, { status: 401 });
    }

    const rows = await LabourReview.find({ deletedAt: null })
      .sort({ createdAt: -1 })
      .limit(200)
      .populate({ path: "labourProfile", select: "fullName category phone" })
      .populate({ path: "user", select: "name" })
      .lean();

    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: `admin labour reviews error ${error}` }, { status: 500 });
  }
}

// POST { id, action: "delete" }: hides a review and fixes the labour's rating
export async function POST(req) {
  try {
    await connectDB();
    const session = await isAuthenticated("admin");
    if (!session.isAuth) {
      return NextResponse.json({ message: "unauthorized" }, { status: 401 });
    }

    const { id, action } = await req.json();
    if (action !== "delete" || !mongoose.isValidObjectId(id)) {
      return NextResponse.json({ message: "Invalid request" }, { status: 400 });
    }

    const review = await LabourReview.findOneAndUpdate(
      { _id: id, deletedAt: null },
      { $set: { deletedAt: new Date() } },
      { new: true }
    );
    if (!review) {
      return NextResponse.json({ message: "Review not found" }, { status: 404 });
    }
    await recalcLabourRating(review.labourProfile);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: `delete labour review error ${error}` }, { status: 500 });
  }
}
