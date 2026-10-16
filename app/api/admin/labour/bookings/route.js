import { NextResponse } from "next/server";
import connectDB from "@/lib/databaseConnection";
import { isAuthenticated } from "@/lib/authentication";
import Booking from "@/models/Booking.model";
import LabourReview from "@/models/LabourReview.model";
import PartnerBank from "@/models/PartnerBank.model";
import { ACCEPT_TIMEOUT_MIN } from "@/lib/bookingHelpers";

const sum = async (match, field) => {
  const r = await Booking.aggregate([{ $match: match }, { $group: { _id: null, total: { $sum: `$${field}` } } }]);
  return r[0]?.total || 0;
};

export async function GET() {
  try {
    await connectDB();
    const session = await isAuthenticated("admin");
    if (!session.isAuth) {
      return NextResponse.json({ message: "unauthorized" }, { status: 401 });
    }

    const overdueBefore = new Date(Date.now() - ACCEPT_TIMEOUT_MIN * 60 * 1000);
    const onlineDone = { paymentMethod: "online", paymentStatus: "paid", bookingStatus: "completed" };

    const [
      bookings, statusAgg, onlineCount, cashCount, overdueCount,
      cashTotal, onlinePaid, payoutDue, payoutProcessing, payoutPaid, commission, cashCommissionDue,
    ] = await Promise.all([
      Booking.find().sort({ createdAt: -1 }).limit(500).lean(),
      Booking.aggregate([{ $group: { _id: "$bookingStatus", count: { $sum: 1 } } }]),
      Booking.countDocuments({ paymentMethod: "online" }),
      Booking.countDocuments({ paymentMethod: "cash" }),
      Booking.countDocuments({ bookingStatus: "requested", requestedAt: { $lte: overdueBefore } }),
      sum({ paymentMethod: "cash", bookingStatus: "completed" }, "fare"),
      sum({ paymentMethod: "online", paymentStatus: "paid" }, "fare"),
      sum({ ...onlineDone, payoutStatus: { $in: ["pending", "failed"] } }, "labourAmount"),
      sum({ ...onlineDone, payoutStatus: "processing" }, "labourAmount"),
      sum({ ...onlineDone, payoutStatus: "paid" }, "labourAmount"),
      sum({ bookingStatus: "completed" }, "adminCommission"),
      sum({ paymentMethod: "cash", bookingStatus: "completed", commissionSettled: { $ne: true } }, "adminCommission"),
    ]);

    const c = Object.fromEntries(statusAgg.map((s) => [s._id, s.count]));
    const n = (k) => c[k] || 0;

    const ids = bookings.map((b) => b._id);
    const labourIds = [...new Set(bookings.filter((b) => b.labour).map((b) => String(b.labour)))];
    const [reviews, banks] = await Promise.all([
      LabourReview.find({ booking: { $in: ids }, deletedAt: null }).select("booking rating review").lean(),
      PartnerBank.find({ owner: { $in: labourIds } }).select("owner accountHolder accountNumber ifsc").lean(),
    ]);
    const reviewMap = Object.fromEntries(reviews.map((r) => [String(r.booking), { rating: r.rating, review: r.review }]));
    // never send the full account number to the browser
    const bankMap = Object.fromEntries(
      banks.map((b) => [
        String(b.owner),
        { holder: b.accountHolder, last4: String(b.accountNumber || "").slice(-4), ifsc: b.ifsc },
      ])
    );

    const now = Date.now();
    const rows = bookings.map((b) => ({
      ...b,
      overdue:
        b.bookingStatus === "requested" &&
        !!b.requestedAt &&
        now - new Date(b.requestedAt).getTime() > ACCEPT_TIMEOUT_MIN * 60 * 1000,
      review: reviewMap[String(b._id)] || null,
      bank: b.labour ? bankMap[String(b.labour)] || null : null,
    }));

    const stats = {
      totalBookings: Object.values(c).reduce((a, b) => a + b, 0),
      completed: n("completed"),
      pending: n("unassigned") + n("requested") + n("rejected"),
      accepted: n("confirmed") + n("started") + n("awaiting_payment"),
      cancelled: n("cancelled") + n("expired"),
      needsAdmin: n("unassigned") + n("rejected") + overdueCount,
      prepaidCount: onlineCount,
      postpaidCount: cashCount,
      cashTotal,
      onlinePaid,
      payoutDue,
      payoutProcessing,
      payoutPaid,
      commission,
      cashCommissionDue,
    };

    return NextResponse.json({ stats, bookings: rows, timeoutMin: ACCEPT_TIMEOUT_MIN }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: `admin bookings error ${error}` }, { status: 500 });
  }
}
