import { isAuthenticated } from "@/lib/authentication";
import connectDB from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperfunction";
import PartnerBank from "@/models/PartnerBank.model";
import { verifyIFSC } from "@/lib/razorpayX";
import { z } from "zod";

const schema = z.object({
  accountHolder: z.string().trim().min(3, "Account holder name is too short").max(80),
  accountNumber: z.string().trim().regex(/^[0-9]{9,18}$/, "Account number must be 9-18 digits"),
  ifsc: z.string().trim().toUpperCase().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code"),
  upi: z.string().trim().max(60).regex(/^$|^[\w.\-]{2,}@[a-zA-Z]{2,}$/, "Invalid UPI id").optional().default(""),
});

// Live labour apna bank account add/badle — onboarding step reset NAHI hota
export async function PUT(req) {
  try {
    const auth = await isAuthenticated("laber");
    if (!auth.isAuth) return response(false, 403, "Unauthorized");
    await connectDB();
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) return response(false, 400, parsed.error.issues[0]?.message || "Invalid data");
    const d = parsed.data;

    const ifsc = await verifyIFSC(d.ifsc);
    if (!ifsc.valid) return response(false, 400, "IFSC code not found. Please check.");

    const dup = await PartnerBank.exists({ accountNumber: d.accountNumber, owner: { $ne: auth.userId } });
    if (dup) return response(false, 400, "This account is already linked to another partner.");

    const old = await PartnerBank.findOne({ owner: auth.userId }).lean();
    const changed = !old || old.accountNumber !== d.accountNumber || old.ifsc !== d.ifsc;
    const bank = await PartnerBank.findOneAndUpdate(
      { owner: auth.userId },
      {
        ...d, bankName: ifsc.bank || "", branchName: ifsc.branch || "", status: "added",
        // naya account -> purane Razorpay contact/fund account ids kaam ke nahi
        ...(changed ? { isVerified: false, verifiedAt: null, razorpayFundAccountId: "", razorpayFundAccountFor: "" } : {}),
      },
      { upsert: true, new: true }
    );
    return response(true, 200, "Bank account saved", {
      accountHolder: bank.accountHolder, bankName: bank.bankName, ifsc: bank.ifsc, upi: bank.upi,
      accountNumber: `•••• ${bank.accountNumber.slice(-4)}`,
    });
  } catch (e) { return catchError(e); }
}
