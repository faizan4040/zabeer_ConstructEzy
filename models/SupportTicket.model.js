import mongoose from "mongoose"

const supportTicketSchema = new mongoose.Schema({
  shop: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  category: {
    type: String,
    enum: ["payment", "inventory", "account", "ads_promotions", "instant_cash", "other"],
    required: true,
  },

  orderId: { type: String, default: null }, // optional — relevant for payment/inventory issues
  subject: { type: String, required: true },
  description: { type: String, required: true },

  status: {
    type: String,
    enum: ["open", "in_progress", "resolved", "closed"],
    default: "open",
  },

  // Admin's response — shown to the shop owner under "My Tickets"
  adminReply: { type: String, default: "" },
  repliedAt: { type: Date, default: null },

  deletedAt: { type: Date, default: null },
}, { timestamps: true })

const SupportTicketModel = mongoose.models.SupportTicket || mongoose.model("SupportTicket", supportTicketSchema, "supporttickets")
export default SupportTicketModel