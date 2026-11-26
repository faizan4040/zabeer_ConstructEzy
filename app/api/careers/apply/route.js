import mongoose from "mongoose"
import connectDB from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperfunction"
import { EXPERIENCE_OPTIONS, NOTICE_PERIODS, RESUME_MAX_BYTES, WHY_JOIN_MAX } from "@/lib/careers"
import { isPdf, saveResume } from "@/lib/resumeStorage"
import JobPostModel from "@/models/JobPost.model"
import JobApplicationModel from "@/models/JobApplication.model"

export const runtime = "nodejs"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^[6-9]\d{9}$/

const str = (fd, k, max = 200) => String(fd.get(k) ?? "").trim().slice(0, max)

// Public: candidate ka application (multipart form + resume PDF)
export async function POST(req) {
  try {
    const fd = await req.formData()

    const jobId = str(fd, "jobId", 40)
    const data = {
      fullName: str(fd, "fullName", 100),
      email: str(fd, "email", 150).toLowerCase(),
      phone: str(fd, "phone", 15).replace(/\D/g, "").slice(-10),
      location: str(fd, "location", 120),
      experience: str(fd, "experience", 40),
      currentCompany: str(fd, "currentCompany", 120),
      currentRole: str(fd, "currentRole", 120),
      noticePeriod: str(fd, "noticePeriod", 40),
      portfolioUrl: str(fd, "portfolioUrl", 300),
      whyJoin: str(fd, "whyJoin", WHY_JOIN_MAX + 50),
    }

    // ── validation ──
    if (!mongoose.isValidObjectId(jobId)) return response(false, 400, "Invalid job.")
    if (data.fullName.length < 2) return response(false, 400, "Please enter your full name.")
    if (!EMAIL_RE.test(data.email)) return response(false, 400, "Please enter a valid email address.")
    if (!PHONE_RE.test(data.phone)) return response(false, 400, "Please enter a valid 10-digit mobile number.")
    if (!data.location) return response(false, 400, "Please enter your current location.")
    if (!EXPERIENCE_OPTIONS.includes(data.experience)) return response(false, 400, "Please select your total experience.")
    if (!NOTICE_PERIODS.includes(data.noticePeriod)) return response(false, 400, "Please select your notice period.")
    if (data.whyJoin.length < 10) return response(false, 400, "Please tell us (in a few lines) why you want to join.")
    if (data.whyJoin.length > WHY_JOIN_MAX) return response(false, 400, `Keep it under ${WHY_JOIN_MAX} characters.`)
    if (data.portfolioUrl && !/^https?:\/\/\S+$/i.test(data.portfolioUrl)) {
      return response(false, 400, "Portfolio link must start with http:// or https://")
    }

    const file = fd.get("resume")
    if (!file || typeof file === "string") return response(false, 400, "Please upload your resume (PDF).")
    if (file.size > RESUME_MAX_BYTES) return response(false, 400, "Resume must be under 5 MB.")
    const buf = Buffer.from(await file.arrayBuffer())
    if (!isPdf(buf)) return response(false, 400, "Only PDF resumes are allowed.")

    await connectDB()
    const job = await JobPostModel.findOne({ _id: jobId, status: "open", deletedAt: null }).select("title").lean()
    if (!job) return response(false, 404, "This job is no longer accepting applications.")

    const dup = await JobApplicationModel.exists({ job: jobId, email: data.email })
    if (dup) return response(false, 409, "You have already applied for this role with this email.")

    const resumeUrl = await saveResume(buf)
    const resumeName = String(file.name || "resume.pdf").slice(0, 120)

    // sequential application code: CE-APP-10001...
    for (let attempt = 0; attempt < 3; attempt++) {
      const last = await JobApplicationModel.findOne().sort({ seq: -1 }).select("seq").lean()
      const seq = (last?.seq || 10000) + 1
      try {
        const app = await JobApplicationModel.create({
          ...data, job: jobId, jobTitle: job.title, resumeUrl, resumeName, seq, code: `CE-APP-${seq}`,
        })
        return response(true, 200, "Application submitted.", {
          code: app.code, jobTitle: job.title, submittedAt: app.createdAt,
        })
      } catch (e) {
        if (e.code !== 11000 || attempt === 2) throw e
      }
    }
  } catch (error) {
    return catchError(error, "Could not submit application. Please try again.")
  }
}
