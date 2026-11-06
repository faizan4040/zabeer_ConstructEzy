import { isAuthenticated } from "@/lib/authentication";
import connectDB from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperfunction";
import PartnerBank from "@/models/PartnerBank.model";
import { requestWithdraw } from "@/lib/serviceWallet";
import { emitLive, ADMIN_JOBS_ROOM } from "@/lib/realtime";

export async function POST(req) {
  try {
    const auth = await isAuthenticated("laber");
    if (!auth.isAuth) return response(false, 403, "Unauthorized");
    await connectDB();
    const amount = Number((await req.json()).amount);
    if (!Number.isFinite(amount)) return response(false, 400, "Invalid amount");
    if (!(await PartnerBank.exists({ owner: auth.userId }))) return response(false, 400, "Add your bank account first.");
    const { wallet } = await requestWithdraw(auth.userId, amount);
    emitLive(ADMIN_JOBS_ROOM, "withdraw:requested", { userId: String(auth.userId), amount });
    return response(true, 200, "Withdraw requested", { balance: wallet.balance });
  } catch (e) {
    if (/Minimum|Insufficient/.test(e.message)) return response(false, 400, e.message);
    return catchError(e);
  }
}
