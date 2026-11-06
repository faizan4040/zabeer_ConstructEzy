import { isAuthenticated } from "@/lib/authentication";
import connectDB from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperfunction";
import ServiceBooking from "@/models/ServiceBooking.model";
import { LabourWalletTxn } from "@/models/LabourWallet.model";
import PlatformPayout from "@/models/PlatformPayout.model";
import { z } from "zod";

const schema = z.object({
  amount: z.number().positive(),
  accountHolder: z.string().trim().min(2).max(80),
  accountNumber: z.string().trim().regex(/^[0-9]{9,18}$/, "Account number must be 9-18 digits"),
  ifsc: z.string().trim().toUpperCase().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code"),
  utr: z.string().trim().min(4, "UTR / reference is required").max(40),
  note: z.string().trim().max(200).optional().default(""),
});

async function available() {
  const [[online], [settled], [out]] = await Promise.all([
    ServiceBooking.aggregate([{ $match: { paymentStatus: "paid", status: { $ne: "cancelled" } } }, { $group: { _id: null, amt: { $sum: { $add: ["$commission", "$platformFee"] } } } }]),
    LabourWalletTxn.aggregate([{ $match: { type: "due_settled" } }, { $group: { _id: null, amt: { $sum: "$amount" } } }]),
    PlatformPayout.aggregate([{ $group: { _id: null, amt: { $sum: "$amount" } } }]),
  ]);
  return Math.round(((online?.amt || 0) + (settled?.amt || 0) - (out?.amt || 0)) * 100) / 100;
}

// Admin platform commission apne bank me transfer karke yahan record kare (UTR ke saath)
export async function POST(req) {
  try {
    const auth = await isAuthenticated("admin");
    if (!auth.isAuth) return response(false, 403, "Unauthorized.");
    await connectDB();
    const body = await req.json();
    const parsed = schema.safeParse({ ...body, amount: Number(body.amount) });
    if (!parsed.success) return response(false, 400, parsed.error.issues[0]?.message || "Invalid data");
    const avail = await available();
    if (parsed.data.amount > avail) return response(false, 400, `Only ₹${avail} commission is available.`);
    const doc = await PlatformPayout.create({ ...parsed.data, createdBy: auth.userId });
    return response(true, 200, "Withdrawal recorded", doc);
  } catch (e) { return catchError(e); }
}
