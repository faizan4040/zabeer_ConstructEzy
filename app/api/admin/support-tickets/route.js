import { isAuthenticated } from "@/lib/authentication"
import connectDB from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperfunction"
import { sendNotification } from "@/lib/notification"
import SupportTicketModel from "@/models/SupportTicket.model"
import "@/models/User.model"
import "@/models/Shop.model"
import mongoose from "mongoose"
import { NextResponse } from "next/server"

const STATUSES = ["open", "in_progress", "resolved", "closed"]
const STATUS_LABEL = { open: "Open", in_progress: "In Progress", resolved: "Resolved", closed: "Closed" }
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

// Admin — list all shop owner support tickets (SimpleTable: start / size / globalFilter)
export async function GET(req) {
  try {
    const auth = await isAuthenticated("admin")
    if (!auth.isAuth) return response(false, 403, "Unauthorized.")
    await connectDB()

    const sp = new URL(req.url).searchParams
    const start = parseInt(sp.get("start") || "0", 10)
    const size = parseInt(sp.get("size") || "10", 10)
    const q = (sp.get("globalFilter") || "").trim()
    const status = sp.get("status")

    const filter = { deletedAt: null }
    if (STATUSES.includes(status)) filter.status = status
    if (q) {
      const rx = new RegExp(escapeRegex(q), "i")
      filter.$or = [{ subject: rx }, { description: rx }, { orderId: rx }, { category: rx }]
    }

    const [data, total] = await Promise.all([
      SupportTicketModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(start)
        .limit(size)
        .populate("user", "name email phone")
        .populate("shop", "name")
        .lean(),
      SupportTicketModel.countDocuments(filter),
    ])
    return NextResponse.json({ success: true, data, meta: { totalRowCount: total } })
  } catch (e) {
    return catchError(e)
  }
}

// Admin — update status and/or reply; the shop owner gets a bell notification
export async function PATCH(req) {
  try {
    const auth = await isAuthenticated("admin")
    if (!auth.isAuth) return response(false, 403, "Unauthorized.")
    await connectDB()

    const { id, status, reply } = await req.json()
    if (!mongoose.Types.ObjectId.isValid(id)) return response(false, 400, "Invalid ticket.")
    if (status && !STATUSES.includes(status)) return response(false, 400, "Invalid status.")

    const ticket = await SupportTicketModel.findOne({ _id: id, deletedAt: null })
    if (!ticket) return response(false, 404, "Ticket not found.")

    const replyText = typeof reply === "string" ? reply.trim() : ""
    const changes = []

    if (status && status !== ticket.status) {
      ticket.status = status
      changes.push(`status: ${STATUS_LABEL[status]}`)
    }
    if (replyText) {
      if (replyText.length > 2000) return response(false, 400, "Reply is too long.")
      ticket.adminReply = replyText
      ticket.repliedAt = new Date()
      if (ticket.status === "open") ticket.status = "in_progress"
      changes.push("new reply")
    }
    if (!changes.length) return response(true, 200, "Nothing to update.")

    await ticket.save()

    await sendNotification({
      userId: ticket.user,
      type: "general",
      title: replyText ? "Support replied to your ticket" : "Support ticket updated",
      message: `${ticket.subject} — ${changes.join(", ")}`,
      link: "/shop/support?tab=ticket",
    })

    return response(true, 200, replyText ? "Reply sent." : "Status updated.")
  } catch (e) {
    return catchError(e)
  }
}
