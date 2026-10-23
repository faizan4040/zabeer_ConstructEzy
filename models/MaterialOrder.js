import mongoose from "mongoose";

const MaterialOrderSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true },
    address: { type: String, required: true, trim: true },
    location: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
    },
    files: [
      {
        url: String,
        originalName: String,
        mimeType: String,
        size: Number,
      },
    ],
    status: {
      type: String,
      enum: ["new", "contacted", "quoted", "delivered", "cancelled"],
      default: "new",
    },
  },
  { timestamps: true }
);

export default mongoose.models.MaterialOrder ||
  mongoose.model("MaterialOrder", MaterialOrderSchema);