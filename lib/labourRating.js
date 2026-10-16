import mongoose from "mongoose";
import LabourReview from "@/models/LabourReview.model";
import Labour from "@/models/Labour.model";

// Recomputes Labour.rating + Labour.totalReviews from the live reviews
export async function recalcLabourRating(labourProfileId) {
  if (!labourProfileId) return;
  const r = await LabourReview.aggregate([
    {
      $match: {
        labourProfile: new mongoose.Types.ObjectId(String(labourProfileId)),
        deletedAt: null,
      },
    },
    { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  await Labour.updateOne(
    { _id: labourProfileId },
    { $set: { rating: r[0] ? Math.round(r[0].avg * 10) / 10 : 0, totalReviews: r[0]?.count || 0 } }
  );
}
