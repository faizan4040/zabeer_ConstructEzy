import mongoose from "mongoose"

const shopSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
    },
    logo: {
      url: { type: String, trim: true },
      public_id: { type: String, trim: true },
    },

    // ── Earnings & Payout (NEW) ──
    // % platform keeps on every sale from this shop. Admin can override per shop
    // from the vendor management screen; falls back to DEFAULT_COMMISSION_PERCENT
    // in lib/commission.js if this is ever missing.
    commissionPercent: {
      type: Number,
      default: 10,
      min: 0,
      max: 100,
    },
    kycStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
    bankDetails: {
      accountHolderName: { type: String, trim: true },
      accountNumber: { type: String, trim: true },
      ifsc: { type: String, trim: true },
    },
    // RazorpayX identifiers created once bank details are linked — needed to
    // actually push money to the vendor's bank account on withdrawal
    razorpayContactId: { type: String, default: null },
    razorpayFundAccountId: { type: String, default: null },

    // ── Shop / pickup location (GeoJSON Point: [lng, lat]) ──
    // Paid delivery ka distance isi se nikalta hai (shop → buyer), aur
    // nearest-shop assignment (lib/itemAssignment.js) bhi isi pe $nearSphere chalata hai.
    // default undefined rakha hai taaki bina location wale shops pe 2dsphere index na toote.
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: undefined,
      },
      coordinates: {
        type: [Number],
        default: undefined,
      },
    },
    locationAddress: {
      type: String,
      trim: true,
      default: "",
    },
    locationUpdatedAt: {
      type: Date,
      default: null,
    },

    deletedAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  { timestamps: true }
)

shopSchema.index({ location: "2dsphere" })

const ShopModel = mongoose.models.Shop || mongoose.model("Shop", shopSchema, "shops")
export default ShopModel


