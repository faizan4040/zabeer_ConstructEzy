import mongoose from "mongoose"
import connectDB from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperfunction"
import JobPostModel from "@/models/JobPost.model"

// Public: ek open job ki poori detail (apply page)
export async function GET(_req, { params }) {
  try {
    const { id } = await params
    if (!mongoose.isValidObjectId(id)) return response(false, 404, "Job not found.")
    await connectDB()
    const job = await JobPostModel.findOne({ _id: id, status: "open", deletedAt: null })
      .select("-deletedAt -__v")
      .lean()
    if (!job) return response(false, 404, "This job is no longer open.")
    return response(true, 200, "Fetched.", job)
  } catch (error) {
    return catchError(error, "Failed to load job.")
  }
}
