import mongoose from "mongoose"
import { isAuthenticated } from "@/lib/authentication"
import connectDB from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperfunction"
import { APPLICATION_STATUSES } from "@/lib/careers"
import JobApplicationModel from "@/models/JobApplication.model"

const guard = async () => {
  const auth = await isAuthenticated("admin")
  if (!auth.isAuth) return response(false, 401, "Unauthorized.")
  await connectDB()
  return null
}

// Admin: saare candidates (newest first)
export async function GET() {
  try {
    const denied = await guard()
    if (denied) return denied
    const apps = await JobApplicationModel.find().sort({ createdAt: -1 }).limit(2000).lean()
    return response(true, 200, "Fetched.", apps)
  } catch (error) {
    return catchError(error, "Failed to load candidates.")
  }
}

// Admin: { id, status?, adminNotes? }
export async function PATCH(req) {
  try {
    const denied = await guard()
    if (denied) return denied
    const { id, status, adminNotes } = await req.json()
    if (!mongoose.isValidObjectId(id)) return response(false, 400, "Invalid id.")
    const set = {}
    if (status !== undefined) {
      if (!APPLICATION_STATUSES.includes(status)) return response(false, 400, "Invalid status.")
      set.status = status
    }
    if (adminNotes !== undefined) set.adminNotes = String(adminNotes).slice(0, 2000)
    if (!Object.keys(set).length) return response(false, 400, "Nothing to update.")
    const app = await JobApplicationModel.findByIdAndUpdate(id, { $set: set }, { new: true }).lean()
    if (!app) return response(false, 404, "Candidate not found.")
    return response(true, 200, "Saved.", app)
  } catch (error) {
    return catchError(error, "Failed to update candidate.")
  }
}
