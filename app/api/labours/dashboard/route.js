import mongoose from "mongoose";
import { isAuthenticated } from "@/lib/authentication";
import connectDB from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperfunction";
import ServiceBooking from "@/models/ServiceBooking.model";
import LabourWallet, { LabourWalletTxn } from "@/models/LabourWallet.model";
import PartnerBank from "@/models/PartnerBank.model";
import Labour from "@/models/Labour.model";
import UserModel from "@/models/User.model";
import { MIN_WITHDRAW, COMMISSION_PERCENT } from "@/lib/serviceWallet";

const mask = (s = "") => (s.length > 4 ? `•••• ${s.slice(-4)}` : s);

// IST me aaj ki shuruaat (server UTC me ho sakta hai)
const istDayStart = () => {
  const ymd = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
  return new Date(`${ymd}T00:00:00+05:30`);
};

// Labour dashboard: active jobs, history, wallet, bank — ek hi call me
export async function GET() {
  try {
    const auth = await isAuthenticated("laber");
    if (!auth.isAuth) return response(false, 403, "Unauthorized");
    await connectDB();
    void UserModel; // populate ke liye model register
    const me = auth.userId;

    const [profile, wallet, bank, active, history, txns, today] = await Promise.all([
      Labour.findOne({ owner: me }).select("fullName category phone profileImage rating completedJobs availability").lean(),
      LabourWallet.findOne({ user: me }).lean(),
      PartnerBank.findOne({ owner: me }).select("accountHolder accountNumber ifsc upi bankName status").lean(),
      ServiceBooking.find({ labourUser: me, status: { $in: ["confirmed", "in_progress"] } })
        .sort({ date: 1 }).populate("user", "name").lean(),
      ServiceBooking.find({ labourUser: me, status: { $in: ["completed", "cancelled"] } })
        .sort({ completedAt: -1, updatedAt: -1 }).limit(30)
        .select("bookingCode serviceTitle date timeSlot status paymentStatus paymentMethod commissionStatus total price commission platformFee labourEarning completedAt address.city labourUser")
        .lean(),
      LabourWalletTxn.find({ user: me }).sort({ createdAt: -1 }).limit(30).lean(),
      ServiceBooking.aggregate([
        { $match: { labourUser: new mongoose.Types.ObjectId(String(me)), status: "completed", completedAt: { $gte: istDayStart() } } },
        { $group: { _id: null, jobs: { $sum: 1 }, earned: { $sum: "$labourEarning" } } },
      ]),
    ]);

    return response(true, 200, "OK", {
      profile,
      wallet: wallet || { balance: 0, pendingDue: 0, totalEarned: 0, totalWithdrawn: 0 },
      bank: bank ? { ...bank, accountNumber: mask(bank.accountNumber) } : null,
      active,
      history,
      txns,
      today: today[0] || { jobs: 0, earned: 0 },
      minWithdraw: MIN_WITHDRAW,
      commissionPercent: COMMISSION_PERCENT,
    });
  } catch (e) { return catchError(e); }
}
