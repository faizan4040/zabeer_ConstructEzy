import mongoose from "mongoose";
const ObjectId = mongoose.Schema.Types.ObjectId;

// Admin ka manually add kiya hua labour card
const schema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true }, // "Plumbing Repair"
    labourName: { type: String, required: true, trim: true },
    photo: { type: String, default: "" },
    gallery: [{ type: String }],
    category: { type: ObjectId, ref: "ServiceCategory", required: true, index: true },
    subCategory: { type: ObjectId, ref: "ServiceCategory", default: null },
    shortDescription: { type: String, default: "", maxlength: 200 },
    description: { type: String, default: "" },
    price: { type: Number, required: true, min: 1 }, // "Starting at"
    experienceYears: { type: Number, default: 0 },
    avgDurationMins: { type: Number, default: 45 },
    phone: { type: String, default: "" },
    city: { type: String, default: "Delhi NCR" },
    whatsIncluded: [{ type: String }],
    process: [{ title: String, description: String }],
    badges: [{ type: String }], // "Same-day service", "1 year experience"
    isVerified: { type: Boolean, default: true },
    hasWarranty: { type: Boolean, default: true },

    // Optional: register wale labour account se link (wallet/withdraw ke liye)
    linkedLabourUser: { type: ObjectId, ref: "User", default: null, index: true },

    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    bookingCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    deletedAt: { type: Date, default: null, index: true },
  },
  { timestamps: true }
);
schema.index({ title: "text", labourName: "text" });

export default mongoose.models.ServiceListing ||
  mongoose.model("ServiceListing", schema, "servicelistings");
