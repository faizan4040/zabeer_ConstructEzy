import { isAuthenticated } from "@/lib/authentication"
import { uploadToCloudinary, deleteFromCloudinary } from "@/lib/cloudinary"
import connectDB from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperfunction"
import UserModel from "@/models/User.model"

// Profile API for the admin + shop owner dashboards (header avatar, profile page)
const PANEL_ROLES = ["admin", "shop owner"]
const MAX_AVATAR_SIZE = 2 * 1024 * 1024 // 2 MB

const toPublicUser = (user) => ({
  _id: user._id.toString(),
  role: user.role,
  name: user.name,
  email: user.email,
  phone: user.phone || "",
  avatar: user.avatar || null,
})

export async function GET() {
  try {
    const auth = await isAuthenticated(PANEL_ROLES)
    if (!auth.isAuth) return response(false, 401, "Unauthorized.")

    await connectDB()
    const user = await UserModel.findOne({ _id: auth.userId, deletedAt: null })
    if (!user) return response(false, 404, "User not found.")

    return response(true, 200, "Profile fetched.", toPublicUser(user))
  } catch (error) {
    return catchError(error, "Failed to fetch profile.")
  }
}

export async function PUT(request) {
  try {
    const auth = await isAuthenticated(PANEL_ROLES)
    if (!auth.isAuth) return response(false, 401, "Unauthorized.")

    await connectDB()
    const user = await UserModel.findOne({ _id: auth.userId, deletedAt: null })
    if (!user) return response(false, 404, "User not found.")

    const formData = await request.formData()
    const name = String(formData.get("name") || "").trim()
    const phone = String(formData.get("phone") || "").trim()
    const removeAvatar = formData.get("removeAvatar") === "true"
    const file = formData.get("file")

    if (name) {
      if (name.length < 2) return response(false, 400, "Name must be at least 2 characters.")
      user.name = name
    }
    if (phone && !/^\d{10}$/.test(phone)) {
      return response(false, 400, "Phone number must be 10 digits.")
    }
    user.phone = phone

    if (file && typeof file === "object" && file.size > 0) {
      if (!file.type?.startsWith("image/")) return response(false, 400, "Only image files are allowed.")
      if (file.size > MAX_AVATAR_SIZE) return response(false, 400, "Image must be under 2 MB.")

      const buffer = Buffer.from(await file.arrayBuffer())
      const uploaded = await uploadToCloudinary(buffer, "avatars")

      if (user.avatar?.public_id) await deleteFromCloudinary(user.avatar.public_id)
      user.avatar = { url: uploaded.url, public_id: uploaded.public_id }
    } else if (removeAvatar && user.avatar?.url) {
      if (user.avatar.public_id) await deleteFromCloudinary(user.avatar.public_id)
      user.avatar = { url: "", public_id: "" }
    }

    await user.save()
    return response(true, 200, "Profile updated successfully.", toPublicUser(user))
  } catch (error) {
    return catchError(error, "Failed to update profile.")
  }
}
