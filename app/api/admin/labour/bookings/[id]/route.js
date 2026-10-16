import { NextResponse } from "next/server";
import connectDB from "@/lib/databaseConnection";
import { isAuthenticated } from "@/lib/authentication";
import Booking from "@/models/Booking.model";
import Labour from "@/models/Labour.model";
import { splitFare, rateFor } from "@/lib/bookingHelpers";
import { notifyUser, notifyAdmins } from "@/lib/bookingNotify";

// body: { action: "assign", labourId, autoAccept?, fare?, note? }
//     | { action: "cancel" }
//     | { action: "settle_commission" }   (cash job: commission received from the labour)
export async function POST(req, context) {
  try {
    const { id } = await context.params;
    await connectDB();

    const session = await isAuthenticated("admin");
    if (!session.isAuth) {
      return NextResponse.json({ message: "unauthorized" }, { status: 401 });
    }

    const { action, labourId, autoAccept, fare, note } = await req.json();

    const booking = await Booking.findById(id);
    if (!booking) {
      return NextResponse.json({ message: "Booking not found" }, { status: 404 });
    }

    // ---------- commission received (cash jobs) ----------
    if (action === "settle_commission") {
      if (booking.paymentMethod !== "cash" || booking.bookingStatus !== "completed") {
        return NextResponse.json({ message: "Only completed cash jobs have commission to collect" }, { status: 400 });
      }
      await Booking.updateOne({ _id: booking._id }, { $set: { commissionSettled: true } });
      return NextResponse.json({ success: true }, { status: 200 });
    }

    // ---------- cancel ----------
    if (action === "cancel") {
      if (["completed", "cancelled"].includes(booking.bookingStatus)) {
        return NextResponse.json({ message: "Booking is already closed" }, { status: 400 });
      }
      if (booking.paymentStatus === "paid") {
        return NextResponse.json({ message: "Online payment received. Refund it from Razorpay first." }, { status: 400 });
      }
      const oldLabour = booking.labour;
      booking.bookingStatus = "cancelled";
      booking.cancelledAt = new Date();
      booking.cancellationReason = "Cancelled by admin";
      await booking.save();

      const payload = { bookingId: String(booking._id), status: "cancelled" };
      await Promise.all([
        notifyUser(booking.user, payload),
        oldLabour ? notifyUser(oldLabour, payload) : null,
        notifyAdmins(payload),
      ]);
      return NextResponse.json({ success: true }, { status: 200 });
    }

    // ---------- assign ----------
    if (action !== "assign") {
      return NextResponse.json({ message: "Invalid action" }, { status: 400 });
    }
    if (!["unassigned", "requested", "rejected"].includes(booking.bookingStatus)) {
      return NextResponse.json({ message: "This booking cannot be assigned now" }, { status: 400 });
    }
    if (booking.paymentStatus === "paid") {
      return NextResponse.json({ message: "Already paid online, cannot change labour" }, { status: 400 });
    }

    const labour = await Labour.findOne({ _id: labourId, status: "approved", isActive: true });
    if (!labour) {
      return NextResponse.json({ message: "Labour not found or not approved" }, { status: 404 });
    }
    if (String(labour.owner) === String(booking.user)) {
      return NextResponse.json({ message: "Customer and labour cannot be the same person" }, { status: 400 });
    }
    // an electrician booking goes only to an electrician, a plumber booking only to a plumber...
    if (booking.category && booking.category !== "all" && labour.category !== booking.category) {
      return NextResponse.json(
        { message: `This booking is for ${booking.category}. Choose a ${booking.category} labour.` },
        { status: 400 }
      );
    }

    const manualFare = Math.round(Number(fare) || 0);
    const rate = rateFor(labour, booking.pricingType);
    let finalFare = 0;
    let ratePerUnit = 0;
    if (manualFare > 0) {
      finalFare = manualFare;
      ratePerUnit = Math.round(manualFare / booking.duration);
    } else if (rate) {
      ratePerUnit = rate;
      finalFare = Math.round(rate * booking.duration);
    } else {
      return NextResponse.json(
        { message: `This labour has no ${booking.pricingType} rate. Enter the fare manually.` },
        { status: 400 }
      );
    }

    const now = new Date();
    const oldLabour = booking.labour;
    booking.labour = labour.owner;
    booking.labourProfile = labour._id;
    booking.labourName = labour.fullName;
    booking.labourMobileNumber = labour.phone;
    if (booking.category === "all") booking.category = labour.category;
    booking.ratePerUnit = ratePerUnit;
    booking.fare = finalFare;
    const split = splitFare(finalFare);
    booking.adminCommission = split.adminCommission;
    booking.labourAmount = split.labourAmount;
    booking.assignedByAdmin = true;
    booking.adminNote = String(note || "").slice(0, 200);
    booking.requestedAt = now;
    booking.rejectedAt = undefined;
    booking.rejectReason = "";
    booking.bookingStatus = autoAccept ? "confirmed" : "requested";
    booking.acceptedAt = autoAccept ? now : undefined;
    await booking.save();

    const payload = { bookingId: String(booking._id), status: booking.bookingStatus };
    await Promise.all([
      notifyUser(labour.owner, payload),
      notifyUser(booking.user, payload),
      oldLabour && String(oldLabour) !== String(labour.owner) ? notifyUser(oldLabour, payload) : null,
      notifyAdmins(payload),
    ]);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: `admin booking action error ${error}` }, { status: 500 });
  }
}
