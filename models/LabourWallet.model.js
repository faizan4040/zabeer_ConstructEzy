import mongoose from "mongoose";
const ObjectId = mongoose.Schema.Types.ObjectId;

const walletSchema = new mongoose.Schema(
  {
    user: { type: ObjectId, ref: "User", required: true, unique: true },
    balance: { type: Number, default: 0, min: 0 }, // withdraw kar sakta hai
    pendingDue: { type: Number, default: 0, min: 0 }, // cash jobs ka platform ko dena
    totalEarned: { type: Number, default: 0 },
    totalWithdrawn: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const txnSchema = new mongoose.Schema(
  {
    user: { type: ObjectId, ref: "User", required: true, index: true },
    booking: { type: ObjectId, ref: "ServiceBooking", default: null },
    type: {
      type: String,
      enum: ["online_credit", "cash_due", "due_settled", "withdraw"],
      required: true,
    },
    gross: { type: Number, default: 0 },
    commission: { type: Number, default: 0 },
    amount: { type: Number, required: true },
    status: { type: String, enum: ["done", "requested", "processing", "paid", "rejected"], default: "done" },
    note: { type: String, default: "" },
    // due_settled: kaise settle hua ("auto" = online kamai se, "online" = labour ne pay kiya, "manual" = admin ne mark kiya)
    via: { type: String, default: "" },
    // Razorpay payment id ya payout id — same payment do baar count na ho
    ref: { type: String, default: undefined },
    utr: { type: String, default: "" },
  },
  { timestamps: true }
);

txnSchema.index({ ref: 1 }, { unique: true, partialFilterExpression: { ref: { $type: "string" } } });

export const LabourWalletTxn =
  mongoose.models.LabourWalletTxn || mongoose.model("LabourWalletTxn", txnSchema, "labourwallettxns");

export default mongoose.models.LabourWallet ||
  mongoose.model("LabourWallet", walletSchema, "labourwallets");
