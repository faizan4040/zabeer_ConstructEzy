import { isAuthenticated } from "@/lib/authentication";
import connectDB from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperfunction";
import ServiceBooking from "@/models/ServiceBooking.model";
import LabourWallet, { LabourWalletTxn } from "@/models/LabourWallet.model";
import PlatformPayout from "@/models/PlatformPayout.model";
import Labour from "@/models/Labour.model";
import UserModel from "@/models/User.model";

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const FILTERS = {
  live: { status: "in_progress" },
  upcoming: { status: "confirmed" },
  unassigned: { status: { $in: ["confirmed", "pending_payment"] }, labourUser: null },
  completed: { status: "completed" },
  due: { commissionStatus: "due" },
  all: {},
};

// Admin "Labour Jobs" dashboard: jobs + money summary + labour commission list
export async function GET(req) {
  try {
    const auth = await isAuthenticated("admin");
    if (!auth.isAuth) return response(false, 403, "Unauthorized.");
    await connectDB();
    void UserModel;

    const sp = new URL(req.url).searchParams;
    const tab = FILTERS[sp.get("tab")] ? sp.get("tab") : "live";
    const q = { ...FILTERS[tab] };
    const g = (sp.get("q") || "").trim();
    if (g) {
      const rx = new RegExp(esc(g), "i");
      q.$or = [{ bookingCode: rx }, { serviceTitle: rx }, { labourName: rx }, { contactPhone: rx }];
    }

    const [jobs, counts, [money], settled, payouts, wallets, labours, pendingWithdraw] = await Promise.all([
      ServiceBooking.find(q).sort({ updatedAt: -1 }).limit(100).populate("user", "name").lean(),
      ServiceBooking.aggregate([{ $facet: Object.fromEntries(
        Object.entries(FILTERS).filter(([k]) => k !== "all").map(([k, f]) => [k, [{ $match: f }, { $count: "n" }]])
      ) }]),
      ServiceBooking.aggregate([
        { $match: { paymentStatus: "paid", status: { $ne: "cancelled" } } },
        { $group: { _id: null, onlineCommission: { $sum: { $add: ["$commission", "$platformFee"] } }, onlineCollected: { $sum: "$total" } } },
      ]),
      LabourWalletTxn.aggregate([{ $match: { type: "due_settled" } }, { $group: { _id: "$via", amt: { $sum: "$amount" } } }]),
      PlatformPayout.find().sort({ createdAt: -1 }).limit(20).lean(),
      LabourWallet.find({ $or: [{ pendingDue: { $gt: 0 } }, { balance: { $gt: 0 } }, { totalEarned: { $gt: 0 } }] })
        .sort({ pendingDue: -1 }).limit(200).populate("user", "name phone").lean(),
      Labour.find({ status: "approved", isActive: true }).select("owner fullName phone category availability rating").sort({ fullName: 1 }).limit(500).lean(),
      LabourWalletTxn.aggregate([{ $match: { type: "withdraw", status: { $in: ["requested", "processing"] } } }, { $group: { _id: null, n: { $sum: 1 }, amt: { $sum: "$amount" } } }]),
    ]);

    const c = counts[0] || {};
    const count = (k) => c[k]?.[0]?.n || 0;
    const settledBy = Object.fromEntries(settled.map((s) => [s._id || "manual", s.amt]));
    const settledTotal = settled.reduce((a, s) => a + s.amt, 0);
    const withdrawn = (await PlatformPayout.aggregate([{ $group: { _id: null, amt: { $sum: "$amount" } } }]))[0]?.amt || 0;
    const earned = (money?.onlineCommission || 0) + settledTotal;
    const r2 = (n) => Math.round(n * 100) / 100;

    // labour wallet + profile ek row me
    const profileByOwner = new Map(labours.map((l) => [String(l.owner), l]));
    const labourRows = wallets.map((w) => {
      const p = profileByOwner.get(String(w.user?._id));
      return {
        userId: w.user?._id, name: p?.fullName || w.user?.name || "—", phone: p?.phone || w.user?.phone || "",
        category: p?.category || "", balance: w.balance, pendingDue: w.pendingDue, totalEarned: w.totalEarned, totalWithdrawn: w.totalWithdrawn,
      };
    });

    return response(true, 200, "OK", {
      tab,
      jobs,
      counts: { live: count("live"), upcoming: count("upcoming"), unassigned: count("unassigned"), completed: count("completed"), due: count("due") },
      money: {
        earned: r2(earned),
        onlineCommission: r2(money?.onlineCommission || 0),
        cashCommissionSettled: r2(settledTotal),
        settledBy,
        withdrawn: r2(withdrawn),
        available: r2(earned - withdrawn),
        outstandingDue: r2(wallets.reduce((a, w) => a + (w.pendingDue || 0), 0)),
        labourPayable: r2(wallets.reduce((a, w) => a + (w.balance || 0), 0)),
        pendingWithdraw: pendingWithdraw[0] || { n: 0, amt: 0 },
      },
      labours: labourRows,
      assignable: labours.map((l) => ({ userId: l.owner, name: l.fullName, phone: l.phone, category: l.category, availability: l.availability })),
      payouts,
    });
  } catch (e) { return catchError(e); }
}
