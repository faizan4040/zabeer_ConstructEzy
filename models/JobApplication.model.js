import mongoose from "mongoose"
import { APPLICATION_STATUSES } from "@/lib/careers"

const jobApplicationSchema = new mongoose.Schema(
  {
    code: { type: String, unique: true }, // CE-APP-10001
    seq: { type: Number, index: true },
    job: { type: mongoose.Schema.Types.ObjectId, ref: "JobPost", required: true, index: true },
    jobTitle: { type: String, default: "" }, // snapshot, agar job baad me delete ho jaye

    fullName: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 150 },
    phone: { type: String, required: true, trim: true, maxlength: 15 },
    location: { type: String, required: true, trim: true, maxlength: 120 },

    experience: { type: String, required: true, maxlength: 40 },
    currentCompany: { type: String, trim: true, maxlength: 120, default: "" },
    currentRole: { type: String, trim: true, maxlength: 120, default: "" },
    noticePeriod: { type: String, required: true, maxlength: 40 },

    resumeUrl: { type: String, required: true },
    resumeName: { type: String, default: "" },
    portfolioUrl: { type: String, trim: true, maxlength: 300, default: "" },
    whyJoin: { type: String, required: true, trim: true, maxlength: 500 },

    status: { type: String, enum: APPLICATION_STATUSES, default: "applied", index: true },
    adminNotes: { type: String, maxlength: 2000, default: "" },
  },
  { timestamps: true }
)

jobApplicationSchema.index({ job: 1, email: 1 })

const JobApplicationModel =
  mongoose.models.JobApplication || mongoose.model("JobApplication", jobApplicationSchema, "jobapplications")
export default JobApplicationModel
