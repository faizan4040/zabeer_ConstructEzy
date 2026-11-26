import path from "path"
import { readFile } from "fs/promises"
import { isAuthenticated } from "@/lib/authentication"
import { RESUME_DIR } from "@/lib/resumeStorage"

export const runtime = "nodejs"

// Admin-only: local disk par save hue resume PDF ko dikhata hai
export async function GET(_req, { params }) {
  const auth = await isAuthenticated("admin")
  if (!auth.isAuth) return new Response("Unauthorized", { status: 401 })

  const { file } = await params
  if (!/^[0-9a-f-]{36}\.pdf$/i.test(file || "")) return new Response("Not found", { status: 404 })
  try {
    const buf = await readFile(path.join(RESUME_DIR, file))
    return new Response(buf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${file}"`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    })
  } catch {
    return new Response("Not found", { status: 404 })
  }
}
