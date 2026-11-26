import mongoose from "mongoose"
import { isAuthenticated } from "@/lib/authentication"
import connectDB from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperfunction"
import { JOB_DEPARTMENTS, JOB_TYPES } from "@/lib/careers"
import JobPostModel from "@/models/JobPost.model"
import JobApplicationModel from "@/models/JobApplication.model"

const guard = async () => {
  const auth = await isAuthenticated("admin")
  if (!auth.isAuth) return response(false, 401, "Unauthorized.")
  await connectDB()
  return null
}

const toList = (v, max) =>
  (Array.isArray(v) ? v : String(v ?? "").split(/\r?\n|,/))
    .map((s) => String(s).trim())
    .filter(Boolean)
    .slice(0, max)

// body -> clean job fields. returns { data } or { error }
const clean = (b = {}) => {
  const title = String(b.title ?? "").trim()
  if (title.length < 2) return { error: "Job title is required." }
  const data = {
    title: title.slice(0, 120),
    department: JOB_DEPARTMENTS.includes(b.department) ? b.department : "Other",
    location: String(b.location ?? "").trim().slice(0, 120),
    employmentType: JOB_TYPES.includes(b.employmentType) ? b.employmentType : "Full-time",
    experience: String(b.experience ?? "").trim().slice(0, 40),
    about: String(b.about ?? "").trim().slice(0, 3000),
    responsibilities: toList(b.responsibilities, 20).map((s) => s.slice(0, 300)),
    skills: toList(b.skills, 25).map((s) => s.slice(0, 40)),
    status: b.status === "closed" ? "closed" : "open",
  }
  return { data }
}

export async function GET() {
  try {
    const denied = await guard()
    if (denied) return denied
    const jobs = await JobPostModel.find({ deletedAt: null }).sort({ createdAt: -1 }).lean()
    const counts = await JobApplicationModel.aggregate([{ $group: { _id: "$job", n: { $sum: 1 } } }])
    const byJob = Object.fromEntries(counts.map((c) => [String(c._id), c.n]))
    return response(true, 200, "Fetched.", jobs.map((j) => ({ ...j, applications: byJob[String(j._id)] || 0 })))
  } catch (error) {
    return catchError(error, "Failed to load jobs.")
  }
}

export async function POST(req) {
  try {
    const denied = await guard()
    if (denied) return denied
    const { data, error } = clean(await req.json())
    if (error) return response(false, 400, error)
    const job = await JobPostModel.create(data)
    return response(true, 200, "Job posted.", job)
  } catch (error) {
    return catchError(error, "Failed to create job.")
  }
}

export async function PATCH(req) {
  try {
    const denied = await guard()
    if (denied) return denied
    const body = await req.json()
    if (!mongoose.isValidObjectId(body?.id)) return response(false, 400, "Invalid id.")

    // sirf status toggle
    if (Object.keys(body).length === 2 && "status" in body) {
      const status = body.status === "closed" ? "closed" : "open"
      const job = await JobPostModel.findOneAndUpdate({ _id: body.id, deletedAt: null }, { $set: { status } }, { new: true })
      if (!job) return response(false, 404, "Job not found.")
      return response(true, 200, status === "open" ? "Job is live." : "Job closed.", job)
    }

    const { data, error } = clean(body)
    if (error) return response(false, 400, error)
    const job = await JobPostModel.findOneAndUpdate({ _id: body.id, deletedAt: null }, { $set: data }, { new: true, runValidators: true })
    if (!job) return response(false, 404, "Job not found.")
    // applications me title snapshot bhi update
    await JobApplicationModel.updateMany({ job: job._id }, { $set: { jobTitle: job.title } })
    return response(true, 200, "Job updated.", job)
  } catch (error) {
    return catchError(error, "Failed to update job.")
  }
}

export async function DELETE(req) {
  try {
    const denied = await guard()
    if (denied) return denied
    const { id } = await req.json()
    if (!mongoose.isValidObjectId(id)) return response(false, 400, "Invalid id.")
    await JobPostModel.updateOne({ _id: id }, { $set: { deletedAt: new Date(), status: "closed" } })
    return response(true, 200, "Job deleted.")
  } catch (error) {
    return catchError(error, "Failed to delete job.")
  }
}
