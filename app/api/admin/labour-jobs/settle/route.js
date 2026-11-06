import { isAuthenticated } from "@/lib/authentication";
import connectDB from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperfunction";
import { settleDue } from "@/lib/serviceWallet";

// Admin ne labour se commission cash/UPI me le liya -> manually settle
// body: { userId, amount, note }
export async function POST(req) {
  try {
    const auth = await isAuthenticated("admin");
    if (!auth.isAuth) return response(false, 403, "Unauthorized.");
    await connectDB();
    const { userId, amount, note = "" } = await req.json();
    if (!userId || !(Number(amount) > 0)) return response(false, 400, "Labour and amount are required.");
    const r = await settleDue(userId, Number(amount), { via: "manual", note: String(note).slice(0, 200) || "Received by admin" });
    return response(true, 200, `₹${r.settled} settled`, r);
  } catch (e) {
    if (/more than pending|Invalid amount/.test(e.message)) return response(false, 400, e.message);
    return catchError(e);
  }
}
