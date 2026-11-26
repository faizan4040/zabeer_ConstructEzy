import mongoose from "mongoose"

export const PROJECT_TYPES = ["New Construction", "Renovation / Remodelling", "Repair & Maintenance", "Other"]
export const ENQUIRY_STATUSES = ["new", "contacted", "closed"]

const projectEnquirySchema = new mongoose.Schema(
  {
    projectType: { type: String, enum: PROJECT_TYPES, required: true },
    requirement: { type: String, required: true, trim: true, maxlength: 1000 },
    location: { type: String, required: true, trim: true, maxlength: 150 },
    name: { type: String, required: true, trim: true, maxlength: 60 },
    phone: { type: String, required: true, trim: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    status: { type: String, enum: ENQUIRY_STATUSES, default: "new", index: true },
  },
  { timestamps: true }
)

const ProjectEnquiryModel =
  mongoose.models.ProjectEnquiry || mongoose.model("ProjectEnquiry", projectEnquirySchema, "projectenquiries")

export default ProjectEnquiryModel
