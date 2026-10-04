import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // The labour being hired
    labour: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Snapshot of category at booking time (helpers, masons, electricians, etc.)
    category: {
      type: String,
      required: true,
    },

    // Where the labour needs to work
    workAddress: {
      type: String,
      required: true,
    },
    workLocation: {
      type: {
        type: String,
        enum: ["Point"],
      },
      coordinates: [Number],
    },

    fare: {
      type: Number,
      required: true,
    },
    pricingType: {
      type: String,
      enum: ["hourly", "daily"],
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    ratePerUnit: {
      type: Number,
      required: true,
    },

    userMobileNumber: {
      type: String,
      required: true,
    },
    labourMobileNumber: {
      type: String,
      required: true,
    },

    bookingStatus: {
      type: String,
      enum: [
        "idle",
        "requested",
        "awaiting_payment",
        "confirmed",
        "started",
        "completed",
        "cancelled",
        "rejected",
        "expired",
      ],
      default: "idle",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "cash", "failed"],
      default: "pending",
    },
    paymentDeadline: {
      type: Date,
    },
    adminCommission: {
      type: Number,
      default: 0,
    },
    labourAmount: {
      type: Number,
      default: 0,
    },

    // OTP to confirm labour has started work at the site
    startOtp: {
      type: String,
    },
    startOtpExpires: {
      type: Date,
    },
    // OTP to confirm work completion
    completeOtp: {
      type: String,
    },
    completeOtpExpires: {
      type: Date,
    },

    cancellationReason: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const Booking =
  mongoose.models.Booking || mongoose.model("Booking", bookingSchema);
export default Booking;

