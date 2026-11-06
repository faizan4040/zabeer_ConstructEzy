import crypto from "crypto";
import path from "path";
import { mkdir, writeFile } from "fs/promises";
import { isAuthenticated } from "@/lib/authentication";
import { catchError, response } from "@/lib/helperfunction";

export const runtime = "nodejs";
const MAX = 5 * 1024 * 1024;

// file ka asli type bytes se pehchano (client ke mime par bharosa nahi)
const sniff = (b) => {
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "jpg";
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return "png";
  if (b.slice(0, 4).toString() === "RIFF" && b.slice(8, 12).toString() === "WEBP") return "webp";
  if (b.slice(4, 12).toString() === "ftypavif") return "avif";
  return null;
};

const cloudCfg = () => {
  const u = process.env.CLOUDINARY_URL?.match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/);
  if (u) return { key: u[1], secret: u[2], cloud: u[3] };
  const cloud = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const key = process.env.CLOUDINARY_API_KEY;
  const secret = process.env.CLOUDINARY_API_SECRET || process.env.CLOUDINARY_SECRET;
  return cloud && key && secret ? { cloud, key, secret } : null;
};

// Admin system se image upload karta hai. Cloudinary env mile to wahan, warna public/uploads/services me.
export async function POST(req) {
  try {
    const auth = await isAuthenticated("admin");
    if (!auth.isAuth) return response(false, 403, "Unauthorized.");

    const file = (await req.formData()).get("file");
    if (!file || typeof file === "string") return response(false, 400, "No file received.");
    if (file.size > MAX) return response(false, 400, "Image must be under 5 MB.");
    const buf = Buffer.from(await file.arrayBuffer());
    const ext = sniff(buf);
    if (!ext) return response(false, 400, "Only JPG, PNG, WEBP or AVIF images are allowed.");

    const cfg = cloudCfg();
    if (cfg) {
      const timestamp = Math.floor(Date.now() / 1000);
      const folder = "constructezy/services";
      const signature = crypto.createHash("sha1").update(`folder=${folder}&timestamp=${timestamp}${cfg.secret}`).digest("hex");
      const fd = new FormData();
      fd.append("file", new Blob([buf]), `upload.${ext}`);
      fd.append("api_key", cfg.key); fd.append("timestamp", String(timestamp)); fd.append("folder", folder); fd.append("signature", signature);
      const r = await fetch(`https://api.cloudinary.com/v1_1/${cfg.cloud}/image/upload`, { method: "POST", body: fd });
      const j = await r.json();
      if (!r.ok) return response(false, 502, j?.error?.message || "Cloudinary upload failed.");
      return response(true, 200, "Uploaded", { url: j.secure_url });
    }

    // fallback: local disk (sirf self-hosted / dev; Vercel par persist nahi hota)
    const dir = path.join(process.cwd(), "public", "uploads", "services");
    await mkdir(dir, { recursive: true });
    const name = `${crypto.randomUUID()}.${ext}`;
    await writeFile(path.join(dir, name), buf);
    return response(true, 200, "Uploaded", { url: `/uploads/services/${name}` });
  } catch (e) { return catchError(e); }
}
