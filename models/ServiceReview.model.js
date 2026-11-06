import mongoose from "mongoose";
const ObjectId = mongoose.Schema.Types.ObjectId;
const schema = new mongoose.Schema(
  {
    booking: { type: ObjectId, ref: "ServiceBooking", required: true, unique: true },
    listing: { type: ObjectId, ref: "ServiceListing", required: true, index: true },
    user: { type: ObjectId, ref: "User", required: true },
    userName: { type: String, default: "" },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: "", maxlength: 600 },
  },
  { timestamps: true }
);
export default mongoose.models.ServiceReview || mongoose.model("ServiceReview", schema, "servicereviews");
