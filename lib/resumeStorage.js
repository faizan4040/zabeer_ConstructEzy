import crypto from "crypto"
import path from "path"
import { mkdir, writeFile } from "fs/promises"

// Resume PDFs: Cloudinary env ho to wahan (raw upload), warna local disk par
// `storage/resumes` me — ye public/ ke bahar hai, isliye sirf admin API se hi khulta hai.
export const RESUME_DIR = path.join(process.cwd(), "storage", "resumes")
export const LOCAL_RESUME_ROUTE = "/api/admin/recruitment/resume/"

const cloudCfg = () => {
  const u = process.env.CLOUDINARY_URL?.match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/)
  if (u) return { key: u[1], secret: u[2], cloud: u[3] }
  const cloud = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const key = process.env.CLOUDINARY_API_KEY
  const secret = process.env.CLOUDINARY_API_SECRET || process.env.CLOUDINARY_SECRET
  return cloud && key && secret ? { cloud, key, secret } : null
}

export const isPdf = (buf) => buf.length > 4 && buf.subarray(0, 4).toString() === "%PDF"

// returns resume URL (string)
export async function saveResume(buf) {
  const id = crypto.randomUUID()
  const cfg = cloudCfg()
  if (cfg) {
    const timestamp = Math.floor(Date.now() / 1000)
    const folder = "constructezy/resumes"
    const public_id = `${id}.pdf`
    const toSign = `folder=${folder}&public_id=${public_id}&timestamp=${timestamp}${cfg.secret}`
    const signature = crypto.createHash("sha1").update(toSign).digest("hex")
    const fd = new FormData()
    fd.append("file", new Blob([buf], { type: "application/pdf" }), "resume.pdf")
    fd.append("api_key", cfg.key)
    fd.append("timestamp", String(timestamp))
    fd.append("folder", folder)
    fd.append("public_id", public_id)
    fd.append("signature", signature)
    const r = await fetch(`https://api.cloudinary.com/v1_1/${cfg.cloud}/raw/upload`, { method: "POST", body: fd })
    const j = await r.json()
    if (!r.ok) throw new Error(j?.error?.message || "Resume upload failed.")
    return j.secure_url
  }

  await mkdir(RESUME_DIR, { recursive: true })
  const name = `${id}.pdf`
  await writeFile(path.join(RESUME_DIR, name), buf)
  return `${LOCAL_RESUME_ROUTE}${name}`
}
