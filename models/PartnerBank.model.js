
import mongoose from "mongoose";

const partnerBankSchema = new mongoose.Schema(
  {
    // Labour User
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    accountHolder: { type: String, required: true, trim: true },

    // not collected by the onboarding form, so it must not be required
    bankName: { type: String, default: "", trim: true },
    branchName: { type: String, default: "", trim: true },

    accountNumber: { type: String, required: true, unique: true, trim: true },
    ifsc: { type: String, required: true, uppercase: true, trim: true },
    upi: { type: String, default: "", trim: true },

    status: {
      type: String,
      enum: ["not_added", "added", "verified"],
      default: "not_added",
    },
    isVerified: { type: Boolean, default: false },
    verifiedAt: { type: Date, default: null },

    // Razorpay X ids. lib/labourPayout.js saves these; without them in the schema
    // Mongoose drops them and a new contact is created on every payout.
    razorpayContactId: { type: String, default: "" },
    razorpayFundAccountId: { type: String, default: "" },
    razorpayFundAccountFor: { type: String, default: "" },
  },
  { timestamps: true }
);

const PartnerBank =
  mongoose.models.PartnerBank || mongoose.model("PartnerBank", partnerBankSchema);

export default PartnerBank;







