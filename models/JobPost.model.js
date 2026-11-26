import mongoose from "mongoose"
import { JOB_DEPARTMENTS, JOB_TYPES } from "@/lib/careers"

// Careers page par dikhne wali job openings (admin Recruitment se banti hain)

const jobPostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    department: { type: String, enum: JOB_DEPARTMENTS, default: "Other" },
    location: { type: String, trim: true, maxlength: 120, default: "" },
    employmentType: { type: String, enum: JOB_TYPES, default: "Full-time" },
    experience: { type: String, trim: true, maxlength: 40, default: "" }, // e.g. "2-4 Years"
    about: { type: String, trim: true, maxlength: 3000, default: "" },
    responsibilities: { type: [String], default: [] },
    skills: { type: [String], default: [] },
    status: { type: String, enum: ["open", "closed"], default: "open", index: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
)

const JobPostModel = mongoose.models.JobPost || mongoose.model("JobPost", jobPostSchema, "jobposts")
export default JobPostModel
