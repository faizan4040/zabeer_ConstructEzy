import axios from "axios";
import User from "@/models/User.model";

// Sends a live event through your existing socket server (/emit).
// Never throws: if the socket server is down, pages still update by polling.
async function emit(userId, event, data) {
  const url = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL;
  if (!url || !userId) return;
  try {
    await axios.post(`${url}/emit`, { event, userId: String(userId), data }, { timeout: 2000 });
  } catch {
    /* ignore */
  }
}

export const notifyUser = (userId, data) => emit(userId, "booking-update", data);

export async function notifyAdmins(data) {
  try {
    const admins = await User.find({ role: "admin" }).select("_id").lean();
    await Promise.all(admins.map((a) => emit(a._id, "booking-update", data)));
  } catch {
    /* ignore */
  }
}