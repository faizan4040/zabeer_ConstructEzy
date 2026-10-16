import axios from "axios";
import connectDB from "@/lib/databaseConnection";
import Booking from "@/models/Booking.model";
import PartnerBank from "@/models/PartnerBank.model";
import { createRazorpayContact, createFundAccount, createPayout } from "@/lib/razorpayX";

const rzpAuth = {
  auth: {
    username: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    password: process.env.RAZORPAY_KEY_SECRET,
  },
};

const errMsg = (e) => e?.response?.data?.error?.description || e?.message || "Payout error";

// Razorpay payout status -> our payoutStatus
const STATUS_MAP = {
  processed: "paid",
  queued: "processing",
  pending: "processing",
  processing: "processing",
  scheduled: "processing",
  rejected: "failed",
  cancelled: "failed",
  reversed: "failed",
  failed: "failed",
};

async function applyPayoutState(bookingId, payout) {
  const payoutStatus = STATUS_MAP[payout.status] || "processing";
  const update = {
    payoutId: payout.id,
    payoutUtr: payout.utr || "",
    payoutRazorpayStatus: payout.status,
    payoutStatus,
    payoutError: payoutStatus === "failed" ? payout.status_details?.description || `Payout ${payout.status}` : "",
  };
  if (payoutStatus === "paid") update.payoutAt = new Date();

  await Booking.updateOne({ _id: bookingId }, { $set: update });
  return { ok: payoutStatus !== "failed", payoutStatus, message: update.payoutError || `Payout ${payout.status}` };
}

/**
 * Sends labourAmount of a completed + online-paid booking to the labour's bank account.
 * Safe against double clicks: the booking is locked by moving it to "processing" first.
 */
export async function payoutBooking(bookingId) {
  await connectDB();

  const booking = await Booking.findOneAndUpdate(
    {
      _id: bookingId,
      paymentMethod: "online",
      paymentStatus: "paid",
      bookingStatus: "completed",
      payoutStatus: { $in: ["pending", "failed"] },
    },
    { $set: { payoutStatus: "processing", payoutError: "" } },
    { new: true }
  );

  if (!booking) {
    return { ok: false, message: "Booking is not eligible for payout, or a payout is already in progress" };
  }

  const fail = async (message) => {
    await Booking.updateOne({ _id: booking._id }, { $set: { payoutStatus: "failed", payoutError: message } });
    return { ok: false, payoutStatus: "failed", message };
  };

  const bank = await PartnerBank.findOne({ owner: booking.labour });
  if (!bank) return fail("Labour has not added a bank account");

  // 1) make sure a Razorpay fund account exists for the CURRENT bank details
  try {
    const fingerprint = `${bank.accountNumber}|${bank.ifsc}`;
    if (!bank.razorpayFundAccountId || bank.razorpayFundAccountFor !== fingerprint) {
      if (!bank.razorpayContactId) {
        const contact = await createRazorpayContact({
          name: bank.accountHolder,
          referenceId: String(bank.owner),
        });
        bank.razorpayContactId = contact.id;
      }
      const fundAccount = await createFundAccount({
        contactId: bank.razorpayContactId,
        accountHolderName: bank.accountHolder,
        accountNumber: bank.accountNumber,
        ifsc: bank.ifsc,
      });
      bank.razorpayFundAccountId = fundAccount.id;
      bank.razorpayFundAccountFor = fingerprint;
      await bank.save();
    }
  } catch (e) {
    return fail(`Bank setup failed: ${errMsg(e)}`);
  }

  // 2) send the money
  try {
    const amount = booking.labourAmount || booking.fare - (booking.adminCommission || 0);
    const payout = await createPayout({
      fundAccountId: bank.razorpayFundAccountId,
      amountInRupees: amount,
      referenceId: String(booking._id),
      narration: `ConstructEzy job ${String(booking._id).slice(-6)}`,
    });
    return await applyPayoutState(booking._id, payout);
  } catch (e) {
    // Razorpay answered with a clear 4xx error -> safe to retry later
    if (e?.response && e.response.status < 500) return fail(errMsg(e));

    // network error / 5xx: we do NOT know if the money went out. Keep "processing"
    // so nobody pays twice; admin must check the Razorpay X dashboard first.
    const message = "Payout response unclear. Check Razorpay X dashboard before retrying.";
    await Booking.updateOne({ _id: booking._id }, { $set: { payoutError: message } });
    return { ok: false, payoutStatus: "processing", message };
  }
}

/** Fetches the latest status of an already created payout from Razorpay. */
export async function syncPayout(bookingId) {
  await connectDB();
  const booking = await Booking.findById(bookingId);
  if (!booking || !booking.payoutId) {
    return { ok: false, message: "No payout found for this booking" };
  }
  try {
    const { data } = await axios.get(`https://api.razorpay.com/v1/payouts/${booking.payoutId}`, rzpAuth);
    return await applyPayoutState(booking._id, data);
  } catch (e) {
    return { ok: false, message: errMsg(e) };
  }
}