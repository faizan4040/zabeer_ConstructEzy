import { isAuthenticated } from "@/lib/authentication";
import connectDB from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperfunction";
import LabourWallet, { LabourWalletTxn } from "@/models/LabourWallet.model";
import { MIN_WITHDRAW, COMMISSION_PERCENT } from "@/lib/serviceWallet";

export async function GET() {
  try {
    const auth = await isAuthenticated("laber");
    if (!auth.isAuth) return response(false, 403, "Unauthorized");
    await connectDB();
    const wallet = (await LabourWallet.findOne({ user: auth.userId }).lean()) ||
      { balance: 0, pendingDue: 0, totalEarned: 0, totalWithdrawn: 0 };
    const txns = await LabourWalletTxn.find({ user: auth.userId }).sort({ createdAt: -1 }).limit(50).lean();
    return response(true, 200, "OK", { wallet, txns, minWithdraw: MIN_WITHDRAW, commissionPercent: COMMISSION_PERCENT });
  } catch (e) { return catchError(e); }
}
