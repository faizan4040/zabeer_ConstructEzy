import mongoose from "mongoose";
const ObjectId = mongoose.Schema.Types.ObjectId;

const schema = new mongoose.Schema(
  {
    bookingCode: { type: String, unique: true, index: true }, // CE12678
    user: { type: ObjectId, ref: "User", required: true, index: true },
    listing: { type: ObjectId, ref: "ServiceListing", required: true, index: true },
    labourUser: { type: ObjectId, ref: "User", default: null, index: true },

    // snapshot (listing badle to purani booking na badle)
    serviceTitle: String,
    serviceImage: String,
    labourName: String,
    labourPhone: String,

    date: { type: Date, required: true },
    timeSlot: { type: String, required: true },

    address: {
      fullAddress: { type: String, required: true },
      landmark: { type: String, default: "" },
      city: { type: String, required: true },
      pincode: { type: String, required: true },
    },
    contactPhone: { type: String, required: true },

    // money (server calculate karta hai, client se kabhi nahi aata)
    price: { type: Number, required: true },
    platformFee: { type: Number, default: 0 },
    total: { type: Number, required: true },
    commissionPercent: { type: Number, default: 0 },
    commission: { type: Number, default: 0 },
    labourEarning: { type: Number, default: 0 },

    paymentMethod: { type: String, enum: ["online", "cash"], required: true },
    paymentMode: { type: String, default: "" }, // upi/card/netbanking/wallet
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "cash_due", "cash_collected", "failed"],
      default: "pending",
    },
    razorpayOrderId: { type: String, default: "" },
    razorpayPaymentId: { type: String, default: "" },
    qrCodeId: { type: String, default: "" },
    paidAt: Date,

    status: {
      type: String,
      enum: ["pending_payment", "confirmed", "in_progress", "completed", "cancelled"],
      default: "confirmed",
      index: true,
    },
    // job lifecycle (labour dashboard: Start Work -> Finish Work)
    assignedAt: { type: Date, default: null },
    adminNote: { type: String, default: "" },
    startedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },

    // labour ka paisa wallet me sirf ek baar (kaam finish hone par) aata hai
    labourCredited: { type: Boolean, default: false },
    // cash job: labour ke paas cash hai, platform ka hissa labour ko dena hai
    commissionStatus: { type: String, enum: ["none", "due", "settled"], default: "none", index: true },
    commissionSettledAt: { type: Date, default: null },
    commissionSettledVia: { type: String, enum: ["", "auto", "online", "manual"], default: "" },
    cancelledAt: Date,
    cancelReason: { type: String, default: "" },
    reviewed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.ServiceBooking ||
  mongoose.model("ServiceBooking", schema, "servicebookings");
