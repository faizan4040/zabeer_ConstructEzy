// Careers / Recruitment — shared constants (client + server dono use karte hain; yahan mongoose import mat karna)

export const JOB_DEPARTMENTS = ["Engineering", "Product", "Design", "Operations", "Business", "Sales", "Site / Field", "Other"]
export const JOB_TYPES = ["Full-time", "Part-time", "Contract", "Internship"]

export const APPLICATION_STATUSES = ["applied", "shortlisted", "interview", "hired", "rejected"]
export const NOTICE_PERIODS = ["Immediate", "15 Days", "30 Days", "60 Days", "90 Days"]
export const EXPERIENCE_OPTIONS = ["Fresher", "0-1 Years", "1-2 Years", "2-4 Years", "4-6 Years", "6-10 Years", "10+ Years"]

export const STATUS_META = {
  applied: { label: "Applied", cls: "bg-blue-50 text-blue-700" },
  shortlisted: { label: "Shortlisted", cls: "bg-emerald-50 text-emerald-700" },
  interview: { label: "In Interview", cls: "bg-violet-50 text-violet-700" },
  hired: { label: "Hired", cls: "bg-green-100 text-green-800" },
  rejected: { label: "Rejected", cls: "bg-rose-50 text-rose-700" },
}

export const RESUME_MAX_BYTES = 5 * 1024 * 1024
export const WHY_JOIN_MAX = 500
