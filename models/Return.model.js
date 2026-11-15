import mongoose from "mongoose"

const trackingHistorySchema = new mongoose.Schema({
  status: { type: String, required: true },
  note: { type: String, default: "" },
  at: { type: Date, default: Date.now },
}, { _id: false })

const returnSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
  orderId: { type: String, required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  variantId: { type: mongoose.Schema.Types.ObjectId, ref: "ProductVariant", required: true },
  productName: { type: String, required: true },
  qty: { type: Number, required: true },
  // Buy a Sample ka return (sample hamesha returnable, 7 din ke andar)
  isSample: { type: Boolean, default: false },

  customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  customerPhone: { type: String, required: true },

  shop: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", required: true },

  reason: { type: String, required: true },
  // ── NEW: auto-classified for dual-pricing split (Meesho-style) ──
  // "wrong_defective" = seller-fault (wrong item, damaged, defective)
  // "other" = buyer-side (changed mind, no longer needed, etc.)
  reasonCategory: {
    type: String,
    enum: ["wrong_defective", "other"],
    default: "other",
  },

  // ── NEW: tracking lifecycle, separate from approval status ──
  trackingStatus: {
    type: String,
    enum: ["requested", "approved", "rejected", "picked_up", "in_transit", "reached_warehouse", "refunded"],
    default: "requested",
  },
  trackingHistory: [trackingHistorySchema],


  courierPartner: { type: mongoose.Schema.Types.ObjectId, ref: "CourierPartner", default: null },

// ── NEW: hybrid pickup — shopowner decide karta hai per-return ──
pickupMethod: {
  type: String,
  enum: ["courier_partner", "delivery_boy", null],
  default: null,
},
deliveryPartner: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, // agar delivery_boy method

  deletedAt: { type: Date, default: null },
}, { timestamps: true })



const ReturnModel = mongoose.models.Return || mongoose.model("Return", returnSchema, "returns")
export default ReturnModel