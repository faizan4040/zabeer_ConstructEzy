import LabourWallet, { LabourWalletTxn } from "@/models/LabourWallet.model";
import ServiceBooking from "@/models/ServiceBooking.model";
import Labour from "@/models/Labour.model";
import { emitJobUpdate, emitLive, labourRoom, ADMIN_JOBS_ROOM } from "@/lib/realtime";

export const COMMISSION_PERCENT = Number(process.env.SERVICE_COMMISSION_PERCENT || 10);
export const PLATFORM_FEE = Number(process.env.SERVICE_PLATFORM_FEE || 18);
export const MIN_WITHDRAW = Number(process.env.SERVICE_MIN_WITHDRAW || 100);

const r2 = (n) => Math.round(Number(n || 0) * 100) / 100;

export const calcAmounts = (price) => {
  const commission = Math.round(price * COMMISSION_PERCENT) / 100;
  return {
    price,
    platformFee: PLATFORM_FEE,
    total: price + PLATFORM_FEE,
    commissionPercent: COMMISSION_PERCENT,
    commission,
    labourEarning: price - commission,
  };
};

// cash job me labour ko platform ko kitna dena hai
export const cashDueOf = (b) => r2((b.commission || 0) + (b.platformFee || 0));

export const ensureWallet = (user) =>
  LabourWallet.findOneAndUpdate({ user }, { $setOnInsert: { user } }, { upsert: true, new: true });

const pingWallet = (user) => {
  emitLive([labourRoom(String(user)), ADMIN_JOBS_ROOM], "wallet:updated", { userId: String(user) });
};

/**
 * Wallet ka pendingDue kitni cash bookings ko cover karta hai, uske hisaab se
 * booking.commissionStatus sync karo. Sabse purani due bookings pehle settle hoti hain.
 */
export async function syncCommissionStatus(user, via = "auto") {
  const w = await LabourWallet.findOne({ user }).lean();
  let remaining = r2(w?.pendingDue);
  const dues = await ServiceBooking.find({ labourUser: user, commissionStatus: "due" })
    .sort({ completedAt: -1 }).select("_id commission platformFee").lean();
  const settledIds = [];
  for (const b of dues) {
    if (remaining > 0) remaining = r2(remaining - cashDueOf(b)); // abhi bhi due
    else settledIds.push(b._id);
  }
  if (settledIds.length) {
    await ServiceBooking.updateMany(
      { _id: { $in: settledIds }, commissionStatus: "due" },
      { commissionStatus: "settled", commissionSettledAt: new Date(), commissionSettledVia: via }
    );
  }
}

// Online paid job FINISH hone par: commission pehle hi kat chuka hai, labourEarning wallet me.
// Purana cash due ho to pehle wahi adjust hota hai.
export async function creditOnline(booking) {
  if (!booking?.labourUser) return;
  const claimed = await ServiceBooking.findOneAndUpdate(
    { _id: booking._id, labourCredited: false, paymentStatus: "paid", status: "completed" },
    { labourCredited: true },
    { new: true }
  );
  if (!claimed) return; // already credited / abhi complete nahi hua

  // purane code me payment ke time hi credit ho jata tha — un bookings ko dobara credit mat karo
  if (await LabourWalletTxn.exists({ booking: claimed._id, type: "online_credit" })) return;

  const w = await ensureWallet(claimed.labourUser);
  const earning = r2(claimed.labourEarning);
  const settle = Math.min(r2(w.pendingDue), earning);
  const credit = r2(earning - settle);
  await LabourWallet.updateOne(
    { _id: w._id },
    { $inc: { balance: credit, pendingDue: -settle, totalEarned: earning } }
  );
  await LabourWalletTxn.create({
    user: claimed.labourUser, booking: claimed._id, type: "online_credit",
    gross: claimed.price, commission: claimed.commission, amount: credit,
    note: `#${claimed.bookingCode} online payment (commission ₹${claimed.commission} auto cut)`,
  });
  if (settle > 0) {
    await LabourWalletTxn.create({
      user: claimed.labourUser, booking: claimed._id, type: "due_settled", via: "auto",
      amount: settle, note: "Cash commission due adjusted from online earning",
    });
    await syncCommissionStatus(claimed.labourUser, "auto");
  }
  pingWallet(claimed.labourUser);
}

// Cash job complete -> labour ke paas cash hai, platform ka hissa pending due
export async function addCashDue(booking) {
  if (!booking?.labourUser) return;
  const claimed = await ServiceBooking.findOneAndUpdate(
    { _id: booking._id, commissionStatus: "none" },
    { commissionStatus: "due" },
    { new: true }
  );
  if (!claimed) return;
  const due = cashDueOf(claimed);
  await ensureWallet(claimed.labourUser);
  await LabourWallet.updateOne(
    { user: claimed.labourUser },
    { $inc: { pendingDue: due, totalEarned: r2(claimed.labourEarning) } }
  );
  await LabourWalletTxn.create({
    user: claimed.labourUser, booking: claimed._id, type: "cash_due",
    gross: claimed.total, commission: claimed.commission, amount: due,
    note: `#${claimed.bookingCode} cash job: ₹${due} pay to company`,
  });
  pingWallet(claimed.labourUser);
}

