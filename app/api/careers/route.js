import connectDB from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperfunction"
import JobPostModel from "@/models/JobPost.model"

// Public: careers page ke liye sirf open jobs
export async function GET() {
  try {
    await connectDB()
    const jobs = await JobPostModel.find({ status: "open", deletedAt: null })
      .select("title department location employmentType experience createdAt")
      .sort({ createdAt: -1 })
      .lean()
    return response(true, 200, "Fetched.", jobs)
  } catch (error) {
    return catchError(error, "Failed to load jobs.")
  }
}
