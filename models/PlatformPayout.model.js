import mongoose from "mongoose";

// Admin ne platform ki kamai (commission) apne bank me kab aur kitni nikali — record
const schema = new mongoose.Schema(
  {
    amount: { type: Number, required: true, min: 1 },
    accountHolder: { type: String, default: "" },
    accountNumber: { type: String, default: "" },
    ifsc: { type: String, default: "" },
    utr: { type: String, default: "" },
    note: { type: String, default: "" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.models.PlatformPayout ||
  mongoose.model("PlatformPayout", schema, "platformpayouts");
