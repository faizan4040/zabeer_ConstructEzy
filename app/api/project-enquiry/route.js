import { isAuthenticated } from "@/lib/authentication"
import connectDB from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperfunction"
import NotificationModel from "@/models/Notification.model"
import ProjectEnquiryModel, { ENQUIRY_STATUSES, PROJECT_TYPES } from "@/models/ProjectEnquiry.model"
import UserModel from "@/models/User.model"
import { NextResponse } from "next/server"
import { z } from "zod"

const schema = z.object({
  projectType: z.enum(PROJECT_TYPES, { message: "Please select a project type." }),
  requirement: z.string().trim().min(10, "Please describe your requirement (min 10 characters).").max(1000),
  location: z.string().trim().min(3, "Please enter the project location.").max(150),
  name: z.string().trim().min(2, "Please enter your name.").max(60),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number."),
})

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

// Public — anyone (logged in or not) can submit an enquiry
export async function POST(req) {
  try {
    await connectDB()
    const parsed = schema.safeParse(await req.json())
    if (!parsed.success) return response(false, 400, parsed.error.issues[0]?.message || "Invalid data.")

    const auth = await isAuthenticated()
    const enquiry = await ProjectEnquiryModel.create({
      ...parsed.data,
      user: auth.isAuth ? auth.userId : null,
    })

    // Notify every admin — shows up in the admin header bell
    try {
      const admins = await UserModel.find({ role: "admin", deletedAt: null }).select("_id").lean()
      if (admins.length) {
        await NotificationModel.insertMany(
          admins.map((a) => ({
            user: a._id,
            type: "general",
            title: "New Project Enquiry",
            message: `${enquiry.name} • ${enquiry.projectType} • ${enquiry.location}`,
            link: "/admin/project-enquiries",
          }))
        )
      }
    } catch (err) {
      console.error("Project enquiry notification failed:", err.message)
    }

    return response(true, 200, "Enquiry submitted! Our team will call you shortly.")
  } catch (e) {
    return catchError(e)
  }
}

// Admin — list enquiries (SimpleTable: start / size / globalFilter)
export async function GET(req) {
  try {
    const auth = await isAuthenticated("admin")
    if (!auth.isAuth) return response(false, 403, "Unauthorized.")
    await connectDB()

    const sp = new URL(req.url).searchParams
    const start = parseInt(sp.get("start") || "0", 10)
    const size = parseInt(sp.get("size") || "10", 10)
    const q = (sp.get("globalFilter") || "").trim()

    const filter = {}
    if (q) {
      const rx = new RegExp(escapeRegex(q), "i")
      filter.$or = [{ name: rx }, { phone: rx }, { location: rx }, { projectType: rx }, { requirement: rx }]
    }

    const [data, total] = await Promise.all([
      ProjectEnquiryModel.find(filter).sort({ createdAt: -1 }).skip(start).limit(size).lean(),
      ProjectEnquiryModel.countDocuments(filter),
    ])
    return NextResponse.json({ success: true, data, meta: { totalRowCount: total } })
  } catch (e) {
    return catchError(e)
  }
}

// Admin — update status
export async function PATCH(req) {
  try {
    const auth = await isAuthenticated("admin")
    if (!auth.isAuth) return response(false, 403, "Unauthorized.")
    await connectDB()

    const { id, status } = await req.json()
    if (!ENQUIRY_STATUSES.includes(status)) return response(false, 400, "Invalid status.")
    await ProjectEnquiryModel.findByIdAndUpdate(id, { status })
    return response(true, 200, "Status updated.")
  } catch (e) {
    return catchError(e)
  }
}
