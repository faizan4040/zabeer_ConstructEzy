import { isAuthenticated } from "@/lib/authentication"
import connectDB from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperfunction"
import UserModel from "@/models/User.model"

export async function PUT(request) {
  try {
    const auth = await isAuthenticated(["admin", "shop owner"])
    if (!auth.isAuth) return response(false, 401, "Unauthorized.")

    const { currentPassword, newPassword } = await request.json()
    if (!currentPassword || !newPassword) {
      return response(false, 400, "Current and new password are required.")
    }
    if (String(newPassword).length < 8) {
      return response(false, 400, "New password must be at least 8 characters.")
    }

    await connectDB()
    const user = await UserModel.findOne({ _id: auth.userId, deletedAt: null }).select("+password")
    if (!user) return response(false, 404, "User not found.")

    const matches = await user.comparePassword(currentPassword)
    if (!matches) return response(false, 400, "Current password is incorrect.")

    user.password = newPassword // hashed by the pre-save hook
    await user.save()

    return response(true, 200, "Password changed successfully.")
  } catch (error) {
    return catchError(error, "Failed to change password.")
  }
}
