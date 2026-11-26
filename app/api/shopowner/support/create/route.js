import { isAuthenticated } from "@/lib/authentication"
import connectDB from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperfunction"
import { sendMail } from "@/lib/sendMail"
import SupportTicketModel from "@/models/SupportTicket.model"
import UserModel from "@/models/User.model"
import NotificationModel from "@/models/Notification.model"
import z from "zod"

const CATEGORIES = ["payment", "inventory", "account", "ads_promotions", "instant_cash", "other"]

const ticketSchema = z.object({
  category: z.string().refine((c) => CATEGORIES.includes(c), { message: "Invalid category." }),
  orderId: z.string().optional().nullable(),
  subject: z.string().min(3, "Subject is required."),
  description: z.string().min(10, "Please describe the issue in at least 10 characters."),
})

export async function POST(request) {
  try {
    await connectDB()

    const auth = await isAuthenticated("shop owner")
    if (!auth.isAuth) return response(false, 401, "Unauthorized.")

    const user = await UserModel.findOne({ _id: auth.userId, deletedAt: null }).select("shop name email")
    if (!user?.shop) return response(false, 400, "No shop linked to this account.")

    const payload = await request.json()
    const validated = ticketSchema.safeParse(payload)
    if (!validated.success) {
      return response(false, 400, "Invalid or missing fields.", validated.error)
    }

    const ticket = await SupportTicketModel.create({
      shop: user.shop,
      user: auth.userId,
      category: validated.data.category,
      orderId: validated.data.orderId || null,
      subject: validated.data.subject,
      description: validated.data.description,
    })

    // ── Admin bell notification ──
    try {
      const admins = await UserModel.find({ role: "admin", deletedAt: null }).select("_id").lean()
      if (admins.length) {
        await NotificationModel.insertMany(
          admins.map((a) => ({
            user: a._id,
            type: "general",
            title: "New Support Ticket",
            message: `${user.name} • ${validated.data.subject}`,
            link: "/admin/support-tickets",
          }))
        )
      }
    } catch (err) {
      console.error("Support ticket notification failed:", err.message)
    }

    // ── Email to support/ops team — needs SUPPORT_EMAIL in .env ──
    const supportHtml = `
      <h3>New Support Ticket — ${ticket._id}</h3>
      <p><b>Shop Owner:</b> ${user.name} (${user.email})</p>
      <p><b>Category:</b> ${validated.data.category.replace(/_/g, " ")}</p>
      ${validated.data.orderId ? `<p><b>Order ID:</b> ${validated.data.orderId}</p>` : ""}
      <p><b>Subject:</b> ${validated.data.subject}</p>
      <p><b>Description:</b><br/>${validated.data.description.replace(/\n/g, "<br/>")}</p>
    `

    try {
      await sendMail(
        `New Support Ticket: ${validated.data.subject}`,
        process.env.SUPPORT_EMAIL || "support@constructezy.com",
        supportHtml
      )
    } catch {
      // ticket already saved — email failure shouldn't block the response
    }

    return response(true, 200, "Ticket submitted successfully. Our team will get back to you soon.", ticket)
  } catch (error) {
    return catchError(error, "Failed to submit ticket.")
  }
}