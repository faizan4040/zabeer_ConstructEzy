import mongoose from "mongoose";

const ObjectId = mongoose.Schema.Types.ObjectId;

// One review per completed booking, written by the customer for the labour
const labourReviewSchema = new mongoose.Schema(
  {
    booking: { type: ObjectId, ref: "Booking", required: true, unique: true },
    labourProfile: { type: ObjectId, ref: "Labour", required: true, index: true },
    labour: { type: ObjectId, ref: "User", default: null }, // labour's user account
    user: { type: ObjectId, ref: "User", required: true },

    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, default: "", trim: true, maxlength: 100 },
    review: { type: String, default: "", trim: true, maxlength: 1000 },

    deletedAt: { type: Date, default: null, index: true },
  },
  { timestamps: true }
);

const LabourReview =
  mongoose.models.LabourReview || mongoose.model("LabourReview", labourReviewSchema, "labourreviews");

export default LabourReview;
