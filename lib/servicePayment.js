import ServiceBooking from "@/models/ServiceBooking.model";
import ServiceListing from "@/models/ServiceListing.model";
import { creditOnline } from "@/lib/serviceWallet";
import { emitJobUpdate } from "@/lib/realtime";

/**
 * Online payment ko ek hi baar "paid" karta hai (verify route aur webhook dono yahi use karte hain).
 * Atomic claim ki wajah se double credit nahi hota.
 */
export async function settleOnlinePayment(bookingId, { paymentId, method }) {
  const claimed = await ServiceBooking.findOneAndUpdate(
    { _id: bookingId, paymentStatus: { $ne: "paid" } },
    { $set: { paymentStatus: "paid", paidAt: new Date(), razorpayPaymentId: paymentId, ...(method ? { paymentMode: method } : {}) } },
    { new: true }
  );
  if (!claimed) return { already: true };
  if (claimed.status === "cancelled") return { claimed, refundNeeded: true }; // admin ko "Refund needed" dikhega
  if (claimed.status === "pending_payment") await ServiceBooking.updateOne({ _id: claimed._id }, { status: "confirmed" });
  // labour ka paisa kaam finish hone par wallet me aata hai (finishJob). Agar job pehle hi
  // complete ho chuki thi to abhi credit karo — creditOnline khud check karta hai.
  if (claimed.status === "completed") await creditOnline(claimed);
  await ServiceListing.updateOne({ _id: claimed.listing }, { $inc: { bookingCount: 1 } });
  const fresh = await ServiceBooking.findById(bookingId);
  emitJobUpdate(fresh, "job:paid");
  return { claimed: fresh };
}