/**
 * Labour ka commission due settle karo.
 * via: "online" (labour ne Razorpay se pay kiya) | "manual" (admin ne cash/UPI receive mark kiya)
 * ref: Razorpay payment id — same payment dobara aaye to ignore.
 * Due se zyada aaya paisa (race me) wallet balance me chala jaata hai, gayab nahi hota.
 */
export async function settleDue(user, amount, { via = "manual", note = "", ref } = {}) {
  amount = r2(amount);
  if (!(amount > 0)) throw new Error("Invalid amount");
  await ensureWallet(user);

  for (let i = 0; i < 4; i++) {
    const w = await LabourWallet.findOne({ user }).lean();
    const due = r2(w.pendingDue);
    if (via === "manual" && amount > due) throw new Error(`Amount is more than pending due (₹${due})`);
    const settle = Math.min(due, amount);
    const extra = r2(amount - settle);

    // conditional update: beech me due badla to dobara try
    const upd = await LabourWallet.findOneAndUpdate(
      { _id: w._id, pendingDue: w.pendingDue },
      { $inc: { pendingDue: -settle, balance: extra } },
      { new: true }
    );
    if (!upd) continue;

    try {
      await LabourWalletTxn.create({
        user, type: "due_settled", via, amount: settle, ref,
        note: note || (via === "online" ? "Commission paid online" : "Commission received by admin"),
      });
      if (extra > 0) {
        await LabourWalletTxn.create({
          user, type: "online_credit", amount: extra, note: "Extra amount paid (more than due) added to balance",
        });
      }
    } catch (e) {
      if (e.code === 11000) {
        // same payment pehle hi count ho chuka tha -> wallet change wapas
        await LabourWallet.updateOne({ _id: w._id }, { $inc: { pendingDue: settle, balance: -extra } });
        return { duplicate: true, wallet: w };
      }
      throw e;
    }
    await syncCommissionStatus(user, via);
    pingWallet(user);
    return { wallet: upd, settled: settle, extra };
  }
  throw new Error("Wallet busy, please try again");
}

export async function requestWithdraw(user, amount) {
  amount = r2(amount);
  if (!(amount >= MIN_WITHDRAW)) throw new Error(`Minimum withdraw ₹${MIN_WITHDRAW}`);
  // atomic: balance kam ho to update hi nahi hoga
  const w = await LabourWallet.findOneAndUpdate(
    { user, balance: { $gte: amount } },
    { $inc: { balance: -amount, totalWithdrawn: amount } },
    { new: true }
  );
  if (!w) throw new Error("Insufficient balance");
  const txn = await LabourWalletTxn.create({ user, type: "withdraw", amount, status: "requested" });
  pingWallet(user);
  return { wallet: w, txn };
}

/**
 * Job finish (labour ka "Finish Work" ya admin ka "Mark done").
 * - online paid  -> labourEarning wallet me (commission auto cut)
 * - cash         -> paymentStatus cash_collected, commission + platform fee labour par due
 */
export async function finishJob(filter) {
  const now = new Date();
  const b = await ServiceBooking.findOneAndUpdate(
    { ...filter, completedAt: null, status: { $in: ["confirmed", "in_progress"] }, paymentStatus: { $in: ["paid", "cash_due"] } },
    { status: "completed", completedAt: now },
    { new: true }
  );
  if (!b) return null;
  if (!b.startedAt) await ServiceBooking.updateOne({ _id: b._id }, { startedAt: now });

  if (b.paymentStatus === "paid") {
    await creditOnline(b);
  } else {
    await ServiceBooking.updateOne({ _id: b._id }, { paymentStatus: "cash_collected" });
    await addCashDue(b);
  }
  if (b.labourUser) {
    await Labour.updateOne({ owner: b.labourUser }, { $inc: { completedJobs: 1 }, availability: "available" }).catch(() => {});
  }
  const fresh = await ServiceBooking.findById(b._id);
  emitJobUpdate(fresh, "job:finished");
  return fresh;
}

// confirmed ya (15 min se kam purani) pending_payment booking slot rokti hai
export const slotHoldFilter = () => ({
  $or: [
    { status: { $in: ["confirmed", "in_progress"] } },
    { status: "pending_payment", createdAt: { $gte: new Date(Date.now() - 15 * 60 * 1000) } },
  ],
});
