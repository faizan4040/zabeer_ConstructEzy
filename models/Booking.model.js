import mongoose from "mongoose";

/**
 * bookingStatus flow
 *   customer hires a labour : requested -> confirmed (labour accepts) -> completed
 *   no labour chosen        : unassigned -> (admin assigns) requested | confirmed -> completed
 *   labour rejects          : rejected -> (admin reassigns) requested | confirmed
 *   any time before done    : cancelled
 * Online payment opens after the labour accepted (confirmed).
 */
const ObjectId = mongoose.Schema.Types.ObjectId;

const bookingSchema = new mongoose.Schema(
  {
    user: { type: ObjectId, ref: "User", required: true, index: true },

    // empty until a labour is chosen / assigned
    labour: { type: ObjectId, ref: "User", default: null, index: true }, // User account (role "laber")
    labourProfile: { type: ObjectId, ref: "Labour", default: null }, // Labour profile document

    userName: { type: String, default: "" },
    labourName: { type: String, default: "" },
    userMobileNumber: { type: String, required: true },
    labourMobileNumber: { type: String, default: "" },

    category: { type: String, required: true },

    workAddress: { type: String, required: true },
    siteDetails: { type: String, default: "" },
    workLocation: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: [Number], // [lng, lat]
    },

    visitAt: { type: Date, required: true },

    pricingType: { type: String, enum: ["hourly", "daily"], required: true },
    duration: { type: Number, required: true }, // hours or days
    ratePerUnit: { type: Number, default: 0 },
    fare: { type: Number, default: 0 }, // 0 until admin fixes it for unassigned bookings

    bookingStatus: {
      type: String,
      enum: [
        "idle",
        "unassigned",
        "requested",
        "awaiting_payment",
        "confirmed",
        "started",
        "completed",
        "cancelled",
        "rejected",
        "expired",
      ],
      default: "requested",
      index: true,
    },

    // request lifecycle
    requestedAt: { type: Date },
    acceptedAt: { type: Date },
    rejectedAt: { type: Date },
    rejectReason: { type: String, default: "" },
    rejectedBy: [{ type: ObjectId, ref: "User" }],
    assignedByAdmin: { type: Boolean, default: false },
    adminNote: { type: String, default: "" },

    // payment (online = prepaid, cash = postpaid)
    paymentMethod: { type: String, enum: ["cash", "online"], default: "cash" },
    paymentStatus: { type: String, enum: ["pending", "paid", "cash", "failed"], default: "pending" },
    razorpayOrderId: { type: String, default: "" },
    razorpayPaymentId: { type: String, default: "" },
    paymentDeadline: { type: Date },

    // money split
    adminCommission: { type: Number, default: 0 },
    labourAmount: { type: Number, default: 0 },
    // cash jobs: labour keeps the cash, so the platform commission has to be collected from the labour
    commissionSettled: { type: Boolean, default: false },

    // online money that has to reach the labour's bank account
    payoutStatus: {
      type: String,
      enum: ["not_applicable", "pending", "processing", "paid", "failed"],
      default: "not_applicable",
    },
    payoutId: { type: String, default: "" },
    payoutUtr: { type: String, default: "" },
    payoutRazorpayStatus: { type: String, default: "" },
    payoutError: { type: String, default: "" },
    payoutAt: { type: Date },

    completedAt: { type: Date },
    cancelledAt: { type: Date },
    cancellationReason: { type: String, default: "" },

    // customer already reviewed the labour for this booking
    reviewed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

bookingSchema.index({ labour: 1, bookingStatus: 1 });
bookingSchema.index({ bookingStatus: 1, requestedAt: 1 });

const Booking = mongoose.models.Booking || mongoose.model("Booking", bookingSchema);
export default Booking;
