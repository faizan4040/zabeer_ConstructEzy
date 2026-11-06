import { isAuthenticated } from "@/lib/authentication";
import connectDB from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperfunction";
import LabourWallet, { LabourWalletTxn } from "@/models/LabourWallet.model";
import { NextResponse } from "next/server";
import PartnerBank from "@/models/PartnerBank.model";
import { createRazorpayContact, createFundAccount, createPayout } from "@/lib/razorpayX";
import { emitLive, labourRoom } from "@/lib/realtime";

const rzErr = (e) => e?.response?.data?.error?.description || e?.message || "Payout failed";

// RazorpayX se seedha labour ke bank me transfer (RAZORPAYX_ACCOUNT_NUMBER set hona chahiye)
async function payoutViaRazorpayX(t) {
  const bank = await PartnerBank.findOne({ owner: t.user });
  if (!bank) throw new Error("Labour has no bank account.");
  if (!bank.razorpayFundAccountId || bank.razorpayFundAccountFor !== `${bank.accountNumber}|${bank.ifsc}`) {
    const contactId = bank.razorpayContactId || (await createRazorpayContact({ name: bank.accountHolder, referenceId: String(t.user) })).id;
    const fa = await createFundAccount({ contactId, accountHolderName: bank.accountHolder, accountNumber: bank.accountNumber, ifsc: bank.ifsc });
    bank.razorpayContactId = contactId;
    bank.razorpayFundAccountId = fa.id;
    bank.razorpayFundAccountFor = `${bank.accountNumber}|${bank.ifsc}`;
    await bank.save();
  }
  return createPayout({
    fundAccountId: bank.razorpayFundAccountId, amountInRupees: t.amount,
    referenceId: String(t._id), narration: "ConstructEzy labour payout",
  });
}

const ownerKey = (d) => String(d?.owner || d?.user || d?.partner || d?.userId || d?.partnerId || "");

export async function GET(req) {
  try {
    const auth = await isAuthenticated("admin");
    if (!auth.isAuth) return response(false, 403, "Unauthorized.");
    await connectDB();
    const sp = new URL(req.url).searchParams;
    const start = parseInt(sp.get("start") || "0"), size = parseInt(sp.get("size") || "10");
    const q = { type: "withdraw" };
    const [rows, total] = await Promise.all([
      LabourWalletTxn.find(q).sort({ createdAt: -1 }).skip(start).limit(size).populate("user", "name phone email").lean(),
      LabourWalletTxn.countDocuments(q),
    ]);
    // bank details (same pattern as /api/admin/labour/all)
    const PartnerBank = await import("@/models/PartnerBank.model").then((m) => m.default || null).catch(() => null);
    const banks = PartnerBank ? await PartnerBank.find({ $or: rows.map((r) => ({ $or: [{ owner: r.user?._id }, { user: r.user?._id }, { partner: r.user?._id }, { userId: r.user?._id }] })) }).lean().catch(() => []) : [];
    const bankMap = new Map(banks.map((b) => [ownerKey(b), b]));
    const data = rows.map((r) => ({ ...r, bank: bankMap.get(String(r.user?._id)) || null }));
    return NextResponse.json({ success: true, data, meta: { totalRowCount: total } });
  } catch (e) { return catchError(e); }
}

// { id, action: "paid" | "rejected" | "payout", utr }
export async function PATCH(req) {
  try {
    const auth = await isAuthenticated("admin");
    if (!auth.isAuth) return response(false, 403, "Unauthorized.");
    await connectDB();
    const { id, action, utr = "" } = await req.json();
    if (!["paid", "rejected", "payout"].includes(action)) return response(false, 400, "Invalid action");

    if (action === "payout") {
      if (!process.env.RAZORPAYX_ACCOUNT_NUMBER) return response(false, 400, "RazorpayX is not configured. Transfer manually and use Mark paid.");
      const t = await LabourWalletTxn.findOneAndUpdate(
        { _id: id, type: "withdraw", status: "requested" }, { status: "processing", note: "Sending to bank..." }, { new: true }
      );
      if (!t) return response(false, 409, "Already processed.");
      try {
        const p = await payoutViaRazorpayX(t);
        const done = p.status === "processed";
        await LabourWalletTxn.updateOne({ _id: t._id }, {
          status: done ? "paid" : "processing", ref: `payout:${p.id}`, utr: p.utr || "",
          note: done ? `UTR: ${p.utr || p.id}` : `RazorpayX ${p.status} (${p.id})`,
        });
        emitLive(labourRoom(String(t.user)), "wallet:updated", { userId: String(t.user) });
        return response(true, 200, done ? "Paid to bank" : `Payout ${p.status}. Bank will receive shortly.`);
      } catch (e) {
        await LabourWalletTxn.updateOne({ _id: t._id }, { status: "requested", note: `Payout failed: ${rzErr(e)}`.slice(0, 200) });
        return response(false, 400, rzErr(e));
      }
    }

    // atomic claim: sirf "requested"/"processing" wali entry badlegi (double click safe)
    const t = await LabourWalletTxn.findOneAndUpdate(
      { _id: id, type: "withdraw", status: { $in: action === "paid" ? ["requested", "processing"] : ["requested"] } },
      { status: action, note: action === "paid" ? `UTR: ${String(utr).slice(0, 40)}` : "Rejected by admin" },
      { new: true }
    );
    if (!t) return response(false, 409, "Already processed.");
    if (action === "rejected") {
      await LabourWallet.updateOne({ user: t.user }, { $inc: { balance: t.amount, totalWithdrawn: -t.amount } });
    }
    emitLive(labourRoom(String(t.user)), "wallet:updated", { userId: String(t.user) });
    return response(true, 200, action === "paid" ? "Marked as paid" : "Rejected & refunded to wallet");
  } catch (e) { return catchError(e); }
}
