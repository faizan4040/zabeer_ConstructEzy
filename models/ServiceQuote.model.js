import mongoose from "mongoose";
const schema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    name: { type: String, default: "" },
    phone: { type: String, required: true },
    serviceType: { type: String, required: true },
    city: { type: String, default: "" },
    preferredDate: { type: String, default: "" },
    details: { type: String, default: "" },
    status: { type: String, enum: ["new", "contacted", "closed"], default: "new" },
  },
  { timestamps: true }
);
export default mongoose.models.ServiceQuote || mongoose.model("ServiceQuote", schema, "servicequotes");
