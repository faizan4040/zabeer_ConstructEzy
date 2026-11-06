import mongoose from "mongoose";

// Service categories (Plumbing, Electrical...) — alag from product Category
const schema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: "ServiceCategory", default: null },
    image: { type: String, default: "" },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    deletedAt: { type: Date, default: null, index: true },
  },
  { timestamps: true }
);

export default mongoose.models.ServiceCategory ||
  mongoose.model("ServiceCategory", schema, "servicecategories");
