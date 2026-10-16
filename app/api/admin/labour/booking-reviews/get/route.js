import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/databaseConnection";
import Labour from "@/models/Labour.model";
import LabourReview from "@/models/LabourReview.model";
import "@/models/User.model";

const LIMIT = 10;

// GET /api/labour-review/get?labourId=<Labour _id>&page=1   (public, only first name of reviewer)
export async function GET(req) {
  try {
    await connectDB();

    const sp = new URL(req.url).searchParams;
    const labourId = sp.get("labourId");
    const page = Math.max(1, Number(sp.get("page")) || 1);

    if (!mongoose.isValidObjectId(labourId)) {
      return NextResponse.json({ message: "Invalid labour" }, { status: 400 });
    }

    const filter = { labourProfile: labourId, deletedAt: null };
    const [rows, total, labour] = await Promise.all([
      LabourReview.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * LIMIT)
        .limit(LIMIT)
        .populate({ path: "user", select: "name" })
        .lean(),
      LabourReview.countDocuments(filter),
      Labour.findById(labourId).select("rating totalReviews").lean(),
    ]);

    const reviews = rows.map((r) => ({
      _id: r._id,
      rating: r.rating,
      title: r.title,
      review: r.review,
      createdAt: r.createdAt,
      reviewedBy: (r.user?.name || "Customer").split(" ")[0],
    }));

    return NextResponse.json(
      {
        reviews,
        totalReviews: total,
        averageRating: labour?.rating || 0,
        nextPage: page * LIMIT < total ? page + 1 : null,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ message: `get labour reviews error ${error}` }, { status: 500 });
  }
}
