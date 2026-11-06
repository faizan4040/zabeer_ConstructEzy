import mongoose from "mongoose"

const notificationSchema = new mongoose.Schema({
  // Kis user ko ye notification dikhni hai (shopowner, delivery boy, customer — sabke liye reusable)
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

  title: { type: String, required: true },
  message: { type: String, required: true },

  // Order-related notifications ke liye — click karke seedha order pe le jaane ke liye
  type: {
    type: String,
    enum: ["order_status", "system", "general", "labour_job"],
    default: "order_status",
  },
  order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", default: null },
  link: { type: String, default: null }, // e.g. /shop/orders/ORDER123

  isRead: { type: Boolean, default: false, index: true },
}, { timestamps: true })

const NotificationModel = mongoose.models.Notification || mongoose.model("Notification", notificationSchema, "notifications")
export default NotificationModel